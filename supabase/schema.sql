-- =====================================================================
--  Swar Sagar — database schema
--  Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
--  Security model: every table has Row Level Security (RLS) turned on.
--  With RLS on, a row is invisible/unchangeable unless a POLICY allows it.
--  Policies run inside Postgres, so they protect the data even if someone
--  calls the API directly instead of going through our React app.
--  auth.uid() = the id of the signed-in user making the request.
-- =====================================================================


-- ---------------------------------------------------------------------
--  1. PROFILES — one row per user, created automatically at sign-up
-- ---------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null default '' check (char_length(display_name) <= 80),
  role          text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  created_at    timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- When Supabase Auth creates a user, copy them into profiles.
-- "security definer" = runs with the function owner's rights, so it can
-- insert even though normal users have no INSERT policy on profiles.
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Signed-in users can see names (needed for class rosters).
create policy "profiles: signed-in users can read"
  on public.profiles for select to authenticated using (true);

-- Users may edit their own row…
create policy "profiles: users update their own"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- …but only the display_name column. Without this, a user could set their
-- own role to 'admin'. Roles are changed by an admin in the SQL editor.
revoke update on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;


-- Helper: is the current user a moderator (or admin)?
create function public.is_moderator()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin')
  );
$$;


-- ---------------------------------------------------------------------
--  2. COMPOSITIONS — public to read, moderators to write
-- ---------------------------------------------------------------------
create table public.compositions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 200),
  raga_id     text not null,            -- matches ids in src/data/ragas.js
  taal_id     text not null,            -- matches ids in src/data/taals.js
  laya        text check (laya in ('vilambit', 'madhya', 'drut')),
  composer    text not null default '',
  sthayi      text not null default '',
  antara      text not null default '',
  notes       text not null default '',
  created_by  uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.compositions enable row level security;

create policy "compositions: anyone can read"
  on public.compositions for select to anon, authenticated using (true);
create policy "compositions: moderators insert"
  on public.compositions for insert to authenticated with check (public.is_moderator());
create policy "compositions: moderators update"
  on public.compositions for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());
create policy "compositions: moderators delete"
  on public.compositions for delete to authenticated using (public.is_moderator());

create function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger compositions_touch
  before update on public.compositions
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------
--  3. CLASSROOM
--     classes → class_members (students) → assignments → submissions
--     Anyone signed in can create a class and becomes its teacher.
-- ---------------------------------------------------------------------
create table public.classes (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 120),
  description  text not null default '',
  teacher_id   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  join_code    text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_at   timestamptz not null default now()
);

create table public.class_members (
  class_id    uuid not null references public.classes (id) on delete cascade,
  student_id  uuid not null references public.profiles (id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table public.assignments (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.classes (id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 200),
  instructions  text not null default '',
  raga_id       text,
  taal_id       text,
  due_at        timestamptz,
  created_at    timestamptz not null default now()
);

create table public.submissions (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references public.assignments (id) on delete cascade,
  student_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  audio_path     text not null,          -- path inside the "submissions" storage bucket
  note           text not null default '',
  submitted_at   timestamptz not null default now(),
  feedback       text,
  reviewed_at    timestamptz,
  unique (assignment_id, student_id)     -- one submission per student; re-submitting replaces it
);

alter table public.classes       enable row level security;
alter table public.class_members enable row level security;
alter table public.assignments   enable row level security;
alter table public.submissions   enable row level security;

-- Helpers. These are security definer so policies can call them without
-- triggering each other's policies in an endless loop (classes ↔ members).
create function public.is_class_teacher(cid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.classes where id = cid and teacher_id = auth.uid());
$$;

create function public.is_class_member(cid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.class_members where class_id = cid and student_id = auth.uid());
$$;

create function public.class_of_assignment(aid uuid)
returns uuid language sql stable security definer set search_path = '' as $$
  select class_id from public.assignments where id = aid;
$$;

-- classes
create policy "classes: teacher and students can read"
  on public.classes for select to authenticated
  using (teacher_id = auth.uid() or public.is_class_member(id));
create policy "classes: anyone signed in can create (as teacher)"
  on public.classes for insert to authenticated with check (teacher_id = auth.uid());
create policy "classes: teacher updates"
  on public.classes for update to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "classes: teacher deletes"
  on public.classes for delete to authenticated using (teacher_id = auth.uid());

-- class_members (joining happens through join_class() below, not direct inserts)
create policy "members: student sees own, teacher sees roster"
  on public.class_members for select to authenticated
  using (student_id = auth.uid() or public.is_class_teacher(class_id));
create policy "members: student leaves or teacher removes"
  on public.class_members for delete to authenticated
  using (student_id = auth.uid() or public.is_class_teacher(class_id));

-- Students can't see a class before joining, so they can't look up its
-- join code themselves. This function does the lookup with elevated rights
-- and only ever adds the *caller* to the class.
create function public.join_class(code text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  cid uuid;
  tid uuid;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  select id, teacher_id into cid, tid from public.classes where join_code = upper(trim(code));
  if cid is null then
    raise exception 'No class with that code';
  end if;
  if tid = auth.uid() then
    raise exception 'You are the teacher of this class';
  end if;
  insert into public.class_members (class_id, student_id)
  values (cid, auth.uid())
  on conflict do nothing;
  return cid;
end $$;

-- assignments
create policy "assignments: class can read"
  on public.assignments for select to authenticated
  using (public.is_class_teacher(class_id) or public.is_class_member(class_id));
create policy "assignments: teacher inserts"
  on public.assignments for insert to authenticated with check (public.is_class_teacher(class_id));
create policy "assignments: teacher updates"
  on public.assignments for update to authenticated
  using (public.is_class_teacher(class_id)) with check (public.is_class_teacher(class_id));
create policy "assignments: teacher deletes"
  on public.assignments for delete to authenticated using (public.is_class_teacher(class_id));

-- submissions
create policy "submissions: student sees own, teacher sees class"
  on public.submissions for select to authenticated
  using (student_id = auth.uid()
         or public.is_class_teacher(public.class_of_assignment(assignment_id)));
create policy "submissions: students submit to their classes"
  on public.submissions for insert to authenticated
  with check (student_id = auth.uid()
              and public.is_class_member(public.class_of_assignment(assignment_id)));
create policy "submissions: student re-submits, teacher gives feedback"
  on public.submissions for update to authenticated
  using (student_id = auth.uid()
         or public.is_class_teacher(public.class_of_assignment(assignment_id)));
create policy "submissions: student deletes own"
  on public.submissions for delete to authenticated using (student_id = auth.uid());

-- One UPDATE policy covers two very different people, so this trigger
-- decides which columns each one may change:
--   student → only the recording and note (and old feedback is cleared)
--   teacher → only feedback
create function public.guard_submission_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.assignment_id <> old.assignment_id or new.student_id <> old.student_id then
    raise exception 'Cannot move a submission';
  end if;

  if auth.uid() = old.student_id then
    new.feedback := null;
    new.reviewed_at := null;
    new.submitted_at := now();
  else
    if new.audio_path <> old.audio_path or new.note <> old.note then
      raise exception 'Teachers can only change feedback';
    end if;
    new.reviewed_at := now();
  end if;
  return new;
end $$;

create trigger submissions_guard
  before update on public.submissions
  for each row execute function public.guard_submission_update();


-- ---------------------------------------------------------------------
--  4. AUDIO STORAGE
--     Private bucket. Files live at:
--       <class_id>/<assignment_id>/<student_id>/<file>
--     storage.foldername(name) splits that path into its folder parts.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

create function public.can_upload_submission(path text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare
  parts text[] := storage.foldername(path);
begin
  return array_length(parts, 1) = 3
     and parts[3] = auth.uid()::text
     and public.is_class_member(parts[1]::uuid)
     and exists (
       select 1 from public.assignments
       where id = parts[2]::uuid and class_id = parts[1]::uuid
     );
exception when invalid_text_representation then
  return false;  -- a folder name that isn't a valid uuid
end $$;

create function public.can_read_submission_file(path text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare
  parts text[] := storage.foldername(path);
begin
  return parts[3] = auth.uid()::text
      or public.is_class_teacher(parts[1]::uuid);
exception when invalid_text_representation then
  return false;
end $$;

create policy "audio: students upload to their own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and public.can_upload_submission(name));
create policy "audio: student and teacher can listen"
  on storage.objects for select to authenticated
  using (bucket_id = 'submissions' and public.can_read_submission_file(name));
create policy "audio: students replace their own"
  on storage.objects for update to authenticated
  using (bucket_id = 'submissions' and (storage.foldername(name))[3] = auth.uid()::text);
create policy "audio: students delete their own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'submissions' and (storage.foldername(name))[3] = auth.uid()::text);


-- ---------------------------------------------------------------------
--  5. TABLE & FUNCTION PERMISSIONS
--     Newer Supabase projects don't automatically let the website's roles
--     touch tables made in the SQL editor. These GRANTs open the door;
--     the RLS policies above still decide which ROWS each person gets.
--       anon          = visitors who aren't signed in
--       authenticated = signed-in users
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.compositions to anon, authenticated;
grant insert, update, delete on public.compositions to authenticated;

grant select on public.profiles to authenticated;
-- (profiles UPDATE is limited to display_name — granted in section 1)

grant select, insert, update, delete on public.classes       to authenticated;
grant select,         delete         on public.class_members to authenticated;
grant select, insert, update, delete on public.assignments   to authenticated;
grant select, insert, update, delete on public.submissions   to authenticated;

grant execute on function
  public.is_moderator(),
  public.is_class_teacher(uuid),
  public.is_class_member(uuid),
  public.class_of_assignment(uuid),
  public.can_upload_submission(text),
  public.can_read_submission_file(text)
to anon, authenticated;
grant execute on function public.join_class(text) to authenticated;


-- =====================================================================
--  Making someone a moderator (run in the SQL editor, with their email):
--
--    update public.profiles set role = 'moderator'
--    where id = (select id from auth.users where email = 'someone@example.com');
-- =====================================================================

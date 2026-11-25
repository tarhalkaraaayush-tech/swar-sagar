-- Run this ONCE if you set up the database before this file existed
-- (i.e. you already ran schema.sql). New setups get it from schema.sql.
-- Safe to run more than once.

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


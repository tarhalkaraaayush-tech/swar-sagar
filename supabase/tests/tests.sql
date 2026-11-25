\set ON_ERROR_STOP 1
-- helpers (run as superuser, used by everyone)
create function public.t_expect_error(q text, label text) returns void language plpgsql as $$
begin
  begin execute q; exception when others then raise notice 'PASS (blocked) %: %', label, sqlerrm; return; end;
  raise exception 'FAIL: % should have been blocked', label;
end $$;
create function public.t_expect(q text, expected bigint, label text) returns void language plpgsql as $$
declare n bigint; begin execute q into n;
  if n is distinct from expected then raise exception 'FAIL: % got % expected %', label, n, expected; end if;
  raise notice 'PASS %', label; end $$;
grant execute on function public.t_expect_error, public.t_expect to anon, authenticated;

insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000a','teacher@x.com','{"display_name":"Guruji"}'),
 ('00000000-0000-0000-0000-00000000000b','s1@x.com','{}'),
 ('00000000-0000-0000-0000-00000000000c','s2@x.com','{}'),
 ('00000000-0000-0000-0000-00000000000d','mod@x.com','{}');
update public.profiles set role='moderator' where id='00000000-0000-0000-0000-00000000000d';
select t_expect($$select count(*) from profiles where display_name in ('Guruji','s1','s2','mod')$$, 4, 'profiles auto-created with names');

-- ===== as student 1 =====
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select t_expect_error($$update profiles set role='admin' where id=auth.uid()$$, 'student cannot promote self');
update profiles set display_name='Aayush' where id=auth.uid();
select t_expect($$select count(*) from profiles where display_name='Aayush'$$, 1, 'student can rename self');
select t_expect_error($$insert into compositions (title, raga_id, taal_id) values ('x','yaman','teentaal')$$, 'student cannot add composition');

-- ===== as moderator =====
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000d';
insert into compositions (title, raga_id, taal_id) values ('Eri aali piya bina','yaman','teentaal');
update compositions set composer='Traditional';
select t_expect($$select count(*) from compositions where composer='Traditional'$$, 1, 'moderator adds + edits composition');

-- ===== student can't edit/delete compositions =====
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select t_expect($$with u as (update compositions set title='hacked' returning 1) select count(*) from u$$, 0, 'student edit changes nothing');
select t_expect($$with d as (delete from compositions returning 1) select count(*) from d$$, 0, 'student delete changes nothing');

-- ===== anon reads compositions =====
reset role; set role anon; set request.jwt.claim.sub = '';
select t_expect($$select count(*) from compositions$$, 1, 'anonymous visitors can read compositions');
select t_expect($$select count(*) from profiles$$, 0, 'anonymous visitors cannot read profiles');

-- ===== teacher creates class + assignment =====
reset role; set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into classes (name) values ('Saturday vocal batch');
insert into assignments (class_id, title, raga_id) select id, 'Sing Yaman aalap', 'yaman' from classes;
select t_expect_error($$insert into classes (name, teacher_id) values ('fake','00000000-0000-0000-0000-00000000000b')$$, 'cannot create class as someone else');
reset role; select join_code as code, id as cid from classes \gset
select id as aid from assignments \gset
set role authenticated;

-- ===== student 1 joins =====
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select t_expect($$select count(*) from classes$$, 0, 'student cannot see class before joining');
select t_expect_error(format($$insert into class_members (class_id, student_id) values ('%s', auth.uid())$$, :'cid'), 'no direct insert into members');
select join_class(lower(:'code'));
select t_expect($$select count(*) from classes$$, 1, 'student sees class after join (code case-insensitive)');
select t_expect($$select count(*) from assignments$$, 1, 'student sees assignment');
select t_expect_error(format($$insert into assignments (class_id, title) values ('%s', 'x')$$, :'cid'), 'student cannot create assignment');
select t_expect_error($$select join_class('ZZZZZZ')$$, 'bad join code rejected');

-- storage
insert into storage.objects (bucket_id, name) values ('submissions', :'cid' || '/' || :'aid' || '/00000000-0000-0000-0000-00000000000b/take1.webm');
select t_expect_error(format($$insert into storage.objects (bucket_id, name) values ('submissions', '%s/%s/00000000-0000-0000-0000-00000000000c/x.webm')$$, :'cid', :'aid'), 'student cannot upload into another student folder');
select t_expect_error($$insert into storage.objects (bucket_id, name) values ('submissions', 'not-a-uuid/x/00000000-0000-0000-0000-00000000000b/x.webm')$$, 'malformed path rejected');

-- submission
insert into submissions (assignment_id, audio_path) values (:'aid', :'cid' || '/' || :'aid' || '/00000000-0000-0000-0000-00000000000b/take1.webm');
select t_expect($$select count(*) from submissions$$, 1, 'student submitted');

-- ===== student 2 (not in class) =====
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
select t_expect($$select count(*) from classes$$, 0, 'outsider sees no class');
select t_expect($$select count(*) from assignments$$, 0, 'outsider sees no assignments');
select t_expect($$select count(*) from submissions$$, 0, 'outsider sees no submissions');
select t_expect($$select count(*) from storage.objects$$, 0, 'outsider cannot list audio');
select t_expect_error(format($$insert into submissions (assignment_id, audio_path) values ('%s','x')$$, :'aid'), 'outsider cannot submit');
select t_expect_error(format($$insert into storage.objects (bucket_id, name) values ('submissions', '%s/%s/00000000-0000-0000-0000-00000000000c/x.webm')$$, :'cid', :'aid'), 'outsider cannot upload');

-- ===== teacher reviews =====
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select t_expect($$select count(*) from storage.objects$$, 1, 'teacher can access student audio');
select t_expect($$select count(*) from class_members$$, 1, 'teacher sees roster');
update submissions set feedback = 'Good, work on the meend to Ga';
select t_expect($$select count(*) from submissions where reviewed_at is not null$$, 1, 'teacher gives feedback');
select t_expect_error($$update submissions set audio_path = 'other'$$, 'teacher cannot replace recording');

-- ===== student re-submits =====
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
update submissions set note = 'Second take', feedback = 'I gave myself an A';
select t_expect($$select count(*) from submissions where feedback is null and note = 'Second take'$$, 1, 're-submit clears feedback; student cannot write feedback');
select t_expect($$select count(*) from profiles$$, 4, 'signed-in users see names');
reset role;
select 'ALL TESTS PASSED' as result;

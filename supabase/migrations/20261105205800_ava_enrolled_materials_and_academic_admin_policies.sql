create policy "ava enrolled private materials readable" on public.ava_materials for select to authenticated
using (is_public=true or exists (
 select 1 from public.ava_enrollments e
 where e.user_id=(select auth.uid()) and e.status in ('active','completed')
 and (e.course_id=ava_materials.course_id or exists(
  select 1 from public.ava_lessons l join public.ava_modules m on m.id=l.module_id
  where l.id=ava_materials.lesson_id and m.course_id=e.course_id
 ))
));
create policy "ava admins manage certificates" on public.ava_certificates for all to authenticated
using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava admins manage attendance" on public.ava_attendance for all to authenticated
using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava admins manage live classes" on public.ava_live_classes for all to authenticated
using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava admins manage recordings" on public.ava_recordings for all to authenticated
using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));

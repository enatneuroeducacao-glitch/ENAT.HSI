-- ENAT AVA: course-scoped access, invitations and payment ledger.
alter table public.ava_courses
  add column if not exists enat_course_id uuid unique references public.enat_courses(id) on delete set null,
  add column if not exists price_cents bigint,
  add column if not exists payment_required boolean not null default false,
  add column if not exists currency text not null default 'BRL',
  add column if not exists enrollment_mode text not null default 'invite_only',
  add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.ava_profiles add column if not exists email text;
alter table public.ava_modules add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.ava_lessons add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.ava_enrollments add column if not exists access_source text not null default 'admin',
  add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.ava_courses add constraint ava_courses_enrollment_mode_check check (enrollment_mode in ('invite_only','manual_approval','open'));
alter table public.ava_courses add constraint ava_courses_price_cents_check check (price_cents is null or price_cents >= 0);

create table public.ava_enrollment_invites (
 id uuid primary key default gen_random_uuid(),
 course_id uuid not null references public.ava_courses(id) on delete cascade,
 email text not null,
 token_hash text not null unique,
 status text not null default 'pending' check (status in ('pending','redeemed','revoked','expired')),
 created_by uuid references auth.users(id) on delete set null,
 expires_at timestamptz not null default (now()+interval '7 days'),
 redeemed_by uuid references auth.users(id) on delete set null,
 redeemed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index ava_enrollment_invites_email_idx on public.ava_enrollment_invites(lower(email),status);
create index ava_enrollment_invites_course_idx on public.ava_enrollment_invites(course_id,status);

create table public.ava_payments (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 course_id uuid not null references public.ava_courses(id) on delete restrict,
 enrollment_id uuid references public.ava_enrollments(id) on delete set null,
 provider text not null default 'mercado_pago',
 payment_method text not null check (payment_method in ('pix','credit_card','boleto','manual')),
 status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled','refunded','expired','under_review')),
 amount_cents bigint not null check (amount_cents>=0),
 currency text not null default 'BRL',
 external_reference text unique,
 provider_payment_id text,
 checkout_url text,
 metadata jsonb not null default '{}'::jsonb,
 paid_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index ava_payments_user_idx on public.ava_payments(user_id,created_at desc);
create index ava_payments_course_idx on public.ava_payments(course_id,status);

alter table public.ava_enrollment_invites enable row level security;
alter table public.ava_payments enable row level security;

drop policy if exists "ava own profile insert" on public.ava_profiles;
drop policy if exists "ava own profile update" on public.ava_profiles;
create policy "ava student profile insert" on public.ava_profiles for insert to authenticated
 with check (id=(select auth.uid()) and role='student');
create policy "ava student profile update" on public.ava_profiles for update to authenticated
 using (id=(select auth.uid()) and role='student') with check (id=(select auth.uid()) and role='student');
create policy "ava admins manage profiles" on public.ava_profiles for all to authenticated
 using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
 with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));

drop policy if exists "ava published modules are readable" on public.ava_modules;
create policy "ava enrolled modules readable" on public.ava_modules for select to authenticated
 using (exists(select 1 from public.ava_enrollments e where e.course_id=ava_modules.course_id and e.user_id=(select auth.uid()) and e.status in ('active','completed')));
drop policy if exists "ava published lessons are readable" on public.ava_lessons;
create policy "ava enrolled published lessons readable" on public.ava_lessons for select to authenticated
 using (status='published' and exists(select 1 from public.ava_modules m join public.ava_enrollments e on e.course_id=m.course_id where m.id=ava_lessons.module_id and e.user_id=(select auth.uid()) and e.status in ('active','completed')));

create policy "ava admins manage courses" on public.ava_courses for all to authenticated
 using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
 with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava admins manage modules" on public.ava_modules for all to authenticated
 using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
 with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava admins manage lessons" on public.ava_lessons for all to authenticated
 using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
 with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava admins manage enrollments" on public.ava_enrollments for all to authenticated
 using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
 with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava admins manage invites" on public.ava_enrollment_invites for all to authenticated
 using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
 with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava own payments readable" on public.ava_payments for select to authenticated using (user_id=(select auth.uid()));
create policy "ava admins manage payments" on public.ava_payments for all to authenticated
 using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
 with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava admins manage assessments" on public.ava_assessments for all to authenticated
 using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
 with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava admins manage questions" on public.ava_questions for all to authenticated
 using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
 with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));
create policy "ava admins manage materials" on public.ava_materials for all to authenticated
 using (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'))
 with check (exists(select 1 from public.admin_profiles a where a.id=(select auth.uid()) and a.active=true and a.role='admin'));

do $$
declare c record; v_course_id uuid; v_module_id uuid; m record; l record;
begin
 for c in select * from public.enat_courses where active=true and published=true and code in ('ENAT-CURSO-001','ENAT-CURSO-002') loop
  insert into public.ava_courses(title,slug,description,workload_hours,status,enat_course_id,payment_required,enrollment_mode,metadata)
  values(c.name,coalesce(nullif(c.slug,''),lower(c.code)),c.summary,c.hours,'published',c.id,false,'invite_only',
   jsonb_build_object('enat_code',c.code,'modality',c.modality,'nature',c.nature,'responsible',c.responsible,'author',c.author))
  on conflict(enat_course_id) do update set title=excluded.title,description=excluded.description,workload_hours=excluded.workload_hours,status='published',metadata=excluded.metadata,updated_at=now()
  returning id into v_course_id;
  for m in select value,ordinality from jsonb_array_elements(coalesce(c.modules,'[]'::jsonb)) with ordinality loop
   insert into public.ava_modules(course_id,title,description,sort_order,metadata)
   values(v_course_id,coalesce(m.value->>'title','Módulo '||m.ordinality::text),nullif(m.value->>'description',''),m.ordinality,jsonb_build_object('source','enat_courses','source_code',c.code))
   on conflict(course_id,sort_order) do update set title=excluded.title,description=excluded.description,metadata=excluded.metadata returning id into v_module_id;
   for l in select value,ordinality from jsonb_array_elements(coalesce(m.value->'lessons','[]'::jsonb)) with ordinality loop
    insert into public.ava_lessons(module_id,title,slug,lesson_type,content,duration_minutes,status,sort_order,metadata)
    values(v_module_id,coalesce(l.value->>'name','Aula '||l.ordinality::text),'aula-'||l.ordinality::text,'content','',greatest(1,coalesce((nullif(l.value->>'hours',''))::numeric,1)*60)::integer,'draft',l.ordinality,jsonb_build_object('source','enat_courses','teacher_id',l.value->>'teacherId','source_course_code',c.code))
    on conflict(module_id,sort_order) do update set title=excluded.title,duration_minutes=excluded.duration_minutes,metadata=excluded.metadata,updated_at=now();
   end loop;
  end loop;
 end loop;
end $$;

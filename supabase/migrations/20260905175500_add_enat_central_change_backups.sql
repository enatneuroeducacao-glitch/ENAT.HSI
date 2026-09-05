create table if not exists public.enat_central_backups (
  id uuid primary key default gen_random_uuid(),
  reason text not null default 'automatic',
  created_by uuid null,
  created_at timestamptz not null default now(),
  snapshot jsonb not null
);
create index if not exists enat_central_backups_created_at_idx on public.enat_central_backups(created_at desc);
create table if not exists public.enat_central_change_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  operation text not null check (operation in ('INSERT','UPDATE','DELETE')),
  row_id uuid null,
  old_row jsonb,
  new_row jsonb,
  changed_at timestamptz not null default now(),
  changed_by uuid null
);
create index if not exists enat_central_change_log_changed_at_idx on public.enat_central_change_log(changed_at desc);
create index if not exists enat_central_change_log_table_row_idx on public.enat_central_change_log(table_name,row_id,changed_at desc);
create or replace function public.enat_log_central_change() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.enat_central_change_log(table_name,operation,row_id,old_row,new_row,changed_by)
  values (tg_table_name,tg_op,coalesce((to_jsonb(old)->>'id')::uuid,(to_jsonb(new)->>'id')::uuid),case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,auth.uid());
  return case when tg_op='DELETE' then old else new end;
end;
$$;
drop trigger if exists enat_central_change_log_courses on public.enat_courses;
create trigger enat_central_change_log_courses after insert or update or delete on public.enat_courses for each row execute function public.enat_log_central_change();
drop trigger if exists enat_central_change_log_instructors on public.enat_instructors;
create trigger enat_central_change_log_instructors after insert or update or delete on public.enat_instructors for each row execute function public.enat_log_central_change();
drop trigger if exists enat_central_change_log_students on public.enat_students;
create trigger enat_central_change_log_students after insert or update or delete on public.enat_students for each row execute function public.enat_log_central_change();
drop trigger if exists enat_central_change_log_certificates on public.enat_certificates;
create trigger enat_central_change_log_certificates after insert or update or delete on public.enat_certificates for each row execute function public.enat_log_central_change();
drop trigger if exists enat_central_change_log_admin_profiles on public.admin_profiles;
create trigger enat_central_change_log_admin_profiles after insert or update or delete on public.admin_profiles for each row execute function public.enat_log_central_change();
drop trigger if exists enat_central_change_log_admin_grants on public.admin_access_grants;
create trigger enat_central_change_log_admin_grants after insert or update or delete on public.admin_access_grants for each row execute function public.enat_log_central_change();
alter table public.enat_central_backups enable row level security;
alter table public.enat_central_change_log enable row level security;
revoke all on public.enat_central_backups from anon, authenticated;
revoke all on public.enat_central_change_log from anon, authenticated;

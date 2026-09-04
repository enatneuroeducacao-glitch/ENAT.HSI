create table if not exists public.enat_admin_users (id uuid primary key default gen_random_uuid(), auth_user_id uuid not null unique references auth.users(id) on delete cascade, username text not null unique, display_name text not null, role text not null default 'admin' check (role in ('admin','operador')), active boolean not null default true, bootstrap_complete boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

alter table public.enat_admin_users add column if not exists bootstrap_complete boolean not null default false;
create index if not exists enat_admin_users_active_idx on public.enat_admin_users(active);
alter table public.enat_admin_users enable row level security;
revoke all on public.enat_admin_users from anon, authenticated;

create or replace function public.enat_admin_users_touch() returns trigger language plpgsql security definer set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_enat_admin_users_touch on public.enat_admin_users;
create trigger trg_enat_admin_users_touch before update on public.enat_admin_users for each row execute function public.enat_admin_users_touch();

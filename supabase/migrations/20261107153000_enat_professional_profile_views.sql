create table if not exists public.enat_professional_profile_views (
  profile_id uuid primary key references public.enat_public_inbox(id) on delete cascade,
  view_count bigint not null default 0 check (view_count >= 0),
  first_viewed_at timestamptz not null default now(),
  last_viewed_at timestamptz not null default now()
);

alter table public.enat_professional_profile_views enable row level security;
revoke all on public.enat_professional_profile_views from anon, authenticated;
grant all on public.enat_professional_profile_views to service_role;

create or replace function public.increment_enat_professional_profile_view(p_profile_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count bigint;
begin
  insert into public.enat_professional_profile_views (profile_id, view_count)
  select p.id, 1
  from public.enat_public_inbox p
  where p.id = p_profile_id
    and p.kind = 'interest'
    and p.public_profile_opt_in = true
  on conflict (profile_id) do update
    set view_count = public.enat_professional_profile_views.view_count + 1,
        last_viewed_at = now()
  returning view_count into v_count;

  if v_count is null then
    raise exception 'Perfil não encontrado ou não autorizado para divulgação.';
  end if;

  return v_count;
end;
$$;

revoke all on function public.increment_enat_professional_profile_view(uuid) from public, anon, authenticated;
grant execute on function public.increment_enat_professional_profile_view(uuid) to service_role;

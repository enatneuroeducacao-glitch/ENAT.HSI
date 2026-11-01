-- Empresa Segura CMS: shared content for company and employee portals.
create table if not exists public.empresa_segura_pages (
  page_type text primary key check (page_type in ('empresa', 'funcionario')),
  content jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  updated_by uuid null,
  updated_at timestamptz not null default now()
);

alter table public.empresa_segura_pages enable row level security;

drop policy if exists "Public can read published Empresa Segura pages" on public.empresa_segura_pages;
create policy "Public can read published Empresa Segura pages"
  on public.empresa_segura_pages for select
  using (published = true);

drop policy if exists "Admins can read all Empresa Segura pages" on public.empresa_segura_pages;
create policy "Admins can read all Empresa Segura pages"
  on public.empresa_segura_pages for select to authenticated
  using (
    exists (
      select 1 from public.admin_profiles ap
      where ap.id = auth.uid() and ap.role = 'admin' and ap.active = true
    )
  );

drop policy if exists "Admins can insert Empresa Segura pages" on public.empresa_segura_pages;
create policy "Admins can insert Empresa Segura pages"
  on public.empresa_segura_pages for insert to authenticated
  with check (
    exists (
      select 1 from public.admin_profiles ap
      where ap.id = auth.uid() and ap.role = 'admin' and ap.active = true
    )
  );

drop policy if exists "Admins can update Empresa Segura pages" on public.empresa_segura_pages;
create policy "Admins can update Empresa Segura pages"
  on public.empresa_segura_pages for update to authenticated
  using (
    exists (
      select 1 from public.admin_profiles ap
      where ap.id = auth.uid() and ap.role = 'admin' and ap.active = true
    )
  )
  with check (
    exists (
      select 1 from public.admin_profiles ap
      where ap.id = auth.uid() and ap.role = 'admin' and ap.active = true
    )
  );

grant select on public.empresa_segura_pages to anon, authenticated;
grant insert, update on public.empresa_segura_pages to authenticated;

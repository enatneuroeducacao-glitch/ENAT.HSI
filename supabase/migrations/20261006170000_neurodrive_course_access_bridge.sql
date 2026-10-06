create table if not exists public.neurodrive_course_access_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  session_hash text unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.enat_courses(id) on delete cascade,
  course_code text not null,
  source text not null default 'cmnt',
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  session_expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_neurodrive_course_access_user
  on public.neurodrive_course_access_tokens(user_id, course_id);

create index if not exists idx_neurodrive_course_access_expiry
  on public.neurodrive_course_access_tokens(expires_at);

alter table public.neurodrive_course_access_tokens enable row level security;

revoke all on table public.neurodrive_course_access_tokens from anon, authenticated;
grant all on table public.neurodrive_course_access_tokens to service_role;

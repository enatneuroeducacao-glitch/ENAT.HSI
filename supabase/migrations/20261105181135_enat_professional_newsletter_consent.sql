alter table public.enat_public_inbox
  add column if not exists newsletter_opt_in boolean not null default false,
  add column if not exists newsletter_consent_at timestamptz,
  add column if not exists newsletter_opted_out_at timestamptz,
  add column if not exists newsletter_opted_out_by uuid references auth.users(id) on delete set null,
  add column if not exists newsletter_opt_out_reason text;

create index if not exists enat_public_inbox_professional_registry_idx
  on public.enat_public_inbox (created_at desc)
  where kind = 'interest' and nullif(trim(profession), '') is not null;

create index if not exists enat_public_inbox_newsletter_opt_in_idx
  on public.enat_public_inbox (newsletter_opt_in, created_at desc)
  where kind = 'interest' and nullif(trim(profession), '') is not null;

comment on column public.enat_public_inbox.newsletter_opt_in is
  'Consentimento opcional e explícito para receber notícias e comunicações do ENAT.';
comment on column public.enat_public_inbox.newsletter_consent_at is
  'Data/hora em que o titular autorizou receber notícias do ENAT.';
comment on column public.enat_public_inbox.newsletter_opted_out_at is
  'Data/hora do descadastramento de comunicações do ENAT.';
comment on column public.enat_public_inbox.newsletter_opt_out_reason is
  'Motivo ou observação administrativa do descadastramento.';

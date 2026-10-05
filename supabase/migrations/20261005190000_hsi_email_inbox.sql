create table if not exists public.enat_mailboxes (
  id uuid primary key default gen_random_uuid(),
  address text not null unique,
  display_name text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.enat_mail_messages (
  id uuid primary key default gen_random_uuid(),
  provider_email_id text,
  provider_event_id text unique,
  message_id text,
  direction text not null check (direction in ('inbound','outbound')),
  mailbox_id uuid references public.enat_mailboxes(id) on delete set null,
  from_address text,
  from_name text,
  to_addresses jsonb not null default '[]'::jsonb,
  cc_addresses jsonb not null default '[]'::jsonb,
  bcc_addresses jsonb not null default '[]'::jsonb,
  reply_to text,
  subject text,
  text_body text,
  html_body text,
  folder text not null default 'inbox' check (folder in ('inbox','sent','archive','trash')),
  read_at timestamptz,
  sent_at timestamptz,
  in_reply_to text,
  references_header text,
  attachments jsonb not null default '[]'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists enat_mail_messages_created_idx on public.enat_mail_messages(created_at desc);
create index if not exists enat_mail_messages_mailbox_idx on public.enat_mail_messages(mailbox_id, created_at desc);
create index if not exists enat_mail_messages_folder_idx on public.enat_mail_messages(folder, created_at desc);
create index if not exists enat_mail_messages_provider_idx on public.enat_mail_messages(provider_email_id);
alter table public.enat_mailboxes enable row level security;
alter table public.enat_mail_messages enable row level security;
revoke all on public.enat_mailboxes from anon, authenticated;
revoke all on public.enat_mail_messages from anon, authenticated;
insert into public.enat_mailboxes(address,display_name,sort_order) values
('contato@hsi-doth-pg.com.br','Contato HSI-DOTH-PG',10),
('enat@hsi-doth-pg.com.br','ENAT',20),
('suporte@hsi-doth-pg.com.br','Suporte',30),
('neurodrive@hsi-doth-pg.com.br','NeuroDrive',40),
('pesquisa@hsi-doth-pg.com.br','Pesquisa',50),
('publicacoes@hsi-doth-pg.com.br','Publicações',60),
('administrativo@hsi-doth-pg.com.br','Administrativo',70),
('parcerias@hsi-doth-pg.com.br','Parcerias',80),
('projetos@hsi-doth-pg.com.br','Projetos',90),
('formacao@hsi-doth-pg.com.br','Formação',100)
on conflict(address) do nothing;
create or replace function public.enat_mail_messages_touch() returns trigger language plpgsql security definer set search_path=public as $$
begin new.updated_at=now(); return new; end;
$$;
drop trigger if exists trg_enat_mail_messages_touch on public.enat_mail_messages;
create trigger trg_enat_mail_messages_touch before update on public.enat_mail_messages for each row execute function public.enat_mail_messages_touch();
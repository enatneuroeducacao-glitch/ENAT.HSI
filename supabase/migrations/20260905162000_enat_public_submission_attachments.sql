alter table public.enat_public_inbox
  add column if not exists attachments jsonb not null default '[]'::jsonb;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'enat-public-submissions',
  'enat-public-submissions',
  false,
  15728640,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'text/plain',
    'application/rtf',
    'text/markdown',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update set
  public=false,
  file_size_limit=15728640,
  allowed_mime_types=excluded.allowed_mime_types;

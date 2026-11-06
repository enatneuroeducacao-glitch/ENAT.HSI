alter table public.enat_public_inbox
  drop constraint if exists enat_public_inbox_kind_check;

alter table public.enat_public_inbox
  add constraint enat_public_inbox_kind_check
  check (kind = any (array[
    'interest'::text,
    'article_submission'::text,
    'news_submission'::text,
    'contact'::text,
    'tv_submission'::text,
    'professional_contact'::text,
    'professional_profile_update'::text
  ]));

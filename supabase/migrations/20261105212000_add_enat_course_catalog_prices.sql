-- Public ENAT course catalog pricing
-- Applied to Supabase project gicjsuagmiyoqvttbqjw on 2026-11-05.
alter table public.enat_courses
  add column if not exists price_cents bigint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enat_courses_price_cents_nonnegative'
      and conrelid = 'public.enat_courses'::regclass
  ) then
    alter table public.enat_courses
      add constraint enat_courses_price_cents_nonnegative
      check (price_cents is null or price_cents >= 0);
  end if;
end
$$;

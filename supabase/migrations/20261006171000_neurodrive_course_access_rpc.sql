create or replace function public.neurodrive_issue_course_access(p_course_code text default 'ENAT-CURSO-002')
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_course public.enat_courses%rowtype;
  v_ticket text;
  v_hash text;
  v_expires timestamptz;
begin
  if v_user_id is null then
    raise exception 'login_required_on_source';
  end if;
  if coalesce(p_course_code, '') <> 'ENAT-CURSO-002' then
    raise exception 'course_not_authorized';
  end if;
  select * into v_course from public.enat_courses
  where code = 'ENAT-CURSO-002' and published = true and active = true limit 1;
  if v_course.id is null then raise exception 'course_not_available'; end if;
  v_ticket := rtrim(replace(replace(encode(gen_random_bytes(32), 'base64'), '+', '-'), '/', '_'), '=');
  v_hash := encode(digest(v_ticket, 'sha256'), 'hex');
  v_expires := now() + interval '8 hours';
  insert into public.neurodrive_course_access_tokens(token_hash,user_id,course_id,course_code,source,expires_at)
  values(v_hash,v_user_id,v_course.id,v_course.code,'cmnt',v_expires);
  return jsonb_build_object('ticket',v_ticket,'course_code',v_course.code,'expires_at',v_expires);
end;
$$;

create or replace function public.neurodrive_redeem_course_access(p_ticket text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_hash text;
  v_row public.neurodrive_course_access_tokens%rowtype;
  v_course public.enat_courses%rowtype;
begin
  if nullif(trim(p_ticket), '') is null then raise exception 'missing_ticket'; end if;
  v_hash := encode(digest(trim(p_ticket), 'sha256'), 'hex');
  select * into v_row from public.neurodrive_course_access_tokens
  where token_hash = v_hash and expires_at > now() limit 1;
  if v_row.id is null then raise exception 'invalid_or_expired_course_access'; end if;
  select * into v_course from public.enat_courses
  where id = v_row.course_id and code = 'ENAT-CURSO-002'
    and published = true and active = true limit 1;
  if v_course.id is null then raise exception 'course_not_available'; end if;
  update public.neurodrive_course_access_tokens set last_used_at = now() where id = v_row.id;
  return jsonb_build_object('course',jsonb_build_object(
    'id',v_course.id,'name',v_course.name,'code',v_course.code,'slug',v_course.slug,
    'summary',v_course.summary,'hours',v_course.hours,'modality',v_course.modality,
    'version',v_course.version,'thumbnail_url',v_course.thumbnail_url,'modules',v_course.modules
  ),'expires_at',v_row.expires_at);
end;
$$;

revoke all on function public.neurodrive_issue_course_access(text) from public, anon;
grant execute on function public.neurodrive_issue_course_access(text) to authenticated;
revoke all on function public.neurodrive_redeem_course_access(text) from public;
grant execute on function public.neurodrive_redeem_course_access(text) to anon, authenticated;

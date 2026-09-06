create or replace function public.enat_hub_neurodrive_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = public, enat_hub, pg_catalog
as $$
declare
  v_source_id uuid;
  v_source_name text;
  v_source_enabled boolean;
  v_assessments jsonb;
begin
  select id, name, enabled
    into v_source_id, v_source_name, v_source_enabled
  from enat_hub.source_systems
  where source_key = 'assistenteinstrutorv6'
  limit 1;

  if v_source_id is null then
    return jsonb_build_object('error', 'hub_source_not_registered');
  end if;

  if not v_source_enabled then
    return jsonb_build_object('error', 'hub_source_disabled');
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'observed_at', a.observed_at,
        'uf', a.uf,
        'municipality_code', a.municipality_code,
        'age_band', a.age_band,
        'cnh_category', a.cnh_category,
        'cargo', a.cargo,
        'instrument', a.instrument,
        'instrument_version', a.instrument_version,
        'total_score', a.total_score,
        'risk_class', a.risk_class,
        'created_at', a.created_at
      ) order by a.observed_at desc
    ),
    '[]'::jsonb
  )
  into v_assessments
  from enat_hub.assessments a
  where a.source_system_id = v_source_id;

  return jsonb_build_object(
    'source', 'assistenteinstrutorv6',
    'source_name', coalesce(v_source_name, 'AssistenteInstrutorV6 → CMNT'),
    'privacy', jsonb_build_object(
      'pii_excluded', true,
      'individual_records_excluded', true
    ),
    'assessments', v_assessments
  );
end;
$$;

revoke execute on function public.enat_hub_neurodrive_snapshot() from public;
revoke execute on function public.enat_hub_neurodrive_snapshot() from anon;
revoke execute on function public.enat_hub_neurodrive_snapshot() from authenticated;
grant execute on function public.enat_hub_neurodrive_snapshot() to service_role;

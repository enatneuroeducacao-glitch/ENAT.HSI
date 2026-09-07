import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

const normalizeUf = (value: unknown) => String(value || "N/I").trim().toUpperCase() || "N/I";
const normalizeLabel = (value: unknown, fallback: string) => String(value || fallback).trim() || fallback;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "server_configuration_error" }, 500);

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "missing_authorization" }, 401);
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return json({ error: "missing_authorization" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "invalid_session" }, 401);

  const { data: profile, error: profileError } = await admin
    .from("admin_profiles")
    .select("id,role,active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) return json({ error: "authorization_check_failed" }, 500);
  if (!profile || profile.active === false || !["admin", "superadmin"].includes(String(profile.role || "").toLowerCase())) {
    return json({ error: "admin_access_required" }, 403);
  }

  // The Hub schema is intentionally not exposed to the browser/PostgREST client.
  // The protected service-role RPC remains the source for HSI assessment aggregates.
  const { data: snapshot, error: snapshotError } = await admin.rpc("enat_hub_neurodrive_snapshot");
  if (snapshotError) return json({ error: "hub_snapshot_read_failed" }, 500);
  if (!snapshot || snapshot.error === "hub_source_not_registered") return json({ error: "hub_source_not_registered" }, 500);
  if (snapshot.error === "hub_source_disabled") return json({ error: "hub_source_disabled" }, 403);

  const sourceKey = String(snapshot.source || "assistenteinstrutorv6");
  const sourceName = String(snapshot.source_name || "AssistenteInstrutorV6 → CMNT");
  const assessments = Array.isArray(snapshot.assessments) ? snapshot.assessments : [];

  const validScores = assessments.map((r) => Number(r.total_score)).filter((n) => Number.isFinite(n));
  const averageScore = validScores.length
    ? Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2))
    : null;

  const byUf = new Map<string, { uf: string; assessments: number; scoreSum: number; scoreCount: number }>();
  const byRisk = new Map<string, number>();
  for (const row of assessments) {
    const uf = normalizeUf(row.uf);
    const item = byUf.get(uf) || { uf, assessments: 0, scoreSum: 0, scoreCount: 0 };
    item.assessments += 1;
    const score = Number(row.total_score);
    if (Number.isFinite(score)) {
      item.scoreSum += score;
      item.scoreCount += 1;
    }
    byUf.set(uf, item);

    const risk = normalizeLabel(row.risk_class, "Não classificado");
    byRisk.set(risk, (byRisk.get(risk) || 0) + 1);
  }

  const ufDistribution = [...byUf.values()]
    .map((x) => ({
      uf: x.uf,
      assessments: x.assessments,
      average_score: x.scoreCount ? Number((x.scoreSum / x.scoreCount).toFixed(2)) : null,
    }))
    .sort((a, b) => b.assessments - a.assessments);

  const riskDistribution = [...byRisk.entries()]
    .map(([risk, count]) => ({ risk, count }))
    .sort((a, b) => b.count - a.count);

  // Administrative intelligence for NeuroDrive registrations.
  // Only aggregate, non-identifying data leaves this function.
  const instructorRole = ["instructor", "instrutor"];
  const [profilesResult, studentsResult, lessonsResult, institutionalInstructorsResult] = await Promise.all([
    admin
      .from("ai_profiles")
      .select("id,created_at,uf,acting_city,city,credential,credential_uf,employment_type,teaching_type")
      .in("role", instructorRole),
    admin.from("ai_students").select("id", { count: "exact", head: true }),
    admin.from("ai_lessons").select("id,user_id,status", { count: "exact" }),
    admin.from("enat_instructors").select("id,active", { count: "exact" }),
  ]);

  if (profilesResult.error || studentsResult.error || lessonsResult.error || institutionalInstructorsResult.error) {
    return json({ error: "administrative_snapshot_read_failed" }, 500);
  }

  const instructorProfiles = profilesResult.data || [];
  const lessonRows = lessonsResult.data || [];
  const instructorIds = new Set(instructorProfiles.map((p) => p.id));
  const instructorLessonUsers = new Set(
    lessonRows.filter((lesson) => instructorIds.has(lesson.user_id)).map((lesson) => lesson.user_id),
  );

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const registrationDates = instructorProfiles
    .map((p) => new Date(p.created_at).getTime())
    .filter((time) => Number.isFinite(time));

  const registrationsLast7Days = registrationDates.filter((time) => time >= sevenDaysAgo).length;
  const registrationsLast30Days = registrationDates.filter((time) => time >= thirtyDaysAgo).length;
  const completeProfiles = instructorProfiles.filter((p) =>
    Boolean(p.uf && (p.acting_city || p.city) && p.credential && p.credential_uf),
  ).length;

  const instructorByUf = new Map<string, number>();
  for (const profileRow of instructorProfiles) {
    const uf = normalizeUf(profileRow.uf || profileRow.credential_uf);
    instructorByUf.set(uf, (instructorByUf.get(uf) || 0) + 1);
  }
  const instructorUfDistribution = [...instructorByUf.entries()]
    .map(([uf, instructors]) => ({ uf, instructors }))
    .sort((a, b) => b.instructors - a.instructors);

  const employmentMap = new Map<string, number>();
  const teachingMap = new Map<string, number>();
  for (const profileRow of instructorProfiles) {
    const employment = normalizeLabel(profileRow.employment_type, "Não informado");
    const teaching = normalizeLabel(profileRow.teaching_type, "Não informado");
    employmentMap.set(employment, (employmentMap.get(employment) || 0) + 1);
    teachingMap.set(teaching, (teachingMap.get(teaching) || 0) + 1);
  }

  const distributionFromMap = (map: Map<string, number>) => [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const recentRegistrations = [...instructorProfiles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((p) => ({
      created_at: p.created_at,
      uf: normalizeUf(p.uf || p.credential_uf),
      profile_complete: Boolean(p.uf && (p.acting_city || p.city) && p.credential && p.credential_uf),
      has_activity: instructorLessonUsers.has(p.id),
    }));

  const institutionalTotal = institutionalInstructorsResult.count || 0;
  const institutionalActive = (institutionalInstructorsResult.data || []).filter((x) => x.active !== false).length;

  return json({
    source: sourceKey,
    source_name: sourceName,
    generated_at: new Date().toISOString(),
    privacy: { pii_excluded: true, individual_records_excluded: true },
    totals: {
      assessments: assessments.length,
      scored_assessments: validScores.length,
      average_score: averageScore,
      ufs: ufDistribution.length,
    },
    uf_distribution: ufDistribution,
    risk_distribution: riskDistribution,
    recent: assessments.slice(0, 10).map((r) => ({
      observed_at: r.observed_at,
      uf: r.uf,
      age_band: r.age_band,
      cnh_category: r.cnh_category,
      instrument: r.instrument,
      instrument_version: r.instrument_version,
      total_score: r.total_score,
      risk_class: r.risk_class,
    })),
    instructor_intelligence: {
      registered: instructorProfiles.length,
      registrations_last_7_days: registrationsLast7Days,
      registrations_last_30_days: registrationsLast30Days,
      with_activity: instructorLessonUsers.size,
      without_activity: Math.max(0, instructorProfiles.length - instructorLessonUsers.size),
      profile_complete: completeProfiles,
      profile_completion_rate: instructorProfiles.length
        ? Number((completeProfiles / instructorProfiles.length * 100).toFixed(1))
        : 0,
      states: instructorUfDistribution.length,
      municipalities: new Set(instructorProfiles.map((p) => p.acting_city || p.city).filter(Boolean)).size,
      instructor_uf_distribution: instructorUfDistribution,
      employment_distribution: distributionFromMap(employmentMap),
      teaching_distribution: distributionFromMap(teachingMap),
      recent_registrations: recentRegistrations,
    },
    platform_intelligence: {
      students: studentsResult.count || 0,
      lessons: lessonRows.filter((lesson) => lesson.status !== "cancelled").length,
      institutional_instructors: institutionalTotal,
      institutional_active_instructors: institutionalActive,
    },
  });
});

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
  // The protected service-role RPC is the only read path used by this admin endpoint.
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
    const uf = String(row.uf || "N/I").trim().toUpperCase() || "N/I";
    const item = byUf.get(uf) || { uf, assessments: 0, scoreSum: 0, scoreCount: 0 };
    item.assessments += 1;
    const score = Number(row.total_score);
    if (Number.isFinite(score)) {
      item.scoreSum += score;
      item.scoreCount += 1;
    }
    byUf.set(uf, item);

    const risk = String(row.risk_class || "Não classificado").trim() || "Não classificado";
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
  });
});

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) throw new Error("Acesso administrativo necessário.");
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authClient = createClient(url, anon);
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) throw new Error("Sessão administrativa inválida.");
  const db = createClient(url, service);
  const { data: profile, error: profileError } = await db
    .from("admin_profiles")
    .select("id,role,active")
    .eq("id", userData.user.id)
    .eq("active", true)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile || !["admin", "superadmin", "administrator"].includes(String(profile.role || "").toLowerCase())) {
    throw new Error("Usuário sem autorização administrativa.");
  }
  return { db, user: userData.user };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { db, user } = await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    if (action === "list") {
      const { data, error } = await db.from("enat_instructors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return json({ instructors: data || [] });
    }

    if (action === "delete") {
      const id = String(body.id || "").trim();
      if (!id) throw new Error("Professor não informado.");
      const { data: current, error: readError } = await db.from("enat_instructors").select("*").eq("id", id).maybeSingle();
      if (readError) throw readError;
      if (!current) throw new Error("Professor não encontrado.");
      const { error } = await db.from("enat_instructors").delete().eq("id", id);
      if (error) throw error;
      return json({ deleted: true, instructor: current, deleted_by: user.id });
    }

    if (action === "create") {
      const row = {
        name: String(body.name || "").trim(),
        qualification: String(body.qualification || "Especialista").trim(),
        formation: String(body.formation || "").trim(),
        institution: body.institution ? String(body.institution).trim() : null,
        registration: body.registration ? String(body.registration).trim() : null,
      };
      if (!row.name || !row.formation) throw new Error("Informe nome e formação do professor.");
      const { data, error } = await db.from("enat_instructors").insert(row).select().single();
      if (error) throw error;
      return json({ instructor: data }, 201);
    }

    throw new Error("Ação inválida.");
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 400);
  }
});

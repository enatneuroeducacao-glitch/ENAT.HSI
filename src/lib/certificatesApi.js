const SUPABASE_URL = "https://qkpsxbcsngowljqhyvit.supabase.co";

export async function validateCertificate(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return { valid: false, certificate: null, error: "Código não informado" };
  const response = await fetch(`${SUPABASE_URL}/functions/v1/validate-certificate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: normalized }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Não foi possível validar o certificado.");
  return data;
}

export { SUPABASE_URL };
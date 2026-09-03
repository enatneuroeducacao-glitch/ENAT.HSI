import { supabase } from "./supabaseClient";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qkpsxbcsngowljqhyvit.supabase.co";

function requireClient() {
  if (!supabase) {
    throw new Error("A conexão da Central ENAT HSI com o Supabase ainda não foi configurada. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no ambiente do site.");
  }
  return supabase;
}

async function invoke(name, body) {
  const client = requireClient();
  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session) throw new Error("Acesso administrativo necessário. Faça login para emitir ou administrar certificados.");
  const { data, error } = await client.functions.invoke(name, { body });
  if (error) throw new Error(error.message || "Falha ao executar a operação de certificados.");
  return data;
}

export async function getSession() {
  const client = requireClient();
  return client.auth.getSession();
}

export async function signIn(email, password) {
  const client = requireClient();
  return client.auth.signInWithPassword({ email, password });
}

export async function signUp(email, password) {
  const client = requireClient();
  return client.auth.signUp({ email, password });
}

export async function signOut() {
  const client = requireClient();
  return client.auth.signOut();
}

export async function issueCertificate(certificate) {
  const { code: _clientCode, ...serverIssuedCertificate } = certificate || {};
  return invoke("issue-certificate", serverIssuedCertificate);
}

export async function cancelCertificate(code, status) {
  return invoke("cancel-certificate", { code, status });
}

export async function listCertificates() {
  return invoke("list-certificates", {});
}

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

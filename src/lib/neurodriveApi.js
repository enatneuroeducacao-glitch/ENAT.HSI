import { supabase } from "./supabaseClient";

export async function getNeuroDriveAdminSummary() {
  if (!supabase) throw new Error("A conexão da Central ENAT HSI com o Supabase não está configurada.");
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!sessionData.session) throw new Error("Acesso administrativo necessário. Faça login.");

  const { data, error } = await supabase.functions.invoke("neurodrive-admin", { body: {} });
  if (error) {
    let message = error.message || "Falha ao carregar a integração NeuroDrive.";
    try {
      const detail = await error.context?.json?.();
      if (detail?.error) message = detail.error;
    } catch {}
    throw new Error(message);
  }
  return data;
}

import { supabase } from "./supabaseClient";

export async function getNeuroDriveAdminSummary(filters = {}) {
  if (!supabase) throw new Error("A conexão da Central ENAT HSI com o Supabase não está configurada.");
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!sessionData.session) throw new Error("Acesso administrativo necessário. Faça login.");
  const { data, error } = await supabase.functions.invoke("neurodrive-admin", { body: filters });
  if (error) {
    let message = error.message || "Falha ao carregar a integração NeuroDrive.";
    try { const detail = await error.context?.json?.(); if (detail?.error) message = detail.error; } catch {}
    throw new Error(message);
  }

  // Integridade ENAT HSI: RPA só é contabilizado como válido quando existe
  // pelo menos uma avaliação HSI-DOTH-P registrada na camada integrada.
  // Evita que RPAs históricos criados antes da trava apareçam como emitidos
  // sem o respectivo HSI.
  const result = data || {};
  const assessments = Number(result?.totals?.assessments || 0);
  const rawRpa = Number(result?.operational?.rpa_reports ?? result?.platform_intelligence?.rpa_reports ?? 0);
  const validRpa = assessments > 0 ? Math.min(rawRpa, assessments) : 0;
  const inconsistentRpa = Math.max(0, rawRpa - validRpa);

  result.operational = {
    ...(result.operational || {}),
    rpa_reports: validRpa,
    rpa_inconsistent: inconsistentRpa,
  };
  result.platform_intelligence = {
    ...(result.platform_intelligence || {}),
    rpa_reports: validRpa,
    rpa_inconsistent: inconsistentRpa,
  };
  result.integrity = {
    ...(result.integrity || {}),
    rpa_requires_hsi: true,
    raw_rpa_reports: rawRpa,
    valid_rpa_reports: validRpa,
    inconsistent_rpa_reports: inconsistentRpa,
  };

  return result;
}

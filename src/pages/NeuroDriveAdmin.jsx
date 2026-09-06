import React, { useEffect, useMemo, useState } from "react";
import { getNeuroDriveAdminSummary } from "../lib/neurodriveApi";

const cardStyle = { background: "#0c1b29", border: "1px solid rgba(99,202,255,.18)", borderRadius: 16, padding: 20 };
const muted = { color: "#8fa8ba", fontSize: 13 };

export function NeuroDriveAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setData(await getNeuroDriveAdminSummary()); }
    catch (err) { setError(err?.message || "Não foi possível carregar o NeuroDrive."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const maxUf = Math.max(1, ...(data?.uf_distribution || []).map((x) => x.assessments));
  const maxRisk = Math.max(1, ...(data?.risk_distribution || []).map((x) => x.count));
  const sourceLabel = data?.source_name || "AssistenteInstrutorV6 → CMNT";
  const lastSync = useMemo(() => data?.generated_at ? new Date(data.generated_at).toLocaleString("pt-BR") : "—", [data]);

  return <main style={{ minHeight: "100vh", background: "#07111b", color: "#eaf6ff", padding: "32px 24px", fontFamily: "Arial, sans-serif" }}>
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ ...muted, letterSpacing: ".12em" }}>PORTAL ADMINISTRATIVO · ENAT HSI</div>
          <h1 style={{ margin: "8px 0", fontSize: 32 }}>NEURODRIVE INSTRUTOR ENAT-HSI</h1>
          <p style={{ ...muted, maxWidth: 760, fontSize: 15, lineHeight: 1.6 }}>Integração administrativa com o Hub ENAT. A Central recebe indicadores agregados do NeuroDrive sem expor registros individuais, identificadores pessoais ou dados de aula no painel nacional.</p>
        </div>
        <button onClick={load} disabled={loading} style={{ border: "1px solid rgba(99,202,255,.35)", background: "#0e2535", color: "#bfeaff", borderRadius: 10, padding: "11px 16px", cursor: "pointer" }}>{loading ? "Atualizando…" : "↻ Atualizar"}</button>
      </header>

      {error && <div style={{ ...cardStyle, borderColor: "rgba(255,100,100,.35)", marginBottom: 20 }}>Falha na integração: {error}</div>}
      {loading && !data && <div style={cardStyle}>Carregando indicadores do NeuroDrive…</div>}

      {data && <>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 18 }}>
          <article style={cardStyle}><div style={muted}>AVALIAÇÕES RECEBIDAS</div><strong style={{ display: "block", fontSize: 34, marginTop: 8 }}>{data.totals.assessments}</strong><span style={muted}>fonte autorizada: {sourceLabel}</span></article>
          <article style={cardStyle}><div style={muted}>MÉDIA HSI</div><strong style={{ display: "block", fontSize: 34, marginTop: 8 }}>{data.totals.average_score ?? "—"}</strong><span style={muted}>somente avaliações com pontuação</span></article>
          <article style={cardStyle}><div style={muted}>UFs COM DADOS</div><strong style={{ display: "block", fontSize: 34, marginTop: 8 }}>{data.totals.ufs}</strong><span style={muted}>distribuição agregada</span></article>
          <article style={cardStyle}><div style={muted}>PRIVACIDADE</div><strong style={{ display: "block", fontSize: 22, marginTop: 13 }}>PII EXCLUÍDO</strong><span style={muted}>sem registros individuais</span></article>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18, marginBottom: 18 }}>
          <article style={cardStyle}><div style={muted}>DISTRIBUIÇÃO TERRITORIAL</div><h2 style={{ margin: "6px 0 18px" }}>Avaliações por UF</h2>{data.uf_distribution.map((x) => <div key={x.uf} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{x.uf}</span><b>{x.assessments}</b></div><div style={{ height: 7, background: "#132c3c", borderRadius: 99, marginTop: 5 }}><div style={{ height: "100%", width: `${Math.round(x.assessments / maxUf * 100)}%`, background: "#63caff", borderRadius: 99 }} /></div></div>)}{!data.uf_distribution.length && <span style={muted}>Nenhum dado recebido ainda.</span>}</article>
          <article style={cardStyle}><div style={muted}>CLASSIFICAÇÃO DE RISCO</div><h2 style={{ margin: "6px 0 18px" }}>Distribuição</h2>{data.risk_distribution.map((x) => <div key={x.risk} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{x.risk}</span><b>{x.count}</b></div><div style={{ height: 7, background: "#132c3c", borderRadius: 99, marginTop: 5 }}><div style={{ height: "100%", width: `${Math.round(x.count / maxRisk * 100)}%`, background: "#63caff", borderRadius: 99 }} /></div></div>)}{!data.risk_distribution.length && <span style={muted}>Nenhuma classificação disponível.</span>}</article>
        </section>

        <section style={cardStyle}>
          <div style={muted}>ÚLTIMAS ENTRADAS · DADOS NÃO IDENTIFICÁVEIS</div>
          <h2 style={{ margin: "6px 0 16px" }}>Atividade NeuroDrive</h2>
          <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr>{["Data","UF","Faixa etária","Categoria","Instrumento","Score","Risco"].map((h) => <th key={h} style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,.1)", color: "#8fa8ba" }}>{h}</th>)}</tr></thead><tbody>{data.recent.map((x, i) => <tr key={`${x.observed_at}-${i}`}>{[x.observed_at ? new Date(x.observed_at).toLocaleString("pt-BR") : "—", x.uf || "—", x.age_band || "—", x.cnh_category || "—", `${x.instrument || "HSI-DOTH-P"}${x.instrument_version ? ` v${x.instrument_version}` : ""}`, x.total_score ?? "—", x.risk_class || "—"].map((v, j) => <td key={j} style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>{v}</td>)}</tr>)}</tbody></table></div>
          {!data.recent.length && <p style={muted}>O NeuroDrive ainda não enviou avaliações para o Hub.</p>}
          <div style={{ ...muted, marginTop: 14 }}>Última leitura da Central: {lastSync}</div>
        </section>
      </>}
    </div>
  </main>;
}

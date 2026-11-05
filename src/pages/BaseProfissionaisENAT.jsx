import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const pageStyle = { minHeight: "100vh", background: "#07111b", color: "#e6f1fa", padding: "105px 28px 54px", fontFamily: "Arial,sans-serif" };
const panelStyle = { background: "#0d1b29", border: "1px solid #203b52", borderRadius: 12, padding: 18 };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 7, border: "1px solid #31506b", background: "#081622", color: "#e6f1fa" };
const buttonStyle = { padding: "10px 14px", borderRadius: 7, border: "1px solid #31506b", background: "#14283b", color: "#dbe8f2", cursor: "pointer", fontWeight: 700 };
const primaryStyle = { ...buttonStyle, background: "#82c8f7", color: "#07111b", borderColor: "#82c8f7" };
const normalize = (value) => String(value || "").trim();
const isSubscribed = (row) => Boolean(row.newsletter_opt_in) && !row.newsletter_opted_out_at;
const escapeXml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const excelCell = (value, type = "String") => `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
const excelSheet = (name, rows) => `<Worksheet ss:Name="${escapeXml(name)}"><Table>${rows.map(row => `<Row>${row.map(value => Array.isArray(value) ? excelCell(value[0], value[1]) : excelCell(value)).join("")}</Row>`).join("")}</Table></Worksheet>`;
const formatDate = (value) => value ? new Date(value).toLocaleString("pt-BR") : "—";

export function BaseProfissionaisENAT() {
  const { profile, session } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [professionFilter, setProfessionFilter] = useState("all");
  const [consentFilter, setConsentFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true); setError(""); setNotice("");
    if (!supabase) { setError("Conexão com o banco de dados não configurada."); setLoading(false); return; }
    const { data, error: queryError } = await supabase
      .from("enat_public_inbox")
      .select("id,name,email,phone,city,state,profession,institution,subject,summary,metadata,consent,newsletter_opt_in,newsletter_consent_at,newsletter_opted_out_at,newsletter_opted_out_by,newsletter_opt_out_reason,created_at,status")
      .eq("kind", "interest")
      .not("profession", "is", null)
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message || "Não foi possível carregar a base de profissionais.");
    else setRows((data || []).filter(row => normalize(row.profession)));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stateOptions = useMemo(() => [...new Set(rows.map(row => normalize(row.state).toUpperCase()).filter(Boolean))].sort(), [rows]);
  const professionOptions = useMemo(() => [...new Set(rows.map(row => normalize(row.profession)).filter(Boolean))].sort((a,b) => a.localeCompare(b, "pt-BR")), [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return rows.filter(row => {
      const text = [row.name,row.email,row.phone,row.city,row.state,row.profession,row.institution].map(normalize).join(" ").toLocaleLowerCase("pt-BR");
      if (term && !text.includes(term)) return false;
      if (stateFilter !== "all" && normalize(row.state).toUpperCase() !== stateFilter) return false;
      if (professionFilter !== "all" && normalize(row.profession) !== professionFilter) return false;
      if (consentFilter === "subscribed" && !isSubscribed(row)) return false;
      if (consentFilter === "unsubscribed" && isSubscribed(row)) return false;
      return true;
    });
  }, [rows, search, stateFilter, professionFilter, consentFilter]);

  const totals = useMemo(() => ({
    total: rows.length,
    subscribed: rows.filter(isSubscribed).length,
    unsubscribed: rows.filter(row => !isSubscribed(row)).length,
    states: new Set(rows.map(row => normalize(row.state).toUpperCase()).filter(Boolean)).size,
  }), [rows]);

  const byState = useMemo(() => {
    const counts = {};
    rows.forEach(row => { const key = normalize(row.state).toUpperCase() || "Não informado"; counts[key] = (counts[key] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0], "pt-BR"));
  }, [rows]);

  const byProfession = useMemo(() => {
    const counts = {};
    rows.forEach(row => { const key = normalize(row.profession) || "Não informado"; counts[key] = (counts[key] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0], "pt-BR"));
  }, [rows]);

  const unsubscribe = async (row) => {
    if (!isSubscribed(row)) return;
    const ok = window.confirm(`Registrar o descadastramento de ${row.name} (${row.email || "sem e-mail"})? O registro será preservado, mas deixará de integrar as listas de comunicação.`);
    if (!ok) return;
    const reason = window.prompt("Motivo ou observação do descadastramento (opcional):", "Solicitação do titular");
    if (reason === null) return;
    setBusyId(row.id); setError(""); setNotice("");
    const { error: updateError } = await supabase.from("enat_public_inbox").update({
      newsletter_opt_in: false,
      newsletter_opted_out_at: new Date().toISOString(),
      newsletter_opted_out_by: session?.user?.id || null,
      newsletter_opt_out_reason: reason.trim().slice(0, 500),
      updated_at: new Date().toISOString(),
    }).eq("id", row.id);
    if (updateError) setError(updateError.message || "Não foi possível registrar o descadastramento.");
    else {
      setRows(old => old.map(item => item.id === row.id ? { ...item, newsletter_opt_in: false, newsletter_opted_out_at: new Date().toISOString(), newsletter_opted_out_by: session?.user?.id || null, newsletter_opt_out_reason: reason.trim() } : item));
      setNotice(`Descadastramento registrado para ${row.name}. O histórico do cadastro foi preservado.`);
    }
    setBusyId("");
  };

  const exportExcel = () => {
    const headers = ["Nome","E-mail","Telefone","Profissão","Instituição","Cidade","UF","Recebe notícias","Consentimento de dados","Data do consentimento","Descadastrado em","Motivo do descadastramento","Cadastro em"];
    const dataRows = filtered.map(row => [
      row.name,row.email,row.phone,row.profession,row.institution,row.city,normalize(row.state).toUpperCase(),
      isSubscribed(row) ? "Sim" : "Não",row.consent ? "Sim" : "Não",formatDate(row.newsletter_consent_at),
      formatDate(row.newsletter_opted_out_at),row.newsletter_opt_out_reason || "",formatDate(row.created_at)
    ]);
    const stateRows = [["UF","Quantidade"], ...byState.map(([label,count]) => [label,[count,"Number"]])];
    const professionRows = [["Profissão","Quantidade"], ...byProfession.map(([label,count]) => [label,[count,"Number"]])];
    const summaryRows = [["Indicador","Quantidade"],["Cadastros",[totals.total,"Number"]],["Autorizados a receber notícias",[totals.subscribed,"Number"]],["Sem autorização ou descadastrados",[totals.unsubscribed,"Number"]],["Estados com registros",[totals.states,"Number"]]];
    const workbook = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${excelSheet("Profissionais",[headers,...dataRows])}${excelSheet("Por estado",stateRows)}${excelSheet("Por profissão",professionRows)}${excelSheet("Resumo",summaryRows)}</Workbook>`;
    const blob = new Blob(["\uFEFF", workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `base-profissionais-enat-${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };

  if (!["admin", "operador"].includes(profile?.role)) return <main style={pageStyle}><div style={{ maxWidth: 900, margin: "auto", ...panelStyle }}><h1>Acesso restrito</h1><p>Esta base contém dados pessoais e está disponível somente para administradores e operadores autorizados da Central ENAT.</p></div></main>;

  const maxState = Math.max(1, ...byState.map(item => item[1]));
  const maxProfession = Math.max(1, ...byProfession.map(item => item[1]));

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1450, margin: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          <div><div style={{ color: "#82c8f7", fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>CENTRAL ENAT HSI · RELACIONAMENTO</div><h1 style={{ margin: "8px 0", fontSize: 32 }}>Base de Profissionais ENAT</h1><p style={{ color: "#9db1c1", margin: 0 }}>Cadastro, distribuição nacional e gestão das autorizações de comunicação.</p></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button onClick={load} disabled={loading} style={buttonStyle}>↻ Atualizar</button><button onClick={exportExcel} disabled={!filtered.length} style={primaryStyle}>⇩ Exportar Excel (.xls)</button></div>
        </header>

        {error && <div role="alert" style={{ marginTop: 18, padding: 13, borderRadius: 8, background: "#321b20", border: "1px solid #754848", color: "#ffb4b4" }}>{error}</div>}
        {notice && <div role="status" style={{ marginTop: 18, padding: 13, borderRadius: 8, background: "#102d2b", border: "1px solid #28665d", color: "#a9e7d9" }}>{notice}</div>}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, margin: "24px 0" }}>
          {[
            ["PROFISSIONAIS CADASTRADOS",totals.total,"👥"],
            ["AUTORIZARAM NOTÍCIAS",totals.subscribed,"📨"],
            ["SEM AUTORIZAÇÃO / DESCADASTRADOS",totals.unsubscribed,"🔕"],
            ["ESTADOS REPRESENTADOS",totals.states,"🇧🇷"],
          ].map(([label,value,icon]) => <article key={label} style={panelStyle}><div style={{ color: "#8da4b7", fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>{icon} {label}</div><strong style={{ display: "block", fontSize: 30, marginTop: 10 }}>{loading ? "…" : value}</strong></article>)}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginBottom: 22 }}>
          <article style={panelStyle}><h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Cadastros por estado</h2>{loading ? <p>Carregando…</p> : byState.length ? byState.map(([label,count]) => <div key={label} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span>{label}</span><strong>{count}</strong></div><div style={{ height: 7, borderRadius: 8, background: "#1a3042", overflow: "hidden" }}><div style={{ width: `${count/maxState*100}%`, height: "100%", background: "#56b5e8" }} /></div></div>) : <p style={{ color: "#91a7b8" }}>Nenhum registro.</p>}</article>
          <article style={panelStyle}><h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Cadastros por profissão</h2>{loading ? <p>Carregando…</p> : byProfession.length ? byProfession.slice(0,12).map(([label,count]) => <div key={label} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, marginBottom: 5 }}><span>{label}</span><strong>{count}</strong></div><div style={{ height: 7, borderRadius: 8, background: "#1a3042", overflow: "hidden" }}><div style={{ width: `${count/maxProfession*100}%`, height: "100%", background: "#65c7a8" }} /></div></div>) : <p style={{ color: "#91a7b8" }}>Nenhum registro.</p>}</article>
        </section>

        <section style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><h2 style={{ margin: 0, fontSize: 20 }}>Diretório profissional</h2><p style={{ color: "#91a7b8", margin: "5px 0 0", fontSize: 13 }}>Exibindo {filtered.length} de {rows.length} registros. O descadastramento não exclui o histórico.</p></div></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, margin: "18px 0" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome, e-mail, cidade…" style={inputStyle}/>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={inputStyle}><option value="all">Todos os estados</option>{stateOptions.map(value => <option key={value} value={value}>{value}</option>)}</select>
            <select value={professionFilter} onChange={e => setProfessionFilter(e.target.value)} style={inputStyle}><option value="all">Todas as profissões</option>{professionOptions.map(value => <option key={value} value={value}>{value}</option>)}</select>
            <select value={consentFilter} onChange={e => setConsentFilter(e.target.value)} style={inputStyle}><option value="all">Todas as autorizações</option><option value="subscribed">Autorizou receber notícias</option><option value="unsubscribed">Sem autorização / descadastrado</option></select>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920, fontSize: 13 }}>
              <thead><tr style={{ color: "#8fa8ba", textAlign: "left" }}>{["Profissional","Atuação","Localização","Comunicação","Cadastro","Ação"].map(label => <th key={label} style={{ padding: "12px 10px", borderBottom: "1px solid #28445a" }}>{label}</th>)}</tr></thead>
              <tbody>{filtered.map(row => <tr key={row.id}>
                <td style={{ padding: 12, borderBottom: "1px solid #1b3448" }}><strong>{row.name}</strong><div style={{ color: "#8fa8ba", marginTop: 4 }}>{row.email || "Sem e-mail"}{row.phone ? ` · ${row.phone}` : ""}</div><div style={{ color: "#70899d", marginTop: 3 }}>{row.institution || ""}</div></td>
                <td style={{ padding: 12, borderBottom: "1px solid #1b3448" }}>{row.profession}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #1b3448" }}>{[row.city,normalize(row.state).toUpperCase()].filter(Boolean).join(" / ") || "Não informado"}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #1b3448" }}><span style={{ color: isSubscribed(row) ? "#8fe0bd" : "#b4c0ca", fontWeight: 800 }}>{isSubscribed(row) ? "Autorizado" : "Não autorizado / descadastrado"}</span>{row.newsletter_opted_out_at && <div style={{ color: "#849bad", marginTop: 4 }}>Descadastrado em {formatDate(row.newsletter_opted_out_at)}</div>}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #1b3448", color: "#9db1c1" }}>{formatDate(row.created_at)}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #1b3448" }}>{isSubscribed(row) ? <button disabled={busyId===row.id} onClick={() => unsubscribe(row)} style={{ ...buttonStyle, borderColor: "#8b5555", color: "#ffc1c1" }}>{busyId===row.id ? "Salvando…" : "Registrar descadastramento"}</button> : <span style={{ color: "#71899b" }}>Sem ação</span>}</td>
              </tr>)}</tbody>
            </table>
          </div>
          {!loading && !filtered.length && <div style={{ padding: 30, textAlign: "center", color: "#8fa8ba" }}>Nenhum profissional encontrado com os filtros selecionados.</div>}
        </section>
        <p style={{ color: "#647f93", fontSize: 12, marginTop: 14 }}>Dados pessoais restritos à equipe administrativa. A exportação respeita os filtros ativos e inclui o estado de autorização e o histórico de descadastramento.</p>
      </div>
    </main>
  );
}

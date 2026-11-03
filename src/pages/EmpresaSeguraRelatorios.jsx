import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, UsersRound, History, RefreshCw, Search, Download, FileSpreadsheet, FileText, Eye, X, AlertTriangle, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabaseClient";

const STATUS_LABELS = { pending: "Pendente", approved: "Aprovado", rejected: "Rejeitado", suspended: "Suspenso", active: "Ativo", completed: "Concluído", reviewing: "Em análise" };
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("pt-BR");
};
const statusLabel = (value) => STATUS_LABELS[String(value || "").toLowerCase()] || value || "Não informado";
const clean = (value) => value == null || value === "" ? "—" : String(value);
const flatten = (value) => value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
const downloadBlob = (content, type, filename) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
};
const csvCell = (value) => '"' + flatten(value).replace(/"/g, '""') + '"';

export function EmpresaSeguraRelatorios() {
  const [companies, setCompanies] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [activeType, setActiveType] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [period, setPeriod] = useState("todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async (quiet = false) => {
    if (!supabase) { setErrors(["Conexão Supabase não configurada neste ambiente."]); setLoading(false); return; }
    if (quiet) setRefreshing(true); else setLoading(true);
    const requests = [
      ["empresas", supabase.from("empresa_segura_companies").select("*").order("created_at", { ascending: false })],
      ["perfis", supabase.from("empresa_segura_profiles").select("*").order("created_at", { ascending: false })],
      ["vínculos", supabase.from("empresa_segura_memberships").select("*").order("created_at", { ascending: false })],
      ["auditoria", supabase.from("empresa_segura_audit_log").select("*").order("created_at", { ascending: false }).limit(2000)],
    ];
    const results = await Promise.all(requests.map(async ([label, query]) => {
      try { const result = await query; return { label, data: result.data || [], error: result.error?.message || null }; }
      catch (error) { return { label, data: [], error: error?.message || "Falha de leitura" }; }
    }));
    setCompanies(results[0].data); setProfiles(results[1].data); setMemberships(results[2].data); setAuditLogs(results[3].data);
    setErrors(results.filter((item) => item.error).map((item) => item.label + ": " + item.error));
    setLastUpdated(new Date()); setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const employeeRows = useMemo(() => {
    const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));
    const membershipByUser = new Map();
    memberships.forEach((membership) => {
      const current = membershipByUser.get(membership.user_id) || [];
      current.push(membership); membershipByUser.set(membership.user_id, current);
    });
    const allUserIds = new Set([
      ...profiles.filter((p) => p.role === "employee" || p.requested_role === "employee").map((p) => p.user_id),
      ...memberships.map((m) => m.user_id),
    ]);
    return Array.from(allUserIds).map((userId) => {
      const profile = profileMap.get(userId) || {};
      const userMemberships = membershipByUser.get(userId) || [];
      const companyNames = userMemberships.map((membership) => {
        const company = companies.find((item) => item.id === membership.company_id);
        return company?.trade_name || company?.legal_name || membership.company_id;
      }).filter(Boolean);
      return {
        id: userId, user_id: userId, full_name: profile.full_name || "Nome não informado",
        role: profile.role || profile.requested_role || "employee", requested_role: profile.requested_role || "employee",
        status: profile.status || userMemberships[0]?.status || "pending",
        created_at: profile.created_at || userMemberships[0]?.created_at || null, updated_at: profile.updated_at || null,
        companies: companyNames, memberships: userMemberships, profile,
      };
    }).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [profiles, memberships, companies]);

  const rows = useMemo(() => {
    const now = new Date();
    let cutoff = null;
    if (period === "30") cutoff = new Date(now.getTime() - 30 * 86400000);
    if (period === "90") cutoff = new Date(now.getTime() - 90 * 86400000);
    if (period === "ano") cutoff = new Date(now.getFullYear(), 0, 1);
    const companyRows = companies.map((record) => ({
      id: record.id, type: "empresa", name: record.trade_name || record.legal_name || "Empresa sem nome",
      status: record.status, created_at: record.created_at, updated_at: record.updated_at,
      subtitle: record.legal_name || "", searchText: flatten(record), record,
    }));
    const peopleRows = employeeRows.map((record) => ({
      id: record.user_id, type: "funcionario", name: record.full_name, status: record.status,
      created_at: record.created_at, updated_at: record.updated_at,
      subtitle: record.companies.join(", ") || "Sem vínculo empresarial confirmado", searchText: flatten(record), record,
    }));
    const logRows = auditLogs.map((record) => ({
      id: String(record.id), type: "historico", name: record.action || "Operação administrativa",
      status: "registered", created_at: record.created_at, updated_at: record.created_at,
      subtitle: (record.table_name || "registro") + " · " + (record.record_id || "sem identificador"), searchText: flatten(record), record,
    }));
    let combined = [
      ...(activeType === "todos" || activeType === "empresa" ? companyRows : []),
      ...(activeType === "todos" || activeType === "funcionario" ? peopleRows : []),
      ...(activeType === "todos" || activeType === "historico" ? logRows : []),
    ];
    if (statusFilter !== "todas") combined = combined.filter((row) => String(row.status || "").toLowerCase() === statusFilter);
    if (cutoff) combined = combined.filter((row) => row.created_at && new Date(row.created_at) >= cutoff);
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (term) combined = combined.filter((row) => (row.name + " " + row.subtitle + " " + row.searchText).toLocaleLowerCase("pt-BR").includes(term));
    return combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [companies, employeeRows, auditLogs, activeType, statusFilter, period, search]);

  const counts = useMemo(() => ({
    companies: companies.length, employees: employeeRows.length,
    pending: companies.filter((item) => item.status === "pending").length + employeeRows.filter((item) => item.status === "pending").length + memberships.filter((item) => item.status === "pending").length,
    history: auditLogs.length,
  }), [companies, employeeRows, memberships, auditLogs]);

  const exportCsv = () => {
    const headers = ["Tipo", "Nome/ação", "Situação", "Data de cadastro/evento", "Última atualização", "Resumo", "Dados completos (JSON)"];
    const lines = rows.map((row) => [row.type === "empresa" ? "Empresa" : row.type === "funcionario" ? "Funcionário" : "Histórico", row.name, statusLabel(row.status), formatDate(row.created_at), formatDate(row.updated_at), row.subtitle, JSON.stringify(row.record)]);
    const csv = "\uFEFF" + [headers, ...lines].map((line) => line.map(csvCell).join(";")).join("\r\n");
    downloadBlob(csv, "text/csv;charset=utf-8;", "empresa-segura-relatorio-" + new Date().toISOString().slice(0, 10) + ".csv");
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 16;
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text("Empresa Segura - Relatorio Administrativo", 14, y);
    y += 7; doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("Gerado em: " + formatDate(new Date()) + " | Registros: " + rows.length, 14, y);
    y += 8; doc.setFont("helvetica", "bold");
    doc.text("Tipo", 14, y); doc.text("Nome / Acao", 38, y); doc.text("Situacao", 120, y); doc.text("Data", 151, y); doc.text("Resumo", 190, y);
    y += 3; doc.line(14, y, pageWidth - 14, y); y += 5;
    rows.forEach((row) => {
      const type = row.type === "empresa" ? "Empresa" : row.type === "funcionario" ? "Funcionario" : "Historico";
      const nameLines = doc.splitTextToSize(row.name, 77);
      const summaryLines = doc.splitTextToSize(row.subtitle || "", 87);
      const height = Math.max(nameLines.length, summaryLines.length, 1) * 4 + 3;
      if (y + height > pageHeight - 12) { doc.addPage(); y = 16; }
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text(type, 14, y); doc.text(nameLines, 38, y); doc.text(statusLabel(row.status), 120, y);
      doc.text(formatDate(row.created_at).slice(0, 16), 151, y); doc.text(summaryLines, 190, y);
      y += height; doc.setDrawColor(220); doc.line(14, y - 1, pageWidth - 14, y - 1);
    });
    doc.save("empresa-segura-relatorio-" + new Date().toISOString().slice(0, 10) + ".pdf");
  };

  const renderDetails = (row) => {
    const record = row?.record || {};
    return <div className="esr-detail-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <section className="esr-detail-modal" role="dialog" aria-modal="true" aria-label="Detalhes do registro">
        <header><div><span className="esr-eyebrow">DETALHES DO REGISTRO</span><h2>{row.name}</h2></div><button className="esr-icon-button" onClick={() => setSelected(null)} aria-label="Fechar"><X size={19} /></button></header>
        <div className="esr-detail-meta"><span>{row.type === "empresa" ? "Empresa" : row.type === "funcionario" ? "Funcionário" : "Histórico de auditoria"}</span><span>{statusLabel(row.status)}</span><span>{formatDate(row.created_at)}</span></div>
        <div className="esr-json-grid">{Object.entries(record).map(([key, value]) => <div className="esr-json-item" key={key}><span>{key.replace(/_/g, " ")}</span><strong>{typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : clean(value)}</strong></div>)}</div>
        <footer><button className="esr-button esr-button-secondary" onClick={() => downloadBlob(JSON.stringify(record, null, 2), "application/json;charset=utf-8;", "empresa-segura-" + row.type + "-" + String(row.id).slice(0, 8) + ".json")}><Download size={15} /> Exportar registro JSON</button><button className="esr-button esr-button-primary" onClick={() => setSelected(null)}>Fechar</button></footer>
      </section>
    </div>;
  };

  return <main className="esr-page">
    <header className="esr-topbar">
      <div className="esr-heading"><div className="esr-brand-icon"><ShieldCheck size={23} /></div><div><span className="esr-eyebrow">CENTRAL ENAT HSI / EMPRESA SEGURA</span><h1>Relatórios e cadastros</h1><p>Consulta centralizada de empresas, funcionários, vínculos e histórico administrativo.</p></div></div>
      <Link className="esr-back" to="/empresa-segura-admin"><ArrowLeft size={16} /> Voltar à administração</Link>
    </header>
    {errors.length > 0 && <div className="esr-alert"><AlertTriangle size={18} /><div><strong>Algumas consultas não foram concluídas.</strong><p>{errors.join(" · ")}</p><small>Verifique as permissões RLS do Supabase para o perfil administrativo. Os dados disponíveis continuam exibidos abaixo.</small></div></div>}
    <section className="esr-metrics">
      <article className="esr-metric"><span className="esr-metric-icon"><Building2 size={19} /></span><div><strong>{loading ? "…" : counts.companies}</strong><span>Empresas cadastradas</span></div></article>
      <article className="esr-metric"><span className="esr-metric-icon"><UsersRound size={19} /></span><div><strong>{loading ? "…" : counts.employees}</strong><span>Funcionários / perfis vinculados</span></div></article>
      <article className="esr-metric"><span className="esr-metric-icon esr-warning"><Clock3 size={19} /></span><div><strong>{loading ? "…" : counts.pending}</strong><span>Cadastros pendentes</span></div></article>
      <article className="esr-metric"><span className="esr-metric-icon"><History size={19} /></span><div><strong>{loading ? "…" : counts.history}</strong><span>Eventos de auditoria</span></div></article>
    </section>
    <section className="esr-panel">
      <div className="esr-panel-heading"><div><span className="esr-eyebrow">CONSULTA DE DADOS REAIS</span><h2>Relatório integrado</h2><p>Os resultados são carregados diretamente das tabelas Empresa Segura no Supabase.</p></div><button className="esr-button esr-button-secondary" onClick={() => loadData(true)} disabled={loading || refreshing}><RefreshCw size={15} className={refreshing ? "esr-spin" : ""} /> {refreshing ? "Atualizando…" : "Atualizar dados"}</button></div>
      <div className="esr-tabs" role="tablist" aria-label="Tipo de registro">
        {[["todos", "Todos", null], ["empresa", "Empresas", Building2], ["funcionario", "Funcionários", UsersRound], ["historico", "Histórico", History]].map(([value, label, Icon]) => <button key={value} role="tab" aria-selected={activeType === value} className={activeType === value ? "active" : ""} onClick={() => setActiveType(value)}>{Icon && <Icon size={16} />}{label}</button>)}
      </div>
      <div className="esr-filters">
        <label className="esr-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, CNPJ, usuário, empresa ou ação…" /></label>
        <label><span>Situação</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="todas">Todas</option><option value="pending">Pendente</option><option value="approved">Aprovado</option><option value="rejected">Rejeitado</option><option value="suspended">Suspenso</option><option value="active">Ativo</option><option value="registered">Registrado (auditoria)</option></select></label>
        <label><span>Período</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="todos">Todo o período</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="ano">Ano atual</option></select></label>
      </div>
      <div className="esr-results-bar"><span>{loading ? "Carregando registros…" : rows.length + " registro(s) encontrados"}</span><div><button className="esr-button esr-button-secondary" onClick={exportCsv} disabled={loading || rows.length === 0}><FileSpreadsheet size={15} /> Exportar Excel (CSV)</button><button className="esr-button esr-button-primary" onClick={exportPdf} disabled={loading || rows.length === 0}><FileText size={15} /> Exportar PDF</button></div></div>
      <div className="esr-table-wrap"><table className="esr-table"><thead><tr><th>Tipo</th><th>Nome / Ação</th><th>Situação</th><th>Data</th><th>Resumo</th><th aria-label="Ações"></th></tr></thead><tbody>
        {!loading && rows.length === 0 && <tr><td colSpan="6" className="esr-empty"><CheckCircle2 size={23} /><strong>Nenhum registro encontrado</strong><span>Altere os filtros ou atualize os dados para consultar novamente.</span></td></tr>}
        {rows.map((row) => <tr key={row.type + "-" + row.id}><td><span className={"esr-type esr-type-" + row.type}>{row.type === "empresa" ? <><Building2 size={14} /> Empresa</> : row.type === "funcionario" ? <><UsersRound size={14} /> Funcionário</> : <><History size={14} /> Histórico</>}</span></td><td><strong className="esr-record-name">{row.name}</strong><small className="esr-record-id">{row.type === "empresa" ? "CNPJ: " + clean(row.record.cnpj) : row.type === "funcionario" ? "Conta: " + row.id : "Tabela: " + clean(row.record.table_name)}</small></td><td><span className={"esr-status esr-status-" + String(row.status || "").toLowerCase()}>{statusLabel(row.status)}</span></td><td className="esr-date">{formatDate(row.created_at)}</td><td className="esr-summary">{row.subtitle || "—"}</td><td><button className="esr-icon-button" title="Ver detalhes completos" aria-label={"Ver detalhes: " + row.name} onClick={() => setSelected(row)}><Eye size={17} /></button></td></tr>)}
      </tbody></table></div>
      <div className="esr-panel-footer"><span>Fonte: Supabase · Empresa Segura</span><span>{lastUpdated ? "Última consulta: " + formatDate(lastUpdated) : "Aguardando consulta"}</span></div>
    </section>
    <footer className="esr-footer"><span>ENAT HSI · EMPRESA SEGURA</span><span>Dados restritos à administração autorizada</span></footer>
    {selected && renderDetails(selected)}
  </main>;
}

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./ENATTVAdmin.css";

const STATUS = {
  new: "Recebido",
  review: "Em análise",
  approved: "Aprovado",
  published: "Publicado",
  archived: "Arquivado",
};

const STATUS_ORDER = ["new", "review", "approved", "published", "archived"];

function messageText(row) {
  return row?.content || row?.message || row?.summary || "";
}

function subject(row) {
  return row?.subject || row?.title || "Pauta ENAT TV";
}

export function ENATTVAdmin() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    setMessage("");
    if (!supabase) {
      setMessage("Supabase não está configurado neste ambiente.");
      return;
    }
    let request = supabase
      .from("enat_public_inbox")
      .select("*")
      .eq("kind", "tv_submission")
      .order("created_at", { ascending: false });
    if (filter !== "all") request = request.eq("status", filter);
    const { data, error } = await request;
    if (error) setMessage(error.message || "Não foi possível carregar a caixa editorial.");
    else setRows(data || []);
  };

  useEffect(() => { load(); }, [filter]);

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => [row.name, row.email, row.subject, row.title, messageText(row)].filter(Boolean).join(" ").toLowerCase().includes(needle));
  }, [rows, query]);

  const counts = useMemo(() => STATUS_ORDER.reduce((acc, status) => {
    acc[status] = rows.filter((row) => (row.status || "new") === status).length;
    return acc;
  }, { total: rows.length }), [rows]);

  const updateStatus = async (id, status) => {
    setBusy(true);
    setMessage("");
    const { error } = await supabase.from("enat_public_inbox").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) setMessage(error.message || "Não foi possível atualizar o status.");
    else {
      setRows((old) => old.map((row) => row.id === id ? { ...row, status } : row));
      setSelected((old) => old?.id === id ? { ...old, status } : old);
    }
    setBusy(false);
  };

  return (
    <main className="tv-admin">
      <section className="tv-admin-shell">
        <div className="tv-admin-head">
          <div>
            <span>ENAT TV · CENTRAL EDITORIAL</span>
            <h1>Redação e Publicação</h1>
            <p>Caixa de entrada para receber pautas, contatos e anexos; analisar o material e encaminhar conteúdos para publicação.</p>
          </div>
          <div className="tv-admin-actions">
            <a href="/tv" target="_blank" rel="noreferrer">📺 Abrir ENAT TV</a>
            <button onClick={load} disabled={busy}>↻ Atualizar</button>
          </div>
        </div>

        <div className="tv-admin-cards">
          <article><small>TOTAL</small><strong>{counts.total}</strong></article>
          <article><small>RECEBIDOS</small><strong>{counts.new || 0}</strong></article>
          <article><small>EM ANÁLISE</small><strong>{counts.review || 0}</strong></article>
          <article><small>APROVADOS</small><strong>{counts.approved || 0}</strong></article>
          <article><small>PUBLICADOS</small><strong>{counts.published || 0}</strong></article>
        </div>

        <div className="tv-admin-toolbar">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, e-mail, pauta ou conteúdo…" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todos os status</option>
            {STATUS_ORDER.map((key) => <option key={key} value={key}>{STATUS[key]}</option>)}
          </select>
        </div>

        {message && <div className="tv-admin-message">{message}</div>}

        <div className="tv-admin-list">
          {visibleRows.map((row) => (
            <button key={row.id} className="tv-admin-row" onClick={() => setSelected(row)}>
              <div>
                <b>{subject(row)}</b>
                <p>{row.name || "Sem nome"} · {row.email || "sem e-mail"}</p>
                <small>{row.created_at ? new Date(row.created_at).toLocaleString("pt-BR") : "Data não informada"}</small>
              </div>
              <span className={`tv-status status-${row.status || "new"}`}>{STATUS[row.status || "new"] || row.status}</span>
            </button>
          ))}
          {!visibleRows.length && <div className="tv-admin-empty">Nenhuma pauta ENAT TV encontrada.</div>}
        </div>
      </section>

      {selected && (
        <div className="tv-modal" onClick={() => setSelected(null)}>
          <section className="tv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="tv-modal-head">
              <div><span>PAUTA RECEBIDA</span><h2>{subject(selected)}</h2></div>
              <button onClick={() => setSelected(null)}>Fechar</button>
            </div>
            <div className="tv-meta"><b>Remetente</b><span>{selected.name || "—"}</span><b>E-mail</b><span>{selected.email || "—"}</span><b>Recebido</b><span>{selected.created_at ? new Date(selected.created_at).toLocaleString("pt-BR") : "—"}</span></div>
            <h3>Conteúdo</h3>
            <p className="tv-content">{messageText(selected) || "Sem conteúdo informado."}</p>
            {Array.isArray(selected.attachments) && selected.attachments.length > 0 && <div><h3>📎 Anexos</h3><div className="tv-attachments">{selected.attachments.map((file, index) => <div key={file.path || index}>📄 {file.name || `Arquivo ${index + 1}`}</div>)}</div></div>}
            <div className="tv-workflow">
              <b>Fluxo editorial</b>
              <div>{STATUS_ORDER.map((status) => <button key={status} disabled={busy || selected.status === status} className={selected.status === status ? "active" : ""} onClick={() => updateStatus(selected.id, status)}>{STATUS[status]}</button>)}</div>
            </div>
            <p className="tv-note">A aprovação/publicação acima altera o status da pauta na caixa editorial. A publicação audiovisual final depende da inclusão do vídeo, imagem e demais metadados no canal de distribuição escolhido pela ENAT.</p>
          </section>
        </div>
      )}
    </main>
  );
}

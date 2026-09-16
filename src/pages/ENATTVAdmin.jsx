import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import "./ENATTVAdmin.css";

const STATUS = {
  new: "Recebido",
  review: "Em análise",
  approved: "Aprovado",
  published: "Publicado",
  archived: "Arquivado",
};

const STATUS_ORDER = ["new", "review", "approved", "published", "archived"];
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);

function messageText(row) {
  return row?.content || row?.message || row?.summary || "";
}

function subject(row) {
  return row?.subject || row?.title || "Pauta ENAT TV";
}

function isVideo(file) {
  const type = String(file?.type || "").toLowerCase();
  const name = String(file?.name || "").toLowerCase();
  const ext = name.includes(".") ? name.split(".").pop() : "";
  return type.startsWith("video/") || VIDEO_EXTENSIONS.has(ext);
}

export function ENATTVAdmin() {
  const { session } = useAuth();
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState(null);
  const [attachmentBusy, setAttachmentBusy] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

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
    if (!supabase) return;
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

  const openEditor = (row) => {
    setEditor({
      title: subject(row),
      summary: row.summary || messageText(row).slice(0, 240),
      content: messageText(row),
      category: row.category || "ENAT TV",
      image_url: row.image_url || "",
      featured: false,
    });
    setMessage("");
  };

  const publishSelected = async () => {
    if (!selected || !editor || selected.status !== "approved") {
      setMessage("A pauta precisa estar aprovada antes da publicação.");
      return;
    }
    if (!session?.access_token) {
      setMessage("Sessão administrativa não encontrada.");
      return;
    }
    setBusy(true);
    setMessage("Publicando na ENAT TV…");
    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${baseUrl}/functions/v1/manage-public-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: "create_editorial",
          editorial: {
            kind: "article",
            title: editor.title,
            summary: editor.summary,
            content: editor.content,
            category: editor.category,
            image_url: editor.image_url || null,
            featured: Boolean(editor.featured),
            published: true,
            author_name: selected.name || "ENAT TV",
            tags: ["ENAT TV"],
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.error) throw new Error(result.error || "Não foi possível publicar o conteúdo.");
      await updateStatus(selected.id, "published");
      setMessage("Conteúdo publicado na ENAT TV e pauta marcada como publicada.");
      setEditor(null);
    } catch (error) {
      setMessage(error.message || "Falha na publicação.");
    } finally {
      setBusy(false);
    }
  };

  const openAttachment = async (file) => {
    if (!session?.access_token || !file?.path) return;
    setAttachmentBusy(file.path);
    setMessage("");
    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${baseUrl}/functions/v1/enat-public-inbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: "attachment_url", path: file.path }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.error || !result.url) throw new Error(result.error || "Não foi possível abrir o anexo.");

      if (isVideo(file)) {
        setVideoPreview({ name: file.name || "Vídeo ENAT TV", url: result.url });
      } else {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setMessage(error.message || "Falha ao abrir o anexo.");
    } finally {
      setAttachmentBusy(null);
    }
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
            <button key={row.id} className="tv-admin-row" onClick={() => { setSelected(row); setEditor(null); setVideoPreview(null); }}>
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
              <button onClick={() => { setSelected(null); setVideoPreview(null); }}>Fechar</button>
            </div>
            <div className="tv-meta"><b>Remetente</b><span>{selected.name || "—"}</span><b>E-mail</b><span>{selected.email || "—"}</span><b>Recebido</b><span>{selected.created_at ? new Date(selected.created_at).toLocaleString("pt-BR") : "—"}</span></div>
            <h3>Conteúdo recebido</h3>
            <p className="tv-content">{messageText(selected) || "Sem conteúdo informado."}</p>

            {videoPreview && (
              <div className="tv-video-preview">
                <div className="tv-video-preview-head">
                  <h3>🎬 Pré-visualização</h3>
                  <button type="button" onClick={() => setVideoPreview(null)}>Fechar vídeo</button>
                </div>
                <p>{videoPreview.name}</p>
                <video
                  controls
                  playsInline
                  preload="metadata"
                  src={videoPreview.url}
                  style={{ width: "100%", maxHeight: "520px", borderRadius: "12px", background: "#000" }}
                >
                  Seu navegador não conseguiu reproduzir este vídeo.
                </video>
              </div>
            )}

            {Array.isArray(selected.attachments) && selected.attachments.length > 0 && <div><h3>📎 Anexos</h3><div className="tv-attachments">{selected.attachments.map((file, index) => <div key={file.path || index}> {isVideo(file) ? "🎬" : "📄"} {file.name || `Arquivo ${index + 1}`} <button type="button" onClick={() => openAttachment(file)} disabled={attachmentBusy === file.path}>{attachmentBusy === file.path ? "Abrindo…" : isVideo(file) ? "Pré-visualizar" : "Abrir"}</button></div>)}</div></div>}

            <div className="tv-workflow">
              <b>Fluxo editorial</b>
              <div>{STATUS_ORDER.map((status) => <button key={status} disabled={busy || selected.status === status} className={selected.status === status ? "active" : ""} onClick={() => updateStatus(selected.id, status)}>{STATUS[status]}</button>)}</div>
            </div>

            {selected.status === "approved" && !editor && <button className="tv-admin-publish" disabled={busy} onClick={() => openEditor(selected)}>✍️ Preparar publicação</button>}

            {editor && <div className="tv-publish-editor">
              <h3>Publicar na ENAT TV</h3>
              <label>Título<input value={editor.title} onChange={(e) => setEditor({ ...editor, title: e.target.value })} /></label>
              <label>Resumo<textarea rows="3" value={editor.summary} onChange={(e) => setEditor({ ...editor, summary: e.target.value })} /></label>
              <label>Conteúdo<textarea rows="9" value={editor.content} onChange={(e) => setEditor({ ...editor, content: e.target.value })} /></label>
              <label>Categoria<input value={editor.category} onChange={(e) => setEditor({ ...editor, category: e.target.value })} /></label>
              <label>Imagem de capa (URL, opcional)<input value={editor.image_url} onChange={(e) => setEditor({ ...editor, image_url: e.target.value })} /></label>
              <label><input type="checkbox" checked={editor.featured} onChange={(e) => setEditor({ ...editor, featured: e.target.checked })} /> Destacar publicação</label>
              <div className="tv-admin-publish-actions"><button type="button" onClick={() => setEditor(null)} disabled={busy}>Cancelar</button><button type="button" className="tv-admin-publish" onClick={publishSelected} disabled={busy || !editor.title.trim() || !editor.content.trim()}>{busy ? "Publicando…" : "📺 Publicar na ENAT TV"}</button></div>
            </div>}

            <p className="tv-note">A publicação editorial é registrada no banco público da ENAT e a pauta passa para “Publicado”. Vídeos, transmissões ao vivo e arquivos de mídia pesada continuam dependendo do canal audiovisual escolhido pela ENAT.</p>
          </section>
        </div>
      )}
    </main>
  );
}

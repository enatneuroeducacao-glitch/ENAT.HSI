import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const labels = {
  interest: "Interesse",
  article_submission: "Artigo enviado",
  news_submission: "Notícia enviada",
  contact: "Contato",
};
const statuses = ["new", "review", "contacted", "approved", "published", "rejected", "archived"];
const inboxUrl = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enat-public-inbox`
  : "";

const cmsCall = async (action, payload = {}) => {
  const { data, error } = await supabase.functions.invoke("manage-public-content", {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message || "Falha na operação.");
  if (data?.error) throw new Error(data.error);
  return data;
};

const emptyContent = {
  content_type: "block",
  section_key: "home.extra",
  title: "",
  subtitle: "",
  body: "",
  image_url: "",
  link_url: "",
  button_label: "",
  metadata: "{}",
  sort_order: 100,
  published: true,
};

const emptyEditorial = {
  kind: "article",
  title: "",
  slug: "",
  summary: "",
  content: "",
  author_name: "",
  author_bio: "",
  category: "",
  image_url: "",
  tags: "",
  published: true,
  featured: false,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 7,
  border: "1px solid #31506b",
  background: "#081622",
  color: "#e6f1fa",
};
const labelStyle = { display: "grid", gap: 6, fontSize: 13, color: "#b9c9d6" };
const buttonStyle = {
  padding: "9px 12px",
  borderRadius: 6,
  border: "1px solid #31506b",
  background: "#14283b",
  color: "#dbe8f2",
};

function ContentEditor({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(
    editing
      ? { ...editing, metadata: JSON.stringify(editing.metadata || {}, null, 2) }
      : { ...emptyContent }
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      let metadata = {};
      try {
        metadata = JSON.parse(form.metadata || "{}");
      } catch {
        throw new Error("O campo Metadata precisa conter um JSON válido.");
      }
      const data = await cmsCall(editing ? "update" : "create", {
        id: editing?.id,
        content: { ...form, metadata },
      });
      setMsg("Salvo com sucesso.");
      onSaved(data.content);
    } catch (error) {
      setMsg(error.message || "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 13, background: "#0d1b29", border: "1px solid #31506b", borderRadius: 12, padding: 22 }}>
      <h2 style={{ margin: 0 }}>{editing ? "Editar conteúdo" : "Novo conteúdo"}</h2>
      <p style={{ margin: 0, color: "#8fa5b5", fontSize: 13 }}>
        Edite textos, títulos, links, imagens, ordem e visibilidade sem alterar código.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
        <label style={labelStyle}>Tipo
          <select value={form.content_type} onChange={(e) => set("content_type", e.target.value)} style={inputStyle}>
            <option value="block">block</option><option value="hero">hero</option><option value="hero_card">hero_card</option><option value="section">section</option><option value="card">card</option><option value="form">form</option><option value="menu">menu</option><option value="footer">footer</option><option value="settings">settings</option>
          </select>
        </label>
        <label style={labelStyle}>Identificador / seção *<input required value={form.section_key || ""} onChange={(e) => set("section_key", e.target.value)} style={inputStyle} /></label>
        <label style={labelStyle}>Título<input value={form.title || ""} onChange={(e) => set("title", e.target.value)} style={inputStyle} /></label>
        <label style={labelStyle}>Subtítulo<input value={form.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} style={inputStyle} /></label>
        <label style={labelStyle}>Ordem<input type="number" value={form.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} style={inputStyle} /></label>
        <label style={labelStyle}>Imagem (URL)<input value={form.image_url || ""} onChange={(e) => set("image_url", e.target.value)} style={inputStyle} /></label>
        <label style={labelStyle}>Link<input value={form.link_url || ""} onChange={(e) => set("link_url", e.target.value)} style={inputStyle} /></label>
        <label style={labelStyle}>Texto do botão<input value={form.button_label || ""} onChange={(e) => set("button_label", e.target.value)} style={inputStyle} /></label>
      </div>
      <label style={labelStyle}>Texto / conteúdo<textarea rows={8} value={form.body || ""} onChange={(e) => set("body", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} /></label>
      <label style={labelStyle}>Metadata avançado (JSON)<textarea rows={5} value={form.metadata || "{}"} onChange={(e) => set("metadata", e.target.value)} style={{ ...inputStyle, fontFamily: "monospace", resize: "vertical" }} /></label>
      <label style={{ display: "flex", gap: 8, alignItems: "center", color: "#d9e8f2" }}>
        <input type="checkbox" checked={form.published !== false} onChange={(e) => set("published", e.target.checked)} /> Publicado no site
      </label>
      {msg && <div style={{ padding: 10, background: "#14283b", border: "1px solid #31506b" }}>{msg}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={busy} style={{ ...buttonStyle, background: "#82c8f7", color: "#07111b", fontWeight: 800 }}>{busy ? "Salvando…" : "Salvar"}</button>
        <button type="button" onClick={onCancel} style={buttonStyle}>Cancelar</button>
      </div>
    </form>
  );
}

function EditorialEditor({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(
    editing ? { ...editing, tags: Array.isArray(editing.tags) ? editing.tags.join(", ") : "" } : { ...emptyEditorial }
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await cmsCall(editing ? "update_editorial" : "create_editorial", {
        id: editing?.id,
        editorial: {
          ...form,
          tags: String(form.tags || "").split(",").map((x) => x.trim()).filter(Boolean),
        },
      });
      setMsg("Publicação salva.");
      onSaved(data.editorial);
    } catch (error) {
      setMsg(error.message || "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 13, background: "#0d1b29", border: "1px solid #31506b", borderRadius: 12, padding: 22 }}>
      <h2 style={{ margin: 0 }}>{editing ? "Editar publicação" : "Nova publicação"}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
        <label style={labelStyle}>Tipo<select value={form.kind} onChange={(e) => set("kind", e.target.value)} style={inputStyle}><option value="article">Artigo</option><option value="news">Notícia</option></select></label>
        <label style={labelStyle}>Categoria<input value={form.category || ""} onChange={(e) => set("category", e.target.value)} style={inputStyle} /></label>
        <label style={labelStyle}>Título *<input required value={form.title || ""} onChange={(e) => set("title", e.target.value)} style={inputStyle} /></label>
        <label style={labelStyle}>Autor<input value={form.author_name || ""} onChange={(e) => set("author_name", e.target.value)} style={inputStyle} /></label>
        <label style={labelStyle}>Imagem (URL)<input value={form.image_url || ""} onChange={(e) => set("image_url", e.target.value)} style={inputStyle} /></label>
        <label style={labelStyle}>Tags<input value={form.tags || ""} onChange={(e) => set("tags", e.target.value)} style={inputStyle} /></label>
      </div>
      <label style={labelStyle}>Resumo<textarea rows={4} value={form.summary || ""} onChange={(e) => set("summary", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} /></label>
      <label style={labelStyle}>Conteúdo *<textarea required rows={14} value={form.content || ""} onChange={(e) => set("content", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} /></label>
      <label style={labelStyle}>Biografia do autor<textarea rows={3} value={form.author_bio || ""} onChange={(e) => set("author_bio", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} /></label>
      <div style={{ display: "flex", gap: 18 }}>
        <label><input type="checkbox" checked={form.published !== false} onChange={(e) => set("published", e.target.checked)} /> Publicado</label>
        <label><input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} /> Destaque</label>
      </div>
      {msg && <div style={{ padding: 10, background: "#14283b", border: "1px solid #31506b" }}>{msg}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={busy} style={{ ...buttonStyle, background: "#82c8f7", color: "#07111b", fontWeight: 800 }}>{busy ? "Salvando…" : "Salvar"}</button>
        <button type="button" onClick={onCancel} style={buttonStyle}>Cancelar</button>
      </div>
    </form>
  );
}

function CmsPanel() {
  const [items, setItems] = useState([]);
  const [editorial, setEditorial] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editingEditorial, setEditingEditorial] = useState(null);
  const [view, setView] = useState("content");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [a, b] = await Promise.all([cmsCall("list"), cmsCall("list_editorial")]);
      setItems(a.content || []);
      setEditorial(b.editorial || []);
    } catch (error) {
      setMsg(error.message || "Falha ao carregar o CMS.");
    }
  };
  useEffect(() => { load(); }, []);

  const saveItem = (item) => {
    setItems((old) => old.some((x) => x.id === item.id) ? old.map((x) => x.id === item.id ? item : x) : [item, ...old]);
    setEditing(null);
  };
  const remove = async (id) => {
    if (!window.confirm("Remover este conteúdo do portal?")) return;
    setBusy(true);
    try { await cmsCall("delete", { id }); setItems((old) => old.filter((x) => x.id !== id)); }
    catch (error) { setMsg(error.message); }
    finally { setBusy(false); }
  };
  const toggle = async (item) => {
    try { const data = await cmsCall("toggle", { id: item.id, published: !item.published }); setItems((old) => old.map((x) => x.id === item.id ? data.content : x)); }
    catch (error) { setMsg(error.message); }
  };
  const saveEd = (item) => {
    setEditorial((old) => old.some((x) => x.id === item.id) ? old.map((x) => x.id === item.id ? item : x) : [item, ...old]);
    setEditingEditorial(null);
  };
  const removeEd = async (id) => {
    if (!window.confirm("Excluir esta publicação do portal?")) return;
    try { await cmsCall("delete_editorial", { id }); setEditorial((old) => old.filter((x) => x.id !== id)); }
    catch (error) { setMsg(error.message); }
  };
  const toggleEd = async (item) => {
    try { const data = await cmsCall("toggle_editorial", { id: item.id, published: !item.published }); setEditorial((old) => old.map((x) => x.id === item.id ? data.editorial : x)); }
    catch (error) { setMsg(error.message); }
  };

  if (editing || editingEditorial) {
    return (
      <div>
        {editing && <ContentEditor editing={editing} onSaved={saveItem} onCancel={() => setEditing(null)} />}
        {editingEditorial && <EditorialEditor editing={editingEditorial} onSaved={saveEd} onCancel={() => setEditingEditorial(null)} />}
      </div>
    );
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <button onClick={() => setView("content")} style={buttonStyle}>🧩 Blocos da página</button>
        <button onClick={() => setView("editorial")} style={buttonStyle}>📰 Artigos & Notícias</button>
        <button onClick={() => setView("help")} style={buttonStyle}>❓ Como editar</button>
      </div>
      {msg && <div style={{ marginBottom: 14, padding: 11, background: "#14283b", border: "1px solid #31506b" }}>{msg}</div>}

      {view === "content" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div><h2 style={{ margin: "0 0 5px" }}>Conteúdo da página pública</h2><p style={{ margin: 0, color: "#8fa5b5" }}>Edite textos, títulos, links, imagens, ordem e visibilidade.</p></div>
            <button onClick={() => setEditing({ ...emptyContent })} style={{ ...buttonStyle, background: "#55c58a", color: "#07111b", fontWeight: 800 }}>+ Novo conteúdo</button>
          </div>
          <div style={{ display: "grid", gap: 9 }}>
            {items.map((item) => (
              <div key={item.id} style={{ padding: 15, border: "1px solid #203b52", borderRadius: 9, background: "#0d1b29", display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div><strong>{item.title || "(sem título)"}</strong><div style={{ fontSize: 12, color: "#7890a4", marginTop: 4 }}>{item.section_key} · {item.content_type} · ordem {item.sort_order}</div></div>
                  <span style={{ color: item.published ? "#55c58a" : "#e58d8d" }}>{item.published ? "PUBLICADO" : "OCULTO"}</span>
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  <button onClick={() => setEditing(item)} style={buttonStyle}>Editar</button>
                  <button onClick={() => toggle(item)} style={buttonStyle}>{item.published ? "Ocultar" : "Publicar"}</button>
                  <button disabled={busy} onClick={() => remove(item.id)} style={{ ...buttonStyle, borderColor: "#754848", background: "#24171b", color: "#ffb4b4" }}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "editorial" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div><h2 style={{ margin: "0 0 5px" }}>Artigos & Notícias</h2><p style={{ margin: 0, color: "#8fa5b5" }}>Crie, altere, publique, oculte ou remova publicações.</p></div>
            <button onClick={() => setEditingEditorial({ ...emptyEditorial })} style={{ ...buttonStyle, background: "#55c58a", color: "#07111b", fontWeight: 800 }}>+ Nova publicação</button>
          </div>
          <div style={{ display: "grid", gap: 9 }}>
            {editorial.map((item) => (
              <div key={item.id} style={{ padding: 15, border: "1px solid #203b52", borderRadius: 9, background: "#0d1b29" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div><strong>{item.title}</strong><div style={{ fontSize: 12, color: "#7890a4", marginTop: 4 }}>{item.kind === "news" ? "NOTÍCIA" : "ARTIGO"} · {item.author_name || "ENAT"} · {item.category || "sem categoria"}</div></div>
                  <span style={{ color: item.published ? "#55c58a" : "#e58d8d" }}>{item.published ? "PUBLICADO" : "OCULTO"}</span>
                </div>
                <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
                  <button onClick={() => setEditingEditorial(item)} style={buttonStyle}>Editar</button>
                  <button onClick={() => toggleEd(item)} style={buttonStyle}>{item.published ? "Ocultar" : "Publicar"}</button>
                  <button onClick={() => removeEd(item.id)} style={{ ...buttonStyle, borderColor: "#754848", background: "#24171b", color: "#ffb4b4" }}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "help" && (
        <div style={{ padding: 22, border: "1px solid #31506b", borderRadius: 10, background: "#0d1b29", lineHeight: 1.7, color: "#b9c9d6" }}>
          <h2 style={{ color: "#e6f1fa", marginTop: 0 }}>Você passa a ter autonomia sobre o site</h2>
          <p><b>Blocos da página:</b> altere título, texto, subtítulo, imagem, link, botão, ordem e publicação.</p>
          <p><b>Artigos & Notícias:</b> crie e gerencie publicações editoriais sem editar código.</p>
          <p><b>Cursos:</b> continuam sendo administrados pelo Banco de Cursos.</p>
        </div>
      )}
    </section>
  );
}

export function CaixaEntradaPublicaENAT() {
  const [tab, setTab] = useState("cms");
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    let query = supabase.from("enat_public_inbox").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("kind", filter);
    const { data, error } = await query;
    if (error) setMsg(error.message); else setRows(data || []);
  };
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    setBusy(true);
    const { error } = await supabase.from("enat_public_inbox").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) setMsg(error.message); else { await load(); setSelected((old) => old ? { ...old, status } : old); }
    setBusy(false);
  };

  const openAttachment = async (path) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Sessão administrativa expirada.");
      const response = await fetch(inboxUrl, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: "attachment_url", path }) });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Não foi possível abrir o documento.");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (error) { setMsg(error.message); }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#07111b", color: "#e6f1fa", padding: "105px 28px 50px", fontFamily: "Arial,sans-serif" }}>
      <div style={{ maxWidth: 1250, margin: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div><div style={{ color: "#82c8f7", fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>CENTRAL ENAT HSI</div><h1 style={{ margin: "8px 0" }}>Portal público — administração</h1><p style={{ color: "#9db1c1" }}>Gerencie o conteúdo do site.</p></div>
          <button onClick={() => { window.location.href = "/portal"; }} style={buttonStyle}>🌐 Ver site público</button>
        </div>
        <div style={{ display: "flex", gap: 8, margin: "22px 0", flexWrap: "wrap" }}>
          <button onClick={() => setTab("cms")} style={buttonStyle}>🧩 Editor do site</button>
          <button onClick={() => setTab("inbox")} style={buttonStyle}>📨 Caixa de entrada</button>
        </div>
        {tab === "cms" ? <CmsPanel /> : (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: 11, borderRadius: 7 }}>
                <option value="all">Todos</option>
                {Object.entries(labels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
              </select>
            </div>
            {msg && <div style={{ margin: "18px 0", padding: 12, background: "#14283b", border: "1px solid #31506b" }}>{msg}</div>}
            <div style={{ display: "grid", gap: 10 }}>
              {rows.map((row) => (
                <button key={row.id} onClick={() => setSelected(row)} style={{ textAlign: "left", padding: 18, borderRadius: 9, border: "1px solid #203b52", background: "#0d1b29", color: "#e6f1fa", cursor: "pointer" }}>
                  <strong>{row.title || row.subject || row.name}</strong>
                  <div style={{ color: "#9db1c1", marginTop: 6 }}>{row.name} · {row.email || "sem e-mail"}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#7890a4" }}>Status: {row.status}</div>
                </button>
              ))}
              {!rows.length && <div style={{ padding: 35, textAlign: "center", border: "1px dashed #31506b", color: "#91a5b5" }}>Nenhum envio encontrado.</div>}
            </div>
          </>
        )}
        {selected && (
          <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "grid", placeItems: "center", padding: 20, zIndex: 50 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#0d1b29", border: "1px solid #31506b", borderRadius: 12, maxWidth: 800, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 28 }}>
              <button onClick={() => setSelected(null)} style={{ ...buttonStyle, float: "right" }}>Fechar</button>
              <h2>{selected.title || selected.subject || selected.name}</h2>
              <p><strong>Nome:</strong> {selected.name}</p><p><strong>E-mail:</strong> {selected.email || "—"}</p><p><strong>WhatsApp:</strong> {selected.phone || "—"}</p>
              {selected.summary && <><h3>Resumo</h3><p style={{ whiteSpace: "pre-wrap" }}>{selected.summary}</p></>}
              {selected.content && <><h3>Conteúdo</h3><p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selected.content}</p></>}
              {Array.isArray(selected.attachments) && selected.attachments.length > 0 && <section><h3>📎 Documentos anexados</h3>{selected.attachments.map((a, i) => <button key={a.path || i} type="button" onClick={() => openAttachment(a.path)} disabled={busy} style={{ ...buttonStyle, display: "block", width: "100%", marginBottom: 8, textAlign: "left" }}>📄 {a.name || `Documento ${i + 1}`}</button>)}</section>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>{statuses.map((status) => <button key={status} disabled={busy} onClick={() => updateStatus(selected.id, status)} style={buttonStyle}>{status}</button>)}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

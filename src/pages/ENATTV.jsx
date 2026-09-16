import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BrandingENAT } from "../components/BrandingENAT";
import { supabase } from "../lib/supabaseClient";
import "./ENATTV.css";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "odt", "txt", "rtf", "md", "jpg", "jpeg", "png", "mp4", "webm", "mov"]);
const PROGRAMS = [
  { key: "ENAT TV Ao Vivo", icon: "🔴", description: "Transmissões especiais, eventos e programas ao vivo." },
  { key: "ENAT Ciência", icon: "🧠", description: "Neurociência e evidências aplicadas à segurança viária." },
  { key: "ENAT Entrevistas", icon: "🎙️", description: "Conversas com profissionais, pesquisadores e especialistas." },
  { key: "ENAT Formação", icon: "🎓", description: "Conteúdos educacionais para instrutores e profissionais." },
  { key: "NeuroTrânsito", icon: "🚦", description: "Comportamento, percepção de risco e tomada de decisão." },
  { key: "ENAT Play", icon: "📺", description: "Biblioteca de vídeos para assistir sob demanda." },
];

export function ENATTV() {
  const navigate = useNavigate(); const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("categoria") || "";
  const selectedContentId = searchParams.get("conteudo") || "";
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" }); const [files, setFiles] = useState([]); const [consent, setConsent] = useState(false); const [status, setStatus] = useState(""); const [sending, setSending] = useState(false); const [editorial, setEditorial] = useState([]); const [mediaUrls, setMediaUrls] = useState({});

  useEffect(() => {
    const loadEditorial = async () => {
      if (!supabase) return;
      const { data } = await supabase.from("enat_public_editorial").select("id,title,summary,content,category,image_url,tags,featured,published,published_at").eq("published", true).order("featured", { ascending: false }).order("published_at", { ascending: false });
      const rows = data || []; setEditorial(rows);
      const mediaRows = rows.filter((item) => Array.isArray(item.tags) && item.tags.some((tag) => String(tag).startsWith("submission:")));
      if (!mediaRows.length) return;
      const results = await Promise.all(mediaRows.map(async (item) => {
        try { const baseUrl = import.meta.env.VITE_SUPABASE_URL; const response = await fetch(`${baseUrl}/functions/v1/enat-public-inbox`, { method: "POST", headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ action: "published_media_url", id: item.id }) }); const result = await response.json().catch(() => ({})); return response.ok && result?.ok ? [item.id, result] : null; } catch { return null; }
      }));
      setMediaUrls(Object.fromEntries(results.filter(Boolean)));
    };
    loadEditorial();
  }, []);

  const filteredEditorial = useMemo(() => selectedCategory ? editorial.filter((item) => String(item.category || "").toLowerCase() === selectedCategory.toLowerCase()) : editorial, [editorial, selectedCategory]);
  const selectedContent = useMemo(() => filteredEditorial.find((item) => item.id === selectedContentId) || null, [filteredEditorial, selectedContentId]);
  const sidebarArticles = useMemo(() => filteredEditorial.filter((item) => !mediaUrls[item.id]?.type?.startsWith("video/")), [filteredEditorial, mediaUrls]);
  const mainMedia = useMemo(() => filteredEditorial.filter((item) => mediaUrls[item.id]?.type?.startsWith("video/")), [filteredEditorial, mediaUrls]);
  const handleFiles = (event) => { const selected = Array.from(event.target.files || []); const invalidType = selected.find((file) => !ALLOWED_EXTENSIONS.has(file.name.split(".").pop()?.toLowerCase() || "")); if (invalidType) { setFiles([]); setStatus(`Formato não permitido: ${invalidType.name}.`); event.target.value = ""; return; } const oversized = selected.find((file) => file.size > MAX_FILE_SIZE); if (oversized) { setFiles([]); setStatus(`O arquivo ${oversized.name} excede o limite de 15 MB.`); event.target.value = ""; return; } if (selected.length > 5) { setFiles([]); setStatus("É permitido anexar no máximo 5 arquivos."); event.target.value = ""; return; } setFiles(selected); setStatus(""); };
  const submit = async (event) => { event.preventDefault(); if (!consent) { setStatus("É necessário concordar com o uso dos dados para análise e contato sobre esta submissão."); return; } if (!supabase) { setStatus("Canal de recebimento não configurado."); return; } setSending(true); setStatus("Enviando material…"); try { const data = new FormData(); Object.entries({ ...form, kind: "tv_submission", consent: "true" }).forEach(([key, value]) => data.append(key, value)); files.forEach((file) => data.append("files", file, file.name)); const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enat-public-inbox`; const response = await fetch(endpoint, { method: "POST", headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: data }); const result = await response.json().catch(() => ({})); if (!response.ok || !result?.ok) throw new Error(result?.error || `Falha no recebimento (HTTP ${response.status}).`); setForm({ name: "", email: "", subject: "", message: "" }); setFiles([]); setConsent(false); setStatus("Material recebido. A equipe editorial da ENAT TV fará a análise."); } catch (error) { setStatus(error.message || "Falha no envio."); } finally { setSending(false); } };

  return <main className="enat-tv-page">
    <section className="enat-tv-hero"><div className="enat-tv-brand"><BrandingENAT variant="header" /></div><span className="enat-tv-eyebrow">ENAT TV</span><h1>Neurociência, educação e segurança no trânsito.</h1><p>O espaço audiovisual do ENAT para entrevistas, aulas, ciência, eventos, notícias e conteúdos sobre comportamento humano no trânsito.</p><div className="enat-tv-actions"><button className="enat-tv-primary" onClick={() => navigate("/portal")}>Voltar ao Portal ENAT</button><span className="enat-tv-status">● Em implantação</span></div></section>
    <section className="enat-tv-grid" aria-label="Programação da ENAT TV">{PROGRAMS.map((program) => <Link key={program.key} to={`/tv?categoria=${encodeURIComponent(program.key)}`} style={{ textDecoration: "none", color: "inherit" }} aria-label={`Abrir ${program.key}`}><article><span>{program.icon}</span><h2>{program.key}</h2><p>{program.description}</p><small>Ver conteúdos →</small></article></Link>)}</section>
    <section className="enat-tv-editorial" aria-labelledby="tv-editorial-title"><div className="enat-tv-editorial-heading"><span className="enat-tv-eyebrow">PUBLICAÇÕES</span><h2 id="tv-editorial-title">{selectedCategory ? `Conteúdos: ${selectedCategory}` : "Conteúdos publicados pela redação"}</h2><p>Materiais aprovados e publicados pela Central Editorial da ENAT TV.</p>{selectedCategory && <Link to="/tv">← Ver todas as publicações</Link>}</div>
      <div className="enat-tv-editorial-layout">
        <aside className="enat-tv-sidebar" aria-label="Menu de publicações"> <div className="enat-tv-sidebar-title">📚 Publicações</div>{sidebarArticles.length ? sidebarArticles.map((item) => <Link key={item.id} className={`enat-tv-sidebar-link ${selectedContentId === item.id ? "active" : ""}`} to={`/tv?${selectedCategory ? `categoria=${encodeURIComponent(selectedCategory)}&` : ""}conteudo=${encodeURIComponent(item.id)}`}>{item.title}</Link>) : <span className="enat-tv-sidebar-empty">Nenhum artigo publicado nesta categoria.</span>}</aside>
        <div className="enat-tv-editorial-main">
          {selectedContent ? <article className="enat-tv-article-view">{selectedContent.image_url && <img src={selectedContent.image_url} alt="" loading="lazy" />}{selectedContent.category && <span className="enat-tv-eyebrow">{selectedContent.category}</span>}<h3>{selectedContent.title}</h3>{selectedContent.summary && <p className="enat-tv-article-summary">{selectedContent.summary}</p>}<div className="enat-tv-article-content">{selectedContent.content}</div><small>{selectedContent.published_at ? new Date(selectedContent.published_at).toLocaleDateString("pt-BR") : "Publicado pela ENAT TV"}</small></article> : mainMedia.map((item) => { const media = mediaUrls[item.id]; return <article key={item.id} className="enat-tv-editorial-card">{item.image_url && <img src={item.image_url} alt="" loading="lazy" />}<video controls playsInline preload="metadata" src={media.url} style={{ width: "100%", maxHeight: "420px", borderRadius: "12px", background: "#000" }}>Seu navegador não conseguiu reproduzir este vídeo.</video><div>{item.category && <span className="enat-tv-eyebrow">{item.category}</span>}<h3>{item.title}</h3>{item.summary && <p>{item.summary}</p>}<small>{item.published_at ? new Date(item.published_at).toLocaleDateString("pt-BR") : "Publicado pela ENAT TV"}</small></div></article>; })}
          {!selectedContent && !mainMedia.length && <div className="enat-tv-empty">{selectedCategory ? "Ainda não há vídeos nesta categoria." : "As primeiras publicações audiovisuais da ENAT TV aparecerão aqui após a aprovação editorial."}</div>}
          {selectedContent && <Link className="enat-tv-back-link" to={`/tv${selectedCategory ? `?categoria=${encodeURIComponent(selectedCategory)}` : ""}`}>← Voltar aos vídeos</Link>}
        </div>
      </div>
    </section>
    <section className="enat-tv-submission" aria-labelledby="tv-submission-title"><div><span className="enat-tv-eyebrow">PARTICIPE</span><h2 id="tv-submission-title">Envie uma pauta ou material para a ENAT TV</h2><p>Sugira entrevistas, notícias, eventos, pesquisas, vídeos ou materiais educacionais. O conteúdo será recebido pela central editorial para análise e eventual publicação.</p></div><form onSubmit={submit} className="enat-tv-form"><input required placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input required type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required placeholder="Assunto / pauta" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /><textarea required rows="7" placeholder="Descreva a pauta ou material" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /><label className="enat-tv-file">📎 Anexar arquivos <input type="file" multiple onChange={handleFiles} /></label>{files.length > 0 && <small>{files.length} arquivo(s) selecionado(s)</small>}<label className="enat-tv-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /> Concordo com o uso dos dados informados para análise e contato sobre esta submissão.</label><button className="enat-tv-primary" disabled={sending} type="submit">{sending ? "Enviando…" : "Enviar para a redação"}</button>{status && <p role="status" className="enat-tv-form-status">{status}</p>}</form></section>
  </main>;
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandingENAT } from "../components/BrandingENAT";
import { supabase } from "../lib/supabaseClient";
import "./ENATTV.css";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "odt", "txt", "rtf", "md", "jpg", "jpeg", "png", "mp4", "webm", "mov"]);

export function ENATTV() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [files, setFiles] = useState([]);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [editorial, setEditorial] = useState([]);

  useEffect(() => {
    const loadEditorial = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from("enat_public_editorial")
        .select("id,title,summary,content,category,image_url,tags,featured,published,published_at")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false });
      if (data) setEditorial(data);
    };
    loadEditorial();
  }, []);

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const invalidType = selected.find((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      return !ALLOWED_EXTENSIONS.has(ext);
    });
    if (invalidType) {
      setFiles([]);
      setStatus(`Formato não permitido: ${invalidType.name}.`);
      event.target.value = "";
      return;
    }
    const oversized = selected.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setFiles([]);
      setStatus(`O arquivo ${oversized.name} excede o limite de 15 MB.`);
      event.target.value = "";
      return;
    }
    if (selected.length > 5) {
      setFiles([]);
      setStatus("É permitido anexar no máximo 5 arquivos.");
      event.target.value = "";
      return;
    }
    setFiles(selected);
    setStatus("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!consent) {
      setStatus("É necessário concordar com o uso dos dados para análise e contato sobre esta submissão.");
      return;
    }
    if (!supabase) {
      setStatus("Canal de recebimento não configurado.");
      return;
    }
    setSending(true);
    setStatus("Enviando material…");
    try {
      const data = new FormData();
      Object.entries({ ...form, kind: "tv_submission", consent: "true" }).forEach(([key, value]) => data.append(key, value));
      files.forEach((file) => data.append("files", file, file.name));

      const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enat-public-inbox`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: data,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || `Falha no recebimento (HTTP ${response.status}).`);
      }

      setForm({ name: "", email: "", subject: "", message: "" });
      setFiles([]);
      setConsent(false);
      setStatus("Material recebido. A equipe editorial da ENAT TV fará a análise.");
    } catch (error) {
      setStatus(error.message || "Falha no envio.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="enat-tv-page">
      <section className="enat-tv-hero">
        <div className="enat-tv-brand"><BrandingENAT variant="header" /></div>
        <span className="enat-tv-eyebrow">ENAT TV</span>
        <h1>Neurociência, educação e segurança no trânsito.</h1>
        <p>O espaço audiovisual do ENAT para entrevistas, aulas, ciência, eventos, notícias e conteúdos sobre comportamento humano no trânsito.</p>
        <div className="enat-tv-actions">
          <button className="enat-tv-primary" onClick={() => navigate("/portal")}>Voltar ao Portal ENAT</button>
          <span className="enat-tv-status">● Em implantação</span>
        </div>
      </section>

      <section className="enat-tv-grid" aria-label="Programação da ENAT TV">
        <article><span>🔴</span><h2>ENAT TV Ao Vivo</h2><p>Transmissões especiais, eventos e programas ao vivo.</p></article>
        <article><span>🧠</span><h2>ENAT Ciência</h2><p>Neurociência e evidências aplicadas à segurança viária.</p></article>
        <article><span>🎙️</span><h2>ENAT Entrevistas</h2><p>Conversas com profissionais, pesquisadores e especialistas.</p></article>
        <article><span>🎓</span><h2>ENAT Formação</h2><p>Conteúdos educacionais para instrutores e profissionais.</p></article>
        <article><span>🚦</span><h2>NeuroTrânsito</h2><p>Comportamento, percepção de risco e tomada de decisão.</p></article>
        <article><span>📺</span><h2>ENAT Play</h2><p>Biblioteca de vídeos para assistir sob demanda.</p></article>
      </section>

      <section className="enat-tv-editorial" aria-labelledby="tv-editorial-title">
        <div>
          <span className="enat-tv-eyebrow">PUBLICAÇÕES</span>
          <h2 id="tv-editorial-title">Conteúdos publicados pela redação</h2>
          <p>Materiais aprovados e publicados pela Central Editorial da ENAT TV.</p>
        </div>
        <div className="enat-tv-editorial-list">
          {editorial.map((item) => (
            <article key={item.id} className="enat-tv-editorial-card">
              {item.image_url && <img src={item.image_url} alt="" loading="lazy" />}
              <div>
                {item.category && <span className="enat-tv-eyebrow">{item.category}</span>}
                <h3>{item.title}</h3>
                {item.summary && <p>{item.summary}</p>}
                <small>{item.published_at ? new Date(item.published_at).toLocaleDateString("pt-BR") : "Publicado pela ENAT TV"}</small>
              </div>
            </article>
          ))}
          {!editorial.length && <div className="enat-tv-empty">As primeiras publicações da ENAT TV aparecerão aqui após a aprovação editorial.</div>}
        </div>
      </section>

      <section className="enat-tv-submission" aria-labelledby="tv-submission-title">
        <div>
          <span className="enat-tv-eyebrow">PARTICIPE</span>
          <h2 id="tv-submission-title">Envie uma pauta ou material para a ENAT TV</h2>
          <p>Sugira entrevistas, notícias, eventos, pesquisas, vídeos ou materiais educacionais. O conteúdo será recebido pela central editorial para análise e eventual publicação.</p>
        </div>
        <form onSubmit={submit} className="enat-tv-form">
          <input required placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required placeholder="Assunto / pauta" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <textarea required rows="7" placeholder="Descreva a pauta ou material" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <label className="enat-tv-file">📎 Anexar arquivos <input type="file" multiple onChange={handleFiles} /></label>
          {files.length > 0 && <small>{files.length} arquivo(s) selecionado(s)</small>}
          <label className="enat-tv-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required /> Concordo com o uso dos dados informados para análise e contato sobre esta submissão.</label>
          <button className="enat-tv-primary" disabled={sending} type="submit">{sending ? "Enviando…" : "Enviar para a redação"}</button>
          {status && <p role="status" className="enat-tv-form-status">{status}</p>}
        </form>
      </section>
    </main>
  );
}

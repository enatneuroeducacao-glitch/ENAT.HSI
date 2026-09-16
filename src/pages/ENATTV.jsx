import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandingENAT } from "../components/BrandingENAT";
import "./ENATTV.css";

export function ENATTV() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus("Enviando material…");
    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!baseUrl) throw new Error("Canal de recebimento não configurado.");
      const data = new FormData();
      Object.entries({ ...form, kind: "tv_submission" }).forEach(([key, value]) => data.append(key, value));
      files.forEach((file) => data.append("files", file, file.name));
      const response = await fetch(`${baseUrl}/functions/v1/enat-public-inbox`, { method: "POST", body: data });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.error) throw new Error(result.error || "Não foi possível enviar o material.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setFiles([]);
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
          <label className="enat-tv-file">📎 Anexar arquivos <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} /></label>
          {files.length > 0 && <small>{files.length} arquivo(s) selecionado(s)</small>}
          <button className="enat-tv-primary" disabled={sending} type="submit">{sending ? "Enviando…" : "Enviar para a redação"}</button>
          {status && <p role="status" className="enat-tv-form-status">{status}</p>}
        </form>
      </section>
    </main>
  );
}

import { useNavigate } from "react-router-dom";
import { BrandingENAT } from "../components/BrandingENAT";
import "./ENATTV.css";

export function ENATTV() {
  const navigate = useNavigate();

  return (
    <main className="enat-tv-page">
      <section className="enat-tv-hero">
        <div className="enat-tv-brand"><BrandingENAT variant="header" /></div>
        <span className="enat-tv-eyebrow">ENAT TV</span>
        <h1>Neurociência, educação e segurança no trânsito.</h1>
        <p>
          O novo espaço audiovisual do ENAT para entrevistas, aulas, ciência,
          eventos, notícias e conteúdos sobre comportamento humano no trânsito.
        </p>
        <div className="enat-tv-actions">
          <button className="enat-tv-primary" onClick={() => navigate("/portal")}>
            Voltar ao Portal ENAT
          </button>
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
    </main>
  );
}

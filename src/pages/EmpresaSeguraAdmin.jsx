import React from "react";
import { useAuth } from "../context/AuthContext";
import "./EmpresaSeguraAdmin.css";

const BASE = "https://empresa-segura-enat.onrender.com";

const modules = [
  {
    group: "Pessoas e organizações",
    title: "Funcionários e profissionais ENAT",
    description: "Consultar contas cadastradas, atribuir perfil, ativar ou bloquear acesso e definir o ambiente autorizado para cada usuário.",
    icon: "👥",
    action: "Gerenciar usuários e acessos",
    href: `${BASE}/admin/empresa-segura/funcionarios`,
  },
  {
    group: "Pessoas e organizações",
    title: "Empresas e vínculos organizacionais",
    description: "Administrar o vínculo do usuário com a organização, o identificador empresarial e o tipo de acesso ao portal.",
    icon: "🏢",
    action: "Gerenciar vínculos empresariais",
    href: `${BASE}/admin/empresa-segura/empresas`,
  },
  {
    group: "Conteúdo e instrumentos",
    title: "Setores, funções e avaliações",
    description: "Acessar o catálogo administrativo da Empresa Segura para gerir os elementos disponíveis no ambiente empresarial.",
    icon: "🧩",
    action: "Abrir catálogo administrativo",
    href: `${BASE}/admin/empresa-segura/catalogo`,
  },
  {
    group: "Homologação ENAT",
    title: "Resultados e publicações",
    description: "Registrar e liberar resultados para a empresa identificada. A publicação deve ocorrer somente após revisão do ENAT.",
    icon: "📊",
    action: "Revisar e liberar resultados",
    href: `${BASE}/admin/empresa-segura/resultados`,
  },
  {
    group: "Homologação ENAT",
    title: "Ambiente interno de testes",
    description: "Abrir o ambiente profissional para executar testes e homologar instrumentos sem confundir testes internos com resultados empresariais liberados.",
    icon: "🧪",
    action: "Abrir ambiente profissional",
    href: `${BASE}/empresa-segura?entrar=1&perfil=profissionais`,
  },
  {
    group: "Acesso externo",
    title: "Portal da empresa",
    description: "Conferir a experiência empresarial. Cada conta deve consultar apenas os resultados liberados para a própria organização.",
    icon: "🔐",
    action: "Abrir portal empresarial",
    href: `${BASE}/empresa-segura?entrar=1&perfil=empresa`,
  },
];

export function EmpresaSeguraAdmin() {
  const { profile } = useAuth();
  if (profile?.role !== "admin") {
    return <main className="esa-page"><section className="esa-denied"><span>🔒</span><h1>Acesso restrito</h1><p>Esta central está disponível somente para administradores do Portal ENAT HSI.</p><a href="/dashboard-enat">Voltar ao Dashboard ENAT</a></section></main>;
  }

  return <main className="esa-page">
    <header className="esa-header">
      <div><span className="esa-eyebrow">CENTRAL ENAT HSI · ADMINISTRAÇÃO DE PLATAFORMAS</span><h1>Empresa Segura</h1><p>Controle institucional dos profissionais, empresas, instrumentos e resultados submetidos à governança do ENAT.</p></div>
      <a className="esa-back" href="/dashboard-enat">← Dashboard ENAT</a>
    </header>
    <section className="esa-notice"><span>🛡️</span><div><strong>Governança e segregação de acesso</strong><p>Os ambientes de homologação interna e consulta empresarial permanecem separados. O acesso empresarial deve ser habilitado individualmente e vinculado à organização correta. Somente resultados formalmente liberados devem aparecer no portal da empresa.</p></div></section>
    <div className="esa-section-heading"><div><span>CONTROLES ADMINISTRATIVOS</span><h2>Gestão da Empresa Segura</h2></div><span className="esa-count">6 áreas de controle</span></div>
    <section className="esa-grid">
      {modules.map((item) => <article className="esa-card" key={item.title}>
        <div className="esa-card-top"><span className="esa-icon">{item.icon}</span><span className="esa-group">{item.group}</span></div>
        <h3>{item.title}</h3><p>{item.description}</p>
        <a href={item.href} target="_blank" rel="noreferrer">{item.action}<span aria-hidden="true"> ↗</span></a>
      </article>)}
    </section>
    <footer className="esa-footer">Ações operacionais abrem o módulo seguro da Empresa Segura, que valida novamente a sessão e as permissões. A central HSI não substitui essas verificações.</footer>
  </main>;
}

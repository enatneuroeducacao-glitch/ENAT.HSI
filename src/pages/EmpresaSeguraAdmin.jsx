import React from "react";
import { useAuth } from "../context/AuthContext";
import "./EmpresaSeguraAdmin.css";

const BASE = "https://empresa-segura-enat.onrender.com";

const modules = [
  {
    group: "Preparação empresarial",
    title: "Preparar uso da Empresa Segura",
    description: "Preencher os dados iniciais da organização, setores, público e avaliações de interesse. A solicitação será analisada pelo ENAT antes de qualquer ativação.",
    icon: "📝",
    action: "Abrir formulário de preparação",
    href: `${BASE}/empresa-segura/preparacao`,
  },
  {
    group: "Pessoas e organizações",
    title: "Funcionários e profissionais ENAT",
    description: "Gerenciar solicitações e acessos já cadastrados, atribuir perfil e ambiente autorizado. Este módulo administrativo exige sessão segura própria.",
    icon: "👥",
    action: "Gerenciar usuários e acessos",
    href: `${BASE}/admin/empresa-segura/funcionarios`,
  },
  {
    group: "Pessoas e organizações",
    title: "Empresas e vínculos organizacionais",
    description: "Cadastrar a organização após validação, administrar o vínculo dos usuários e definir somente as avaliações negociadas e autorizadas.",
    icon: "🏢",
    action: "Gerenciar empresas e vínculos",
    href: `${BASE}/admin/empresa-segura/empresas`,
  },
  {
    group: "Preparação empresarial",
    title: "Solicitações de preparação",
    description: "Consultar os formulários enviados pelas empresas, revisar os dados e encaminhar as próximas etapas de cadastro e negociação.",
    icon: "📋",
    action: "Revisar solicitações recebidas",
    href: `${BASE}/admin/empresa-segura/preparacoes`,
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
    title: "Revisão de testes internos",
    description: "Consultar sessões demonstrativas registradas pelos profissionais ENAT e registrar a revisão institucional sem publicar automaticamente resultados empresariais.",
    icon: "🧾",
    action: "Revisar sessões submetidas",
    href: `${BASE}/admin/empresa-segura/testes`,
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
    <section className="esa-notice"><span>🛡️</span><div><strong>Governança e segregação de acesso</strong><p>Comece pelo formulário de preparação empresarial. O ENAT revisa os dados, confirma a negociação e autoriza os instrumentos antes de ativar a empresa. Os ambientes internos e empresariais permanecem separados.</p></div></section>
    <div className="esa-section-heading"><div><span>CONTROLES ADMINISTRATIVOS</span><h2>Gestão da Empresa Segura</h2></div><span className="esa-count">9 áreas de controle</span></div>
    <section className="esa-grid">
      {modules.map((item) => <article className="esa-card" key={item.title}>
        <div className="esa-card-top"><span className="esa-icon">{item.icon}</span><span className="esa-group">{item.group}</span></div>
        <h3>{item.title}</h3><p>{item.description}</p>
        <a href={item.href} target="_blank" rel="noreferrer">{item.action}<span aria-hidden="true"> ↗</span></a>
      </article>)}
    </section>
    <footer className="esa-footer">O formulário de preparação registra uma solicitação pendente; não ativa contas nem libera resultados. As ações administrativas protegidas validam novamente a sessão e as permissões.</footer>
  </main>;
}

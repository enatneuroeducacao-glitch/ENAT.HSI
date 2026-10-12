import React from "react";
import { useAuth } from "../context/AuthContext";
import "./EmpresaSeguraAdmin.css";

const BASE = "https://empresa-segura-enat.onrender.com";

const modules = [
  {
    group: "PRIMEIRA ETAPA · EMPRESA",
    title: "Preparar uso da Empresa Segura",
    description: "Este acesso é destinado à própria empresa: o responsável preenche seus dados, informa setores e áreas de interesse e solicita o cadastro. O ENAT recebe o formulário preenchido para preparar o atendimento e analisar os próximos passos.",
    icon: "📝",
    action: "Abrir cadastro da empresa",
    href: `${BASE}/empresa-segura/cadastro?perfil=empresa`,
  },
  {
    group: "ACESSOS EMPRESARIAIS",
    title: "Acessos e gestores das empresas",
    description: "Revisar contas empresariais existentes, vincular cada usuário a uma empresa ativa e definir o perfil de gestor ou participante. Não substitui a análise da solicitação nem a autorização do escopo.",
    icon: "🔑",
    action: "Gerenciar acessos empresariais",
    href: `${BASE}/admin/empresa-segura/acessos-empresariais`,
  },
  {
    group: "PESSOAS E ORGANIZAÇÕES",
    title: "Empresas e vínculos organizacionais",
    description: "Após a análise e a negociação, cadastre a organização, vincule o gestor responsável e marque somente as avaliações efetivamente autorizadas.",
    icon: "🏬",
    action: "Gerenciar empresas e vínculos",
    href: `${BASE}/admin/empresa-segura/empresas`,
  },
  {
    group: "CONTEÚDO E INSTRUMENTOS",
    title: "Setores, funções e avaliações",
    description: "Gerir o catálogo institucional de setores, funções e instrumentos que poderão ser autorizados para cada organização.",
    icon: "🧩",
    action: "Abrir catálogo administrativo",
    href: `${BASE}/admin/empresa-segura/catalogo`,
  },
  {
    group: "HOMOLOGAÇÃO ENAT",
    title: "Solicitações de preparação",
    description: "Consultar as informações enviadas pelas empresas e encaminhar as próximas etapas de validação, negociação e cadastro.",
    icon: "📋",
    action: "Revisar solicitações recebidas",
    href: `${BASE}/admin/empresa-segura/preparacoes`,
  },
  {
    group: "EQUIPE INTERNA ENAT",
    title: "Funcionários e profissionais ENAT",
    description: "Analisar solicitações de profissionais internos, atribuir perfis de trabalho e liberar ou bloquear o acesso ao ambiente de testes e homologação do ENAT.",
    icon: "👥",
    action: "Gerenciar equipe ENAT",
    href: `${BASE}/admin/empresa-segura/profissionais`,
  },
  {
    group: "HOMOLOGAÇÃO ENAT",
    title: "Revisão de testes internos",
    description: "Etapa obrigatória antes da publicação: consultar as sessões submetidas, conferir respostas e registrar a revisão institucional. A revisão não publica resultados automaticamente.",
    icon: "🧾",
    action: "Revisar sessões submetidas",
    href: `${BASE}/admin/empresa-segura/testes`,
  },
  {
    group: "HOMOLOGAÇÃO ENAT",
    title: "Resultados e publicações",
    description: "Após a revisão institucional e a confirmação das autorizações, liberar resultados para a empresa correspondente.",
    icon: "📊",
    action: "Revisar e liberar resultados",
    href: `${BASE}/admin/empresa-segura/resultados`,
  },
  {
    group: "ACESSO AOS AMBIENTES",
    title: "Portal empresarial",
    description: "Acessar a experiência da empresa depois de ativação e criação do gestor autorizado. Cada organização vê apenas os resultados liberados para si.",
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
    <section className="esa-notice"><span>🛡️</span><div><strong>Fluxo correto de preparação</strong><p>O formulário é preenchido pela própria empresa durante o cadastro. O ENAT recebe os dados enviados, analisa a necessidade, prepara o atendimento e só depois confirma o escopo, cadastra a organização e autoriza os acessos.</p></div></section>
    <div className="esa-section-heading"><div><span>CONTROLES ADMINISTRATIVOS</span><h2>Gestão da Empresa Segura</h2></div><span className="esa-count">9 áreas de controle</span></div>
    <section className="esa-grid">
      {modules.map((item) => <article className="esa-card" key={item.title}>
        <div className="esa-card-top"><span className="esa-icon">{item.icon}</span><span className="esa-group">{item.group}</span></div>
        <h3>{item.title}</h3><p>{item.description}</p>
        <a href={item.href} target="_blank" rel="noreferrer">{item.action}<span aria-hidden="true"> ↗</span></a>
      </article>)}
    </section>
    <footer className="esa-footer">O formulário de preparação registra uma solicitação pendente; não ativa contas nem libera resultados. As áreas administrativas protegidas validam novamente a sessão e as permissões.</footer>
  </main>;
}

import React from "react";
import { useAuth } from "../context/AuthContext";
import "./EmpresaSeguraAdmin.css";

const BASE = "https://empresa-segura-enat-portal.onrender.com";

const modules = [
  {
    group: "PAINEL CENTRAL · FILA DE TRABALHO",
    title: "Painel de fluxo e pendências",
    description: "Visão operacional com solicitações empresariais pendentes, pedidos de acesso de funcionários e profissionais e atalhos para executar a próxima ação administrativa. Use este painel para acompanhar o fluxo, não para preencher cadastros novamente.",
    icon: "📊",
    action: "Abrir painel de pendências",
    href: "/caixa-publica",
  },
  {
    group: "ETAPA 1 · ENTRADA DE SOLICITAÇÕES",
    title: "Solicitações de empresas",
    description: "Fila administrativa dos cadastros enviados pelo formulário público. Consulte responsável, CNPJ, contato, número de colaboradores, setores e áreas de interesse; registre a análise sem pedir que a empresa preencha novamente.",
    icon: "📥",
    action: "Analisar solicitações recebidas",
    href: "/caixa-publica",
  },
  {
    group: "ETAPA 1 · ENTRADA DE SOLICITAÇÕES",
    title: "Solicitações de funcionários e profissionais",
    description: "Consulte as contas e solicitações de acesso enviadas por funcionários e profissionais. Confira a empresa declarada, a função e o status antes de autorizar qualquer acesso.",
    icon: "👥",
    action: "Revisar solicitações de pessoas",
    href: "/caixa-publica",
  },
  {
    group: "ETAPA 2 · FLUXO DE TRABALHO",
    title: "Acompanhar solicitações e encaminhamentos",
    description: "Abra a caixa de entrada administrativa para consultar cadastros recebidos, registrar a análise e continuar com uma solicitação aprovada. A configuração da organização deve ser aberta a partir do registro aprovado, com os dados já carregados.",
    icon: "🗂️",
    action: "Abrir caixa de entrada administrativa",
    href: "/caixa-publica",
  },
  {
    group: "ETAPA 3 · AUTORIZAÇÕES",
    title: "Acessos e gestores empresariais",
    description: "Vincule usuários à organização correta, defina gestores e participantes e libere acessos somente depois de confirmar que a empresa está ativa e que o escopo foi autorizado.",
    icon: "🔑",
    action: "Gerenciar gestores e acessos",
    href: "/usuarios",
  },
  {
    group: "ETAPA 3 · AUTORIZAÇÕES",
    title: "Catálogo de setores, funções e avaliações",
    description: "Mantenha o catálogo institucional que será utilizado na configuração das empresas. A existência de um instrumento no catálogo não significa autorização automática para aplicá-lo.",
    icon: "🧩",
    action: "Gerenciar catálogo institucional",
    href: "/configuracao-portal",
  },
  {
    group: "ETAPA 3 · EQUIPE ENAT",
    title: "Equipe interna ENAT",
    description: "Gerencie profissionais internos, perfis de trabalho e permissões para testes e homologação. Esta área é distinta das solicitações de funcionários das empresas clientes.",
    icon: "🛡️",
    action: "Gerenciar equipe interna",
    href: "/usuarios",
  },
  {
    group: "ETAPA 4 · HOMOLOGAÇÃO",
    title: "Revisão de testes internos",
    description: "Revise as sessões submetidas, confira as respostas e registre a decisão institucional. Resultados não devem ser publicados antes da revisão.",
    icon: "🧾",
    action: "Revisar testes submetidos",
    href: "/dashboard-enat",
  },
  {
    group: "ETAPA 5 · PUBLICAÇÃO CONTROLADA",
    title: "Resultados e publicações",
    description: "Publique ou libere resultados somente após a revisão institucional e a confirmação das autorizações aplicáveis à organização.",
    icon: "📊",
    action: "Revisar e liberar resultados",
    href: "/dashboard-enat",
  },
  {
    group: "CONTEÚDO · ADMINISTRAÇÃO",
    title: "Editor dos portais da empresa e do funcionário",
    description: "Edite títulos, textos, seções e conteúdos dos dois portais em espaços separados, com editor visual, pré-visualização, rascunho e publicação controlada.",
    icon: "📝",
    action: "Abrir editor administrativo",
    href: "/empresa-segura-editor",
  },
  {
    group: "ETAPA 6 · ACESSO DA ORGANIZAÇÃO",
    title: "Portal empresarial",
    description: "Acesse a experiência destinada à empresa depois da ativação e da criação do gestor autorizado. O portal empresarial não é uma área de administração do ENAT.",
    icon: "🔐",
    action: "Abrir portal empresarial",
    href: `${BASE}/#participar`,
  },
];

const workflow = [
  { number: "01", title: "Receber", text: "Cadastros de empresas e solicitações de pessoas entram nas filas administrativas." },
  { number: "02", title: "Analisar", text: "O ENAT revisa os dados, registra a decisão e confirma o escopo." },
  { number: "03", title: "Configurar e autorizar", text: "Cadastrar a organização, vincular responsáveis e liberar apenas acessos aprovados." },
  { number: "04", title: "Homologar e publicar", text: "Revisar os testes antes de liberar resultados para a organização correta." },
];

export function EmpresaSeguraAdmin() {
  const { profile } = useAuth();
  if (profile?.role !== "admin") {
    return <main className="esa-page"><section className="esa-denied"><span>🔒</span><h1>Acesso restrito</h1><p>Esta central está disponível somente para administradores do Portal ENAT HSI.</p><a href="/dashboard-enat">Voltar ao Dashboard ENAT</a></section></main>;
  }

  return <main className="esa-page">
    <header className="esa-header">
      <div><span className="esa-eyebrow">CENTRAL ENAT HSI · ADMINISTRAÇÃO DE PLATAFORMAS</span><h1>Empresa Segura</h1><p>Central administrativa para receber solicitações, analisar cadastros, autorizar acessos e conduzir a homologação. Esta área é exclusiva da administração ENAT.</p></div>
      <div className="esa-header-actions"><a className="esa-editor-quick" href="/empresa-segura-editor">✎ Abrir editor de páginas</a><a className="esa-back" href="/dashboard-enat">← Dashboard ENAT</a></div>
    </header>
    <section className="esa-notice"><span>🛡️</span><div><strong>Um fluxo administrativo, sem cadastros duplicados</strong><p>O formulário público alimenta a fila de solicitações empresariais; o cadastro de funcionários e profissionais alimenta a fila de pessoas. A partir dessas filas, o ENAT executa as próximas ações. Nenhum card desta central deve encaminhar o administrador ao formulário público para redigitar dados.</p></div></section>
    <div className="esa-section-heading"><div><span>FLUXO OPERACIONAL</span><h2>Da solicitação à liberação</h2></div></div>
    <section className="esa-grid">
      {workflow.map((step) => <article className="esa-card" key={step.number}>
        <div className="esa-card-top"><span className="esa-icon">{step.number}</span><span className="esa-group">ETAPA DO FLUXO</span></div>
        <h3>{step.title}</h3><p>{step.text}</p>
      </article>)}
    </section>
    <div className="esa-section-heading"><div><span>FILAS E AÇÕES ADMINISTRATIVAS</span><h2>Gestão da Empresa Segura</h2></div><span className="esa-count">11 áreas de controle</span></div>
    <section className="esa-grid">
      {modules.map((item) => <article className="esa-card" key={item.title}>
        <div className="esa-card-top"><span className="esa-icon">{item.icon}</span><span className="esa-group">{item.group}</span></div>
        <h3>{item.title}</h3><p>{item.description}</p>
        <a href={item.href} target="_blank" rel="noreferrer">{item.action}<span aria-hidden="true"> ↗</span></a>
      </article>)}
    </section>
    <footer className="esa-footer">Princípio de governança: solicitação recebida ≠ empresa ativa ≠ acesso autorizado ≠ resultado publicado. Cada transição deve ser registrada na área operacional correspondente.</footer>
  </main>;
}

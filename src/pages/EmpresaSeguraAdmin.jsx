import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ArrowUpRight, Building2, UserRound, PencilLine, Eye, ShieldCheck,
  LayoutDashboard, UsersRound, BookOpenCheck, ChartNoAxesCombined,
  FileText, Settings2, ChevronRight, LockKeyhole, ExternalLink
} from "lucide-react";
import "./EmpresaSeguraAdmin.css";

const PORTAL_BASE = "https://empresa-segura-enat-portal.onrender.com";

const portalContent = {
  empresa: {
    label: "Portal da Empresa",
    eyebrow: "ÁREA INSTITUCIONAL",
    description: "Ambiente destinado aos gestores e responsáveis da organização para acompanhar a participação da empresa no programa Empresa Segura ENAT.",
    url: `${PORTAL_BASE}/#portal-empresa`,
    sections: [
      { icon: LayoutDashboard, title: "Visão geral", description: "Status da organização, etapas de participação e próximos passos." },
      { icon: UsersRound, title: "Equipe e responsabilidades", description: "Organização de responsáveis, setores e participantes autorizados." },
      { icon: ShieldCheck, title: "Ações preventivas", description: "Campanhas, iniciativas educativas e atividades de prevenção." },
      { icon: ChartNoAxesCombined, title: "Indicadores e documentos", description: "Consulta de materiais e indicadores autorizados para a organização." },
    ],
  },
  funcionario: {
    label: "Portal do Funcionário",
    eyebrow: "ÁREA INDIVIDUAL",
    description: "Espaço individual para que cada participante acesse orientações, atividades educativas e informações relacionadas à sua jornada de prevenção.",
    url: `${PORTAL_BASE}/#portal-funcionario`,
    sections: [
      { icon: LayoutDashboard, title: "Meu painel", description: "Atividades disponíveis e próximos passos da participação." },
      { icon: BookOpenCheck, title: "Aprendizagem", description: "Conteúdos educativos e orientações de prevenção." },
      { icon: UsersRound, title: "Atividades e campanhas", description: "Ações preventivas e iniciativas em andamento." },
      { icon: FileText, title: "Meu progresso e documentos", description: "Acompanhamento de atividades e materiais de apoio disponibilizados." },
    ],
  },
};

export function EmpresaSeguraAdmin() {
  const { profile } = useAuth();
  const [activePortal, setActivePortal] = useState("empresa");
  const current = portalContent[activePortal];

  if (profile?.role !== "admin") {
    return (
      <main className="esa-page">
        <section className="esa-denied">
          <LockKeyhole size={30} />
          <h1>Acesso restrito</h1>
          <p>Esta central está disponível somente para administradores do Portal ENAT HSI.</p>
          <a href="/dashboard-enat">Voltar ao Dashboard ENAT</a>
        </section>
      </main>
    );
  }

  return (
    <main className="esa-page">
      <header className="esa-topbar">
        <div className="esa-heading">
          <div className="esa-brand-icon"><ShieldCheck size={23} /></div>
          <div>
            <span className="esa-eyebrow">CENTRAL ENAT HSI <span> / </span> ADMINISTRAÇÃO</span>
            <h1>Empresa Segura</h1>
            <p>Centralize a gestão dos portais da empresa e do funcionário em um único ambiente.</p>
          </div>
        </div>
        <a className="esa-back" href="/dashboard-enat"><ArrowUpRight size={16} /> Dashboard ENAT</a>
      </header>

      <section className="esa-welcome">
        <div className="esa-welcome-copy">
          <span className="esa-kicker">GESTÃO INTEGRADA DE PORTAIS</span>
          <h2>Dois públicos. Uma experiência de segurança.</h2>
          <p>Selecione o ambiente que deseja consultar ou editar. Os conteúdos institucionais são gerenciados separadamente para manter a comunicação adequada a cada público.</p>
        </div>
        <div className="esa-security-note"><ShieldCheck size={18} /><span>Área administrativa protegida</span></div>
      </section>

      <nav className="esa-portal-tabs" aria-label="Selecionar portal">
        <button className={activePortal === "empresa" ? "active" : ""} onClick={() => setActivePortal("empresa")} aria-pressed={activePortal === "empresa"}>
          <Building2 size={19} /><span><strong>Portal da Empresa</strong><small>Gestores e organizações</small></span>
        </button>
        <button className={activePortal === "funcionario" ? "active" : ""} onClick={() => setActivePortal("funcionario")} aria-pressed={activePortal === "funcionario"}>
          <UserRound size={19} /><span><strong>Portal do Funcionário</strong><small>Participantes e colaboradores</small></span>
        </button>
      </nav>

      <section className="esa-portal-view" aria-live="polite">
        <div className="esa-portal-main">
          <div className="esa-portal-title-row">
            <div className="esa-portal-symbol">{activePortal === "empresa" ? <Building2 size={25} /> : <UserRound size={25} />}</div>
            <div>
              <span className="esa-kicker">{current.eyebrow}</span>
              <h2>{current.label}</h2>
            </div>
          </div>
          <p className="esa-portal-description">{current.description}</p>
          <div className="esa-section-list">
            {current.sections.map((item, index) => {
              const Icon = item.icon;
              return (
                <div className="esa-section-row" key={item.title}>
                  <div className="esa-section-icon"><Icon size={18} /></div>
                  <div className="esa-section-copy"><strong>{item.title}</strong><p>{item.description}</p></div>
                  <span className="esa-section-number">{String(index + 1).padStart(2, "0")}</span>
                </div>
              );
            })}
          </div>
          <div className="esa-portal-actions">
            <a className="esa-primary-action" href="/empresa-segura-editor"><PencilLine size={17} /> Editar conteúdo deste portal <ChevronRight size={16} /></a>
            <a className="esa-secondary-action" href={current.url} target="_blank" rel="noreferrer"><Eye size={17} /> Visualizar portal <ExternalLink size={14} /></a>
          </div>
          <p className="esa-action-help"><LockKeyhole size={13} /> A edição exige perfil administrativo. A visualização abre o ambiente correspondente em uma nova aba.</p>
        </div>

        <aside className="esa-portal-aside">
          <div className="esa-aside-heading"><Settings2 size={17} /><span>GESTÃO DO CONTEÚDO</span></div>
          <h3>Publicação e manutenção</h3>
          <p>Use o editor central para atualizar títulos, textos e seções. Empresa e funcionário mantêm conteúdos independentes.</p>
          <a href="/empresa-segura-editor" className="esa-aside-link">Abrir editor completo <ArrowUpRight size={15} /></a>
          <div className="esa-aside-divider" />
          <div className="esa-aside-meta"><span className="esa-meta-dot" /><div><strong>Conteúdo separado por público</strong><small>Alterações em um portal não substituem o outro.</small></div></div>
          <div className="esa-aside-meta"><span className="esa-meta-dot" /><div><strong>Controle de publicação</strong><small>Salve rascunhos e publique pelo editor administrativo.</small></div></div>
        </aside>
      </section>

      <footer className="esa-footer">
        <span>ENAT HSI · EMPRESA SEGURA</span>
        <span>Gestão centralizada · Acesso administrativo</span>
      </footer>
    </main>
  );
}

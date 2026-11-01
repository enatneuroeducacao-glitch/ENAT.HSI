import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, UserRound, Save, Send, Eye, RotateCcw, Bold, Italic, List, Link2, ImagePlus, Type, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import "./EmpresaSeguraEditor.css";

const DEFAULTS = {
  empresa: {
    title: "Portal da Empresa",
    subtitle: "Área de referência para organização, equipe e ações preventivas.",
    heroTitle: "Organize a segurança da sua empresa",
    heroText: "Acompanhe a participação da organização, planeje ações preventivas e fortaleça uma cultura de segurança.",
    sections: [
      { title: "Visão geral", body: "<p>Acompanhe o status da organização, as etapas de participação e os próximos passos.</p>" },
      { title: "Equipe", body: "<p>Organize responsáveis, setores e participantes autorizados da empresa.</p>" },
      { title: "Ações preventivas", body: "<p>Planeje atividades educativas, campanhas e iniciativas de prevenção.</p>" },
      { title: "Indicadores", body: "<p>Acompanhe a evolução das ações e os indicadores autorizados para sua organização.</p>" },
      { title: "Documentos", body: "<p>Consulte materiais e documentos disponibilizados para a organização.</p>" }
    ]
  },
  funcionario: {
    title: "Portal do Funcionário",
    subtitle: "Espaço individual para aprendizagem, participação e acompanhamento de ações preventivas.",
    heroTitle: "Sua participação fortalece a segurança",
    heroText: "Acesse orientações, atividades educativas e informações relacionadas à sua participação no programa Empresa Segura ENAT.",
    sections: [
      { title: "Meu painel", body: "<p>Consulte suas atividades e os próximos passos da sua participação.</p>" },
      { title: "Aprendizagem", body: "<p>Acesse conteúdos educativos e orientações de prevenção disponibilizados pela organização.</p>" },
      { title: "Atividades", body: "<p>Consulte atividades, campanhas e ações preventivas em andamento.</p>" },
      { title: "Meu progresso", body: "<p>Acompanhe a conclusão das atividades e os registros que estiverem disponíveis para você.</p>" },
      { title: "Documentos", body: "<p>Consulte materiais de apoio e documentos disponibilizados para funcionários.</p>" }
    ]
  }
};

const copy = (value) => JSON.parse(JSON.stringify(value));

export function EmpresaSeguraEditor() {
  const { profile } = useAuth();
  const [pageType, setPageType] = useState("empresa");
  const [pages, setPages] = useState(() => copy(DEFAULTS));
  const [activeSection, setActiveSection] = useState(0);
  const [status, setStatus] = useState({ kind: "info", text: "Carregando conteúdo salvo..." });
  const [busy, setBusy] = useState(false);
  const current = pages[pageType];
  const section = current.sections[activeSection];

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!supabase) {
        setStatus({ kind: "error", text: "Supabase não está configurado neste ambiente. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para ativar o salvamento compartilhado." });
        return;
      }
      try {
        const { data, error } = await supabase.from("empresa_segura_pages").select("page_type,content,published,updated_at");
        if (error) throw error;
        if (!alive) return;
        setPages((prev) => {
          const next = copy(prev);
          (data || []).forEach((row) => {
            if (next[row.page_type] && row.content) next[row.page_type] = { ...next[row.page_type], ...row.content, _published: row.published, _updatedAt: row.updated_at };
          });
          return next;
        });
        setStatus({ kind: "success", text: "Conteúdo carregado. Escolha a página e edite os campos necessários." });
      } catch (error) {
        if (!alive) return;
        setStatus({ kind: "error", text: "Não foi possível carregar o conteúdo compartilhado. Verifique se a tabela empresa_segura_pages foi criada e se as permissões estão configuradas." });
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const updateCurrent = (key, value) => setPages((prev) => ({ ...prev, [pageType]: { ...prev[pageType], [key]: value } }));
  const updateSection = (key, value) => {
    const nextSections = current.sections.map((item, index) => index === activeSection ? { ...item, [key]: value } : item);
    updateCurrent("sections", nextSections);
  };

  const runFormat = (command, value) => {
    document.execCommand(command, false, value || undefined);
  };

  const save = async (publish = false) => {
    if (!supabase) {
      setStatus({ kind: "error", text: "Salvamento indisponível: conecte o Supabase e crie a tabela empresa_segura_pages antes de publicar." });
      return;
    }
    setBusy(true);
    try {
      const payload = { ...current };
      delete payload._published;
      delete payload._updatedAt;
      const { error } = await supabase.from("empresa_segura_pages").upsert({
        page_type: pageType,
        content: payload,
        published: publish,
        updated_by: profile?.id || null,
        updated_at: new Date().toISOString()
      }, { onConflict: "page_type" });
      if (error) throw error;
      setPages((prev) => ({ ...prev, [pageType]: { ...prev[pageType], _published: publish, _updatedAt: new Date().toISOString() } }));
      setStatus({ kind: "success", text: publish ? "Página publicada. O conteúdo está marcado como publicado no banco compartilhado." : "Rascunho salvo no banco compartilhado. Ainda não está publicado." });
    } catch (error) {
      setStatus({ kind: "error", text: "Falha ao salvar. Verifique a tabela, as políticas de acesso e se seu usuário tem permissão administrativa." });
    } finally {
      setBusy(false);
    }
  };

  const resetSection = () => {
    const defaults = DEFAULTS[pageType].sections[activeSection];
    updateSection("title", defaults.title);
    updateSection("body", defaults.body);
    setStatus({ kind: "info", text: "Conteúdo desta seção restaurado no editor. Salve para persistir a alteração." });
  };

  if (profile?.role !== "admin") return <main className="ese-page"><section className="ese-denied"><AlertCircle size={32}/><h1>Acesso restrito</h1><p>O editor é exclusivo da administração ENAT.</p><Link to="/empresa-segura-admin">Voltar à central</Link></section></main>;

  return <main className="ese-page">
    <header className="ese-header">
      <div><span className="ese-eyebrow">CENTRAL ENAT · EDITOR DE CONTEÚDO</span><h1>Editor administrativo — Empresa Segura</h1><p>Edite separadamente o portal da empresa e o portal do funcionário. O conteúdo é organizado por seções e não exige edição de JSON.</p></div>
      <Link className="ese-back" to="/empresa-segura-admin"><ArrowLeft size={16}/> Voltar à central</Link>
    </header>
    <div className="ese-notice"><CheckCircle2 size={19}/><div><strong>Ambientes separados</strong><p>As alterações da página da empresa não substituem o conteúdo do funcionário. Salvar rascunho não publica; publicar registra a versão como disponível.</p></div></div>
    <div className="ese-switch" role="tablist" aria-label="Selecionar portal">
      <button className={pageType === "empresa" ? "active" : ""} onClick={() => { setPageType("empresa"); setActiveSection(0); }}><Building2 size={18}/> Página da empresa</button>
      <button className={pageType === "funcionario" ? "active" : ""} onClick={() => { setPageType("funcionario"); setActiveSection(0); }}><UserRound size={18}/> Página do funcionário</button>
    </div>
    <div className="ese-workspace">
      <aside className="ese-sections">
        <div className="ese-sidebar-title">SEÇÕES DA PÁGINA</div>
        {current.sections.map((item, index) => <button key={item.title} className={activeSection === index ? "active" : ""} onClick={() => setActiveSection(index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}</button>)}
        <div className="ese-side-note"><strong>Status</strong><span className={current._published ? "ese-published" : "ese-draft"}>{current._published ? "Publicado" : "Rascunho / não publicado"}</span></div>
      </aside>
      <section className="ese-editor-panel">
        <div className="ese-panel-head"><div><span>EDITANDO · {pageType === "empresa" ? "PORTAL DA EMPRESA" : "PORTAL DO FUNCIONÁRIO"}</span><h2>{section.title}</h2></div><button className="ese-reset" onClick={resetSection}><RotateCcw size={15}/> Restaurar seção</button></div>
        <label className="ese-field"><span>Título principal da página</span><input value={current.title} onChange={(e) => updateCurrent("title", e.target.value)} placeholder="Nome do portal"/></label>
        <label className="ese-field"><span>Descrição curta</span><input value={current.subtitle} onChange={(e) => updateCurrent("subtitle", e.target.value)} placeholder="Descrição exibida no portal"/></label>
        <label className="ese-field"><span>Título de destaque</span><input value={current.heroTitle} onChange={(e) => updateCurrent("heroTitle", e.target.value)} placeholder="Mensagem principal"/></label>
        <label className="ese-field"><span>Texto de apresentação</span><textarea rows={3} value={current.heroText} onChange={(e) => updateCurrent("heroText", e.target.value)} placeholder="Apresentação do portal"/></label>
        <label className="ese-field"><span>Nome da seção selecionada</span><input value={section.title} onChange={(e) => updateSection("title", e.target.value)} placeholder="Nome da seção"/></label>
        <div className="ese-field"><span>Conteúdo da seção · editor de texto</span>
          <div className="ese-toolbar" role="toolbar" aria-label="Formatação de texto">
            <button type="button" onClick={() => runFormat("bold")} title="Negrito"><Bold size={16}/></button>
            <button type="button" onClick={() => runFormat("italic")} title="Itálico"><Italic size={16}/></button>
            <button type="button" onClick={() => runFormat("insertUnorderedList")} title="Lista"><List size={16}/></button>
            <button type="button" onClick={() => { const url = window.prompt("Endereço do link"); if (url) runFormat("createLink", url); }} title="Inserir link"><Link2 size={16}/></button>
            <button type="button" onClick={() => runFormat("formatBlock", "h3")} title="Título"><Type size={16}/></button>
            <button type="button" onClick={() => { const url = window.prompt("URL da imagem"); if (url) runFormat("insertImage", url); }} title="Inserir imagem por URL"><ImagePlus size={16}/></button>
          </div>
          <div className="ese-rich-editor" contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: section.body || "<p></p>" }} onBlur={(e) => updateSection("body", e.currentTarget.innerHTML)} />
          <small>Use a barra de ferramentas para formatar o texto. Imagens podem ser inseridas por URL; anexos de arquivo serão habilitados após a configuração do armazenamento.</small>
        </div>
        <div className="ese-actions"><div className="ese-save-status">{status.kind === "error" ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}<span>{status.text}</span></div><button className="ese-save" disabled={busy} onClick={() => save(false)}><Save size={16}/>{busy ? "Salvando..." : "Salvar rascunho"}</button><button className="ese-publish" disabled={busy} onClick={() => save(true)}><Send size={16}/>{busy ? "Processando..." : "Publicar página"}</button></div>
      </section>
      <aside className="ese-preview">
        <div className="ese-preview-head"><Eye size={16}/> PRÉ-VISUALIZAÇÃO</div>
        <div className="ese-preview-brand">EMPRESA SEGURA <small>ENAT · Neuroeducação aplicada</small></div>
        <div className="ese-preview-hero"><span>{pageType === "empresa" ? "PORTAL DA EMPRESA" : "PORTAL DO FUNCIONÁRIO"}</span><h3>{current.heroTitle}</h3><p>{current.heroText}</p></div>
        <div className="ese-preview-content"><span>SEÇÃO {String(activeSection + 1).padStart(2, "0")}</span><h4>{section.title}</h4><div dangerouslySetInnerHTML={{ __html: section.body || "" }}/></div>
      </aside>
    </div>
    <footer className="ese-footer">Última edição local: {current._updatedAt ? new Date(current._updatedAt).toLocaleString("pt-BR") : "ainda não salva"} · As alterações só serão compartilhadas quando o banco e as políticas estiverem configurados.</footer>
  </main>;
}

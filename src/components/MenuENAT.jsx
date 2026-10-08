import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "../lib/authApi";
import { BrandingENAT } from "./BrandingENAT";
import { useState } from "react";
import "./MenuENAT.css";

const groups = [
  {
    title: "Principal",
    items: [
      ["/dashboard-enat", "📊", "Dashboard"],
    ],
  },
  {
    title: "Gestão acadêmica",
    items: [
      ["/cursos/admin", "📚", "Banco de Cursos"],
      ["/alunos", "👥", "Alunos"],
      ["/docente-enat", "🎓", "Docente ENAT"],
      ["/emissor-certificados", "🖨️", "Emissor de Certificados"],
    ],
  },
  {
    title: "Conteúdo e comunicação",
    items: [
      ["/caixa-publica", "📨", "Caixa Pública"],
      ["/caixa-publica-editor", "📰", "Artigos & Notícias"],
      ["/depoimentos-admin", "💬", "Depoimentos"],
      ["/email-hsi", "📧", "E-mail HSI-DOTH-PG"],
      ["/rede-social-admin", "🌐", "Rede Social"],
    ],
  },
  {
    title: "Plataformas ENAT",
    items: [
      ["/neurodrive", "🧠", "NeuroDrive"],
      ["/tv-admin", "📺", "ENAT TV — Administrativo"],
      ["/tv-rede", "🔴", "ENAT TV — Rede"],
      ...(profile?.role === "admin" ? [["https://siges-escola-segura.vercel.app", "🛡️", "SIGES — Escola Segura"]] : []),
    ],
  },
  {
    title: "Sistema",
    items: [
      ["/configuracao-portal", "⚙️", "Configurações do Portal"],
      ["/recuperacao", "🔑", "Recuperação de Acesso"],
    ],
  },
];

export function MenuENAT() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    await signOut();
    navigate("/portal", { replace: true });
  };

  const closeMobile = () => setMobileOpen(false);
  const link = ({ isActive }) => `enat-admin-link ${isActive ? "active" : ""}`;

  return (
    <>
      <button
        className="enat-admin-mobile-toggle"
        type="button"
        onClick={() => setMobileOpen((value) => !value)}
        aria-label={mobileOpen ? "Fechar menu administrativo" : "Abrir menu administrativo"}
        aria-expanded={mobileOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {mobileOpen && <button className="enat-admin-overlay" type="button" aria-label="Fechar menu" onClick={closeMobile} />}

      <aside className={`enat-admin-menu ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="enat-admin-sidebar">
          <NavLink to="/dashboard-enat" className="enat-admin-brand-link" aria-label="Central ENAT HSI" onClick={closeMobile}>
            <BrandingENAT variant="header" />
          </NavLink>

          <div className="enat-admin-context">
            <span>ADMINISTRAÇÃO</span>
            <strong>Central ENAT HSI</strong>
          </div>

          <nav aria-label="Menu administrativo ENAT">
            {groups.map((group) => (
              <section className="enat-admin-group" key={group.title}>
                <h2>{group.title}</h2>
                {group.items.map(([to, icon, label]) => (
                  <NavLink key={to} to={to} className={link} onClick={closeMobile}>
                    <span className="enat-admin-icon" aria-hidden="true">{icon}</span>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </section>
            ))}

            {profile?.role === "admin" && (
              <section className="enat-admin-group">
                <h2>Administração avançada</h2>
                <NavLink to="/usuarios" className={link} onClick={closeMobile}>
                  <span className="enat-admin-icon" aria-hidden="true">🔐</span>
                  <span>Usuários e permissões</span>
                </NavLink>
              </section>
            )}
          </nav>

          <div className="enat-admin-user">
            <div className="enat-admin-user-info">
              <span className="enat-admin-user-avatar">{(profile?.display_name || profile?.username || "A").slice(0, 1).toUpperCase()}</span>
              <div>
                <strong>{profile?.display_name || profile?.username}</strong>
                <small>{profile?.role === "admin" ? "Administrador" : "Equipe ENAT"}</small>
              </div>
            </div>
            <button type="button" onClick={() => navigate("/portal")}>🌐 Site público</button>
            <button type="button" className="logout" onClick={logout}>Sair</button>
          </div>
        </div>
      </aside>
    </>
  );
}

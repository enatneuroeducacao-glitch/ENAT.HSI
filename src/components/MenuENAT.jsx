import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "../lib/authApi";

export function MenuENAT(){
 const {profile}=useAuth(); const navigate=useNavigate();
 const logout=async()=>{await signOut();navigate("/login",{replace:true});};
 const link=({isActive})=>`enat-admin-link ${isActive?"active":""}`;
 return <header className="enat-admin-menu"><div className="enat-admin-inner"><div className="enat-admin-brand">ENAT <span>HSI</span></div><nav><NavLink to="/cursos/admin" className={link}>📚 Banco de Cursos</NavLink><NavLink to="/alunos" className={link}>👥 Alunos</NavLink><NavLink to="/emissor" className={link}>🖨️ Emissor</NavLink>{profile?.role==="admin"&&<NavLink to="/usuarios" className={link}>🔐 Usuários</NavLink>}</nav><div className="enat-admin-user"><span>{profile?.display_name||profile?.username}</span><button onClick={logout}>Sair</button></div></div></header>;
}

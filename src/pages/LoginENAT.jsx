import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInUsername } from "../lib/authApi";
import { useAuth } from "../context/AuthContext";
import "./LoginENAT.css";

export function LoginENAT(){
 const navigate=useNavigate(); const {session,profile,loading}=useAuth();
 const [username,setUsername]=useState(""); const [password,setPassword]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 useEffect(()=>{ if(!loading&&session&&profile) navigate("/emissor",{replace:true}); },[loading,session,profile,navigate]);
 const submit=async(e)=>{e.preventDefault();setBusy(true);setError("");try{await signInUsername(username,password);navigate("/emissor",{replace:true});}catch(err){setError(err?.message||"Usuário ou senha inválidos.");}finally{setBusy(false)}};
 return <main className="login-page"><section className="login-card"><div className="login-brand">ENAT <span>HSI</span></div><div className="login-lock">🔐</div><h1>Acesso restrito</h1><p className="login-sub">Central ENAT HSI — área administrativa</p><form onSubmit={submit}><label>Usuário<input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" placeholder="Usuário cadastrado" autoFocus/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Senha cadastrada"/></label><button disabled={busy}>{busy?"Validando…":"ENTRAR NA CENTRAL"}</button></form>{error&&<div className="login-error">{error}</div>}<div className="login-note">Acesso exclusivo para usuários autorizados pela administração da Central ENAT HSI.</div><div className="login-public">Validação pública de certificados permanece disponível pelo código de validação.</div></section></main>;
}

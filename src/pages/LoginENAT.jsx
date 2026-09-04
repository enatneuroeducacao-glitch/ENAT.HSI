import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bootstrapAdmin, signInUsername } from "../lib/authApi";
import { useAuth } from "../context/AuthContext";
import "./LoginENAT.css";

export function LoginENAT(){
 const navigate=useNavigate(); const {session,profile,loading}=useAuth();
 const [username,setUsername]=useState(""); const [password,setPassword]=useState(""); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
 useEffect(()=>{ if(!loading&&session&&profile) navigate("/emissor",{replace:true}); },[loading,session,profile,navigate]);
 useEffect(()=>{ bootstrapAdmin().catch(()=>{}); },[]);
 const submit=async(e)=>{e.preventDefault();setBusy(true);setError("");setMessage("");try{await signInUsername(username,password);setMessage("Acesso autorizado. Abrindo a Central…");navigate("/emissor",{replace:true});}catch(err){setError(err?.message||"Usuário ou senha inválidos.");}finally{setBusy(false)}};
 return <main className="login-page"><section className="login-card"><div className="login-brand">ENAT <span>HSI</span></div><div className="login-lock">🔐</div><h1>Acesso restrito</h1><p className="login-sub">Central ENAT HSI — área administrativa</p><form onSubmit={submit}><label>Usuário<input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" placeholder="Usuário" autoFocus/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Senha"/></label><button disabled={busy}>{busy?"Validando…":"ENTRAR NA CENTRAL"}</button></form>{error&&<div className="login-error">{error}</div>}{message&&<div className="login-ok">{message}</div>}<div className="login-note"><strong>Administrador inicial:</strong> usuário <b>admin</b> e senha <b>admin</b>.<br/>Altere a senha imediatamente após o primeiro acesso.</div><div className="login-public">Validação pública de certificados permanece disponível pelo código de validação.</div></section></main>;
}

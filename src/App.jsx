import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MenuENAT } from "./components/MenuENAT";
import { LoginENAT } from "./pages/LoginENAT";
import { PortalPublicoENAT } from "./pages/PortalPublicoENAT";
import { Home } from "./pages/Home";
import { SobreENAT } from "./pages/SobreENAT";
import { ProdutosENAT } from "./pages/ProdutosENAT";
import { ProdutoDetail } from "./pages/ProdutoDetail";
import { CertificacaoENAT } from "./pages/CertificacaoENAT";
import { GovernancaENAT } from "./pages/GovernancaENAT";
import { ContatoENAT } from "./pages/ContatoENAT";
import { ResultadosENAT } from "./pages/ResultadosENAT";
import { CadastroInstrutor } from "./pages/CadastroInstrutor";
import { CadastroAluno } from "./pages/CadastroAluno";
import { CursosENAT } from "./pages/CursosENAT";
import { CursoDetalhado } from "./pages/CursoDetalhado";
import { TestesAvancados } from "./pages/TestesAvancados";
import { TesteAprofundado } from "./pages/TesteAprofundado";
import { Certificados } from "./pages/Certificados";
import { DashboardAluno } from "./pages/DashboardAluno";
import { DashboardENAT } from "./pages/DashboardENAT";
import { RelatorioTurmas } from "./pages/RelatorioTurmas";
import { IndicacoesInstrutor } from "./pages/IndicacoesInstrutor";
import { EmissorCertificadosComBusca } from "./pages/EmissorCertificadosComBusca";
import { DocenteENAT } from "./pages/DocenteENAT";
import { RecuperacaoCentralENATHSI } from "./pages/RecuperacaoCentralENATHSI";
import { ValidarCertificadoPublico } from "./pages/ValidarCertificadoPublico";
import { BancoCursosENAT } from "./pages/BancoCursosENAT";
import { BancoAlunosENAT } from "./pages/BancoAlunosENAT";
import { UsuariosENAT } from "./pages/UsuariosENAT";
import { CaixaEntradaPublicaENAT } from "./pages/CaixaEntradaPublicaENAT";

const isGitHubProjectPages = window.location.hostname.endsWith("github.io") && window.location.pathname.startsWith("/ENAT.HSI");
const APP_BASENAME = isGitHubProjectPages ? "/ENAT.HSI" : "";

function PublicArea(){
  return <Routes><Route path="/" element={<PortalPublicoENAT/>}/><Route path="/portal" element={<PortalPublicoENAT/>}/><Route path="/validar/:code" element={<ValidarCertificadoPublico/>}/><Route path="/login" element={<LoginENAT/>}/></Routes>;
}

function PrivateArea(){
 const {session,profile,loading}=useAuth(); const location=useLocation();
 if(loading)return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#07111b",color:"#63caff",fontFamily:"Arial"}}>Validando autorização…</main>;
 if(!session||!profile)return <Navigate to="/login" replace state={{from:location.pathname}}/>;
 return <><MenuENAT/><Routes>
   <Route path="/dashboard-enat" element={<DashboardENAT/>}/><Route path="/home-admin" element={<Home/>}/><Route path="/sobre" element={<SobreENAT/>}/><Route path="/produtos" element={<ProdutosENAT/>}/><Route path="/produtos/:produto" element={<ProdutoDetail/>}/><Route path="/certificacao" element={<CertificacaoENAT/>}/><Route path="/governanca" element={<GovernancaENAT/>}/><Route path="/contato" element={<ContatoENAT/>}/><Route path="/resultados" element={<ResultadosENAT/>}/><Route path="/cadastro/instrutor" element={<CadastroInstrutor/>}/><Route path="/cadastro/aluno" element={<CadastroAluno/>}/><Route path="/cursos/admin" element={<BancoCursosENAT/>}/><Route path="/cursos" element={<CursosENAT/>}/><Route path="/cursos/:courseId" element={<CursoDetalhado/>}/><Route path="/testes" element={<TestesAvancados/>}/><Route path="/testes/:testId" element={<TesteAprofundado/>}/><Route path="/certificados" element={<Certificados/>}/><Route path="/dashboard" element={<DashboardAluno/>}/><Route path="/relatorio-turmas" element={<RelatorioTurmas/>}/><Route path="/indicacoes" element={<IndicacoesInstrutor/>}/><Route path="/emissor" element={<EmissorCertificadosComBusca/>}/><Route path="/docente-enat" element={<DocenteENAT/>}/><Route path="/recuperacao" element={<RecuperacaoCentralENATHSI/>}/><Route path="/alunos" element={<BancoAlunosENAT/>}/><Route path="/caixa-publica" element={<CaixaEntradaPublicaENAT/>}/><Route path="/usuarios" element={profile.role==="admin"?<UsuariosENAT/>:<Navigate to="/emissor" replace/>}/><Route path="*" element={<Navigate to="/dashboard-enat" replace/>}/>
 </Routes></>;
}

function PublicAdminBridge(){
 useEffect(()=>{const handler=e=>{const el=e.target?.closest?.(".admin-entry,.portal-footer button");if(!el)return;e.preventDefault();const base=window.location.hostname.endsWith("github.io")?"/ENAT.HSI":"";window.location.assign(`${base}/login`)};document.addEventListener("click",handler);return()=>document.removeEventListener("click",handler)},[]);
 return null;
}

export default function CentralENATHSI(){return <BrowserRouter basename={APP_BASENAME}><AuthProvider><PublicAdminBridge/><Routes><Route path="/" element={<PublicArea/>}/><Route path="/portal" element={<PublicArea/>}/><Route path="/login" element={<PublicArea/>}/><Route path="/validar/:code" element={<PublicArea/>}/><Route path="*" element={<PrivateArea/>}/></Routes></AuthProvider></BrowserRouter>;
}

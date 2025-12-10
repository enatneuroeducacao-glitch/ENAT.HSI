import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MenuENAT } from "./components/MenuENAT";
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
import { RelatorioTurmas } from "./pages/RelatorioTurmas";

export default function CentralENATHSI() {
  return (
    <BrowserRouter>
      <MenuENAT />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<SobreENAT />} />
        <Route path="/produtos" element={<ProdutosENAT />} />
        <Route path="/produtos/:produto" element={<ProdutoDetail />} />
        <Route path="/certificacao" element={<CertificacaoENAT />} />
        <Route path="/governanca" element={<GovernancaENAT />} />
        <Route path="/contato" element={<ContatoENAT />} />
        <Route path="/resultados" element={<ResultadosENAT />} />
        <Route path="/cadastro/instrutor" element={<CadastroInstrutor />} />
        <Route path="/cadastro/aluno" element={<CadastroAluno />} />
        <Route path="/cursos" element={<CursosENAT />} />
        <Route path="/cursos/:courseId" element={<CursoDetalhado />} />
        <Route path="/testes" element={<TestesAvancados />} />
        <Route path="/testes/:testId" element={<TesteAprofundado />} />
        <Route path="/certificados" element={<Certificados />} />
          <Route path="/dashboard" element={<DashboardAluno />} />
          <Route path="/relatorio-turmas" element={<RelatorioTurmas />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

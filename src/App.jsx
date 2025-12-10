import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MenuENAT } from "./components/MenuENAT";
import { Home } from "./pages/Home";
import { SobreENAT } from "./pages/SobreENAT";
import { ProdutosENAT } from "./pages/ProdutosENAT";
import { ProdutoDetail } from "./pages/ProdutoDetail";
import { CertificacaoENAT } from "./pages/CertificacaoENAT";
import { GovernancaENAT } from "./pages/GovernancaENAT";
import { ContatoENAT } from "./pages/ContatoENAT";

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
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

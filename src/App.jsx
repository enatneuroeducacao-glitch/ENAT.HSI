import React from "react";

// --- Pages ---
export function SobreENAT() {
  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-4xl font-bold mb-4">Sobre o ENAT HSI</h1>
      <p className="text-gray-700 text-lg max-w-3xl">
        O ENAT HSI é o padrão nacional de segurança instrucional baseado em neurociência aplicada, protocolos
        comportamentais e governança metodológica. Sua Central integra ciência, tecnologia, supervisão e certificação
        para transformar a formação de condutores no Brasil.
      </p>
    </main>
  );
}

export function ProdutosENAT() {
  const produtos = [
    "ENAT OPS – Plataforma Operacional",
    "ENAT GO – Aplicativo de Campo",
    "ENAT MAP – Biofeedback Emocional",
    "ENAT SIM-PRO – Simulador Neuroeducacional",
    "ENAT CERT – Certificação Oficial",
    "ENAT VR – Realidade Virtual Emocional",
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-4xl font-bold mb-6">Produtos ENAT HSI</h1>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        {produtos.map((p, i) => (
          <section key={i} className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">{p}</h2>
            <p className="text-gray-600 mt-2">Descrição mínima do produto {i + 1} — pronto para expansão e customização.</p>
          </section>
        ))}
      </div>
    </main>
  );
}

export function CertificacaoENAT() {
  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-4xl font-bold mb-4">Certificação ENAT HSI</h1>
      <p className="text-gray-700 text-lg max-w-3xl">
        Níveis: Instrutor ENAT (N1), Instrutor Avançado (N2), Master (N3), Supervisor (N4). Requer evidências, auditoria e
        recertificação periódica. Documentos e trilhas são geridos na Central.
      </p>
    </main>
  );
}

export function GovernancaENAT() {
  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-4xl font-bold mb-4">Governança ENAT HSI</h1>
      <p className="text-gray-700 text-lg max-w-3xl">
        A governança é composta por Direção Geral, Comitê Metodológico, Comitê de Ética e Comitê de Segurança Instrucional.
        Todas as alterações na metodologia são aprovadas por esses órgãos.
      </p>
    </main>
  );
}

export function ContatoENAT() {
  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-4xl font-bold mb-4">Contato</h1>
      <p className="text-gray-700 text-lg max-w-3xl mb-4">
        Para parcerias, auditorias e implantação institucional, utilize os canais abaixo.
      </p>
      <address className="not-italic text-gray-800">
        E-mail: <a href="mailto:contato@enat-hsi.org">contato@enat-hsi.org</a>
        <br />
        WhatsApp Institucional: (00) 00000-0000
      </address>
    </main>
  );
}

// --- Simple navigation component ---
function MenuENAT({ onNavigate }) {
  const links = [
    { label: "Início", id: "home" },
    { label: "Sobre", id: "sobre" },
    { label: "Produtos", id: "produtos" },
    { label: "Certificação", id: "certificacao" },
    { label: "Governança", id: "governanca" },
    { label: "Contato", id: "contato" },
  ];

  return (
    <header className="w-full bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">ENAT HSI</div>
        <nav>
          <ul className="flex gap-6">
            {links.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => onNavigate(l.id)}
                  className="text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

// --- Main app component (single-file navigation) ---
export default function CentralENATHSI() {
  const [page, setPage] = React.useState("home");

  function renderPage() {
    switch (page) {
      case "sobre":
        return <SobreENAT />;
      case "produtos":
        return <ProdutosENAT />;
      case "certificacao":
        return <CertificacaoENAT />;
      case "governanca":
        return <GovernancaENAT />;
      case "contato":
        return <ContatoENAT />;
      default:
        return (
          <main className="min-h-screen bg-gray-100 p-10 pt-28">
            <section className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-4">Central ENAT HSI</h1>
              <p className="text-lg text-gray-700">
                O núcleo oficial que integra ciência, tecnologia, supervisão, formação e governança do método ENAT HSI.
              </p>
            </section>

            <section className="max-w-6xl mx-auto py-16 grid md:grid-cols-2 gap-8 mt-12">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold">Sistema Cognitivo-Emocional (SCE)</h2>
                <p className="text-gray-600 mt-2">3-3-3, STOP ENAT, CEA, Mindfulness e ENAT MAP.</p>
              </div>

              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold">Sistema Instrucional e de Supervisão (SIS)</h2>
                <p className="text-gray-600 mt-2">ENAT OPS, ENAT GO, ENAT SIM-PRO e Certificação ENAT CERT.</p>
              </div>

              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold">Sistema de Pesquisa e Validação (SRV)</h2>
                <p className="text-gray-600 mt-2">ENAT LAB, VR e pilotos controlados.</p>
              </div>

              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold">Sistema de Governança e Expansão (SGE)</h2>
                <p className="text-gray-600 mt-2">Licenciamento ENAT-first, auditorias e parcerias institucionais.</p>
              </div>
            </section>
          </main>
        );
    }
  }

  return (
    <div>
      <MenuENAT onNavigate={setPage} />
      <div>{renderPage()}</div>
    </div>
  );
}

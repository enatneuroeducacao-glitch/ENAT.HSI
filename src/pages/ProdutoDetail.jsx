import { useParams } from "react-router-dom";
import { ProdutosENAT } from "./ProdutosENAT";
import { AttentionSimulator } from "../components/AttentionSimulator";
import { ReactionSimulator } from "../components/ReactionSimulator";
import { EmotionalControlSimulator } from "../components/EmotionalControlSimulator";
import { MemorySimulator } from "../components/MemorySimulator";

export function ProdutoOPS() {
  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-3xl font-bold mb-4">ENAT OPS – Plataforma Operacional</h1>
      <p className="text-gray-700 max-w-3xl mb-6">
        Plataforma oficial de supervisão neuroeducacional. Integra ENAT GO, ENAT MAP, SIM-PRO
        e trilhas avaliativas em tempo real.
      </p>
      <div className="max-w-4xl">
        <div className="mb-6 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Testes Neuroeducacionais Integrados</h2>
          <p className="text-gray-600 mb-4">Explore os simuladores de testes abaixo:</p>
        </div>
      </div>
    </main>
  );
}

export function ProdutoGO() {
  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-3xl font-bold mb-4">ENAT GO – Aplicativo de Campo</h1>
      <p className="text-gray-700 max-w-3xl">
        Aplicativo oficial de campo para instrutores. Registra evidências, geolocalização,
        protocolos e fluxo completo do ENAT HSI.
      </p>
    </main>
  );
}

export function ProdutoMAP() {
  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-3xl font-bold mb-4">ENAT MAP – Biofeedback Emocional</h1>
      <p className="text-gray-700 max-w-3xl">
        Mapeamento emocional e atencional do condutor. Integra sensores, variáveis fisiológicas e
        relatórios cognitivo-emocionais.
      </p>
    </main>
  );
}

export function ProdutoSIMPRO() {
  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-3xl font-bold mb-4">ENAT SIM-PRO – Simulador Neuroeducacional</h1>
      <p className="text-gray-700 max-w-3xl mb-6">
        Simulador com métricas neuroeducacionais (atenção, resposta, controle emocional, memória).
      </p>
      <div className="max-w-4xl space-y-6">
        <AttentionSimulator />
        <ReactionSimulator />
        <EmotionalControlSimulator />
        <MemorySimulator />
      </div>
    </main>
  );
}

export function ProdutoCERT() {
  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-3xl font-bold mb-4">ENAT CERT – Certificação Oficial</h1>
      <p className="text-gray-700 max-w-3xl">
        Certificação profissional em níveis com validação de competências reais em campo.
      </p>
    </main>
  );
}

export function ProdutoVR() {
  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-3xl font-bold mb-4">ENAT VR – Realidade Virtual Emocional</h1>
      <p className="text-gray-700 max-w-3xl">
        Imersão cognitivo-emocional com cenários controlados de alta complexidade.
      </p>
    </main>
  );
}

export function ProdutoDetail() {
  const { produto } = useParams();
  switch (produto) {
    case "ops":
      return <ProdutoOPS />;
    case "go":
      return <ProdutoGO />;
    case "map":
      return <ProdutoMAP />;
    case "simpro":
      return <ProdutoSIMPRO />;
    case "cert":
      return <ProdutoCERT />;
    case "vr":
      return <ProdutoVR />;
    default:
      return <ProdutosENAT />;
  }
}

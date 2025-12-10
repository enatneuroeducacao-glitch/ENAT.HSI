import { Link } from "react-router-dom";

export function ProdutosENAT() {
  const produtos = [
    { title: "ENAT OPS – Plataforma Operacional", key: "ops" },
    { title: "ENAT GO – Aplicativo de Campo", key: "go" },
    { title: "ENAT MAP – Biofeedback Emocional", key: "map" },
    { title: "ENAT SIM-PRO – Simulador Neuroeducacional", key: "simpro" },
    { title: "ENAT CERT – Certificação Oficial", key: "cert" },
    { title: "ENAT VR – Realidade Virtual Emocional", key: "vr" },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-10 pt-28">
      <h1 className="text-4xl font-bold mb-6">Produtos ENAT HSI</h1>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        {produtos.map((p) => (
          <Link key={p.key} to={`/produtos/${p.key}`} className="block">
            <section className="p-6 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition">
              <h2 className="text-xl font-semibold">{p.title}</h2>
              <p className="text-gray-600 mt-2">Clique para abrir detalhes.</p>
            </section>
          </Link>
        ))}
      </div>
    </main>
  );
}

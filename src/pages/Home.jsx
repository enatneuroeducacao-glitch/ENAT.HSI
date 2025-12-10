export function Home() {
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

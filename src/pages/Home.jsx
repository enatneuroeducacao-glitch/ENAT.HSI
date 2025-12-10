import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-6 pt-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">🧠 Central ENAT HSI</h1>
          <p className="text-xl opacity-90 mb-8">
            O núcleo oficial que integra ciência, tecnologia, supervisão, formação e governança do método ENAT HSI
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate("/testes")}
              className="px-8 py-3 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 font-bold transition"
            >
              🧪 Fazer Testes
            </button>
            <button
              onClick={() => navigate("/cursos")}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold transition"
            >
              📚 Cursos
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          <button
            onClick={() => navigate("/testes")}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition">🧪</div>
            <h3 className="font-bold text-gray-800">Testes Avançados</h3>
            <p className="text-sm text-gray-600 mt-1">Certificação profissional</p>
          </button>

          <button
            onClick={() => navigate("/cursos")}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition">📚</div>
            <h3 className="font-bold text-gray-800">Cursos</h3>
            <p className="text-sm text-gray-600 mt-1">Aprenda neuroeducação</p>
          </button>

          <button
            onClick={() => navigate("/certificados")}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition">📜</div>
            <h3 className="font-bold text-gray-800">Certificados</h3>
            <p className="text-sm text-gray-600 mt-1">Seus diplomas</p>
          </button>

          <button
            onClick={() => navigate("/sobre")}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition text-left group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition">ℹ️</div>
            <h3 className="font-bold text-gray-800">Sobre</h3>
            <p className="text-sm text-gray-600 mt-1">Conheça o ENAT</p>
          </button>
        </div>

        {/* System Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 bg-white rounded-lg shadow-lg">
            <div className="text-5xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sistema Cognitivo-Emocional (SCE)</h2>
            <p className="text-gray-600">3-3-3, STOP ENAT, CEA, Mindfulness e ENAT MAP.</p>
          </div>

          <div className="p-8 bg-white rounded-lg shadow-lg">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sistema Instrucional e de Supervisão (SIS)</h2>
            <p className="text-gray-600">ENAT OPS, ENAT GO, ENAT SIM-PRO e Certificação ENAT CERT.</p>
          </div>

          <div className="p-8 bg-white rounded-lg shadow-lg">
            <div className="text-5xl mb-4">🔬</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sistema de Pesquisa e Validação (SRV)</h2>
            <p className="text-gray-600">ENAT LAB, VR e pilotos controlados.</p>
          </div>

          <div className="p-8 bg-white rounded-lg shadow-lg">
            <div className="text-5xl mb-4">🏛️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sistema de Governança e Expansão (SGE)</h2>
            <p className="text-gray-600">Licenciamento ENAT-first, auditorias e parcerias institucionais.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

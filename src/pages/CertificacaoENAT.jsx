import { useNavigate } from "react-router-dom";

export function CertificacaoENAT() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 pt-28">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🏆 Certificação ENAT HSI</h1>
          <p className="text-lg opacity-90">
            Sistema oficial de certificação com trilhas, auditorias e recertificações
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Cursos de Formação</h3>
            <p className="text-gray-600 mb-4">
              Aprenda os fundamentos e técnicas práticas de neuroeducação
            </p>
            <button
              onClick={() => navigate("/cursos")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              Acessar Cursos
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">🧪</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Testes Aprofundados</h3>
            <p className="text-gray-600 mb-4">
              Avalie seus conhecimentos com testes teóricos e práticos
            </p>
            <button
              onClick={() => navigate("/testes")}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
            >
              Fazer Testes
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-3">📜</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Meus Certificados</h3>
            <p className="text-gray-600 mb-4">
              Visualize e gerencie seus certificados de aprovação
            </p>
            <button
              onClick={() => navigate("/certificados")}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
            >
              Ver Certificados
            </button>
          </div>
        </div>

        {/* Certification Process */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Processo de Certificação</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Inscrição</h4>
              <p className="text-sm text-gray-600">
                Registre-se como aluno ou instrutor
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Cursos</h4>
              <p className="text-sm text-gray-600">
                Complete os cursos de neuroeducação
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Testes</h4>
              <p className="text-sm text-gray-600">
                Faça os testes aprofundados (mín. 7.0)
              </p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-amber-600">4</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Certificado</h4>
              <p className="text-sm text-gray-600">
                Receba seu certificado oficial
              </p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Requisitos para Certificação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4">✅ Para Alunos</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Completar inscrição com dados válidos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Estar vinculado a um instrutor com credencial válida</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Fazer todos os testes aprofundados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Obter pontuação mínima de 7.0 em cada teste</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4">✅ Para Instrutores</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Completar inscrição com dados válidos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Gerar credencial única (ENAT-INST-AAAA-XXXXX)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Completar cursos de formação para instrutores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Fazer testes aprofundados com mínimo 7.0</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

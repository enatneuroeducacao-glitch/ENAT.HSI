import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";
import { useAdvancedTests } from "../hooks/useAdvancedTests";

export function TestesAvancados() {
  const navigate = useNavigate();
  const { currentUser } = useUserManagement();
  const { getAllTests, getUserCertificates } = useAdvancedTests();

  const tests = useMemo(() => getAllTests(), [getAllTests]);
  const certificates = useMemo(
    () => (currentUser ? getUserCertificates(currentUser.id) : []),
    [currentUser, getUserCertificates]
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você precisa estar conectado para acessar os testes.</p>
          <button
            onClick={() => navigate("/cadastro/aluno")}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition"
          >
            Fazer Cadastro/Login
          </button>
        </div>
      </div>
    );
  }

  const completedTests = new Set(certificates.map((c) => c.testId));
  const passedTests = certificates.filter((c) => c.score >= 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🧪 Testes Aprofundados</h1>
          <p className="text-gray-600 text-lg">
            Teste seus conhecimentos em neuroeducação. Pontuação mínima para aprovação: 7.0
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-600">Usuário Conectado</p>
              <p className="text-xl font-bold text-gray-800">{currentUser.name}</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-600">
                  {completedTests.size}
                </p>
                <p className="text-sm text-gray-600">Testes Realizados</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{passedTests.length}</p>
                <p className="text-sm text-gray-600">Aprovações</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {tests.map((test) => {
            const isCompleted = completedTests.has(test.id);
            const certificate = certificates.find((c) => c.testId === test.id);
            const isPassed = certificate && certificate.score >= 7;

            return (
              <div
                key={test.id}
                className={`rounded-lg shadow-lg overflow-hidden transition hover:shadow-xl ${
                  isPassed
                    ? "bg-gradient-to-br from-green-50 to-emerald-100"
                    : "bg-white"
                }`}
              >
                {/* Header */}
                <div
                  className={`p-6 ${
                    test.type === "theoretical"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600"
                      : "bg-gradient-to-r from-orange-500 to-orange-600"
                  } text-white`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm opacity-90 mb-1">
                        {test.type === "theoretical" ? "📚 Teste Teórico" : "🔬 Teste Prático"}
                      </p>
                      <h3 className="text-2xl font-bold">{test.title}</h3>
                    </div>
                    {isPassed && (
                      <div className="text-3xl">✅</div>
                    )}
                  </div>
                  <p className="text-sm opacity-90">{test.description}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">❓</span>
                      <span className="text-gray-700">
                        <strong>{test.questions.length}</strong> questões
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⏱️</span>
                      <span className="text-gray-700">
                        Tempo estimado: <strong>{test.estimatedTime}</strong>
                      </span>
                    </div>
                    {test.scenario && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📋</span>
                        <span className="text-gray-700">
                          Teste baseado em <strong>cenário</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {isCompleted && certificate && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Sua pontuação: {certificate.score.toFixed(1)}/10
                      </p>
                      <p className="text-xs text-blue-800">
                        Realizado em {new Date(certificate.issuedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Button */}
                  <button
                    onClick={() => navigate(`/testes/${test.id}`)}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      isPassed
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {isPassed ? "✅ Retomar Teste" : isCompleted ? "🔄 Refazer" : "Iniciar Teste"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ℹ️ Informações Importantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📊 Critério de Aprovação</h3>
              <p className="text-gray-600">
                Você precisa obter no mínimo <strong>7.0 pontos</strong> para ser aprovado. Ao atingir
                essa pontuação, um certificado automático será emitido com validade de 1 ano.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🔄 Retentativas</h3>
              <p className="text-gray-600">
                Você pode refazer os testes quantas vezes quiser. Sua pontuação final será a mais
                recente, mas todos os certificados serão mantidos em seu histórico.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📜 Certificados</h3>
              <p className="text-gray-600">
                Após a aprovação, você pode visualizar e baixar seus certificados na página de
                Certificados. Cada certificado possui um ID único para verificação.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📚 Conteúdo</h3>
              <p className="text-gray-600">
                Os testes abrangem os conteúdos dos cursos de neuroeducação. Recomenda-se fazer os
                cursos antes de tentar os testes avançados.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/cursos")}
            className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
          >
            Voltar aos Cursos
          </button>
        </div>
      </div>
    </div>
  );
}

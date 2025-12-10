import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";
import { useAdvancedTests } from "../hooks/useAdvancedTests";

export function Certificados() {
  const navigate = useNavigate();
  const { currentUser } = useUserManagement();
  const { getUserCertificates, getAllTests, getAverageScore } = useAdvancedTests();

  const certificates = useMemo(
    () => (currentUser ? getUserCertificates(currentUser.id) : []),
    [currentUser, getUserCertificates]
  );

  const averageScore = useMemo(
    () => (currentUser ? getAverageScore(currentUser.id) : 0),
    [currentUser, getAverageScore]
  );

  const allTests = useMemo(() => getAllTests(), [getAllTests]);

  const getCertificateDetails = (cert) => {
    const test = allTests.find((t) => t.id === cert.testId);
    return test ? { ...cert, testTitle: test.title, testType: test.type } : null;
  };

  const certificatesWithDetails = certificates
    .map(getCertificateDetails)
    .filter((c) => c !== null);

  const isExpired = (expiresDate) => new Date(expiresDate) < new Date();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">
            Você precisa estar conectado para visualizar seus certificados.
          </p>
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

  if (certificatesWithDetails.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 py-12 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📜 Certificados</h1>
            <p className="text-gray-600 text-lg">Seus certificados de conclusão e aprovação</p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nenhum Certificado Ainda</h2>
            <p className="text-gray-600 text-lg mb-8">
              Você ainda não completou nenhum teste com aprovação. Complete os testes aprofundados
              com pontuação mínima de <strong>7.0</strong> para obter seus certificados.
            </p>
            <button
              onClick={() => navigate("/testes")}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
            >
              Fazer Testes Aprofundados
            </button>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/testes")}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
            >
              Voltar aos Testes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 py-12 px-4 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📜 Certificados</h1>
          <p className="text-gray-600 text-lg">Seus certificados de conclusão e aprovação</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-sm text-gray-600">Usuário</p>
              <p className="text-2xl font-bold text-gray-800">{currentUser.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {currentUser.role === "instrutor" ? "👨‍🏫 Instrutor" : "👨‍🎓 Aluno"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {certificatesWithDetails.length}
                </p>
                <p className="text-sm text-gray-600">Certificados</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{averageScore.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Média Geral</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 mb-12">
          {certificatesWithDetails.map((cert) => {
            const expired = isExpired(cert.expiresDate);
            const issueDate = new Date(cert.issuedDate);
            const expireDate = new Date(cert.expiresDate);

            return (
              <div
                key={cert.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Certificate Body */}
                <div className="p-8 bg-gradient-to-br from-amber-50 to-yellow-50 relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 text-9xl opacity-10">📜</div>
                  <div className="absolute bottom-0 left-0 text-9xl opacity-10">✨</div>

                  <div className="relative z-10">
                    {/* Title */}
                    <div className="text-center mb-8 border-b-2 border-amber-300 pb-6">
                      <p className="text-sm text-amber-800 font-semibold tracking-widest">
                        CERTIFICADO DE APROVAÇÃO
                      </p>
                      <h2 className="text-3xl font-bold text-amber-900 mt-2">
                        🏆 Teste Aprofundado
                      </h2>
                    </div>

                    {/* Content */}
                    <div className="mb-8">
                      <p className="text-sm text-gray-600 mb-2">Certificamos que</p>
                      <p className="text-2xl font-bold text-gray-800 mb-6">{currentUser.name}</p>

                      <p className="text-gray-700 mb-4">
                        completou com sucesso o teste aprofundado de
                      </p>
                      <p className="text-xl font-bold text-amber-900 mb-6">
                        {cert.testTitle}
                      </p>

                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="text-center p-4 bg-white rounded border border-amber-200">
                          <p className="text-sm text-gray-600">Pontuação</p>
                          <p className="text-2xl font-bold text-green-600">{cert.score.toFixed(1)}</p>
                          <p className="text-xs text-gray-600">/ 10</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded border border-amber-200">
                          <p className="text-sm text-gray-600">Emissão</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {issueDate.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-white rounded border border-amber-200">
                          <p className="text-sm text-gray-600">Validade</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {expireDate.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      {/* Certificate ID */}
                      <div className="p-4 bg-white rounded border-2 border-amber-300">
                        <p className="text-xs text-gray-600">ID DO CERTIFICADO</p>
                        <p className="text-lg font-mono font-bold text-amber-900">{cert.id}</p>
                      </div>
                    </div>

                    {/* Status */}
                    {expired ? (
                      <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-sm font-semibold text-red-900">
                          ⚠️ Este certificado expirou em {expireDate.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                        <p className="text-sm font-semibold text-green-900">
                          ✅ Válido até {expireDate.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-4">
                  <button
                    onClick={() => {
                      const element = document.createElement("a");
                      element.setAttribute(
                        "href",
                        `data:text/plain;charset=utf-8,${encodeURIComponent(
                          `CERTIFICADO ENAT HSI\n\n` +
                            `ID: ${cert.id}\n` +
                            `Aluno: ${currentUser.name}\n` +
                            `Teste: ${cert.testTitle}\n` +
                            `Pontuação: ${cert.score.toFixed(1)}/10\n` +
                            `Emissão: ${issueDate.toLocaleDateString("pt-BR")}\n` +
                            `Validade: ${expireDate.toLocaleDateString("pt-BR")}\n` +
                            `Status: ${expired ? "Expirado" : "Válido"}`
                        )}`
                      );
                      element.setAttribute("download", `${cert.id}.txt`);
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                  >
                    📥 Baixar
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cert.id);
                      alert("ID do certificado copiado!");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition"
                  >
                    📋 Copiar ID
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate("/testes")}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
          >
            Fazer Mais Testes
          </button>
          <button
            onClick={() => navigate("/resultados")}
            className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
          >
            Resultados Gerais
          </button>
        </div>
      </div>
    </div>
  );
}

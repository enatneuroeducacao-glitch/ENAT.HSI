import React from "react";
import { useTestResults } from "../hooks/useTestResults";
import { useUserManagement } from "../hooks/useUserManagement";

export function ResultadosENAT() {
  const { getStoredResults, clearResults, exportToCSV } = useTestResults();
  const { currentUser } = useUserManagement();
  const results = getStoredResults();

  const handleDownloadCSV = () => {
    exportToCSV(results, `ENAT_Relatorio_${new Date().toISOString().split("T")[0]}.csv`, currentUser);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Resultados dos Testes</h1>

        {currentUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-600 font-semibold">Usuário Conectado</p>
                <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                <p className="text-gray-600 mt-1">
                  {currentUser.role === "instrutor"
                    ? `Instrutor • ${currentUser.institution}`
                    : `Aluno • ${currentUser.school}`}
                </p>
                <p className="text-sm text-gray-500 mt-2">{currentUser.email}</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p className="font-semibold">{currentUser.role === "instrutor" ? "👨‍🏫" : "👨‍🎓"}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Cadastrado em: {new Date(currentUser.registeredAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600">Nenhum teste realizado ainda.</p>
            <p className="text-gray-500 mt-2">Execute os testes neuroeducacionais para visualizar seus resultados aqui.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex gap-4">
              <button
                onClick={handleDownloadCSV}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                📥 Baixar Relatório CSV
              </button>
              <button
                onClick={() => {
                  if (confirm("Tem certeza? Esta ação não pode ser desfeita.")) {
                    clearResults();
                    window.location.reload();
                  }
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                🗑️ Limpar Todos os Resultados
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipo de Teste</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Protocolo</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pontuação</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acurácia</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 text-sm text-gray-700">{result.date} {result.time}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{result.testType}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{result.protocol}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{result.score}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          result.accuracy >= 80 ? "bg-green-100 text-green-800" :
                          result.accuracy >= 60 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {Math.round(result.accuracy)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {result.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">📊 Resumo Geral</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total de Testes</p>
                  <p className="text-3xl font-bold text-blue-600">{results.length}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Pontuação Média</p>
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Acurácia Média</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length)}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Melhor Teste</p>
                  <p className="text-xl font-bold text-orange-600">
                    {Math.max(...results.map(r => r.score))}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-yellow-50 rounded-lg shadow-md p-6 border-l-4 border-yellow-400">
              <h3 className="font-bold text-yellow-900 mb-2">ℹ️ Sobre os Protocolos ENAT</h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li><strong>SCE-ATN:</strong> Sistema de Avaliação de Atenção Seletiva</li>
                <li><strong>SIS-RXN:</strong> Sistema de Medição de Tempo de Reação</li>
                <li><strong>SCE-EMO:</strong> Sistema de Controle Emocional em Situações de Estresse</li>
                <li><strong>COG-MEM:</strong> Sistema de Avaliação de Memória de Trabalho</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

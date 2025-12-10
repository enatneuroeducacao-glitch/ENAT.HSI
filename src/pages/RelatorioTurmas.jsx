import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";
import { useInstructorCredentials } from "../hooks/useInstructorCredentials";
import { useAdvancedTests } from "../hooks/useAdvancedTests";
import { useNeuroeducationalCourses } from "../hooks/useNeuroeducationalCourses";

export function RelatorioTurmas() {
  const navigate = useNavigate();
  const { currentUser } = useUserManagement();
  const { getInstructorStudents } = useInstructorCredentials();
  const { getUserTestResults, getUserCertificates } = useAdvancedTests();
  const { getCourseCompletion } = useNeuroeducationalCourses();

  const students = useMemo(
    () => (currentUser && currentUser.role === "instrutor" ? getInstructorStudents(currentUser.id) : []),
    [currentUser, getInstructorStudents]
  );

  const studentsData = useMemo(() => {
    return students.map((student) => {
      const testResults = getUserTestResults(student.id);
      const certificates = getUserCertificates(student.id);
      const averageScore = testResults.length > 0
        ? Math.round((testResults.reduce((acc, r) => acc + r.score, 0) / testResults.length) * 10) / 10
        : 0;

      return {
        ...student,
        testResults: testResults.length,
        certificates: certificates.length,
        averageScore,
        lastTest: testResults.length > 0 ? testResults[testResults.length - 1].timestamp : null,
        approvalRate: testResults.length > 0
          ? Math.round((testResults.filter((r) => r.score >= 7).length / testResults.length) * 100)
          : 0,
      };
    });
  }, [students, getUserTestResults, getUserCertificates]);

  if (!currentUser || currentUser.role !== "instrutor") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">
            Este relatório é exclusivo para instrutores. Você precisa estar conectado como instrutor.
          </p>
          <button
            onClick={() => navigate("/cadastro/instrutor")}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition"
          >
            Cadastro de Instrutor
          </button>
        </div>
      </div>
    );
  }

  const totalStudents = studentsData.length;
  const totalTestsCompleted = studentsData.reduce((acc, s) => acc + s.testResults, 0);
  const totalCertificates = studentsData.reduce((acc, s) => acc + s.certificates, 0);
  const averageClassScore = totalTestsCompleted > 0
    ? Math.round((studentsData.reduce((acc, s) => acc + s.averageScore * s.testResults, 0) / totalTestsCompleted) * 10) / 10
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Relatório de Turmas</h1>
          <p className="text-gray-600">
            Acompanhe o progresso e desempenho dos seus alunos
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Alunos</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{totalStudents}</p>
              </div>
              <div className="text-5xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Testes Realizados</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{totalTestsCompleted}</p>
              </div>
              <div className="text-5xl">🧪</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Certificados Emitidos</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{totalCertificates}</p>
              </div>
              <div className="text-5xl">📜</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Média da Turma</p>
                <p className="text-4xl font-bold text-amber-600 mt-2">{averageClassScore}</p>
              </div>
              <div className="text-5xl">📈</div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Desempenho dos Alunos</h2>

            {totalStudents === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-600 text-lg mb-6">
                  Você ainda não tem alunos vinculados à sua credencial
                </p>
                <button
                  onClick={() => navigate("/resultados")}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  Ver Meus Dados
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Aluno</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Email</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Testes</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Média</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Aprovação</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Certificados</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Último Teste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {studentsData.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                        <td className="px-6 py-4 text-center text-sm">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                            {student.testResults}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <span className={`px-3 py-1 rounded-full font-semibold ${
                            student.averageScore >= 7
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {student.averageScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${student.approvalRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700">{student.approvalRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                            {student.certificates}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          {student.lastTest
                            ? new Date(student.lastTest).toLocaleDateString("pt-BR")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            Voltar ao Dashboard
          </button>
          <button
            onClick={() => navigate("/resultados")}
            className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
          >
            Meus Resultados
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";
import { useAdvancedTests } from "../hooks/useAdvancedTests";
import { useNeuroeducationalCourses } from "../hooks/useNeuroeducationalCourses";

export function DashboardAluno() {
  const navigate = useNavigate();
  const { currentUser } = useUserManagement();
  const { getUserCertificates, getAverageScore, getUserTestResults, getAllTests } =
    useAdvancedTests();
  const { getCourseCompletion, NEUROEDUCATIONAL_COURSES } = useNeuroeducationalCourses();

  const certificates = useMemo(
    () => (currentUser ? getUserCertificates(currentUser.id) : []),
    [currentUser, getUserCertificates]
  );

  const testResults = useMemo(
    () => (currentUser ? getUserTestResults(currentUser.id) : []),
    [currentUser, getUserTestResults]
  );

  const averageScore = useMemo(
    () => (currentUser ? getAverageScore(currentUser.id) : 0),
    [currentUser, getAverageScore]
  );

  const courses = useMemo(() => {
    const userRole = currentUser?.role || "aluno";
    return NEUROEDUCATIONAL_COURSES.filter((c) =>
      userRole === "instrutor" ? c.forRole === "instrutor" : c.forRole === "aluno"
    );
  }, [currentUser, NEUROEDUCATIONAL_COURSES]);

  const courseCompletions = useMemo(() => {
    return courses.map((c) => ({
      courseId: c.id,
      title: c.title,
      completion: currentUser ? getCourseCompletion(c.id, currentUser.id) : 0,
    }));
  }, [courses, currentUser, getCourseCompletion]);

  const averageCourseCompletion = useMemo(() => {
    if (courseCompletions.length === 0) return 0;
    const sum = courseCompletions.reduce((acc, c) => acc + c.completion, 0);
    return Math.round(sum / courseCompletions.length);
  }, [courseCompletions]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você precisa estar conectado para acessar o dashboard.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            👋 Bem-vindo, {currentUser.name}!
          </h1>
          <p className="text-gray-600">
            {currentUser.role === "instrutor"
              ? "Dashboard do Instrutor - Acompanhe seu progresso de certificação"
              : "Dashboard do Aluno - Acompanhe seu progresso educacional"}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Certificados</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{certificates.length}</p>
              </div>
              <div className="text-5xl">📜</div>
            </div>
            <button
              onClick={() => navigate("/certificados")}
              className="w-full mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-semibold transition"
            >
              Ver Certificados
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Média de Testes</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{averageScore.toFixed(1)}</p>
              </div>
              <div className="text-5xl">📊</div>
            </div>
            <button
              onClick={() => navigate("/testes")}
              className="w-full mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-semibold transition"
            >
              Fazer Testes
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Testes Realizados</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{testResults.length}</p>
              </div>
              <div className="text-5xl">🧪</div>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              {testResults.length === 0
                ? "Nenhum teste realizado"
                : `Último: ${new Date(testResults[testResults.length - 1].timestamp).toLocaleDateString()}`}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cursos</p>
                <p className="text-4xl font-bold text-amber-600 mt-2">{averageCourseCompletion}%</p>
              </div>
              <div className="text-5xl">📚</div>
            </div>
            <button
              onClick={() => navigate("/cursos")}
              className="w-full mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm font-semibold transition"
            >
              Acessar Cursos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Progress */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Progresso nos Cursos</h2>
            <div className="space-y-6">
              {courseCompletions.map((course) => (
                <div key={course.courseId}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-800">{course.title}</p>
                    <p className="text-sm text-gray-600">{course.completion}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 transition-all"
                      style={{ width: `${course.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/cursos")}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              Continuar Cursos
            </button>
          </div>

          {/* Test History */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Testes</h2>
            {testResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Você ainda não fez nenhum teste</p>
                <button
                  onClick={() => navigate("/testes")}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
                >
                  Fazer Primeiro Teste
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.slice(-5).map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      result.approved
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-800 text-sm">
                        {result.approved ? "✅" : "❌"} {result.testId}
                      </p>
                      <p className="text-sm font-bold text-gray-700">{result.score.toFixed(1)}/10</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate("/certificacao")}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            Voltar à Certificação
          </button>
          <button
            onClick={() => navigate("/resultados")}
            className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
          >
            Ver Resultados Completos
          </button>
        </div>
      </div>
    </div>
  );
}

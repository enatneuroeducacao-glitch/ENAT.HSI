import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";
import { useNeuroeducationalCourses } from "../hooks/useNeuroeducationalCourses";

export function CursosENAT() {
  const { currentUser } = useUserManagement();
  const { getCoursesByRole, isEnrolled, enrollCourse, getCourseCompletion } =
    useNeuroeducationalCourses();
  const [enrollmentMessage, setEnrollmentMessage] = useState(null);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
            <p className="text-gray-600 mb-6">
              Você precisa estar registrado para acessar os cursos neuroeducacionais.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/cadastro/instrutor"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Cadastro Instrutor
              </Link>
              <Link
                to="/cadastro/aluno"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
              >
                Cadastro Aluno
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const courses = getCoursesByRole(currentUser.role);
  const bgGradient =
    currentUser.role === "instrutor"
      ? "from-blue-50 to-indigo-100"
      : "from-purple-50 to-pink-100";
  const accentColor =
    currentUser.role === "instrutor" ? "blue" : "purple";

  const handleEnroll = (courseId) => {
    if (!isEnrolled(courseId, currentUser.id)) {
      enrollCourse(courseId, currentUser.id);
      setEnrollmentMessage(`Você se inscreveu em "${courseId}" com sucesso!`);
      setTimeout(() => setEnrollmentMessage(null), 3000);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} py-12 px-4 pt-24`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎓 Cursos Neuroeducacionais ENAT HSI
          </h1>
          <p className="text-gray-600 text-lg">
            {currentUser.role === "instrutor"
              ? "Desenvolva suas competências como instrutor neuroeducacional"
              : "Melhore suas habilidades cognitivas e emocionais"}
          </p>
        </div>

        {/* Info Message */}
        {enrollmentMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg text-green-800">
            ✅ {enrollmentMessage}
          </div>
        )}

        {/* User Info */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">
            <strong>Acesso como:</strong>{" "}
            {currentUser.role === "instrutor" ? "👨‍🏫 Instrutor" : "👨‍🎓 Aluno"}
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const enrolled = isEnrolled(course.id, currentUser.id);
            const completion = getCourseCompletion(course.id);

            return (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Course Header */}
                <div
                  className={`bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 p-6 text-white`}
                >
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-sm opacity-90">{course.description}</p>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  {/* Metadata */}
                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📊</span>
                      <span className="capitalize">{course.level}</span>
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Módulos:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {course.modules.map((module, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span>✓</span>
                          <span>{module}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Objectives */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Objetivos:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {course.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-0.5">•</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Progress Bar */}
                  {enrolled && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Progresso</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-${accentColor}-500 h-2 rounded-full transition-all`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{completion}% completo</p>
                    </div>
                  )}

                  {/* Action Button */}
                  {enrolled ? (
                    <Link
                      to={`/cursos/${course.id}`}
                      className={`w-full py-2 px-4 bg-${accentColor}-600 text-white rounded-lg hover:bg-${accentColor}-700 font-semibold transition text-center`}
                    >
                      Continuar Curso
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className={`w-full py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold transition`}
                    >
                      Inscrever-se
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">ℹ️ Sobre os Cursos</h3>
          <div className="text-gray-700 space-y-3">
            {currentUser.role === "instrutor" ? (
              <>
                <p>
                  <strong>Cursos para Instrutores:</strong> Desenvolvidos para capacitar profissionais
                  na área de educação, com foco em neurociência aplicada à educação e uso dos
                  simuladores ENAT HSI.
                </p>
                <p>
                  Todos os cursos incluem conteúdo aprofundado, exemplos práticos e estratégias
                  para implementação em sala de aula.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Cursos para Alunos:</strong> Desenvolvidos para preparar alunos antes dos
                  testes e para melhorar habilidades cognitivas e emocionais após a avaliação.
                </p>
                <p>
                  Cada curso inclui explicações claras, exercícios práticos e dicas para aproveitar
                  ao máximo os simuladores ENAT HSI.
                </p>
              </>
            )}
            <p className="text-sm text-gray-600">
              💡 Dica: Complete um curso antes de usar o simulador correspondente para melhor compreensão!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

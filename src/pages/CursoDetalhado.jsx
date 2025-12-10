import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";
import { useNeuroeducationalCourses, NEUROEDUCATIONAL_COURSES } from "../hooks/useNeuroeducationalCourses";

export function CursoDetalhado() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUserManagement();
  const {
    isEnrolled,
    enrollCourse,
    updateModuleProgress,
    getModuleProgress,
    getCourseCompletion,
    completeCourse,
  } = useNeuroeducationalCourses();
  const [selectedModule, setSelectedModule] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Find course in both instructor and student courses
  const course = useMemo(() => {
    const allCourses = [
      ...NEUROEDUCATIONAL_COURSES.instructor,
      ...NEUROEDUCATIONAL_COURSES.student,
    ];
    return allCourses.find((c) => c.id === courseId);
  }, [courseId]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa fazer login para acessar este curso.</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Curso Não Encontrado</h2>
          <p className="text-gray-600 mb-6">O curso solicitado não existe.</p>
          <button
            onClick={() => navigate("/cursos")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition"
          >
            Voltar aos Cursos
          </button>
        </div>
      </div>
    );
  }

  const enrolled = isEnrolled(course.id, currentUser.id);
  const completion = getCourseCompletion(course.id);
  const accentColor = currentUser.role === "instrutor" ? "blue" : "purple";

  const handleEnroll = () => {
    if (!enrolled) {
      enrollCourse(course.id, currentUser.id);
    }
  };

  const handleCompleteModule = (index) => {
    updateModuleProgress(course.id, index, !getModuleProgress(course.id, index));
  };

  const handleCompleteCourse = () => {
    completeCourse(course.id, currentUser.id);
    alert("🎉 Parabéns! Você completou este curso!");
  };

  const modulesCompleted = course.modules.reduce(
    (sum, _, idx) => sum + (getModuleProgress(course.id, idx) ? 1 : 0),
    0
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-${accentColor}-50 to-${accentColor === 'blue' ? 'indigo' : 'pink'}-100 py-12 px-4 pt-24`}>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/cursos")}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2"
        >
          ← Voltar aos Cursos
        </button>

        {/* Course Header */}
        <div className={`bg-gradient-to-r from-${accentColor}-600 to-${accentColor === 'blue' ? 'indigo' : 'pink'}-600 text-white rounded-lg shadow-lg p-8 mb-8`}>
          <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
          <p className="text-lg opacity-90 mb-6">{course.description}</p>

          <div className="flex gap-6 flex-wrap text-sm">
            <div>
              <span className="opacity-75">Duração:</span>
              <strong className="ml-2">{course.duration}</strong>
            </div>
            <div>
              <span className="opacity-75">Nível:</span>
              <strong className="ml-2 capitalize">{course.level}</strong>
            </div>
            <div>
              <span className="opacity-75">Módulos:</span>
              <strong className="ml-2">{course.modules.length}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {!enrolled ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Inscrever-se no Curso</h2>
                <p className="text-gray-600 mb-6">
                  Inscreva-se para acessar todo o conteúdo deste curso neuroeducacional.
                </p>
                <button
                  onClick={handleEnroll}
                  className={`px-8 py-3 bg-${accentColor}-600 text-white rounded-lg hover:bg-${accentColor}-700 font-bold text-lg transition`}
                >
                  Inscrever-se no Curso
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Module Selector */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Módulos do Curso</h3>
                  <div className="space-y-2">
                    {course.modules.map((module, idx) => {
                      const isCompleted = getModuleProgress(course.id, idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedModule(idx);
                            setShowContent(true);
                          }}
                          className={`w-full text-left p-4 rounded-lg border-2 transition ${
                            selectedModule === idx
                              ? `border-${accentColor}-600 bg-${accentColor}-50`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`text-xl ${isCompleted ? "✅" : "📄"}`}></span>
                              <div>
                                <p className="font-semibold text-gray-800">Módulo {idx + 1}</p>
                                <p className="text-sm text-gray-600">{module}</p>
                              </div>
                            </div>
                            {isCompleted && <span className="text-green-600 font-bold">Concluído</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Display */}
                {showContent && (
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Módulo {selectedModule + 1}: {course.modules[selectedModule]}
                    </h3>

                    <div className="prose prose-sm max-w-none mb-6 text-gray-700">
                      {course.content.split("##").map((section, idx) => {
                        if (idx === 0) return null;
                        const lines = section.split("\n");
                        const title = lines[0].trim();
                        const content = lines.slice(1).join("\n");

                        return (
                          <section key={idx} className="mb-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-2">{title}</h4>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: content
                                  .replace(/^### (.*)/gm, "<h5 class='font-semibold mt-3'>$1</h5>")
                                  .replace(/^- (.*)/gm, "<li class='ml-4'>$1</li>")
                                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                  .replace(/_(.*?)_/g, "<em>$1</em>")
                                  .replace(/(\n\n)/g, "</p><p class='my-2'>"),
                              }}
                            />
                          </section>
                        );
                      })}
                    </div>

                    {/* Module Completion */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700">
                          {getModuleProgress(course.id, selectedModule)
                            ? "✅ Você completou este módulo"
                            : "📖 Marque como completo quando terminar"}
                        </p>
                        <button
                          onClick={() => handleCompleteModule(selectedModule)}
                          className={`px-6 py-2 rounded-lg font-semibold transition ${
                            getModuleProgress(course.id, selectedModule)
                              ? `bg-gray-300 text-gray-800 hover:bg-gray-400`
                              : `bg-green-600 text-white hover:bg-green-700`
                          }`}
                        >
                          {getModuleProgress(course.id, selectedModule)
                            ? "Desmarcar Conclusão"
                            : "Marcar como Completo"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {enrolled && (
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24 space-y-6">
                {/* Progress */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Seu Progresso</h4>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{completion}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`bg-${accentColor}-600 h-3 rounded-full transition-all`}
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {modulesCompleted} de {course.modules.length} módulos completos
                  </p>
                </div>

                {/* Objectives */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Objetivos</h4>
                  <ul className="space-y-2">
                    {course.objectives.map((obj, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-600">✓</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Completion Button */}
                {completion === 100 && (
                  <button
                    onClick={handleCompleteCourse}
                    className={`w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-bold transition shadow-lg`}
                  >
                    🎉 Marcar Curso como Completo
                  </button>
                )}

                {completion < 100 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <strong>💡 Dica:</strong> Complete todos os módulos para certificar seu aprendizado!
                  </div>
                )}

                {/* Module Navigation */}
                {enrolled && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">Navegação</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          if (selectedModule > 0) setSelectedModule(selectedModule - 1);
                        }}
                        disabled={selectedModule === 0}
                        className="w-full py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold transition disabled:opacity-50"
                      >
                        ← Anterior
                      </button>
                      <button
                        onClick={() => {
                          if (selectedModule < course.modules.length - 1)
                            setSelectedModule(selectedModule + 1);
                        }}
                        disabled={selectedModule === course.modules.length - 1}
                        className="w-full py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold transition disabled:opacity-50"
                      >
                        Próximo →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";
import { useAdvancedTests } from "../hooks/useAdvancedTests";

export function TesteAprofundado() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUserManagement();
  const { submitTest, getAllTests } = useAdvancedTests();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [startTime] = useState(Date.now());

  const test = useMemo(() => {
    return getAllTests().find((t) => t.id === testId);
  }, [testId, getAllTests]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar conectado para fazer um teste.</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Teste Não Encontrado</h2>
          <button
            onClick={() => navigate("/testes")}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold mt-4"
          >
            Voltar aos Testes
          </button>
        </div>
      </div>
    );
  }

  if (showResult && testResult) {
    if (testResult.error === "limit") {
      // Show limit message
      return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12 px-4 pt-24">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⛔</div>
            <h2 className="text-2xl font-bold mb-2">Limite de Tentativas Atingido</h2>
            <p className="text-gray-700 mb-4">{testResult.message}</p>
            <p className="text-sm text-gray-600 mb-6">Você pode tentar novamente amanhã.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/testes')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Voltar aos Testes
              </button>
              <button
                onClick={() => {
                  setShowResult(false);
                  setTestResult(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      );
    }
    const statusColor = testResult.approved ? "green" : "red";
    const statusIcon = testResult.approved ? "✅" : "❌";
    const statusText = testResult.approved ? "APROVADO" : "NÃO APROVADO";

    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-${statusColor}-50 to-${statusColor === "green" ? "emerald" : "orange"}-100 py-12 px-4 pt-24`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Result Card */}
          <div className="bg-white rounded-lg shadow-lg p-12 text-center mb-8">
            <div className="text-6xl mb-4">{statusIcon}</div>
            <h1 className={`text-4xl font-bold text-${statusColor}-600 mb-2`}>{statusText}</h1>
            <p className="text-gray-600 text-lg mb-8">{testResult.testTitle}</p>

            {/* Score Display */}
            <div className="mb-8">
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {testResult.score.toFixed(1)}/10
              </div>
              <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden mb-2">
                <div
                  className={`bg-${statusColor}-600 h-4 transition-all`}
                  style={{ width: `${testResult.score * 10}%` }}
                />
              </div>
              <p className="text-gray-600">
                {testResult.correctCount} de {testResult.totalQuestions} questões corretas
              </p>
            </div>

            {/* Approval Note */}
            <div
              className={`mb-8 p-4 bg-${statusColor}-50 border-2 border-${statusColor}-300 rounded-lg`}
            >
              <p className="text-gray-800 font-semibold">
                {testResult.approved
                  ? "🎉 Parabéns! Você foi aprovado com média ≥ 7.0"
                  : `⚠️ Pontuação mínima para aprovação: 7.0 (você obteve ${testResult.score.toFixed(1)})`}
              </p>
            </div>

            {/* Certificate Info */}
            {testResult.approved && (
              <div className="mb-8 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <p className="text-yellow-900 font-semibold">
                  📜 Certificado emitido com sucesso!
                </p>
                <p className="text-yellow-800 text-sm mt-2">
                  Você pode visualizar seu certificado na página de Certificados
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate("/testes")}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
              >
                Voltar aos Testes
              </button>
              {testResult.approved && (
                <button
                  onClick={() => navigate("/certificados")}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                >
                  Ver Certificados
                </button>
              )}
              {!testResult.approved && (
                <button
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswers({});
                    setShowResult(false);
                    setTestResult(null);
                  }}
                  className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition"
                >
                  Tentar Novamente
                </button>
              )}
            </div>
          </div>

          {/* Detailed Answers */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Análise Detalhada</h2>
            <div className="space-y-6">
              {testResult.detailedAnswers.map((answer, idx) => (
                <div
                  key={idx}
                  className={`p-4 border-l-4 rounded-lg ${
                    answer.isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <p className="font-semibold text-gray-800 mb-2">
                    Questão {idx + 1}: {answer.question}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    {answer.isCorrect ? "✅ Correto!" : "❌ Incorreto"}
                  </p>
                  {!answer.isCorrect && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Sua resposta:</strong> (Opção {answer.userAnswer + 1})
                    </p>
                  )}
                  <p className="text-sm text-gray-700 p-3 bg-white rounded border border-gray-200">
                    <strong>Explicação:</strong> {answer.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / test.questions.length) * 100);
  const isScenarioTest = test.scenario !== undefined;

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({ ...answers, [question.id]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const result = submitTest(testId, answers, currentUser.id);
    setTestResult(result);
    setShowResult(true);
  };

  const allAnswered = test.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/testes")}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{test.title}</h1>
          <p className="text-gray-600 mb-4">{test.description}</p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progresso</span>
              <span className="text-sm font-semibold text-gray-700">
                {currentQuestion + 1} de {test.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-3 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scenario (if applicable) */}
        {isScenarioTest && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">📋 Cenário</h3>
            <p className="text-blue-800 whitespace-pre-line">{test.scenario}</p>
          </div>
        )}

        {/* Question */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Questão {currentQuestion + 1}: {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  answers[question.id] === index
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-300 hover:border-gray-400 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[question.id] === index
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-gray-400"
                    }`}
                  >
                    {answers[question.id] === index && (
                      <span className="text-white font-bold">✓</span>
                    )}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold disabled:opacity-50"
            >
              ← Anterior
            </button>

            {currentQuestion < test.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
              >
                Próxima →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
              >
                Enviar Teste
              </button>
            )}
          </div>

          {!allAnswered && (
            <p className="text-sm text-yellow-700 mt-4">
              ⚠️ Você ainda tem questões sem responder. Responda todas antes de enviar.
            </p>
          )}
        </div>

        {/* Question Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-4">Resumo das Respostas</h3>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {test.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`aspect-square rounded-lg font-semibold transition ${
                  answers[q.id] !== undefined
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                } ${currentQuestion === idx ? "ring-2 ring-indigo-600" : ""}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

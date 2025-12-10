import React, { useState, useEffect } from "react";
import { useTestResults } from "../hooks/useTestResults";

export function ReactionSimulator() {
  const { addTestResult } = useTestResults();
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [reactionTime, setReactionTime] = useState(null);
  const [times, setTimes] = useState([]);
  const [message, setMessage] = useState("");
  const [waitingForClick, setWaitingForClick] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const startTest = () => {
    setStarted(true);
    setReady(false);
    setMessage("Aguarde o sinal...");
    setWaitingForClick(false);

    const delay = Math.random() * 3000 + 2000; // 2-5 segundos
    setTimeout(() => {
      setReady(true);
      setMessage("CLIQUE!");
      setStartTime(Date.now());
      setWaitingForClick(true);
    }, delay);
  };

  const handleClick = () => {
    if (!waitingForClick) {
      setMessage("❌ Clicou muito cedo!");
      return;
    }

    const reaction = Date.now() - startTime;
    setReactionTime(reaction);
    setTimes([...times, reaction]);
    setWaitingForClick(false);
    setReady(false);
    setStarted(false);
    setMessage(`Tempo de reação: ${reaction}ms`);
  };

  const averageTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b) / times.length) : 0;

  const handleTestComplete = () => {
    if (times.length === 0) return;
    addTestResult({
      testType: "Teste de Tempo de Reação",
      protocol: "ENAT SIS-RXN v1.0",
      method: "Resposta motora a estímulo visual não-previsível",
      score: averageTime,
      maxScore: 5000,
      accuracy: Math.max(0, 100 - (averageTime / 50)),
      duration: times.length,
      difficulty: "Média",
      status: "Concluído",
      notes: `${times.length} tentativas, média: ${averageTime}ms`,
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4">Simulador de Tempo de Reação</h3>
      <p className="text-gray-600 mb-4">Clique assim que o sinal aparecer. Quanto mais rápido, melhor!</p>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-lg font-semibold">Tentativas: {times.length}</p>
        {times.length > 0 && <p className="text-xl font-bold text-blue-600">Média: {averageTime}ms</p>}
      </div>

      {!started ? (
        <button
          onClick={startTest}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Iniciar Teste
        </button>
      ) : (
        <>
          <div
            onClick={handleClick}
            className={`w-full h-40 rounded-lg mb-4 flex items-center justify-center text-3xl font-bold cursor-pointer transition ${
              ready ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
            }`}
          >
            {ready ? "CLIQUE!" : "Aguardando..."}
          </div>
          <p className="text-center text-lg font-semibold">{message}</p>
        </>
      )}

      {times.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-bold mb-2">Histórico:</p>
          <div className="flex flex-wrap gap-2">
            {times.map((t, i) => (
              <span key={i} className="px-3 py-1 bg-blue-200 rounded-full text-sm">
                {t}ms
              </span>
            ))}
          </div>
          <button
            onClick={() => {
              handleTestComplete();
              setTimes([]);
              setReactionTime(null);
              setMessage("✓ Resultado salvo!");
              setTimeout(() => setMessage(""), 2000);
            }}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2"
          >
            Salvar Resultado
          </button>
          <button
            onClick={() => {
              setTimes([]);
              setReactionTime(null);
              setMessage("");
            }}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Limpar Histórico
          </button>
        </div>
      )}
    </div>
  );
}

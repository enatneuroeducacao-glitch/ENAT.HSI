import React, { useState, useEffect } from "react";
import { useTestResults } from "../hooks/useTestResults";

export function EmotionalControlSimulator() {
  const { addTestResult } = useTestResults();
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [stressLevel, setStressLevel] = useState(0);
  const [calmingActions, setCalmingActions] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!started || gameOver) return;

    const interval = setInterval(() => {
      setStressLevel((s) => {
        const newLevel = Math.min(s + 5, 100);
        if (newLevel >= 100) {
          setGameOver(true);
          setMessage("❌ Estresse muito alto! Teste finalizado.");
        }
        return newLevel;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, gameOver]);

  const startGame = () => {
    setStarted(true);
    setRound(1);
    setStressLevel(30);
    setCalmingActions(0);
    setGameOver(false);
    setScore(0);
    setMessage("Clique nos botões de controle para reduzir o estresse!");
  };

  const handleCalming = (reduction) => {
    if (gameOver || !started) return;

    setStressLevel((s) => Math.max(s - reduction, 0));
    setCalmingActions((a) => a + 1);
    setScore((sc) => sc + reduction);

    if (stressLevel - reduction <= 0) {
      setRound((r) => r + 1);
      setStressLevel(30 + round * 10); // Aumenta dificuldade
      if (round >= 5) {
        setGameOver(true);
        setMessage(`✅ Parabéns! Score final: ${score + reduction}`);
      }
    }
  };

  const progressColor =
    stressLevel < 33 ? "bg-green-500" : stressLevel < 66 ? "bg-yellow-500" : "bg-red-500";

  const handleTestComplete = () => {
    addTestResult({
      testType: "Teste de Controle Emocional",
      protocol: "ENAT SCE-EMO v1.0",
      method: "Gerenciamento progressivo de estresse em 5 rodadas",
      score: score,
      maxScore: 500,
      accuracy: Math.round((score / 500) * 100),
      duration: round,
      difficulty: "Variável",
      status: "Concluído",
      notes: `${calmingActions} ações de controle em ${round} rodadas, score final: ${score}`,
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4">Simulador de Controle Emocional</h3>
      <p className="text-gray-600 mb-4">Reduza o nível de estresse usando técnicas de controle. Máximo 5 rodadas!</p>

      {!started ? (
        <button
          onClick={startGame}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Iniciar Teste
        </button>
      ) : (
        <>
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-lg font-semibold">Rodada: {round}/5</p>
            <p className="text-lg font-semibold">Score: {score}</p>
            <p className="text-lg font-semibold">Ações de Controle: {calmingActions}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Nível de Estresse: {stressLevel}%</label>
            <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
              <div className={`h-full ${progressColor} transition-all`} style={{ width: `${stressLevel}%` }}></div>
            </div>
          </div>

          {message && <p className="text-center text-lg font-semibold mb-4">{message}</p>}

          {!gameOver && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => handleCalming(15)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                🧘 Respiração (15%)
              </button>
              <button
                onClick={() => handleCalming(20)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                🎵 Música (20%)
              </button>
              <button
                onClick={() => handleCalming(10)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                💭 Meditação (10%)
              </button>
              <button
                onClick={() => handleCalming(25)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                🚶 Caminhada (25%)
              </button>
            </div>
          )}

          {gameOver && (
            <button
              onClick={() => {
                handleTestComplete();
                startGame();
              }}
              className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Salvar e Tentar Novamente
            </button>
          )}
        </>
      )}
    </div>
  );
}

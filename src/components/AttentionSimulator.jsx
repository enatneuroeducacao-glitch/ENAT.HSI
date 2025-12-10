import React, { useState, useEffect } from "react";
import { useTestResults } from "../hooks/useTestResults";

export function AttentionSimulator() {
  const { addTestResult } = useTestResults();
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!started || gameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, gameOver]);

  const startGame = () => {
    setStarted(true);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    generateTarget();
  };

  const handleTestComplete = () => {
    addTestResult({
      testType: "Teste de Atenção",
      protocol: "ENAT SCE-ATN v1.0",
      method: "Discriminação seletiva de estímulos visuais",
      score: score,
      maxScore: 30,
      accuracy: Math.round((score / 30) * 100),
      duration: 30,
      difficulty: "Moderada",
      status: "Concluído",
      notes: `${score} acertos em 30 segundos`,
    });
  };

  const generateTarget = () => {
    const colors = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    setTarget(color);
  };

  const handleClick = (color) => {
    if (!started || gameOver) return;
    if (color === target) {
      setScore((s) => s + 1);
      generateTarget();
    }
  };

  const colors = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500"];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4">Simulador de Atenção</h3>
      <p className="text-gray-600 mb-4">Clique no quadrado da cor indicada o máximo de vezes em 30 segundos.</p>

      {!started ? (
        <button
          onClick={startGame}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Iniciar Teste
        </button>
      ) : (
        <>
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-lg font-semibold">Tempo restante: {timeLeft}s</p>
            <p className="text-xl font-bold text-blue-600">Score: {score}</p>
          </div>

          {target && (
            <p className="mb-4 text-lg font-semibold">
              Clique no quadrado <span className={`inline-block w-6 h-6 ${target} rounded`}></span>
            </p>
          )}

          <div className="grid grid-cols-5 gap-4 mb-6">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleClick(color)}
                className={`w-16 h-16 rounded-lg ${color} hover:opacity-80 transition`}
              />
            ))}
          </div>

          {gameOver && (
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="font-bold text-green-800">Teste finalizado!</p>
              <p className="text-green-700">Sua pontuação: {score}</p>
              <button
                onClick={() => {
                  handleTestComplete();
                  startGame();
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar e Tentar Novamente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

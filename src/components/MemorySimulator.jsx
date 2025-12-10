import React, { useState, useEffect } from "react";

export function MemorySimulator() {
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [canPlay, setCanPlay] = useState(true);

  const colors = [
    { name: "Vermelho", bg: "bg-red-500", id: 0 },
    { name: "Azul", bg: "bg-blue-500", id: 1 },
    { name: "Verde", bg: "bg-green-500", id: 2 },
    { name: "Amarelo", bg: "bg-yellow-500", id: 3 },
  ];

  const startGame = () => {
    setStarted(true);
    setLevel(1);
    setScore(0);
    setGameOver(false);
    setMessage("Observe a sequência...");
    setSequence([]);
    setPlayerSequence([]);
    setCanPlay(false);
    playNextRound([]);
  };

  const playNextRound = (currentSequence) => {
    const newSequence = [...currentSequence, Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    playSequence(newSequence);
  };

  const playSequence = async (seq) => {
    setCanPlay(false);
    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      flashColor(seq[i]);
    }
    setCanPlay(true);
    setPlayerSequence([]);
    setMessage("Sua vez! Clique nos quadrados");
  };

  const flashColor = (colorId) => {
    // Visual feedback (pode ser expandido com som)
    const element = document.getElementById(`color-${colorId}`);
    if (element) {
      element.classList.add("ring-4", "ring-white");
      setTimeout(() => element.classList.remove("ring-4", "ring-white"), 300);
    }
  };

  const handleColorClick = (colorId) => {
    if (!canPlay || gameOver || !started) return;

    flashColor(colorId);
    const newPlayerSequence = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSequence);

    // Verifica se acertou
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setGameOver(true);
      setMessage(`❌ Erro! Score final: ${score}`);
      return;
    }

    // Se completou a sequência
    if (newPlayerSequence.length === sequence.length) {
      setScore((s) => s + 10 * level);
      setLevel((l) => l + 1);
      setMessage("✅ Correto! Próxima rodada...");
      setCanPlay(false);
      setTimeout(() => {
        playNextRound(sequence);
      }, 1000);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4">Simulador de Memória</h3>
      <p className="text-gray-600 mb-4">Reproduza a sequência de cores. Cada nível fica mais difícil!</p>

      {!started ? (
        <button
          onClick={startGame}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Iniciar Teste
        </button>
      ) : (
        <>
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-lg font-semibold">Nível: {level}</p>
            <p className="text-xl font-bold text-indigo-600">Score: {score}</p>
            <p className="text-sm text-gray-600">Sequência: {sequence.length} cores</p>
          </div>

          {message && <p className="text-center text-lg font-semibold mb-4">{message}</p>}

          <div className="grid grid-cols-2 gap-6 mb-6 max-w-xs mx-auto">
            {colors.map((color) => (
              <button
                key={color.id}
                id={`color-${color.id}`}
                onClick={() => handleColorClick(color.id)}
                disabled={!canPlay || gameOver}
                className={`w-24 h-24 rounded-lg ${color.bg} hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {gameOver && (
            <button
              onClick={startGame}
              className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Tentar Novamente
            </button>
          )}
        </>
      )}
    </div>
  );
}

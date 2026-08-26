import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";

const REWARDS = [
  { threshold: 5, days: 30 },
  { threshold: 15, days: 60 },
  { threshold: 35, days: 90 },
  { threshold: 65, days: 120 },
  { threshold: 105, days: 160 },
];

function referralCode(user) {
  const raw = String(user?.id || "").replace(/\D/g, "");
  return `ENAT-${(raw.slice(-6) || "000000").padStart(6, "0")}`;
}

export function IndicacoesInstrutor() {
  const navigate = useNavigate();
  const { currentUser } = useUserManagement();

  const code = useMemo(() => referralCode(currentUser), [currentUser]);
  const referrals = Number(localStorage.getItem(`enat_referrals_${currentUser?.id}`) || 0);
  const grantedDays = Number(localStorage.getItem(`enat_referral_days_${currentUser?.id}`) || 0);

  const currentReward = [...REWARDS].reverse().find((r) => referrals >= r.threshold) || null;
  const nextReward = REWARDS.find((r) => referrals < r.threshold) || null;
  const progress = nextReward
    ? Math.min(100, Math.round((referrals / nextReward.threshold) * 100))
    : 100;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Código de indicação copiado!");
    } catch {
      window.prompt("Copie seu código de indicação:", code);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800">Área do Instrutor</h1>
          <p className="text-gray-600 mt-2 mb-6">Faça login para acessar seu programa de indicações.</p>
          <button onClick={() => navigate("/cadastro/instrutor")} className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Entrar / Cadastrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Programa ENAT</p>
              <h1 className="text-3xl md:text-4xl font-bold mt-1">Indicações do Instrutor</h1>
              <p className="text-slate-200 mt-2">Indique instrutores e conquiste dias de benefício na sua assinatura.</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-5 min-w-[260px]">
              <p className="text-xs text-blue-100 uppercase font-semibold">Seu código</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-xl font-bold tracking-wider">{code}</span>
                <button onClick={copyCode} className="px-3 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold">Copiar</button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">Indicações qualificadas</p>
            <p className="text-4xl font-bold text-blue-700 mt-2">{referrals}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">Dias conquistados</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{grantedDays}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">Próxima recompensa</p>
            <p className="text-2xl font-bold text-amber-600 mt-3">{nextReward ? `${nextReward.threshold} indicações` : "Todas conquistadas"}</p>
            <p className="text-sm text-gray-500 mt-1">{nextReward ? `Benefício acumulado: ${nextReward.days} dias` : "Parabéns!"}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-7 mb-6">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Seu progresso</h2>
              <p className="text-sm text-gray-500 mt-1">{nextReward ? `${nextReward.threshold - referrals} indicação(ões) para a próxima meta` : "Você alcançou a maior faixa"}</p>
            </div>
            <span className="font-bold text-blue-700">{progress}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-7">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Tabela de recompensas</h2>
          <div className="space-y-3">
            {REWARDS.map((reward) => {
              const reached = referrals >= reward.threshold;
              const active = nextReward?.threshold === reward.threshold;
              return (
                <div key={reward.threshold} className={`flex items-center justify-between p-4 rounded-xl border ${reached ? "bg-green-50 border-green-200" : active ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{reached ? "✓" : active ? "→" : "○"}</span>
                    <div>
                      <p className="font-bold text-gray-800">{reward.threshold} indicações qualificadas</p>
                      <p className="text-sm text-gray-500">Benefício acumulado: {reward.days} dias</p>
                    </div>
                  </div>
                  <span className={`font-bold ${reached ? "text-green-700" : "text-gray-600"}`}>{reached ? "Conquistado" : `${reward.days} dias`}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-5">As recompensas são cumulativas: 5 → 30 dias; 15 → 60; 35 → 90; 65 → 120; 105 → 160.</p>
        </div>
      </div>
    </div>
  );
}

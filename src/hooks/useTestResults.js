import { useCallback } from "react";

export function useTestResults() {
  const getStoredResults = useCallback(() => {
    const stored = localStorage.getItem("enat_test_results");
    return stored ? JSON.parse(stored) : [];
  }, []);

  const addTestResult = useCallback((result) => {
    const results = getStoredResults();
    const newResult = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString("pt-BR"),
      time: new Date().toLocaleTimeString("pt-BR"),
      ...result,
    };
    results.push(newResult);
    localStorage.setItem("enat_test_results", JSON.stringify(results));
    return newResult;
  }, [getStoredResults]);

  const clearResults = useCallback(() => {
    localStorage.removeItem("enat_test_results");
  }, []);

  const exportToCSV = useCallback((results, filename = "ENAT_Relatorio_Testes.csv", currentUser = null) => {
    if (!results || results.length === 0) {
      alert("Nenhum resultado para exportar.");
      return;
    }

    const headers = [
      "ID Teste",
      "Data",
      "Hora",
      "Tipo de Teste",
      "Protocolo ENAT",
      "Método",
      "Pontuação",
      "Tempo (s)",
      "Taxa de Acerto (%)",
      "Nível de Dificuldade",
      "Status",
      "Observações",
    ];

    const rows = results.map((result) => [
      result.id,
      result.date,
      result.time,
      result.testType || "",
      result.protocol || "ENAT HSI v1.0",
      result.method || "",
      result.score || 0,
      result.duration || 0,
      result.accuracy || 0,
      result.difficulty || "N/A",
      result.status || "Concluído",
      result.notes || "",
    ]);

    // Informações do usuário
    const userInfo = currentUser ? [
      "",
      "INFORMAÇÕES DO USUÁRIO",
      "",
      `Nome: ${currentUser.name}`,
      `Email: ${currentUser.email}`,
      `Função: ${currentUser.role === "instrutor" ? "Instrutor" : "Aluno"}`,
      currentUser.role === "instrutor" ? `Especialização: ${currentUser.specialization}` : `Escola: ${currentUser.school}`,
      currentUser.role === "instrutor" ? `Instituição: ${currentUser.institution}` : `Série/Ano: ${currentUser.grade}`,
      `Cadastrado em: ${new Date(currentUser.registeredAt).toLocaleDateString("pt-BR")}`,
      "",
    ] : [];

    const csvContent = [
      "ENAT HSI - RELATÓRIO DE TESTES NEUROEDUCACIONAIS",
      "Sistema de Avaliação de Segurança Instrucional",
      `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      "",
      ...userInfo,
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      "",
      "ESPECIFICAÇÃO DE MÉTODOS E PROTOCOLOS",
      "",
      '"Teste de Atenção","Protocolo: ENAT SCE-ATN v1.0","Método: Discriminação seletiva de estímulos visuais durante 30s","Métrica: Acertos por minuto"',
      '"Tempo de Reação","Protocolo: ENAT SIS-RXN v1.0","Método: Resposta motora a estímulo visual não-previsível (2-5s)","Métrica: Milissegundos (ms) com intervalo de confiança"',
      '"Controle Emocional","Protocolo: ENAT SCE-EMO v1.0","Método: Gerenciamento progressivo de estresse em 5 rodadas","Métrica: Redução % de estresse por técnica"',
      '"Memória","Protocolo: ENAT COG-MEM v1.0","Método: Reprodução de sequências visuais com progressão exponencial","Métrica: Nível atingido e tempo de reação por estímulo"',
      "",
      "CONFORMIDADE LGPD",
      "",
      '"Este relatório foi gerado conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)"',
      '"Os dados pessoais contidos neste documento são confidenciais e de uso exclusivo do titular"',
      '"Direitos do titular: acessar, corrigir, excluir ou portar seus dados a qualquer momento"',
      '"Para exercer esses direitos, contate: privacy@enat.hsi"',
      "",
      "REFERÊNCIAS TÉCNICAS",
      '"Baseado em protocolos de neuroeducação aplicada"',
      '"Alinhado com governança metodológica ENAT HSI"',
      '"Supervisão: Comitê de Segurança Instrucional"',
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    getStoredResults,
    addTestResult,
    clearResults,
    exportToCSV,
  };
}

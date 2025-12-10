import { useCallback, useState } from "react";

export const ADVANCED_TESTS = {
  theoretical: [
    {
      id: "theory-001",
      title: "Fundamentos de Neuroeducação",
      description: "Teste teórico sobre os fundamentos da neuroeducação",
      questions: [
        {
          id: "q1",
          question: "O que é plasticidade neural?",
          options: [
            "A capacidade do cérebro de se adaptar e reorganizar ao longo da vida",
            "A rigidez do cérebro em manter padrões de comportamento",
            "A incapacidade de formar novas conexões neurais",
            "A morte de neurônios no envelhecimento",
          ],
          correct: 0,
          explanation:
            "Plasticidade neural é a capacidade fundamental do cérebro de se adaptar, reorganizar e formar novas conexões neurais em resposta à experiência e aprendizagem.",
        },
        {
          id: "q2",
          question: "Qual é o impacto das emoções positivas na aprendizagem?",
          options: [
            "Prejudicam a concentração",
            "Potencializam a memória e facilitam retenção",
            "Não têm efeito significativo",
            "Causam stress mental",
          ],
          correct: 1,
          explanation:
            "Emoções positivas aumentam a produção de neurotransmissores como dopamina e serotonina, potencializando a memória e facilitando a consolidação do aprendizado.",
        },
        {
          id: "q3",
          question: "Qual é a duração típica de um período crítico de desenvolvimento?",
          options: [
            "Toda a vida",
            "Primeiros 3 meses",
            "Primeiros 18 meses a 3 anos (varia conforme habilidade)",
            "Apenas na adolescência",
          ],
          correct: 2,
          explanation:
            "Períodos críticos variam por habilidade. Linguagem tem período crítico mais cedo (primeiros 3 anos), enquanto outras habilidades têm períodos críticos mais longos.",
        },
        {
          id: "q4",
          question: "O que é a teoria das múltiplas inteligências?",
          options: [
            "A ideia de que existe apenas uma forma de inteligência",
            "A proposição de que existem múltiplas formas independentes de inteligência",
            "Uma medida de QI",
            "Um tipo de deficiência intelectual",
          ],
          correct: 1,
          explanation:
            "A teoria das múltiplas inteligências, proposta por Howard Gardner, sugere que existem pelo menos 8 formas diferentes de inteligência (linguística, lógico-matemática, musical, corporal-cinestésica, espacial, naturalista, interpessoal e intrapessoal).",
        },
        {
          id: "q5",
          question: "Qual é o papel da manutenção do sono adequado na aprendizagem?",
          options: [
            "Nenhum impacto significativo",
            "Apenas melhora o humor",
            "Essencial para consolidação de memória e plasticidade neural",
            "Prejudica o aprendizado",
          ],
          correct: 2,
          explanation:
            "O sono é crucial para consolidação de memória e plasticidade neural. Durante o sono, o cérebro processa e integra informações aprendidas durante o dia.",
        },
        {
          id: "q6",
          question: "Qual técnica de ensino é mais alinhada com a neuroeducação?",
          options: [
            "Aulas passivas com memorização",
            "Aprendizagem ativa, diversificada e contextualizada",
            "Métodos que ignoram estilos de aprendizagem",
            "Teste frequente sem feedback",
          ],
          correct: 1,
          explanation:
            "Aprendizagem ativa, diversificada e contextualizada alinha-se melhor com os princípios de neuroeducação, engajando diferentes formas de inteligência.",
        },
        {
          id: "q7",
          question: "O que é memória de trabalho?",
          options: [
            "A memória de longo prazo",
            "A capacidade de manter e manipular informações por curto período",
            "A memória involuntária",
            "A memória de eventos traumáticos",
          ],
          correct: 1,
          explanation:
            "Memória de trabalho é a capacidade de manter e manipular informações mentalmente por um breve período, essencial para tarefas como cálculo mental e compreensão de texto.",
        },
        {
          id: "q8",
          question: "Quantos itens aproximadamente uma pessoa pode manter na memória de trabalho?",
          options: ["2-3 itens", "5-9 itens", "12-15 itens", "20+ itens"],
          correct: 1,
          explanation:
            "A capacidade típica da memória de trabalho é de cerca de 5-9 itens (frequentemente citado como 7±2), dependendo da idade e treinamento.",
        },
        {
          id: "q9",
          question: "O que é mielinização?",
          options: [
            "A morte de neurônios",
            "A formação de bainha de mielina ao redor dos axônios, acelerando transmissão",
            "A redução de conexões sinápticas",
            "Uma doença neurológica",
          ],
          correct: 1,
          explanation:
            "Mielinização é o processo de formação de bainha de mielina ao redor dos axônios, aumentando a velocidade de transmissão de sinais neurais, continuando até a adolescência.",
        },
        {
          id: "q10",
          question: "Qual é a importância da prática espaçada na aprendizagem?",
          options: [
            "Não tem importância",
            "Prejudica a retenção",
            "Melhora significativamente a consolidação de longo prazo",
            "Só funciona para adultos",
          ],
          correct: 2,
          explanation:
            "Prática espaçada (revisar material em intervalos crescentes) é uma das técnicas mais eficazes para consolidação de memória de longo prazo, comprovada por pesquisas neurobiológicas.",
        },
      ],
    },
    {
      id: "theory-002",
      title: "Aplicação dos Simuladores ENAT",
      description: "Teste sobre o uso apropriado dos simuladores neuroeducacionais",
      questions: [
        {
          id: "q1",
          question: "Qual é o principal objetivo do simulador de Atenção?",
          options: [
            "Avaliar criatividade",
            "Medir discriminação seletiva de estímulos visuais",
            "Testar leitura rápida",
            "Avaliar tempo de reação geral",
          ],
          correct: 1,
          explanation:
            "O simulador de Atenção (SCE-ATN) avalia especificamente a capacidade de discriminação seletiva de estímulos visuais durante 30 segundos.",
        },
        {
          id: "q2",
          question: "Um aluno obtém 18 acertos no teste de Atenção em 30 segundos. Qual é a interpretação?",
          options: [
            "Excelente (25-30)",
            "Acima da média (20-24)",
            "Média (15-19)",
            "Abaixo da média (menos de 15)",
          ],
          correct: 2,
          explanation:
            "18 acertos em 30 segundos indica atenção média. Escores de 15-19 representam uma faixa de atenção adequada, mas passível de melhoria.",
        },
        {
          id: "q3",
          question: "Qual é a faixa típica de tempo de reação normal em adultos?",
          options: [
            "150-200 ms",
            "300-500 ms",
            "700-1000 ms",
            "1500+ ms",
          ],
          correct: 1,
          explanation:
            "A faixa típica de tempo de reação em adultos está entre 300-500 ms, com 200-300 ms sendo considerado muito rápido.",
        },
        {
          id: "q4",
          question: "Qual técnica é recomendada para alunos com fraco controle emocional baseado no simulador?",
          options: [
            "Aumentar stress deliberadamente",
            "Evitar desafios",
            "Ensinar técnicas de respiração, meditação e mindfulness",
            "Medicação sem avaliação",
          ],
          correct: 2,
          explanation:
            "Para alunos com fraco controle emocional, técnicas comprovadas como respiração profunda, meditação e mindfulness são as mais eficazes.",
        },
        {
          id: "q5",
          question: "Qual é a métrica principal do simulador de Memória?",
          options: [
            "Tempo total gasto",
            "Número de erros",
            "Nível atingido na sequência",
            "Velocidade de clique",
          ],
          correct: 2,
          explanation:
            "O simulador de Memória (COG-MEM) mede o nível atingido na sequência de cores com dificuldade progressiva, não apenas o tempo.",
        },
      ],
    },
  ],
  practical: [
    {
      id: "prac-001",
      title: "Análise de Caso - Aluno com Fraca Atenção",
      description: "Avalie um caso de aluno com dificuldades de atenção",
      scenario: `
        João é um aluno de 10 anos que consistentemente obtém scores baixos no simulador de Atenção (média de 12 acertos em 30 segundos). 
        Ele frequentemente se distrai em aula, tem dificuldade em completar tarefas de leitura e parece ter energia excedente.
        Seu teste de tempo de reação é normal (350 ms), e sua memória é acima da média.
      `,
      questions: [
        {
          id: "q1",
          question:
            "Qual é a interpretação mais provável do perfil de João baseado nos dados?",
          options: [
            "Deficiência intelectual",
            "Dificuldade específica de atenção seletiva com energia/motricidade preservadas",
            "Problemas auditivos",
            "Distúrbio de aprendizagem severo",
          ],
          correct: 1,
          explanation:
            "João mostra um padrão específico: fraca atenção seletiva, mas reação normal e memória acima da média, sugerindo que sua principal dificuldade é discriminação seletiva.",
        },
        {
          id: "q2",
          question: "Qual estratégia seria MENOS apropriada para João?",
          options: [
            "Exercícios de foco progressivo e meditação",
            "Reduzir distrações no ambiente de aula",
            "Forçá-lo a permanecer imóvel por longos períodos",
            "Atividades que combinem movimento com foco mental",
          ],
          correct: 2,
          explanation:
            "Forçar imobilidade pode ser contraproducente. João parece ter necessidade de movimento. Integrar movimento com aprendizagem (like aprendizagem cinestésica) seria mais eficaz.",
        },
        {
          id: "q3",
          question:
            "Qual seria o próximo passo recomendado após diagnóstico?",
          options: [
            "Prescrever medicação imediatamente",
            "Ignorar o resultado",
            "Implementar programa de treinamento de atenção com feedback regular e reteste em 4-6 semanas",
            "Transferir para classe especial",
          ],
          correct: 2,
          explanation:
            "O protocolo apropriado é implementar intervenção específica com acompanhamento sistemático e reteste para medir progresso, evitando saltos prematuros para medicação.",
        },
      ],
    },
    {
      id: "prac-002",
      title: "Planejamento de Intervenção",
      description: "Crie um plano de intervenção baseado em dados",
      scenario: `
        Uma classe de 25 alunos foi testada com os 4 simuladores ENAT. 
        Resultados: 8 alunos com fraca atenção, 5 com tempo de reação lento, 12 com controle emocional abaixo da média, 3 com memória fraca.
        Há sobreposição (alguns alunos com múltiplas dificuldades).
      `,
      questions: [
        {
          id: "q1",
          question:
            "Qual seria a abordagem mais eficiente para intervir com toda a classe?",
          options: [
            "Intervenções individuais isoladas",
            "Um programa de classe que trabalha todas as áreas simultaneamente",
            "Programa focado no maior grupo (controle emocional) + grupos pequenos para outras",
            "Nenhuma intervenção é necessária",
          ],
          correct: 2,
          explanation:
            "A abordagem mais eficiente é um programa de classe que aborda controle emocional (beneficiando a maioria) mais pequenos grupos focados nas outras áreas.",
        },
        {
          id: "q2",
          question:
            "Qual seria o principal benefício esperado de um programa de controle emocional em uma classe?",
          options: [
            "Apenas melhora na memória",
            "Melhora geral de todas as habilidades cognitivas, pois reduz stress prejudicial à aprendizagem",
            "Diminuição de interesse acadêmico",
            "Sem relação com desempenho acadêmico",
          ],
          correct: 1,
          explanation:
            "Stress crônico prejudica cognição. Melhorar controle emocional reduz stress, melhorando atenção, memória, tempo de reação e desempenho geral.",
        },
      ],
    },
  ],
};

export function useAdvancedTests() {
  const [testAnswers, setTestAnswers] = useState(() => {
    const stored = localStorage.getItem("enat_test_answers");
    return stored ? JSON.parse(stored) : {};
  });

  const [testResults, setTestResults] = useState(() => {
    const stored = localStorage.getItem("enat_test_results_advanced");
    return stored ? JSON.parse(stored) : [];
  });

  const [certificateData, setCertificateData] = useState(() => {
    const stored = localStorage.getItem("enat_certificates");
    return stored ? JSON.parse(stored) : [];
  });

  const submitTest = useCallback(
    (testId, answers, userId) => {
      const test = Object.values(ADVANCED_TESTS)
        .flat()
        .find((t) => t.id === testId);

      if (!test) return null;

      // Limite de tentativas diárias por teste: 2 por dia
      const today = new Date().toDateString();
      const attemptsToday = testResults.filter(
        (r) => r.userId === userId && r.testId === testId && new Date(r.timestamp).toDateString() === today
      ).length;
      if (attemptsToday >= 2) {
        return {
          error: "limit",
          message: "Limite de 2 tentativas diárias atingido para este teste.",
          attemptsToday,
        };
      }

      let correctCount = 0;
      const detailedAnswers = [];

      test.questions.forEach((question, idx) => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correct;
        if (isCorrect) correctCount++;

        detailedAnswers.push({
          questionId: question.id,
          question: question.question,
          userAnswer,
          correctAnswer: question.correct,
          isCorrect,
          explanation: question.explanation,
        });
      });

      const score = Math.round((correctCount / test.questions.length) * 10);
      const approved = score >= 7;

      const result = {
        id: Date.now(),
        testId,
        userId,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString("pt-BR"),
        score,
        approved,
        correctCount,
        totalQuestions: test.questions.length,
        detailedAnswers,
        testTitle: test.title,
      };

      const updated = [...testResults, result];
      setTestResults(updated);
      localStorage.setItem("enat_test_results_advanced", JSON.stringify(updated));

      // Gera certificado se aprovado
      if (approved) {
        // Gera certificado e inicia geração de PDF assincronamente
        const cert = generateCertificate(testId, userId, score, test.title);
        result.certificateId = cert.id;
      }

      return result;
    },
    [testResults]
  );

  const generateCertificate = useCallback(
    (testId, userId, score, testTitle) => {
      const certificate = {
        id: `CERT-${Date.now()}`,
        testId,
        userId,
        testTitle,
        score,
        issuedAt: new Date().toISOString(),
        issuedDate: new Date().toLocaleDateString("pt-BR"),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR"),
        pdfDataUrl: null,
      };

      const updated = [...certificateData, certificate];
      setCertificateData(updated);
      localStorage.setItem("enat_certificates", JSON.stringify(updated));

      // Async: gerar PDF do certificado usando jspdf e anexar dataUrl
      (async () => {
        try {
          const { jsPDF } = await import("jspdf");
          const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
          doc.setFontSize(22);
          doc.text("CERTIFICADO ENAT HSI", 40, 80);
          doc.setFontSize(14);
          doc.text(`ID: ${certificate.id}`, 40, 110);
          doc.text(`Usuário ID: ${userId}`, 40, 140);
          doc.text(`Teste: ${testTitle}`, 40, 170);
          doc.text(`Pontuação: ${score}/10`, 40, 200);
          doc.text(`Emissão: ${certificate.issuedDate}`, 40, 230);
          doc.text(`Validade: ${certificate.expiresDate}`, 40, 260);

          // Marca d'água simples
          doc.setTextColor(200, 200, 200);
          doc.setFontSize(48);
          doc.text("ENAT HSI", 300, 220, { angle: 45 });

          const dataUrl = doc.output("datauristring");

          // Atualiza o certificado com o pdfDataUrl
          const refreshed = (localStorage.getItem("enat_certificates")
            ? JSON.parse(localStorage.getItem("enat_certificates"))
            : []).map((c) => (c.id === certificate.id ? { ...c, pdfDataUrl: dataUrl } : c));

          setCertificateData(refreshed);
          localStorage.setItem("enat_certificates", JSON.stringify(refreshed));
        } catch (err) {
          // falha na geração do PDF — não bloqueia o fluxo
        }
      })();

      return certificate;
    },
    [certificateData]
  );

  const getUserCertificates = useCallback(
    (userId) => {
      return certificateData.filter((cert) => cert.userId === userId);
    },
    [certificateData]
  );

  const getUserTestResults = useCallback(
    (userId) => {
      return testResults.filter((result) => result.userId === userId);
    },
    [testResults]
  );

  const getAverageScore = useCallback(
    (userId) => {
      const results = getUserTestResults(userId);
      if (results.length === 0) return 0;
      const sum = results.reduce((acc, result) => acc + result.score, 0);
      return Math.round(sum / results.length);
    },
    [testResults]
  );

  const getAllTests = useCallback(() => {
    return [...ADVANCED_TESTS.theoretical, ...ADVANCED_TESTS.practical];
  }, []);

  return {
    submitTest,
    generateCertificate,
    getUserCertificates,
    getUserTestResults,
    getAverageScore,
    getAllTests,
    ADVANCED_TESTS,
    testResults,
    certificateData,
  };
}

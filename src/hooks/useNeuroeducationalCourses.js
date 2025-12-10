import { useCallback, useState } from "react";

export const NEUROEDUCATIONAL_COURSES = {
  instructor: [
    {
      id: "inst-001",
      title: "Fundamentos da Neuroeducação",
      description: "Entenda os princípios básicos da neuroeducação e como o cérebro aprende",
      duration: "4 horas",
      level: "Iniciante",
      modules: [
        "Introdução ao cérebro e aprendizagem",
        "Plasticidade neural e desenvolvimento cognitivo",
        "Aplicações práticas em sala de aula",
      ],
      content: `
# Fundamentos da Neuroeducação

## O que é Neuroeducação?
Neuroeducação é a intersecção entre neurociência, psicologia e educação, que busca compreender como o cérebro aprende para otimizar o processo educacional.

## Princípios Fundamentais

### 1. Plasticidade Neural
- O cérebro é capaz de se adaptar e reorganizar ao longo da vida
- Novas conexões neurais são formadas com a aprendizagem
- A repetição e prática consolidam essas conexões

### 2. Períodos Críticos e Sensíveis
- Alguns períodos são mais propícios para certos aprendizados
- Isso não significa que não se possa aprender depois, mas é mais desafiador
- A motivação e interesse podem acelerar o aprendizado

### 3. Emoção e Aprendizagem
- Emoções positivas potencializam a memória
- Estresse crônico prejudica a aprendizagem
- Um ambiente seguro e acolhedor é essencial

### 4. Múltiplas Inteligências
- Cada pessoa tem um perfil único de inteligências
- Ensino deve ser diversificado para atingir diferentes estilos de aprendizagem
- Inteligência não é fixa e pode ser desenvolvida

## Aplicações em Sala de Aula

### Estratégias Neuroeducacionais
1. **Atenção Focada**: Use estímulos visuais, auditivos e cinestésicos
2. **Memória**: Revise conceitos em intervalos espaçados
3. **Motivação**: Conecte aprendizagem a objetivos pessoais do aluno
4. **Movimento**: Incorpore atividades físicas na aula
5. **Sono**: Enfatize a importância do descanso para consolidação da memória

## Avaliação Baseada em Neurociência
- Avalie diferentes tipos de inteligência
- Permita diferentes formatos de demonstração de conhecimento
- Forneça feedback construtivo e imediato
      `,
      objectives: [
        "Compreender os princípios básicos da neuroeducação",
        "Aplicar conhecimentos de neurociência em contexto educacional",
        "Adaptar metodologia de ensino para otimizar aprendizagem",
      ],
    },
    {
      id: "inst-002",
      title: "Simuladores ENAT HSI - Modo Instrutor",
      description: "Domine o uso dos simuladores neuroeducacionais ENAT HSI para avaliar seus alunos",
      duration: "3 horas",
      level: "Intermediário",
      modules: [
        "Visão geral dos simuladores",
        "Interpretação de resultados",
        "Planejamento de atividades com simuladores",
      ],
      content: `
# Simuladores ENAT HSI - Modo Instrutor

## Visão Geral dos 4 Simuladores

### 1. Teste de Atenção (SCE-ATN)
**Objetivo**: Avaliar capacidade de discriminação seletiva de estímulos visuais

- **Duração**: 30 segundos
- **Protocolo**: ENAT SCE-ATN v1.0
- **Método**: O aluno clica nos quadrados da cor indicada
- **Métrica**: Número de acertos em 30 segundos
- **O que mede**: Atenção seletiva, velocidade de processamento

**Interpretação**:
- 25-30 acertos: Atenção excelente
- 20-24 acertos: Atenção acima da média
- 15-19 acertos: Atenção média
- Menos de 15: Pode beneficiar-se de treinamento de atenção

### 2. Teste de Tempo de Reação (SIS-RXN)
**Objetivo**: Medir tempo-de-reação a estímulos visuais não-previsíveis

- **Protocolo**: ENAT SIS-RXN v1.0
- **Método**: Aluno clica quando o campo fica verde
- **Tempo de espera**: 2-5 segundos aleatório
- **Métrica**: Milissegundos (ms)
- **O que mede**: Velocidade de processamento, reflexos

**Interpretação**:
- 200-300 ms: Reação muito rápida
- 300-400 ms: Reação rápida
- 400-500 ms: Reação média
- Acima de 500 ms: Reação lenta (pode indicar fadiga ou falta de atenção)

### 3. Teste de Controle Emocional (SCE-EMO)
**Objetivo**: Avaliar capacidade de gerenciar estresse e usar técnicas de controle emocional

- **Protocolo**: ENAT SCE-EMO v1.0
- **Método**: 5 rodadas com aumento progressivo de estresse
- **Técnicas disponíveis**: Respiração, Música, Meditação, Caminhada
- **Métrica**: Redução percentual de estresse por técnica
- **O que mede**: Inteligência emocional, resiliência, autorregulação

**Interpretação**:
- Score acima de 400: Excelente controle emocional
- 300-400: Bom controle emocional
- 200-300: Controle emocional adequado
- Abaixo de 200: Necessita desenvolvimento de habilidades emocionais

### 4. Teste de Memória (COG-MEM)
**Objetivo**: Avaliar memória de trabalho e capacidade de retenção

- **Protocolo**: ENAT COG-MEM v1.0
- **Método**: Reproduzir sequências de cores com dificuldade progressiva
- **Cores**: 4 cores diferentes
- **Métrica**: Nível atingido, score = 10 × nível
- **O que mede**: Memória de trabalho, concentração, progressão de aprendizado

**Interpretação**:
- Nível 8+: Memória de trabalho excelente
- Nível 6-7: Memória de trabalho acima da média
- Nível 4-5: Memória de trabalho média
- Nível 1-3: Memória de trabalho abaixo da média

## Como Usar em Sala de Aula

### Planejamento de Atividades
1. **Diagnóstico Inicial**: Use os simuladores para avaliar capacidades iniciais
2. **Intervenção Focada**: Escolha simuladores para trabalhar áreas fracas
3. **Acompanhamento**: Reavalie regularmente para medir progresso
4. **Relatórios**: Analise tendências ao longo do tempo

### Estratégias de Ensino Baseadas em Resultados

**Alunos com fraca atenção**:
- Trabalhe atividades de foco progressivo
- Use técnicas de meditação ou mindfulness
- Reduza distrações no ambiente

**Alunos com tempo-de-reação lento**:
- Pratique discriminação rápida de estímulos
- Trabalhe velocidade de processamento
- Implemente desafios progressivos

**Alunos com fraco controle emocional**:
- Ensine técnicas de respiração e meditação
- Desenvolva resiliência e autorregulação
- Crie ambiente seguro e previsível

**Alunos com fraca memória de trabalho**:
- Chunking: dividir informações em partes menores
- Repetição e revisão espaçada
- Técnicas de mnemônica
      `,
      objectives: [
        "Entender cada simulador ENAT HSI",
        "Interpretar resultados de alunos",
        "Planejar intervenções baseadas em dados",
      ],
    },
  ],
  student: [
    {
      id: "aluno-001",
      title: "Introdução aos Testes Neuroeducacionais",
      description: "Conheça os testes que você realizará e como funcionam",
      duration: "1 hora",
      level: "Iniciante",
      modules: [
        "O que são testes neuroeducacionais",
        "Os 4 simuladores ENAT HSI",
        "Como se preparar para os testes",
      ],
      content: `
# Introdução aos Testes Neuroeducacionais

## O que são Testes Neuroeducacionais?

Testes neuroeducacionais são atividades interativas que medem diferentes capacidades cognitivas e emocionais. Eles ajudam a:

✓ Identificar suas forças e áreas para melhorar
✓ Acompanhar seu progresso ao longo do tempo
✓ Personalizar sua aprendizagem
✓ Oferecer feedback sobre seu desempenho

## Os 4 Simuladores ENAT HSI

### 1️⃣ Teste de Atenção
- **Tempo**: 30 segundos
- **Desafio**: Clique nos quadrados da cor indicada o máximo de vezes
- **O que testa**: Sua capacidade de focar e reagir rapidamente

### 2️⃣ Teste de Tempo de Reação
- **Desafio**: Clique assim que um campo fica verde
- **Tentativas**: Quantas você quiser
- **O que testa**: Sua velocidade de resposta a estímulos

### 3️⃣ Teste de Controle Emocional
- **Rounds**: 5 rodadas com dificuldade progressiva
- **Técnicas**: Use respiração, música, meditação ou caminhada para reduzir estresse
- **O que testa**: Como você lida com pressão e estresse

### 4️⃣ Teste de Memória
- **Desafio**: Reproduza sequências de cores que aumentam em dificuldade
- **Progressão**: Continue até não conseguir repetir
- **O que testa**: Sua memória de trabalho e concentração

## Como se Preparar

### Antes do Teste
✅ Durma bem na noite anterior
✅ Coma uma refeição leve e saudável
✅ Respire profundamente e relaxe
✅ Tenha ambiente silencioso
✅ Certifique-se de que não há distrações

### Durante o Teste
✅ Leia as instruções com cuidado
✅ Faça o seu melhor, sem se estressar
✅ Lembre-se: não é uma "prova" para passar/falhar
✅ Use feedback para aprender

### Após o Teste
✅ Revise seus resultados
✅ Identifique áreas para melhorar
✅ Peça orientação ao seu instrutor
✅ Retest após praticar para ver progresso

## Dicas de Desempenho

### Para Atenção
- Concentre-se 100% no objetivo
- Não se preocupe com erros passados
- Mantenha um ritmo constante

### Para Reação Rápida
- Mantenha-se alerta e focado
- Não tense os músculos desnecessariamente
- Pratique regularmente

### Para Controle Emocional
- Explore diferentes técnicas
- Descubra qual funciona melhor para você
- Pratique respiração profunda

### Para Memória
- Procure por padrões na sequência
- Memorize em chunks, não item por item
- Não desista rapidamente

## Próximos Passos

1. Faça uma avaliação inicial de todos os 4 testes
2. Revise seus resultados com seu instrutor
3. Identifique suas 2-3 principais áreas de foco
4. Comece a treinar nessas áreas
5. Reteste em 2-3 semanas para avaliar progresso
      `,
      objectives: [
        "Entender o propósito de cada teste",
        "Conhecer as instruções de cada simulador",
        "Preparar-se adequadamente para os testes",
      ],
    },
    {
      id: "aluno-002",
      title: "Técnicas de Melhoria de Atenção",
      description: "Aprenda estratégias para melhorar sua capacidade de foco e atenção",
      duration: "2 horas",
      level: "Intermediário",
      modules: [
        "Como funciona a atenção",
        "Fatores que afetam a atenção",
        "Exercícios práticos de atenção",
      ],
      content: `
# Técnicas de Melhoria de Atenção

## Como Funciona a Atenção?

Atenção é a capacidade de focar a consciência em algo específico, filtrando informações irrelevantes. Existem diferentes tipos:

### Tipos de Atenção
- **Atenção Focada**: Concentrar em UM estímulo
- **Atenção Seletiva**: Focar em um estímulo enquanto ignora outros
- **Atenção Sustentada**: Manter foco por longos períodos
- **Atenção Alternada**: Mudar foco entre diferentes tarefas

## Fatores que Afetam a Atenção

### Fatores Positivos ✅
- Interesse e motivação pela tarefa
- Ambiente calmo e sem distrações
- Sono adequado (7-9 horas)
- Nutrição balanceada
- Exercício físico regular
- Redução de estresse
- Prática e repetição

### Fatores Negativos ❌
- Distrações externas (barulho, telefone)
- Distrações internas (pensamentos)
- Fadiga e sono inadequado
- Má nutrição
- Falta de exercício
- Estresse e ansiedade crônica
- Excesso de multitarefa

## Exercícios Práticos

### Exercício 1: Foco no Ponto
1. Coloque um ponto em uma folha
2. Olhe fixamente para o ponto por 1 minuto
3. Anote qualquer pensamento que distraia você
4. Volte o foco ao ponto
5. Aumente gradualmente para 5-10 minutos

### Exercício 2: Contagem Regressiva
1. Escolha um número (ex: 100)
2. Conte regressivamente de 1 em 1
3. Se perder o foco, comece novamente
4. Objetivo: Fazer sem erros

### Exercício 3: Leitura Focada
1. Escolha um texto interessante
2. Leia por 10 minutos sem parar
3. Anote quantas vezes perdeu o foco
4. Aumente tempo gradualmente

### Exercício 4: Meditação de Respiração
1. Sente confortavelmente
2. Respire profundamente: inspire 4 tempos, segure 4, expire 4
3. Conte cada respiração
4. Se der deriva, volte à contagem
5. Pratique 5-10 minutos diariamente

## Técnicas de Melhoria

### Técnica Pomodoro
- Trabalhe focado por 25 minutos
- Faça pausa de 5 minutos
- Após 4 ciclos, pausa de 15 minutos
- Aumenta produtividade e foco

### Bloqueio de Distrações
1. Desligue notificações do telefone
2. Feche abas de internet desnecessárias
3. Avise que não será incomodado
4. Use fones com ruído branco ou música instrumental

### Ambiente Otimizado
- Luz natural ou iluminação adequada
- Temperatura confortável (18-22°C)
- Mobiliário ergonômico
- Sem poluição visual
- Ar limpo e ventilado

## Progresso com ENAT HSI

### Semana 1-2: Avaliação
- Faça teste de atenção para linha de base
- Pratique exercícios básicos

### Semana 3-4: Treinamento
- Continue exercícios
- Aumente dificuldade e tempo
- Aplique técnicas no dia a dia

### Semana 5-6: Reteste
- Faça teste de atenção novamente
- Compare com baseline
- Ajuste estratégia se necessário

### Progresso Esperado
- Melhora de 20-30% é realista em 6 semanas
- Consistência é mais importante que intensidade
- Cérebro melhora com prática regular

## Dicas Finais

🧠 **Paciência**: Atenção é um músculo, leva tempo para desenvolver
📅 **Consistência**: Pequenas práticas diárias são melhores que longas ocasionais
🌟 **Variedade**: Alterne entre exercícios para não ficar entediado
📊 **Acompanhamento**: Use os testes ENAT HSI para medir progresso real
      `,
      objectives: [
        "Compreender como a atenção funciona",
        "Identificar fatores que afetam foco",
        "Aplicar técnicas de melhoria de atenção",
      ],
    },
  ],
};

export function useNeuroeducationalCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState(() => {
    const stored = localStorage.getItem("enat_enrolled_courses");
    return stored ? JSON.parse(stored) : [];
  });

  const [courseProgress, setCourseProgress] = useState(() => {
    const stored = localStorage.getItem("enat_course_progress");
    return stored ? JSON.parse(stored) : {};
  });

  const getCoursesByRole = useCallback((role) => {
    return role === "instrutor"
      ? NEUROEDUCATIONAL_COURSES.instructor
      : NEUROEDUCATIONAL_COURSES.student;
  }, []);

  const enrollCourse = useCallback(
    (courseId, userId) => {
      const newEnrollment = {
        courseId,
        userId,
        enrolledAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
      };

      const updated = [...enrolledCourses, newEnrollment];
      setEnrolledCourses(updated);
      localStorage.setItem("enat_enrolled_courses", JSON.stringify(updated));
    },
    [enrolledCourses]
  );

  const isEnrolled = useCallback((courseId, userId) => {
    return enrolledCourses.some((e) => e.courseId === courseId && e.userId === userId);
  }, [enrolledCourses]);

  const completeCourse = useCallback(
    (courseId, userId) => {
      const updated = enrolledCourses.map((e) =>
        e.courseId === courseId && e.userId === userId
          ? { ...e, completed: true, completedAt: new Date().toISOString() }
          : e
      );
      setEnrolledCourses(updated);
      localStorage.setItem("enat_enrolled_courses", JSON.stringify(updated));
    },
    [enrolledCourses]
  );

  const updateModuleProgress = useCallback((courseId, moduleIndex, completed) => {
    const key = `${courseId}-module-${moduleIndex}`;
    const updated = { ...courseProgress, [key]: completed };
    setCourseProgress(updated);
    localStorage.setItem("enat_course_progress", JSON.stringify(updated));
  }, [courseProgress]);

  const getModuleProgress = useCallback((courseId, moduleIndex) => {
    const key = `${courseId}-module-${moduleIndex}`;
    return courseProgress[key] || false;
  }, [courseProgress]);

  const getCourseCompletion = useCallback(
    (courseId) => {
      const course = Object.values(NEUROEDUCATIONAL_COURSES)
        .flat()
        .find((c) => c.id === courseId);
      if (!course) return 0;

      const completed = course.modules.reduce((sum, _, index) => {
        return sum + (getModuleProgress(courseId, index) ? 1 : 0);
      }, 0);

      return Math.round((completed / course.modules.length) * 100);
    },
    [getModuleProgress]
  );

  return {
    getCoursesByRole,
    enrollCourse,
    isEnrolled,
    completeCourse,
    updateModuleProgress,
    getModuleProgress,
    getCourseCompletion,
    enrolledCourses,
  };
}

// Dados completos dos perfis DISC

export interface DISCProfile {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  characteristics: string[];
  strengths: string[];
  weaknesses: string[];
  communicationStyle: string;
  decisionMaking: string;
  motivators: string[];
  stressors: string[];
}

export interface DISCIndicator {
  id: string;
  profile: string;
  question: string;
  weight: number;
}

export interface Objection {
  type: string;
  description: string;
  customerSays: string;
  wrongResponse: string;
  correctResponse: string;
  explanation: string;
}

export interface SPINQuestion {
  type: "situation" | "problem" | "implication" | "need";
  question: string;
  purpose: string;
  example: string;
}

export const discProfiles: Record<string, DISCProfile> = {
  D: {
    id: "D",
    name: "Dominante",
    color: "red",
    icon: "🔴",
    description: "Direto, focado em resultados e ROI. Toma decisões rápidas e valoriza eficiência.",
    characteristics: [
      "Fala rápido e direto ao ponto",
      "Focado em resultados mensuráveis",
      "Linguagem assertiva e decisiva",
      "Impaciência com detalhes excessivos",
      "Orientado para ação imediata"
    ],
    strengths: [
      "Decisão rápida",
      "Foco em resultados",
      "Liderança natural",
      "Orientado para desafios"
    ],
    weaknesses: [
      "Pode ser impaciente",
      "Falta de atenção a detalhes",
      "Pode parecer agressivo",
      "Pouca paciência com processos longos"
    ],
    communicationStyle: "Seja direto, objetivo e focado em resultados. Use dados de ROI. Evite rodeios.",
    decisionMaking: "Rápido - baseado em resultados e eficiência",
    motivators: ["Desafios", "Controle", "Resultados", "Poder de decisão"],
    stressors: ["Processos lentos", "Falta de controle", "Detalhes excessivos", "Indecisão"]
  },
  I: {
    id: "I",
    name: "Influente",
    color: "yellow",
    icon: "🟡",
    description: "Entusiasta, conecta pela emoção e energia. Valoriza relacionamentos e histórias.",
    characteristics: [
      "Expressivo e entusiasta",
      "Usa muitas histórias e exemplos",
      "Linguagem positiva e animada",
      "Sociável e otimista",
      "Foca em relacionamentos"
    ],
    strengths: [
      "Entusiasmo contagiante",
      "Excelente networker",
      "Otimismo natural",
      "Persuasão através de histórias"
    ],
    weaknesses: [
      "Pode ser desorganizado",
      "Falta de foco em detalhes",
      "Toma decisões por emoção",
      "Dificuldade com dados técnicos"
    ],
    communicationStyle: "Seja entusiasta, use histórias de sucesso, mostre cases inspiradores. Seja pessoal.",
    decisionMaking: "Emocional - baseado em sentimentos e relacionamentos",
    motivators: ["Reconhecimento", "Networking", "Novidades", "Aprovação social"],
    stressors: ["Rejeição", "Detalhes técnicos", "Trabalho solitário", "Falta de reconhecimento"]
  },
  S: {
    id: "S",
    name: "Estável",
    color: "green",
    icon: "🟢",
    description: "Calmo, busca segurança e processos claros. Precisa de tempo para decidir.",
    characteristics: [
      "Fala pausadamente e calmamente",
      "Busca segurança e estabilidade",
      "Evita conflitos",
      "Faz perguntas sobre implementação",
      "Precisa de tempo para processar"
    ],
    strengths: [
      "Confiável e leal",
      "Excelente ouvinte",
      "Paciência natural",
      "Trabalho em equipe"
    ],
    weaknesses: [
      "Resistente a mudanças",
      "Evita confrontos",
      "Lento para decidir",
      "Pode ser passivo"
    ],
    communicationStyle: "Seja paciente, demonstre segurança, explique processos passo a passo. Dê garantias.",
    decisionMaking: "Lento - precisa de tempo e segurança",
    motivators: ["Estabilidade", "Segurança", "Harmonia", "Rotina clara"],
    stressors: ["Mudanças abruptas", "Pressão", "Conflitos", "Incerteza"]
  },
  C: {
    id: "C",
    name: "Conforme",
    color: "blue",
    icon: "🔵",
    description: "Analítico, foca em dados e detalhes. Precisa de provas e validação técnica.",
    characteristics: [
      "Foca em dados e detalhes técnicos",
      "Faz muitas perguntas específicas",
      "Linguagem precisa e formal",
      "Quer provas e evidências",
      "Analítico e cauteloso"
    ],
    strengths: [
      "Atenção aos detalhes",
      "Pensamento analítico",
      "Alta qualidade",
      "Baseado em fatos"
    ],
    weaknesses: [
      "Pode ser perfeccionista",
      "Lento para decidir",
      "Evita riscos",
      "Distante emocionalmente"
    ],
    communicationStyle: "Use dados, gráficos, estudos. Seja preciso. Forneça documentação completa.",
    decisionMaking: "Muito lento - baseado em análise detalhada",
    motivators: ["Precisão", "Qualidade", "Dados", "Excelência técnica"],
    stressors: ["Erros", "Falta de dados", "Pressão para decidir rápido", "Ambiguidade"]
  }
};

export const discIndicators: DISCIndicator[] = [
  // Dominante (D)
  { id: "d1", profile: "D", question: "Fala de forma direta e objetiva, sem rodeios", weight: 1 },
  { id: "d2", profile: "D", question: "Questiona ROI e resultados mensuráveis rapidamente", weight: 1 },
  { id: "d3", profile: "D", question: "Demonstra impaciência com detalhes ou processos longos", weight: 1 },
  
  // Influente (I)
  { id: "i1", profile: "I", question: "Usa linguagem entusiasta e expressiva", weight: 1 },
  { id: "i2", profile: "I", question: "Conta histórias pessoais ou menciona networking", weight: 1 },
  { id: "i3", profile: "I", question: "Demonstra preocupação com reconhecimento social", weight: 1 },
  
  // Estável (S)
  { id: "s1", profile: "S", question: "Fala de forma calma e pausada", weight: 1 },
  { id: "s2", profile: "S", question: "Faz perguntas sobre implementação e suporte", weight: 1 },
  { id: "s3", profile: "S", question: "Demonstra preocupação com mudanças e segurança", weight: 1 },
  
  // Conforme (C)
  { id: "c1", profile: "C", question: "Faz muitas perguntas técnicas e específicas", weight: 1 },
  { id: "c2", profile: "C", question: "Pede dados, estudos de caso ou comprovações", weight: 1 },
  { id: "c3", profile: "C", question: "Usa linguagem formal e precisa", weight: 1 },
];

export const objectionsByProfile: Record<string, Objection[]> = {
  D: [
    {
      type: "price",
      description: "Objeção de preço focada em ROI",
      customerSays: "Está muito caro. Qual o retorno que vou ter?",
      wrongResponse: "Nosso preço é justo e temos muitas funcionalidades.",
      correctResponse: "Ótima pergunta. Baseado no seu cenário, você economiza X horas/mês, o que representa R$ Y. O payback é em Z meses. Faz sentido?",
      explanation: "Dominantes precisam ver números claros de ROI e tempo de retorno."
    },
    {
      type: "timing",
      description: "Objeção de timing focada em urgência",
      customerSays: "Posso decidir isso depois, agora estou focado em outras prioridades.",
      wrongResponse: "Sem problemas, quando você quiser a gente retoma.",
      correctResponse: "Entendo. Só uma pergunta: qual o custo de manter o problema atual? Se resolvermos agora, você já ganha X de resultado este mês.",
      explanation: "Crie urgência mostrando o custo da inação."
    },
    {
      type: "competition",
      description: "Comparação com concorrentes",
      customerSays: "A solução do concorrente é mais barata.",
      wrongResponse: "Mas a nossa tem mais funcionalidades.",
      correctResponse: "Ótimo que está comparando. Qual métrica é mais importante: preço inicial ou resultado final? Nossa solução entrega X% a mais de resultado.",
      explanation: "Redirecione para valor, não preço."
    }
  ],
  I: [
    {
      type: "social_proof",
      description: "Objeção sobre validação social",
      customerSays: "Quem mais usa isso? Não ouvi falar muito.",
      wrongResponse: "Temos muitos clientes, posso te mandar uma lista.",
      correctResponse: "Que bom que perguntou! [Nome de empresa conhecida] está tendo resultados incríveis. O [Nome da pessoa] me disse que [história de sucesso]. Quer que eu conecte vocês?",
      explanation: "Influentes precisam de histórias e conexões pessoais."
    },
    {
      type: "recognition",
      description: "Objeção sobre como será visto",
      customerSays: "Meu time vai me questionar essa decisão.",
      wrongResponse: "Não tem problema, a solução é boa.",
      correctResponse: "Imagina quando você apresentar os primeiros resultados? Seu time vai te ver como visionário. Posso te ajudar com um business case impressionante?",
      explanation: "Mostre como ele será reconhecido pela decisão."
    },
    {
      type: "enthusiasm",
      description: "Falta de entusiasmo",
      customerSays: "Parece interessante, mas não estou convencido.",
      wrongResponse: "O que mais posso mostrar?",
      correctResponse: "Deixa eu contar o que aconteceu com [cliente similar]... Quando eles começaram, estavam céticos também. Mas aí... [conte história inspiradora].",
      explanation: "Use storytelling emocional para gerar entusiasmo."
    }
  ],
  S: [
    {
      type: "change",
      description: "Objeção sobre mudança",
      customerSays: "Mudança é complicada, meu time está acostumado com o processo atual.",
      wrongResponse: "Mas a mudança é necessária para evoluir.",
      correctResponse: "Entendo perfeitamente. Por isso temos um processo de implementação passo a passo, com suporte dedicado. Você não vai estar sozinho. Posso mostrar como funciona?",
      explanation: "Demonstre segurança e processo estruturado."
    },
    {
      type: "support",
      description: "Objeção sobre suporte",
      customerSays: "E se der problema? Quem vai me ajudar?",
      wrongResponse: "Temos um suporte 24/7.",
      correctResponse: "Ótima pergunta. Você terá um gerente de conta dedicado, suporte prioritário e garantia de [X dias]. Nunca vai ficar desamparado. Isso te dá segurança?",
      explanation: "Estáveis precisam de garantias de suporte."
    },
    {
      type: "time",
      description: "Objeção sobre tempo de implementação",
      customerSays: "Parece que vai tomar muito tempo do meu time.",
      wrongResponse: "É rápido, em uma semana está pronto.",
      correctResponse: "Entendo a preocupação. Vamos implementar em etapas, sem sobrecarregar ninguém. Passo 1... Passo 2... E você tem suporte em cada etapa. Faz sentido?",
      explanation: "Mostre processo claro e suporte contínuo."
    }
  ],
  C: [
    {
      type: "data",
      description: "Objeção sobre falta de dados",
      customerSays: "Preciso ver dados e estudos de caso antes de decidir.",
      wrongResponse: "Posso te mostrar alguns casos rapidamente.",
      correctResponse: "Perfeito. Vou te enviar: (1) Estudo comparativo com concorrentes, (2) 3 cases detalhados do seu segmento, (3) Métricas de performance. Qual é mais importante?",
      explanation: "Forneça documentação técnica detalhada."
    },
    {
      type: "risk",
      description: "Objeção sobre riscos",
      customerSays: "Quais são os riscos? O que pode dar errado?",
      wrongResponse: "Não tem riscos, é muito seguro.",
      correctResponse: "Excelente pergunta. Os principais riscos são X, Y e Z. Para mitigá-los, temos [processos específicos]. Além disso, temos garantia de [período]. Quer que eu detalhe cada ponto?",
      explanation: "Seja transparente e mostre plano de mitigação."
    },
    {
      type: "technical",
      description: "Objeção técnica",
      customerSays: "Como isso se integra com nossos sistemas atuais?",
      wrongResponse: "Integramos com tudo, sem problemas.",
      correctResponse: "Ótima pergunta técnica. Temos API REST documentada, webhooks e conectores nativos para [sistemas]. Posso agendar uma demo técnica com nosso arquiteto?",
      explanation: "Seja preciso e técnico, ofereça profundidade."
    }
  ]
};

export const spinQuestionsByProfile: Record<string, SPINQuestion[]> = {
  D: [
    {
      type: "situation",
      question: "Qual é o seu maior objetivo de negócio para os próximos 6 meses?",
      purpose: "Identificar prioridades e métricas de sucesso",
      example: "Usar isso para ancorar a conversa em resultados mensuráveis"
    },
    {
      type: "problem",
      question: "O que está impedindo você de atingir esse objetivo mais rápido?",
      purpose: "Identificar obstáculos concretos",
      example: "Focar na perda de eficiência ou oportunidades perdidas"
    },
    {
      type: "implication",
      question: "Quanto esse problema está custando em termos de receita ou tempo perdido?",
      purpose: "Quantificar o impacto financeiro",
      example: "Traduzir o problema em números que o Dominante entende"
    },
    {
      type: "need",
      question: "Se você resolver isso, qual seria o impacto no resultado final do trimestre?",
      purpose: "Fazer o cliente se vender",
      example: "Deixar claro o ROI de resolver o problema agora"
    }
  ],
  I: [
    {
      type: "situation",
      question: "Como você gostaria de ser reconhecido pela sua equipe/empresa?",
      purpose: "Identificar motivações de reconhecimento",
      example: "Conectar a solução com status e visibilidade"
    },
    {
      type: "problem",
      question: "O que te frustra hoje que impede você de brilhar?",
      purpose: "Identificar problemas emocionais",
      example: "Focar em como o problema afeta a imagem dele"
    },
    {
      type: "implication",
      question: "Como isso afeta sua reputação com clientes/equipe?",
      purpose: "Explorar impacto na imagem",
      example: "Fazer sentir o custo social do problema"
    },
    {
      type: "need",
      question: "Imagina quando você apresentar esses resultados na próxima reunião...",
      purpose: "Criar visão de sucesso",
      example: "Pintar cenário de reconhecimento e admiração"
    }
  ],
  S: [
    {
      type: "situation",
      question: "Como está funcionando seu processo atual? Você e seu time estão confortáveis?",
      purpose: "Entender estabilidade atual",
      example: "Demonstrar empatia com a situação atual"
    },
    {
      type: "problem",
      question: "O que te preocupa sobre manter as coisas como estão?",
      purpose: "Identificar inseguranças",
      example: "Focar em riscos de não mudar, não em urgência"
    },
    {
      type: "implication",
      question: "Se esse problema continuar, como isso vai afetar a tranquilidade do seu time?",
      purpose: "Explorar impacto na harmonia",
      example: "Mostrar que manter status quo também tem riscos"
    },
    {
      type: "need",
      question: "Como seria ter um processo confiável e suporte sempre disponível?",
      purpose: "Pintar cenário de segurança",
      example: "Enfatizar estabilidade e suporte da solução"
    }
  ],
  C: [
    {
      type: "situation",
      question: "Quais métricas você usa para avaliar eficiência do processo atual?",
      purpose: "Estabelecer baseline quantitativo",
      example: "Obter dados precisos para comparação"
    },
    {
      type: "problem",
      question: "Quais são as principais ineficiências que você identificou nos dados?",
      purpose: "Identificar gaps analiticamente",
      example: "Focar em evidências e não opiniões"
    },
    {
      type: "implication",
      question: "Qual o impacto dessas ineficiências na qualidade final e nos indicadores-chave?",
      purpose: "Quantificar impacto técnico",
      example: "Traduzir problema em métricas mensuráveis"
    },
    {
      type: "need",
      question: "Com base nos dados, qual seria o ganho percentual de otimizar isso?",
      purpose: "Calcular ROI analiticamente",
      example: "Deixar claro o valor através de números precisos"
    }
  ]
};

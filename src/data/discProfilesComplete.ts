// Complete DISC Profiles with all features for Radar da Conversão

export interface DISCProfile {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  approach: string;
  trigger: string;
  characteristics: string[];
  strengths: string[];
  weaknesses: string[];
  communicationStyle: string;
  motivators: string[];
  decisionMaking: string;
  perguntas_abertas: {
    titulo: string;
    objetivo: string;
    caracteristicas: string;
    perguntas: string[];
  };
  social_selling: {
    titulo: string;
    objetivo: string;
    caracteristicas: string;
    estrategia_aproximacao: {
      titulo: string;
      descricao: string;
      tacticas: string[];
    };
    conteudo_engajamento: {
      titulo: string;
      descricao: string;
      tipos: string[];
    };
    scripts_dm: {
      titulo: string;
      descricao: string;
      scripts: Array<{
        situacao: string;
        script: string;
      }>;
    };
    timing_frequencia: {
      titulo: string;
      descricao: string;
      diretrizes: string[];
    };
    gatilhos_psicologicos: {
      titulo: string;
      descricao: string;
      gatilhos: string[];
    };
  };
  script: {
    objetivo: {
      caracteristicas: string;
      busca: string;
      evita: string;
      foco: string;
    };
    abertura: {
      titulo: string;
      script: string;
      gatilhos: string;
      tecnica?: string;
    };
    spin: {
      situacao: {
        titulo: string;
        objetivo: string;
        perguntas: string[];
        gatilhos: string;
      };
      problema: {
        titulo: string;
        objetivo: string;
        perguntas: string[];
        gatilhos: string;
      };
      implicacao: {
        titulo: string;
        objetivo: string;
        perguntas: string[];
        gatilhos: string;
      };
      necessidade: {
        titulo: string;
        objetivo: string;
        perguntas: string[];
        gatilhos: string;
      };
    };
    apresentacao: {
      titulo: string;
      script: string;
      gatilhos: string;
    };
    chamada: {
      titulo: string;
      script: string;
    };
    encaminhamento: {
      titulo: string;
      script: string;
    };
  };
}

export interface Objection {
  title: string;
  question: string;
  response: string;
}

export const discIndicators = [
  { label: "Fala rápida e direta", profile: "D" },
  { label: "Fala animada e com histórias", profile: "I" },
  { label: "Fala pausada e cuidadosa", profile: "S" },
  { label: "Fala técnica e analítica", profile: "C" },
  { label: "Tom de voz firme e decidido", profile: "D" },
  { label: "Tom de voz expressivo e emocional", profile: "I" },
  { label: "Tom de voz suave e estável", profile: "S" },
  { label: "Tom de voz neutro e racional", profile: "C" },
  { label: "Olhar direto e assertivo", profile: "D" },
  { label: "Sorriso, contato visual constante", profile: "I" },
  { label: "Expressão calma, receptiva", profile: "S" },
  { label: "Expressão séria, analítica", profile: "C" }
];

export const discProfiles: Record<string, DISCProfile> = {
  D: {
    id: "D",
    name: "Dominante",
    icon: "🟥",
    color: "red-500",
    description: "Focado em resultados, ROI e eficiência",
    approach: "🎯 Seja direto, foque em resultado e ROI",
    trigger: "🔥 Resultados tangíveis, liderança, ganho de tempo",
    characteristics: ["Direto", "Decisivo", "Orientado a resultados", "Competitivo", "Rápido"],
    strengths: ["Liderança natural", "Toma decisões rápidas", "Foco em resultados", "Superação de desafios"],
    weaknesses: ["Pode ser impaciente", "Menos sensível a emoções", "Pode ignorar detalhes"],
    communicationStyle: "Seja objetivo, direto e mostre resultados concretos",
    motivators: ["Desafios", "Controle", "Autoridade", "Resultados rápidos"],
    decisionMaking: "Decide rapidamente baseado em ROI e impacto direto",
    perguntas_abertas: {
      titulo: "Perguntas Abertas Estratégicas",
      objetivo: "fazer a pessoa falar sobre resultados, desafios e metas sem enrolação",
      caracteristicas: "Direto, Focado, Competitivo",
      perguntas: [
        "Qual foi a conquista mais importante que você teve nos últimos meses?",
        "Se pudesse eliminar um obstáculo do seu negócio hoje, qual seria?",
        "O que precisa acontecer para você considerar que esse ano foi excelente?",
        "Qual o próximo grande objetivo que você quer bater — e por quê?",
        "Onde você acha que está perdendo mais tempo ou dinheiro no momento?"
      ]
    },
    social_selling: {
      titulo: "Estratégia de Social Selling",
      objetivo: "conquistar perfis dominantes através de autoridade, resultados comprovados e abordagem direta",
      caracteristicas: "Foco em ROI, eficiência e liderança",
      estrategia_aproximacao: {
        titulo: "🎯 ESTRATÉGIA DE APROXIMAÇÃO",
        descricao: "Demonstre autoridade e resultados concretos desde o primeiro contato",
        tacticas: [
          "Compartilhe cases de sucesso com números específicos",
          "Comente em posts deles com insights valiosos (não elogios vazios)",
          "Envie conteúdo sobre otimização e eficiência",
          "Use dados e estatísticas nas interações",
          "Seja breve e objetivo em todas as comunicações"
        ]
      },
      conteudo_engajamento: {
        titulo: "📊 CONTEÚDO PARA ENGAJAMENTO",
        descricao: "Tipos de posts que atraem e engajam perfis dominantes",
        tipos: [
          "Posts com resultados numéricos (ROI, crescimento, economia de tempo)",
          "Comparativos de antes vs depois com métricas",
          "Estratégias de otimização e automação",
          "Cases de liderança e tomada de decisão",
          "Conteúdos sobre tendências de mercado com análises objetivas"
        ]
      },
      scripts_dm: {
        titulo: "💬 SCRIPTS PARA MENSAGEM DIRETA",
        descricao: "Abordagem direta e focada em resultados",
        scripts: [
          {
            situacao: "1. Primeiro contato (Conexão e pergunta abertura estratégica)",
            script: "Oi [Nome], tudo bem? Estava aqui analisando alguns perfis de empresários de resultados, e vi o seu. Percebi que você é [área de atuação] há [tempo], focado em performance. É isso mesmo?"
          },
          {
            situacao: "2. Mapeamento com dores fortes",
            script: "Está conseguindo escalar seus resultados sem depender 100% do seu tempo pessoal, ou ainda está muito operacional no dia a dia?"
          },
          {
            situacao: "3. Mapeamento qualificatório",
            script: "Hoje, qual seu faturamento mensal? E qual meta você quer bater nos próximos 90 dias? Quanto você está disposto a investir para acelerar esse processo de crescimento?"
          },
          {
            situacao: "4. Direcionamento (Características que levam para a call)",
            script: "Perfeito, pelo que você falou, na [Nome da Empresa], desenvolvemos um sistema que já ajudou [número] empresários como você a dobrar resultados em 90 dias. É um diagnóstico de 30 minutos, sem enrolação, focado em ROI. Mapeamos exatamente onde está o gargalo e você sai com um plano de ação claro. Faz sentido pra você?"
          },
          {
            situacao: "5. Marcação de call",
            script: "Tenho horário terça às 15h ou quarta às 10h, qual funciona melhor? Fechado! Vou te enviar o link agora. É pontual, 30 minutos exatos para maximizar seu tempo. Obrigado!"
          }
        ]
      },
      timing_frequencia: {
        titulo: "⏰ TIMING E FREQUÊNCIA",
        descricao: "Quando e com que frequência abordar",
        diretrizes: [
          "Responda rapidamente (perfis D valorizam agilidade)",
          "Poste conteúdos de manhã cedo (6h-8h) ou final do dia (18h-20h)",
          "Mantenha frequência alta mas sempre com valor",
          "Evite finais de semana (focam no trabalho durante a semana)",
          "Use calls para ação claras e diretas em todos os posts"
        ]
      },
      gatilhos_psicologicos: {
        titulo: "🧠 GATILHOS PSICOLÓGICOS",
        descricao: "Elementos que ativam o interesse de perfis dominantes",
        gatilhos: [
          "Escassez: 'Apenas para 5 empresários'",
          "Autoridade: 'Método usado por líderes do setor'",
          "Resultado: 'ROI comprovado de 300%'",
          "Urgência: 'Oportunidade limitada até sexta'",
          "Exclusividade: 'Estratégia não divulgada publicamente'"
        ]
      }
    },
    script: {
      objetivo: {
        caracteristicas: "Pessoa prática, impaciente e direta.",
        busca: "resultado, ganho de tempo, autoridade e impacto direto",
        evita: "conversa fiada, detalhes excessivos e falta de foco",
        foco: "Isso me dá resultado? Quanto eu ganho? Em quanto tempo?"
      },
      abertura: {
        titulo: "ABERTURA RÁPIDA (CONEXÃO)",
        script: "Oi [Nome], tudo certo? Vamos direto ao ponto: essa conversa é pra identificar se o que temos aqui pode gerar retorno pra você. Fechado?",
        gatilhos: "Controle, autoridade, ROI"
      },
      spin: {
        situacao: {
          titulo: "PERGUNTAS DE SITUAÇÃO (SPIN: S)",
          objetivo: "entender rapidamente o cenário atual com foco em números e alavancas de resultado",
          perguntas: [
            "Hoje, qual canal ou estratégia mais te traz faturamento?",
            "Quanto você fatura por mês atualmente com isso?",
            "Você quer crescer quanto nos próximos 90 dias?"
          ],
          gatilhos: "Clareza, foco, metas, ROI"
        },
        problema: {
          titulo: "PERGUNTAS DE PROBLEMA (SPIN: P)",
          objetivo: "expor os obstáculos que impedem performance máxima",
          perguntas: [
            "O que exatamente está te travando de bater esse número?",
            "Já tentou resolver isso como antes? O que não funcionou?",
            "E o que mais te incomoda em relação a isso hoje?"
          ],
          gatilhos: "Urgência, dor clara, frustração, desafio"
        },
        implicacao: {
          titulo: "PERGUNTAS DE IMPLICAÇÃO (SPIN: I)",
          objetivo: "mostrar as consequências da inação com foco em perda de dinheiro, tempo ou autoridade",
          perguntas: [
            "Se isso continuar assim, quanto você estima que perde por mês?",
            "Já parou pra calcular o impacto disso no seu resultado final?",
            "O que você deixaria de conquistar se seguir nesse ritmo?"
          ],
          gatilhos: "Custo da inação, urgência, ROI negativo"
        },
        necessidade: {
          titulo: "PERGUNTAS DE NECESSIDADE DE SOLUÇÃO (SPIN: N)",
          objetivo: "ativar o desejo de solução eficaz e direta",
          perguntas: [
            "Se eu te mostrasse uma estratégia com ROI em 30 dias, que elimina esses travamentos, faria sentido pra você?",
            "Qual o cenário ideal pra você nos próximos 60 dias? Se a gente traçar um plano objetivo, te interessa executar com foco?"
          ],
          gatilhos: "Ganho rápido, execução, clareza de solução"
        }
      },
      apresentacao: {
        titulo: "APRESENTAÇÃO DO MÉTODO",
        script: "Olhando o que você compartilhou, o método que a gente trabalha tem foco exatamente nisso: acelerar resultado, com estrutura direta. O que mais tem dado retorno pra perfis como o seu é [exemplo de caso real com ROI].",
        gatilhos: "Prova, autoridade, resultado financeiro"
      },
      chamada: {
        titulo: "CHAMADA PRA AÇÃO",
        script: "Quer seguir nessa linha e ver o plano de ação mais direto pra você bater essa meta em até 30 dias?"
      },
      encaminhamento: {
        titulo: "ENCAMINHAMENTO (FECHAMENTO PARCIAL)",
        script: "Se fizer sentido, já te coloco no radar do time pra próxima fase. Posso te passar os próximos passos agora?"
      }
    }
  },
  I: {
    id: "I",
    name: "Influente",
    icon: "🟧",
    color: "orange-400",
    description: "Sociável, entusiasta e persuasivo",
    approach: "😊 Seja amigável, conte histórias e mostre entusiasmo",
    trigger: "✨ Reconhecimento, conexão e emoção",
    characteristics: ["Extrovertido", "Entusiasta", "Persuasivo", "Otimista", "Sociável"],
    strengths: ["Comunicação eficaz", "Motivação de equipes", "Criatividade", "Entusiasmo contagiante"],
    weaknesses: ["Pode ser desorganizado", "Evita conflitos", "Foco disperso"],
    communicationStyle: "Use histórias, humor e emoção para conectar",
    motivators: ["Reconhecimento", "Aprovação social", "Novidade", "Diversão"],
    decisionMaking: "Baseia-se em emoções e opiniões dos outros",
    perguntas_abertas: {
      titulo: "Perguntas Abertas para Influentes",
      objetivo: "explorar motivações, sonhos e conexões pessoais",
      caracteristicas: "Sociável, Entusiasta, Persuasivo",
      perguntas: [
        "O que te motiva a acordar animado todos os dias?",
        "Como você descreveria seu ambiente de trabalho ideal?",
        "Quais são as pessoas que mais te inspiram e por quê?",
        "Qual foi a experiência mais divertida que você teve no trabalho?",
        "Como você gosta de celebrar suas conquistas?"
      ]
    },
    social_selling: {
      titulo: "Estratégia de Social Selling para Influentes",
      objetivo: "conquistar perfis influentes com conexão emocional e engajamento",
      caracteristicas: "Foco em relacionamento, emoção e histórias",
      estrategia_aproximacao: {
        titulo: "🎯 ESTRATÉGIA DE APROXIMAÇÃO",
        descricao: "Crie conexão emocional e mostre entusiasmo genuíno",
        tacticas: [
          "Comente com emojis e mensagens positivas",
          "Compartilhe histórias pessoais e cases inspiradores",
          "Use vídeos e imagens para engajar",
          "Faça perguntas abertas para estimular diálogo",
          "Seja espontâneo e autêntico"
        ]
      },
      conteudo_engajamento: {
        titulo: "📊 CONTEÚDO PARA ENGAJAMENTO",
        descricao: "Tipos de posts que atraem perfis influentes",
        tipos: [
          "Histórias de sucesso e superação",
          "Posts motivacionais e inspiradores",
          "Conteúdos com humor e leveza",
          "Vídeos e lives interativas",
          "Posts que destacam pessoas e equipes"
        ]
      },
      scripts_dm: {
        titulo: "💬 SCRIPTS PARA MENSAGEM DIRETA",
        descricao: "Abordagem calorosa e focada em conexão",
        scripts: [
          {
            situacao: "1. Primeiro contato (Conexão e abertura)",
            script: "Oi [Nome]! Vi seu perfil e adorei seu jeito de se comunicar. Me conta, o que mais te inspira no seu trabalho?"
          },
          {
            situacao: "2. Mapeamento com dores e desejos",
            script: "Quais desafios você tem enfrentado que te tiram o brilho no dia a dia?"
          },
          {
            situacao: "3. Mapeamento qualificatório",
            script: "Como você mede seu sucesso atualmente? O que te faria sentir ainda mais realizado?"
          },
          {
            situacao: "4. Direcionamento para call",
            script: "Tenho uma metodologia que ajuda pessoas como você a potencializar resultados e manter a motivação lá em cima. Quer saber mais?"
          },
          {
            situacao: "5. Marcação de call",
            script: "Que tal conversarmos terça às 15h ou quarta às 10h? Vai ser leve e direto, prometo!"
          }
        ]
      },
      timing_frequencia: {
        titulo: "⏰ TIMING E FREQUÊNCIA",
        descricao: "Quando e com que frequência abordar",
        diretrizes: [
          "Interaja frequentemente com comentários e mensagens",
          "Poste conteúdos no meio da manhã e início da tarde",
          "Use stories e lives para manter contato constante",
          "Evite abordagens muito formais ou frias",
          "Seja consistente e positivo nas interações"
        ]
      },
      gatilhos_psicologicos: {
        titulo: "🧠 GATILHOS PSICOLÓGICOS",
        descricao: "Elementos que ativam o interesse de perfis influentes",
        gatilhos: [
          "Exclusividade: 'Evento VIP para convidados especiais'",
          "Prova social: 'Mais de 1000 seguidores satisfeitos'",
          "Novidade: 'Lançamento exclusivo para você'",
          "Emoção: 'Histórias que tocam o coração'",
          "Reconhecimento: 'Você é parte do nosso grupo seleto'"
        ]
      }
    },
    script: {
      objetivo: {
        caracteristicas: "Pessoa sociável, entusiasta e persuasiva.",
        busca: "conexão, reconhecimento, diversão e aprovação",
        evita: "críticas duras, rejeição e monotonia",
        foco: "Como isso vai me fazer sentir? Vou me destacar?"
      },
      abertura: {
        titulo: "ABERTURA AMIGÁVEL (CONEXÃO)",
        script: "Oi [Nome]! Adorei seu perfil, parece que temos muito em comum. Me conta, qual seu maior sonho profissional?",
        gatilhos: "Empatia, entusiasmo, conexão"
      },
      spin: {
        situacao: {
          titulo: "PERGUNTAS DE SITUAÇÃO (SPIN: S)",
          objetivo: "entender o contexto social e motivacional",
          perguntas: [
            "Como você costuma se conectar com seus clientes?",
            "Quais canais você usa para se comunicar?",
            "Como você mede o engajamento do seu público?"
          ],
          gatilhos: "Relacionamento, conexão, entusiasmo"
        },
        problema: {
          titulo: "PERGUNTAS DE PROBLEMA (SPIN: P)",
          objetivo: "identificar obstáculos emocionais e sociais",
          perguntas: [
            "Você sente que seu público está realmente engajado?",
            "Quais dificuldades você tem para manter a motivação da equipe?",
            "Já sentiu que sua mensagem não está chegando como gostaria?"
          ],
          gatilhos: "Frustração, desejo de conexão, reconhecimento"
        },
        implicacao: {
          titulo: "PERGUNTAS DE IMPLICAÇÃO (SPIN: I)",
          objetivo: "mostrar impacto da falta de engajamento",
          perguntas: [
            "Como isso tem afetado suas vendas ou resultados?",
            "O que acontece quando a equipe perde o entusiasmo?",
            "Quais oportunidades você acha que está perdendo?"
          ],
          gatilhos: "Perda, urgência, impacto emocional"
        },
        necessidade: {
          titulo: "PERGUNTAS DE NECESSIDADE DE SOLUÇÃO (SPIN: N)",
          objetivo: "ativar desejo por soluções motivacionais",
          perguntas: [
            "Se pudesse aumentar o engajamento em 30%, como isso mudaria seu negócio?",
            "Que tipo de suporte você acha que ajudaria sua equipe a se motivar mais?"
          ],
          gatilhos: "Esperança, solução, entusiasmo"
        }
      },
      apresentacao: {
        titulo: "APRESENTAÇÃO DO MÉTODO",
        script: "Nosso método foca em criar conexões reais e motivar equipes para resultados duradouros. Já ajudamos muitos perfis como o seu a alcançar isso.",
        gatilhos: "Empatia, prova social, entusiasmo"
      },
      chamada: {
        titulo: "CHAMADA PRA AÇÃO",
        script: "Quer descobrir como engajar seu público e equipe de forma natural e eficaz?"
      },
      encaminhamento: {
        titulo: "ENCAMINHAMENTO (FECHAMENTO PARCIAL)",
        script: "Se fizer sentido, podemos agendar uma conversa rápida para te mostrar o plano. Que tal?"
      }
    }
  },
  S: {
    id: "S",
    name: "Estável",
    icon: "🟩",
    color: "green-500",
    description: "Calmo, paciente e confiável",
    approach: "🤝 Seja paciente, mostre segurança e empatia",
    trigger: "🛡️ Segurança, estabilidade e apoio",
    characteristics: ["Paciente", "Leal", "Calmo", "Confiável", "Cooperativo"],
    strengths: ["Bom ouvinte", "Trabalhador consistente", "Empático", "Faz amigos facilmente"],
    weaknesses: ["Resistente a mudanças", "Evita conflitos", "Pode ser passivo"],
    communicationStyle: "Use tom calmo, escute e ofereça suporte",
    motivators: ["Segurança", "Harmonia", "Previsibilidade", "Apoio"],
    decisionMaking: "Prefere decisões seguras e consensuais",
    perguntas_abertas: {
      titulo: "Perguntas Abertas para Estáveis",
      objetivo: "explorar necessidades de segurança e apoio",
      caracteristicas: "Paciente, Leal, Calmo",
      perguntas: [
        "O que te faz sentir seguro no seu trabalho?",
        "Como você lida com mudanças na sua rotina?",
        "Quais são os valores mais importantes para você na equipe?",
        "Como você prefere receber feedback?",
        "O que te ajuda a manter o foco e a calma em momentos difíceis?"
      ]
    },
    social_selling: {
      titulo: "Estratégia de Social Selling para Estáveis",
      objetivo: "conquistar perfis estáveis com confiança e suporte",
      caracteristicas: "Foco em segurança, empatia e consistência",
      estrategia_aproximacao: {
        titulo: "🎯 ESTRATÉGIA DE APROXIMAÇÃO",
        descricao: "Mostre que você é confiável e que oferece suporte constante",
        tacticas: [
          "Compartilhe depoimentos e provas de estabilidade",
          "Comunique-se com calma e clareza",
          "Ofereça ajuda e suporte antes de vender",
          "Seja consistente nas mensagens e interações",
          "Evite pressa e pressão"
        ]
      },
      conteudo_engajamento: {
        titulo: "📊 CONTEÚDO PARA ENGAJAMENTO",
        descricao: "Tipos de posts que atraem perfis estáveis",
        tipos: [
          "Histórias de superação com apoio da equipe",
          "Conteúdos sobre equilíbrio e bem-estar",
          "Posts que destacam valores e cultura",
          "Dicas para manter a calma e foco",
          "Depoimentos de clientes satisfeitos"
        ]
      },
      scripts_dm: {
        titulo: "💬 SCRIPTS PARA MENSAGEM DIRETA",
        descricao: "Abordagem calma e focada em confiança",
        scripts: [
          {
            situacao: "1. Primeiro contato (Conexão e empatia)",
            script: "Oi [Nome], tudo bem? Notei que você valoriza estabilidade e apoio. Gostaria de saber como posso ajudar a manter isso no seu negócio."
          },
          {
            situacao: "2. Mapeamento com necessidades",
            script: "Quais são os maiores desafios que você enfrenta para manter a equipe motivada e segura?"
          },
          {
            situacao: "3. Mapeamento qualificatório",
            script: "Como você costuma tomar decisões importantes? Prefere ter certeza antes de agir?"
          },
          {
            situacao: "4. Direcionamento para call",
            script: "Tenho uma abordagem que ajuda a criar ambientes seguros e produtivos. Quer saber mais?"
          },
          {
            situacao: "5. Marcação de call",
            script: "Podemos conversar terça às 15h ou quarta às 10h, qual horário é melhor para você?"
          }
        ]
      },
      timing_frequencia: {
        titulo: "⏰ TIMING E FREQUÊNCIA",
        descricao: "Quando e com que frequência abordar",
        diretrizes: [
          "Seja consistente e previsível nas interações",
          "Poste conteúdos no final da manhã e início da tarde",
          "Evite mudanças bruscas na comunicação",
          "Dê tempo para reflexão antes de pedir decisões",
          "Mantenha contato regular, mas sem pressão"
        ]
      },
      gatilhos_psicologicos: {
        titulo: "🧠 GATILHOS PSICOLÓGICOS",
        descricao: "Elementos que ativam o interesse de perfis estáveis",
        gatilhos: [
          "Segurança: 'Garantia de suporte contínuo'",
          "Confiança: 'Mais de 10 anos no mercado'",
          "Previsibilidade: 'Processos claros e estáveis'",
          "Empatia: 'Entendemos suas necessidades'",
          "Comunidade: 'Faça parte de um grupo seleto'"
        ]
      }
    },
    script: {
      objetivo: {
        caracteristicas: "Pessoa calma, paciente e confiável.",
        busca: "segurança, apoio, harmonia e estabilidade",
        evita: "conflitos, pressa e incertezas",
        foco: "Isso é seguro? Posso confiar? Vou ter apoio?"
      },
      abertura: {
        titulo: "ABERTURA CALMA (EMPATIA)",
        script: "Oi [Nome], espero que esteja bem. Quero entender como posso ajudar a manter seu negócio seguro e estável.",
        gatilhos: "Empatia, segurança, calma"
      },
      spin: {
        situacao: {
          titulo: "PERGUNTAS DE SITUAÇÃO (SPIN: S)",
          objetivo: "entender o ambiente e rotina",
          perguntas: [
            "Como é o ambiente de trabalho na sua equipe?",
            "Quais processos você tem para garantir estabilidade?",
            "Como você lida com mudanças no dia a dia?"
          ],
          gatilhos: "Segurança, rotina, estabilidade"
        },
        problema: {
          titulo: "PERGUNTAS DE PROBLEMA (SPIN: P)",
          objetivo: "identificar dificuldades e inseguranças",
          perguntas: [
            "Você já sentiu que a equipe está desmotivada?",
            "Quais desafios surgem quando há mudanças repentinas?",
            "Como isso afeta a produtividade?"
          ],
          gatilhos: "Insegurança, desconforto, preocupação"
        },
        implicacao: {
          titulo: "PERGUNTAS DE IMPLICAÇÃO (SPIN: I)",
          objetivo: "mostrar consequências da instabilidade",
          perguntas: [
            "Como a instabilidade tem impactado seus resultados?",
            "O que acontece quando a equipe não está alinhada?",
            "Quais riscos você vê se isso continuar?"
          ],
          gatilhos: "Perda, risco, impacto negativo"
        },
        necessidade: {
          titulo: "PERGUNTAS DE NECESSIDADE DE SOLUÇÃO (SPIN: N)",
          objetivo: "ativar desejo por segurança e apoio",
          perguntas: [
            "Se pudesse garantir estabilidade e apoio, como isso mudaria seu negócio?",
            "Que tipo de suporte você acha que ajudaria sua equipe a se sentir segura?"
          ],
          gatilhos: "Esperança, solução, segurança"
        }
      },
      apresentacao: {
        titulo: "APRESENTAÇÃO DO MÉTODO",
        script: "Nosso método foca em criar ambientes seguros e apoiar equipes para resultados consistentes. Já ajudamos muitos perfis como o seu a alcançar isso.",
        gatilhos: "Confiança, prova social, segurança"
      },
      chamada: {
        titulo: "CHAMADA PRA AÇÃO",
        script: "Quer descobrir como criar um ambiente estável e produtivo para sua equipe?"
      },
      encaminhamento: {
        titulo: "ENCAMINHAMENTO (FECHAMENTO PARCIAL)",
        script: "Se fizer sentido, podemos agendar uma conversa para te mostrar o plano. Que tal?"
      }
    }
  },
  C: {
    id: "C",
    name: "Cauteloso",
    icon: "🟦",
    color: "blue-500",
    description: "Analítico, detalhista e preciso",
    approach: "📊 Seja claro, lógico e forneça dados",
    trigger: "🔍 Detalhes, qualidade e precisão",
    characteristics: ["Analítico", "Detalhista", "Preciso", "Organizado", "Reservado"],
    strengths: ["Pensamento crítico", "Alta qualidade", "Organização", "Confiabilidade"],
    weaknesses: ["Pode ser perfeccionista", "Dificuldade em delegar", "Resistente a mudanças rápidas"],
    communicationStyle: "Use fatos, dados e argumentos lógicos",
    motivators: ["Qualidade", "Precisão", "Segurança", "Conhecimento"],
    decisionMaking: "Baseia-se em análise detalhada e fatos",
    perguntas_abertas: {
      titulo: "Perguntas Abertas para Cautelosos",
      objetivo: "explorar necessidades de precisão e qualidade",
      caracteristicas: "Analítico, Detalhista, Preciso",
      perguntas: [
        "Como você garante a qualidade nos seus processos?",
        "Quais métricas você acompanha regularmente?",
        "Como você lida com erros ou falhas?",
        "Quais são seus critérios para tomar decisões importantes?",
        "Como você prefere receber informações complexas?"
      ]
    },
    social_selling: {
      titulo: "Estratégia de Social Selling para Cautelosos",
      objetivo: "conquistar perfis cautelosos com dados e lógica",
      caracteristicas: "Foco em precisão, qualidade e análise",
      estrategia_aproximacao: {
        titulo: "🎯 ESTRATÉGIA DE APROXIMAÇÃO",
        descricao: "Apresente dados concretos e argumentos lógicos",
        tacticas: [
          "Compartilhe whitepapers e estudos de caso detalhados",
          "Use gráficos e estatísticas nas interações",
          "Seja claro e objetivo, evite exageros",
          "Responda perguntas com precisão e paciência",
          "Demonstre domínio técnico e conhecimento"
        ]
      },
      conteudo_engajamento: {
        titulo: "📊 CONTEÚDO PARA ENGAJAMENTO",
        descricao: "Tipos de posts que atraem perfis cautelosos",
        tipos: [
          "Análises detalhadas e comparativos",
          "Guias técnicos e tutoriais",
          "Posts com dados e evidências",
          "Estudos de caso e resultados comprovados",
          "Conteúdos que explicam processos e metodologias"
        ]
      },
      scripts_dm: {
        titulo: "💬 SCRIPTS PARA MENSAGEM DIRETA",
        descricao: "Abordagem lógica e focada em dados",
        scripts: [
          {
            situacao: "1. Primeiro contato (Apresentação técnica)",
            script: "Olá [Nome], notei seu interesse em processos eficientes. Gostaria de compartilhar alguns dados que podem ajudar seu negócio."
          },
          {
            situacao: "2. Mapeamento com necessidades técnicas",
            script: "Quais métricas você considera essenciais para avaliar seu desempenho?"
          },
          {
            situacao: "3. Mapeamento qualificatório",
            script: "Como você costuma validar a qualidade dos seus resultados?"
          },
          {
            situacao: "4. Direcionamento para call",
            script: "Tenho uma solução baseada em dados que pode otimizar seus processos. Quer saber mais?"
          },
          {
            situacao: "5. Marcação de call",
            script: "Podemos agendar uma conversa técnica terça às 15h ou quarta às 10h. Qual horário prefere?"
          }
        ]
      },
      timing_frequencia: {
        titulo: "⏰ TIMING E FREQUÊNCIA",
        descricao: "Quando e com que frequência abordar",
        diretrizes: [
          "Envie conteúdos detalhados e técnicos pela manhã",
          "Seja consistente e evite mensagens vagas",
          "Dê tempo para análise antes de pedir decisões",
          "Responda dúvidas com paciência e clareza",
          "Mantenha contato regular com informações relevantes"
        ]
      },
      gatilhos_psicologicos: {
        titulo: "🧠 GATILHOS PSICOLÓGICOS",
        descricao: "Elementos que ativam o interesse de perfis cautelosos",
        gatilhos: [
          "Precisão: 'Dados comprovados e auditáveis'",
          "Segurança: 'Processos testados e validados'",
          "Qualidade: 'Padrões elevados e consistentes'",
          "Lógica: 'Argumentos claros e fundamentados'",
          "Conhecimento: 'Especialistas reconhecidos no setor'"
        ]
      }
    },
    script: {
      objetivo: {
        caracteristicas: "Pessoa analítica, detalhista e precisa.",
        busca: "dados, qualidade, segurança e lógica",
        evita: "imprecisão, pressa e falta de evidências",
        foco: "Isso é comprovado? Quais dados sustentam?"
      },
      abertura: {
        titulo: "ABERTURA TÉCNICA (CLAREZA)",
        script: "Olá [Nome], gostaria de compartilhar algumas informações detalhadas que podem ajudar a otimizar seus processos.",
        gatilhos: "Lógica, clareza, precisão"
      },
      spin: {
        situacao: {
          titulo: "PERGUNTAS DE SITUAÇÃO (SPIN: S)",
          objetivo: "entender processos e métricas",
          perguntas: [
            "Quais sistemas você usa para monitorar resultados?",
            "Como você avalia a eficiência dos seus processos?",
            "Quais indicadores são mais importantes para você?"
          ],
          gatilhos: "Dados, análise, eficiência"
        },
        problema: {
          titulo: "PERGUNTAS DE PROBLEMA (SPIN: P)",
          objetivo: "identificar falhas e ineficiências",
          perguntas: [
            "Você já identificou gargalos nos seus processos?",
            "Quais problemas técnicos têm impactado seus resultados?",
            "Como isso afeta a qualidade do seu serviço?"
          ],
          gatilhos: "Problemas, falhas, impacto"
        },
        implicacao: {
          titulo: "PERGUNTAS DE IMPLICAÇÃO (SPIN: I)",
          objetivo: "mostrar consequências das falhas",
          perguntas: [
            "Qual o custo dessas falhas para sua empresa?",
            "Como isso afeta a satisfação dos clientes?",
            "Quais riscos você corre se não agir?"
          ],
          gatilhos: "Custo, risco, impacto"
        },
        necessidade: {
          titulo: "PERGUNTAS DE NECESSIDADE DE SOLUÇÃO (SPIN: N)",
          objetivo: "ativar desejo por soluções técnicas",
          perguntas: [
            "Se pudesse eliminar esses gargalos, qual seria o impacto?",
            "Que tipo de solução técnica você considera ideal?"
          ],
          gatilhos: "Solução, eficiência, melhoria"
        }
      },
      apresentacao: {
        titulo: "APRESENTAÇÃO DO MÉTODO",
        script: "Nosso método é baseado em análise detalhada e melhoria contínua, garantindo resultados precisos e confiáveis.",
        gatilhos: "Prova, lógica, qualidade"
      },
      chamada: {
        titulo: "CHAMADA PRA AÇÃO",
        script: "Quer conhecer uma solução que traz precisão e qualidade para seus processos?"
      },
      encaminhamento: {
        titulo: "ENCAMINHAMENTO (FECHAMENTO PARCIAL)",
        script: "Se fizer sentido, podemos agendar uma conversa técnica para detalhar o plano. Que tal?"
      }
    }
  }
};

export const objectionsByProfile: Record<string, Objection[]> = {
  D: [
    {
      title: "❌ Já tentei de tudo e nada funciona",
      question: "O que exatamente você tentou e que te fez perder tempo sem retorno?",
      response: "Você é alguém que já sabe o que não funciona. Agora precisa de algo que funcione — simples assim. Aqui, a diferença está na execução com método. Posso te mostrar resultados concretos de quem também já estava no limite e virou o jogo em semanas."
    },
    {
      title: "❌ Não tenho tempo para isso",
      question: "Quais tarefas você acredita que poderiam ser delegadas para liberar seu tempo?",
      response: "Entendo que seu tempo é valioso. Nosso método é focado em otimizar seu tempo e trazer resultados rápidos, para que você possa focar no que realmente importa."
    },
    {
      title: "❌ Prefiro fazer do meu jeito",
      question: "O que no seu método atual você acredita que funciona bem?",
      response: "Respeito sua experiência. Nosso objetivo é complementar seu jeito com estratégias que potencializam seus resultados, sem complicar seu processo."
    }
  ],
  I: [
    {
      title: "❌ Não sei se isso vai funcionar para mim",
      question: "O que você já tentou que te deixou inseguro sobre novas abordagens?",
      response: "É normal ter dúvidas. Podemos começar com passos pequenos e mostrar resultados rápidos para você se sentir seguro e confiante."
    },
    {
      title: "❌ Estou muito ocupado agora",
      question: "Quais atividades você poderia delegar para liberar tempo?",
      response: "Nosso método é flexível e pensado para se encaixar na sua rotina, sem sobrecarregar você."
    },
    {
      title: "❌ Prefiro esperar para ver",
      question: "O que te faria se sentir mais confortável para começar agora?",
      response: "Podemos fazer uma demonstração rápida para você ver como funciona na prática, sem compromisso."
    }
  ],
  S: [
    {
      title: "❌ Tenho medo de mudanças",
      question: "Quais mudanças anteriores te deixaram inseguro?",
      response: "Nosso método é gradual e respeita seu ritmo, garantindo segurança e suporte em cada etapa."
    },
    {
      title: "❌ Prefiro manter o que já funciona",
      question: "O que você mais valoriza no seu método atual?",
      response: "Entendemos a importância da estabilidade. Nosso objetivo é melhorar sem causar rupturas."
    },
    {
      title: "❌ Não quero me sentir pressionado",
      question: "Como você prefere ser acompanhado em processos de mudança?",
      response: "Oferecemos suporte constante e respeitamos seu tempo para que se sinta confortável."
    }
  ],
  C: [
    {
      title: "❌ Preciso de mais dados antes de decidir",
      question: "Quais informações você considera essenciais para tomar uma decisão?",
      response: "Fornecemos todos os dados e análises necessárias para que você tome decisões informadas e seguras."
    },
    {
      title: "❌ Tenho receio de erros",
      question: "Quais erros anteriores impactaram seu negócio?",
      response: "Nosso método é baseado em processos testados e validados para minimizar riscos e garantir qualidade."
    },
    {
      title: "❌ Prefiro analisar tudo com calma",
      question: "Qual o seu prazo ideal para avaliação de novas soluções?",
      response: "Respeitamos seu ritmo e oferecemos todas as informações para que você avalie com tranquilidade."
    }
  ]
};

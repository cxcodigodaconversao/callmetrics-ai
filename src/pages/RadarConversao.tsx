import { useState } from "react";

const markers = [
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

const suggestions = {
  D: {
    label: "🟥 Perfil Dominante",
    approach: "🎯 Seja direto, foque em resultado e ROI",
    trigger: "🔥 Resultados tangíveis, liderança, ganho de tempo",
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
    },
    objections: [
      {
        title: "❌ Já tentei de tudo e nada funciona",
        question: "O que exatamente você tentou e que te fez perder tempo sem retorno?",
        response: "Você é alguém que já sabe o que não funciona. Agora precisa de algo que funcione — simples assim. Aqui, a diferença está na execução com método. Posso te mostrar resultados concretos de quem também já estava no limite e virou o jogo em semanas."
      },
      {
        title: "❌ Mas será que isso serve pra mim?",
        question: "O que exatamente faria você ter certeza de que isso funciona pra você?",
        response: "Se você quer evolução real e resultado com clareza, sim, serve pra você. O método se adapta a quem executa com foco. Posso te mostrar casos de quem chegou aqui com o mesmo perfil que o seu — e dobrou o resultado com precisão."
      },
      {
        title: "❌ Quanto tempo leva pra dar resultado?",
        question: "Em quanto tempo você espera ver um retorno visível? Isso te ajudaria a decidir?",
        response: "Se você aplica com consistência, os primeiros resultados vêm em 30 dias — reais, mensuráveis. Já vi casos que dobraram faturamento em 21 dias. Posso te mostrar. Mas não é fórmula mágica — é execução com método."
      },
      {
        title: "❌ Eu não tenho dinheiro",
        question: "Se esse investimento voltasse pra você em dobro, faria sentido agora?",
        response: "A pergunta certa não é quanto custa — mas quanto você já perdeu por não resolver isso. O que você decide aqui vira retorno, não é gasto. Te mostro como clientes no seu perfil recuperaram o investimento em semanas."
      },
      {
        title: "❌ Não tenho tempo pra isso agora",
        question: "O que está te tomando mais tempo hoje — e que já deveria estar resolvido?",
        response: "Exatamente por estar sem tempo é que você precisa resolver isso agora. Esse método te devolve tempo — não exige mais. Posso te mostrar como ele elimina tarefas inúteis e foca no que gera retorno direto."
      },
      {
        title: "❌ Preciso conversar com meu parceiro(a) antes",
        question: "O que exatamente seu parceiro(a) precisa entender pra te apoiar nessa decisão?",
        response: "Claro. Se quiser, posso te ajudar com os argumentos estratégicos pra essa conversa. Isso impacta os dois — e você vai estar levando clareza, resultado e direção."
      },
      {
        title: "❌ Não sei se eu vou conseguir",
        question: "Você já superou desafios antes. O que torna esse diferente pra você duvidar da sua capacidade?",
        response: "Você já passou por coisas muito maiores. Aqui, você só precisa executar com direção. E essa direção eu te dou. Posso te mostrar o plano, os dados e os checkpoints que garantem o resultado — se você fizer, funciona."
      },
      {
        title: "❌ E se eu começar e não der certo?",
        question: "O que você costuma fazer quando algo sai diferente do esperado — você ajusta ou abandona?",
        response: "Se você fizer, dá certo. O único erro real é parar. Aqui, você não segue sozinho — tem acompanhamento pra corrigir rota e ir até o fim. Posso te mostrar casos em que o ajuste foi o diferencial pro resultado."
      },
      {
        title: "❌ Você me garante que vai funcionar?",
        question: "Se eu te mostrasse casos de pessoas que aplicaram com intensidade e venceram, isso bastaria como prova?",
        response: "Se você aplicar, funciona. Quem executa colhe. E eu te acompanho pra garantir que você tenha o plano, o ritmo e os ajustes certos. Posso te mostrar casos reais — mas a diferença está na execução."
      }
    ]
  },
  I: {
    label: "🟨 Perfil Influente",
    approach: "🎯 Conecte com emoção e energia positiva",
    trigger: "🔥 Pertencimento, apoio, entusiasmo, reconhecimento",
    perguntas_abertas: {
      titulo: "Perguntas Abertas Estratégicas",
      objetivo: "fazer a pessoa falar sobre conexões, emoções e relacionamentos",
      caracteristicas: "Entusiasta, Comunicativo, Otimista",
      perguntas: [
        "Como você descreveria seu ambiente de trabalho ideal?",
        "Quais pessoas ou equipes mais te inspiram no seu dia a dia?",
        "O que te motiva a continuar crescendo profissionalmente?",
        "Como você celebra suas conquistas e as da sua equipe?",
        "Quais desafios você enfrenta ao tentar engajar seu time?"
      ]
    },
    social_selling: {
      titulo: "Estratégia de Social Selling",
      objetivo: "conquistar perfis influentes com empatia, histórias e reconhecimento",
      caracteristicas: "Foco em conexão, emoção e engajamento",
      estrategia_aproximacao: {
        titulo: "🎯 ESTRATÉGIA DE APROXIMAÇÃO",
        descricao: "Use histórias, elogios sinceros e crie conexão emocional",
        tacticas: [
          "Compartilhe histórias inspiradoras e cases de sucesso",
          "Comente com empatia e reconhecimento nas redes sociais",
          "Envie mensagens personalizadas e calorosas",
          "Use vídeos e conteúdos visuais para engajar",
          "Seja positivo e encorajador em todas as interações"
        ]
      },
      conteudo_engajamento: {
        titulo: "📊 CONTEÚDO PARA ENGAJAMENTO",
        descricao: "Tipos de posts que atraem e engajam perfis influentes",
        tipos: [
          "Histórias de superação e sucesso",
          "Depoimentos e cases de clientes",
          "Posts motivacionais e inspiradores",
          "Conteúdos que destacam pessoas e equipes",
          "Eventos e encontros para networking"
        ]
      },
      scripts_dm: {
        titulo: "💬 SCRIPTS PARA MENSAGEM DIRETA",
        descricao: "Abordagem calorosa e focada em conexão",
        scripts: [
          {
            situacao: "1. Primeiro contato (Conexão e elogio)",
            script: "Oi [Nome], adorei seu post sobre [tema]. Me identifiquei muito com sua visão e queria trocar umas ideias com você!"
          },
          {
            situacao: "2. Mapeamento com dores emocionais",
            script: "Como você tem lidado com os desafios de engajar sua equipe e manter o entusiasmo?"
          },
          {
            situacao: "3. Mapeamento qualificatório",
            script: "Quais são suas maiores metas para os próximos meses e como você mede o sucesso do seu time?"
          },
          {
            situacao: "4. Direcionamento (Características que levam para a call)",
            script: "Tenho uma abordagem que tem ajudado líderes como você a aumentar o engajamento e resultados com mais leveza. Que tal uma conversa rápida para eu te mostrar?"
          },
          {
            situacao: "5. Marcação de call",
            script: "Tenho horários terça às 15h ou quarta às 10h, qual funciona melhor para você? Vai ser uma conversa leve e produtiva!"
          }
        ]
      },
      timing_frequencia: {
        titulo: "⏰ TIMING E FREQUÊNCIA",
        descricao: "Quando e com que frequência abordar",
        diretrizes: [
          "Interaja nos horários de maior engajamento (manhã e fim de tarde)",
          "Use mensagens personalizadas e não invasivas",
          "Mantenha contato frequente, mas respeite o espaço",
          "Aposte em datas comemorativas e eventos",
          "Use convites para eventos e webinars"
        ]
      },
      gatilhos_psicologicos: {
        titulo: "🧠 GATILHOS PSICOLÓGICOS",
        descricao: "Elementos que ativam o interesse de perfis influentes",
        gatilhos: [
          "Pertencimento: 'Junte-se a uma comunidade exclusiva'",
          "Reconhecimento: 'Seja destaque no seu setor'",
          "Entusiasmo: 'Participe de algo inovador e divertido'",
          "Apoio: 'Conte com uma rede de suporte'",
          "Exclusividade: 'Convite especial para líderes influentes'"
        ]
      }
    },
    script: {
      objetivo: {
        caracteristicas: "Pessoa sociável, entusiasta e comunicativa.",
        busca: "conexão, reconhecimento, entusiasmo e apoio",
        evita: "críticas duras, rejeição e isolamento",
        foco: "Como posso me conectar e ser reconhecido?"
      },
      abertura: {
        titulo: "ABERTURA CALOROSA (CONEXÃO)",
        script: "Oi [Nome], adorei seu conteúdo recente! Queria muito trocar umas ideias e aprender mais com você. Pode ser?",
        gatilhos: "Empatia, conexão, entusiasmo"
      },
      spin: {
        situacao: {
          titulo: "PERGUNTAS DE SITUAÇÃO (SPIN: S)",
          objetivo: "entender o ambiente e relações atuais",
          perguntas: [
            "Como está o clima na sua equipe atualmente?",
            "Quais canais você usa para engajar seu público?",
            "Como você mede o sucesso das suas ações de comunicação?"
          ],
          gatilhos: "Conexão, empatia, engajamento"
        },
        problema: {
          titulo: "PERGUNTAS DE PROBLEMA (SPIN: P)",
          objetivo: "identificar desafios emocionais e de relacionamento",
          perguntas: [
            "Quais dificuldades você enfrenta para manter o time motivado?",
            "Já sentiu que sua mensagem não está chegando como gostaria?",
            "O que mais te frustra na comunicação com seus clientes?"
          ],
          gatilhos: "Empatia, apoio, reconhecimento"
        },
        implicacao: {
          titulo: "PERGUNTAS DE IMPLICAÇÃO (SPIN: I)",
          objetivo: "mostrar consequências da falta de engajamento",
          perguntas: [
            "Como a falta de engajamento tem impactado seus resultados?",
            "O que acontece quando a equipe não está alinhada?",
            "Quais oportunidades você acha que está perdendo?"
          ],
          gatilhos: "Urgência, impacto emocional, perda"
        },
        necessidade: {
          titulo: "PERGUNTAS DE NECESSIDADE DE SOLUÇÃO (SPIN: N)",
          objetivo: "ativar desejo por soluções de conexão e engajamento",
          perguntas: [
            "Se você pudesse aumentar o engajamento em 30%, como isso mudaria seu trabalho?",
            "Que tipo de suporte você gostaria para melhorar a comunicação?"
          ],
          gatilhos: "Desejo, apoio, melhoria"
        }
      },
      apresentacao: {
        titulo: "APRESENTAÇÃO DO MÉTODO",
        script: "Nosso método foca em criar conexões reais e engajamento genuíno, usando histórias e reconhecimento. Já ajudamos muitos líderes a transformar seus times e resultados.",
        gatilhos: "Empatia, prova social, emoção"
      },
      chamada: {
        titulo: "CHAMADA PRA AÇÃO",
        script: "Quer conversar para descobrir como engajar seu time e clientes com mais leveza e resultados?"
      },
      encaminhamento: {
        titulo: "ENCAMINHAMENTO (FECHAMENTO PARCIAL)",
        script: "Se fizer sentido, podemos agendar uma conversa rápida para eu te mostrar o plano. Que tal?"
      }
    },
    objections: [
      {
        title: "❌ Não sou bom em vendas",
        question: "O que te faz pensar que vendas não é seu ponto forte?",
        response: "Vendas é sobre conexão e empatia, não só técnica. Nosso método ajuda você a usar seu jeito natural para criar relacionamentos que geram resultados."
      },
      {
        title: "❌ Tenho medo de ser rejeitado",
        question: "O que você sente quando pensa em ser rejeitado?",
        response: "Rejeição é parte do processo, mas com a abordagem certa, você vai se sentir mais confiante e preparado para lidar com isso e seguir em frente."
      },
      {
        title: "❌ Não tenho tempo para isso",
        question: "Como você organiza seu tempo atualmente para suas prioridades?",
        response: "Nosso método é focado em eficiência e usar seu tempo de forma inteligente para gerar mais resultados com menos esforço."
      },
      {
        title: "❌ Prefiro que me indiquem",
        question: "Como você tem buscado indicações até agora?",
        response: "Indicações são ótimas, mas com uma estratégia ativa, você pode ampliar muito seu alcance e resultados."
      }
    ]
  },
  S: {
    label: "🟩 Perfil Estável",
    approach: "🎯 Acolha, ofereça passo a passo e segurança",
    trigger: "🔥 Segurança, suporte, constância, processo claro",
    perguntas_abertas: {
      titulo: "Perguntas Abertas Estratégicas",
      objetivo: "fazer a pessoa falar sobre estabilidade, rotina e segurança",
      caracteristicas: "Paciente, Leal, Calmo",
      perguntas: [
        "Como você costuma organizar seu dia a dia para manter a produtividade?",
        "Quais processos você considera essenciais para o sucesso do seu negócio?",
        "O que te traz mais segurança nas decisões que você toma?",
        "Como você lida com mudanças e imprevistos?",
        "Quais são suas maiores preocupações para o futuro próximo?"
      ]
    },
    social_selling: {
      titulo: "Estratégia de Social Selling",
      objetivo: "conquistar perfis estáveis com confiança, suporte e clareza",
      caracteristicas: "Foco em segurança, passo a passo e relacionamento",
      estrategia_aproximacao: {
        titulo: "🎯 ESTRATÉGIA DE APROXIMAÇÃO",
        descricao: "Mostre suporte, processos claros e benefícios de longo prazo",
        tacticas: [
          "Compartilhe conteúdos que reforcem segurança e estabilidade",
          "Ofereça suporte e acompanhamento constante",
          "Use depoimentos que mostrem confiança e resultados consistentes",
          "Seja paciente e respeite o tempo do cliente",
          "Apresente processos claros e estruturados"
        ]
      },
      conteudo_engajamento: {
        titulo: "📊 CONTEÚDO PARA ENGAJAMENTO",
        descricao: "Tipos de posts que atraem e engajam perfis estáveis",
        tipos: [
          "Guias passo a passo e tutoriais",
          "Depoimentos de clientes satisfeitos",
          "Conteúdos sobre organização e planejamento",
          "Posts que reforçam confiança e segurança",
          "Informações sobre processos e metodologias"
        ]
      },
      scripts_dm: {
        titulo: "💬 SCRIPTS PARA MENSAGEM DIRETA",
        descricao: "Abordagem calma e focada em suporte",
        scripts: [
          {
            situacao: "1. Primeiro contato (Acolhimento)",
            script: "Oi [Nome], vi que você valoriza processos claros e segurança. Gostaria de compartilhar algo que pode ajudar no seu dia a dia."
          },
          {
            situacao: "2. Mapeamento com dores de estabilidade",
            script: "Quais são os maiores desafios que você enfrenta para manter a constância nos resultados?"
          },
          {
            situacao: "3. Mapeamento qualificatório",
            script: "Como você costuma planejar suas ações para garantir segurança e previsibilidade?"
          },
          {
            situacao: "4. Direcionamento (Características que levam para a call)",
            script: "Tenho um método estruturado que tem ajudado pessoas como você a ganhar mais segurança e resultados consistentes. Que tal conversarmos?"
          },
          {
            situacao: "5. Marcação de call",
            script: "Tenho horários terça às 15h ou quarta às 10h, qual fica melhor para você? Vai ser uma conversa tranquila e produtiva."
          }
        ]
      },
      timing_frequencia: {
        titulo: "⏰ TIMING E FREQUÊNCIA",
        descricao: "Quando e com que frequência abordar",
        diretrizes: [
          "Aborde em horários calmos e previsíveis",
          "Mantenha contato regular e consistente",
          "Use mensagens que transmitam segurança",
          "Evite pressa e pressão",
          "Ofereça suporte contínuo"
        ]
      },
      gatilhos_psicologicos: {
        titulo: "🧠 GATILHOS PSICOLÓGICOS",
        descricao: "Elementos que ativam o interesse de perfis estáveis",
        gatilhos: [
          "Segurança: 'Processo testado e aprovado'",
          "Confiança: 'Suporte dedicado e constante'",
          "Previsibilidade: 'Resultados consistentes ao longo do tempo'",
          "Tranquilidade: 'Sem surpresas ou riscos'",
          "Comunidade: 'Faça parte de um grupo de apoio'"
        ]
      }
    },
    script: {
      objetivo: {
        caracteristicas: "Pessoa calma, leal e paciente.",
        busca: "segurança, estabilidade, suporte e previsibilidade",
        evita: "pressa, mudanças bruscas e riscos",
        foco: "Como posso garantir resultados seguros e constantes?"
      },
      abertura: {
        titulo: "ABERTURA ACOLHEDORA",
        script: "Oi [Nome], tudo bem? Quero compartilhar uma abordagem que pode trazer mais segurança e estabilidade para seu negócio. Posso?",
        gatilhos: "Acolhimento, segurança, suporte"
      },
      spin: {
        situacao: {
          titulo: "PERGUNTAS DE SITUAÇÃO (SPIN: S)",
          objetivo: "entender a rotina e processos atuais",
          perguntas: [
            "Como você organiza suas tarefas diárias?",
            "Quais processos você já tem implementados?",
            "Como você mede a estabilidade dos seus resultados?"
          ],
          gatilhos: "Segurança, rotina, previsibilidade"
        },
        problema: {
          titulo: "PERGUNTAS DE PROBLEMA (SPIN: P)",
          objetivo: "identificar dificuldades em manter estabilidade",
          perguntas: [
            "Quais imprevistos mais atrapalham seu trabalho?",
            "Já sentiu falta de suporte em momentos críticos?",
            "O que te preocupa em relação à continuidade do negócio?"
          ],
          gatilhos: "Preocupação, insegurança, necessidade de suporte"
        },
        implicacao: {
          titulo: "PERGUNTAS DE IMPLICAÇÃO (SPIN: I)",
          objetivo: "mostrar consequências da instabilidade",
          perguntas: [
            "Como a falta de estabilidade tem afetado seus resultados?",
            "O que acontece quando processos falham?",
            "Quais riscos você corre sem um suporte adequado?"
          ],
          gatilhos: "Risco, perda, insegurança"
        },
        necessidade: {
          titulo: "PERGUNTAS DE NECESSIDADE DE SOLUÇÃO (SPIN: N)",
          objetivo: "ativar desejo por segurança e suporte",
          perguntas: [
            "Se você tivesse um processo claro e suporte constante, como isso mudaria seu dia a dia?",
            "Que tipo de ajuda você gostaria de receber para garantir estabilidade?"
          ],
          gatilhos: "Desejo, segurança, apoio"
        }
      },
      apresentacao: {
        titulo: "APRESENTAÇÃO DO MÉTODO",
        script: "Nosso método oferece processos claros, suporte dedicado e acompanhamento para garantir que você tenha estabilidade e segurança nos resultados.",
        gatilhos: "Confiança, suporte, previsibilidade"
      },
      chamada: {
        titulo: "CHAMADA PRA AÇÃO",
        script: "Quer conversar para descobrir como garantir mais segurança e constância no seu negócio?"
      },
      encaminhamento: {
        titulo: "ENCAMINHAMENTO (FECHAMENTO PARCIAL)",
        script: "Se fizer sentido, podemos agendar uma conversa para eu te mostrar o plano detalhado. Que tal?"
      }
    },
    objections: [
      {
        title: "❌ Tenho medo de mudanças",
        question: "O que te preocupa mais em relação a mudanças no seu negócio?",
        response: "Mudanças podem ser desafiadoras, mas com um processo estruturado e suporte, você pode fazer transições seguras e planejadas."
      },
      {
        title: "❌ Prefiro manter o que já funciona",
        question: "O que você valoriza no que já está funcionando?",
        response: "Manter o que funciona é importante, e nosso método respeita isso, trazendo melhorias graduais e seguras."
      },
      {
        title: "❌ Não quero me sentir pressionado",
        question: "Como você lida com pressão e prazos?",
        response: "Nosso acompanhamento é feito no seu ritmo, sem pressa, para garantir conforto e resultados duradouros."
      },
      {
        title: "❌ Não sei se consigo aprender algo novo",
        question: "O que te dificulta em aprender novas abordagens?",
        response: "Nosso método é simples e passo a passo, com suporte constante para que você se sinta seguro em cada etapa."
      }
    ]
  },
  C: {
    label: "🟦 Perfil Conforme",
    approach: "🎯 Traga lógica, processo e prova social",
    trigger: "🔥 Dados, método validado, clareza técnica",
    perguntas_abertas: {
      titulo: "Perguntas Abertas Estratégicas",
      objetivo: "fazer a pessoa falar sobre processos, dados e qualidade",
      caracteristicas: "Analítico, Preciso, Cauteloso",
      perguntas: [
        "Como você avalia a qualidade dos seus processos atualmente?",
        "Quais métricas você acompanha para medir o sucesso?",
        "Como você garante a conformidade e padrões no seu trabalho?",
        "Quais ferramentas você usa para análise e controle?",
        "O que você considera essencial para manter a excelência?"
      ]
    },
    social_selling: {
      titulo: "Estratégia de Social Selling",
      objetivo: "conquistar perfis conforme com dados, provas e clareza",
      caracteristicas: "Foco em lógica, evidências e processos claros",
      estrategia_aproximacao: {
        titulo: "🎯 ESTRATÉGIA DE APROXIMAÇÃO",
        descricao: "Apresente dados, estudos de caso e metodologias comprovadas",
        tacticas: [
          "Compartilhe whitepapers e artigos técnicos",
          "Use gráficos e estatísticas para embasar argumentos",
          "Demonstre processos e certificações",
          "Seja detalhista e transparente nas informações",
          "Ofereça demonstrações e provas sociais"
        ]
      },
      conteudo_engajamento: {
        titulo: "📊 CONTEÚDO PARA ENGAJAMENTO",
        descricao: "Tipos de posts que atraem e engajam perfis conforme",
        tipos: [
          "Estudos de caso detalhados",
          "Análises técnicas e comparativas",
          "Guias e manuais de processos",
          "Posts sobre certificações e padrões",
          "Conteúdos com dados e evidências"
        ]
      },
      scripts_dm: {
        titulo: "💬 SCRIPTS PARA MENSAGEM DIRETA",
        descricao: "Abordagem lógica e focada em dados",
        scripts: [
          {
            situacao: "1. Primeiro contato (Apresentação técnica)",
            script: "Oi [Nome], notei seu interesse por processos e qualidade. Gostaria de compartilhar um estudo que pode ser útil para você."
          },
          {
            situacao: "2. Mapeamento com dores técnicas",
            script: "Quais desafios você enfrenta para manter a conformidade e qualidade nos seus processos?"
          },
          {
            situacao: "3. Mapeamento qualificatório",
            script: "Quais métricas você considera mais importantes para avaliar o sucesso do seu negócio?"
          },
          {
            situacao: "4. Direcionamento (Características que levam para a call)",
            script: "Tenho uma metodologia comprovada que ajuda a otimizar processos e garantir qualidade. Que tal uma conversa técnica para eu te mostrar?"
          },
          {
            situacao: "5. Marcação de call",
            script: "Tenho horários terça às 15h ou quarta às 10h, qual fica melhor para você? Será uma conversa objetiva e técnica."
          }
        ]
      },
      timing_frequencia: {
        titulo: "⏰ TIMING E FREQUÊNCIA",
        descricao: "Quando e com que frequência abordar",
        diretrizes: [
          "Aborde em horários de trabalho focado (manhã e início da tarde)",
          "Use mensagens claras e objetivas",
          "Mantenha contato profissional e respeitoso",
          "Envie conteúdos técnicos e detalhados",
          "Evite abordagens emocionais ou vagas"
        ]
      },
      gatilhos_psicologicos: {
        titulo: "🧠 GATILHOS PSICOLÓGICOS",
        descricao: "Elementos que ativam o interesse de perfis conforme",
        gatilhos: [
          "Prova social: 'Método validado por especialistas'",
          "Dados: 'Resultados comprovados com estatísticas'",
          "Lógica: 'Processos claros e estruturados'",
          "Segurança: 'Conformidade e padrões garantidos'",
          "Detalhamento: 'Informações técnicas e precisas'"
        ]
      }
    },
    script: {
      objetivo: {
        caracteristicas: "Pessoa analítica, precisa e cautelosa.",
        busca: "dados, processos, qualidade e segurança",
        evita: "imprecisão, riscos e falta de clareza",
        foco: "Como posso garantir qualidade e resultados confiáveis?"
      },
      abertura: {
        titulo: "ABERTURA TÉCNICA",
        script: "Oi [Nome], tudo bem? Gostaria de compartilhar uma abordagem que pode otimizar seus processos com dados e segurança. Posso?",
        gatilhos: "Lógica, dados, clareza"
      },
      spin: {
        situacao: {
          titulo: "PERGUNTAS DE SITUAÇÃO (SPIN: S)",
          objetivo: "entender processos e métricas atuais",
          perguntas: [
            "Quais processos você já tem implementados?",
            "Como você monitora a qualidade e conformidade?",
            "Quais ferramentas você utiliza para análise?"
          ],
          gatilhos: "Dados, processos, controle"
        },
        problema: {
          titulo: "PERGUNTAS DE PROBLEMA (SPIN: P)",
          objetivo: "identificar falhas e riscos nos processos",
          perguntas: [
            "Quais problemas você enfrenta para manter a qualidade?",
            "Já teve dificuldades com conformidade ou auditorias?",
            "O que te preocupa em relação à eficiência dos processos?"
          ],
          gatilhos: "Risco, falhas, ineficiência"
        },
        implicacao: {
          titulo: "PERGUNTAS DE IMPLICAÇÃO (SPIN: I)",
          objetivo: "mostrar consequências de processos falhos",
          perguntas: [
            "Como a falta de controle tem impactado seus resultados?",
            "Quais perdas você já teve por falhas nos processos?",
            "O que pode acontecer se esses problemas persistirem?"
          ],
          gatilhos: "Perda, risco, impacto financeiro"
        },
        necessidade: {
          titulo: "PERGUNTAS DE NECESSIDADE DE SOLUÇÃO (SPIN: N)",
          objetivo: "ativar desejo por processos otimizados e seguros",
          perguntas: [
            "Se você pudesse garantir processos eficientes e conformes, como isso mudaria seu negócio?",
            "Que tipo de solução você busca para melhorar a qualidade?"
          ],
          gatilhos: "Desejo, segurança, eficiência"
        }
      },
      apresentacao: {
        titulo: "APRESENTAÇÃO DO MÉTODO",
        script: "Nosso método oferece processos otimizados, controle rigoroso e dados confiáveis para garantir qualidade e conformidade.",
        gatilhos: "Prova social, dados, segurança"
      },
      chamada: {
        titulo: "CHAMADA PRA AÇÃO",
        script: "Quer conversar para descobrir como otimizar seus processos e garantir resultados confiáveis?"
      },
      encaminhamento: {
        titulo: "ENCAMINHAMENTO (FECHAMENTO PARCIAL)",
        script: "Se fizer sentido, podemos agendar uma conversa técnica para eu te mostrar o plano detalhado. Que tal?"
      }
    },
    objections: [
      {
        title: "❌ Não confio em métodos genéricos",
        question: "O que te faz desconfiar de métodos que não são personalizados?",
        response: "Nosso método é adaptado para sua realidade, com base em dados e processos específicos para seu negócio."
      },
      {
        title: "❌ Prefiro fazer do meu jeito",
        question: "O que você valoriza no seu método atual?",
        response: "Respeitamos seu jeito, e nosso método complementa com processos que trazem mais segurança e eficiência."
      },
      {
        title: "❌ Não tenho tempo para mudanças complexas",
        question: "Como você gerencia mudanças no seu negócio atualmente?",
        response: "Nosso processo é gradual e estruturado para minimizar impactos e facilitar a adaptação."
      },
      {
        title: "❌ Não vejo valor em investir nisso agora",
        question: "O que te faz hesitar em investir em otimização de processos?",
        response: "Investir em processos é garantir economia e resultados a longo prazo. Posso te mostrar dados que comprovam isso."
      }
    ]
  }
};

export default function RadarConversao() {
  const [selected, setSelected] = useState<Array<{label: string; profile: string}>>([]);
  const [expandedProfiles, setExpandedProfiles] = useState<string[]>([]);
  const [expandedObjections, setExpandedObjections] = useState<Record<string, boolean>>({});
  const [expandedScripts, setExpandedScripts] = useState<Record<string, boolean>>({});
  const [expandedSocialSelling, setExpandedSocialSelling] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<Record<string, string>>({});

  const handleCheck = (label: string, profile: string) => {
    const exists = selected.find((s) => s.label === label);
    setSelected(exists ? selected.filter((s) => s.label !== label) : [...selected, { label, profile }]);
  };

  const toggleExpand = (profile: string) => {
    setExpandedProfiles((prev) =>
      prev.includes(profile) ? prev.filter((p) => p !== profile) : [...prev, profile]
    );
    if (!expandedProfiles.includes(profile) && !viewMode[profile]) {
      setViewMode(prev => ({ ...prev, [profile]: 'objections' }));
    }
  };

  const toggleViewMode = (profile: string, mode: string) => {
    setViewMode(prev => ({ ...prev, [profile]: mode }));
  };

  const toggleObjection = (profile: string, index: number) => {
    const key = `${profile}-${index}`;
    setExpandedObjections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleScript = (profile: string, section: string) => {
    const key = `${profile}-${section}`;
    setExpandedScripts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSocialSelling = (profile: string, section: string) => {
    const key = `${profile}-${section}`;
    setExpandedSocialSelling(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const profileCount = selected.reduce((acc: Record<string, number>, cur) => {
    acc[cur.profile] = (acc[cur.profile] || 0) + 1;
    return acc;
  }, {});

  const sortedProfiles = Object.keys(profileCount).sort((a, b) => profileCount[b] - profileCount[a]);

  return (
    <div className="max-w-7xl mx-auto p-4 min-h-screen">
      <div className="text-center text-4xl mb-2 text-[#d2bc8f]">
        CXconversão
      </div>
      <p className="text-center text-muted-foreground text-xl mb-8">
        Radar Comportamental em Calls 1:1
      </p>

      {/* Marcadores de Observação */}
      <div className="bg-[#1a2332] border border-[#333] rounded-lg p-6 mb-6">
        <h2 className="text-[#d2bc8f] mb-4">Marque os sinais observados durante a call:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
          {markers.map((item, index) => (
            <label key={index} className="flex items-center p-2 rounded-md cursor-pointer hover:bg-[#d2bc8f]/10 transition-colors">
              <input
                type="checkbox"
                onChange={() => handleCheck(item.label, item.profile)}
                checked={selected.some((s) => s.label === item.label)}
                className="w-[18px] h-[18px] mr-3 accent-[#d2bc8f] cursor-pointer"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* Análise de Perfis */}
      {sortedProfiles.length > 0 && (
        <div>
          <h2 className="text-center text-2xl mb-8">
            🎯 Análise de Perfil Comportamental
          </h2>
          
          {sortedProfiles.map((profileKey) => {
            const suggestion = suggestions[profileKey as keyof typeof suggestions];
            const count = profileCount[profileKey];
            
            const borderColor = 
              profileKey === 'D' ? 'border-l-[#ff6b6b]' :
              profileKey === 'I' ? 'border-l-[#ffd43b]' :
              profileKey === 'S' ? 'border-l-[#51cf66]' :
              'border-l-[#339af0]';
            
            return (
              <div key={profileKey} className={`bg-[#1a2332] border border-[#333] ${borderColor} border-l-4 rounded-lg p-6 mb-6`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-[#d2bc8f] text-xl mb-2">
                      {suggestion.label} ({count} indicadores)
                    </h2>
                    <p>{suggestion.approach}</p>
                    <p>{suggestion.trigger}</p>
                  </div>
                  <div className="flex gap-2 flex-col">
                    <button
                      onClick={() => toggleExpand(profileKey)}
                      className="bg-[#d2bc8f] text-[#0c121c] px-6 py-3 rounded-lg font-bold hover:bg-[#e6d0a3] transition-all whitespace-nowrap"
                    >
                      {expandedProfiles.includes(profileKey) ? 'Ocultar Conteúdo' : 'Ver Conteúdo'}
                    </button>
                  </div>
                </div>
                
                {expandedProfiles.includes(profileKey) && (
                  <div className="mt-6">
                    {/* Botões para alternar entre as 4 abas */}
                    <div className="flex gap-4 mb-6 flex-wrap">
                      <button 
                        onClick={() => toggleViewMode(profileKey, 'objections')}
                        className={`px-4 py-3 rounded-lg font-bold transition-all text-sm ${
                          viewMode[profileKey] === 'objections' || !viewMode[profileKey]
                            ? 'bg-[#d2bc8f] text-[#0c121c]'
                            : 'bg-[#666] text-white'
                        }`}
                      >
                        💬 Objeções
                      </button>
                      <button 
                        onClick={() => toggleViewMode(profileKey, 'scripts')}
                        className={`px-4 py-3 rounded-lg font-bold transition-all text-sm ${
                          viewMode[profileKey] === 'scripts'
                            ? 'bg-[#d2bc8f] text-[#0c121c]'
                            : 'bg-[#666] text-white'
                        }`}
                      >
                        📋 Script de Conexão
                      </button>
                      <button 
                        onClick={() => toggleViewMode(profileKey, 'perguntas')}
                        className={`px-4 py-3 rounded-lg font-bold transition-all text-sm ${
                          viewMode[profileKey] === 'perguntas'
                            ? 'bg-[#d2bc8f] text-[#0c121c]'
                            : 'bg-[#666] text-white'
                        }`}
                      >
                        🤔 Perguntas Abertas
                      </button>
                      <button 
                        onClick={() => toggleViewMode(profileKey, 'social')}
                        className={`px-4 py-3 rounded-lg font-bold transition-all text-sm ${
                          viewMode[profileKey] === 'social'
                            ? 'bg-[#d2bc8f] text-[#0c121c]'
                            : 'bg-[#666] text-white'
                        }`}
                      >
                        📊 Social Selling
                      </button>
                    </div>

                    {/* Seção de Objeções */}
                    {(viewMode[profileKey] === 'objections' || !viewMode[profileKey]) && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">💬 Objeções e Respostas Calibradas:</h3>
                        {suggestion.objections.map((objection: any, index: number) => (
                          <div key={index} className="bg-[#2a3441] border border-[#444] rounded-lg p-4 mb-4">
                            <div 
                              onClick={() => toggleObjection(profileKey, index)}
                              className="cursor-pointer flex justify-between items-center text-[#ff6b6b] font-bold mb-2"
                            >
                              <span>{objection.title}</span>
                              <span>{expandedObjections[`${profileKey}-${index}`] ? '▼' : '▶'}</span>
                            </div>
                            
                            {expandedObjections[`${profileKey}-${index}`] && (
                              <div className="mt-4">
                                <div className="bg-[#1a2332] border-l-4 border-l-[#4dabf7] p-3 my-2 rounded-r-md">
                                  <div className="text-[#4dabf7] font-bold text-sm mb-1">
                                    💬 Pergunta Calibrada:
                                  </div>
                                  <em>"{objection.question}"</em>
                                </div>
                                <div className="bg-[#1a2332] border-l-4 border-l-[#51cf66] p-3 my-2 rounded-r-md">
                                  <div className="text-[#51cf66] font-bold text-sm mb-1">
                                    💡 Resposta Adaptada:
                                  </div>
                                  "{objection.response}"
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Seção de Scripts */}
                    {viewMode[profileKey] === 'scripts' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">📋 Script de Conexão e Abordagem:</h3>
                        <div className="space-y-4">
                          <div className="bg-[#2a3441] border border-[#444] rounded-lg p-4">
                            <h4 className="font-bold mb-2">{suggestion.script.objetivo.caracteristicas}</h4>
                            <p><strong>Busca:</strong> {suggestion.script.objetivo.busca}</p>
                            <p><strong>Evita:</strong> {suggestion.script.objetivo.evita}</p>
                            <p><strong>Foco:</strong> {suggestion.script.objetivo.foco}</p>
                          </div>

                          <div className="bg-[#2a3441] border border-[#444] rounded-lg p-4">
                            <h4 className="font-bold mb-2">{suggestion.script.abertura.titulo}</h4>
                            <p>{suggestion.script.abertura.script}</p>
                            <p><em>Gatilhos: {suggestion.script.abertura.gatilhos}</em></p>
                          </div>

                          {Object.entries(suggestion.script.spin).map(([key, section]: any) => (
                            <div key={key} className="bg-[#2a3441] border border-[#444] rounded-lg p-4">
                              <h4 className="font-bold mb-2">{section.titulo}</h4>
                              <p><strong>Objetivo:</strong> {section.objetivo}</p>
                              <p><strong>Gatilhos:</strong> {section.gatilhos}</p>
                              <ul className="list-disc list-inside mt-2">
                                {section.perguntas.map((q: string, idx: number) => (
                                  <li key={idx}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          ))}

                          <div className="bg-[#2a3441] border border-[#444] rounded-lg p-4">
                            <h4 className="font-bold mb-2">{suggestion.script.apresentacao.titulo}</h4>
                            <p>{suggestion.script.apresentacao.script}</p>
                            <p><em>Gatilhos: {suggestion.script.apresentacao.gatilhos}</em></p>
                          </div>

                          <div className="bg-[#2a3441] border border-[#444] rounded-lg p-4">
                            <h4 className="font-bold mb-2">{suggestion.script.chamada.titulo}</h4>
                            <p>{suggestion.script.chamada.script}</p>
                          </div>

                          <div className="bg-[#2a3441] border border-[#444] rounded-lg p-4">
                            <h4 className="font-bold mb-2">{suggestion.script.encaminhamento.titulo}</h4>
                            <p>{suggestion.script.encaminhamento.script}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Seção de Perguntas Abertas */}
                    {viewMode[profileKey] === 'perguntas' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">🤔 Perguntas Abertas Estratégicas:</h3>
                        <p><strong>Objetivo:</strong> {suggestion.perguntas_abertas.objetivo}</p>
                        <p><strong>Características:</strong> {suggestion.perguntas_abertas.caracteristicas}</p>
                        <ul className="list-disc list-inside mt-2">
                          {suggestion.perguntas_abertas.perguntas.map((q: string, idx: number) => (
                            <li key={idx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Seção de Social Selling */}
                    {viewMode[profileKey] === 'social' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">📊 Estratégia de Social Selling:</h3>
                        <p><strong>Objetivo:</strong> {suggestion.social_selling.objetivo}</p>
                        <p><strong>Características:</strong> {suggestion.social_selling.caracteristicas}</p>

                        <div className="mb-4">
                          <h4 className="font-bold">{suggestion.social_selling.estrategia_aproximacao.titulo}</h4>
                          <p>{suggestion.social_selling.estrategia_aproximacao.descricao}</p>
                          <ul className="list-disc list-inside mt-2">
                            {suggestion.social_selling.estrategia_aproximacao.tacticas.map((t: string, idx: number) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-bold">{suggestion.social_selling.conteudo_engajamento.titulo}</h4>
                          <p>{suggestion.social_selling.conteudo_engajamento.descricao}</p>
                          <ul className="list-disc list-inside mt-2">
                            {suggestion.social_selling.conteudo_engajamento.tipos.map((t: string, idx: number) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-bold">{suggestion.social_selling.scripts_dm.titulo}</h4>
                          <p>{suggestion.social_selling.scripts_dm.descricao}</p>
                          {suggestion.social_selling.scripts_dm.scripts.map((script: any, idx: number) => (
                            <div key={idx} className="mb-2">
                              <strong>{script.situacao}</strong>
                              <p>{script.script}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mb-4">
                          <h4 className="font-bold">{suggestion.social_selling.timing_frequencia.titulo}</h4>
                          <p>{suggestion.social_selling.timing_frequencia.descricao}</p>
                          <ul className="list-disc list-inside mt-2">
                            {suggestion.social_selling.timing_frequencia.diretrizes.map((d: string, idx: number) => (
                              <li key={idx}>{d}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-bold">{suggestion.social_selling.gatilhos_psicologicos.titulo}</h4>
                          <p>{suggestion.social_selling.gatilhos_psicologicos.descricao}</p>
                          <ul className="list-disc list-inside mt-2">
                            {suggestion.social_selling.gatilhos_psicologicos.gatilhos.map((g: string, idx: number) => (
                              <li key={idx}>{g}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Estado inicial */}
      {sortedProfiles.length === 0 && (
        <div className="text-center p-12 text-muted-foreground bg-[#1a2332] rounded-lg border-2 border-dashed border-[#444]">
          <h2 className="text-[#d2bc8f] text-2xl mb-4">Análise em Tempo Real</h2>
          <p>Marque os sinais comportamentais observados para receber as estratégias de conversão personalizadas.</p>
        </div>
      )}

      {/* Rodapé */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          CXconversão - Sistema de Análise Comportamental para Conversão em Calls
        </p>
      </div>
    </div>
  );
}

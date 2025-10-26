import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Brain,
  LogOut,
  LayoutDashboard,
  Upload as UploadIcon,
  FileText,
  Settings,
  Target
} from "lucide-react";
import "@/styles/radar-conversao.css";

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

const suggestions: any = {
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
    approach: "🎯 Seja entusiasta, mostre benefícios sociais e reconhecimento",
    trigger: "🔥 Relacionamentos, aprovação, entusiasmo",
    perguntas_abertas: {
      titulo: "Perguntas Abertas Estratégicas",
      objetivo: "fazer a pessoa falar sobre conexões, influências e desejos",
      caracteristicas: "Entusiasta, Comunicativo, Persuasivo",
      perguntas: [
        "Quem são as pessoas que mais influenciam suas decisões?",
        "Como você gosta de ser reconhecido no seu trabalho?",
        "Quais histórias de sucesso você mais gosta de compartilhar?",
        "O que te motiva a se conectar com novas pessoas?",
        "Como você descreveria seu estilo de comunicação?"
      ]
    },
    social_selling: {
      titulo: "Estratégia de Social Selling",
      objetivo: "conquistar perfis influentes com empatia, histórias e engajamento",
      caracteristicas: "Foco em conexão, emoção e reconhecimento",
      estrategia_aproximacao: {
        titulo: "🎯 ESTRATÉGIA DE APROXIMAÇÃO",
        descricao: "Use histórias, elogios sinceros e crie conexão emocional",
        tacticas: [
          "Compartilhe histórias inspiradoras e cases de sucesso",
          "Comente com entusiasmo e perguntas abertas",
          "Envie conteúdos que gerem identificação e pertencimento",
          "Use vídeos e imagens para aumentar o engajamento",
          "Seja caloroso e acessível em todas as comunicações"
        ]
      },
      conteudo_engajamento: {
        titulo: "📊 CONTEÚDO PARA ENGAJAMENTO",
        descricao: "Tipos de posts que atraem e engajam perfis influentes",
        tipos: [
          "Posts com histórias de sucesso e depoimentos",
          "Conteúdos que destacam pessoas e equipes",
          "Dicas para melhorar comunicação e networking",
          "Eventos e encontros para ampliar conexões",
          "Posts com perguntas e enquetes para interação"
        ]
      },
      scripts_dm: {
        titulo: "💬 SCRIPTS PARA MENSAGEM DIRETA",
        descricao: "Abordagem calorosa e focada em conexão",
        scripts: [
          {
            situacao: "1. Primeiro contato (Conexão e abertura)",
            script: "Oi [Nome], tudo bem? Vi seu perfil e adorei seu trabalho em [área]. Gostaria de trocar umas ideias sobre como podemos crescer juntos. Topa?"
          },
          {
            situacao: "2. Mapeamento com interesses",
            script: "Quais são os maiores desafios que você tem enfrentado na sua área? Gosto de entender para ajudar melhor."
          },
          {
            situacao: "3. Mapeamento qualificatório",
            script: "Como você mede o sucesso das suas ações hoje? Tem alguma meta que gostaria de alcançar nos próximos meses?"
          },
          {
            situacao: "4. Direcionamento para call",
            script: "Tenho uma metodologia que tem ajudado muitos profissionais como você a aumentar o impacto e a rede de contatos. Quer marcar uma conversa rápida para eu te mostrar?"
          },
          {
            situacao: "5. Marcação de call",
            script: "Tenho horários na terça às 15h ou quarta às 10h. Qual funciona melhor para você?"
          }
        ]
      },
      timing_frequencia: {
        titulo: "⏰ TIMING E FREQUÊNCIA",
        descricao: "Quando e com que frequência abordar",
        diretrizes: [
          "Responda com entusiasmo e rapidez",
          "Poste conteúdos no meio da manhã ou início da tarde",
          "Mantenha frequência constante com conteúdos variados",
          "Evite mensagens muito formais ou frias",
          "Use chamadas para ação que envolvam interação"
        ]
      },
      gatilhos_psicologicos: {
        titulo: "🧠 GATILHOS PSICOLÓGICOS",
        descricao: "Elementos que ativam o interesse de perfis influentes",
        gatilhos: [
          "Pertencimento: 'Junte-se a uma comunidade exclusiva'",
          "Reconhecimento: 'Seja destaque no seu setor'",
          "Novidade: 'Conheça as últimas tendências'",
          "Entusiasmo: 'Histórias que inspiram e motivam'",
          "Interação: 'Participe de eventos e debates'"
        ]
      }
    },
    script: {
      objetivo: {
        caracteristicas: "Pessoa sociável, entusiasta e persuasiva.",
        busca: "conexão, reconhecimento, influência e aprovação",
        evita: "isolamento, rejeição e falta de interação",
        foco: "Como posso me destacar e me conectar melhor?"
      },
      abertura: {
        titulo: "ABERTURA CALOROSA (CONEXÃO)",
        script: "Oi [Nome], adorei seu perfil! Quero compartilhar umas ideias que podem te ajudar a crescer ainda mais. Vamos conversar?",
        gatilhos: "Empatia, entusiasmo, conexão"
      },
      spin: {
        situacao: {
          titulo: "PERGUNTAS DE SITUAÇÃO (SPIN: S)",
          objetivo: "entender o contexto social e de comunicação",
          perguntas: [
            "Como você costuma se comunicar com sua equipe e clientes?",
            "Quais canais você usa para se conectar com seu público?",
            "Como você mede o engajamento das suas ações?"
          ],
          gatilhos: "Empatia, conexão, reconhecimento"
        },
        problema: {
          titulo: "PERGUNTAS DE PROBLEMA (SPIN: P)",
          objetivo: "identificar dificuldades em comunicação e influência",
          perguntas: [
            "Você sente que sua mensagem está chegando como gostaria?",
            "Quais desafios você enfrenta para engajar seu público?",
            "Já teve dificuldades em manter relacionamentos profissionais?"
          ],
          gatilhos: "Frustração, desejo de melhoria, reconhecimento"
        },
        implicacao: {
          titulo: "PERGUNTAS DE IMPLICAÇÃO (SPIN: I)",
          objetivo: "mostrar consequências da falta de conexão",
          perguntas: [
            "Como isso tem impactado seus resultados e oportunidades?",
            "Você já perdeu alguma parceria importante por falta de comunicação?",
            "Como isso afeta sua motivação e reconhecimento?"
          ],
          gatilhos: "Urgência, impacto social, perda"
        },
        necessidade: {
          titulo: "PERGUNTAS DE NECESSIDADE DE SOLUÇÃO (SPIN: N)",
          objetivo: "ativar desejo por solução de comunicação eficaz",
          perguntas: [
            "Se você pudesse melhorar sua comunicação e influência, como isso ajudaria?",
            "Qual seria o impacto de ter uma rede mais engajada e ativa?"
          ],
          gatilhos: "Desejo de conexão, crescimento, reconhecimento"
        }
      },
      apresentacao: {
        titulo: "APRESENTAÇÃO DO MÉTODO",
        script: "Nosso método foca em criar conexões reais e engajamento autêntico, ajudando você a se destacar e influenciar positivamente seu público.",
        gatilhos: "Empatia, prova social, resultados"
      },
      chamada: {
        titulo: "CHAMADA PRA AÇÃO",
        script: "Quer aprender como aumentar sua influência e engajamento de forma natural e eficaz?"
      },
      encaminhamento: {
        titulo: "ENCAMINHAMENTO (FECHAMENTO PARCIAL)",
        script: "Se fizer sentido, podemos agendar uma conversa para eu te mostrar o passo a passo. Que tal?"
      }
    },
    objections: [
      {
        title: "❌ Não sou bom em redes sociais",
        question: "O que te impede de usar as redes para se conectar melhor?",
        response: "Muitos começam assim, mas com o método certo, você aprende a usar seu jeito natural para criar conexões reais e autênticas."
      },
      {
        title: "❌ Não tenho tempo para isso",
        question: "Quanto tempo você dedica hoje para se relacionar com seu público?",
        response: "Nosso método é focado em otimizar seu tempo, usando estratégias simples que geram grande impacto com pouco esforço."
      },
      {
        title: "❌ Não sei se isso funciona para mim",
        question: "Você já viu alguém parecido com você ter sucesso com essa abordagem?",
        response: "Temos vários casos de pessoas com seu perfil que aumentaram sua influência e resultados aplicando essas técnicas."
      }
    ]
  },
  S: {
    label: "🟩 Perfil Estável",
    approach: "🎯 Seja paciente, mostre segurança e apoio",
    trigger: "🔥 Estabilidade, confiança, harmonia",
    perguntas_abertas: {
      titulo: "Perguntas Abertas Estratégicas",
      objetivo: "fazer a pessoa falar sobre segurança, rotina e valores",
      caracteristicas: "Calmo, Leal, Paciente",
      perguntas: [
        "O que te traz mais segurança no seu trabalho?",
        "Como você lida com mudanças e imprevistos?",
        "Quais valores são mais importantes para você na sua equipe?",
        "Como você prefere receber feedbacks e orientações?",
        "O que te ajuda a manter o foco e a motivação?"
      ]
    },
    social_selling: {
      titulo: "Estratégia de Social Selling",
      objetivo: "conquistar perfis estáveis com confiança, suporte e consistência",
      caracteristicas: "Foco em segurança, apoio e relacionamento duradouro",
      estrategia_aproximacao: {
        titulo: "🎯 ESTRATÉGIA DE APROXIMAÇÃO",
        descricao: "Mostre que você é confiável, consistente e que oferece suporte real",
        tacticas: [
          "Compartilhe conteúdos que reforcem segurança e estabilidade",
          "Comente com empatia e ofereça ajuda prática",
          "Envie mensagens que transmitam calma e confiança",
          "Use depoimentos e provas sociais de longo prazo",
          "Seja paciente e respeite o tempo do prospect"
        ]
      },
      conteudo_engajamento: {
        titulo: "📊 CONTEÚDO PARA ENGAJAMENTO",
        descricao: "Tipos de posts que atraem e engajam perfis estáveis",
        tipos: [
          "Posts sobre rotinas e processos confiáveis",
          "Conteúdos que destacam suporte e trabalho em equipe",
          "Dicas para manter equilíbrio e foco",
          "Histórias de sucesso com resultados consistentes",
          "Posts que valorizam a confiança e a lealdade"
        ]
      },
      scripts_dm: {
        titulo: "💬 SCRIPTS PARA MENSAGEM DIRETA",
        descricao: "Abordagem calma e focada em suporte",
        scripts: [
          {
            situacao: "1. Primeiro contato (Conexão e abertura)",
            script: "Oi [Nome], tudo bem? Vi seu perfil e achei interessante seu foco em estabilidade e resultados consistentes. Gostaria de conversar para entender como posso ajudar."
          },
          {
            situacao: "2. Mapeamento com necessidades",
            script: "Quais são os maiores desafios que você enfrenta para manter a estabilidade no seu negócio?"
          },
          {
            situacao: "3. Mapeamento qualificatório",
            script: "Como você mede o sucesso das suas ações atualmente? Tem alguma meta de longo prazo que gostaria de alcançar?"
          },
          {
            situacao: "4. Direcionamento para call",
            script: "Tenho uma abordagem que tem ajudado muitos profissionais a manter resultados consistentes e seguros. Quer marcar uma conversa para eu te mostrar?"
          },
          {
            situacao: "5. Marcação de call",
            script: "Tenho horários na terça às 15h ou quarta às 10h. Qual funciona melhor para você?"
          }
        ]
      },
      timing_frequencia: {
        titulo: "⏰ TIMING E FREQUÊNCIA",
        descricao: "Quando e com que frequência abordar",
        diretrizes: [
          "Responda com calma e atenção",
          "Poste conteúdos no final da manhã ou início da tarde",
          "Mantenha frequência constante e previsível",
          "Evite pressa ou pressão nas mensagens",
          "Use chamadas para ação suaves e convidativas"
        ]
      },
      gatilhos_psicologicos: {
        titulo: "🧠 GATILHOS PSICOLÓGICOS",
        descricao: "Elementos que ativam o interesse de perfis estáveis",
        gatilhos: [
          "Segurança: 'Método testado e aprovado'",
          "Confiança: 'Suporte dedicado e acompanhamento'",
          "Consistência: 'Resultados duradouros e estáveis'",
          "Calma: 'Processos simples e sem pressa'",
          "Lealdade: 'Comunidade de apoio e parceria'"
        ]
      }
    },
    script: {
      objetivo: {
        caracteristicas: "Pessoa calma, paciente e leal.",
        busca: "segurança, estabilidade, apoio e harmonia",
        evita: "conflitos, mudanças bruscas e pressa",
        foco: "Como posso garantir resultados seguros e duradouros?"
      },
      abertura: {
        titulo: "ABERTURA CALMA (CONEXÃO)",
        script: "Oi [Nome], tudo certo? Quero compartilhar algumas ideias que podem ajudar a manter seus resultados estáveis e seguros. Vamos conversar?",
        gatilhos: "Calma, confiança, apoio"
      },
      spin: {
        situacao: {
          titulo: "PERGUNTAS DE SITUAÇÃO (SPIN: S)",
          objetivo: "entender o contexto de estabilidade e rotina",
          perguntas: [
            "Como você mantém a estabilidade no seu negócio?",
            "Quais processos você tem para garantir resultados consistentes?",
            "Como você lida com imprevistos e mudanças?"
          ],
          gatilhos: "Segurança, rotina, confiança"
        },
        problema: {
          titulo: "PERGUNTAS DE PROBLEMA (SPIN: P)",
          objetivo: "identificar dificuldades em manter estabilidade",
          perguntas: [
            "Você já teve problemas com resultados inconsistentes?",
            "Quais desafios surgem quando algo sai do planejado?",
            "Como isso afeta sua confiança e motivação?"
          ],
          gatilhos: "Frustração, insegurança, desejo de estabilidade"
        },
        implicacao: {
          titulo: "PERGUNTAS DE IMPLICAÇÃO (SPIN: I)",
          objetivo: "mostrar consequências da instabilidade",
          perguntas: [
            "Como isso impacta seus resultados e equipe?",
            "Você já perdeu oportunidades por falta de estabilidade?",
            "Como isso afeta seu planejamento de longo prazo?"
          ],
          gatilhos: "Urgência, impacto negativo, perda"
        },
        necessidade: {
          titulo: "PERGUNTAS DE NECESSIDADE DE SOLUÇÃO (SPIN: N)",
          objetivo: "ativar desejo por solução estável e segura",
          perguntas: [
            "Se você pudesse garantir resultados estáveis, como isso ajudaria?",
            "Qual seria o impacto de ter um suporte confiável e constante?"
          ],
          gatilhos: "Desejo de segurança, apoio, consistência"
        }
      },
      apresentacao: {
        titulo: "APRESENTAÇÃO DO MÉTODO",
        script: "Nosso método foca em criar processos seguros e suporte constante, ajudando você a manter resultados estáveis e confiáveis.",
        gatilhos: "Confiança, prova social, resultados"
      },
      chamada: {
        titulo: "CHAMADA PRA AÇÃO",
        script: "Quer aprender como garantir estabilidade e segurança nos seus resultados?"
      },
      encaminhamento: {
        titulo: "ENCAMINHAMENTO (FECHAMENTO PARCIAL)",
        script: "Se fizer sentido, podemos agendar uma conversa para eu te mostrar o passo a passo. Que tal?"
      }
    },
    objections: [
      {
        title: "❌ Tenho medo de mudanças",
        question: "O que te preocupa mais em mudar seus processos atuais?",
        response: "Entendo, mudanças podem ser difíceis. Nosso método é gradual e respeita seu ritmo, garantindo segurança em cada passo."
      },
      {
        title: "❌ Prefiro manter o que já funciona",
        question: "O que você acha que poderia melhorar no seu método atual?",
        response: "Mesmo métodos que funcionam podem ser otimizados para trazer mais segurança e resultados duradouros. Posso te mostrar como."
      },
      {
        title: "❌ Não quero complicações",
        question: "Quais complicações você já enfrentou tentando melhorar seus resultados?",
        response: "Nosso método é simples e focado em facilitar sua rotina, sem complicações desnecessárias."
      }
    ]
  },
  C: {
    label: "🟦 Perfil Cauteloso",
    approach: "🎯 Seja detalhista, mostre dados e segurança",
    trigger: "🔥 Precisão, qualidade, análise",
    perguntas_abertas: {
      titulo: "Perguntas Abertas Estratégicas",
      objetivo: "fazer a pessoa falar sobre processos, qualidade e detalhes",
      caracteristicas: "Analítico, Preciso, Cauteloso",
      perguntas: [
        "Como você garante a qualidade do seu trabalho?",
        "Quais processos você usa para analisar resultados?",
        "Como você lida com erros e correções?",
        "Quais dados são mais importantes para suas decisões?",
        "Como você prefere receber informações e relatórios?"
      ]
    },
    social_selling: {
      titulo: "Estratégia de Social Selling",
      objetivo: "conquistar perfis cautelosos com dados, provas e segurança",
      caracteristicas: "Foco em precisão, qualidade e confiabilidade",
      estrategia_aproximacao: {
        titulo: "🎯 ESTRATÉGIA DE APROXIMAÇÃO",
        descricao: "Apresente dados, estudos e provas concretas desde o início",
        tacticas: [
          "Compartilhe relatórios e análises detalhadas",
          "Comente com informações técnicas e referências",
          "Envie conteúdos que comprovem qualidade e resultados",
          "Use depoimentos e certificações para reforçar confiança",
          "Seja claro e objetivo em todas as comunicações"
        ]
      },
      conteudo_engajamento: {
        titulo: "📊 CONTEÚDO PARA ENGAJAMENTO",
        descricao: "Tipos de posts que atraem e engajam perfis cautelosos",
        tipos: [
          "Posts com dados, gráficos e análises",
          "Conteúdos que explicam processos e metodologias",
          "Dicas para melhorar qualidade e precisão",
          "Estudos de caso detalhados",
          "Posts que destacam certificações e padrões"
        ]
      },
      scripts_dm: {
        titulo: "💬 SCRIPTS PARA MENSAGEM DIRETA",
        descricao: "Abordagem técnica e focada em dados",
        scripts: [
          {
            situacao: "1. Primeiro contato (Conexão e abertura)",
            script: "Oi [Nome], tudo bem? Notei seu foco em qualidade e análise. Gostaria de compartilhar algumas informações que podem ser úteis para você."
          },
          {
            situacao: "2. Mapeamento com necessidades",
            script: "Quais são os principais desafios que você enfrenta para garantir a qualidade dos seus resultados?"
          },
          {
            situacao: "3. Mapeamento qualificatório",
            script: "Como você mede a eficácia dos seus processos atualmente? Tem alguma meta de melhoria?"
          },
          {
            situacao: "4. Direcionamento para call",
            script: "Tenho uma metodologia baseada em dados que tem ajudado profissionais a aumentar a precisão e qualidade. Quer marcar uma conversa para eu te mostrar?"
          },
          {
            situacao: "5. Marcação de call",
            script: "Tenho horários na terça às 15h ou quarta às 10h. Qual funciona melhor para você?"
          }
        ]
      },
      timing_frequencia: {
        titulo: "⏰ TIMING E FREQUÊNCIA",
        descricao: "Quando e com que frequência abordar",
        diretrizes: [
          "Responda com clareza e detalhes",
          "Poste conteúdos no início da manhã ou final da tarde",
          "Mantenha frequência regular com conteúdos técnicos",
          "Evite mensagens vagas ou superficiais",
          "Use chamadas para ação baseadas em dados e provas"
        ]
      },
      gatilhos_psicologicos: {
        titulo: "🧠 GATILHOS PSICOLÓGICOS",
        descricao: "Elementos que ativam o interesse de perfis cautelosos",
        gatilhos: [
          "Precisão: 'Dados comprovados e análises detalhadas'",
          "Qualidade: 'Padrões elevados e certificações'",
          "Segurança: 'Processos testados e confiáveis'",
          "Detalhe: 'Informações completas e transparentes'",
          "Confiança: 'Provas sociais e depoimentos técnicos'"
        ]
      }
    },
    script: {
      objetivo: {
        caracteristicas: "Pessoa analítica, detalhista e cautelosa.",
        busca: "precisão, qualidade, segurança e análise",
        evita: "erros, imprecisão e falta de dados",
        foco: "Como posso garantir a melhor qualidade e segurança?"
      },
      abertura: {
        titulo: "ABERTURA TÉCNICA (CONEXÃO)",
        script: "Oi [Nome], tudo certo? Quero compartilhar algumas informações detalhadas que podem ajudar a melhorar a qualidade dos seus resultados. Vamos conversar?",
        gatilhos: "Detalhe, precisão, confiança"
      },
      spin: {
        situacao: {
          titulo: "PERGUNTAS DE SITUAÇÃO (SPIN: S)",
          objetivo: "entender o contexto técnico e de processos",
          perguntas: [
            "Quais processos você usa para garantir qualidade?",
            "Como você coleta e analisa dados atualmente?",
            "Quais ferramentas você utiliza para controle e análise?"
          ],
          gatilhos: "Precisão, análise, controle"
        },
        problema: {
          titulo: "PERGUNTAS DE PROBLEMA (SPIN: P)",
          objetivo: "identificar dificuldades em processos e qualidade",
          perguntas: [
            "Você já teve problemas com erros ou falhas?",
            "Quais desafios surgem na análise dos seus dados?",
            "Como isso afeta a confiança nos seus resultados?"
          ],
          gatilhos: "Frustração, insegurança, desejo de melhoria"
        },
        implicacao: {
          titulo: "PERGUNTAS DE IMPLICAÇÃO (SPIN: I)",
          objetivo: "mostrar consequências da falta de precisão",
          perguntas: [
            "Como isso impacta a tomada de decisão e resultados?",
            "Você já perdeu oportunidades por falta de dados confiáveis?",
            "Como isso afeta a reputação e credibilidade?"
          ],
          gatilhos: "Urgência, impacto negativo, perda"
        },
        necessidade: {
          titulo: "PERGUNTAS DE NECESSIDADE DE SOLUÇÃO (SPIN: N)",
          objetivo: "ativar desejo por solução precisa e confiável",
          perguntas: [
            "Se você pudesse garantir dados precisos e análises confiáveis, como isso ajudaria?",
            "Qual seria o impacto de ter processos mais seguros e eficientes?"
          ],
          gatilhos: "Desejo de precisão, segurança, qualidade"
        }
      },
      apresentacao: {
        titulo: "APRESENTAÇÃO DO MÉTODO",
        script: "Nosso método foca em processos detalhados e análises precisas, ajudando você a garantir qualidade e segurança nos seus resultados.",
        gatilhos: "Precisão, prova técnica, resultados"
      },
      chamada: {
        titulo: "CHAMADA PRA AÇÃO",
        script: "Quer aprender como aumentar a precisão e qualidade dos seus processos de forma segura?"
      },
      encaminhamento: {
        titulo: "ENCAMINHAMENTO (FECHAMENTO PARCIAL)",
        script: "Se fizer sentido, podemos agendar uma conversa para eu te mostrar o passo a passo. Que tal?"
      }
    },
    objections: [
      {
        title: "❌ Não confio em métodos genéricos",
        question: "O que você procura em um método para confiar nele?",
        response: "Nosso método é baseado em dados e análises específicas para seu contexto, garantindo segurança e resultados confiáveis."
      },
      {
        title: "❌ Prefiro fazer do meu jeito",
        question: "Quais aspectos do seu método atual você acha que podem ser melhorados?",
        response: "Mesmo métodos bem estabelecidos podem ser otimizados com dados e processos mais precisos. Posso te mostrar como."
      },
      {
        title: "❌ Não quero perder tempo com testes",
        question: "Quanto tempo você já perdeu tentando métodos que não funcionaram?",
        response: "Nosso método é testado e comprovado, focado em resultados rápidos e seguros, evitando desperdício de tempo."
      }
    ]
  }
};

export default function RadarConversao() {
  const [activeProfile, setActiveProfile] = useState<"D" | "I" | "S" | "C">("D");
  const [showContent, setShowContent] = useState({
    D: false,
    I: false,
    S: false,
    C: false
  });
  const [activeTab, setActiveTab] = useState({
    D: "objections",
    I: "objections",
    S: "objections",
    C: "objections"
  });

  const toggleContent = (profile: "D" | "I" | "S" | "C") => {
    setShowContent(prev => ({ ...prev, [profile]: !prev[profile] }));
  };

  const changeTab = (profile: "D" | "I" | "S" | "C", tab: string) => {
    setActiveTab(prev => ({ ...prev, [profile]: tab }));
  };

  return (
    <div className="radar-conversao-container">
      <h1 className="title" style={{ color: "#d2bc8f" }}>CXconversão</h1>
      <h2 className="subtitle" style={{ color: "#d2bc8f" }}>Radar Comportamental em Calls 1:1</h2>

      <div className="profiles-container">
        {(["D", "I", "S", "C"] as const).map(profile => {
          const sug = suggestions[profile];
          const isActive = activeProfile === profile;
          const borderColors = {
            D: "red",
            I: "yellow",
            S: "green",
            C: "blue"
          };
          return (
            <div
              key={profile}
              className={`profile-card ${isActive ? "active" : ""}`}
              style={{ borderColor: borderColors[profile] }}
              onClick={() => setActiveProfile(profile)}
            >
              <h3 style={{ color: "#d2bc8f" }}>{sug.label}</h3>
              <p><strong>Abordagem:</strong> {sug.approach}</p>
              <p><strong>Gatilho:</strong> {sug.trigger}</p>
              <button onClick={e => { e.stopPropagation(); toggleContent(profile); }}>
                {showContent[profile] ? "Ocultar Conteúdo" : "Ver Conteúdo"}
              </button>

              {showContent[profile] && (
                <div className="profile-content">
                  <div className="tabs">
                    <button
                      className={activeTab[profile] === "objections" ? "active" : ""}
                      onClick={() => changeTab(profile, "objections")}
                    >
                      Objeções
                    </button>
                    <button
                      className={activeTab[profile] === "script" ? "active" : ""}
                      onClick={() => changeTab(profile, "script")}
                    >
                      Script de Conexão
                    </button>
                    <button
                      className={activeTab[profile] === "perguntas_abertas" ? "active" : ""}
                      onClick={() => changeTab(profile, "perguntas_abertas")}
                    >
                      Perguntas Abertas
                    </button>
                    <button
                      className={activeTab[profile] === "social_selling" ? "active" : ""}
                      onClick={() => changeTab(profile, "social_selling")}
                    >
                      Social Selling
                    </button>
                  </div>

                  <div className="tab-content">
                    {activeTab[profile] === "objections" && (
                      <div>
                        {sug.objections.map((obj: any, idx: number) => (
                          <div key={idx} className="objection">
                            <h4>{obj.title}</h4>
                            <p><strong>Pergunta:</strong> {obj.question}</p>
                            <p><strong>Resposta:</strong> {obj.response}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab[profile] === "script" && (
                      <div>
                        <h4>Objetivo</h4>
                        <p><strong>Características:</strong> {sug.script.objetivo.caracteristicas}</p>
                        <p><strong>Busca:</strong> {sug.script.objetivo.busca}</p>
                        <p><strong>Evita:</strong> {sug.script.objetivo.evita}</p>
                        <p><strong>Foco:</strong> {sug.script.objetivo.foco}</p>

                        <h4>{sug.script.abertura.titulo}</h4>
                        <p>{sug.script.abertura.script}</p>
                        <p><em>Gatilhos: {sug.script.abertura.gatilhos}</em></p>

                        {Object.entries(sug.script.spin).map(([key, spinSection]: any) => (
                          <div key={key}>
                            <h4>{spinSection.titulo}</h4>
                            <p><strong>Objetivo:</strong> {spinSection.objetivo}</p>
                            <ul>
                              {spinSection.perguntas.map((p: string, i: number) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ul>
                            <p><em>Gatilhos: {spinSection.gatilhos}</em></p>
                          </div>
                        ))}

                        <h4>{sug.script.apresentacao.titulo}</h4>
                        <p>{sug.script.apresentacao.script}</p>
                        <p><em>Gatilhos: {sug.script.apresentacao.gatilhos}</em></p>

                        <h4>{sug.script.chamada.titulo}</h4>
                        <p>{sug.script.chamada.script}</p>

                        <h4>{sug.script.encaminhamento.titulo}</h4>
                        <p>{sug.script.encaminhamento.script}</p>
                      </div>
                    )}

                    {activeTab[profile] === "perguntas_abertas" && (
                      <div>
                        <h4>{sug.perguntas_abertas.titulo}</h4>
                        <p><strong>Objetivo:</strong> {sug.perguntas_abertas.objetivo}</p>
                        <p><strong>Características:</strong> {sug.perguntas_abertas.caracteristicas}</p>
                        <ul>
                          {sug.perguntas_abertas.perguntas.map((p: string, i: number) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab[profile] === "social_selling" && (
                      <div>
                        <h4>{sug.social_selling.titulo}</h4>
                        <p><strong>Objetivo:</strong> {sug.social_selling.objetivo}</p>
                        <p><strong>Características:</strong> {sug.social_selling.caracteristicas}</p>

                        <h5>{sug.social_selling.estrategia_aproximacao.titulo}</h5>
                        <p>{sug.social_selling.estrategia_aproximacao.descricao}</p>
                        <ul>
                          {sug.social_selling.estrategia_aproximacao.tacticas.map((t: string, i: number) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>

                        <h5>{sug.social_selling.conteudo_engajamento.titulo}</h5>
                        <p>{sug.social_selling.conteudo_engajamento.descricao}</p>
                        <ul>
                          {sug.social_selling.conteudo_engajamento.tipos.map((t: string, i: number) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>

                        <h5>{sug.social_selling.scripts_dm.titulo}</h5>
                        <p>{sug.social_selling.scripts_dm.descricao}</p>
                        {sug.social_selling.scripts_dm.scripts.map((script: any, i: number) => (
                          <div key={i}>
                            <strong>{script.situacao}</strong>
                            <p>{script.script}</p>
                          </div>
                        ))}

                        <h5>{sug.social_selling.timing_frequencia.titulo}</h5>
                        <p>{sug.social_selling.timing_frequencia.descricao}</p>
                        <ul>
                          {sug.social_selling.timing_frequencia.diretrizes.map((d: string, i: number) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>

                        <h5>{sug.social_selling.gatilhos_psicologicos.titulo}</h5>
                        <p>{sug.social_selling.gatilhos_psicologicos.descricao}</p>
                        <ul>
                          {sug.social_selling.gatilhos_psicologicos.gatilhos.map((g: string, i: number) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

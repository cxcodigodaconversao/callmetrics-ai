import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight } from "lucide-react";

const markers = [
  { id: "m1", label: "Fala rápida e direta", profile: "D" },
  { id: "m2", label: "Fala técnica e analítica", profile: "C" },
  { id: "m3", label: "Tom de voz suave e estável", profile: "S" },
  { id: "m4", label: "Sorriso, contato visual constante", profile: "I" },
  { id: "m5", label: "Fala animada e com histórias", profile: "I" },
  { id: "m6", label: "Tom de voz firme e decidido", profile: "D" },
  { id: "m7", label: "Tom de voz neutro e racional", profile: "C" },
  { id: "m8", label: "Expressão calma, receptiva", profile: "S" },
  { id: "m9", label: "Fala pausada e cuidadosa", profile: "S" },
  { id: "m10", label: "Tom de voz expressivo e emocional", profile: "I" },
  { id: "m11", label: "Olhar direto e assertivo", profile: "D" },
  { id: "m12", label: "Expressão séria, analítica", profile: "C" },
];

const suggestions = {
  D: {
    label: "🔴 Perfil Dominante",
    color: "border-red-500",
    bgColor: "bg-red-500",
    approach: "🎯 Seja direto, foque em resultado e ROI",
    trigger: "🔥 Resultados tangíveis, liderança, ganho de tempo",
    objections: [
      {
        title: "Já tentei de tudo e nada funciona",
        cliente: "Já testei várias soluções e nenhuma entregou o que prometia. Por que a sua seria diferente?",
        errado: "Entendo sua frustração, mas nossa solução é realmente diferente...",
        certo: "Resultados são inegociáveis. Vou ser direto: nosso ROI médio é X% em Y meses. Posso mostrar 3 casos de clientes que tiveram resultados mensuráveis. 5 minutos?",
        explicacao: "Dominantes valorizam fatos e resultados. Evite empatia excessiva e vá direto aos números e casos concretos."
      },
      {
        title: "Mas será que isso serve pra mim?",
        cliente: "Parece interessante, mas não sei se funciona para o meu tipo de negócio.",
        errado: "Sim, com certeza funciona! Temos muitos clientes satisfeitos...",
        certo: "Justo. Qual seu principal desafio hoje? [ouvir] Temos 12 clientes no seu setor que aumentaram X% em Y meses. Te mando o case study agora?",
        explicacao: "Dominantes querem prova social específica do setor deles, não promessas genéricas."
      },
      {
        title: "Quanto tempo leva pra dar resultado?",
        cliente: "Não tenho tempo a perder com soluções que demoram meses para funcionar.",
        errado: "Cada caso é único, mas geralmente em alguns meses você vê resultados...",
        certo: "Primeiros resultados em 30 dias. ROI completo em 90 dias. Timeline agressivo é justamente nosso diferencial para líderes como você.",
        explicacao: "Dominantes são impacientes. Dê prazos específicos e mostre que entende a urgência deles."
      },
      {
        title: "Eu não tenho dinheiro",
        cliente: "O investimento é alto e no momento não tenho esse orçamento disponível.",
        errado: "Podemos parcelar ou fazer um desconto especial para você...",
        certo: "Quanto você está perdendo por mês sem isso? Se a perda é maior que o investimento, o custo real é não começar. Vamos calcular seu ROI?",
        explicacao: "Dominantes pensam em ROI. Reframe: o problema não é o custo, é o custo de NÃO agir."
      },
      {
        title: "Não tenho tempo pra isso agora",
        cliente: "Estou muito ocupado agora, talvez mais para frente eu retome.",
        errado: "Sem problemas, posso te chamar daqui a uns meses...",
        certo: "Exatamente por isso que você precisa. Quanto tempo você perde por semana com [problema]? Nossa solução economiza X horas/semana. Vale 15 min hoje?",
        explicacao: "Dominantes valorizam eficiência. Mostre que você vai economizar tempo deles, não gastar."
      }
    ],
    script: {
      abertura: "Oi [Nome], vi que você é [cargo] na [empresa]. Vou ser direto: ajudamos empresas como a sua a [resultado específico] em [prazo]. Vale 10 minutos?",
      spin: [
        "S: Qual o principal desafio de vendas/operação hoje?",
        "P: Quanto isso está custando por mês em perda/ineficiência?",
        "I: Se isso continuar, qual impacto em 6 meses?",
        "N: Como seria se você resolvesse isso em 30 dias?"
      ],
      apresentacao: "Três pontos que importam: 1) ROI médio de X% em Y meses, 2) Setup em Z dias, 3) Suporte direto comigo. Próximo passo?",
      cta: "Vamos começar agora ou prefere segunda? Agenda aberta para [data1] ou [data2].",
      fechamento: "Se fizer sentido, começamos agora. Se não, sem problema. Decisão?"
    },
    perguntas_abertas: [
      "Qual o principal gargalo do seu time hoje?",
      "Quanto você está deixando de faturar com [problema]?",
      "Se você pudesse mudar uma coisa hoje, qual seria?",
      "Qual o custo de não resolver isso nos próximos 3 meses?"
    ],
    social_selling: {
      conteudo: "Case studies, ROI calculators, comparativos, listas de estratégias comprovadas",
      scripts: [
        "Aumentamos o faturamento da [Empresa] em X% em Y meses. [Link do case]",
        "ROI real: clientes no seu setor cresceram X% em Y meses. Quer ver como?"
      ],
      timing: "Seja direto. Responda rápido. Não enrole.",
      gatilho: "Competição, resultados mensuráveis, exclusividade, urgência"
    }
  },
  I: {
    label: "🟡 Perfil Influente",
    color: "border-yellow-500",
    bgColor: "bg-yellow-500",
    approach: "💖 Conecte com emoção e energia positiva",
    trigger: "🔥 Pertencimento, apoio, entusiasmo, reconhecimento",
    objections: [
      {
        title: "Já tentei de tudo e nada funciona",
        cliente: "Já comprei vários cursos e nenhum me ajudou de verdade...",
        errado: "Mas o nosso é diferente, confia!",
        certo: "Imagino como você se sente... Mas olha, tenho uma história: [Nome] estava exatamente assim e hoje ela [resultado incrível]. Quer saber como?",
        explicacao: "Influentes se conectam por emoção e histórias. Use storytelling e empatia genuína."
      },
      {
        title: "Mas será que isso serve pra mim?",
        cliente: "Parece legal, mas será que funciona para alguém como eu?",
        errado: "Claro que sim, funciona para todo mundo!",
        certo: "Olha, já ajudamos mais de 500 pessoas como você! Inclusive, [Nome] começou do zero e hoje [resultado]. Você não está sozinha nisso!",
        explicacao: "Influentes querem se sentir parte de algo. Mostre comunidade e histórias de identificação."
      },
      {
        title: "Quanto tempo leva pra dar resultado?",
        cliente: "Tenho medo de começar e não conseguir acompanhar...",
        errado: "É super rápido, você consegue!",
        certo: "Você não vai estar sozinha! Temos uma comunidade incrível que te apoia todo dia. A [Nome] começou igual você e em 2 meses já estava [resultado]!",
        explicacao: "Influentes temem abandono. Reforce comunidade, suporte e que ela vai fazer parte de algo especial."
      },
      {
        title: "Eu não tenho dinheiro",
        cliente: "Queria muito, mas está muito caro para mim agora...",
        errado: "Posso fazer um desconto especial.",
        certo: "Te entendo demais! Olha, o que mais ouço é: 'Deveria ter começado antes!' Vamos achar um jeito? Temos parcelamento e posso te ajudar com um plano personalizado. Bora?",
        explicacao: "Influentes querem sentir que você se importa. Mostre flexibilidade e apoio genuíno."
      },
      {
        title: "Não tenho tempo pra isso agora",
        cliente: "Estou muito ocupada, talvez mais para frente...",
        errado: "Quando você tiver tempo, me chama!",
        certo: "Imagino! Mas olha, a [Nome] também estava mega ocupada e sabe o que ela disse? 'Se eu soubesse que era tão mais leve com apoio, teria começado antes!' Que tal começar junto com ela?",
        explicacao: "Influentes respondem a FOMO e pertencimento. Mostre que ela está perdendo conexão e crescimento."
      }
    ],
    script: {
      abertura: "Oi [Nome]! 😊 Adorei seu perfil! Vi que você [algo pessoal]. Estou ajudando pessoas como você a [resultado] e pensei em você na hora! Vamos bater um papo?",
      spin: [
        "S: Como você está se sentindo em relação a [área]?",
        "P: O que mais te incomoda nisso hoje?",
        "I: Como isso afeta seu dia a dia e suas relações?",
        "N: Como você se veria daqui 3 meses com isso resolvido?"
      ],
      apresentacao: "Olha, o que eu mais amo aqui é: 1) Nossa comunidade é INCRÍVEL, todo mundo se ajuda, 2) Você vai ter suporte direto comigo, 3) Já vi tantas transformações lindas! Quer fazer parte?",
      cta: "Bora começar? Tenho vagas para [data1] ou [data2]. Qual combina mais com você? 💛",
      fechamento: "Vai ser incrível ter você com a gente! Qualquer dúvida, estou aqui. Bora?"
    },
    perguntas_abertas: [
      "Como você está se sentindo em relação a [área]?",
      "O que te deixa mais animado(a) quando pensa em [resultado]?",
      "Como seria sua vida ideal daqui 6 meses?",
      "O que te impede de começar algo novo?"
    ],
    social_selling: {
      conteudo: "Stories pessoais, transformações, comunidade, bastidores, depoimentos em vídeo",
      scripts: [
        "Gente, olha a história da [Nome]!! [história emocionante] Estou chorando! ❤️",
        "Quem mais se identifica? Comenta aqui! 👇"
      ],
      timing: "Seja caloroso, responsivo e acolhedor. Use emojis e energia.",
      gatilho: "Pertencimento, reconhecimento, medo de ficar de fora (FOMO), inspiração"
    }
  },
  S: {
    label: "🟢 Perfil Estável",
    color: "border-green-500",
    bgColor: "bg-green-500",
    approach: "🤝 Acolha, ofereça passo a passo e segurança",
    trigger: "🔥 Segurança, suporte, constância, processo claro",
    objections: [
      {
        title: "Já tentei de tudo e nada funciona",
        cliente: "Já tentei outras coisas e não deu certo. Tenho medo de me frustrar de novo...",
        errado: "Não se preocupe, vai dar certo!",
        certo: "Entendo perfeitamente sua preocupação. Vamos com calma? Posso te mostrar o processo passo a passo e você vê se faz sentido. Sem pressão, ok?",
        explicacao: "Estáveis precisam de segurança e processo claro. Remova pressão e mostre o caminho detalhado."
      },
      {
        title: "Mas será que isso serve pra mim?",
        cliente: "Parece complexo... será que consigo mesmo fazer?",
        errado: "É super fácil, qualquer um consegue!",
        certo: "Sei que mudanças podem parecer difíceis no início. Mas olha: você vai ter suporte em cada etapa. Vou estar aqui do seu lado. Vamos um passo de cada vez, sem pressa. Topa?",
        explicacao: "Estáveis temem falhar. Reforce suporte constante e processo gradual."
      },
      {
        title: "Quanto tempo leva pra dar resultado?",
        cliente: "E se eu começar e não conseguir acompanhar?",
        errado: "Você vai conseguir, é só seguir!",
        certo: "Nada de correria, ok? Você vai no seu ritmo. Temos um passo a passo clarinho e suporte toda semana. Se precisar de mais tempo, tudo bem! O importante é você se sentir segura.",
        explicacao: "Estáveis não gostam de pressão. Dê flexibilidade e reforce que podem ir no ritmo deles."
      },
      {
        title: "Eu não tenho dinheiro",
        cliente: "Gostaria, mas preciso pensar no orçamento da família...",
        errado: "É um investimento que vale a pena!",
        certo: "Eu respeito muito isso. Que tal a gente conversar com calma sobre as opções? Posso te mostrar formas de pagamento que caibam no seu orçamento. Sem compromisso, ok?",
        explicacao: "Estáveis precisam de segurança financeira. Seja respeitoso, ofereça opções e não pressione."
      },
      {
        title: "Não tenho tempo pra isso agora",
        cliente: "Estou com muita coisa na cabeça agora...",
        errado: "Mas é rapidinho!",
        certo: "Entendo totalmente. Que tal a gente começar bem devagar? Você não precisa mudar tudo de uma vez. Podemos ir com calma, no seu tempo. Te mando o material e você vê quando se sentir pronta?",
        explicacao: "Estáveis não gostam de mudanças bruscas. Ofereça flexibilidade e processo gradual."
      }
    ],
    script: {
      abertura: "Oi [Nome], tudo bem? Vi seu perfil e gostei da sua energia. Queria te contar sobre algo que pode te ajudar com [área], mas sem pressão nenhuma. Podemos conversar?",
      spin: [
        "S: Como você está se sentindo em relação a [área]?",
        "P: O que mais te preocupa nisso?",
        "I: Como isso afeta sua rotina e suas pessoas próximas?",
        "N: Como seria se você tivesse mais tranquilidade com isso?"
      ],
      apresentacao: "Olha, o que eu acho importante você saber: 1) Você vai ter suporte constante comigo, 2) Vamos passo a passo, no seu ritmo, 3) Sem pressão, ok? Só começa quando se sentir pronta.",
      cta: "Que tal começarmos? Temos vagas para [data1] ou [data2]. Qual funciona melhor para você? E fica tranquila, você pode pensar com calma.",
      fechamento: "Qualquer dúvida, estou aqui. Vamos juntos nessa, no seu tempo. Topa?"
    },
    perguntas_abertas: [
      "Como você está se sentindo em relação a [área]?",
      "O que te deixa mais inseguro(a) sobre mudanças?",
      "Como posso te ajudar a se sentir mais confortável?",
      "O que você precisa saber para se sentir seguro(a)?"
    ],
    social_selling: {
      conteudo: "Processos claros, passo a passo, depoimentos de apoio, garantias, suporte visível",
      scripts: [
        "Sei que mudanças assustam. Mas olha como a [Nome] foi no ritmo dela e conseguiu [resultado]. Você também pode! 🤗",
        "Passo a passo completo: [link]. Dúvidas? Estou aqui!"
      ],
      timing: "Seja paciente, acolhedor e não pressione. Responda com calma.",
      gatilho: "Segurança, suporte, processo claro, constância, sem mudanças bruscas"
    }
  },
  C: {
    label: "🔵 Perfil Conforme",
    color: "border-blue-500",
    bgColor: "bg-blue-500",
    approach: "📊 Traga lógica, processo e prova social",
    trigger: "🔥 Dados, método validado, clareza técnica",
    objections: [
      {
        title: "Já tentei de tudo e nada funciona",
        cliente: "Já investi em soluções que não entregaram resultados mensuráveis.",
        errado: "Nossa solução é diferente, confia!",
        certo: "Entendo. Posso te mostrar nossos dados? Taxa de sucesso de X%, metodologia validada em Y estudos, média de ROI de Z%. Quer o whitepaper completo?",
        explicacao: "Conformes precisam de dados concretos e metodologia comprovada. Nada de achismos."
      },
      {
        title: "Mas será que isso serve pra mim?",
        cliente: "Preciso entender melhor a metodologia antes de decidir.",
        errado: "É simples, você vai entender fazendo!",
        certo: "Perfeito. Te mando: 1) Fluxograma completo do processo, 2) Estudos de caso com métricas, 3) Comparativo com outras metodologias. Aí você analisa e me fala o que achou.",
        explicacao: "Conformes precisam analisar tudo. Dê material técnico completo e deixe-os processar."
      },
      {
        title: "Quanto tempo leva pra dar resultado?",
        cliente: "Qual a metodologia para medir os resultados?",
        errado: "Você vai ver os resultados acontecendo!",
        certo: "Usamos KPIs específicos: [métrica 1, 2, 3]. Primeiros indicadores em 30 dias, ROI completo em 90 dias. Te mando o dashboard de exemplo?",
        explicacao: "Conformes querem métricas claras e mensuráveis. Especifique KPIs e ferramentas de medição."
      },
      {
        title: "Eu não tenho dinheiro",
        cliente: "Preciso analisar o ROI antes de aprovar o investimento.",
        errado: "O retorno é garantido!",
        certo: "Correto. Vamos aos números: investimento de R$ X, ROI médio de Y% em Z meses, payback em W meses. Te mando a planilha de cálculo para você validar?",
        explicacao: "Conformes querem ver a conta. Dê números exatos e ferramentas para eles mesmos validarem."
      },
      {
        title: "Não tenho tempo pra isso agora",
        cliente: "Como funciona exatamente o processo de implementação?",
        errado: "É rápido, não se preocupe!",
        certo: "Processo em 4 fases: 1) Setup (5h), 2) Treinamento (10h), 3) Implementação (20h), 4) Monitoramento (2h/semana). Total: 35h no primeiro mês. Te mando o cronograma detalhado?",
        explicacao: "Conformes querem cronograma detalhado. Especifique exatamente quanto tempo cada etapa leva."
      }
    ],
    script: {
      abertura: "Olá [Nome], vi seu perfil e identifiquei sinergia com nossa solução. Ajudamos [tipo de empresa] a [resultado] através de [método]. ROI médio de X%. Vale uma análise?",
      spin: [
        "S: Qual seu processo atual para [área]?",
        "P: Quais gargalos você identificou nesse processo?",
        "I: Qual o impacto financeiro desses gargalos?",
        "N: Como você mediria o sucesso de uma solução?"
      ],
      apresentacao: "Três pilares metodológicos: 1) Framework baseado em [metodologia], 2) Métricas de acompanhamento via [ferramenta], 3) ROI médio de X% em Y meses. Documentação completa disponível.",
      cta: "Proposta: análise técnica de 30min. Posso agendar [data1] ou [data2]? Te mando agenda e pauta antecipada.",
      fechamento: "Te envio: 1) Proposta técnica, 2) Estudos de caso, 3) Cronograma. Analisa e me retorna com dúvidas?"
    },
    perguntas_abertas: [
      "Qual seu processo atual para [área]?",
      "Quais métricas você usa para medir [resultado]?",
      "Qual a principal ineficiência que você identificou?",
      "Como você validaria o sucesso de uma nova solução?"
    ],
    social_selling: {
      conteudo: "Whitepapers, estudos de caso com dados, comparativos técnicos, infográficos com estatísticas",
      scripts: [
        "Análise comparativa: nossa metodologia vs. concorrentes. [Link com dados]",
        "ROI médio de X% em Y meses (base: Z clientes). Quer o relatório completo?"
      ],
      timing: "Seja preciso, objetivo e técnico. Responda com dados.",
      gatilho: "Dados, prova social técnica, metodologia validada, clareza nos processos"
    }
  }
};

export default function RadarConversao() {
  const [checkedMarkers, setCheckedMarkers] = useState<Set<string>>(new Set());
  const [showContent, setShowContent] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Record<string, string>>({
    D: "objections",
    I: "objections",
    S: "objections",
    C: "objections"
  });
  const [expandedObjection, setExpandedObjection] = useState<Record<string, string | null>>({
    D: null,
    I: null,
    S: null,
    C: null
  });

  const handleMarkerCheck = (markerId: string, profile: string) => {
    const newChecked = new Set(checkedMarkers);
    if (newChecked.has(markerId)) {
      newChecked.delete(markerId);
    } else {
      newChecked.add(markerId);
    }
    setCheckedMarkers(newChecked);
  };

  const toggleContent = (profile: string) => {
    setShowContent(prev => ({ ...prev, [profile]: !prev[profile] }));
  };

  const changeTab = (profile: string, tab: string) => {
    setActiveTab(prev => ({ ...prev, [profile]: tab }));
  };

  const toggleObjection = (profile: string, objectionTitle: string) => {
    setExpandedObjection(prev => ({
      ...prev,
      [profile]: prev[profile] === objectionTitle ? null : objectionTitle
    }));
  };

  const getProfileCounts = () => {
    const counts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };
    markers.forEach(marker => {
      if (checkedMarkers.has(marker.id)) {
        counts[marker.profile]++;
      }
    });
    return counts;
  };

  const counts = getProfileCounts();

  return (
    <div className="min-h-screen bg-[#0f1621] text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#d4af37] mb-4">CXconversão</h1>
          <p className="text-lg md:text-xl text-gray-400">Radar Comportamental em Calls 1:1</p>
        </div>

        <div className="bg-[#1a2332] rounded-lg p-6 md:p-8 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#d4af37] mb-6">Marque os sinais observados durante a call:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {markers.map((marker) => (
              <div key={marker.id} className="flex items-start gap-3">
                <Checkbox
                  id={marker.id}
                  checked={checkedMarkers.has(marker.id)}
                  onCheckedChange={() => handleMarkerCheck(marker.id, marker.profile)}
                  className="mt-1 h-5 w-5 border-gray-500 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                />
                <label htmlFor={marker.id} className="text-sm leading-relaxed cursor-pointer text-gray-300 hover:text-white transition-colors">
                  {marker.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#d4af37] mb-4">Análise em Tempo Real</h2>
          <p className="text-gray-400">Marque os sinais comportamentais observados para receber as estratégias de conversão personalizadas.</p>
        </div>

        <div className="space-y-6">
          {Object.entries(suggestions).map(([profile, data]) => (
            <div key={profile} className={`bg-[#1a2332] rounded-lg overflow-hidden border-l-4 ${data.color}`}>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-6 h-6 ${data.bgColor} rounded`}></div>
                      <h3 className="text-xl md:text-2xl font-bold text-[#d4af37]">
                        Perfil {data.label.split(' ')[1]} ({counts[profile]} indicadores)
                      </h3>
                    </div>
                    <p className="text-gray-300 mb-2 flex items-center gap-2">{data.approach}</p>
                    <p className="text-gray-300 flex items-center gap-2">{data.trigger}</p>
                  </div>
                  <Button
                    onClick={() => toggleContent(profile)}
                    className="bg-[#d4af37] hover:bg-[#c49f2f] text-black font-semibold px-6 py-2 rounded-md transition-colors whitespace-nowrap"
                  >
                    {showContent[profile] ? "Ocultar Conteúdo" : "Ver Conteúdo"}
                  </Button>
                </div>

                {showContent[profile] && (
                  <div className="mt-6 animate-fade-in">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {["objections", "script", "questions", "social"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => changeTab(profile, tab)}
                          className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            activeTab[profile] === tab ? "bg-[#d4af37] text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {tab === "objections" && "💬 Objeções"}
                          {tab === "script" && "📋 Script de Conexão"}
                          {tab === "questions" && "🤔 Perguntas Abertas"}
                          {tab === "social" && "📊 Social Selling"}
                        </button>
                      ))}
                    </div>

                    <div className="bg-[#0f1621] rounded-lg p-6">
                      {activeTab[profile] === "objections" && (
                        <div>
                          <h4 className="text-xl font-bold text-[#d4af37] mb-4 flex items-center gap-2">💬 Objeções e Respostas Calibradas:</h4>
                          <div className="space-y-3">
                            {data.objections.map((obj: any) => (
                              <div key={obj.title} className="bg-[#1a2332] rounded-lg overflow-hidden">
                                <button
                                  onClick={() => toggleObjection(profile, obj.title)}
                                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#212d3f] transition-colors"
                                >
                                  <span className="flex items-center gap-2 text-red-400 font-medium">❌ {obj.title}</span>
                                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedObjection[profile] === obj.title ? "rotate-90" : ""}`} />
                                </button>
                                {expandedObjection[profile] === obj.title && (
                                  <div className="px-4 pb-4 space-y-4 animate-fade-in">
                                    <div className="bg-[#0f1621] p-4 rounded">
                                      <p className="text-sm text-gray-400 mb-1">Cliente diz:</p>
                                      <p className="text-gray-300 italic">"{obj.cliente}"</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div className="bg-red-950/30 border border-red-900/50 p-4 rounded">
                                        <p className="text-sm text-red-400 font-semibold mb-2">❌ Resposta Errada:</p>
                                        <p className="text-gray-300 text-sm italic">"{obj.errado}"</p>
                                      </div>
                                      <div className="bg-green-950/30 border border-green-900/50 p-4 rounded">
                                        <p className="text-sm text-green-400 font-semibold mb-2">✅ Resposta Certa:</p>
                                        <p className="text-gray-300 text-sm italic">"{obj.certo}"</p>
                                      </div>
                                    </div>
                                    <div className="bg-blue-950/30 border border-blue-900/50 p-4 rounded">
                                      <p className="text-sm text-blue-400 font-semibold mb-2">💡 Por que funciona:</p>
                                      <p className="text-gray-300 text-sm">{obj.explicacao}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab[profile] === "script" && (
                        <div>
                          <h4 className="text-xl font-bold text-[#d4af37] mb-4">📋 Script de Conexão</h4>
                          <div className="space-y-4">
                            {Object.entries(data.script).map(([key, value]) => (
                              <div key={key} className="bg-[#1a2332] p-4 rounded-lg">
                                <h5 className="font-semibold text-[#d4af37] mb-2 capitalize">{key === "cta" ? "Call to Action" : key.replace("_", " ")}:</h5>
                                {Array.isArray(value) ? (
                                  <ul className="space-y-2">{value.map((item: string, i: number) => <li key={i} className="text-gray-300">{item}</li>)}</ul>
                                ) : (
                                  <p className="text-gray-300">{value as string}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab[profile] === "questions" && (
                        <div>
                          <h4 className="text-xl font-bold text-[#d4af37] mb-4">🤔 Perguntas Abertas Estratégicas</h4>
                          <ul className="space-y-3">
                            {data.perguntas_abertas.map((q: string, i: number) => (
                              <li key={i} className="bg-[#1a2332] p-4 rounded-lg text-gray-300 flex items-start gap-2">
                                <span className="text-[#d4af37] font-bold">{i + 1}.</span>
                                {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activeTab[profile] === "social" && (
                        <div>
                          <h4 className="text-xl font-bold text-[#d4af37] mb-4">📊 Social Selling</h4>
                          <div className="space-y-4">
                            {Object.entries(data.social_selling).map(([key, value]) => (
                              <div key={key} className="bg-[#1a2332] p-4 rounded-lg">
                                <h5 className="font-semibold text-[#d4af37] mb-2 capitalize">{key.replace("_", " ")}:</h5>
                                {Array.isArray(value) ? (
                                  <ul className="space-y-2">{value.map((item: string, i: number) => <li key={i} className="text-gray-300 italic">"{item}"</li>)}</ul>
                                ) : (
                                  <p className="text-gray-300">{value as string}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-gray-500 text-sm">
          CXconversão - Sistema de Análise Comportamental para Conversão em Calls
        </div>
      </div>
    </div>
  );
}

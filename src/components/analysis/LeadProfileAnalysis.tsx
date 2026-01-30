import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ChevronDown, ChevronUp, User, AlertTriangle, Lightbulb } from "lucide-react";

interface LeadProfile {
  tipo: string;
  sinais: string[];
  abordagem_correta: string;
  abordagem_vendedor?: string;
  scripts_recomendados?: string[];
  alertas?: string[];
}

interface LeadProfileAnalysisProps {
  analysis: {
    insights_json: {
      perfil_lead_identificado?: LeadProfile;
      [key: string]: any;
    };
  };
}

const profileInfo: Record<string, {
  emoji: string;
  nome: string;
  descricao: string;
  cor: string;
  perigo?: string;
  taticas: string[];
}> = {
  apressado: {
    emoji: "⏰",
    nome: "Lead Apressado",
    descricao: "Demonstra pressa constante, pergunta quanto tempo vai durar, olha pro lado.",
    cor: "bg-orange-100 text-orange-800 border-orange-200",
    taticas: [
      "Demonstrar desapego com a venda",
      "Usar tirada de vaga quando necessário",
      "Ser direto e racional",
      "Usar dados, números e prova social"
    ]
  },
  desconfiado: {
    emoji: "🤨",
    nome: "Lead Desconfiado",
    descricao: "Desconfia da promessa, duvida que o produto resolve, questiona o expert.",
    cor: "bg-gray-100 text-gray-800 border-gray-200",
    taticas: [
      "Usar bastante prova social",
      "Fazer bom uso das garantias",
      "Transparência total",
      "Usar recuo estratégico"
    ]
  },
  medroso: {
    emoji: "😰",
    nome: "Lead Medroso",
    descricao: "Reconhece a necessidade, mas tem medo de perder dinheiro ou não conseguir resultado.",
    cor: "bg-blue-100 text-blue-800 border-blue-200",
    taticas: [
      "Identificar se é medo real ou irreal",
      "Mostrar suporte do programa",
      "Bom uso das garantias",
      "Cases de pessoas com mesmo medo"
    ]
  },
  analitico: {
    emoji: "📊",
    nome: "Lead Analítico",
    descricao: "Quer entender números, é racional, pede detalhes técnicos e comparações.",
    cor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    taticas: [
      "Comunicação mais calma, espelhar o lead",
      "Trazer DADOS e NÚMEROS concretos",
      "Não parecer vendedor 'uau uau'",
      "Convencer com racionalidade, não emoção"
    ]
  },
  curioso: {
    emoji: "🔍",
    nome: "Lead Curioso",
    descricao: "Entra só por curiosidade, só para saber preço. Geralmente NÃO COMPRA.",
    cor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    perigo: "Este é um dos PIORES perfis. Na maioria das vezes, NÃO COMPRA.",
    taticas: [
      "NUNCA passe preço antes do método completo",
      "Qualificar rápido para não perder tempo",
      "Fazer tirada de vaga se muito desinteresse",
      "Levar para ligação antes de videochamada"
    ]
  },
  procrastinador: {
    emoji: "⏳",
    nome: "Lead Procrastinador",
    descricao: "Sempre empurra decisão, 'vou pensar', 'depois te falo', 'vou ver com esposa'.",
    cor: "bg-red-100 text-red-800 border-red-200",
    taticas: [
      "Criar URGÊNCIA REAL",
      "Mostrar o CUSTO DE ESPERAR",
      "Usar etapa do COMBINADO muito firme",
      "Trazer contexto real para escassez"
    ]
  },
  social: {
    emoji: "🦜",
    nome: "Lead Social / Papagaio",
    descricao: "Conversa bastante, extrovertido, fica horas na call se deixar, promete e não compra.",
    cor: "bg-purple-100 text-purple-800 border-purple-200",
    perigo: "Você vai virar amigo do lead, passar 3 horas, e perder a venda.",
    taticas: [
      "PULSO FIRME - direcionar conversa sempre",
      "VOCÊ lidera a call, não o lead",
      "Não sair do método/passo a passo",
      "Fazer COMBINADO muito firme"
    ]
  }
};

export function LeadProfileAnalysis({ analysis }: LeadProfileAnalysisProps) {
  const [expanded, setExpanded] = useState(true);
  
  const perfilLead = analysis.insights_json?.perfil_lead_identificado;
  
  if (!perfilLead) {
    return null;
  }

  const tipoNormalizado = perfilLead.tipo?.toLowerCase().replace(/[^a-z]/g, "") || "";
  const profileData = profileInfo[tipoNormalizado] || {
    emoji: "👤",
    nome: perfilLead.tipo || "Perfil não identificado",
    descricao: "",
    cor: "bg-muted text-muted-foreground border-muted",
    taticas: []
  };

  return (
    <Card className="p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{profileData.emoji}</span>
          <h2 className="text-xl font-bold">Perfil do Lead Identificado</h2>
          <Badge className={`${profileData.cor} border`}>
            {profileData.nome}
          </Badge>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {/* Descrição do perfil */}
          <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-lg">
            <User className="w-5 h-5 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{profileData.descricao}</p>
              {profileData.perigo && (
                <div className="mt-2 flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{profileData.perigo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sinais identificados */}
          {perfilLead.sinais && perfilLead.sinais.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>🔎</span>
                Sinais identificados na conversa:
              </h3>
              <ul className="space-y-2">
                {perfilLead.sinais.map((sinal, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600">•</span>
                    <span>{sinal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Avaliação da abordagem do vendedor */}
          {perfilLead.abordagem_vendedor && (
            <div className={`p-4 rounded-lg border ${
              perfilLead.abordagem_vendedor.toLowerCase().includes("adequa") 
                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
            }`}>
              <h3 className="font-semibold mb-2">
                {perfilLead.abordagem_vendedor.toLowerCase().includes("adequa") ? "✅" : "❌"} 
                {" "}Abordagem do vendedor:
              </h3>
              <p className="text-sm">{perfilLead.abordagem_vendedor}</p>
            </div>
          )}

          {/* Abordagem correta */}
          {perfilLead.abordagem_correta && (
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Abordagem correta para este perfil:
              </h3>
              <p className="text-sm">{perfilLead.abordagem_correta}</p>
            </div>
          )}

          {/* Táticas recomendadas */}
          {profileData.taticas.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>🎯</span>
                Táticas recomendadas (do Manual):
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {profileData.taticas.map((tatica, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                    <span className="text-primary font-bold">{idx + 1}.</span>
                    <span>{tatica}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Scripts recomendados */}
          {perfilLead.scripts_recomendados && perfilLead.scripts_recomendados.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>📝</span>
                Scripts recomendados:
              </h3>
              <div className="space-y-2">
                {perfilLead.scripts_recomendados.map((script, idx) => (
                  <div key={idx} className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800 italic">
                    "{script}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertas */}
          {perfilLead.alertas && perfilLead.alertas.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="w-4 h-4" />
                Alertas:
              </h3>
              <ul className="space-y-1">
                {perfilLead.alertas.map((alerta, idx) => (
                  <li key={idx} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{alerta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

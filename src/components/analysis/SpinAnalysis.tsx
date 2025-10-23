import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpinAnalysisProps {
  analysis: {
    score_spin_s: number;
    score_spin_p: number;
    score_spin_i: number;
    score_spin_n: number;
  };
}

export function SpinAnalysis({ analysis }: SpinAnalysisProps) {
  const [expanded, setExpanded] = useState<string[]>(["situation"]);

  const toggleSection = (section: string) => {
    setExpanded((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const spinSections = [
    {
      id: "situation",
      title: "Situação (SPIN-S)",
      score: analysis.score_spin_s || 0,
      expected: [
        "3-5 perguntas sobre contexto atual do cliente",
        "Entender estrutura, processos e desafios atuais",
        "Mapear ferramentas e métodos já utilizados",
      ],
      happened:
        analysis.score_spin_s === 0
          ? "❌ Nenhuma pergunta de situação identificada"
          : "✅ Perguntas de situação foram feitas adequadamente",
      howToImprove: [
        '"Como você gerencia suas vendas hoje?"',
        '"Quantos leads você recebe por mês?"',
        '"Qual ferramenta você usa atualmente?"',
        '"Como está estruturado seu time?"',
      ],
    },
    {
      id: "problem",
      title: "Problema (SPIN-P)",
      score: analysis.score_spin_p || 0,
      expected: [
        "Identificar dores e desafios específicos",
        "Cliente verbalizar os problemas",
        "Explorar múltiplos pontos de dor",
      ],
      happened:
        analysis.score_spin_p === 0
          ? "❌ Problemas não foram explorados"
          : "✅ Problemas foram identificados adequadamente",
      howToImprove: [
        '"Qual o maior desafio que você enfrenta hoje?"',
        '"O que mais te incomoda no processo atual?"',
        '"Onde você perde mais tempo/dinheiro?"',
        '"Que problema isso causa no dia a dia?"',
      ],
    },
    {
      id: "implication",
      title: "Implicação (SPIN-I)",
      score: analysis.score_spin_i || 0,
      expected: [
        "Explorar consequências dos problemas",
        "Amplificar o custo de não resolver",
        "Criar senso de urgência",
      ],
      happened:
        analysis.score_spin_i === 0
          ? "❌ Implicações não foram exploradas"
          : "✅ Consequências foram discutidas adequadamente",
      howToImprove: [
        '"O que acontece se isso não for resolvido?"',
        '"Quanto isso está custando para sua empresa?"',
        '"Como isso afeta seus resultados?"',
        '"Que outras áreas são impactadas?"',
      ],
    },
    {
      id: "need",
      title: "Necessidade (SPIN-N)",
      score: analysis.score_spin_n || 0,
      expected: [
        "Cliente afirmar que precisa da solução",
        "Fazer o cliente vender para si mesmo",
        "Confirmar o valor percebido",
      ],
      happened:
        analysis.score_spin_n === 0
          ? "❌ Necessidade não foi estabelecida"
          : "✅ Cliente reconheceu a necessidade",
      howToImprove: [
        '"Como seria se você pudesse resolver isso?"',
        '"O que mudaria no seu negócio?"',
        '"Qual seria o valor disso para você?"',
        '"Faz sentido explorarmos uma solução?"',
      ],
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">🎯 Análise SPIN Selling</h2>
      <div className="space-y-4">
        {spinSections.map((section) => (
          <div key={section.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {section.id === "situation" ? "📋" : 
                   section.id === "problem" ? "🔍" :
                   section.id === "implication" ? "💡" : "✅"}
                </span>
                <span className="font-semibold">{section.title}</span>
                <Badge
                  variant="secondary"
                  className={`${getScoreColor(section.score)} font-bold`}
                >
                  {section.score}/100
                </Badge>
                {section.score === 0 && (
                  <Badge variant="destructive">NÃO IDENTIFICADO</Badge>
                )}
              </div>
              {expanded.includes(section.id) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expanded.includes(section.id) && (
              <div className="p-4 space-y-4 bg-muted/20">
                <div>
                  <h4 className="font-semibold mb-2">O que era esperado:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {section.expected.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">O que aconteceu:</h4>
                  <p className="text-sm text-muted-foreground">{section.happened}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Como melhorar:</h4>
                  <div className="space-y-2">
                    {section.howToImprove.map((tip, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <span className="text-green-600">✅</span>
                        <span className="text-sm italic">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

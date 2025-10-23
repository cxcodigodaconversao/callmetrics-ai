import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface CriticalPointsProps {
  analysis: {
    score_spin_s: number;
    score_spin_p: number;
    score_spin_i: number;
    score_spin_n: number;
    score_apresentacao: number;
    score_fechamento: number;
    score_objecoes: number;
    insights_json?: any;
  };
}

export function CriticalPoints({ analysis }: CriticalPointsProps) {
  const getCriticalIssues = () => {
    const issues: Array<{
      title: string;
      score: number;
      priority: "high" | "medium" | "low";
      problem: string;
      impact: string;
      action: string;
      example: string;
    }> = [];

    // Check SPIN scores
    const spinAvg = (
      (analysis.score_spin_s || 0) +
      (analysis.score_spin_p || 0) +
      (analysis.score_spin_i || 0) +
      (analysis.score_spin_n || 0)
    ) / 4;

    if (spinAvg < 40) {
      issues.push({
        title: "SPIN Selling Não Aplicado",
        score: Math.round(spinAvg),
        priority: "high",
        problem: "Você não fez perguntas de qualificação adequadas",
        impact: "Cliente não foi qualificado e não entendeu o valor",
        action: "Comece com 3-5 perguntas sobre o contexto atual do cliente",
        example: '"Como funciona seu processo hoje?"',
      });
    }

    if ((analysis.score_apresentacao || 0) < 40) {
      issues.push({
        title: "Apresentação Fraca",
        score: analysis.score_apresentacao || 0,
        priority: "high",
        problem: "Não apresentou a solução de forma clara",
        impact: "Cliente não entendeu o valor da proposta",
        action: "Use estrutura: Problema → Solução → Benefício",
        example: '"Você disse X, nossa solução faz Y, o que significa Z para você"',
      });
    }

    if ((analysis.score_fechamento || 0) < 40) {
      issues.push({
        title: "Fechamento Inexistente",
        score: analysis.score_fechamento || 0,
        priority: "medium",
        problem: "Não houve chamada para ação clara",
        impact: "Cliente ficou sem próximo passo definido",
        action: 'Sempre termine com assumptive close: "Posso enviar o contrato?"',
        example: '"Prefere começar dia 1 ou dia 15?"',
      });
    }

    if ((analysis.score_objecoes || 0) < 40) {
      issues.push({
        title: "Tratamento de Objeções Inadequado",
        score: analysis.score_objecoes || 0,
        priority: "medium",
        problem: "Não tratou as objeções com técnica estruturada",
        impact: "Cliente manteve as dúvidas e resistências",
        action: "Use framework E-R-P-C (Empatia, Reframe, Prova, Close)",
        example: '"Entendo sua preocupação... Deixa eu te mostrar como resolvemos isso..."',
      });
    }

    return issues.sort((a, b) => a.score - b.score);
  };

  const issues = getCriticalIssues();

  if (issues.length === 0) {
    return null;
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === "high") return "🔴";
    if (priority === "medium") return "🟠";
    return "🟡";
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-destructive" />
        Pontos Críticos - O Que Precisa Melhorar Urgente
      </h2>
      <div className="space-y-6">
        {issues.map((issue, index) => (
          <div
            key={issue.title}
            className="p-4 rounded-lg border bg-card space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getPriorityIcon(issue.priority)}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {index + 1}. {issue.title} ({issue.score}/100)
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-semibold text-destructive">├─ Problema:</span>
                    <span className="text-muted-foreground">{issue.problem}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-orange-500">├─ Impacto:</span>
                    <span className="text-muted-foreground">{issue.impact}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-green-600">└─ Ação:</span>
                    <span className="text-muted-foreground">{issue.action}</span>
                  </div>
                  <div className="ml-6 mt-2 p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      <span className="text-sm font-medium">Exemplo:</span>
                      <span className="text-sm italic">{issue.example}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

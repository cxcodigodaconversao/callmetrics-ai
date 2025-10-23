import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ActionPlanProps {
  analysis: {
    score_spin_s: number;
    score_spin_p: number;
    score_objecoes: number;
    score_fechamento: number;
  };
}

export function ActionPlan({ analysis }: ActionPlanProps) {
  const getPriority = (score: number) => {
    if (score < 40) return "high";
    if (score < 60) return "medium";
    return "low";
  };

  const spinAvg =
    ((analysis.score_spin_s || 0) +
      (analysis.score_spin_p || 0)) /
    2;

  const actions = [
    {
      priority: getPriority(spinAvg),
      title: "Implementar SPIN na Abertura",
      duration: "15 min de treinamento",
      why: `Seu score de qualificação foi ${Math.round(spinAvg)}/100`,
      goal: "Subir para 60+ na próxima call",
      how: [
        "Prepare 5 perguntas de SITUAÇÃO antes da call",
        "Use este script: [Link para script SPIN]",
        "Pratique com colega antes da próxima call real",
      ],
      downloadable: "Baixar checklist de perguntas",
    },
    {
      priority: getPriority(analysis.score_objecoes || 0),
      title: "Melhorar Tratamento de Objeções",
      duration: "30 min de estudo",
      why: `${analysis.score_objecoes || 0}% de sucesso nas objeções de preço`,
      goal: "Aprender framework E-R-P-C",
      how: [
        "Assista: [Vídeo 12min - Objeções de Preço]",
        "Pratique framework E-R-P-C (Empatia, Reframe, Prova, Close alternativo)",
        "Roleplay com líder amanhã às 9h",
      ],
      downloadable: "Baixar guia de objeções",
    },
    {
      priority: getPriority(analysis.score_fechamento || 0),
      title: "Adicionar Fechamento Assertivo",
      duration: "10 min de prática",
      why: "Call terminou sem próximo passo definido",
      goal: "Sempre terminar com compromisso",
      how: [
        'Use assumptive close: "Posso enviar contrato?"',
        'Alternative close: "Prefere começar dia 1 ou 15?"',
        'Nunca termine com: "O que acha?"',
      ],
      downloadable: "Baixar scripts de fechamento",
    },
  ];

  const getPriorityBadge = (priority: string) => {
    if (priority === "high")
      return (
        <Badge variant="destructive" className="bg-red-600">
          PRIORIDADE ALTA
        </Badge>
      );
    if (priority === "medium")
      return (
        <Badge variant="default" className="bg-orange-500">
          PRIORIDADE MÉDIA
        </Badge>
      );
    return (
      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
        PRIORIDADE BAIXA
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">💡 Plano de Ação - Próximos Passos</h2>

      <div className="space-y-6">
        {/* High Priority */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎯</span>
            <h3 className="font-bold">PRIORIDADE ALTA (Fazer AGORA nas próximas calls)</h3>
          </div>
          <div className="space-y-4">
            {actions
              .filter((a) => a.priority === "high")
              .map((action, index) => (
                <div key={index} className="p-4 border rounded-lg bg-red-500/5">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-1">✅</span>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">
                            {index + 1}. {action.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {action.duration}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex gap-2">
                            <span className="font-semibold">├─ Por quê:</span>
                            <span className="text-muted-foreground">{action.why}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="font-semibold">├─ Objetivo:</span>
                            <span className="text-muted-foreground">{action.goal}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="font-semibold">└─ Como fazer:</span>
                          </div>
                          <div className="ml-6 space-y-1">
                            {action.how.map((step, idx) => (
                              <div key={idx} className="flex gap-2">
                                <span>•</span>
                                <span className="text-muted-foreground text-sm">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-3 h-3" />
                        {action.downloadable}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="border-t my-6" />

        {/* Medium Priority */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎯</span>
            <h3 className="font-bold">PRIORIDADE MÉDIA (Próxima semana)</h3>
          </div>
          <div className="space-y-2">
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="font-semibold">Acelerar Ritmo da Call</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Sua call de 18min deveria ser 12min. Pratique síntese.
              </p>
            </div>
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span className="font-semibold">Usar Mais Dados e Números</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Mencione ROI, cases quantificados, estatísticas.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t my-6" />

        {/* Low Priority */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎯</span>
            <h3 className="font-bold">PRIORIDADE BAIXA (Este mês)</h3>
          </div>
          <div className="space-y-2">
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2">
                <span>🎭</span>
                <span className="font-semibold">Melhorar Tom de Voz</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Variar entonação para manter engajamento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

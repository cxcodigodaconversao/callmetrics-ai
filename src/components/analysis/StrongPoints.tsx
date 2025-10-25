import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface StrongPointsProps {
  analysis: {
    score_conexao: number;
    score_spin_s: number;
    score_spin_p: number;
    score_apresentacao: number;
    score_fechamento: number;
    insights_json?: any;
  };
}

export function StrongPoints({ analysis }: StrongPointsProps) {
  const pontosFortes = analysis?.insights_json?.pontos_fortes || [];
  
  const getStrongPoints = () => {
    const points: Array<{
      title: string;
      score?: number;
      description: string;
    }> = [];

    // Add points from AI insights
    pontosFortes.forEach((ponto: string, index: number) => {
      points.push({
        title: `Ponto Forte ${index + 1}`,
        description: ponto,
      });
    });

    return points;
  };

  const points = getStrongPoints();

  if (points.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Pontos Fortes
        </h2>
        <p className="text-muted-foreground">
          Nenhum ponto forte identificado nesta análise. Foque nas recomendações para melhorar seus resultados.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        Pontos Fortes - Continue Fazendo
      </h2>
      <div className="space-y-6">
        {points.map((point) => (
          <div
            key={point.title}
            className="p-4 rounded-lg border bg-green-500/5 space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{point.title}</h3>
                  {point.score && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                      {point.score}/100
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{point.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

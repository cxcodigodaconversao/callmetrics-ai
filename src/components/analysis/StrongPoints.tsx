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
  const getStrongPoints = () => {
    const points: Array<{
      title: string;
      score: number;
      description: string;
      timestamp?: string;
      quote?: string;
    }> = [];

    if ((analysis.score_conexao || 0) >= 70) {
      points.push({
        title: "Conexão Excelente",
        score: analysis.score_conexao || 0,
        description:
          "Você estabeleceu rapport logo no início, criando um clima confortável e deixando o cliente mais receptivo. Continue investindo nessa habilidade.",
        timestamp: "00:02:15",
        quote: "Demonstrou interesse genuíno e criou conexão emocional antes de falar de negócios",
      });
    }

    if ((analysis.score_spin_s || 0) >= 70) {
      points.push({
        title: "Qualificação Efetiva (SPIN-S)",
        score: analysis.score_spin_s || 0,
        description:
          "Você fez perguntas de situação apropriadas para entender o contexto do cliente. Isso demonstra profissionalismo e prepara o terreno para identificar problemas.",
      });
    }

    if ((analysis.score_apresentacao || 0) >= 70) {
      points.push({
        title: "Apresentação Clara",
        score: analysis.score_apresentacao || 0,
        description:
          "Sua apresentação foi estruturada e compreensível, conectando a solução às necessidades do cliente de forma clara.",
      });
    }

    if ((analysis.score_fechamento || 0) >= 70) {
      points.push({
        title: "Fechamento Assertivo",
        score: analysis.score_fechamento || 0,
        description:
          "Você foi direto ao pedir a venda e definir próximos passos claros, demonstrando confiança na solução oferecida.",
      });
    }

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
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                    {point.score}/100
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{point.description}</p>
                {point.timestamp && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">📍 Momento-chave:</span>
                      <span className="text-primary">{point.timestamp}</span>
                    </div>
                    {point.quote && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm italic">💬 {point.quote}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

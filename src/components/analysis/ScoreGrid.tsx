import { Card } from "@/components/ui/card";
import { 
  Handshake, 
  ClipboardList, 
  Search, 
  Lightbulb, 
  CheckCircle, 
  Target, 
  Film, 
  Shield, 
  DollarSign 
} from "lucide-react";

interface ScoreGridProps {
  analysis: {
    score_conexao: number;
    score_spin_s: number;
    score_spin_p: number;
    score_spin_i: number;
    score_spin_n: number;
    score_apresentacao: number;
    score_fechamento: number;
    score_objecoes: number;
    score_compromisso_pagamento: number;
  };
}

export function ScoreGrid({ analysis }: ScoreGridProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excelente";
    if (score >= 80) return "Muito Bom";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Precisa Melhorar";
    if (score > 0) return "Crítico";
    return "Ausente";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500/5 hover:bg-green-500/10";
    if (score >= 80) return "bg-green-400/5 hover:bg-green-400/10";
    if (score >= 60) return "bg-yellow-500/5 hover:bg-yellow-500/10";
    if (score >= 40) return "bg-orange-500/5 hover:bg-orange-500/10";
    return "bg-red-500/5 hover:bg-red-500/10";
  };

  const scores = [
    {
      icon: Handshake,
      title: "Conexão",
      subtitle: "Rapport",
      score: analysis.score_conexao || 0,
    },
    {
      icon: ClipboardList,
      title: "Situação",
      subtitle: "SPIN-S",
      score: analysis.score_spin_s || 0,
    },
    {
      icon: Search,
      title: "Problema",
      subtitle: "SPIN-P",
      score: analysis.score_spin_p || 0,
    },
    {
      icon: Lightbulb,
      title: "Implicação",
      subtitle: "SPIN-I",
      score: analysis.score_spin_i || 0,
    },
    {
      icon: CheckCircle,
      title: "Necessidade",
      subtitle: "SPIN-N",
      score: analysis.score_spin_n || 0,
    },
    {
      icon: Target,
      title: "Apresentação",
      subtitle: "Proposta",
      score: analysis.score_apresentacao || 0,
    },
    {
      icon: Film,
      title: "Fechamento",
      subtitle: "Close",
      score: analysis.score_fechamento || 0,
    },
    {
      icon: Shield,
      title: "Objeções",
      subtitle: "Tratamento",
      score: analysis.score_objecoes || 0,
    },
    {
      icon: DollarSign,
      title: "Compromisso",
      subtitle: "Pagamento",
      score: analysis.score_compromisso_pagamento || 0,
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        📊 Análise Detalhada por Etapa
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scores.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className={`p-6 text-center space-y-3 transition-colors ${getScoreBgColor(item.score)}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                </div>
              </div>
              <div className={`text-4xl font-bold ${getScoreColor(item.score)}`}>
                {item.score}%
              </div>
              <div className={`text-sm font-medium ${getScoreColor(item.score)}`}>
                {getScoreLabel(item.score)}
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

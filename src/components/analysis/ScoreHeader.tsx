import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Phone, Calendar, Clock, Video, DollarSign, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScoreHeaderProps {
  analysis: {
    score_global: number;
    video: {
      title: string;
      created_at: string;
      duration_sec: number;
      mode: string;
    };
    cost_usd?: number;
  };
}

export function ScoreHeader({ analysis }: ScoreHeaderProps) {
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
    return "Crítico";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500/10";
    if (score >= 80) return "bg-green-400/10";
    if (score >= 60) return "bg-yellow-500/10";
    if (score >= 40) return "bg-orange-500/10";
    return "bg-red-500/10";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs}seg`;
  };

  const score = analysis.score_global || 0;

  return (
    <Card className="p-6 space-y-4">
      {/* Title and Metadata */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Phone className="w-6 h-6 text-primary mt-1" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{analysis.video.title || "Sem título"}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(analysis.video.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(analysis.video.duration_sec || 0)}
              </div>
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                {analysis.video.mode === "youtube" ? "YouTube" : "Upload"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Score */}
      <div className={`p-6 rounded-lg ${getScoreBgColor(score)}`}>
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">SCORE GLOBAL:</span>
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}/100
            </span>
            <span className={`text-lg font-medium ${getScoreColor(score)}`}>
              ({getScoreLabel(score)})
            </span>
          </div>
          <Progress value={score} className="h-3" />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Badge variant="default">Analisado</Badge>
        {analysis.cost_usd && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            Custo: R$ {(analysis.cost_usd * 5.5).toFixed(2)}
          </div>
        )}
        <div className="flex items-center gap-1 text-muted-foreground">
          <User className="w-4 h-4" />
          Vendedor: A
        </div>
      </div>
    </Card>
  );
}

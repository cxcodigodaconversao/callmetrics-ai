import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface EvolutionChartProps {
  videoId: string;
}

export function EvolutionChart({ videoId }: EvolutionChartProps) {
  // Mock data - in real implementation, fetch last 5 analyses
  const historicalScores = [45, 58, 62, 70, 47]; // Last 5 calls
  const currentScore = historicalScores[historicalScores.length - 1];
  const previousScore = historicalScores[historicalScores.length - 2];
  const scoreDiff = currentScore - previousScore;

  const categoryComparison = [
    { name: "Conexão", current: 80, average: 65 },
    { name: "SPIN-S", current: 0, average: 45 },
    { name: "SPIN-P", current: 0, average: 38 },
    { name: "Apresentação", current: 0, average: 52 },
    { name: "Fechamento", current: 0, average: 41 },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">📈 Sua Evolução - Últimas 5 Calls</h2>

      {/* Score Chart */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Score Global:</h3>
        <div className="h-48 border rounded-lg p-4 bg-muted/20 flex items-end justify-around gap-2">
          {historicalScores.map((score, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center" style={{ height: "150px" }}>
                <div
                  className={`w-full rounded-t-md ${
                    index === historicalScores.length - 1
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                  style={{ height: `${(score / 100) * 150}px` }}
                />
              </div>
              <div className="text-xs font-medium">{score}</div>
              <div className="text-xs text-muted-foreground">
                Call {index + 1}
                {index === historicalScores.length - 1 && (
                  <div className="text-[10px]">(esta call)</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert */}
      {scoreDiff < 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <div className="font-semibold text-red-600">
              ⚠️ ALERTA: Seu score CAIU {Math.abs(scoreDiff)} pontos desde a última call
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Principais causas: SPIN não aplicado, Sem fechamento
            </div>
          </div>
        </div>
      )}

      {/* Category Comparison */}
      <div>
        <h3 className="font-semibold mb-4">Comparativo por Etapa:</h3>
        <div className="space-y-3">
          {categoryComparison.map((category) => {
            const diff = category.current - category.average;
            const isPositive = diff > 0;
            return (
              <div key={category.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.name}:</span>
                  <span
                    className={`text-xs ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "↑" : "↓"} {isPositive ? "+" : ""}
                    {diff} vs média
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={category.current} className="h-2" />
                  <span className="text-sm font-medium min-w-[45px]">
                    {category.current}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

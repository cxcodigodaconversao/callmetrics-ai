import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EvolutionChartProps {
  videoId: string;
  sellerName?: string;
}

export function EvolutionChart({ videoId, sellerName }: EvolutionChartProps) {
  const [historicalScores, setHistoricalScores] = useState<number[]>([]);
  const [categoryScores, setCategoryScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalAnalyses();
  }, [videoId, sellerName]);

  const fetchHistoricalAnalyses = async () => {
    try {
      const { data: currentVideo } = await supabase
        .from("videos")
        .select("seller_name, user_id")
        .eq("id", videoId)
        .single();

      if (!currentVideo?.seller_name) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("videos")
        .select(`
          id,
          created_at,
          analyses!inner (
            score_global,
            score_conexao,
            score_spin_s,
            score_spin_p,
            score_apresentacao,
            score_fechamento,
            created_at
          )
        `)
        .eq("user_id", currentVideo.user_id)
        .eq("seller_name", currentVideo.seller_name)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const scores = data
        ?.flatMap(v => v.analyses.map(a => a.score_global))
        .slice(0, 5)
        .reverse() || [];

      // Get category scores from the latest analysis
      if (data && data.length > 0 && data[0].analyses.length > 0) {
        const latest = data[0].analyses[0];
        const categoryData: Array<{ name: string; current: number; average?: number }> = [
          { name: "Conexão", current: latest.score_conexao || 0 },
          { name: "SPIN-S", current: latest.score_spin_s || 0 },
          { name: "SPIN-P", current: latest.score_spin_p || 0 },
          { name: "Apresentação", current: latest.score_apresentacao || 0 },
          { name: "Fechamento", current: latest.score_fechamento || 0 },
        ];

        // Calculate averages from all historical data
        const allAnalyses = data.flatMap(v => v.analyses);
        const avgConexao = Math.round(allAnalyses.reduce((sum, a) => sum + (a.score_conexao || 0), 0) / allAnalyses.length);
        const avgSpinS = Math.round(allAnalyses.reduce((sum, a) => sum + (a.score_spin_s || 0), 0) / allAnalyses.length);
        const avgSpinP = Math.round(allAnalyses.reduce((sum, a) => sum + (a.score_spin_p || 0), 0) / allAnalyses.length);
        const avgApresentacao = Math.round(allAnalyses.reduce((sum, a) => sum + (a.score_apresentacao || 0), 0) / allAnalyses.length);
        const avgFechamento = Math.round(allAnalyses.reduce((sum, a) => sum + (a.score_fechamento || 0), 0) / allAnalyses.length);

        categoryData[0].average = avgConexao;
        categoryData[1].average = avgSpinS;
        categoryData[2].average = avgSpinP;
        categoryData[3].average = avgApresentacao;
        categoryData[4].average = avgFechamento;

        setCategoryScores(categoryData);
      }

      setHistoricalScores(scores);
    } catch (error) {
      console.error("Error fetching historical analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Carregando histórico...</p>
      </Card>
    );
  }

  if (historicalScores.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">📈 Sua Evolução</h2>
        <p className="text-muted-foreground text-center py-8">
          Sem histórico disponível. Faça mais calls para ver sua evolução!
        </p>
      </Card>
    );
  }

  const currentScore = historicalScores[historicalScores.length - 1];
  const previousScore = historicalScores[historicalScores.length - 2];
  const scoreDiff = currentScore - previousScore;

  const categoryComparison = categoryScores.length > 0 ? categoryScores : [
    { name: "Conexão", current: 0, average: 0 },
    { name: "SPIN-S", current: 0, average: 0 },
    { name: "SPIN-P", current: 0, average: 0 },
    { name: "Apresentação", current: 0, average: 0 },
    { name: "Fechamento", current: 0, average: 0 },
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

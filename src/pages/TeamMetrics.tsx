import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, AlertTriangle, ArrowLeft, Brain, Filter } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TeamMetrics() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [teamStats, setTeamStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchTeamMetrics();
    }
  }, [user, loading, navigate, selectedTeam]);

  const fetchTeamMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("videos")
        .select(`
          seller_name,
          team_name,
          analyses!inner (
            score_global,
            score_conexao,
            score_spin_s,
            score_spin_p,
            score_spin_i,
            score_spin_n,
            score_apresentacao,
            score_fechamento,
            score_objecoes
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "completed")
        .not("seller_name", "is", null);

      if (selectedTeam !== "all") {
        query = query.eq("team_name", selectedTeam);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calcular médias do time inteiro
      const allScores = {
        global: [] as number[],
        spin: [] as number[],
        conexao: [] as number[],
        apresentacao: [] as number[],
        fechamento: [] as number[],
        objecoes: [] as number[]
      };

      const sellerCount = new Set<string>();
      const teamsSet = new Set<string>();

      data?.forEach(video => {
        if (video.seller_name) sellerCount.add(video.seller_name);
        if (video.team_name) teamsSet.add(video.team_name);
        
        video.analyses?.forEach((analysis: any) => {
          allScores.global.push(analysis.score_global || 0);
          allScores.conexao.push(analysis.score_conexao || 0);
          allScores.apresentacao.push(analysis.score_apresentacao || 0);
          allScores.fechamento.push(analysis.score_fechamento || 0);
          allScores.objecoes.push(analysis.score_objecoes || 0);
          
          const spinAvg = [
            analysis.score_spin_s,
            analysis.score_spin_p,
            analysis.score_spin_i,
            analysis.score_spin_n
          ].filter(s => s != null).reduce((a, b) => a + b, 0) / 4;
          allScores.spin.push(spinAvg);
        });
      });

      const avg = (arr: number[]) => 
        arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

      const teamAvg = {
        global: avg(allScores.global),
        spin: avg(allScores.spin),
        conexao: avg(allScores.conexao),
        apresentacao: avg(allScores.apresentacao),
        fechamento: avg(allScores.fechamento),
        objecoes: avg(allScores.objecoes)
      };

      // Identificar principal fraqueza do time
      const weaknesses = [
        { name: "SPIN", score: teamAvg.spin },
        { name: "Rapport/Conexão", score: teamAvg.conexao },
        { name: "Objeções", score: teamAvg.objecoes },
        { name: "Fechamento", score: teamAvg.fechamento }
      ].sort((a, b) => a.score - b.score);

      setTeamStats({
        totalSellers: sellerCount.size,
        totalCalls: allScores.global.length,
        averages: teamAvg,
        mainWeakness: weaknesses[0]
      });

      // Only update available teams on first load
      if (availableTeams.length === 0) {
        setAvailableTeams(Array.from(teamsSet).sort());
      }

    } catch (error) {
      console.error("Error fetching team metrics:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando métricas do time...</p>
        </div>
      </div>
    );
  }

  if (!teamStats || teamStats.totalCalls === 0) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Nenhum dado disponível</h2>
            <p className="text-muted-foreground">
              Ainda não há análises suficientes para mostrar métricas do time
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">👥 Métricas do Time</h1>
            <p className="text-muted-foreground text-lg">
              Visão consolidada da performance {selectedTeam !== "all" ? `do time "${selectedTeam}"` : "de todo o time comercial"}
            </p>
          </div>

          {availableTeams.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Times</SelectItem>
                  {availableTeams.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total de Vendedores</p>
                <p className="text-3xl font-bold">{teamStats.totalSellers}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total de Calls</p>
                <p className="text-3xl font-bold">{teamStats.totalCalls}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Score Médio do Time</p>
                <p className={`text-3xl font-bold ${getScoreColor(teamStats.averages.global)}`}>
                  {teamStats.averages.global}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Performance Média por Categoria</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Score Global</span>
                <span className={`font-bold ${getScoreColor(teamStats.averages.global)}`}>
                  {teamStats.averages.global}%
                </span>
              </div>
              <Progress value={teamStats.averages.global} className="h-3" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">SPIN</span>
                <span className={`font-bold ${getScoreColor(teamStats.averages.spin)}`}>
                  {teamStats.averages.spin}%
                </span>
              </div>
              <Progress value={teamStats.averages.spin} className="h-3" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Conexão/Rapport</span>
                <span className={`font-bold ${getScoreColor(teamStats.averages.conexao)}`}>
                  {teamStats.averages.conexao}%
                </span>
              </div>
              <Progress value={teamStats.averages.conexao} className="h-3" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Apresentação</span>
                <span className={`font-bold ${getScoreColor(teamStats.averages.apresentacao)}`}>
                  {teamStats.averages.apresentacao}%
                </span>
              </div>
              <Progress value={teamStats.averages.apresentacao} className="h-3" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Fechamento</span>
                <span className={`font-bold ${getScoreColor(teamStats.averages.fechamento)}`}>
                  {teamStats.averages.fechamento}%
                </span>
              </div>
              <Progress value={teamStats.averages.fechamento} className="h-3" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Objeções</span>
                <span className={`font-bold ${getScoreColor(teamStats.averages.objecoes)}`}>
                  {teamStats.averages.objecoes}%
                </span>
              </div>
              <Progress value={teamStats.averages.objecoes} className="h-3" />
            </div>
          </div>
        </Card>

        {teamStats.mainWeakness.score < 60 && (
          <Card className="p-6 bg-red-500/10 border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-red-600 mb-2">
                  ⚠️ Área Crítica de Melhoria do Time
                </h3>
                <p className="text-lg mb-4">
                  <span className="font-semibold">{teamStats.mainWeakness.name}</span>
                  {' '}está com média de{' '}
                  <span className="font-bold">{teamStats.mainWeakness.score}%</span>
                </p>
                <p className="text-muted-foreground">
                  Recomenda-se treinamento focado em <strong>{teamStats.mainWeakness.name}</strong> para 
                  melhorar a performance geral do time. Esta é a área com menor pontuação média.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

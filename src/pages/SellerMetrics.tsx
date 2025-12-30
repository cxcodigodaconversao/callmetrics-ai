import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, TrendingDown, Target, Award, 
  AlertTriangle, BarChart3, ArrowLeft, Brain, Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SellerStats {
  seller_name: string;
  total_calls: number;
  avg_score_global: number;
  avg_spin: number;
  avg_conexao: number;
  avg_apresentacao: number;
  avg_fechamento: number;
  avg_objecoes: number;
  main_weakness: string;
  improvement_needed: number;
  ranking_position: number;
}

export default function SellerMetrics() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [sellers, setSellers] = useState<SellerStats[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchSellerMetrics();
    }
  }, [user, loading, navigate, selectedTeam, selectedProject]);

  const fetchSellerMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("videos")
        .select(`
          seller_name,
          team_name,
          project_name,
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
      if (selectedProject !== "all") {
        query = query.eq("project_name", selectedProject);
      }

      const { data, error } = await query;

      if (error) throw error;

      const sellerMap = new Map<string, any>();
      const teamsSet = new Set<string>();
      const projectsSet = new Set<string>();

      data?.forEach(video => {
        if (!video.seller_name || !video.analyses) return;
        
        if (video.team_name) teamsSet.add(video.team_name);
        if (video.project_name) projectsSet.add(video.project_name);
        
        const analyses = video.analyses;
        if (!sellerMap.has(video.seller_name)) {
          sellerMap.set(video.seller_name, {
            seller_name: video.seller_name,
            total_calls: 0,
            scores: {
              global: [],
              spin: [],
              conexao: [],
              apresentacao: [],
              fechamento: [],
              objecoes: []
            }
          });
        }

        const seller = sellerMap.get(video.seller_name);
        analyses.forEach((analysis: any) => {
          seller.total_calls++;
          seller.scores.global.push(analysis.score_global || 0);
          
          const spinAvg = [
            analysis.score_spin_s,
            analysis.score_spin_p,
            analysis.score_spin_i,
            analysis.score_spin_n
          ].filter(s => s != null).reduce((a, b) => a + b, 0) / 4;
          
          seller.scores.spin.push(spinAvg);
          seller.scores.conexao.push(analysis.score_conexao || 0);
          seller.scores.apresentacao.push(analysis.score_apresentacao || 0);
          seller.scores.fechamento.push(analysis.score_fechamento || 0);
          seller.scores.objecoes.push(analysis.score_objecoes || 0);
        });
      });

      const sellersStats: SellerStats[] = Array.from(sellerMap.values()).map(seller => {
        const avg = (arr: number[]) => 
          arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        const avgScores = {
          global: avg(seller.scores.global),
          spin: avg(seller.scores.spin),
          conexao: avg(seller.scores.conexao),
          apresentacao: avg(seller.scores.apresentacao),
          fechamento: avg(seller.scores.fechamento),
          objecoes: avg(seller.scores.objecoes)
        };

        const weaknesses = [
          { name: "SPIN", score: avgScores.spin },
          { name: "Rapport/Conexão", score: avgScores.conexao },
          { name: "Objeções", score: avgScores.objecoes },
          { name: "Fechamento", score: avgScores.fechamento }
        ].sort((a, b) => a.score - b.score);

        return {
          seller_name: seller.seller_name,
          total_calls: seller.total_calls,
          avg_score_global: Math.round(avgScores.global),
          avg_spin: Math.round(avgScores.spin),
          avg_conexao: Math.round(avgScores.conexao),
          avg_apresentacao: Math.round(avgScores.apresentacao),
          avg_fechamento: Math.round(avgScores.fechamento),
          avg_objecoes: Math.round(avgScores.objecoes),
          main_weakness: weaknesses[0].name,
          improvement_needed: Math.round(weaknesses[0].score),
          ranking_position: 0
        };
      });

      sellersStats.sort((a, b) => b.avg_score_global - a.avg_score_global);
      sellersStats.forEach((seller, index) => {
        seller.ranking_position = index + 1;
      });

      setSellers(sellersStats);

      // Only update available filters on first load
      if (availableTeams.length === 0) {
        setAvailableTeams(Array.from(teamsSet).sort());
      }
      if (availableProjects.length === 0) {
        setAvailableProjects(Array.from(projectsSet).sort());
      }
    } catch (error) {
      console.error("Error fetching seller metrics:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRankingBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500 text-black">🥇 1º Lugar</Badge>;
    if (position === 2) return <Badge className="bg-gray-400 text-white">🥈 2º Lugar</Badge>;
    if (position === 3) return <Badge className="bg-orange-600 text-white">🥉 3º Lugar</Badge>;
    return <Badge variant="outline">{position}º Lugar</Badge>;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando métricas...</p>
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

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">📊 Métricas por Vendedor</h1>
              <p className="text-muted-foreground text-lg">
                Performance individual e áreas de melhoria baseadas em dados reais
              </p>
            </div>
          </div>

          {(availableTeams.length > 0 || availableProjects.length > 0) && (
            <div className="flex flex-wrap items-center gap-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              
              {availableTeams.length > 0 && (
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Times</SelectItem>
                    {availableTeams.map(team => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {availableProjects.length > 0 && (
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Projetos</SelectItem>
                    {availableProjects.map(project => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        {sellers.length === 0 ? (
          <Card className="p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Nenhum dado disponível</h2>
            <p className="text-muted-foreground mb-6">
              Faça upload de calls com informações de vendedor para ver as métricas aqui
            </p>
            <Link to="/dashboard/upload">
              <button className="btn-primary">
                Nova Análise
              </button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              Ranking de Performance
            </h2>
            
            <div className="space-y-4">
              {sellers.map(seller => (
                <div 
                  key={seller.seller_name}
                  className="p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      {getRankingBadge(seller.ranking_position)}
                      <div>
                        <h3 className="font-bold text-lg">{seller.seller_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {seller.total_calls} call{seller.total_calls !== 1 ? 's' : ''} analisada{seller.total_calls !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(seller.avg_score_global)}`}>
                        {seller.avg_score_global}%
                      </div>
                      <p className="text-xs text-muted-foreground">Score Médio</p>
                    </div>
                  </div>

                  <Progress value={seller.avg_score_global} className="h-2 mb-3" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">SPIN</p>
                      <p className={`font-bold ${getScoreColor(seller.avg_spin)}`}>
                        {seller.avg_spin}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conexão</p>
                      <p className={`font-bold ${getScoreColor(seller.avg_conexao)}`}>
                        {seller.avg_conexao}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fechamento</p>
                      <p className={`font-bold ${getScoreColor(seller.avg_fechamento)}`}>
                        {seller.avg_fechamento}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Objeções</p>
                      <p className={`font-bold ${getScoreColor(seller.avg_objecoes)}`}>
                        {seller.avg_objecoes}%
                      </p>
                    </div>
                  </div>

                  {seller.improvement_needed < 60 && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="font-semibold text-red-600">
                          Principal melhoria necessária: {seller.main_weakness}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          ({seller.improvement_needed}% - precisa de treinamento)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

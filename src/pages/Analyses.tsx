import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Brain, ArrowLeft, Download, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Video {
  id: string;
  title: string;
  mode: string;
  status: string;
  created_at: string;
  analyses?: Array<{
    id: string;
    score_global: number;
    score_conexao: number;
    score_spin_s: number;
    score_spin_p: number;
    score_spin_i: number;
    score_spin_n: number;
    score_apresentacao: number;
    score_fechamento: number;
    score_objecoes: number;
    score_compromisso_pagamento: number;
    created_at: string;
  }>;
}

export default function Analyses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchVideosWithAnalyses();
  };

  const fetchVideosWithAnalyses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select(`
          id,
          title,
          mode,
          status,
          created_at,
          analyses (
            id,
            score_global,
            score_conexao,
            score_spin_s,
            score_spin_p,
            score_spin_i,
            score_spin_n,
            score_apresentacao,
            score_fechamento,
            score_objecoes,
            score_compromisso_pagamento,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (videosError) throw videosError;

      setVideos(videosData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar análises",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: "Completo", variant: "default" },
      processing: { label: "Processando", variant: "secondary" },
      pending: { label: "Pendente", variant: "outline" },
      queued: { label: "Na Fila", variant: "outline" },
      failed: { label: "Falhou", variant: "destructive" },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Brain className="w-8 h-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Minhas Análises</h1>
            <p className="text-muted-foreground mt-2">
              Visualize todas as análises dos seus vídeos
            </p>
          </div>
        </div>

        {videos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma análise disponível</h3>
              <p className="text-muted-foreground mb-6">
                Faça upload de um vídeo para começar a analisar
              </p>
              <Link to="/dashboard/upload">
                <Button>Fazer Upload</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{video.title || "Vídeo sem título"}</CardTitle>
                      <CardDescription className="mt-2">
                        Enviado em {new Date(video.created_at).toLocaleDateString("pt-BR")} via {video.mode}
                      </CardDescription>
                    </div>
                    {getStatusBadge(video.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {video.analyses && video.analyses.length > 0 ? (
                    <div className="space-y-6">
                      {video.analyses.map((analysis) => (
                        <div key={analysis.id} className="border rounded-lg p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                              Score Global:{" "}
                              <span className={getScoreColor(analysis.score_global || 0)}>
                                {analysis.score_global || 0}%
                              </span>
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              {new Date(analysis.created_at).toLocaleString("pt-BR")}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Conexão</p>
                              <p className={`text-2xl font-bold ${getScoreColor(analysis.score_conexao || 0)}`}>
                                {analysis.score_conexao || 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Apresentação</p>
                              <p className={`text-2xl font-bold ${getScoreColor(analysis.score_apresentacao || 0)}`}>
                                {analysis.score_apresentacao || 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Fechamento</p>
                              <p className={`text-2xl font-bold ${getScoreColor(analysis.score_fechamento || 0)}`}>
                                {analysis.score_fechamento || 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Objeções</p>
                              <p className={`text-2xl font-bold ${getScoreColor(analysis.score_objecoes || 0)}`}>
                                {analysis.score_objecoes || 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Compromisso</p>
                              <p className={`text-2xl font-bold ${getScoreColor(analysis.score_compromisso_pagamento || 0)}`}>
                                {analysis.score_compromisso_pagamento || 0}%
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                            <div>
                              <p className="text-sm text-muted-foreground">SPIN - Situação</p>
                              <p className={`text-xl font-semibold ${getScoreColor(analysis.score_spin_s || 0)}`}>
                                {analysis.score_spin_s || 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">SPIN - Problema</p>
                              <p className={`text-xl font-semibold ${getScoreColor(analysis.score_spin_p || 0)}`}>
                                {analysis.score_spin_p || 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">SPIN - Implicação</p>
                              <p className={`text-xl font-semibold ${getScoreColor(analysis.score_spin_i || 0)}`}>
                                {analysis.score_spin_i || 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">SPIN - Necessidade</p>
                              <p className={`text-xl font-semibold ${getScoreColor(analysis.score_spin_n || 0)}`}>
                                {analysis.score_spin_n || 0}%
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Link to={`/dashboard/analyses/${analysis.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Baixar Relatório
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhuma análise disponível para este vídeo
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

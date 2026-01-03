import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Upload, FileText, Settings, LogOut, Brain, TrendingUp, Clock, Target, Plus, Play, Trash2, Calculator, GraduationCap, BarChart, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    signOut,
    loading
  } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchVideos();

      // Subscribe to real-time updates
      const channel = supabase.channel('videos-changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'videos',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        console.log('Video status changed:', payload);
        fetchVideos(); // Refresh the list when a video changes
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, loading, navigate]);
  const fetchVideos = async () => {
    if (!user) return;
    try {
      // Buscar estatísticas completas (sem limite)
      const {
        data: allVideos,
        error: statsError
      } = await supabase.from("videos").select("status").eq("user_id", user.id);
      if (statsError) throw statsError;

      // Calcular estatísticas
      const allVideosData = allVideos || [];
      setStats({
        total: allVideosData.length,
        processing: allVideosData.filter(v => v.status === 'pending' || v.status === 'processing' || v.status === 'queued').length,
        completed: allVideosData.filter(v => v.status === 'completed').length,
        failed: allVideosData.filter(v => v.status === 'failed').length
      });

      // Buscar apenas os 5 vídeos mais recentes para exibição
      const {
        data,
        error
      } = await supabase.from("videos").select("*").eq("user_id", user.id).order("created_at", {
        ascending: false
      }).limit(5);
      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar vídeos");
    } finally {
      setLoadingVideos(false);
    }
  };
  const handleProcessVideo = async (videoId: string) => {
    try {
      toast.info("Iniciando processamento do vídeo... Isso pode levar 2-4 minutos.");
      console.log('Calling process-video function with videoId:', videoId);
      const {
        data,
        error
      } = await supabase.functions.invoke('process-video', {
        body: {
          videoId
        }
      });
      console.log('Response:', {
        data,
        error
      });
      if (error) {
        console.error('Error details:', error);

        // Extract meaningful error message
        let errorMessage = 'Erro ao processar vídeo';

        // Try to get error from context body
        if (error.context?.body) {
          try {
            const errorBody = JSON.parse(error.context.body);
            errorMessage = errorBody.error || errorMessage;
          } catch (e) {
            console.error('Failed to parse error body');
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        toast.error(errorMessage, {
          duration: 10000
        });
        fetchVideos(); // Refresh to show failed status
        return;
      }
      if (!data || !data.success) {
        toast.error('Processamento retornou resultado inválido', {
          duration: 8000
        });
        fetchVideos();
        return;
      }
      toast.success("Vídeo processado com sucesso! Veja os resultados em 'Minhas Análises'.");
      fetchVideos(); // Refresh the list
    } catch (error: any) {
      console.error('Full error:', error);
      toast.error(`Erro ao processar vídeo: ${error.message || 'Erro desconhecido'}`, {
        duration: 10000
      });
      fetchVideos();
    }
  };
  const handleDeleteVideo = async (videoId: string, storagePath?: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      // First, delete the file from storage if it exists
      if (storagePath) {
        const {
          error: storageError
        } = await supabase.storage.from('uploads').remove([storagePath]);
        if (storageError) {
          console.error('Error deleting from storage:', storageError);
          // Continue anyway, storage file might not exist
        }
      }

      // Then delete the database record
      const {
        error
      } = await supabase.from('videos').delete().eq('id', videoId);
      if (error) throw error;
      toast.success('Vídeo excluído com sucesso!');
      fetchVideos();
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast.error('Erro ao excluir vídeo');
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>;
  }
  if (!user) {
    return null;
  }
  const navItems = [{
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboard",
    path: "/dashboard"
  }, {
    icon: <Upload className="w-5 h-5" />,
    label: "Nova Análise",
    path: "/dashboard/upload"
  }, {
    icon: <FileText className="w-5 h-5" />,
    label: "Minhas Análises",
    path: "/dashboard/analyses"
  }, {
    icon: <TrendingUp className="w-5 h-5" />,
    label: "Métricas por Vendedor",
    path: "/dashboard/seller-metrics"
  }, {
    icon: <TrendingUp className="w-5 h-5" />,
    label: "Métricas do Time",
    path: "/dashboard/team-metrics"
  }, {
    icon: <Target className="w-5 h-5" />,
    label: "Radar da Conversão",
    path: "/dashboard/disc-radar"
  }, {
    icon: <BarChart className="w-5 h-5" />,
    label: "DISC da Conversão",
    path: "/dashboard/disc"
  }, {
    icon: <Calculator className="w-5 h-5" />,
    label: "Calculadora Time Comercial",
    path: "/dashboard/calculadora"
  }, {
    icon: <GraduationCap className="w-5 h-5" />,
    label: "Academia Comercial",
    path: "/dashboard/academia"
  }, {
    icon: <Users className="w-5 h-5" />,
    label: "Resultado da Equipe",
    path: "/dashboard/resultado-equipe"
  }, {
    icon: <Settings className="w-5 h-5" />,
    label: "Configurações",
    path: "/dashboard/settings"
  }];
  const statsCards = [{
    label: "Total de Vídeos",
    value: stats.total.toString(),
    icon: <FileText className="w-6 h-6" />
  }, {
    label: "Em Processamento",
    value: stats.processing.toString(),
    icon: <Clock className="w-6 h-6" />
  }, {
    label: "Completos",
    value: stats.completed.toString(),
    icon: <Target className="w-6 h-6" />
  }, {
    label: "Com Erro",
    value: stats.failed.toString(),
    icon: <TrendingUp className="w-6 h-6" />
  }];
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      description?: string;
    }> = {
      completed: {
        label: "Completo",
        variant: "default",
        description: "Análise concluída"
      },
      processing: {
        label: "Em Análise",
        variant: "secondary",
        description: "Processando vídeo..."
      },
      pending: {
        label: "Pendente",
        variant: "outline",
        description: "Aguardando processamento"
      },
      queued: {
        label: "Na Fila",
        variant: "outline",
        description: "Na fila de processamento"
      },
      failed: {
        label: "Falhou",
        variant: "destructive",
        description: "Erro no processamento"
      }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <div className="flex flex-col items-end">
        <Badge variant={config.variant}>{config.label}</Badge>
        {config.description && <span className="text-xs text-muted-foreground mt-1">{config.description}</span>}
      </div>;
  };
  return <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border sticky top-0 h-screen flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary">Comercial 10X</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, index) => <Link key={index} to={item.path}>
              <div className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>)}
        </nav>

        <div className="p-4 border-t border-border">
          <button onClick={signOut} className="sidebar-item w-full text-destructive hover:bg-destructive/10">
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Bem-vindo de volta! Aqui está um resumo da sua performance.
              </p>
            </div>
            <Link to="/dashboard/upload">
              <Button className="btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Nova Análise
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => <Card key={index} className="stat-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="stat-label">{stat.label}</p>
                    <p className="stat-value">{stat.value}</p>
                  </div>
                  <div className="text-primary">
                    {stat.icon}
                  </div>
                </div>
              </Card>)}
          </div>

          {/* Recent Videos */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Vídeos Recentes</h2>
              <Link to="/dashboard/analyses">
                <Button variant="outline" className="btn-outline">
                  Ver Todos
                </Button>
              </Link>
            </div>

            {loadingVideos ? <div className="text-center py-8">
                <Brain className="w-8 h-8 animate-pulse text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Carregando...</p>
              </div> : videos.length === 0 ? <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum vídeo enviado ainda</p>
                <Link to="/dashboard/upload">
                  <Button>Enviar Primeiro Vídeo</Button>
                </Link>
              </div> : <div className="space-y-4">
                {videos.map(video => <div key={video.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:border-primary transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {video.title || `Vídeo ${video.mode}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(video.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(video.status)}
                      {(video.status === 'pending' || video.status === 'queued') && <>
                          <Button size="sm" onClick={() => handleProcessVideo(video.id)} className="btn-primary">
                            <Play className="w-4 h-4 mr-2" />
                            Processar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteVideo(video.id, video.storage_path)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>}
                      {video.status === 'processing' && <>
                          <Button size="sm" disabled variant="secondary">
                            <Brain className="w-4 h-4 mr-2 animate-pulse" />
                            Analisando...
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteVideo(video.id, video.storage_path)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>}
                      {video.status === 'completed' && <>
                          <Link to="/dashboard/analyses">
                            <Button size="sm" variant="outline" className="btn-outline">
                              Ver Análise
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteVideo(video.id, video.storage_path)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>}
                      {video.status === 'failed' && <>
                          {video.error_message && <span className="text-xs text-destructive max-w-xs truncate" title={video.error_message}>
                              {video.error_message}
                            </span>}
                          <Button size="sm" variant="outline" onClick={() => handleProcessVideo(video.id)}>
                            <Play className="w-4 h-4 mr-2" />
                            Tentar Novamente
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteVideo(video.id, video.storage_path)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>}
                    </div>
                  </div>)}
              </div>}
          </Card>
        </div>
      </main>
    </div>;
};
export default Dashboard;
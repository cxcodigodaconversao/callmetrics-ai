import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Settings, 
  LogOut,
  Brain,
  TrendingUp,
  Clock,
  Target,
  Plus,
  Play
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchVideos();
    }
  }, [user, loading, navigate]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

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
      toast.info("Iniciando processamento do vídeo...");
      
      console.log('Calling process-video function with videoId:', videoId);
      
      const { data, error } = await supabase.functions.invoke('process-video', {
        body: { videoId }
      });

      console.log('Response:', { data, error });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      toast.success("Vídeo processado com sucesso!");
      fetchVideos(); // Refresh the list
    } catch (error: any) {
      console.error('Full error:', error);
      toast.error(`Erro ao processar vídeo: ${error.message || 'Erro desconhecido'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
    { icon: <Upload className="w-5 h-5" />, label: "Nova Análise", path: "/dashboard/upload" },
    { icon: <FileText className="w-5 h-5" />, label: "Minhas Análises", path: "/dashboard/analyses" },
    { icon: <Settings className="w-5 h-5" />, label: "Configurações", path: "/dashboard/settings" },
  ];

  const stats = [
    { label: "Total de Vídeos", value: videos.length.toString(), icon: <FileText className="w-6 h-6" /> },
    { label: "Em Processamento", value: videos.filter(v => v.status === 'pending' || v.status === 'processing').length.toString(), icon: <Clock className="w-6 h-6" /> },
    { label: "Completos", value: videos.filter(v => v.status === 'completed').length.toString(), icon: <Target className="w-6 h-6" /> },
    { label: "Com Erro", value: videos.filter(v => v.status === 'failed').length.toString(), icon: <TrendingUp className="w-6 h-6" /> },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: "Completo", variant: "default" },
      processing: { label: "Processando", variant: "secondary" },
      pending: { label: "Pendente", variant: "outline" },
      queued: { label: "Na fila", variant: "outline" },
      failed: { label: "Falhou", variant: "destructive" },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border sticky top-0 h-screen flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary">Sales Calls IA</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, index) => (
            <Link key={index} to={item.path}>
              <div className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={signOut}
            className="sidebar-item w-full text-destructive hover:bg-destructive/10"
          >
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
            {stats.map((stat, index) => (
              <Card key={index} className="stat-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="stat-label">{stat.label}</p>
                    <p className="stat-value">{stat.value}</p>
                  </div>
                  <div className="text-primary">
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
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

            {loadingVideos ? (
              <div className="text-center py-8">
                <Brain className="w-8 h-8 animate-pulse text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum vídeo enviado ainda</p>
                <Link to="/dashboard/upload">
                  <Button>Enviar Primeiro Vídeo</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:border-primary transition-colors"
                  >
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
                      {video.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleProcessVideo(video.id)}
                          className="btn-primary"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Processar
                        </Button>
                      )}
                      {video.status === 'completed' && (
                        <Link to="/dashboard/analyses">
                          <Button size="sm" variant="outline" className="btn-outline">
                            Ver Análise
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

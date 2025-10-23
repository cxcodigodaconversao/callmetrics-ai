import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Plus
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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
    { label: "Total de Análises", value: "24", icon: <FileText className="w-6 h-6" />, change: "+12%" },
    { label: "Pontuação Média", value: "8.2", icon: <Target className="w-6 h-6" />, change: "+0.8" },
    { label: "Taxa de Conversão", value: "68%", icon: <TrendingUp className="w-6 h-6" />, change: "+5%" },
    { label: "Tempo Médio", value: "18min", icon: <Clock className="w-6 h-6" />, change: "-2min" },
  ];

  const recentAnalyses = [
    { id: 1, title: "Ligação - Cliente ABC Corp", score: 8.5, date: "2025-01-20", status: "Concluída" },
    { id: 2, title: "Demo - Prospect XYZ Ltd", score: 7.2, date: "2025-01-19", status: "Concluída" },
    { id: 3, title: "Follow-up - Empresa 123", score: 9.1, date: "2025-01-18", status: "Concluída" },
  ];

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
                    <p className="text-sm text-success mt-2 font-semibold">
                      {stat.change}
                    </p>
                  </div>
                  <div className="text-primary">
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Analyses */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Análises Recentes</h2>
              <Link to="/dashboard/analyses">
                <Button variant="outline" className="btn-outline">
                  Ver Todas
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{analysis.title}</h3>
                    <p className="text-sm text-muted-foreground">{analysis.date}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Pontuação</p>
                      <p className="text-2xl font-bold text-primary">{analysis.score}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-success/20 text-success rounded-full text-sm font-semibold">
                        {analysis.status}
                      </span>
                      <Button size="sm" variant="outline" className="btn-outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

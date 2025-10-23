import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Brain, Calendar, Mail, User } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { toast } from "sonner";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

interface MonthlyUsage {
  month: string;
  usage: number;
}

const AdminUserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { loading } = useAdminAuth();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [totalUsage, setTotalUsage] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyUsage[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && id) {
      fetchUserDetails();
    }
  }, [loading, id]);

  const fetchUserDetails = async () => {
    if (!id) return;

    try {
      setLoadingData(true);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, email, created_at, is_active")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;
      setUser(profile);

      // Fetch total usage
      const { count: totalCount } = await supabase
        .from("ai_usage_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id);

      setTotalUsage(totalCount || 0);

      // Fetch monthly usage (last 12 months)
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - 11);
      monthsAgo.setDate(1);

      const { data: usageLogs } = await supabase
        .from("ai_usage_logs")
        .select("used_at")
        .eq("user_id", id)
        .gte("used_at", monthsAgo.toISOString())
        .order("used_at", { ascending: true });

      if (usageLogs) {
        const monthlyMap: { [key: string]: number } = {};
        
        // Initialize all 12 months with 0
        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          const monthKey = date.toLocaleDateString("pt-BR", { 
            month: "short", 
            year: "2-digit" 
          });
          monthlyMap[monthKey] = 0;
        }

        // Count usage per month
        usageLogs.forEach((log: any) => {
          const date = new Date(log.used_at);
          const monthKey = date.toLocaleDateString("pt-BR", { 
            month: "short", 
            year: "2-digit" 
          });
          if (monthlyMap[monthKey] !== undefined) {
            monthlyMap[monthKey]++;
          }
        });

        const chartData = Object.entries(monthlyMap).map(([month, usage]) => ({
          month,
          usage,
        }));

        setMonthlyData(chartData);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Erro ao carregar detalhes do usuário");
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Carregando detalhes...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground">Usuário não encontrado</p>
            <Link to="/admin/users">
              <Button className="mt-4">Voltar para Usuários</Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link to="/admin/users">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Usuários
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
            <p className="text-muted-foreground text-lg flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>
          <Badge variant={user.is_active ? "default" : "secondary"} className="text-lg px-4 py-2">
            {user.is_active ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label">Uso Total de IA</p>
                <p className="stat-value">{totalUsage}</p>
              </div>
              <Brain className="w-6 h-6 text-primary" />
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label">Membro desde</p>
                <p className="stat-value text-xl">
                  {new Date(user.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
          </Card>

          <Card className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label">Status da Conta</p>
                <p className="stat-value text-xl">
                  {user.is_active ? "Ativa" : "Inativa"}
                </p>
              </div>
              <User className="w-6 h-6 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Monthly Usage Chart */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            Histórico de Uso Mensal (Últimos 12 Meses)
          </h2>
          {totalUsage === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Este usuário ainda não utilizou a análise de IA
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="usage" 
                  fill="hsl(var(--primary))" 
                  name="Usos de IA"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetail;

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Users, TrendingUp, UserPlus } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { toast } from "sonner";

interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalAIUsage: number;
  aiUsageThisMonth: number;
}

interface TopUser {
  user_id: string;
  name: string;
  usage_count: number;
}

interface RecentAnalysis {
  id: string;
  user_name: string;
  used_at: string;
}

interface MonthlyData {
  month: string;
  usage: number;
}

const AdminDashboard = () => {
  const { loading } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalAIUsage: 0,
    aiUsageThisMonth: 0,
  });
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      fetchDashboardData();
    }
  }, [loading]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);

      // Get current date info
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch new users this month
      const { count: newUsersThisMonth } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstDayOfMonth.toISOString())
        .eq("is_active", true);

      // Fetch total AI usage
      const { count: totalAIUsage } = await supabase
        .from("ai_usage_logs")
        .select("*", { count: "exact", head: true });

      // Fetch AI usage this month
      const { count: aiUsageThisMonth } = await supabase
        .from("ai_usage_logs")
        .select("*", { count: "exact", head: true })
        .gte("used_at", firstDayOfMonth.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        totalAIUsage: totalAIUsage || 0,
        aiUsageThisMonth: aiUsageThisMonth || 0,
      });

      // Fetch top 5 users by AI usage
      const { data: usageData } = await supabase
        .from("ai_usage_logs")
        .select("user_id, profiles(name)")
        .order("used_at", { ascending: false });

      if (usageData) {
        const userCounts = usageData.reduce((acc: any, log: any) => {
          const userId = log.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              name: log.profiles?.name || "Usuário sem nome",
              usage_count: 0,
            };
          }
          acc[userId].usage_count++;
          return acc;
        }, {});

        const sortedUsers = Object.values(userCounts)
          .sort((a: any, b: any) => b.usage_count - a.usage_count)
          .slice(0, 5) as TopUser[];

        setTopUsers(sortedUsers);
      }

      // Fetch recent analyses
      const { data: recentData } = await supabase
        .from("ai_usage_logs")
        .select("id, used_at, profiles(name)")
        .order("used_at", { ascending: false })
        .limit(10);

      if (recentData) {
        setRecentAnalyses(
          recentData.map((item: any) => ({
            id: item.id,
            user_name: item.profiles?.name || "Usuário sem nome",
            used_at: item.used_at,
          }))
        );
      }

      // Fetch monthly usage data (last 12 months)
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - 11);
      monthsAgo.setDate(1);

      const { data: monthlyUsage } = await supabase
        .from("ai_usage_logs")
        .select("used_at")
        .gte("used_at", monthsAgo.toISOString())
        .order("used_at", { ascending: true });

      if (monthlyUsage) {
        const monthlyMap: { [key: string]: number } = {};
        
        // Initialize all 12 months with 0
        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          const monthKey = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
          monthlyMap[monthKey] = 0;
        }

        // Count usage per month
        monthlyUsage.forEach((log: any) => {
          const date = new Date(log.used_at);
          const monthKey = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
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
      console.error("Error fetching dashboard data:", error);
      toast.error("Erro ao carregar dados do dashboard");
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
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { 
      label: "Total de Usuários", 
      value: stats.totalUsers, 
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-500" 
    },
    { 
      label: "Novos este Mês", 
      value: stats.newUsersThisMonth, 
      icon: <UserPlus className="w-6 h-6" />,
      color: "text-green-500" 
    },
    { 
      label: "Uso Total IA", 
      value: stats.totalAIUsage, 
      icon: <Brain className="w-6 h-6" />,
      color: "text-purple-500" 
    },
    { 
      label: "Uso IA este Mês", 
      value: stats.aiUsageThisMonth, 
      icon: <TrendingUp className="w-6 h-6" />,
      color: "text-orange-500" 
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Administrativo</h1>
          <p className="text-muted-foreground text-lg">
            Visão geral do sistema e uso de IA
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value">{stat.value}</p>
                </div>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Monthly Usage Chart */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Uso Mensal de IA (Últimos 12 Meses)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="usage" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Usos de IA"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Users */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Top 5 Usuários</h2>
            <div className="space-y-4">
              {topUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum dado disponível
                </p>
              ) : (
                topUsers.map((user, index) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {user.usage_count} usos
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Analyses */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Últimas Análises</h2>
            <div className="space-y-3">
              {recentAnalyses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma análise ainda
                </p>
              ) : (
                recentAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <span className="font-medium">{analysis.user_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(analysis.used_at).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(analysis.used_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  TrendingUp, 
  UserCheck, 
  Activity, 
  Award, 
  BarChart3, 
  Loader2, 
  Database 
} from "lucide-react";

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
  count: number;
}

const AdminDashboard = () => {
  const { loading } = useAdminAuth();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'users'>('dashboard');
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

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch statistics
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const { count: newUsersThisMonth } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstDayOfMonth.toISOString())
        .eq("is_active", true);

      const { count: totalAIUsage } = await supabase
        .from("analyses")
        .select("*", { count: "exact", head: true });

      const { count: aiUsageThisMonth } = await supabase
        .from("analyses")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstDayOfMonth.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        totalAIUsage: totalAIUsage || 0,
        aiUsageThisMonth: aiUsageThisMonth || 0,
      });

      // Fetch top users by counting analyses per user
      // First get all analyses with video_id
      const { data: analysesData } = await supabase
        .from("analyses")
        .select("video_id")
        .order("created_at", { ascending: false });

      if (analysesData) {
        // Get unique video IDs
        const videoIds = [...new Set(analysesData.map((a: any) => a.video_id))];
        
        // Fetch video and user info
        const { data: videosData } = await supabase
          .from("videos")
          .select("id, user_id")
          .in("id", videoIds);

        if (videosData) {
          // Count analyses per user
          const userCounts: { [key: string]: number } = {};
          analysesData.forEach((analysis: any) => {
            const video = videosData.find((v: any) => v.id === analysis.video_id);
            if (video?.user_id) {
              userCounts[video.user_id] = (userCounts[video.user_id] || 0) + 1;
            }
          });

          // Get user names
          const userIds = Object.keys(userCounts);
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", userIds);

          // Build top users array
          const topUsersArray: TopUser[] = userIds.map(userId => ({
            user_id: userId,
            name: profilesData?.find((p: any) => p.id === userId)?.name || "Usuário sem nome",
            usage_count: userCounts[userId]
          }));

          const sortedUsers = topUsersArray
            .sort((a, b) => b.usage_count - a.usage_count)
            .slice(0, 5);

          setTopUsers(sortedUsers);
        }
      }

      // Fetch recent analyses
      const { data: recentAnalysesData } = await supabase
        .from("analyses")
        .select("id, created_at, video_id")
        .order("created_at", { ascending: false })
        .limit(8);

      if (recentAnalysesData) {
        // Get video IDs
        const recentVideoIds = recentAnalysesData.map((a: any) => a.video_id);
        
        // Fetch videos and users
        const { data: recentVideosData } = await supabase
          .from("videos")
          .select("id, user_id")
          .in("id", recentVideoIds);

        if (recentVideosData) {
          const recentUserIds = [...new Set(recentVideosData.map((v: any) => v.user_id))];
          const { data: recentProfilesData } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", recentUserIds);

          setRecentAnalyses(
            recentAnalysesData.map((item: any) => {
              const video = recentVideosData.find((v: any) => v.id === item.video_id);
              const profile = recentProfilesData?.find((p: any) => p.id === video?.user_id);
              return {
                id: item.id,
                user_name: profile?.name || "Usuário sem nome",
                used_at: item.created_at,
              };
            })
          );
        }
      }

      // Fetch monthly data (last 12 months)
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - 11);
      monthsAgo.setDate(1);

      const { data: monthlyUsage } = await supabase
        .from("analyses")
        .select("created_at")
        .gte("created_at", monthsAgo.toISOString())
        .order("created_at", { ascending: true });

      if (monthlyUsage) {
        const monthlyMap: { [key: string]: number } = {};
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          const monthKey = monthNames[date.getMonth()];
          monthlyMap[monthKey] = 0;
        }

        monthlyUsage.forEach((log: any) => {
          const date = new Date(log.created_at);
          const monthKey = monthNames[date.getMonth()];
          if (monthlyMap[monthKey] !== undefined) {
            monthlyMap[monthKey]++;
          }
        });

        const chartData = Object.entries(monthlyMap).map(([month, count]) => ({
          month,
          count,
        }));

        setMonthlyData(chartData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0c121c', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#d2bc8f' }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px' }}>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...monthlyData.map(d => d.count), 1);
  const avgPerUser = stats.totalUsers > 0 ? (stats.totalAIUsage / stats.totalUsers).toFixed(1) : '0';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0c121c', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', backgroundColor: '#1a2332', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #d2bc8f 0%, #e6d0a3 100%)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#0c121c',
              boxShadow: '0 4px 12px rgba(210, 188, 143, 0.3)'
            }}>
              A
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#d2bc8f', letterSpacing: '-0.5px' }}>Admin</h1>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Dashboard</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '24px 16px' }}>
          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: currentView === 'dashboard' ? '#2a3441' : 'transparent',
              border: currentView === 'dashboard' ? '1px solid #444' : '1px solid transparent',
              borderRadius: '10px',
              color: currentView === 'dashboard' ? '#d2bc8f' : '#ccc',
              fontSize: '15px',
              fontWeight: currentView === 'dashboard' ? '600' : '500',
              cursor: 'pointer',
              marginBottom: '8px',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              borderRadius: '10px',
              color: '#ccc',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '8px',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            <Users size={20} />
            <span>Usuários</span>
          </button>

          <div style={{ height: '1px', backgroundColor: '#333', margin: '16px 0' }} />

          <button
            onClick={signOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              borderRadius: '10px',
              color: '#ccc',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>

        <div style={{ padding: '20px 24px', borderTop: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #d2bc8f 0%, #e6d0a3 100%)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '15px', 
              fontWeight: 'bold', 
              color: '#0c121c' 
            }}>
              AD
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Administrador</p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'admin@app.com'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '280px', overflow: 'auto', minHeight: '100vh' }}>
        <div style={{ padding: '48px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#d2bc8f', letterSpacing: '-1px' }}>Painel do Administrador</h2>
            <p style={{ fontSize: '16px', color: '#888', margin: 0 }}>Visão geral do sistema e estatísticas</p>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            <div style={{ backgroundColor: '#1a2332', padding: '28px', borderRadius: '16px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#2a3441', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d2bc8f', border: '1px solid #444' }}>
                  <Users size={28} />
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#888', margin: '0 0 12px 0', fontWeight: '500' }}>Total de Usuários</p>
              <p style={{ fontSize: '42px', fontWeight: 'bold', margin: 0, color: '#d2bc8f', letterSpacing: '-2px' }}>{stats.totalUsers}</p>
            </div>

            <div style={{ backgroundColor: '#1a2332', padding: '28px', borderRadius: '16px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#2a3441', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d2bc8f', border: '1px solid #444' }}>
                  <UserCheck size={28} />
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#888', margin: '0 0 12px 0', fontWeight: '500' }}>Novos no Mês</p>
              <p style={{ fontSize: '42px', fontWeight: 'bold', margin: 0, color: '#d2bc8f', letterSpacing: '-2px' }}>{stats.newUsersThisMonth}</p>
              <p style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>+{stats.newUsersThisMonth} este mês</p>
            </div>

            <div style={{ backgroundColor: '#1a2332', padding: '28px', borderRadius: '16px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#2a3441', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d2bc8f', border: '1px solid #444' }}>
                  <Activity size={28} />
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#888', margin: '0 0 12px 0', fontWeight: '500' }}>Análises de IA</p>
              <p style={{ fontSize: '42px', fontWeight: 'bold', margin: 0, color: '#d2bc8f', letterSpacing: '-2px' }}>{stats.aiUsageThisMonth}</p>
              <p style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>Neste mês</p>
            </div>

            <div style={{ backgroundColor: '#1a2332', padding: '28px', borderRadius: '16px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#2a3441', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d2bc8f', border: '1px solid #444' }}>
                  <TrendingUp size={28} />
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#888', margin: '0 0 12px 0', fontWeight: '500' }}>Média por Usuário</p>
              <p style={{ fontSize: '42px', fontWeight: 'bold', margin: 0, color: '#d2bc8f', letterSpacing: '-2px' }}>{avgPerUser}</p>
              <p style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>Análises/mês</p>
            </div>
          </div>

          {/* Top Users & Chart Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '48px' }}>
            {/* Top 5 Users */}
            <div style={{ backgroundColor: '#1a2332', padding: '32px', borderRadius: '16px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                <Award size={24} style={{ color: '#d2bc8f' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>Top 5 Usuários</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {topUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    <Database size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p>Nenhum dado disponível</p>
                  </div>
                ) : (
                  topUsers.map((user, index) => (
                    <div key={user.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px', backgroundColor: '#2a3441', borderRadius: '12px', border: '1px solid #444' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ 
                          width: '36px', 
                          height: '36px', 
                          background: index === 0 ? 'linear-gradient(135deg, #d2bc8f 0%, #e6d0a3 100%)' : '#333', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '14px', 
                          fontWeight: 'bold', 
                          color: index === 0 ? '#0c121c' : '#d2bc8f',
                          border: index === 0 ? 'none' : '1px solid #444'
                        }}>
                          {index + 1}
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>{user.name}</span>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#d2bc8f' }}>{user.usage_count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Monthly Chart */}
            <div style={{ backgroundColor: '#1a2332', padding: '32px', borderRadius: '16px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <BarChart3 size={24} style={{ color: '#d2bc8f' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>Uso de IA - Últimos 12 Meses</h3>
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>Total: {monthlyData.reduce((a, b) => a + b.count, 0)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', gap: '10px', padding: '0 8px' }}>
                {monthlyData.map((data, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#d2bc8f', fontWeight: '600' }}>{data.count}</div>
                    <div style={{ width: '100%', height: `${(data.count / maxValue) * 100}%`, background: 'linear-gradient(180deg, #e6d0a3 0%, #d2bc8f 100%)', borderRadius: '6px 6px 0 0', minHeight: '24px', boxShadow: '0 -2px 8px rgba(210, 188, 143, 0.2)' }} />
                    <div style={{ fontSize: '11px', color: '#888', fontWeight: '500' }}>{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Analyses */}
          <div style={{ backgroundColor: '#1a2332', padding: '32px', borderRadius: '16px', border: '1px solid #333' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '28px', color: 'white' }}>Últimas Análises de IA</h3>
            {recentAnalyses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <Database size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p>Nenhuma análise ainda</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #333' }}>
                      <th style={{ textAlign: 'left', padding: '18px 16px', fontSize: '13px', fontWeight: '600', color: '#d2bc8f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                      <th style={{ textAlign: 'left', padding: '18px 16px', fontSize: '13px', fontWeight: '600', color: '#d2bc8f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usuário</th>
                      <th style={{ textAlign: 'left', padding: '18px 16px', fontSize: '13px', fontWeight: '600', color: '#d2bc8f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data</th>
                      <th style={{ textAlign: 'left', padding: '18px 16px', fontSize: '13px', fontWeight: '600', color: '#d2bc8f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAnalyses.map((analysis) => (
                      <tr key={analysis.id} style={{ borderBottom: '1px solid #2a3441' }}>
                        <td style={{ padding: '18px 16px', fontSize: '14px', color: '#ccc', fontFamily: 'monospace' }}>{analysis.id.substring(0, 8)}</td>
                        <td style={{ padding: '18px 16px', fontSize: '14px', color: 'white', fontWeight: '500' }}>{analysis.user_name}</td>
                        <td style={{ padding: '18px 16px', fontSize: '14px', color: '#ccc' }}>{new Date(analysis.used_at).toLocaleDateString('pt-BR')}</td>
                        <td style={{ padding: '18px 16px', fontSize: '14px', color: '#ccc' }}>{new Date(analysis.used_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

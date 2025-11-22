import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MessageSquare, 
  Phone, 
  TrendingUp, 
  UserX,
  Calendar,
  Target,
  Award
} from "lucide-react";

interface DashboardMetrics {
  totalLeads: number;
  conversasIniciadas: number;
  contactados: number;
  preQualificacao: number;
  callsMarcadas: number;
  ganhos: number;
  perdidos: number;
  noShows: number;
  conversaoTotal: number;
  conversaoCallsMarcadas: number;
}

const CRMDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    conversasIniciadas: 0,
    contactados: 0,
    preQualificacao: 0,
    callsMarcadas: 0,
    ganhos: 0,
    perdidos: 0,
    noShows: 0,
    conversaoTotal: 0,
    conversaoCallsMarcadas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('crm_leads')
        .select('stage')
        .eq('user_id', user?.id);

      if (error) throw error;

      const metrics: DashboardMetrics = {
        totalLeads: leads.length,
        conversasIniciadas: leads.filter(l => l.stage === 'conversa_iniciada').length,
        contactados: leads.filter(l => l.stage === 'contactado').length,
        preQualificacao: leads.filter(l => l.stage === 'pre_qualificacao').length,
        callsMarcadas: leads.filter(l => l.stage === 'call_marcada').length,
        ganhos: leads.filter(l => l.stage === 'ganho').length,
        perdidos: leads.filter(l => l.stage === 'perdido').length,
        noShows: leads.filter(l => l.stage === 'no_show').length,
        conversaoTotal: 0,
        conversaoCallsMarcadas: 0,
      };

      // Calculate conversion rates
      if (metrics.totalLeads > 0) {
        metrics.conversaoTotal = (metrics.ganhos / metrics.totalLeads) * 100;
      }
      if (metrics.callsMarcadas > 0) {
        metrics.conversaoCallsMarcadas = (metrics.ganhos / metrics.callsMarcadas) * 100;
      }

      setMetrics(metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subtitle, 
    variant = 'default' 
  }: { 
    icon: any; 
    label: string; 
    value: number | string; 
    subtitle?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  }) => {
    const variantColors = {
      default: 'text-primary',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      danger: 'text-red-500',
    };

    return (
      <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className={`text-3xl font-bold ${variantColors[variant]}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-primary/10 ${variantColors[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Visão Geral</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Users}
            label="Total de Leads"
            value={metrics.totalLeads}
            variant="default"
          />
          <MetricCard
            icon={MessageSquare}
            label="Conversas Ativas"
            value={metrics.conversasIniciadas + metrics.contactados + metrics.preQualificacao}
            variant="default"
          />
          <MetricCard
            icon={Calendar}
            label="Calls Marcadas"
            value={metrics.callsMarcadas}
            variant="warning"
          />
          <MetricCard
            icon={Award}
            label="Taxa de Conversão"
            value={`${metrics.conversaoTotal.toFixed(1)}%`}
            subtitle={`${metrics.ganhos} ganhos de ${metrics.totalLeads} leads`}
            variant="success"
          />
        </div>
      </div>

      {/* Funnel Stages */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Funil de Vendas</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={MessageSquare}
            label="Conversa Iniciada"
            value={metrics.conversasIniciadas}
            variant="default"
          />
          <MetricCard
            icon={Phone}
            label="Contactado"
            value={metrics.contactados}
            variant="default"
          />
          <MetricCard
            icon={Target}
            label="Pré-qualificação"
            value={metrics.preQualificacao}
            variant="default"
          />
          <MetricCard
            icon={Calendar}
            label="Call Marcada"
            value={metrics.callsMarcadas}
            variant="warning"
          />
        </div>
      </div>

      {/* Results */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Resultados</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            icon={Award}
            label="Ganhos"
            value={metrics.ganhos}
            subtitle={`${metrics.conversaoCallsMarcadas.toFixed(1)}% das calls`}
            variant="success"
          />
          <MetricCard
            icon={UserX}
            label="Perdidos"
            value={metrics.perdidos}
            variant="danger"
          />
          <MetricCard
            icon={Calendar}
            label="No-shows"
            value={metrics.noShows}
            subtitle="Faltaram na call"
            variant="warning"
          />
        </div>
      </div>

      {/* Empty State */}
      {metrics.totalLeads === 0 && (
        <Card className="p-12 text-center border-dashed">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum lead cadastrado</h3>
          <p className="text-sm text-muted-foreground">
            Conecte seu WhatsApp para começar a importar leads automaticamente
          </p>
        </Card>
      )}
    </div>
  );
};

export default CRMDashboard;

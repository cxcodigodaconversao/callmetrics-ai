import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Phone, 
  Target, 
  Calendar,
  Award,
  X,
  UserX,
  User,
  MoreVertical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Lead {
  id: string;
  contact_name: string;
  contact_number: string | null;
  stage: string;
  disc_profile: string;
  campaign_source: string | null;
  team: string | null;
  notes: string | null;
  last_contact_at: string | null;
  call_scheduled_at: string | null;
  created_at: string;
}

const stages = [
  { id: 'conversa_iniciada', label: 'Conversa Iniciada', icon: MessageSquare, color: 'bg-blue-500' },
  { id: 'contactado', label: 'Contactado', icon: Phone, color: 'bg-indigo-500' },
  { id: 'pre_qualificacao', label: 'Pré-qualificação', icon: Target, color: 'bg-purple-500' },
  { id: 'call_marcada', label: 'Call Marcada', icon: Calendar, color: 'bg-yellow-500' },
  { id: 'ganho', label: 'Ganho', icon: Award, color: 'bg-green-500' },
  { id: 'perdido', label: 'Perdido', icon: X, color: 'bg-red-500' },
  { id: 'no_show', label: 'No-show', icon: UserX, color: 'bg-gray-500' },
];

const CRMKanban = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLeads();
      subscribeToLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Erro ao carregar leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLeads = () => {
    const channel = supabase
      .channel('crm_leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_leads',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const moveToStage = async (leadId: string, newStage: string) => {
    try {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;

      const { error } = await supabase
        .from('crm_leads')
        .update({ stage: newStage as any })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Lead atualizado",
        description: `Movido para ${stages.find(s => s.id === newStage)?.label}`,
      });
    } catch (error) {
      console.error('Error moving lead:', error);
      toast({
        title: "Erro ao mover lead",
        variant: "destructive",
      });
    }
  };

  const getLeadsByStage = (stageId: string) => {
    return leads.filter(lead => lead.stage === stageId);
  };

  const getDISCBadge = (profile: string) => {
    const colors: Record<string, string> = {
      dominance: 'bg-red-500',
      influence: 'bg-yellow-500',
      steadiness: 'bg-green-500',
      compliance: 'bg-blue-500',
      unknown: 'bg-gray-500',
    };

    const labels: Record<string, string> = {
      dominance: 'D',
      influence: 'I',
      steadiness: 'S',
      compliance: 'C',
      unknown: '?',
    };

    return (
      <Badge className={`${colors[profile]} text-white text-xs`}>
        {labels[profile]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stages.map((stage) => (
          <Card key={stage.id} className="p-4 animate-pulse">
            <div className="h-40 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Funil de Vendas</h3>
        <Badge variant="outline">{leads.length} leads no total</Badge>
      </div>

      <ScrollArea className="w-full pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const StageIcon = stage.icon;
            const stageLeads = getLeadsByStage(stage.id);

            return (
              <Card 
                key={stage.id} 
                className="flex-shrink-0 w-[300px] border-primary/20"
              >
                {/* Stage Header */}
                <div className={`${stage.color} text-white p-4 rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StageIcon className="w-5 h-5" />
                      <h4 className="font-semibold">{stage.label}</h4>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {stageLeads.length}
                    </Badge>
                  </div>
                </div>

                {/* Stage Content */}
                <ScrollArea className="h-[600px] p-4">
                  <div className="space-y-3">
                    {stageLeads.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum lead</p>
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <Card 
                          key={lead.id} 
                          className="p-3 hover:shadow-lg transition-shadow cursor-pointer border-primary/10"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">
                                  {lead.contact_name}
                                </p>
                                {lead.contact_number && (
                                  <p className="text-xs text-muted-foreground">
                                    {lead.contact_number}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getDISCBadge(lead.disc_profile)}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <MoreVertical className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {stages
                                      .filter(s => s.id !== stage.id)
                                      .map(s => (
                                        <DropdownMenuItem
                                          key={s.id}
                                          onClick={() => moveToStage(lead.id, s.id)}
                                        >
                                          Mover para {s.label}
                                        </DropdownMenuItem>
                                      ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {lead.campaign_source && (
                              <Badge variant="outline" className="text-xs">
                                {lead.campaign_source}
                              </Badge>
                            )}

                            {lead.team && (
                              <p className="text-xs text-muted-foreground">
                                Time: {lead.team}
                              </p>
                            )}

                            {lead.notes && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {lead.notes}
                              </p>
                            )}

                            {lead.call_scheduled_at && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(lead.call_scheduled_at).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CRMKanban;

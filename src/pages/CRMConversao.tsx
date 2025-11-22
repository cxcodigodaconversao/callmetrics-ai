import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { MessageSquare, BarChart3, Users, Settings } from "lucide-react";
import WhatsAppConnection from "@/components/crm/WhatsAppConnection";
import CRMDashboard from "@/components/crm/CRMDashboard";
import CRMKanban from "@/components/crm/CRMKanban";
import CRMMessages from "@/components/crm/CRMMessages";

const CRMConversao = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            CRM da Conversão
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas conversas e leads com inteligência
          </p>
        </div>

        {/* WhatsApp Connection Card */}
        <Card className="mb-8 p-6 border-primary/20 bg-card/50 backdrop-blur">
          <WhatsAppConnection />
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="kanban" className="gap-2">
              <Users className="w-4 h-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <CRMDashboard />
          </TabsContent>

          <TabsContent value="kanban" className="space-y-6">
            <CRMKanban />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <CRMMessages />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Configurações do CRM</h3>
              <p className="text-muted-foreground">
                Configurações avançadas em desenvolvimento...
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CRMConversao;

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Smartphone, QrCode, Link2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCodeDialog from "./QRCodeDialog";

interface WhatsAppConnectionData {
  id: string;
  connection_type: 'web' | 'api';
  phone_number: string | null;
  display_name: string | null;
  status: 'disconnected' | 'connecting' | 'qr_code' | 'connected' | 'error';
  qr_code: string | null;
  last_connected_at: string | null;
  error_message: string | null;
}

const WhatsAppConnection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<WhatsAppConnectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConnections();
      subscribeToConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Erro ao carregar conexões",
        description: "Não foi possível carregar suas conexões WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConnections = () => {
    const channel = supabase
      .channel('whatsapp_connections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_connections',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('Connection update:', payload);
          fetchConnections();
          
          // Show QR code if status changed to qr_code
          if (payload.eventType === 'UPDATE' && 
              payload.new.status === 'qr_code' && 
              payload.new.qr_code) {
            setCurrentQRCode(payload.new.qr_code);
            setSelectedConnectionId(payload.new.id);
            setShowQRDialog(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleConnectWeb = async () => {
    try {
      setLoading(true);
      
      // Create a new connection entry
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .insert({
          user_id: user?.id,
          connection_type: 'web',
          status: 'connecting',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Iniciando conexão",
        description: "Aguarde o QR Code aparecer...",
      });

      // Call the Node.js server to initiate connection
      // This will be handled by the external server
      const response = await fetch(`${import.meta.env.VITE_WHATSAPP_SERVER_URL}/api/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          connectionId: data.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate connection');
      }

    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível iniciar a conexão com WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAPI = () => {
    toast({
      title: "Em desenvolvimento",
      description: "A conexão via API oficial estará disponível em breve",
    });
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({ status: 'disconnected' })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Desconectado",
        description: "WhatsApp desconectado com sucesso",
      });

      // Call server to cleanup session
      fetch(`${import.meta.env.VITE_WHATSAPP_SERVER_URL}/api/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      });

    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Erro ao desconectar",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: WhatsAppConnectionData['status']) => {
    const statusConfig = {
      connected: { icon: CheckCircle2, label: 'Conectado', variant: 'default' as const },
      connecting: { icon: Loader2, label: 'Conectando...', variant: 'secondary' as const },
      qr_code: { icon: QrCode, label: 'Aguardando QR Code', variant: 'secondary' as const },
      disconnected: { icon: XCircle, label: 'Desconectado', variant: 'outline' as const },
      error: { icon: XCircle, label: 'Erro', variant: 'destructive' as const },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`w-3 h-3 ${status === 'connecting' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  };

  if (loading && connections.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Smartphone className="w-6 h-6" />
            Conexões WhatsApp
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Conecte seu WhatsApp para sincronizar conversas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleConnectWeb}
            disabled={loading}
            className="gap-2"
          >
            <QrCode className="w-4 h-4" />
            WhatsApp Web
          </Button>
          <Button
            onClick={handleConnectAPI}
            variant="outline"
            disabled={loading}
            className="gap-2"
          >
            <Link2 className="w-4 h-4" />
            API Oficial
          </Button>
        </div>
      </div>

      {/* Active Connections */}
      {connections.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <Card key={connection.id} className="p-4 border-primary/20">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {connection.display_name || connection.phone_number || 'WhatsApp'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {connection.connection_type === 'web' ? 'WhatsApp Web' : 'API Oficial'}
                    </p>
                  </div>
                  {getStatusBadge(connection.status)}
                </div>

                {connection.phone_number && (
                  <p className="text-sm text-muted-foreground">
                    {connection.phone_number}
                  </p>
                )}

                {connection.error_message && (
                  <p className="text-xs text-destructive">
                    {connection.error_message}
                  </p>
                )}

                {connection.status === 'connected' && (
                  <Button
                    onClick={() => handleDisconnect(connection.id)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Desconectar
                  </Button>
                )}

                {connection.status === 'qr_code' && connection.qr_code && (
                  <Button
                    onClick={() => {
                      setCurrentQRCode(connection.qr_code);
                      setSelectedConnectionId(connection.id);
                      setShowQRDialog(true);
                    }}
                    size="sm"
                    className="w-full"
                  >
                    Ver QR Code
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {connections.length === 0 && (
        <Card className="p-12 text-center border-dashed">
          <Smartphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma conexão ativa</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Conecte seu WhatsApp para começar a sincronizar suas conversas
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleConnectWeb} className="gap-2">
              <QrCode className="w-4 h-4" />
              Conectar WhatsApp Web
            </Button>
            <Button onClick={handleConnectAPI} variant="outline" className="gap-2">
              <Link2 className="w-4 h-4" />
              API Oficial
            </Button>
          </div>
        </Card>
      )}

      <QRCodeDialog
        open={showQRDialog}
        onOpenChange={setShowQRDialog}
        qrCode={currentQRCode}
        connectionId={selectedConnectionId}
      />
    </div>
  );
};

export default WhatsAppConnection;

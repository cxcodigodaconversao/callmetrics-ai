import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Smartphone, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: string | null;
  connectionId: string | null;
}

const QRCodeDialog = ({ open, onOpenChange, qrCode, connectionId }: QRCodeDialogProps) => {
  const [status, setStatus] = useState<'qr_code' | 'connected' | 'error'>('qr_code');

  useEffect(() => {
    if (!connectionId || !open) return;

    const channel = supabase
      .channel(`qr_status_${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_connections',
          filter: `id=eq.${connectionId}`,
        },
        (payload) => {
          console.log('QR Status update:', payload);
          const newStatus = payload.new.status;
          
          if (newStatus === 'connected') {
            setStatus('connected');
            setTimeout(() => {
              onOpenChange(false);
            }, 2000);
          } else if (newStatus === 'error') {
            setStatus('error');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Conectar WhatsApp Web
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com seu WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {status === 'qr_code' && qrCode && (
            <>
              <Alert>
                <AlertDescription className="text-sm">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>Toque em <strong>Mais opções</strong> ou <strong>Configurações</strong></li>
                    <li>Toque em <strong>Aparelhos conectados</strong></li>
                    <li>Toque em <strong>Conectar um aparelho</strong></li>
                    <li>Aponte seu celular para esta tela para escanear o QR Code</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="flex justify-center p-6 bg-white rounded-lg">
                <img 
                  src={qrCode} 
                  alt="QR Code WhatsApp" 
                  className="w-64 h-64 object-contain"
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Aguardando conexão...
              </div>
            </>
          )}

          {status === 'qr_code' && !qrCode && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Gerando QR Code...
              </p>
            </div>
          )}

          {status === 'connected' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Conectado com sucesso!</h3>
              <p className="text-sm text-muted-foreground">
                Seu WhatsApp foi conectado e está sincronizando...
              </p>
            </div>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>
                Erro ao conectar. Tente novamente ou recarregue a página.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;

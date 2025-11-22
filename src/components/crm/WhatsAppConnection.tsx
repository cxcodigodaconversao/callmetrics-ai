// src/components/WhatsAppConnect.tsx
// Componente para conectar WhatsApp Web via QR Code

import { useState, useEffect } from 'react';
import { whatsappService } from '@/services/whatsappService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Smartphone, QrCode, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WhatsAppConnectProps {
  userId: string;
}

type ConnectionStatus = 'disconnected' | 'initializing' | 'qr_code' | 'connected' | 'connecting' | 'error';

export default function WhatsAppConnection({ userId }: WhatsAppConnectProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<string>('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const { toast } = useToast();

  // Verificar se já existe uma conexão ao carregar
  useEffect(() => {
    checkExistingConnection();
  }, [userId]);

  // Inscrever em atualizações quando tiver connectionId
  useEffect(() => {
    if (!connectionId) return;

    console.log('🔌 Conectando aos canais Realtime...');

    // Escutar mudanças no QR Code
    const qrChannel = whatsappService.subscribeToQRCode(connectionId, (newQrCode) => {
      console.log('📸 QR Code atualizado');
      setQrCode(newQrCode);
      if (newQrCode) {
        setStatus('qr_code');
      }
    });

    // Escutar mudanças no status
    const statusChannel = whatsappService.subscribeToStatus(connectionId, (newStatus) => {
      console.log('🔄 Status atualizado:', newStatus);
      setStatus(newStatus as ConnectionStatus);
      
      if (newStatus === 'connected') {
        toast({
          title: '✅ WhatsApp Conectado!',
          description: 'Seu WhatsApp foi conectado com sucesso.',
        });
        setQrCode(null);
        fetchConnectionDetails();
      } else if (newStatus === 'error') {
        toast({
          title: '❌ Erro na conexão',
          description: 'Houve um problema ao conectar. Tente novamente.',
          variant: 'destructive',
        });
      }
    });

    // Cleanup ao desmontar
    return () => {
      console.log('🔌 Desconectando dos canais Realtime...');
      qrChannel.unsubscribe();
      statusChannel.unsubscribe();
    };
  }, [connectionId]);

  /**
   * Verificar se já existe conexão
   */
  const checkExistingConnection = async () => {
    try {
      const connection = await whatsappService.getUserConnection(userId);
      
      if (connection) {
        console.log('✅ Conexão existente encontrada:', connection);
        setConnectionId(connection.id);
        
        // Se estava em 'connecting', resetar para 'disconnected' para não travar a UI
        const connectionStatus = connection.status === 'connecting' 
          ? 'disconnected' 
          : connection.status;
        
        setStatus(connectionStatus);
        setPhoneNumber(connection.phone_number || '');
        setDisplayName(connection.display_name || '');
        
        if (connection.status === 'qr_code' && connection.qr_code) {
          setQrCode(connection.qr_code);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
    }
  };

  /**
   * Buscar detalhes da conexão
   */
  const fetchConnectionDetails = async () => {
    if (!connectionId) return;
    
    try {
      const statusData = await whatsappService.getStatus(connectionId);
      setPhoneNumber(statusData.phoneNumber || '');
      setDisplayName(statusData.displayName || '');
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
    }
  };

  /**
   * Iniciar conexão WhatsApp
   */
  const handleConnect = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Verificar se servidor está online
      console.log('🔍 Verificando servidor WhatsApp...');
      const healthResult = await whatsappService.healthCheck();
      
      if (!healthResult.online) {
        const errorDetails = healthResult.status 
          ? `Servidor retornou status ${healthResult.status} (${healthResult.statusText})`
          : `Servidor inacessível: ${healthResult.error || 'Verifique a URL no config'}`;
        
        setServerStatus(errorDetails);
        setErrorMessage(errorDetails);
        throw new Error(`❌ ${errorDetails}`);
      }
      
      setServerStatus('✅ Servidor online');
      console.log('✅ Servidor WhatsApp está online');

      // Criar ou buscar conexão
      let connection;
      if (connectionId) {
        connection = { id: connectionId };
      } else {
        connection = await whatsappService.createConnection(userId);
        setConnectionId(connection.id);
      }

      // Iniciar processo de conexão
      await whatsappService.connect(userId, connection.id);
      setStatus('initializing');
      
      toast({
        title: '🔄 Conectando...',
        description: 'Aguarde o QR Code aparecer.',
      });
      
    } catch (error: any) {
      console.error('Erro ao conectar:', error);
      setErrorMessage(error.message || 'Erro ao conectar');
      setStatus('error');
      
      toast({
        title: '❌ Erro ao conectar',
        description: error.message || 'Não foi possível conectar ao WhatsApp.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Desconectar WhatsApp
   */
  const handleDisconnect = async () => {
    if (!connectionId) return;
    
    setIsLoading(true);
    
    try {
      await whatsappService.disconnect(connectionId);
      setStatus('disconnected');
      setQrCode(null);
      setPhoneNumber('');
      setDisplayName('');
      
      toast({
        title: '🔌 Desconectado',
        description: 'WhatsApp desconectado com sucesso.',
      });
      
    } catch (error: any) {
      toast({
        title: '❌ Erro ao desconectar',
        description: error.message || 'Não foi possível desconectar.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle>WhatsApp Web</CardTitle>
              <CardDescription>
                Conecte seu WhatsApp para sincronizar mensagens
              </CardDescription>
            </div>
          </div>
          
          {status === 'connected' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
              <span className="text-sm font-medium">Conectado</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* DESCONECTADO */}
        {status === 'disconnected' && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Para conectar seu WhatsApp, clique no botão abaixo e escaneie o QR Code que aparecerá.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2 h-5 w-5" />
                  Conectar WhatsApp
                </>
              )}
            </Button>
          </div>
        )}

        {/* INICIALIZANDO / CONECTANDO */}
        {(status === 'initializing' || status === 'connecting') && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Conectando ao WhatsApp... Aguarde o QR Code.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatus('disconnected');
                setQrCode(null);
              }}
              className="text-xs"
            >
              Cancelar
            </Button>
          </div>
        )}

        {/* QR CODE */}
        {status === 'qr_code' && qrCode && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <QrCode className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Escaneie o QR Code com seu WhatsApp</strong>
                <br />
                Abra o WhatsApp no celular → Configurações → Aparelhos conectados → Conectar aparelho
              </AlertDescription>
            </Alert>
            
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp" 
                className="w-full max-w-sm mx-auto rounded-lg"
              />
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              O QR Code expira após alguns minutos. Se expirar, reconecte.
            </p>
          </div>
        )}

        {/* CONECTADO */}
        {status === 'connected' && (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>WhatsApp conectado com sucesso!</strong>
                <br />
                Suas mensagens estão sendo sincronizadas automaticamente.
              </AlertDescription>
            </Alert>
            
            {(phoneNumber || displayName) && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {displayName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nome:</span>
                    <span className="font-medium">{displayName}</span>
                  </div>
                )}
                {phoneNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Número:</span>
                    <span className="font-medium">+{phoneNumber}</span>
                  </div>
                )}
              </div>
            )}
            
            <Button 
              onClick={handleDisconnect} 
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desconectando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Desconectar WhatsApp
                </>
              )}
            </Button>
          </div>
        )}

        {/* ERRO */}
        {status === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erro ao conectar</strong>
                <br />
                {errorMessage || 'Houve um problema na conexão. Tente novamente.'}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* PAINEL DE DIAGNÓSTICO */}
        <div className="mt-6 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {showDiagnostics ? '▼' : '▶'} Diagnóstico da Conexão
          </Button>
          
          {showDiagnostics && (
            <div className="mt-3 p-4 bg-muted/50 rounded-lg space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status atual:</span>
                <span className="font-semibold">{status}</span>
              </div>
              
              {connectionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connection ID:</span>
                  <span className="truncate ml-2 max-w-[200px]" title={connectionId}>
                    {connectionId.slice(0, 8)}...
                  </span>
                </div>
              )}
              
              {serverStatus && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servidor:</span>
                  <span className={serverStatus.includes('✅') ? 'text-green-600' : 'text-destructive'}>
                    {serverStatus}
                  </span>
                </div>
              )}
              
              {errorMessage && (
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block mb-1">Último erro:</span>
                  <span className="text-destructive break-words">{errorMessage}</span>
                </div>
              )}
              
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground block mb-1">Config:</span>
                <span className="break-all text-[10px]">
                  {import.meta.env.MODE === 'development' 
                    ? 'https://whatsapp-server-crm-production.up.railway.app'
                    : 'Servidor configurado'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

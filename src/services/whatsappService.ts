// src/services/whatsappService.ts
// Serviço para comunicação com o servidor WhatsApp no Railway

import { WHATSAPP_CONFIG } from '@/config/whatsapp.config';
import { supabase } from '@/integrations/supabase/client';

class WhatsAppService {
  private serverUrl: string;

  constructor() {
    this.serverUrl = WHATSAPP_CONFIG.SERVER_URL;
  }

  /**
   * Conectar WhatsApp Web
   * Inicia o processo de conexão e geração de QR Code
   */
  async connect(userId: string, connectionId: string) {
    try {
      console.log('📱 Iniciando conexão WhatsApp...', { userId, connectionId });

      const response = await fetch(`${this.serverUrl}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, connectionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao conectar WhatsApp');
      }

      const data = await response.json();
      console.log('✅ Conexão iniciada:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
      throw error;
    }
  }

  /**
   * Desconectar WhatsApp
   */
  async disconnect(connectionId: string) {
    try {
      console.log('🔌 Desconectando WhatsApp...', connectionId);

      const response = await fetch(`${this.serverUrl}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao desconectar');
      }

      const data = await response.json();
      console.log('✅ Desconectado:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      throw error;
    }
  }

  /**
   * Ver status da conexão no Railway
   */
  async getStatus(connectionId: string) {
    try {
      const response = await fetch(`${this.serverUrl}/status/${connectionId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar status');
      }

      return await response.json();
      
    } catch (error) {
      console.error('❌ Erro ao buscar status:', error);
      throw error;
    }
  }

  /**
   * Enviar mensagem via WhatsApp
   */
  async sendMessage(connectionId: string, phoneNumber: string, message: string) {
    try {
      console.log('📤 Enviando mensagem...', { connectionId, phoneNumber });

      const response = await fetch(`${this.serverUrl}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId, phoneNumber, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar mensagem');
      }

      const data = await response.json();
      console.log('✅ Mensagem enviada:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Verificar se servidor está online
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('💚 Servidor online:', data);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('💔 Servidor offline:', error);
      return false;
    }
  }

  /**
   * Escutar atualizações de QR Code via Supabase Realtime
   */
  subscribeToQRCode(connectionId: string, callback: (qrCode: string | null) => void) {
    console.log('👀 Inscrito em atualizações de QR Code:', connectionId);

    const channel = supabase
      .channel(`qr-code-${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_connections',
          filter: `id=eq.${connectionId}`
        },
        (payload: any) => {
          console.log('🔄 QR Code atualizado:', payload.new.qr_code ? 'Novo QR' : 'Removido');
          callback(payload.new.qr_code);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Escutar atualizações de status via Supabase Realtime
   */
  subscribeToStatus(connectionId: string, callback: (status: string) => void) {
    console.log('👀 Inscrito em atualizações de status:', connectionId);

    const channel = supabase
      .channel(`status-${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_connections',
          filter: `id=eq.${connectionId}`
        },
        (payload: any) => {
          console.log('🔄 Status atualizado:', payload.new.status);
          callback(payload.new.status);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Criar uma nova conexão no Supabase
   */
  async createConnection(userId: string) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .insert({
          user_id: userId,
          status: 'disconnected'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Conexão criada no Supabase:', data.id);
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao criar conexão:', error);
      throw error;
    }
  }

  /**
   * Buscar conexão existente do usuário
   */
  async getUserConnection(userId: string) {
    try {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      return data;
      
    } catch (error) {
      console.error('❌ Erro ao buscar conexão:', error);
      throw error;
    }
  }
}

// Exporta instância única do serviço
export const whatsappService = new WhatsAppService();

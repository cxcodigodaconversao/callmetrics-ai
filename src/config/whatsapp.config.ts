// src/config/whatsapp.config.ts
// Configuração do servidor WhatsApp no Railway

export const WHATSAPP_CONFIG = {
  // URL do seu servidor Railway
  SERVER_URL: 'https://whatsapp-server-crm-production.up.railway.app',
  
  // Endpoints disponíveis
  ENDPOINTS: {
    CONNECT: '/connect',
    DISCONNECT: '/disconnect',
    STATUS: '/status',
    SEND_MESSAGE: '/send-message',
    HEALTH: '/health'
  },
  
  // Configurações de polling (verificação de QR Code)
  POLLING: {
    INTERVAL: 2000, // Verifica a cada 2 segundos
    MAX_ATTEMPTS: 150 // Tenta por 5 minutos (150 * 2s = 300s)
  }
};

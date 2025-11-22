// src/config/whatsapp.config.ts
// Configuração do servidor WhatsApp no Railway

export const WHATSAPP_CONFIG = {
  // URL do seu servidor Railway
  SERVER_URL: 'https://whatsapp-server-crm-production.up.railway.app',
  
  // Endpoints disponíveis
  ENDPOINTS: {
    CONNECT: '/api/connect',
    DISCONNECT: '/api/disconnect',
    STATUS: '/api/status',
    SEND_MESSAGE: '/api/send-message',
    HEALTH: '/health'
  },
  
  // Configurações de polling (verificação de QR Code)
  POLLING: {
    INTERVAL: 2000, // Verifica a cada 2 segundos
    MAX_ATTEMPTS: 150 // Tenta por 5 minutos (150 * 2s = 300s)
  }
};

# Servidor WhatsApp Web - Node.js + Railway

Este documento contém todas as instruções para configurar o servidor Node.js que gerencia as conexões WhatsApp Web com QR Code.

## 🚀 Passo 1: Criar o Projeto Node.js

Crie uma nova pasta para o servidor (fora do projeto Lovable):

```bash
mkdir whatsapp-crm-server
cd whatsapp-crm-server
npm init -y
```

## 📦 Passo 2: Instalar Dependências

```bash
npm install express whatsapp-web.js qrcode dotenv @supabase/supabase-js cors
```

## 📝 Passo 3: Criar os Arquivos

### 3.1 - Arquivo `package.json`

```json
{
  "name": "whatsapp-crm-server",
  "version": "1.0.0",
  "description": "WhatsApp Web CRM Integration Server",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.76.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.2",
    "qrcode": "^1.5.4",
    "whatsapp-web.js": "^1.26.0"
  }
}
```

### 3.2 - Arquivo `server.js`

```javascript
import express from 'express';
import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Store active WhatsApp clients
const clients = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeConnections: clients.size,
    timestamp: new Date().toISOString()
  });
});

// Connect WhatsApp Web
app.post('/api/connect', async (req, res) => {
  try {
    const { userId, connectionId } = req.body;

    if (!userId || !connectionId) {
      return res.status(400).json({ error: 'userId and connectionId are required' });
    }

    console.log(`[${connectionId}] Initiating connection for user ${userId}`);

    // Update status to connecting
    await supabase
      .from('whatsapp_connections')
      .update({ status: 'connecting' })
      .eq('id', connectionId);

    // Create WhatsApp client
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: connectionId,
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
      },
    });

    // QR Code event
    client.on('qr', async (qr) => {
      try {
        console.log(`[${connectionId}] QR Code generated`);
        
        // Generate QR Code as base64 image
        const qrCodeDataUrl = await QRCode.toDataURL(qr);
        
        // Update database with QR code
        await supabase
          .from('whatsapp_connections')
          .update({ 
            status: 'qr_code',
            qr_code: qrCodeDataUrl,
            error_message: null
          })
          .eq('id', connectionId);

        console.log(`[${connectionId}] QR Code saved to database`);
      } catch (error) {
        console.error(`[${connectionId}] Error handling QR:`, error);
      }
    });

    // Ready event
    client.on('ready', async () => {
      try {
        console.log(`[${connectionId}] Client is ready`);
        
        const info = client.info;
        
        await supabase
          .from('whatsapp_connections')
          .update({ 
            status: 'connected',
            phone_number: info.wid.user,
            display_name: info.pushname || info.wid.user,
            qr_code: null,
            last_connected_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', connectionId);

        console.log(`[${connectionId}] Connected as ${info.pushname} (${info.wid.user})`);

        // Start syncing messages
        startMessageSync(client, connectionId);
      } catch (error) {
        console.error(`[${connectionId}] Error on ready:`, error);
      }
    });

    // Disconnected event
    client.on('disconnected', async (reason) => {
      console.log(`[${connectionId}] Disconnected:`, reason);
      
      await supabase
        .from('whatsapp_connections')
        .update({ 
          status: 'disconnected',
          error_message: `Disconnected: ${reason}`
        })
        .eq('id', connectionId);

      clients.delete(connectionId);
    });

    // Message event
    client.on('message', async (message) => {
      try {
        await handleIncomingMessage(message, connectionId);
      } catch (error) {
        console.error(`[${connectionId}] Error handling message:`, error);
      }
    });

    // Error event
    client.on('auth_failure', async (error) => {
      console.error(`[${connectionId}] Auth failure:`, error);
      
      await supabase
        .from('whatsapp_connections')
        .update({ 
          status: 'error',
          error_message: 'Authentication failed'
        })
        .eq('id', connectionId);
    });

    // Store client and initialize
    clients.set(connectionId, client);
    await client.initialize();

    res.json({ 
      success: true, 
      message: 'Connection initiated',
      connectionId 
    });

  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    
    await supabase
      .from('whatsapp_connections')
      .update({ 
        status: 'error',
        error_message: error.message
      })
      .eq('id', req.body.connectionId);

    res.status(500).json({ error: error.message });
  }
});

// Disconnect WhatsApp
app.post('/api/disconnect', async (req, res) => {
  try {
    const { connectionId } = req.body;

    if (!connectionId) {
      return res.status(400).json({ error: 'connectionId is required' });
    }

    const client = clients.get(connectionId);
    if (client) {
      await client.destroy();
      clients.delete(connectionId);
    }

    await supabase
      .from('whatsapp_connections')
      .update({ status: 'disconnected' })
      .eq('id', connectionId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle incoming message
async function handleIncomingMessage(message, connectionId) {
  try {
    const contact = await message.getContact();
    const chat = await message.getChat();

    const messageData = {
      connection_id: connectionId,
      message_id: message.id.id,
      chat_id: message.from,
      contact_name: contact.pushname || contact.name,
      contact_number: contact.number,
      message_body: message.body,
      message_type: message.type,
      is_from_me: message.fromMe,
      timestamp: new Date(message.timestamp * 1000).toISOString(),
      metadata: {
        hasMedia: message.hasMedia,
        isGroup: chat.isGroup,
        quotedMsgId: message.hasQuotedMsg ? message._data.quotedMsg.id : null,
      }
    };

    // Save to database
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert(messageData);

    if (error) {
      console.error('Error saving message:', error);
    }

  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

// Start syncing existing messages
async function startMessageSync(client, connectionId) {
  try {
    console.log(`[${connectionId}] Starting message sync...`);

    const chats = await client.getChats();
    
    for (const chat of chats.slice(0, 50)) { // Sync only last 50 chats to avoid overload
      try {
        const messages = await chat.fetchMessages({ limit: 50 });
        
        for (const message of messages) {
          await handleIncomingMessage(message, connectionId);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[${connectionId}] Error syncing chat ${chat.id._serialized}:`, error);
      }
    }

    console.log(`[${connectionId}] Message sync completed`);
  } catch (error) {
    console.error(`[${connectionId}] Error in message sync:`, error);
  }
}

// Get connection status
app.get('/api/status/:connectionId', (req, res) => {
  const { connectionId } = req.params;
  const client = clients.get(connectionId);
  
  res.json({
    exists: !!client,
    state: client ? client.info : null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp CRM Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  
  for (const [connectionId, client] of clients) {
    try {
      await client.destroy();
      console.log(`Closed connection: ${connectionId}`);
    } catch (error) {
      console.error(`Error closing ${connectionId}:`, error);
    }
  }
  
  process.exit(0);
});
```

### 3.3 - Arquivo `.env`

Crie um arquivo `.env` com suas credenciais do Supabase:

```env
SUPABASE_URL=https://sqgwpenihrcdapptyltt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
PORT=3000
```

**⚠️ IMPORTANTE:** Você precisa adicionar a `SUPABASE_SERVICE_ROLE_KEY` que pode ser encontrada no painel do Supabase em Settings > API.

### 3.4 - Arquivo `.gitignore`

```
node_modules/
.env
.wwebjs_auth/
.wwebjs_cache/
```

## 🚂 Passo 4: Deploy no Railway

### 4.1 - Criar conta no Railway

1. Acesse: https://railway.app/
2. Faça login com GitHub

### 4.2 - Criar novo projeto

1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Conecte o repositório do seu servidor

### 4.3 - Configurar variáveis de ambiente

No Railway, adicione as seguintes variáveis:

```
SUPABASE_URL=https://sqgwpenihrcdapptyltt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
PORT=3000
```

### 4.4 - Deploy

O Railway vai fazer o deploy automaticamente. Após o deploy, você receberá uma URL como:

```
https://your-app.railway.app
```

## 🔧 Passo 5: Configurar no Lovable

Adicione a variável de ambiente no seu projeto Lovable (arquivo `.env`):

```env
VITE_WHATSAPP_SERVER_URL=https://your-app.railway.app
```

## 🧪 Passo 6: Testar

1. Acesse seu app no Lovable
2. Vá para "CRM da Conversão"
3. Clique em "Conectar WhatsApp Web"
4. Escaneie o QR Code com seu celular
5. Aguarde a sincronização das mensagens

## 📊 Monitoramento

Você pode monitorar o servidor acessando:

- Health check: `https://your-app.railway.app/health`
- Logs: No dashboard do Railway

## 🔒 Segurança

**Importante:**

1. **NUNCA** compartilhe sua `SUPABASE_SERVICE_ROLE_KEY`
2. Use HTTPS em produção
3. Implemente rate limiting se necessário
4. Monitore uso de recursos no Railway

## 💰 Custos

Railway tem:
- $5 de crédito grátis por mês
- Depois: ~$10-20/mês dependendo do uso

## 🐛 Troubleshooting

### "QR Code não aparece"

- Verifique os logs no Railway
- Confirme que as variáveis de ambiente estão corretas
- Teste o endpoint `/health`

### "Conexão cai constantemente"

- WhatsApp pode estar bloqueando automação
- Reduza a frequência de sincronização
- Use WhatsApp Business API oficial (mais estável)

### "Mensagens não sincronizam"

- Verifique se o cliente está conectado: `/api/status/:connectionId`
- Verifique os logs do servidor
- Confirme que as políticas RLS do Supabase estão corretas

## 📞 Suporte

Se tiver dúvidas, verifique:
- Documentação do whatsapp-web.js: https://wwebjs.dev/
- Documentação do Railway: https://docs.railway.app/
- Logs do servidor no Railway

## ⏭️ Próximos Passos

Depois que isso estiver funcionando:

1. ✅ WhatsApp Web com QR Code
2. 🔜 WhatsApp Business API Oficial
3. 🔜 Instagram DM (se houver API)
4. 🔜 Análise automática de DISC
5. 🔜 Automações e respostas rápidas

---

**Pronto!** Seu servidor WhatsApp Web está configurado e pronto para uso! 🎉

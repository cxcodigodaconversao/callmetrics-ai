# Sales Calls IA

Sistema inteligente de análise de calls de vendas usando IA.

## Funcionalidades Principais

- 🎥 **Upload de vídeos** de calls de vendas
- 🎯 **Análise automática** usando IA (OpenAI GPT-4)
- 📊 **Scores detalhados**: SPIN (S,P,I,N), Conexão, Objeções, Fechamento, etc
- 📝 **Transcrição automática** de áudio
- 📈 **Dashboard** com estatísticas e métricas
- 👥 **Gerenciamento de usuários** (apenas administrador)
- 🔒 **Segurança RLS** - cada usuário vê apenas seus próprios dados

## Usuário Administrador Master

**Email:** cxcodigodaconversao@gmail.com

⚠️ **IMPORTANTE:** Apenas este usuário específico tem acesso ao menu "Usuários" no dashboard para criar e gerenciar outros usuários do sistema.

## Project info

**URL**: https://lovable.dev/projects/9e01dd37-2434-4f89-807e-6a1e3f465307

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9e01dd37-2434-4f89-807e-6a1e3f465307) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend:** Vite + React + TypeScript
- **Styling:** Tailwind CSS + shadcn-ui
- **Backend:** Supabase (Database, Auth, Storage, Edge Functions)
- **IA:** OpenAI API (GPT-4 para análise, Whisper para transcrição)

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis e análises
  ├── pages/         # Páginas (Dashboard, Upload, Analyses, UserManagement)
  ├── hooks/         # Custom hooks (useAuth, useToast)
  ├── lib/           # Utilitários (validações, PDF generator)
  └── integrations/  # Integração com Supabase

supabase/
  ├── functions/     # Edge Functions (Deno)
  │   ├── create-user/           # Criar usuários
  │   ├── delete-user/           # Excluir usuários
  │   ├── process-video/         # Orquestrar processamento
  │   ├── transcribe-audio/      # Transcrição OpenAI Whisper
  │   └── analyze-transcription/ # Análise GPT-4
  └── migrations/    # SQL migrations
```

## Edge Functions

- **create-user**: Criar novos usuários (requer autenticação admin)
- **delete-user**: Excluir usuários (requer autenticação admin)  
- **process-video**: Processar vídeo enviado (público)
- **transcribe-audio**: Transcrever áudio usando OpenAI Whisper (público)
- **analyze-transcription**: Analisar transcrição com GPT-4 (público)

## Segurança

- ✅ RLS (Row Level Security) habilitado em todas as tabelas
- ✅ Usuários acessam apenas seus próprios vídeos e análises
- ✅ Gerenciamento de usuários restrito ao admin master
- ✅ Edge Functions de admin protegidas com JWT
- ✅ Validação de entrada com Zod

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9e01dd37-2434-4f89-807e-6a1e3f465307) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

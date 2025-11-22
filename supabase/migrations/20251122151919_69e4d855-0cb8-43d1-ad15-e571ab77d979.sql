-- Create enum for WhatsApp connection types
CREATE TYPE whatsapp_connection_type AS ENUM ('web', 'api');

-- Create enum for WhatsApp connection status
CREATE TYPE whatsapp_status AS ENUM ('disconnected', 'connecting', 'qr_code', 'connected', 'error');

-- Create enum for CRM stages
CREATE TYPE crm_stage AS ENUM (
  'conversa_iniciada',
  'contactado',
  'pre_qualificacao',
  'agendamento_call',
  'call_marcada',
  'ganho',
  'perdido',
  'no_show'
);

-- Create enum for DISC profiles
CREATE TYPE disc_profile AS ENUM ('dominance', 'influence', 'steadiness', 'compliance', 'unknown');

-- Table: whatsapp_connections
CREATE TABLE public.whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_type whatsapp_connection_type NOT NULL DEFAULT 'web',
  phone_number TEXT,
  display_name TEXT,
  status whatsapp_status NOT NULL DEFAULT 'disconnected',
  session_data JSONB,
  qr_code TEXT,
  last_connected_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: whatsapp_messages
CREATE TABLE public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  contact_name TEXT,
  contact_number TEXT,
  message_body TEXT,
  message_type TEXT DEFAULT 'text',
  is_from_me BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL,
  media_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: crm_leads
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  contact_name TEXT NOT NULL,
  contact_number TEXT,
  contact_email TEXT,
  stage crm_stage NOT NULL DEFAULT 'conversa_iniciada',
  disc_profile disc_profile DEFAULT 'unknown',
  campaign_source TEXT,
  team TEXT,
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  call_scheduled_at TIMESTAMPTZ,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: crm_activities
CREATE TABLE public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  old_stage crm_stage,
  new_stage crm_stage,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_whatsapp_connections_user_id ON public.whatsapp_connections(user_id);
CREATE INDEX idx_whatsapp_connections_status ON public.whatsapp_connections(status);
CREATE INDEX idx_whatsapp_messages_connection_id ON public.whatsapp_messages(connection_id);
CREATE INDEX idx_whatsapp_messages_chat_id ON public.whatsapp_messages(chat_id);
CREATE INDEX idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp DESC);
CREATE INDEX idx_crm_leads_user_id ON public.crm_leads(user_id);
CREATE INDEX idx_crm_leads_stage ON public.crm_leads(stage);
CREATE INDEX idx_crm_leads_connection_id ON public.crm_leads(connection_id);
CREATE INDEX idx_crm_activities_lead_id ON public.crm_activities(lead_id);

-- Enable RLS
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_connections
CREATE POLICY "Users can view own connections"
  ON public.whatsapp_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON public.whatsapp_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON public.whatsapp_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON public.whatsapp_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for whatsapp_messages
CREATE POLICY "Users can view own messages"
  ON public.whatsapp_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.whatsapp_connections
    WHERE whatsapp_connections.id = whatsapp_messages.connection_id
    AND whatsapp_connections.user_id = auth.uid()
  ));

CREATE POLICY "Service role can insert messages"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (true);

-- RLS Policies for crm_leads
CREATE POLICY "Users can view own leads"
  ON public.crm_leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON public.crm_leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON public.crm_leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON public.crm_leads FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for crm_activities
CREATE POLICY "Users can view own activities"
  ON public.crm_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON public.crm_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_whatsapp_connections_updated_at
  BEFORE UPDATE ON public.whatsapp_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
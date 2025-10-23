-- Add is_active column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create AI usage tracking table
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'ai_call_analysis',
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ai_usage_logs
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_usage_logs
CREATE POLICY "Users see own usage" ON public.ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins see all usage" ON public.ai_usage_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert usage" ON public.ai_usage_logs
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_time ON public.ai_usage_logs(user_id, used_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);

-- Update profiles RLS to allow admins to see all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
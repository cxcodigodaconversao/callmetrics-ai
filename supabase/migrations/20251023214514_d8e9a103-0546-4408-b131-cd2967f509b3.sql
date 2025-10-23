-- Add is_active column to profiles table for soft delete functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure ai_usage_logs table exists with proper structure
-- (it already exists based on schema, but let's ensure indexes for performance)
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_used_at ON public.ai_usage_logs(used_at DESC);

-- Add composite index for user + date queries (for monthly reports)
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_date 
ON public.ai_usage_logs(user_id, used_at DESC);
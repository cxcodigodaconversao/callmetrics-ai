-- Fix all RLS policies to use has_role() instead of users.role column
-- This prevents privilege escalation attacks

-- Step 1: Update videos table policy
DROP POLICY IF EXISTS "Admins can view all videos" ON public.videos;
CREATE POLICY "Admins can view all videos"
ON public.videos FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Step 2: Update api_usage_logs table policy  
DROP POLICY IF EXISTS "Admins can view all logs" ON public.api_usage_logs;
CREATE POLICY "Admins can view all logs"
ON public.api_usage_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Step 3: Update audit_logs table policy
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Step 4: Update users table policy
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
ON public.users FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Step 5: Now safe to remove deprecated role columns
ALTER TABLE public.users DROP COLUMN IF EXISTS role;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
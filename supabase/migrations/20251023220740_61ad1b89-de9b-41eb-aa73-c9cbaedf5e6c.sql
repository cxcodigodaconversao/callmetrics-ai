-- Add job_title column to profiles for user's job position (not permissions)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS job_title TEXT;
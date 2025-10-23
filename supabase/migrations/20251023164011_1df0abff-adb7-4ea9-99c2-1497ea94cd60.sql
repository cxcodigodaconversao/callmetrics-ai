-- Allow 'drive' mode for videos table
ALTER TABLE public.videos
DROP CONSTRAINT IF EXISTS videos_mode_check;

ALTER TABLE public.videos
ADD CONSTRAINT videos_mode_check
CHECK (mode = ANY (ARRAY['upload'::text, 'youtube'::text, 'drive'::text]));
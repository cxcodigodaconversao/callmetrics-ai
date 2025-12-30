-- Update the videos_mode_check constraint to include 'url' and 'transcript' modes
ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS videos_mode_check;
ALTER TABLE public.videos ADD CONSTRAINT videos_mode_check CHECK (mode = ANY (ARRAY['upload', 'youtube', 'drive', 'url', 'transcript']));
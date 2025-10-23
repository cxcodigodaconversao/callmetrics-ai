-- Enable realtime for videos table
ALTER TABLE public.videos REPLICA IDENTITY FULL;

-- Add videos table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
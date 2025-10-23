-- Fix videos status constraint to allow all needed statuses
ALTER TABLE public.videos
DROP CONSTRAINT IF EXISTS videos_status_check;

ALTER TABLE public.videos
ADD CONSTRAINT videos_status_check
CHECK (status = ANY (ARRAY['queued'::text, 'pending'::text, 'processing'::text, 'completed'::text, 'failed'::text]));

-- Create storage policies for uploads bucket to allow authenticated users to upload files
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
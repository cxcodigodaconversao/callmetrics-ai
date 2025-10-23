-- Set uploads bucket to 50MB (free tier limit)
UPDATE storage.buckets 
SET file_size_limit = 52428800
WHERE id = 'uploads';
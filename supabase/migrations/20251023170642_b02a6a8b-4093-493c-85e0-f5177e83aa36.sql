-- Update uploads bucket to allow 500MB files (Pro plan)
UPDATE storage.buckets 
SET file_size_limit = 524288000
WHERE id = 'uploads';
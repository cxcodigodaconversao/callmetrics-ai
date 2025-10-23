-- Fix videos where storage_path is null but source_url has the path
UPDATE videos 
SET 
  storage_path = source_url,
  updated_at = NOW()
WHERE 
  mode = 'upload'
  AND storage_path IS NULL
  AND source_url IS NOT NULL;
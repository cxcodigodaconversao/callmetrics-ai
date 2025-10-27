-- Atualizar o bucket uploads para suportar 5GB (plano Pro)
UPDATE storage.buckets 
SET file_size_limit = 5368709120  -- 5GB em bytes
WHERE id = 'uploads';
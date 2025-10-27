-- Aumentar o limite de tamanho do bucket uploads para 2GB
UPDATE storage.buckets 
SET file_size_limit = 2147483648 
WHERE id = 'uploads';
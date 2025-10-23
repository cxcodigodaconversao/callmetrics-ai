-- Mark videos stuck in processing status (over 10 minutes) as failed
UPDATE videos 
SET 
  status = 'failed',
  error_message = 'Processamento expirado - tempo limite excedido (10 minutos)',
  updated_at = NOW()
WHERE 
  status = 'processing' 
  AND updated_at < NOW() - INTERVAL '10 minutes';
-- Mark the stuck video as failed
UPDATE videos 
SET 
  status = 'failed',
  error_message = 'Processamento interrompido - sem logs de execução detectados',
  updated_at = NOW()
WHERE 
  id = '5aba1e17-efa5-4f02-8168-b910363fea0d'
  AND status = 'processing';
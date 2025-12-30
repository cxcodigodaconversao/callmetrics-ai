-- Add sale status tracking columns to analyses table
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS sale_status text DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS scheduled_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS sale_notes text;

-- Add comment for documentation
COMMENT ON COLUMN public.analyses.sale_status IS 'Status da venda: closed (fechada), not_closed (não fechada), promise (promessa de venda), unknown (não identificado)';
COMMENT ON COLUMN public.analyses.scheduled_date IS 'Data agendada para follow-up ou fechamento quando sale_status é promise';
COMMENT ON COLUMN public.analyses.sale_notes IS 'Observações adicionais sobre o status da venda extraídas da análise';

-- Create index for filtering by sale status
CREATE INDEX IF NOT EXISTS idx_analyses_sale_status ON public.analyses(sale_status);
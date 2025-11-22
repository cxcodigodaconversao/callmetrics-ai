-- Adicionar colunas de vendedor e produto na tabela videos
ALTER TABLE videos 
ADD COLUMN seller_name TEXT,
ADD COLUMN product_name TEXT;

-- Criar índices para melhor performance nas consultas
CREATE INDEX idx_videos_seller_name ON videos(seller_name);
CREATE INDEX idx_videos_product_name ON videos(product_name);

-- Comentários para documentação
COMMENT ON COLUMN videos.seller_name IS 'Nome do vendedor responsável pela call';
COMMENT ON COLUMN videos.product_name IS 'Nome do produto ou serviço oferecido na call';
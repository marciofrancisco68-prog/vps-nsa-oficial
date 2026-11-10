-- ============================================================================
-- vpsNsA SOVEREIGN MEMORY ENGINE — RETENÇÃO AUTÔNOMA DE 2 ANOS (730 DIAS)
-- Autor: vpsNsA
-- ============================================================================

-- 1. Criar a extensão pgcrypto para UUIDs de alta performance
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Memória Infinita da vpsNsA (Logs, Telemetria, Sessões e Cache)
CREATE TABLE IF NOT EXISTS vpsnsa_sovereign_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_scope VARCHAR(100) NOT NULL, -- Ex: 'telemetry', 'proxy_logs', 'btc_tx'
    payload JSONB NOT NULL,            -- Conteúdo completo armazenado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '2 years')
);

-- 3. Índices B-Tree otimizados para busca ultra-rápida e expiração
CREATE INDEX IF NOT EXISTS idx_vpsnsa_memory_created_at ON vpsnsa_sovereign_memory (created_at);
CREATE INDEX IF NOT EXISTS idx_vpsnsa_memory_expires_at ON vpsnsa_sovereign_memory (expires_at);

-- 4. Função Autônoma de Purga (Deleta automaticamente dados com mais de 2 anos)
CREATE OR REPLACE FUNCTION purge_vpsnsa_expired_memory()
RETURNS VOID AS $$
DECLARE
    deleted_rows INT;
BEGIN
    -- Remove todos os registros onde a data de expiração passou de 2 anos (730 dias)
    DELETE FROM vpsnsa_sovereign_memory
    WHERE expires_at <= CURRENT_TIMESTAMP;

    GET DIAGNOSTICS deleted_rows = ROW_COUNT;
    
    -- Registra no log do sistema a execução limpa
    RAISE NOTICE 'vpsNsA Memory Engine: % registros antigos (2 anos+) expurgados com sucesso.', deleted_rows;
END;
$$ LANGUAGE plpgsql;

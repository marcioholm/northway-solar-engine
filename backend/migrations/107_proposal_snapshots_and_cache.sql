-- Migration 107: Snapshots de Configurações da Proposta e Sanitização de IPs (LGPD)
-- Idempotente. DEVE ser aplicada em produção após o merge (com backup prévio).

-- 1. Colunas de snapshots em proposals
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS settings_snapshot JSONB;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS company_snapshot JSONB;

COMMENT ON COLUMN proposals.settings_snapshot IS 'Snapshot imutável das configurações (proposal_settings) no momento da geração';
COMMENT ON COLUMN proposals.company_snapshot IS 'Snapshot imutável dos dados da empresa (nome, logo, contatos, endereço) no momento da geração';

-- 2. Limpeza de IPs em claro (LGPD) em proposal_tracking e proposal_events
UPDATE proposal_tracking SET ip_address = NULL WHERE ip_address IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'proposal_events') THEN
    UPDATE proposal_events SET ip_address = NULL WHERE ip_address IS NOT NULL;
  END IF;
END $$;


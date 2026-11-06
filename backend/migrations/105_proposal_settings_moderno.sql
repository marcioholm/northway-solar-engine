-- Migration 105: Proposta Comercial Modelo Moderno e Personalização Avançada
-- Idempotente. NÃO aplicar em produção manualmente (apenas em northway_test nos testes).

-- 1. Novos padrões neutros para cores de empresa nova (sem alterar registros existentes)
ALTER TABLE proposal_settings ALTER COLUMN primary_color SET DEFAULT '#1F2937';
ALTER TABLE proposal_settings ALTER COLUMN secondary_color SET DEFAULT '#F59E0B';

-- 2. Novas colunas para suporte ao modelo Moderno
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS service_area JSONB NOT NULL DEFAULT '{"style": "zoom", "states": [], "cities": []}'::jsonb;
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS qr JSONB NOT NULL DEFAULT '{"enabled": true, "type": "proposal", "value": "", "message": "", "label": ""}'::jsonb;
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS cover_focus VARCHAR(20) NOT NULL DEFAULT 'center';
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS highlights JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS services_text TEXT;
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS kit_image_url TEXT;

-- 3. Garantir RLS e revogar privilégios diretos para anon e authenticated (mesmo padrão da migration 104)
DO $$
DECLARE
  has_api_roles BOOLEAN := EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
    AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated');
BEGIN
  ALTER TABLE public.proposal_settings ENABLE ROW LEVEL SECURITY;
  IF has_api_roles THEN
    REVOKE ALL ON TABLE public.proposal_settings FROM anon, authenticated;
  END IF;
END $$;


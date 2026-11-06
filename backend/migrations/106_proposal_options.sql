-- Migration 106: Opções de Kit por Proposta Comercial (proposal_options) e Padrões de Pagamento
-- Idempotente. NÃO aplicar em produção manualmente (apenas em northway_test nos testes).

-- 1. Padrões de pagamento em proposal_settings
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS payment_defaults JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Tabela de opções de kit por proposta
CREATE TABLE IF NOT EXISTS proposal_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  position INT NOT NULL CHECK (position >= 1 AND position <= 3),
  name VARCHAR(100) NOT NULL DEFAULT 'Kit 1',
  recommended BOOLEAN NOT NULL DEFAULT false,
  system_power_kwp NUMERIC(8,2) NOT NULL DEFAULT 0,
  module_qty INT NOT NULL DEFAULT 0,
  module_desc TEXT,
  inverter_desc TEXT,
  structure_desc TEXT,
  generation_monthly_kwh NUMERIC(10,2),
  final_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices e constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_proposal_options_proposal_position
  ON proposal_options (proposal_id, position);

CREATE UNIQUE INDEX IF NOT EXISTS idx_proposal_options_one_recommended
  ON proposal_options (proposal_id)
  WHERE (recommended = true);

CREATE INDEX IF NOT EXISTS idx_proposal_options_company
  ON proposal_options (company_id);

CREATE INDEX IF NOT EXISTS idx_proposal_options_proposal
  ON proposal_options (proposal_id);

-- 3. Ativar RLS e revogar privilégios para roles anônima e autenticada direta do Supabase
DO $$
DECLARE
  has_api_roles BOOLEAN := EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
    AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated');
BEGIN
  ALTER TABLE public.proposal_options ENABLE ROW LEVEL SECURITY;
  IF has_api_roles THEN
    REVOKE ALL ON TABLE public.proposal_options FROM anon, authenticated;
  END IF;
END $$;

-- 4. Migração de propostas existentes para opção única (position 1, recommended true)
INSERT INTO proposal_options (
  proposal_id,
  company_id,
  position,
  name,
  recommended,
  system_power_kwp,
  module_qty,
  module_desc,
  inverter_desc,
  structure_desc,
  generation_monthly_kwh,
  final_price,
  created_at,
  updated_at
)
SELECT
  p.id AS proposal_id,
  p.company_id AS company_id,
  1 AS position,
  'Sistema Proposto' AS name,
  true AS recommended,
  COALESCE(p.system_power_kwp, 0) AS system_power_kwp,
  COALESCE(p.module_qty, 0) AS module_qty,
  NULL AS module_desc,
  NULL AS inverter_desc,
  'Estrutura de fixação completa em alumínio' AS structure_desc,
  (
    SELECT sp.sizing_generation_kwh
    FROM solar_project sp
    WHERE sp.id = p.solar_project_id
  ) AS generation_monthly_kwh,
  COALESCE(p.final_price, 0) AS final_price,
  p.created_at,
  p.updated_at
FROM proposals p
WHERE p.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM proposal_options po WHERE po.proposal_id = p.id
  );

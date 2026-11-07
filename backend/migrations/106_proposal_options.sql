-- Migration 106: Opções de Kit por Proposta Comercial (proposal_options) e Padrões de Pagamento/Cenários
-- Idempotente. NÃO aplicar em produção manualmente (apenas em northway_test nos testes).

-- 1. Padrões de pagamento, cargas futuras e regras de dimensionamento em proposal_settings
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS payment_defaults JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS sizing_rules JSONB NOT NULL DEFAULT '{"folgaPct": 10, "expansaoPct": 25}'::jsonb;

ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS future_loads JSONB NOT NULL DEFAULT '[
  {"id":"ac_inv_9000","name":"Ar-condicionado inverter 9.000 BTU","category":"Climatização","powerKw":0.50,"defaultHoursPerDay":8,"defaultDaysPerMonth":30},
  {"id":"ac_inv_12000","name":"Ar-condicionado inverter 12.000 BTU","category":"Climatização","powerKw":0.65,"defaultHoursPerDay":8,"defaultDaysPerMonth":30},
  {"id":"ac_inv_18000","name":"Ar-condicionado inverter 18.000 BTU","category":"Climatização","powerKw":1.00,"defaultHoursPerDay":8,"defaultDaysPerMonth":30},
  {"id":"ac_inv_24000","name":"Ar-condicionado inverter 24.000 BTU","category":"Climatização","powerKw":1.30,"defaultHoursPerDay":8,"defaultDaysPerMonth":30},
  {"id":"ac_conv_12000","name":"Ar-condicionado convencional 12.000 BTU","category":"Climatização","powerKw":1.10,"defaultHoursPerDay":8,"defaultDaysPerMonth":30},
  {"id":"carro_eletrico","name":"Carro elétrico","category":"Mobilidade","fixedKwh":180,"defaultHoursPerDay":0,"defaultDaysPerMonth":30},
  {"id":"chuveiro_5500","name":"Chuveiro elétrico 5,5 kW","category":"Eletrodomésticos","powerKw":5.50,"defaultHoursPerDay":0.5,"defaultDaysPerMonth":30},
  {"id":"bomba_piscina_750","name":"Bomba de piscina 0,75 kW","category":"Lazer","powerKw":0.75,"defaultHoursPerDay":6,"defaultDaysPerMonth":30}
]'::jsonb;

-- 2. Tabela de opções de kit / cenários por proposta
CREATE TABLE IF NOT EXISTS proposal_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  position INT NOT NULL CHECK (position >= 1 AND position <= 3),
  name VARCHAR(100) NOT NULL DEFAULT 'Kit 1',
  recommended BOOLEAN NOT NULL DEFAULT false,
  scenario_type VARCHAR(30),
  scenario_text TEXT,
  is_manual_price BOOLEAN NOT NULL DEFAULT false,
  target_consumption_kwh NUMERIC(10,2),
  future_loads JSONB DEFAULT '[]'::jsonb,
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

-- Adiciona colunas se a tabela já existia sem elas
ALTER TABLE proposal_options ADD COLUMN IF NOT EXISTS scenario_type VARCHAR(30);
ALTER TABLE proposal_options ADD COLUMN IF NOT EXISTS scenario_text TEXT;
ALTER TABLE proposal_options ADD COLUMN IF NOT EXISTS is_manual_price BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE proposal_options ADD COLUMN IF NOT EXISTS target_consumption_kwh NUMERIC(10,2);
ALTER TABLE proposal_options ADD COLUMN IF NOT EXISTS future_loads JSONB DEFAULT '[]'::jsonb;

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
  scenario_type,
  scenario_text,
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
  'recommended' AS scenario_type,
  'Sistema dimensionado conforme consumo' AS scenario_text,
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

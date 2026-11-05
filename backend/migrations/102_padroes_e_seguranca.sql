-- Índices de desempenho, regras padrão de follow-up e bloqueio do acesso direto.
-- Idempotente.

CREATE INDEX IF NOT EXISTS idx_solar_project_company_id ON solar_project (company_id);
CREATE INDEX IF NOT EXISTS idx_solar_project_lead_id ON solar_project (lead_id);
CREATE INDEX IF NOT EXISTS idx_solar_project_status ON solar_project (status);
CREATE INDEX IF NOT EXISTS idx_solar_project_company_status ON solar_project (company_id, status);
CREATE INDEX IF NOT EXISTS idx_solar_project_company_updated ON solar_project (company_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_solar_project_company_created ON solar_project (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_company_id ON proposals (company_id);
CREATE INDEX IF NOT EXISTS idx_proposals_lead_id ON proposals (lead_id);
CREATE INDEX IF NOT EXISTS idx_proposals_solar_project_id ON proposals (solar_project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_company_created ON proposals (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads (company_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads (stage);
CREATE INDEX IF NOT EXISTS idx_leads_company_stage ON leads (company_id, stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads (assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_company_source ON leads (company_id, source);
CREATE INDEX IF NOT EXISTS idx_leads_company_created ON leads (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks (company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_company_status ON tasks (company_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_catalog_products_company_id ON catalog_products (company_id);
CREATE INDEX IF NOT EXISTS idx_catalog_products_company_category ON catalog_products (company_id, category);
CREATE INDEX IF NOT EXISTS idx_catalog_products_brand ON catalog_products (brand);
CREATE INDEX IF NOT EXISTS idx_catalog_suppliers_company_id ON catalog_suppliers (company_id);
CREATE INDEX IF NOT EXISTS idx_catalog_kits_company_id ON catalog_kits (company_id);
CREATE INDEX IF NOT EXISTS idx_catalog_manufacturers_company_id ON catalog_manufacturers (company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_solar_project_id ON quotes (solar_project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_lead_id ON lead_timeline (lead_id);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON lead_timeline (type);

INSERT INTO follow_up_rules (company_id, trigger, message, delay_minutes, is_active)
SELECT c.id, 'hot_lead', '🔥 {nome_cliente} acabou de revisar o preço da proposta. Bom momento pra ligar!', 0, true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM follow_up_rules r WHERE r.company_id::text = c.id::text AND r.trigger = 'hot_lead'
);

INSERT INTO follow_up_rules (company_id, trigger, message, delay_minutes, is_active)
SELECT c.id, 'very_interested', '👀 {nome_cliente} já abriu a proposta várias vezes. Tá comparando — liga antes que feche com outro.', 0, true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM follow_up_rules r WHERE r.company_id::text = c.id::text AND r.trigger = 'very_interested'
);

INSERT INTO follow_up_rules (company_id, trigger, message, delay_minutes, is_active)
SELECT c.id, 'going_cold', '⏰ {nome_cliente} não abriu a proposta há dias. Hora de um follow-up.', 14400, true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM follow_up_rules r WHERE r.company_id::text = c.id::text AND r.trigger = 'going_cold'
);

INSERT INTO follow_up_rules (company_id, trigger, message, delay_minutes, is_active)
SELECT c.id, 'opened_no_action', '📋 {nome_cliente} abriu a proposta rapidamente. Pode ter dúvidas.', 30, true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM follow_up_rules r WHERE r.company_id::text = c.id::text AND r.trigger = 'opened_no_action'
);

INSERT INTO follow_up_rules (company_id, trigger, message, delay_minutes, is_active)
SELECT c.id, 'expiring_soon_seller', '⚠️ A proposta do {nome_cliente} vence em 3 dias. Se ele não respondeu, é hora de fazer contato.', 0, true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM follow_up_rules r WHERE r.company_id::text = c.id::text AND r.trigger = 'expiring_soon_seller'
);

INSERT INTO follow_up_rules (company_id, trigger, message, delay_minutes, is_active)
SELECT c.id, 'expired_seller', '❌ A proposta do {nome_cliente} venceu. Quer gerar uma proposta atualizada?', 0, true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM follow_up_rules r WHERE r.company_id::text = c.id::text AND r.trigger = 'expired_seller'
);

-- O navegador nunca acessa o banco direto: todo acesso passa pelo backend.
DO $$
DECLARE
  item RECORD;
  has_api_roles BOOLEAN := EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
    AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated');
BEGIN
  FOR item IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', item.tablename);
    IF has_api_roles THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', item.tablename);
    END IF;
  END LOOP;

  IF has_api_roles THEN
    ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
  END IF;
END $$;

-- Migration 009: Performance indexes for common query patterns
-- Adds indexes on frequently filtered/joined columns to eliminate full table scans.

-- ── solar_project ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_solar_project_company_id ON solar_project (company_id);
CREATE INDEX IF NOT EXISTS idx_solar_project_lead_id ON solar_project (lead_id);
CREATE INDEX IF NOT EXISTS idx_solar_project_status ON solar_project (status);
CREATE INDEX IF NOT EXISTS idx_solar_project_company_status ON solar_project (company_id, status);
CREATE INDEX IF NOT EXISTS idx_solar_project_company_updated ON solar_project (company_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_solar_project_company_created ON solar_project (company_id, created_at DESC);

-- ── proposals ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_proposals_company_id ON proposals (company_id);
CREATE INDEX IF NOT EXISTS idx_proposals_lead_id ON proposals (lead_id);
CREATE INDEX IF NOT EXISTS idx_proposals_solar_project_id ON proposals (solar_project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_company_created ON proposals (company_id, created_at DESC);

-- ── leads ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads (company_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads (stage);
CREATE INDEX IF NOT EXISTS idx_leads_company_stage ON leads (company_id, stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads (assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_company_source ON leads (company_id, source);
CREATE INDEX IF NOT EXISTS idx_leads_company_created ON leads (company_id, created_at DESC);

-- ── tasks ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks (company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_company_status ON tasks (company_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date);

-- ── catalog ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_catalog_products_company_id ON catalog_products (company_id);
CREATE INDEX IF NOT EXISTS idx_catalog_products_company_category ON catalog_products (company_id, category);
CREATE INDEX IF NOT EXISTS idx_catalog_products_brand ON catalog_products (brand);
CREATE INDEX IF NOT EXISTS idx_catalog_suppliers_company_id ON catalog_suppliers (company_id);
CREATE INDEX IF NOT EXISTS idx_catalog_kits_company_id ON catalog_kits (company_id);
CREATE INDEX IF NOT EXISTS idx_catalog_manufacturers_company_id ON catalog_manufacturers (company_id);

-- ── quotes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_quotes_solar_project_id ON quotes (solar_project_id);

-- ── timeline (lead_timeline) ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_timeline_lead_id ON lead_timeline (lead_id);
CREATE INDEX IF NOT EXISTS idx_timeline_event_type ON lead_timeline (event_type);

-- ── GIN indexes for JSONB columns (frequently queried inside JSONB) ──
CREATE INDEX IF NOT EXISTS idx_solar_project_pricing_gin ON solar_project USING GIN (pricing);
CREATE INDEX IF NOT EXISTS idx_solar_project_consumption_gin ON solar_project USING GIN (consumption);
CREATE INDEX IF NOT EXISTS idx_solar_project_equipment_gin ON solar_project USING GIN (equipment);

-- RAISE NOTICE 'Migration 009 complete: performance indexes created';

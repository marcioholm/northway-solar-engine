-- Migration 005: Add quote_id, template_name, settings to proposals
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS quote_id uuid,
  ADD COLUMN IF NOT EXISTS template_name varchar(64) NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}';

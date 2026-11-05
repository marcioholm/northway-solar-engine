-- Migration 007: Remove inventory FK constraints from proposals, add catalog_product fields
ALTER TABLE proposals
  DROP CONSTRAINT IF EXISTS proposals_module_id_fkey,
  DROP CONSTRAINT IF EXISTS proposals_inverter_id_fkey,
  ADD COLUMN IF NOT EXISTS catalog_product_module_id uuid,
  ADD COLUMN IF NOT EXISTS catalog_product_inverter_id uuid;

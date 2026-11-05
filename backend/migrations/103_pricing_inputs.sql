-- Migration 103: Campos de cálculo de combustível, deslocamento e comissão.
-- Idempotente.

ALTER TABLE solar_project
  ADD COLUMN IF NOT EXISTS pricing_travel_distance double precision,
  ADD COLUMN IF NOT EXISTS pricing_travel_trips double precision,
  ADD COLUMN IF NOT EXISTS pricing_fuel_efficiency double precision,
  ADD COLUMN IF NOT EXISTS pricing_fuel_price double precision,
  ADD COLUMN IF NOT EXISTS pricing_commission_pct double precision;

-- Migration 004: Add pricing engine columns to solar_projects
ALTER TABLE solar_projects
  ADD COLUMN IF NOT EXISTS pricing_art_cost float,
  ADD COLUMN IF NOT EXISTS pricing_installation_cost float,
  ADD COLUMN IF NOT EXISTS pricing_hotel_cost float,
  ADD COLUMN IF NOT EXISTS pricing_food_cost float,
  ADD COLUMN IF NOT EXISTS pricing_toll_cost float,
  ADD COLUMN IF NOT EXISTS pricing_crane_cost float,
  ADD COLUMN IF NOT EXISTS pricing_third_parties_cost float,
  ADD COLUMN IF NOT EXISTS pricing_other_cost float,
  ADD COLUMN IF NOT EXISTS pricing_total_cost float,
  ADD COLUMN IF NOT EXISTS pricing_profit float,
  ADD COLUMN IF NOT EXISTS pricing_recommended_price float,
  ADD COLUMN IF NOT EXISTS pricing_effective_margin_pct float,
  ADD COLUMN IF NOT EXISTS pricing_min_margin_pct float,
  ADD COLUMN IF NOT EXISTS pricing_recommended_margin_pct float;

-- Migration 003: Migrate SolarProject JSONB modules to typed columns
-- Run this AFTER TypeORM synchronize creates the new columns

-- Backup
CREATE TABLE IF NOT EXISTS solar_project_backup AS SELECT * FROM solar_project;

-- Migrate client JSONB -> typed columns
UPDATE solar_project SET
    client_name = client->>'name',
    client_document = client->>'document',
    client_phone = client->>'phone',
    client_email = client->>'email',
    client_city = client->>'city',
    client_state = client->>'state',
    client_zipcode = client->>'zipcode',
    client_utility = client->>'utility',
    client_class = client->>'consumerClass',
    client_tariff_group = client->>'tariffGroup',
    client_modality = client->>'modality',
    consultant_name = client->>'consultantName'
WHERE client IS NOT NULL AND client != '{}'::jsonb;

-- Migrate site JSONB -> typed columns
UPDATE solar_project SET
    site_address = site->>'address',
    site_zipcode = site->>'zipcode',
    site_latitude = (site->>'latitude')::float,
    site_longitude = (site->>'longitude')::float,
    site_roof_type = site->>'roofType',
    site_inclination = (site->>'inclination')::float,
    site_azimuth = (site->>'azimuth')::float,
    site_photos = COALESCE((site->>'photos')::jsonb, '[]'::jsonb)
WHERE site IS NOT NULL AND site != '{}'::jsonb;

-- Migrate consumption JSONB -> typed columns
UPDATE solar_project SET
    consumption_monthly_kwh = (consumption->>'monthlyConsumption')::float,
    consumption_monthly_bill = (consumption->>'monthlyBill')::float,
    consumption_tariff = (consumption->>'tariff')::float,
    consumption_demand = (consumption->>'demand')::float,
    consumption_modality = consumption->>'modality',
    consumption_group = consumption->>'group',
    consumption_invoices = COALESCE((consumption->>'invoices')::jsonb, '[]'::jsonb)
WHERE consumption IS NOT NULL AND consumption != '{}'::jsonb;

-- Migrate sizing JSONB -> typed columns
UPDATE solar_project SET
    sizing_power_kwp = (sizing->>'systemPowerKwp')::float,
    sizing_generation_kwh = (sizing->>'monthlyGenerationKwh')::float,
    sizing_irradiation = (sizing->>'irradiation')::float,
    sizing_loss_factor = (sizing->>'lossFactor')::float,
    sizing_module_qty = (sizing->>'moduleQty')::int,
    sizing_inverter_qty = (sizing->>'inverterQty')::int,
    sizing_observations = sizing->>'observations'
WHERE sizing IS NOT NULL AND sizing != '{}'::jsonb;

-- Migrate equipment JSONB -> typed columns
UPDATE solar_project SET
    equipment_modules = COALESCE((equipment->>'modules')::jsonb, '[]'::jsonb),
    equipment_inverters = COALESCE((equipment->>'inverters')::jsonb, '[]'::jsonb),
    equipment_structures = COALESCE((equipment->>'structures')::jsonb, '[]'::jsonb),
    equipment_cables = COALESCE((equipment->>'cables')::jsonb, '[]'::jsonb)
WHERE equipment IS NOT NULL AND equipment != '{}'::jsonb;

-- Migrate pricing JSONB -> typed columns
UPDATE solar_project SET
    pricing_equipment_cost = (pricing->>'equipmentCost')::float,
    pricing_labor_cost = (pricing->>'laborCost')::float,
    pricing_project_cost = (pricing->>'projectCost')::float,
    pricing_freight_cost = (pricing->>'freightCost')::float,
    pricing_travel_cost = (pricing->>'travelCost')::float,
    pricing_commission = (pricing->>'commission')::float,
    pricing_taxes = (pricing->>'taxes')::float,
    pricing_admin_cost = (pricing->>'adminCost')::float,
    pricing_margin_pct = (pricing->>'marginPct')::float,
    pricing_margin_value = (pricing->>'marginValue')::float,
    pricing_min_price = (pricing->>'minPrice')::float,
    pricing_final_price = (pricing->>'finalPrice')::float,
    pricing_discount_pct = (pricing->>'discountPct')::float
WHERE pricing IS NOT NULL AND pricing != '{}'::jsonb;

-- Migrate payment JSONB -> typed columns
UPDATE solar_project SET
    payment_cash_discount = (payment->>'cashDiscount')::float,
    payment_card_tax = (payment->>'cardTax')::float,
    payment_card_installments = (payment->>'cardInstallments')::int,
    payment_finance_tax = (payment->>'financeTax')::float,
    payment_finance_installments = (payment->>'financeInstallments')::int,
    payment_validity_days = COALESCE((payment->>'validityDays')::int, 10)
WHERE payment IS NOT NULL AND payment != '{}'::jsonb;

-- ============================================
-- FASE 1: SolarProject - Migration
-- ============================================
-- Esta migration cria a entidade SolarProject
-- e migra os dados existentes das proposals.
-- 
-- A tabela solar_project será criada pelo
-- TypeORM (synchronize: true), mas os dados
-- precisam ser migrados manualmente.
-- ============================================

-- 1. Criar SolarProject para cada Proposal existente
INSERT INTO solar_project (
    id,
    company_id,
    lead_id,
    created_by,
    status,
    client,
    consumption,
    site,
    sizing,
    equipment,
    pricing,
    payment,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    p.company_id,
    p.lead_id,
    p.created_by,
    'proposed',
    -- client module
    jsonb_build_object(
        'name', p.client_name,
        'city', p.client_city,
        'zipcode', p.client_cep
    ),
    -- consumption module
    jsonb_build_object(
        'monthlyConsumption', p.consumption_kwh,
        'tariff', p.tariff,
        'utility', p.utility
    ),
    -- site module (empty - legacy data had no site info)
    '{}'::jsonb,
    -- sizing module
    jsonb_build_object(
        'systemPowerKwp', p.system_power_kwp,
        'moduleQty', p.module_qty,
        'inverterQty', 1
    ),
    -- equipment module
    jsonb_build_object(
        'modules', CASE WHEN p.module_id IS NOT NULL THEN
            jsonb_build_array(jsonb_build_object('id', p.module_id, 'qty', p.module_qty))
        ELSE '[]'::jsonb END,
        'inverters', CASE WHEN p.inverter_id IS NOT NULL THEN
            jsonb_build_array(jsonb_build_object('id', p.inverter_id, 'qty', 1))
        ELSE '[]'::jsonb END,
        'structureCost', p.cost_structure,
        'laborCost', p.cost_labor,
        'travelCost', p.cost_travel
    ),
    -- pricing module
    jsonb_build_object(
        'equipmentCost', COALESCE(p.cost_modules, 0) + COALESCE(p.cost_inverter, 0),
        'structureCost', p.cost_structure,
        'laborCost', p.cost_labor,
        'travelCost', p.cost_travel,
        'subtotal', p.subtotal,
        'marginPct', p.margin_pct,
        'marginValue', p.margin_value,
        'finalPrice', p.final_price
    ),
    -- payment module
    jsonb_build_object(
        'paybackYears', p.payback_years
    ),
    p.created_at,
    NOW()
FROM proposals p
WHERE p.id IS NOT NULL;

-- 2. Vincular solar_project_id nas proposals existentes
UPDATE proposals p
SET solar_project_id = sp.id
FROM solar_project sp
WHERE sp.lead_id = p.lead_id
  AND p.solar_project_id IS NULL;

-- 3. Log do resultado
DO $$
DECLARE
    total_proposals INT;
    migrated_proposals INT;
    total_projects INT;
BEGIN
    SELECT COUNT(*) INTO total_proposals FROM proposals;
    SELECT COUNT(*) INTO migrated_proposals FROM proposals WHERE solar_project_id IS NOT NULL;
    SELECT COUNT(*) INTO total_projects FROM solar_project;
    
    RAISE NOTICE '=== Migration Result ===';
    RAISE NOTICE 'Proposals total: %', total_proposals;
    RAISE NOTICE 'Proposals migrated: %', migrated_proposals;
    RAISE NOTICE 'SolarProjects created: %', total_projects;
    RAISE NOTICE '========================';
END $$;

-- ============================================
-- FASE 2: Migrate Inventory → Catalog
-- ============================================
-- Executar APÓS o TypeORM criar as tabelas
-- catalog_products, catalog_suppliers, catalog_kits
-- ============================================

-- 1. Migrar módulos do inventário antigo
INSERT INTO catalog_products (
    id, company_id, category, brand, model, purchase_price, unit, active, specs, created_by, created_at
)
SELECT
    gen_random_uuid(), company_id, 'module', brand, model,
    cost, 'un', active,
    jsonb_build_object('powerWatt', power_watt),
    'system', created_at
FROM inventory_modules
ON CONFLICT DO NOTHING;

-- 2. Migrar inversores do inventário antigo
INSERT INTO catalog_products (
    id, company_id, category, brand, model, purchase_price, unit, active, specs, created_by, created_at
)
SELECT
    gen_random_uuid(), company_id, 'inverter', brand, model,
    cost, 'un', active,
    jsonb_build_object('nominalPowerKw', nominal_power_kw),
    'system', created_at
FROM inventory_inverters
ON CONFLICT DO NOTHING;

-- 3. Log
DO $$
DECLARE
    old_modules INT;
    old_inverters INT;
    new_products INT;
BEGIN
    SELECT COUNT(*) INTO old_modules FROM inventory_modules;
    SELECT COUNT(*) INTO old_inverters FROM inventory_inverters;
    SELECT COUNT(*) INTO new_products FROM catalog_products;
    RAISE NOTICE 'Inventory modules migrated: %', old_modules;
    RAISE NOTICE 'Inventory inverters migrated: %', old_inverters;
    RAISE NOTICE 'Catalog products total: %', new_products;
END $$;

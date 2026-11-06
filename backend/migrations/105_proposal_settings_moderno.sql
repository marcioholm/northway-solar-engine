-- Migration 105: Proposta Comercial Modelo Moderno e Personalização Avançada
-- Idempotente. NÃO aplicar em produção manualmente (apenas em northway_test nos testes).

-- 1. Novos padrões neutros para cores de empresa nova (sem alterar registros existentes)
ALTER TABLE proposal_settings ALTER COLUMN primary_color SET DEFAULT '#1F2937';
ALTER TABLE proposal_settings ALTER COLUMN secondary_color SET DEFAULT '#F59E0B';

-- 2. Novas colunas para suporte ao modelo Moderno
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS service_area JSONB NOT NULL DEFAULT '{"style": "zoom", "states": [], "cities": []}'::jsonb;
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS qr JSONB NOT NULL DEFAULT '{"enabled": true, "type": "proposal", "value": "", "message": "", "label": ""}'::jsonb;
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS cover_focus VARCHAR(20) NOT NULL DEFAULT 'center';
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS highlights JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS services_text TEXT;
ALTER TABLE proposal_settings ADD COLUMN IF NOT EXISTS kit_image_url TEXT;

-- 3. Garantir RLS e revogar privilégios diretos para anon e authenticated (mesmo padrão da migration 104)
DO $$
DECLARE
  has_api_roles BOOLEAN := EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
    AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated');
BEGIN
  ALTER TABLE public.proposal_settings ENABLE ROW LEVEL SECURITY;
  IF has_api_roles THEN
    REVOKE ALL ON TABLE public.proposal_settings FROM anon, authenticated;
  END IF;
END $$;

-- 4. Correção idempotente de registros legados com cores invertidas
-- Troca primary_color e secondary_color apenas onde primary for clara E secondary for escura
DO $$
DECLARE
  rec RECORD;
  r1 int; g1 int; b1 int; lum1 int;
  r2 int; g2 int; b2 int; lum2 int;
  clean1 text; clean2 text;
BEGIN
  FOR rec IN SELECT id, primary_color, secondary_color FROM proposal_settings LOOP
    clean1 := replace(COALESCE(rec.primary_color, ''), '#', '');
    clean2 := replace(COALESCE(rec.secondary_color, ''), '#', '');

    IF length(clean1) = 6 AND length(clean2) = 6 THEN
      BEGIN
        r1 := ('x' || substr(clean1, 1, 2))::bit(8)::int;
        g1 := ('x' || substr(clean1, 3, 2))::bit(8)::int;
        b1 := ('x' || substr(clean1, 5, 2))::bit(8)::int;
        lum1 := (r1 * 299 + g1 * 587 + b1 * 114) / 1000;

        r2 := ('x' || substr(clean2, 1, 2))::bit(8)::int;
        g2 := ('x' || substr(clean2, 3, 2))::bit(8)::int;
        b2 := ('x' || substr(clean2, 5, 2))::bit(8)::int;
        lum2 := (r2 * 299 + g2 * 587 + b2 * 114) / 1000;

        -- Mesma regra de luminância do onColor: clara se lum >= 150, escura se lum < 150
        IF lum1 >= 150 AND lum2 < 150 THEN
          UPDATE proposal_settings
          SET primary_color = rec.secondary_color,
              secondary_color = rec.primary_color
          WHERE id = rec.id;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
  END LOOP;
END $$;



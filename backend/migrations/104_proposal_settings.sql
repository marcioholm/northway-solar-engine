-- Migration 104: Personalização de Proposta Comercial por Empresa (proposal_settings)
-- Idempotente.

CREATE TABLE IF NOT EXISTS proposal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  template VARCHAR(30) NOT NULL DEFAULT 'moderno',
  primary_color VARCHAR(7) NOT NULL DEFAULT '#FFB703',
  secondary_color VARCHAR(7) NOT NULL DEFAULT '#0F172A',
  cover_image_url TEXT,
  about_text TEXT DEFAULT 'Somos especialistas em soluções completas de energia solar fotovoltaica, dedicados a entregar máxima economia, sustentabilidade e segurança para residências, comércios e propriedades rurais.',
  about_image_url TEXT,
  stats JSONB NOT NULL DEFAULT '[
    {"value": "+500", "label": "Projetos Realizados"},
    {"value": "99%", "label": "Clientes Satisfeitos"},
    {"value": "25 anos", "label": "Garantia de Geração"},
    {"value": "Até 95%", "label": "Economia na Conta"}
  ]'::jsonb,
  partner_logos JSONB NOT NULL DEFAULT '[]'::jsonb,
  brand_logos JSONB NOT NULL DEFAULT '[]'::jsonb,
  service_area_text TEXT DEFAULT 'Atendimento especializado em todo o estado com suporte técnico de excelência e equipe própria.',
  included_items JSONB NOT NULL DEFAULT '[
    "Módulos fotovoltaicos de alta eficiência (tecnologia TOPCon / N-Type)",
    "Inversor ou microinversores com monitoramento Wi-Fi integrado",
    "Estrutura completa de fixação em alumínio anodizado de alta durabilidade",
    "Cabos solares especiais com proteção UV e conectores MC4 originais",
    "Quadro de proteção CA/CC com disjuntores e DPS para máxima segurança",
    "Projeto elétrico de engenharia com emissão de ART",
    "Tramitação documental e aprovação de parecer de acesso junto à concessionária",
    "Montagem técnica, comissionamento e ativação do sistema"
  ]'::jsonb,
  warranties_text TEXT DEFAULT 'Garantia de 25 anos de performance linear nos módulos fotovoltaicos (com pelo menos 80% da potência nominal garantida no 25º ano). Garantia de 10 a 12 anos contra defeitos de fabricação dos módulos solares. Garantia de 5 a 10 anos para inversores, conforme termo de garantia do fabricante. Garantia de 1 ano para os serviços de instalação e conformidade elétrica prestados pela nossa equipe.',
  exclusions_text TEXT DEFAULT 'Não estão inclusos no escopo deste fornecimento: reformas prévias ou reforço estrutural em telhados ou vigamentos danificados; obras de alvenaria, furações pesadas ou cabeamento civil além do padrão de instalação solar; adequações ou substituição do padrão de entrada de energia (poste, caixa e cabos) caso venham a ser exigidas pela concessionária em vistoria prévia.',
  notes_text TEXT DEFAULT 'Proposta válida por 10 (dez) dias corridos a partir da data de envio. A geração energética e economia financeira calculadas são estimativas baseadas em dados históricos de irradiação solar e hábitos médios de consumo. Os prazos de vistoria, troca de medidor para modelo bidirecional e homologação final são de responsabilidade da distribuidora de energia local.',
  acceptance_text TEXT DEFAULT 'Ao assinar ou dar aceite eletrônico nesta proposta, o cliente declara concordar com o dimensionamento técnico, valores e condições comerciais apresentadas, autorizando a empresa a dar início aos trâmites de engenharia e homologação.',
  contact JSONB NOT NULL DEFAULT '{
    "address": "",
    "phone": "",
    "website": "",
    "instagram": "",
    "whatsapp": ""
  }'::jsonb,
  sections_enabled JSONB NOT NULL DEFAULT '{
    "cover": true,
    "about": true,
    "stats": true,
    "technical": true,
    "equipment": true,
    "financial": true,
    "kit": true,
    "warranties": true,
    "partners": true,
    "contact": true
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_settings_company_id ON proposal_settings (company_id);

-- Inserir registros para empresas existentes que ainda não possuem
INSERT INTO proposal_settings (company_id)
SELECT c.id FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM proposal_settings ps WHERE ps.company_id::text = c.id::text
);

-- Ativar RLS e revogar privilégios para roles anônima e autenticada direta do Supabase
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


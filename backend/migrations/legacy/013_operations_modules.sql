-- Módulo de Equipes
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  name TEXT NOT NULL,
  leader_name TEXT,
  leader_phone TEXT,
  leader_user_id UUID REFERENCES auth.users(id),
  color TEXT DEFAULT '#8fd63a',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true
);

-- Módulo de Obras
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  lead_id UUID REFERENCES leads(id),
  proposal_id UUID REFERENCES proposals(id),
  
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  system_power_kwp NUMERIC,
  module_qty INTEGER,
  module_brand TEXT,
  module_model TEXT,
  module_power_watt INTEGER,
  inverter_brand TEXT,
  inverter_model TEXT,
  inverter_power_kw NUMERIC,
  
  status TEXT NOT NULL DEFAULT 'waiting_material',
  team_id UUID REFERENCES teams(id),
  
  sale_date DATE,
  estimated_start DATE,
  estimated_end DATE,
  actual_start DATE,
  actual_end DATE,
  homologation_date DATE,
  commissioning_date DATE,
  
  sale_price NUMERIC,
  total_cost NUMERIC,
  margin_percent NUMERIC GENERATED ALWAYS AS (
    CASE WHEN sale_price > 0 THEN ((sale_price - COALESCE(total_cost, 0)) / sale_price * 100) ELSE NULL END
  ) STORED,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  stage TEXT NOT NULL,
  item_label TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_by TEXT,
  completed_at TIMESTAMPTZ,
  photo_url TEXT,
  photo_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  stage TEXT NOT NULL,
  item_label TEXT NOT NULL,
  photo_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE project_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Módulo Financeiro
CREATE TABLE project_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  payment_type TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_project_total_cost()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET total_cost = (
    SELECT COALESCE(SUM(amount), 0) FROM project_costs WHERE project_id = NEW.project_id
  ), updated_at = now()
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_cost AFTER INSERT OR UPDATE OR DELETE ON project_costs
FOR EACH ROW EXECUTE FUNCTION update_project_total_cost();

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  sale_price NUMERIC NOT NULL,
  commission_percent NUMERIC NOT NULL,
  commission_value NUMERIC GENERATED ALWAYS AS (sale_price * commission_percent / 100) STORED,
  status TEXT DEFAULT 'pending',
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies (Adicionando o básico para tenants isolados)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Exemplo de política de isolamento por tenant foi removido por falta de tabela profiles.

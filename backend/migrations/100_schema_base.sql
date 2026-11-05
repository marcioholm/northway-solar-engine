-- Esquema-base do sistema, gerado a partir das entidades TypeORM.
-- Idempotente: cria o que falta num banco vazio e completa um banco existente.
-- Colunas NOT NULL sem default são adicionadas como opcionais em bancos antigos.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_timeline_type_enum') THEN
    CREATE TYPE "lead_timeline_type_enum" AS ENUM ('note', 'call', 'message', 'status_change', 'proposal', 'task', 'attachment', 'system');
  END IF;
END $$;
ALTER TYPE "lead_timeline_type_enum" ADD VALUE IF NOT EXISTS 'note';
ALTER TYPE "lead_timeline_type_enum" ADD VALUE IF NOT EXISTS 'call';
ALTER TYPE "lead_timeline_type_enum" ADD VALUE IF NOT EXISTS 'message';
ALTER TYPE "lead_timeline_type_enum" ADD VALUE IF NOT EXISTS 'status_change';
ALTER TYPE "lead_timeline_type_enum" ADD VALUE IF NOT EXISTS 'proposal';
ALTER TYPE "lead_timeline_type_enum" ADD VALUE IF NOT EXISTS 'task';
ALTER TYPE "lead_timeline_type_enum" ADD VALUE IF NOT EXISTS 'attachment';
ALTER TYPE "lead_timeline_type_enum" ADD VALUE IF NOT EXISTS 'system';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leads_client_type_enum') THEN
    CREATE TYPE "leads_client_type_enum" AS ENUM ('residential', 'commercial', 'industrial', 'rural');
  END IF;
END $$;
ALTER TYPE "leads_client_type_enum" ADD VALUE IF NOT EXISTS 'residential';
ALTER TYPE "leads_client_type_enum" ADD VALUE IF NOT EXISTS 'commercial';
ALTER TYPE "leads_client_type_enum" ADD VALUE IF NOT EXISTS 'industrial';
ALTER TYPE "leads_client_type_enum" ADD VALUE IF NOT EXISTS 'rural';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leads_stage_enum') THEN
    CREATE TYPE "leads_stage_enum" AS ENUM ('new', 'contacted', 'qualified', 'bill_received', 'sized', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost');
  END IF;
END $$;
ALTER TYPE "leads_stage_enum" ADD VALUE IF NOT EXISTS 'new';
ALTER TYPE "leads_stage_enum" ADD VALUE IF NOT EXISTS 'contacted';
ALTER TYPE "leads_stage_enum" ADD VALUE IF NOT EXISTS 'qualified';
ALTER TYPE "leads_stage_enum" ADD VALUE IF NOT EXISTS 'bill_received';
ALTER TYPE "leads_stage_enum" ADD VALUE IF NOT EXISTS 'sized';
ALTER TYPE "leads_stage_enum" ADD VALUE IF NOT EXISTS 'proposal_sent';
ALTER TYPE "leads_stage_enum" ADD VALUE IF NOT EXISTS 'negotiation';
ALTER TYPE "leads_stage_enum" ADD VALUE IF NOT EXISTS 'closed_won';
ALTER TYPE "leads_stage_enum" ADD VALUE IF NOT EXISTS 'closed_lost';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_priority_enum') THEN
    CREATE TYPE "tasks_priority_enum" AS ENUM ('low', 'medium', 'high');
  END IF;
END $$;
ALTER TYPE "tasks_priority_enum" ADD VALUE IF NOT EXISTS 'low';
ALTER TYPE "tasks_priority_enum" ADD VALUE IF NOT EXISTS 'medium';
ALTER TYPE "tasks_priority_enum" ADD VALUE IF NOT EXISTS 'high';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_status_enum') THEN
    CREATE TYPE "tasks_status_enum" AS ENUM ('pending', 'in_progress', 'done', 'cancelled');
  END IF;
END $$;
ALTER TYPE "tasks_status_enum" ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE "tasks_status_enum" ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE "tasks_status_enum" ADD VALUE IF NOT EXISTS 'done';
ALTER TYPE "tasks_status_enum" ADD VALUE IF NOT EXISTS 'cancelled';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_type_enum') THEN
    CREATE TYPE "tasks_type_enum" AS ENUM ('callback', 'visit', 'reminder', 'other');
  END IF;
END $$;
ALTER TYPE "tasks_type_enum" ADD VALUE IF NOT EXISTS 'callback';
ALTER TYPE "tasks_type_enum" ADD VALUE IF NOT EXISTS 'visit';
ALTER TYPE "tasks_type_enum" ADD VALUE IF NOT EXISTS 'reminder';
ALTER TYPE "tasks_type_enum" ADD VALUE IF NOT EXISTS 'other';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
    CREATE TYPE "users_role_enum" AS ENUM ('superadmin', 'admin', 'seller');
  END IF;
END $$;
ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'superadmin';
ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'seller';

-- Tabelas
CREATE TABLE IF NOT EXISTS "catalog_documents" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "product_id" uuid NOT NULL,
  "type" character varying(32) NOT NULL,
  "name" character varying NOT NULL,
  "description" character varying,
  "file_url" character varying NOT NULL,
  "file_type" character varying(16),
  "language" character varying,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_2dc87b41bc70a6bafbf8e469f1a" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "catalog_kits" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "name" character varying NOT NULL,
  "description" text,
  "suggested_price" numeric(10,2),
  "items" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "services" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_by" character varying NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_e6c457062347d39c9ec7a2fce03" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "catalog_manufacturers" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "name" character varying NOT NULL,
  "website" character varying,
  "contact" character varying,
  "email" character varying,
  "phone" character varying,
  "country" character varying,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_b725fdb468d89e4208e92edb9a1" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "catalog_products" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" uuid NOT NULL,
  "category" character varying NOT NULL,
  "supplier_id" uuid,
  "manufacturer_id" uuid,
  "brand" character varying NOT NULL,
  "line" character varying,
  "model" character varying NOT NULL,
  "sku" character varying,
  "purchase_price" numeric(10,2) NOT NULL,
  "suggested_price" numeric(10,2),
  "unit" character varying DEFAULT 'un'::character varying NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "stock_quantity" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
  "min_stock" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
  "warranty_years" integer,
  "specs" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "compatibility" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "datasheetUrl" character varying,
  "manualUrl" character varying,
  "certificateUrl" character varying,
  "imageUrl" character varying,
  "priceHistory" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_by" character varying NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_9f7a978657257a0bb575a174f0a" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "catalog_suppliers" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "name" character varying NOT NULL,
  "contact" character varying,
  "phone" character varying,
  "email" character varying,
  "city" character varying,
  "state" character varying,
  "avg_lead_time" integer,
  "notes" text,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_15a6a8dcfb0c47eb3f0758cf134" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "companies" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "name" character varying NOT NULL,
  "base_city" character varying NOT NULL,
  "base_lat" double precision,
  "base_lng" double precision,
  "cost_per_km" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
  "default_margin" numeric(5,2) DEFAULT '0'::numeric NOT NULL,
  "loss_factor" numeric(5,2) DEFAULT 0.8 NOT NULL,
  "card_tax" numeric(5,2) DEFAULT '15'::numeric NOT NULL,
  "finance_tax" numeric(5,2) DEFAULT '20'::numeric NOT NULL,
  "cash_discount" numeric(5,2) DEFAULT '5'::numeric NOT NULL,
  "logo_url" character varying,
  "meta_pixel_id" character varying,
  "meta_access_token" character varying,
  "meta_ad_account_id" character varying,
  "meta_dataset_id" character varying,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "follow_up_logs" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "lead_id" character varying NOT NULL,
  "proposal_id" character varying,
  "trigger" character varying NOT NULL,
  "seller_id" character varying,
  "is_to_client" boolean DEFAULT false NOT NULL,
  "status" character varying NOT NULL,
  "sent_at" timestamp without time zone,
  "error" text,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_00718783c8b1de60d84481f001f" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "follow_up_rules" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "trigger" character varying NOT NULL,
  "message" text NOT NULL,
  "delay_minutes" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_2c25bbd98c6e54423daefdd167b" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "inventory_inverters" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "brand" character varying NOT NULL,
  "model" character varying NOT NULL,
  "nominal_power_kw" numeric(5,2) NOT NULL,
  "cost" numeric(10,2) NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_6b0c696a322222964202851473f" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "inventory_modules" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "brand" character varying NOT NULL,
  "model" character varying NOT NULL,
  "power_watt" integer NOT NULL,
  "cost" numeric(10,2) NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_e68183ceaca7ce728f71018d827" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "lead_timeline" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "lead_id" character varying NOT NULL,
  "type" lead_timeline_type_enum NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb,
  "created_by" character varying NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_1b9728a953c46286c1e7b258d5b" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "leads" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "name" character varying NOT NULL,
  "company_name" character varying,
  "document" character varying,
  "phone" character varying NOT NULL,
  "whatsapp" character varying,
  "email" character varying NOT NULL,
  "city" character varying NOT NULL,
  "state" character varying NOT NULL,
  "address" character varying,
  "zipcode" character varying,
  "client_type" leads_client_type_enum DEFAULT 'residential'::leads_client_type_enum NOT NULL,
  "source" character varying,
  "utm_source" character varying,
  "utm_medium" character varying,
  "utm_campaign" character varying,
  "utm_content" character varying,
  "utm_term" character varying,
  "fbclid" character varying,
  "landing_url" character varying,
  "referrer" character varying,
  "captured_at" timestamp without time zone,
  "monthly_consumption" double precision,
  "avg_monthly_bill" numeric(10,2),
  "utility" character varying,
  "notes" text,
  "stage" leads_stage_enum DEFAULT 'new'::leads_stage_enum NOT NULL,
  "assigned_to" character varying,
  "value" numeric(10,2),
  "lost_reason" character varying,
  "created_by" character varying NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "meta_conversion_logs" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "lead_id" character varying NOT NULL,
  "event_name" character varying NOT NULL,
  "payload" jsonb NOT NULL,
  "status" character varying NOT NULL,
  "response" jsonb,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_d83bdc891f9da26c927fb2fd35d" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "proposal_events" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "proposal_id" uuid NOT NULL,
  "event_type" character varying NOT NULL,
  "duration_seconds" integer DEFAULT 0 NOT NULL,
  "user_agent" character varying,
  "ip_address" character varying,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_9b628caa7e25607d4e7196b32b7" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "proposal_tracking" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "proposal_id" uuid NOT NULL,
  "event_type" character varying(32) NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "ip_address" character varying(45),
  "user_agent" text,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_c31106bd33eecbdeba68c9f6516" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "proposals" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "public_token" character varying,
  "solar_project_id" uuid,
  "quote_id" uuid,
  "template_name" character varying DEFAULT 'default'::character varying NOT NULL,
  "settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "company_id" uuid,
  "client_name" character varying NOT NULL,
  "client_cep" character varying NOT NULL,
  "client_city" character varying NOT NULL,
  "utility" character varying,
  "tariff" double precision,
  "profile" character varying,
  "consumption_kwh" double precision NOT NULL,
  "system_power_kwp" double precision NOT NULL,
  "module_id" character varying,
  "inverter_id" character varying,
  "catalog_product_module_id" character varying,
  "catalog_product_inverter_id" character varying,
  "module_qty" integer NOT NULL,
  "cost_modules" numeric(10,2) NOT NULL,
  "cost_inverter" numeric(10,2) NOT NULL,
  "cost_labor" numeric(10,2) NOT NULL,
  "cost_structure" numeric(10,2) NOT NULL,
  "cost_travel" numeric(10,2) NOT NULL,
  "subtotal" numeric(10,2) NOT NULL,
  "margin_pct" numeric(5,2) NOT NULL,
  "margin_value" numeric(10,2) NOT NULL,
  "final_price" numeric(10,2) NOT NULL,
  "payback_years" double precision NOT NULL,
  "pdf_path" character varying,
  "lead_id" character varying,
  "stage" character varying,
  "expires_at" timestamp without time zone,
  "created_by" character varying NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_db524c8db8e126a38a2f16d8cac" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "quote_items" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "quote_id" uuid NOT NULL,
  "catalog_product_id" character varying,
  "product_type" character varying NOT NULL,
  "product_name" character varying,
  "product_brand" character varying,
  "product_model" character varying,
  "quantity" integer NOT NULL,
  "unit_price" numeric(10,2) NOT NULL,
  "total_price" numeric(12,2) NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_135ad3f02b5abcf65fb5cb20ad2" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "quotes" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "solar_project_id" uuid NOT NULL,
  "supplier_name" character varying,
  "supplier_contact" character varying,
  "supplier_phone" character varying,
  "supplier_email" character varying,
  "quote_number" character varying,
  "quote_date" date,
  "valid_until" date,
  "payment_condition" character varying,
  "pdf_path" character varying,
  "status" character varying DEFAULT 'draft'::character varying NOT NULL,
  "total_amount" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
  "shipping_cost" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
  "selected" boolean DEFAULT false NOT NULL,
  "notes" text,
  "created_by" character varying NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_99a0e8bcbcd8719d3a41f23c263" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "solar_project" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" uuid NOT NULL,
  "lead_id" character varying,
  "created_by" character varying NOT NULL,
  "updated_by" character varying,
  "status" character varying DEFAULT 'draft'::character varying NOT NULL,
  "client_name" character varying,
  "client_document" character varying,
  "client_phone" character varying,
  "client_email" character varying,
  "client_city" character varying,
  "client_state" character varying,
  "client_zipcode" character varying,
  "client_utility" character varying,
  "client_class" character varying,
  "client_tariff_group" character varying,
  "client_modality" character varying,
  "consultant_name" character varying,
  "site_address" character varying,
  "site_zipcode" character varying,
  "site_latitude" double precision,
  "site_longitude" double precision,
  "site_roof_type" character varying,
  "site_inclination" double precision,
  "site_azimuth" double precision,
  "site_photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "consumption_monthly_kwh" double precision,
  "consumption_monthly_bill" double precision,
  "consumption_tariff" double precision,
  "consumption_demand" double precision,
  "consumption_modality" character varying,
  "consumption_group" character varying,
  "consumption_invoices" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "sizing_power_kwp" double precision,
  "sizing_generation_kwh" double precision,
  "sizing_irradiation" double precision,
  "sizing_loss_factor" double precision,
  "sizing_module_qty" integer,
  "sizing_inverter_qty" integer,
  "sizing_observations" text,
  "equipment_modules" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "equipment_inverters" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "equipment_structures" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "equipment_cables" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "pricing_equipment_cost" double precision,
  "pricing_labor_cost" double precision,
  "pricing_project_cost" double precision,
  "pricing_freight_cost" double precision,
  "pricing_travel_cost" double precision,
  "pricing_commission" double precision,
  "pricing_taxes" double precision,
  "pricing_admin_cost" double precision,
  "pricing_margin_pct" double precision,
  "pricing_margin_value" double precision,
  "pricing_min_price" double precision,
  "pricing_final_price" double precision,
  "pricing_discount_pct" double precision,
  "pricing_art_cost" double precision,
  "pricing_installation_cost" double precision,
  "pricing_hotel_cost" double precision,
  "pricing_food_cost" double precision,
  "pricing_toll_cost" double precision,
  "pricing_crane_cost" double precision,
  "pricing_third_parties_cost" double precision,
  "pricing_other_cost" double precision,
  "pricing_total_cost" double precision,
  "pricing_profit" double precision,
  "pricing_recommended_price" double precision,
  "pricing_effective_margin_pct" double precision,
  "pricing_min_margin_pct" double precision,
  "pricing_recommended_margin_pct" double precision,
  "payment_cash_discount" double precision,
  "payment_card_tax" double precision,
  "payment_card_installments" integer,
  "payment_finance_tax" double precision,
  "payment_finance_installments" integer,
  "payment_validity_days" integer DEFAULT 10 NOT NULL,
  "client" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "consumption" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "site" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "sizing" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "equipment" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "pricing" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "payment" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "extra" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_e1b9191a2eeafe49ca7592394c7" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "lead_id" character varying,
  "title" character varying NOT NULL,
  "description" text,
  "type" tasks_type_enum DEFAULT 'other'::tasks_type_enum NOT NULL,
  "priority" tasks_priority_enum DEFAULT 'medium'::tasks_priority_enum NOT NULL,
  "status" tasks_status_enum DEFAULT 'pending'::tasks_status_enum NOT NULL,
  "assigned_to" character varying,
  "due_date" timestamp without time zone,
  "completed_at" timestamp without time zone,
  "created_by" character varying NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "name" character varying NOT NULL,
  "email" character varying NOT NULL,
  "password_hash" character varying NOT NULL,
  "role" users_role_enum DEFAULT 'seller'::users_role_enum NOT NULL,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "whatsapp_instances" (
  "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
  "company_id" character varying NOT NULL,
  "seller_id" character varying,
  "instance_name" character varying NOT NULL,
  "api_url" character varying NOT NULL,
  "api_key" character varying NOT NULL,
  "phone_number" character varying,
  "status" character varying DEFAULT 'disconnected'::character varying NOT NULL,
  "connected_at" timestamp without time zone,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone DEFAULT now() NOT NULL,
  CONSTRAINT "PK_d3b9435ee5b272bd0a1d47801e5" PRIMARY KEY (id)
);

-- Colunas ausentes em bancos antigos
ALTER TABLE "catalog_documents" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "catalog_documents" ADD COLUMN IF NOT EXISTS "product_id" uuid;
ALTER TABLE "catalog_documents" ADD COLUMN IF NOT EXISTS "type" character varying(32);
ALTER TABLE "catalog_documents" ADD COLUMN IF NOT EXISTS "name" character varying;
ALTER TABLE "catalog_documents" ADD COLUMN IF NOT EXISTS "description" character varying;
ALTER TABLE "catalog_documents" ADD COLUMN IF NOT EXISTS "file_url" character varying;
ALTER TABLE "catalog_documents" ADD COLUMN IF NOT EXISTS "file_type" character varying(16);
ALTER TABLE "catalog_documents" ADD COLUMN IF NOT EXISTS "language" character varying;
ALTER TABLE "catalog_documents" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true;
ALTER TABLE "catalog_documents" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "name" character varying;
ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "suggested_price" numeric(10,2);
ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "items" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "services" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true;
ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "created_by" character varying;
ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "catalog_kits" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "name" character varying;
ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "website" character varying;
ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "contact" character varying;
ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "email" character varying;
ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "phone" character varying;
ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "country" character varying;
ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true;
ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "catalog_manufacturers" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "category" character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "supplier_id" uuid;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "manufacturer_id" uuid;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "brand" character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "line" character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "model" character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "sku" character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "purchase_price" numeric(10,2);
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "suggested_price" numeric(10,2);
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "unit" character varying DEFAULT 'un'::character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "stock_quantity" numeric(10,2) DEFAULT '0'::numeric;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "min_stock" numeric(10,2) DEFAULT '0'::numeric;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "warranty_years" integer;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "specs" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "compatibility" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "tags" text[] DEFAULT '{}'::text[];
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "datasheetUrl" character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "manualUrl" character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "certificateUrl" character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "imageUrl" character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "priceHistory" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "created_by" character varying;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "name" character varying;
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "contact" character varying;
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "phone" character varying;
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "email" character varying;
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "city" character varying;
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "state" character varying;
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "avg_lead_time" integer;
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true;
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "catalog_suppliers" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "name" character varying;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "base_city" character varying;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "base_lat" double precision;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "base_lng" double precision;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "cost_per_km" numeric(10,2) DEFAULT '0'::numeric;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "default_margin" numeric(5,2) DEFAULT '0'::numeric;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "loss_factor" numeric(5,2) DEFAULT 0.8;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "card_tax" numeric(5,2) DEFAULT '15'::numeric;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "finance_tax" numeric(5,2) DEFAULT '20'::numeric;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "cash_discount" numeric(5,2) DEFAULT '5'::numeric;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "logo_url" character varying;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "meta_pixel_id" character varying;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "meta_access_token" character varying;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "meta_ad_account_id" character varying;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "meta_dataset_id" character varying;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "lead_id" character varying;
ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "proposal_id" character varying;
ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "trigger" character varying;
ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "seller_id" character varying;
ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "is_to_client" boolean DEFAULT false;
ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "status" character varying;
ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "sent_at" timestamp without time zone;
ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "error" text;
ALTER TABLE "follow_up_logs" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "follow_up_rules" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "follow_up_rules" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "follow_up_rules" ADD COLUMN IF NOT EXISTS "trigger" character varying;
ALTER TABLE "follow_up_rules" ADD COLUMN IF NOT EXISTS "message" text;
ALTER TABLE "follow_up_rules" ADD COLUMN IF NOT EXISTS "delay_minutes" integer DEFAULT 0;
ALTER TABLE "follow_up_rules" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true;
ALTER TABLE "follow_up_rules" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "follow_up_rules" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

ALTER TABLE "inventory_inverters" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "inventory_inverters" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "inventory_inverters" ADD COLUMN IF NOT EXISTS "brand" character varying;
ALTER TABLE "inventory_inverters" ADD COLUMN IF NOT EXISTS "model" character varying;
ALTER TABLE "inventory_inverters" ADD COLUMN IF NOT EXISTS "nominal_power_kw" numeric(5,2);
ALTER TABLE "inventory_inverters" ADD COLUMN IF NOT EXISTS "cost" numeric(10,2);
ALTER TABLE "inventory_inverters" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true;
ALTER TABLE "inventory_inverters" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "inventory_modules" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "inventory_modules" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "inventory_modules" ADD COLUMN IF NOT EXISTS "brand" character varying;
ALTER TABLE "inventory_modules" ADD COLUMN IF NOT EXISTS "model" character varying;
ALTER TABLE "inventory_modules" ADD COLUMN IF NOT EXISTS "power_watt" integer;
ALTER TABLE "inventory_modules" ADD COLUMN IF NOT EXISTS "cost" numeric(10,2);
ALTER TABLE "inventory_modules" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true;
ALTER TABLE "inventory_modules" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "lead_timeline" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "lead_timeline" ADD COLUMN IF NOT EXISTS "lead_id" character varying;
ALTER TABLE "lead_timeline" ADD COLUMN IF NOT EXISTS "type" lead_timeline_type_enum;
ALTER TABLE "lead_timeline" ADD COLUMN IF NOT EXISTS "content" text;
ALTER TABLE "lead_timeline" ADD COLUMN IF NOT EXISTS "metadata" jsonb;
ALTER TABLE "lead_timeline" ADD COLUMN IF NOT EXISTS "created_by" character varying;
ALTER TABLE "lead_timeline" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "name" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "company_name" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "document" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "phone" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "whatsapp" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "email" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "city" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "state" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "address" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "zipcode" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "client_type" leads_client_type_enum DEFAULT 'residential'::leads_client_type_enum;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "source" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_source" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_medium" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_campaign" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_content" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utm_term" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "fbclid" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "landing_url" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "referrer" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "captured_at" timestamp without time zone;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "monthly_consumption" double precision;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "avg_monthly_bill" numeric(10,2);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "utility" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "stage" leads_stage_enum DEFAULT 'new'::leads_stage_enum;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "assigned_to" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "value" numeric(10,2);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "lost_reason" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "created_by" character varying;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

ALTER TABLE "meta_conversion_logs" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "meta_conversion_logs" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "meta_conversion_logs" ADD COLUMN IF NOT EXISTS "lead_id" character varying;
ALTER TABLE "meta_conversion_logs" ADD COLUMN IF NOT EXISTS "event_name" character varying;
ALTER TABLE "meta_conversion_logs" ADD COLUMN IF NOT EXISTS "payload" jsonb;
ALTER TABLE "meta_conversion_logs" ADD COLUMN IF NOT EXISTS "status" character varying;
ALTER TABLE "meta_conversion_logs" ADD COLUMN IF NOT EXISTS "response" jsonb;
ALTER TABLE "meta_conversion_logs" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "proposal_events" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "proposal_events" ADD COLUMN IF NOT EXISTS "proposal_id" uuid;
ALTER TABLE "proposal_events" ADD COLUMN IF NOT EXISTS "event_type" character varying;
ALTER TABLE "proposal_events" ADD COLUMN IF NOT EXISTS "duration_seconds" integer DEFAULT 0;
ALTER TABLE "proposal_events" ADD COLUMN IF NOT EXISTS "user_agent" character varying;
ALTER TABLE "proposal_events" ADD COLUMN IF NOT EXISTS "ip_address" character varying;
ALTER TABLE "proposal_events" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "proposal_tracking" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "proposal_tracking" ADD COLUMN IF NOT EXISTS "proposal_id" uuid;
ALTER TABLE "proposal_tracking" ADD COLUMN IF NOT EXISTS "event_type" character varying(32);
ALTER TABLE "proposal_tracking" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "proposal_tracking" ADD COLUMN IF NOT EXISTS "ip_address" character varying(45);
ALTER TABLE "proposal_tracking" ADD COLUMN IF NOT EXISTS "user_agent" text;
ALTER TABLE "proposal_tracking" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "public_token" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "solar_project_id" uuid;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "quote_id" uuid;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "template_name" character varying DEFAULT 'default'::character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "settings" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "client_name" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "client_cep" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "client_city" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "utility" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "tariff" double precision;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "profile" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "consumption_kwh" double precision;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "system_power_kwp" double precision;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "module_id" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "inverter_id" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "catalog_product_module_id" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "catalog_product_inverter_id" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "module_qty" integer;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "cost_modules" numeric(10,2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "cost_inverter" numeric(10,2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "cost_labor" numeric(10,2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "cost_structure" numeric(10,2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "cost_travel" numeric(10,2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "subtotal" numeric(10,2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "margin_pct" numeric(5,2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "margin_value" numeric(10,2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "final_price" numeric(10,2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "payback_years" double precision;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "pdf_path" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "lead_id" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "stage" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "expires_at" timestamp without time zone;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "created_by" character varying;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "quote_id" uuid;
ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "catalog_product_id" character varying;
ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "product_type" character varying;
ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "product_name" character varying;
ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "product_brand" character varying;
ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "product_model" character varying;
ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "quantity" integer;
ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "unit_price" numeric(10,2);
ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "total_price" numeric(12,2);
ALTER TABLE "quote_items" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "solar_project_id" uuid;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "supplier_name" character varying;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "supplier_contact" character varying;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "supplier_phone" character varying;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "supplier_email" character varying;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "quote_number" character varying;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "quote_date" date;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "valid_until" date;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "payment_condition" character varying;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "pdf_path" character varying;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "status" character varying DEFAULT 'draft'::character varying;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "total_amount" numeric(12,2) DEFAULT '0'::numeric;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "shipping_cost" numeric(10,2) DEFAULT '0'::numeric;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "selected" boolean DEFAULT false;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "created_by" character varying;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "lead_id" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "created_by" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "updated_by" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "status" character varying DEFAULT 'draft'::character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_name" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_document" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_phone" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_email" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_city" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_state" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_zipcode" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_utility" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_class" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_tariff_group" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client_modality" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "consultant_name" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "site_address" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "site_zipcode" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "site_latitude" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "site_longitude" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "site_roof_type" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "site_inclination" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "site_azimuth" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "site_photos" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "consumption_monthly_kwh" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "consumption_monthly_bill" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "consumption_tariff" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "consumption_demand" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "consumption_modality" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "consumption_group" character varying;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "consumption_invoices" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "sizing_power_kwp" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "sizing_generation_kwh" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "sizing_irradiation" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "sizing_loss_factor" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "sizing_module_qty" integer;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "sizing_inverter_qty" integer;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "sizing_observations" text;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "equipment_modules" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "equipment_inverters" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "equipment_structures" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "equipment_cables" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_equipment_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_labor_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_project_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_freight_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_travel_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_commission" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_taxes" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_admin_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_margin_pct" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_margin_value" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_min_price" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_final_price" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_discount_pct" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_art_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_installation_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_hotel_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_food_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_toll_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_crane_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_third_parties_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_other_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_total_cost" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_profit" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_recommended_price" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_effective_margin_pct" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_min_margin_pct" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing_recommended_margin_pct" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "payment_cash_discount" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "payment_card_tax" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "payment_card_installments" integer;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "payment_finance_tax" double precision;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "payment_finance_installments" integer;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "payment_validity_days" integer DEFAULT 10;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "client" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "consumption" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "site" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "sizing" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "equipment" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "pricing" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "payment" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "extra" jsonb DEFAULT '{}'::jsonb;
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "lead_id" character varying;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "title" character varying;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "type" tasks_type_enum DEFAULT 'other'::tasks_type_enum;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "priority" tasks_priority_enum DEFAULT 'medium'::tasks_priority_enum;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "status" tasks_status_enum DEFAULT 'pending'::tasks_status_enum;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "assigned_to" character varying;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "due_date" timestamp without time zone;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "completed_at" timestamp without time zone;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "created_by" character varying;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" character varying;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" character varying;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" character varying;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" users_role_enum DEFAULT 'seller'::users_role_enum;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();

ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT uuid_generate_v4();
ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "company_id" character varying;
ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "seller_id" character varying;
ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "instance_name" character varying;
ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "api_url" character varying;
ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "api_key" character varying;
ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "phone_number" character varying;
ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "status" character varying DEFAULT 'disconnected'::character varying;
ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "connected_at" timestamp without time zone;
ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "created_at" timestamp without time zone DEFAULT now();
ALTER TABLE "whatsapp_instances" ADD COLUMN IF NOT EXISTS "updated_at" timestamp without time zone DEFAULT now();

-- Toda proposta precisa de link público próprio
UPDATE "proposals" SET "public_token" = replace(gen_random_uuid()::text, '-', '') WHERE "public_token" IS NULL;

-- Restrições
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_239b8f9b3037ddf6e01de72358e') THEN
    ALTER TABLE "proposals" ADD CONSTRAINT "UQ_239b8f9b3037ddf6e01de72358e" UNIQUE (public_token);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_97672ac88f789774dd47f7c8be3') THEN
    ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_15860063002b48cb78078623b48') THEN
    ALTER TABLE "catalog_products" ADD CONSTRAINT "FK_15860063002b48cb78078623b48" FOREIGN KEY (manufacturer_id) REFERENCES catalog_manufacturers(id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_2a1ee7a8519e3f6ed255307ce6a') THEN
    ALTER TABLE "solar_project" ADD CONSTRAINT "FK_2a1ee7a8519e3f6ed255307ce6a" FOREIGN KEY (company_id) REFERENCES companies(id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_76549e2c5b36c0e4d644bf97cb6') THEN
    ALTER TABLE "catalog_products" ADD CONSTRAINT "FK_76549e2c5b36c0e4d644bf97cb6" FOREIGN KEY (company_id) REFERENCES companies(id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_8ced672f456b4549ff9e0088fa6') THEN
    ALTER TABLE "quotes" ADD CONSTRAINT "FK_8ced672f456b4549ff9e0088fa6" FOREIGN KEY (solar_project_id) REFERENCES solar_project(id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_93bcffc0a655a2af301c54b3552') THEN
    ALTER TABLE "proposals" ADD CONSTRAINT "FK_93bcffc0a655a2af301c54b3552" FOREIGN KEY (solar_project_id) REFERENCES solar_project(id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_9cd53db2089209b85ff5d5958d8') THEN
    ALTER TABLE "catalog_products" ADD CONSTRAINT "FK_9cd53db2089209b85ff5d5958d8" FOREIGN KEY (supplier_id) REFERENCES catalog_suppliers(id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_9df9cdd88883207745a1181bd5f') THEN
    ALTER TABLE "catalog_documents" ADD CONSTRAINT "FK_9df9cdd88883207745a1181bd5f" FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_a718de2e5d7a7d9f7caa73f6449') THEN
    ALTER TABLE "proposals" ADD CONSTRAINT "FK_a718de2e5d7a7d9f7caa73f6449" FOREIGN KEY (quote_id) REFERENCES quotes(id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_abccf2b6257e334690d894d7069') THEN
    ALTER TABLE "proposals" ADD CONSTRAINT "FK_abccf2b6257e334690d894d7069" FOREIGN KEY (company_id) REFERENCES companies(id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_b035899a620776bde95930af5fb') THEN
    ALTER TABLE "proposal_tracking" ADD CONSTRAINT "FK_b035899a620776bde95930af5fb" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_c11d594b8cf436caaee20122fd8') THEN
    ALTER TABLE "quote_items" ADD CONSTRAINT "FK_c11d594b8cf436caaee20122fd8" FOREIGN KEY (quote_id) REFERENCES quotes(id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_dc07b732261225ae97d95b8227f') THEN
    ALTER TABLE "proposal_events" ADD CONSTRAINT "FK_dc07b732261225ae97d95b8227f" FOREIGN KEY (proposal_id) REFERENCES proposals(id);
  END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS "IDX_23b2ba60e0a9bfc02c05c4c0d3" ON public.proposal_tracking USING btree (proposal_id, event_type);

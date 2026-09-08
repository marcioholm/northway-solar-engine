-- Feature 1: WhatsApp Automation
CREATE TABLE "whatsapp_instances" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "company_id" uuid NOT NULL,
  "seller_id" uuid,
  "instance_name" character varying NOT NULL,
  "api_url" character varying NOT NULL,
  "api_key" character varying NOT NULL,
  "phone_number" character varying,
  "status" character varying NOT NULL DEFAULT 'disconnected',
  "connected_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_whatsapp_instances" PRIMARY KEY ("id")
);

CREATE TABLE "follow_up_rules" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "company_id" uuid NOT NULL,
  "trigger" character varying NOT NULL,
  "message" text NOT NULL,
  "delay_minutes" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_follow_up_rules" PRIMARY KEY ("id")
);

CREATE TABLE "follow_up_logs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "company_id" uuid NOT NULL,
  "lead_id" uuid NOT NULL,
  "proposal_id" uuid,
  "trigger" character varying NOT NULL,
  "seller_id" uuid,
  "is_to_client" boolean NOT NULL DEFAULT false,
  "status" character varying NOT NULL,
  "sent_at" TIMESTAMP,
  "error" text,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_follow_up_logs" PRIMARY KEY ("id")
);

-- Feature 2: Meta Ads Conversions
ALTER TABLE "leads" ADD COLUMN "utm_source" character varying;
ALTER TABLE "leads" ADD COLUMN "utm_medium" character varying;
ALTER TABLE "leads" ADD COLUMN "utm_campaign" character varying;
ALTER TABLE "leads" ADD COLUMN "utm_content" character varying;
ALTER TABLE "leads" ADD COLUMN "utm_term" character varying;
ALTER TABLE "leads" ADD COLUMN "fbclid" character varying;
ALTER TABLE "leads" ADD COLUMN "landing_url" character varying;
ALTER TABLE "leads" ADD COLUMN "referrer" character varying;
ALTER TABLE "leads" ADD COLUMN "captured_at" TIMESTAMP;

CREATE TABLE "meta_conversion_logs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "company_id" uuid NOT NULL,
  "lead_id" uuid NOT NULL,
  "event_name" character varying NOT NULL,
  "payload" jsonb NOT NULL,
  "status" character varying NOT NULL,
  "response" jsonb,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_meta_conversion_logs" PRIMARY KEY ("id")
);

-- Feature 3: Urgency / Expiration
ALTER TABLE "proposals" ADD COLUMN "expires_at" TIMESTAMP;

-- Default FollowUp Rules for all existing companies
INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
SELECT DISTINCT "company_id", 'hot_lead', '🔥 {nome_cliente} acabou de revisar o preço da proposta. Bom momento pra ligar!', 0, true
FROM "companies";

INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
SELECT DISTINCT "company_id", 'very_interested', '👀 {nome_cliente} já abriu a proposta várias vezes. Tá comparando — liga antes que feche com outro.', 0, true
FROM "companies";

INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
SELECT DISTINCT "company_id", 'going_cold', '⏰ {nome_cliente} não abriu a proposta há dias. Hora de um follow-up.', 14400, true
FROM "companies";

INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
SELECT DISTINCT "company_id", 'opened_no_action', '📋 {nome_cliente} abriu a proposta rapidamente. Pode ter dúvidas.', 30, true
FROM "companies";

INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
SELECT DISTINCT "company_id", 'expiring_soon_seller', '⚠️ A proposta do {nome_cliente} vence em 3 dias. Se ele não respondeu, é hora de fazer contato.', 0, true
FROM "companies";

INSERT INTO "follow_up_rules" ("company_id", "trigger", "message", "delay_minutes", "is_active")
SELECT DISTINCT "company_id", 'expired_seller', '❌ A proposta do {nome_cliente} venceu. Quer gerar uma proposta atualizada?', 0, true
FROM "companies";

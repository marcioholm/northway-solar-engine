-- Migration 108: Gestão de Equipe, Perfis (Manager), Limite por Plano e Vínculo de Dono
-- Idempotente. DEVE ser aplicada em produção após o merge (com backup prévio).

-- 1. Adicionar 'manager' ao enum de perfil de usuário
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
    ALTER TYPE "users_role_enum" ADD VALUE IF NOT EXISTS 'manager';
  END IF;
END $$;

-- 2. Colunas em users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" VARCHAR NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMPTZ NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deactivated_at" TIMESTAMPTZ NULL;

-- 3. Colunas em companies (planos e limites)
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "plan" VARCHAR DEFAULT 'basic' NOT NULL;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "max_users" INT NULL;

-- 4. Tabela de convites e recuperação de senha
CREATE TABLE IF NOT EXISTS "user_invites" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" UUID NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "email" VARCHAR NOT NULL,
  "name" VARCHAR NULL,
  "phone" VARCHAR NULL,
  "role" users_role_enum NOT NULL,
  "token_hash" VARCHAR NOT NULL,
  "type" VARCHAR NOT NULL DEFAULT 'invite',
  "expires_at" TIMESTAMPTZ NOT NULL,
  "used_at" TIMESTAMPTZ NULL,
  "created_by" UUID NULL REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_user_invites_token_hash" ON "user_invites"("token_hash");
CREATE INDEX IF NOT EXISTS "idx_user_invites_company_id" ON "user_invites"("company_id");

-- RLS para user_invites (acesso somente pelo backend)
ALTER TABLE "user_invites" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON "user_invites" FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON "user_invites" FROM authenticated;
  END IF;
END $$;

-- 5. Dono em solar_project e proposals
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solar_project') THEN
    ALTER TABLE "solar_project" ADD COLUMN IF NOT EXISTS "owner_user_id" UUID NULL REFERENCES "users"("id") ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS "idx_solar_project_owner_user_id" ON "solar_project"("owner_user_id");
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solar_projects') THEN
    ALTER TABLE "solar_projects" ADD COLUMN IF NOT EXISTS "owner_user_id" UUID NULL REFERENCES "users"("id") ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS "idx_solar_projects_owner_user_id" ON "solar_projects"("owner_user_id");
  END IF;
END $$;

ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "owner_user_id" UUID NULL REFERENCES "users"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "idx_proposals_owner_user_id" ON "proposals"("owner_user_id");

-- 6. Backfill de owner_user_id a partir de leads.assigned_to
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solar_project') THEN
    UPDATE "solar_project" sp
    SET "owner_user_id" = l.assigned_to::uuid
    FROM "leads" l
    WHERE (sp.lead_id = l.id::text OR sp.lead_id = l.id::varchar)
      AND l.assigned_to IS NOT NULL
      AND l.assigned_to ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND sp.owner_user_id IS NULL;
  END IF;
END $$;

UPDATE "proposals" p
SET "owner_user_id" = l.assigned_to::uuid
FROM "leads" l
WHERE (p.lead_id = l.id::text OR p.lead_id = l.id::varchar)
  AND l.assigned_to IS NOT NULL
  AND l.assigned_to ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND p.owner_user_id IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solar_project') THEN
    UPDATE "proposals" p
    SET "owner_user_id" = sp.owner_user_id
    FROM "solar_project" sp
    WHERE p.solar_project_id = sp.id
      AND sp.owner_user_id IS NOT NULL
      AND p.owner_user_id IS NULL;
  END IF;
END $$;

-- Migration 008: Extend catalog for technical library
CREATE TABLE IF NOT EXISTS catalog_manufacturers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    name varchar(255) NOT NULL,
    website varchar(512),
    contact varchar(255),
    email varchar(255),
    phone varchar(64),
    country varchar(128),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
    type varchar(32) NOT NULL,
    name varchar(255) NOT NULL,
    description text,
    file_url text NOT NULL,
    file_type varchar(16),
    language varchar(8),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE catalog_products
  ADD COLUMN IF NOT EXISTS manufacturer_id uuid REFERENCES catalog_manufacturers(id),
  ADD COLUMN IF NOT EXISTS stock_quantity decimal(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_stock decimal(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS warranty_years int;

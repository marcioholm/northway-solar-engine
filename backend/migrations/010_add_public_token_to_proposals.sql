-- Migration 010: Add public_token to proposals
-- Adds a unique token for public sharing of proposals.

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS public_token VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_proposals_public_token ON proposals (public_token);

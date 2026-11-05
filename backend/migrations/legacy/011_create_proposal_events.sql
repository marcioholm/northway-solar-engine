-- Migration 011: Create proposal_events table for tracking analytics

CREATE TABLE IF NOT EXISTS proposal_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  event_type VARCHAR(255) NOT NULL,
  duration_seconds INT DEFAULT 0,
  user_agent TEXT,
  ip_address VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_proposal_events_proposal_id ON proposal_events (proposal_id);

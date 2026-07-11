-- Migration 006: Create proposal_tracking table
CREATE TABLE IF NOT EXISTS proposal_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    event_type varchar(32) NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}',
    ip_address varchar(45),
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_tracking_proposal_event
    ON proposal_tracking (proposal_id, event_type);

CREATE INDEX IF NOT EXISTS idx_proposal_tracking_created
    ON proposal_tracking (proposal_id, created_at);

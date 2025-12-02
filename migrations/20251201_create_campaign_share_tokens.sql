-- Create campaign_share_tokens table for public campaign dashboard sharing
CREATE TABLE IF NOT EXISTS campaign_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  share_token VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT unique_campaign_share_token UNIQUE(share_token)
);

-- Create indexes for fast lookups
CREATE INDEX idx_campaign_share_tokens_campaign_id ON campaign_share_tokens(campaign_id);
CREATE INDEX idx_campaign_share_tokens_share_token ON campaign_share_tokens(share_token);

-- Add comment
COMMENT ON TABLE campaign_share_tokens IS 'Permanent share tokens for public campaign dashboard access';

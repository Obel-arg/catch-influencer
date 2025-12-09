-- Create campaign_favorites junction table for many-to-many relationship between users and campaigns
-- This enables per-user favorite campaigns that persist across sessions and always appear at top of list

CREATE TABLE IF NOT EXISTS campaign_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate favorites
  CONSTRAINT unique_user_campaign_favorite UNIQUE (user_id, campaign_id)
);

-- Indexes for performance optimization
CREATE INDEX idx_campaign_favorites_user_id ON campaign_favorites(user_id);
CREATE INDEX idx_campaign_favorites_campaign_id ON campaign_favorites(campaign_id);
CREATE INDEX idx_campaign_favorites_user_campaign ON campaign_favorites(user_id, campaign_id);

-- Add comment for documentation
COMMENT ON TABLE campaign_favorites IS 'Stores user favorite campaigns. Favorites always appear at top of campaign list regardless of other sorting.';

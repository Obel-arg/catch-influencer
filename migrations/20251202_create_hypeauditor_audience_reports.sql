-- Create HypeAuditor Audience Reports table
-- This table stores real HypeAuditor reports for accurate audience inference

CREATE TABLE IF NOT EXISTS hypeauditor_audience_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Influencer Reference
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  influencer_username VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube')),

  -- Report Data (complete HypeAuditor API response)
  full_report JSONB NOT NULL,

  -- Extracted Demographics (indexed for fast queries)
  audience_demographics JSONB NOT NULL,
  audience_geography JSONB NOT NULL,
  audience_interests JSONB,
  audience_languages JSONB,

  -- Influencer Characteristics (for matching similar influencers)
  follower_count INTEGER,
  engagement_rate FLOAT,
  influencer_niche VARCHAR(255),
  influencer_gender VARCHAR(50),
  influencer_location VARCHAR(255),

  -- Metadata
  report_quality VARCHAR(50),
  authenticity_score INTEGER,
  collected_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  api_cost INTEGER DEFAULT 1,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  UNIQUE(influencer_id, platform)
);

-- Indexes for fast queries
CREATE INDEX idx_ha_reports_follower_range ON hypeauditor_audience_reports USING btree(follower_count);
CREATE INDEX idx_ha_reports_niche ON hypeauditor_audience_reports(influencer_niche);
CREATE INDEX idx_ha_reports_platform ON hypeauditor_audience_reports(platform);
CREATE INDEX idx_ha_reports_collected ON hypeauditor_audience_reports(collected_at DESC);
CREATE INDEX idx_ha_reports_demographics ON hypeauditor_audience_reports USING gin(audience_demographics);

-- Add API usage tracking to organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS hypeauditor_queries_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hypeauditor_queries_limit INTEGER DEFAULT 500,
ADD COLUMN IF NOT EXISTS hypeauditor_last_reset TIMESTAMP;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ha_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_ha_reports_updated_at_trigger
    BEFORE UPDATE ON hypeauditor_audience_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_ha_reports_updated_at();

-- Comment on table
COMMENT ON TABLE hypeauditor_audience_reports IS 'Stores real HypeAuditor audience reports for accurate demographic inference';
COMMENT ON COLUMN hypeauditor_audience_reports.full_report IS 'Complete HypeAuditor API response (raw JSON)';
COMMENT ON COLUMN hypeauditor_audience_reports.audience_demographics IS 'Extracted demographics: { age: {...}, gender: {...} }';
COMMENT ON COLUMN hypeauditor_audience_reports.audience_geography IS 'Country distribution: { "United States": 36.28, ... }';
COMMENT ON COLUMN hypeauditor_audience_reports.api_cost IS 'Number of HypeAuditor API queries consumed for this report';

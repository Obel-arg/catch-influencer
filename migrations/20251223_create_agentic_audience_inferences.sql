-- Create Agentic Audience Inferences table
-- This table stores agentic AI-inferred audience demographics with 90-day cache TTL
-- Based on openai_audience_inferences but for agentic AI analysis

CREATE TABLE IF NOT EXISTS agentic_audience_inferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Influencer Reference
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  instagram_url VARCHAR(500) NOT NULL,
  instagram_username VARCHAR(255) NOT NULL,

  -- Inferred Demographics (matching existing format)
  audience_demographics JSONB NOT NULL,
  audience_geography JSONB NOT NULL,

  -- Metadata
  model_used VARCHAR(50) NOT NULL DEFAULT 'agent-audience',
  profile_data_snapshot JSONB, -- Store scraped Instagram data

  -- Search Context (from migration 20251208)
  search_context JSONB,
  creator_location VARCHAR(10),
  target_audience_geo JSONB,

  -- Caching & Expiration
  inferred_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,

  -- Cost Tracking
  api_cost NUMERIC(10, 4) DEFAULT 0.05,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  UNIQUE(instagram_url),
  UNIQUE(influencer_id)
);

-- Indexes for fast queries
CREATE INDEX idx_agentic_inferences_username ON agentic_audience_inferences(instagram_username);
CREATE INDEX idx_agentic_inferences_expires ON agentic_audience_inferences(expires_at);
CREATE INDEX idx_agentic_inferences_influencer_id ON agentic_audience_inferences(influencer_id);
CREATE INDEX idx_agentic_inferences_inferred_at ON agentic_audience_inferences(inferred_at DESC);
CREATE INDEX idx_agentic_inferences_demographics ON agentic_audience_inferences USING gin(audience_demographics);
CREATE INDEX idx_agentic_inferences_creator_location ON agentic_audience_inferences(creator_location);
CREATE INDEX idx_agentic_inferences_search_context ON agentic_audience_inferences USING gin(search_context);

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_agentic_inferences_updated_at_trigger
    BEFORE UPDATE ON agentic_audience_inferences
    FOR EACH ROW
    EXECUTE FUNCTION update_ha_reports_updated_at();

-- Comment on table
COMMENT ON TABLE agentic_audience_inferences IS 'Stores agentic AI-inferred audience demographics with 90-day cache expiration';
COMMENT ON COLUMN agentic_audience_inferences.audience_demographics IS 'Inferred demographics: { age: {...}, gender: {...}, is_synthetic: false }';
COMMENT ON COLUMN agentic_audience_inferences.audience_geography IS 'Country distribution: [{ country: "...", country_code: "...", percentage: ... }]';
COMMENT ON COLUMN agentic_audience_inferences.profile_data_snapshot IS 'Snapshot of Instagram profile data used for inference';
COMMENT ON COLUMN agentic_audience_inferences.search_context IS 'Search context used for this inference';
COMMENT ON COLUMN agentic_audience_inferences.creator_location IS 'ISO country code of the creator location';
COMMENT ON COLUMN agentic_audience_inferences.target_audience_geo IS 'Target audience geography preferences';
COMMENT ON COLUMN agentic_audience_inferences.expires_at IS 'Cache expiration timestamp (90 days from inferred_at by default)';
COMMENT ON COLUMN agentic_audience_inferences.api_cost IS 'AI API cost in USD for this inference';

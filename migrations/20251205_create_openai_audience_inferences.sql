-- Create OpenAI Audience Inferences table
-- This table stores OpenAI-inferred audience demographics with 90-day cache TTL

CREATE TABLE IF NOT EXISTS openai_audience_inferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Influencer Reference
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  instagram_url VARCHAR(500) NOT NULL,
  instagram_username VARCHAR(255) NOT NULL,

  -- Inferred Demographics (matching existing format)
  audience_demographics JSONB NOT NULL,
  audience_geography JSONB NOT NULL,

  -- Metadata
  model_used VARCHAR(50) NOT NULL DEFAULT 'gpt-4o',
  profile_data_snapshot JSONB, -- Store scraped Instagram data

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
CREATE INDEX idx_openai_inferences_username ON openai_audience_inferences(instagram_username);
CREATE INDEX idx_openai_inferences_expires ON openai_audience_inferences(expires_at);
CREATE INDEX idx_openai_inferences_influencer_id ON openai_audience_inferences(influencer_id);
CREATE INDEX idx_openai_inferences_inferred_at ON openai_audience_inferences(inferred_at DESC);
CREATE INDEX idx_openai_inferences_demographics ON openai_audience_inferences USING gin(audience_demographics);

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_openai_inferences_updated_at_trigger
    BEFORE UPDATE ON openai_audience_inferences
    FOR EACH ROW
    EXECUTE FUNCTION update_ha_reports_updated_at();

-- Comment on table
COMMENT ON TABLE openai_audience_inferences IS 'Stores OpenAI-inferred audience demographics with 90-day cache expiration';
COMMENT ON COLUMN openai_audience_inferences.audience_demographics IS 'Inferred demographics: { age: {...}, gender: {...}, is_synthetic: false }';
COMMENT ON COLUMN openai_audience_inferences.audience_geography IS 'Country distribution: [{ country: "...", country_code: "...", percentage: ... }]';
COMMENT ON COLUMN openai_audience_inferences.profile_data_snapshot IS 'Snapshot of Instagram profile data used for inference';
COMMENT ON COLUMN openai_audience_inferences.expires_at IS 'Cache expiration timestamp (90 days from inferred_at by default)';
COMMENT ON COLUMN openai_audience_inferences.api_cost IS 'OpenAI API cost in USD for this inference';

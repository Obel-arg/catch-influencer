-- Add search context columns to OpenAI Audience Inferences table
-- This enables context-aware caching: same profile + different search context = different cache entry

-- Add new columns for search context
ALTER TABLE openai_audience_inferences
  ADD COLUMN search_context JSONB,
  ADD COLUMN creator_location VARCHAR(100),
  ADD COLUMN target_audience_geo JSONB;

-- Drop old unique constraint on instagram_url only
-- (We need to allow same URL with different search contexts)
ALTER TABLE openai_audience_inferences
  DROP CONSTRAINT IF EXISTS openai_audience_inferences_instagram_url_key;

-- Keep the influencer_id unique constraint
-- (One inference per influencer is fine for now)
-- Note: The openai_audience_inferences_influencer_id_key already exists

-- Add composite unique constraint: URL + search context
-- This prevents duplicate entries for same URL+context combination
CREATE UNIQUE INDEX idx_openai_inferences_unique_context
  ON openai_audience_inferences (
    instagram_url,
    COALESCE(creator_location, ''),
    COALESCE(search_context::text, '{}')
  );

-- Add GIN index for fast JSON queries on search context
CREATE INDEX idx_openai_inferences_search_context
  ON openai_audience_inferences USING gin(search_context);

-- Add comments to document the new columns
COMMENT ON COLUMN openai_audience_inferences.search_context IS 'Full search context from Explorer: { creator_location, target_audience_geo }';
COMMENT ON COLUMN openai_audience_inferences.creator_location IS 'Creator location filter from search (country code, e.g., "AR", "MX")';
COMMENT ON COLUMN openai_audience_inferences.target_audience_geo IS 'Target audience geography from search filters: { countries: [{ id, prc }], cities: [{ id, prc }] }';

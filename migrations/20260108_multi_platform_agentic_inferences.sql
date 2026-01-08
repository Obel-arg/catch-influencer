-- Multi-platform support for agentic audience inferences
-- Adds platform column and renames instagram-specific columns to generic names
-- Updates constraints to support multiple platforms per influencer

-- Step 1: Add platform column (nullable initially for migration)
ALTER TABLE agentic_audience_inferences 
ADD COLUMN platform VARCHAR(50);

-- Step 2: Set default platform for existing rows (all existing rows are Instagram)
UPDATE agentic_audience_inferences 
SET platform = 'instagram' 
WHERE platform IS NULL;

-- Step 3: Make platform NOT NULL now that we've set defaults
ALTER TABLE agentic_audience_inferences 
ALTER COLUMN platform SET NOT NULL;

-- Step 4: Drop old unique constraints
ALTER TABLE agentic_audience_inferences 
DROP CONSTRAINT IF EXISTS agentic_audience_inferences_instagram_url_key;

ALTER TABLE agentic_audience_inferences 
DROP CONSTRAINT IF EXISTS agentic_audience_inferences_influencer_id_key;

-- Step 5: Rename columns
ALTER TABLE agentic_audience_inferences 
RENAME COLUMN instagram_url TO url;

ALTER TABLE agentic_audience_inferences 
RENAME COLUMN instagram_username TO username;

-- Step 6: Add new composite unique constraint (url, platform)
ALTER TABLE agentic_audience_inferences 
ADD CONSTRAINT agentic_audience_inferences_url_platform_unique 
UNIQUE(url, platform);

-- Step 7: Drop old indexes that reference old column names
DROP INDEX IF EXISTS idx_agentic_inferences_username;

-- Step 8: Create new indexes with updated column names
CREATE INDEX idx_agentic_inferences_username ON agentic_audience_inferences(username);
CREATE INDEX idx_agentic_inferences_platform ON agentic_audience_inferences(platform);
CREATE INDEX idx_agentic_inferences_url_platform ON agentic_audience_inferences(url, platform);

-- Step 9: Update comments
COMMENT ON COLUMN agentic_audience_inferences.platform IS 'Social media platform: instagram, youtube, tiktok, twitter, twitch, threads';
COMMENT ON COLUMN agentic_audience_inferences.url IS 'Profile URL for the social media platform';
COMMENT ON COLUMN agentic_audience_inferences.username IS 'Username/handle for the social media platform';
COMMENT ON COLUMN agentic_audience_inferences.profile_data_snapshot IS 'Snapshot of profile data used for inference (platform-agnostic)';

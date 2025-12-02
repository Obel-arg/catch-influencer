-- Migration: add_content_type_and_story_metrics
-- Date: 2025-12-01
-- Description: Add content_type, views_count, and impressions_count columns to support Instagram Stories

-- Add content_type column
ALTER TABLE influencer_posts
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'post';

-- Add views_count if not exists (for story impressions)
ALTER TABLE influencer_posts
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Add impressions_count specifically for stories
ALTER TABLE influencer_posts
ADD COLUMN IF NOT EXISTS impressions_count INTEGER DEFAULT 0;

-- Create index for filtering by content_type
CREATE INDEX IF NOT EXISTS idx_influencer_posts_content_type
ON influencer_posts(content_type);
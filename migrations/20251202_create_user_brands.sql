-- Create user_brands junction table for many-to-many relationship between users and brands
-- This enables brand-based access control where users can only see campaigns from assigned brands

CREATE TABLE IF NOT EXISTS user_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate assignments
  CONSTRAINT unique_user_brand UNIQUE (user_id, brand_id)
);

-- Indexes for performance optimization
CREATE INDEX idx_user_brands_user_id ON user_brands(user_id);
CREATE INDEX idx_user_brands_brand_id ON user_brands(brand_id);
CREATE INDEX idx_user_brands_organization_id ON user_brands(organization_id);
CREATE INDEX idx_user_brands_user_org ON user_brands(user_id, organization_id);

-- Add comment
COMMENT ON TABLE user_brands IS 'Links users to brands for campaign access control. Members and viewers only see campaigns from their assigned brands.';

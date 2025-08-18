export interface Influencer {
  id: string;
  name: string;
  username: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'other';
  profile_url: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count?: number;
  posts_count?: number;
  engagement_rate?: number;
  average_likes?: number;
  average_comments?: number;
  average_views?: number;
  location?: string;
  language?: string;
  category?: string[];
  tags?: string[];
  contact_email?: string;
  contact_phone?: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  verification_status: 'verified' | 'unverified' | 'pending';
  metadata?: {
    last_updated?: Date;
    last_post_date?: Date;
    content_categories?: string[];
    audience_demographics?: {
      age_range?: string[];
      gender?: string[];
      location?: string[];
      interests?: string[];
    };
    brand_collaborations?: {
      count?: number;
      categories?: string[];
      average_rate?: number;
    };
  };
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface InfluencerCreateDTO {
  name: string;
  username: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'other';
  profile_url: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count?: number;
  posts_count?: number;
  engagement_rate?: number;
  average_likes?: number;
  average_comments?: number;
  average_views?: number;
  location?: string;
  language?: string;
  category?: string[];
  tags?: string[];
  contact_email?: string;
  contact_phone?: string;
  metadata?: {
    content_categories?: string[];
    audience_demographics?: {
      age_range?: string[];
      gender?: string[];
      location?: string[];
      interests?: string[];
    };
    brand_collaborations?: {
      count?: number;
      categories?: string[];
      average_rate?: number;
    };
  };
}

export interface InfluencerUpdateDTO extends Partial<InfluencerCreateDTO> {
  status?: 'active' | 'inactive' | 'pending' | 'rejected';
  verification_status?: 'verified' | 'unverified' | 'pending';
}

export interface InfluencerTeam {
  id: string;
  influencer_id: string;
  team_id: string;
  status: 'active' | 'inactive' | 'pending';
  role?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InfluencerTeamCreateDTO {
  influencer_id: string;
  team_id: string;
  role?: string;
  notes?: string;
}

export interface InfluencerTeamUpdateDTO extends Partial<InfluencerTeamCreateDTO> {
  status?: 'active' | 'inactive' | 'pending';
}

export interface InfluencerCampaign {
  id: string;
  influencer_id: string;
  campaign_id: string;
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
  role?: string;
  budget?: number;
  deliverables?: string[];
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InfluencerCampaignCreateDTO {
  influencer_id: string;
  campaign_id: string;
  role?: string;
  budget?: number;
  deliverables?: string[];
  notes?: string;
}

export interface InfluencerCampaignUpdateDTO extends Partial<InfluencerCampaignCreateDTO> {
  status?: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
} 
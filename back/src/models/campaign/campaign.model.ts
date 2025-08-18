export interface Campaign {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  team_id?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  type: 'awareness' | 'engagement' | 'conversion' | 'branding' | 'other';
  start_date: Date;
  end_date: Date;
  budget: number;
  currency: string;
  objectives: string[];
  target_audience?: {
    age_range?: string[];
    gender?: string[];
    location?: string[];
    interests?: string[];
  };
  platforms: ('instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'other')[];
  deliverables?: {
    type: string;
    quantity: number;
    description?: string;
  }[];
  metrics?: {
    reach?: number;
    engagement?: number;
    conversions?: number;
    roi?: number;
  };
  content_guidelines?: string[];
  hashtags?: string[];
  mentions?: string[];
  notes?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CampaignCreateDTO {
  name: string;
  description?: string;
  organization_id: string;
  team_id?: string;
  type: 'awareness' | 'engagement' | 'conversion' | 'branding' | 'other';
  start_date: Date;
  end_date: Date;
  budget: number;
  currency: string;
  objectives: string[];
  target_audience?: {
    age_range?: string[];
    gender?: string[];
    location?: string[];
    interests?: string[];
  };
  platforms: ('instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'other')[];
  deliverables?: {
    type: string;
    quantity: number;
    description?: string;
  }[];
  content_guidelines?: string[];
  hashtags?: string[];
  mentions?: string[];
  notes?: string;
}

export interface CampaignUpdateDTO extends Partial<CampaignCreateDTO> {
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  metrics?: {
    reach?: number;
    engagement?: number;
    conversions?: number;
    roi?: number;
  };
}

export interface CampaignInfluencer {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  role?: string;
  budget?: number;
  deliverables?: string[];
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CampaignInfluencerCreateDTO {
  campaign_id: string;
  influencer_id: string;
  role?: string;
  budget?: number;
  deliverables?: string[];
  notes?: string;
}

export interface CampaignInfluencerUpdateDTO extends Partial<CampaignInfluencerCreateDTO> {
  status?: 'pending' | 'active' | 'completed' | 'cancelled';
}

export interface CampaignContent {
  id: string;
  campaign_id: string;
  influencer_id: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'other';
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'other';
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  content_url?: string;
  caption?: string;
  hashtags?: string[];
  mentions?: string[];
  scheduled_date?: Date;
  published_date?: Date;
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    reach?: number;
    engagement?: number;
  };
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CampaignContentCreateDTO {
  campaign_id: string;
  influencer_id: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'other';
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'other';
  content_url?: string;
  caption?: string;
  hashtags?: string[];
  mentions?: string[];
  scheduled_date?: Date;
  notes?: string;
}

export interface CampaignContentUpdateDTO extends Partial<CampaignContentCreateDTO> {
  status?: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  published_date?: Date;
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    reach?: number;
    engagement?: number;
  };
} 
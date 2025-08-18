export type BrandStatus = 'active' | 'inactive' | 'pending';
export type BrandSize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  country?: string;
  size?: BrandSize;
  status: BrandStatus;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  total_campaigns: number;
  total_influencers: number;
  total_budget: number;
  currency: string;
  social_media?: Record<string, any>;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Mantener compatibilidad con nombres anteriores
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateBrandDto {
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  country?: string;
  size?: BrandSize;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  currency?: string;
  social_media?: Record<string, any>;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateBrandDto {
  name?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  country?: string;
  size?: BrandSize;
  status?: BrandStatus;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  currency?: string;
  social_media?: Record<string, any>;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface BrandFilters {
  status?: BrandStatus;
  industry?: string;
  country?: string;
  size?: BrandSize;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface BrandCampaign {
  id: string;
  brand_id: string;
  campaign_id: string;
  role?: string;
  budget_allocated?: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  status: string;
  target_reach?: number;
  target_engagement?: number;
  actual_reach?: number;
  actual_engagement?: number;
  notes?: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Datos de la campaña relacionada (JOIN)
  campaigns?: {
    id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    budget: string;
    currency: string;
    status: string;
  };
  // Mantener compatibilidad con nombres anteriores
  brandId: string;
  campaignId: string;
  campaignName: string;
  budget: number;
  startDate: string;
  endDate: string;
  targetAudience?: Record<string, any>;
  goals?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandCampaignDto {
  brand_id: string;
  campaign_id: string;
  budget: number;
  currency: string;
  start_date: string;
  end_date: string;
  target_audience?: Record<string, any>;
  goals?: Record<string, any>;
}

export interface UpdateBrandCampaignDto {
  role?: string;
  budget?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  target_audience?: Record<string, any>;
  goals?: Record<string, any>;
  notes?: string;
}

export interface BrandStats {
  total_brands: number;
  active_brands: number;
  inactive_brands: number;
  pending_brands: number;
  total_campaigns: number;
  total_budget: number;
  average_budget_per_brand: number;
  by_industry?: Record<string, number>;
  by_country?: Record<string, number>;
  by_size?: Record<string, number>;
  recent_activity?: {
    new_brands_this_month: number;
    campaigns_this_month: number;
    budget_this_month: number;
  };
}

export interface BrandAnalytics {
  brand_id: string;
  campaign_performance: {
    total_campaigns: number;
    active_campaigns: number;
    completed_campaigns: number;
    total_budget: number;
    spent_budget: number;
    roi: number;
  };
  influencer_metrics: {
    total_influencers: number;
    avg_engagement_rate: number;
    total_reach: number;
    total_impressions: number;
  };
  content_metrics: {
    total_posts: number;
    total_likes: number;
    total_shares: number;
    total_comments: number;
  };
  growth_metrics: {
    monthly_growth: number;
    quarterly_growth: number;
    yearly_growth: number;
  };
} 
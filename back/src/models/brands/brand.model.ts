/**
 * Modelo de Brand
 */

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  country?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  status: 'active' | 'inactive' | 'pending';
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
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface BrandCreateDTO {
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  country?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  currency?: string;
  social_media?: Record<string, any>;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface BrandUpdateDTO extends Partial<BrandCreateDTO> {
  status?: 'active' | 'inactive' | 'pending';
  total_campaigns?: number;
  total_influencers?: number;
  total_budget?: number;
}

export interface BrandCampaign {
  id: string;
  brand_id: string;
  campaign_id: string;
  role: string;
  budget_allocated?: number;
  currency: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: Date;
  end_date?: Date;
  target_reach?: number;
  target_engagement?: number;
  actual_reach: number;
  actual_engagement: number;
  notes?: string;
  settings?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface BrandCampaignCreateDTO {
  brand_id: string;
  campaign_id: string;
  role?: string;
  budget_allocated?: number;
  currency?: string;
  start_date?: Date;
  end_date?: Date;
  target_reach?: number;
  target_engagement?: number;
  notes?: string;
  settings?: Record<string, any>;
}

export interface BrandCampaignUpdateDTO extends Partial<BrandCampaignCreateDTO> {
  status?: 'active' | 'paused' | 'completed' | 'cancelled';
  actual_reach?: number;
  actual_engagement?: number;
}

export interface BrandFilters {
  search?: string;
  industry?: string;
  country?: string;
  size?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface BrandStats {
  total_reach: number;
  total_engagement: number;
  active_campaigns: number;
  completed_campaigns: number;
  average_roi: number;
  top_performing_campaigns?: any[];
} 
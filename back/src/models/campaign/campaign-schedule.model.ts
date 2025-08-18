export interface CampaignSchedule {
  id: string;
  campaign_id: string;
  influencer_id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  scheduled_time?: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  content_type: 'post' | 'story' | 'reel' | 'video' | 'carrusel' | 'live' | 'tweet';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  objectives: Objective[];
  metrics: Record<string, any>;
  influencer_name: string;
  influencer_handle?: string;
  influencer_avatar?: string;
  content_requirements?: string;
  hashtags?: string[];
  mentions?: string[];
  location?: {
    name?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  assigned_budget: number;
  actual_cost: number;
  content_url?: string;
  media_urls?: string[];
  thumbnail_url?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface Objective {
  id: string;
  title: string;
  target: string;
  current: string;
  status: 'completed' | 'in-progress' | 'not-started';
  percentComplete: number;
}

export interface CampaignScheduleCreateDTO {
  campaign_id: string;
  influencer_id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  scheduled_time?: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  content_type: 'post' | 'story' | 'reel' | 'video' | 'carrusel' | 'live' | 'tweet';
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  objectives?: Objective[];
  influencer_name: string;
  influencer_handle?: string;
  influencer_avatar?: string;
  content_requirements?: string;
  hashtags?: string[];
  mentions?: string[];
  location?: {
    name?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  assigned_budget?: number;
  notes?: string;
}

export interface CampaignScheduleUpdateDTO extends Partial<CampaignScheduleCreateDTO> {
  metrics?: Record<string, any>;
  actual_cost?: number;
  content_url?: string;
  media_urls?: string[];
  thumbnail_url?: string;
}

export interface CampaignScheduleFilters {
  campaign_id?: string;
  influencer_id?: string;
  status?: string;
  platform?: string;
  content_type?: string;
  start_date?: Date;
  end_date?: Date;
  search?: string;
} 
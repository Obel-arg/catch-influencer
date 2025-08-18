export type EngagementType = 'like' | 'comment' | 'share' | 'save' | 'view' | 'click' | 'follow';

export type EngagementPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'linkedin';

export interface Engagement {
  id: string;
  content_id: string;
  influencer_id: string;
  campaign_id: string;
  type: EngagementType;
  platform: EngagementPlatform;
  count: number;
  date: Date;
  metadata?: {
    comment_text?: string;
    user_id?: string;
    user_name?: string;
    user_profile?: string;
    [key: string]: any;
  };
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface EngagementCreateDTO {
  content_id: string;
  influencer_id: string;
  campaign_id: string;
  type: EngagementType;
  platform: EngagementPlatform;
  count: number;
  date: Date;
  metadata?: Engagement['metadata'];
}

export interface EngagementUpdateDTO {
  count?: number;
  metadata?: Engagement['metadata'];
}

export interface EngagementMetrics {
  total_engagements: number;
  engagement_rate: number;
  platform_breakdown: {
    [key in EngagementPlatform]?: {
      total: number;
      by_type: {
        [key in EngagementType]?: number;
      };
    };
  };
  type_breakdown: {
    [key in EngagementType]?: number;
  };
  trend: {
    date: Date;
    count: number;
  }[];
} 
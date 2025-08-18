export interface Analytics {
  id: string;
  organization_id: string;
  campaign_id?: string;
  influencer_id?: string;
  type: 'campaign' | 'influencer' | 'content' | 'audience' | 'engagement' | 'roi';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  start_date: Date;
  end_date: Date;
  metrics: {
    reach?: number;
    impressions?: number;
    engagement?: number;
    clicks?: number;
    conversions?: number;
    revenue?: number;
    cost?: number;
    roi?: number;
    ctr?: number;
    cpc?: number;
    cpm?: number;
    cpa?: number;
    engagement_rate?: number;
    follower_growth?: number;
    audience_demographics?: {
      age_range?: { [key: string]: number };
      gender?: { [key: string]: number };
      location?: { [key: string]: number };
      interests?: { [key: string]: number };
    };
    platform_metrics?: {
      instagram?: {
        likes?: number;
        comments?: number;
        shares?: number;
        saves?: number;
        reach?: number;
        impressions?: number;
      };
      tiktok?: {
        likes?: number;
        comments?: number;
        shares?: number;
        views?: number;
        reach?: number;
      };
      youtube?: {
        views?: number;
        likes?: number;
        comments?: number;
        subscribers?: number;
        watch_time?: number;
      };
      twitter?: {
        retweets?: number;
        likes?: number;
        replies?: number;
        impressions?: number;
      };
      facebook?: {
        likes?: number;
        comments?: number;
        shares?: number;
        reach?: number;
        impressions?: number;
      };
    };
  };
  comparison?: {
    previous_period?: {
      start_date: Date;
      end_date: Date;
      metrics: Analytics['metrics'];
    };
    percentage_change?: {
      [key: string]: number;
    };
  };
  insights?: string[];
  recommendations?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface AnalyticsCreateDTO {
  organization_id: string;
  campaign_id?: string;
  influencer_id?: string;
  type: 'campaign' | 'influencer' | 'content' | 'audience' | 'engagement' | 'roi';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  start_date: Date;
  end_date: Date;
  metrics: Analytics['metrics'];
  comparison?: {
    previous_period?: {
      start_date: Date;
      end_date: Date;
      metrics: Analytics['metrics'];
    };
  };
  insights?: string[];
  recommendations?: string[];
}

export interface AnalyticsUpdateDTO {
  organization_id?: string;
  campaign_id?: string;
  influencer_id?: string;
  type?: 'campaign' | 'influencer' | 'content' | 'audience' | 'engagement' | 'roi';
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  start_date?: Date;
  end_date?: Date;
  metrics?: Partial<Analytics['metrics']>;
  comparison?: {
    previous_period?: {
      start_date?: Date;
      end_date?: Date;
      metrics?: Partial<Analytics['metrics']>;
    };
    percentage_change?: {
      [key: string]: number;
    };
  };
  insights?: string[];
  recommendations?: string[];
}

export interface AnalyticsReport {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: 'campaign' | 'influencer' | 'content' | 'audience' | 'engagement' | 'roi' | 'custom';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    day_of_week?: number;
    day_of_month?: number;
    time?: string;
    timezone?: string;
  };
  filters?: {
    campaigns?: string[];
    influencers?: string[];
    platforms?: string[];
    date_range?: {
      start_date: Date;
      end_date: Date;
    };
    metrics?: string[];
  };
  recipients?: {
    email: string;
    name?: string;
    role?: string;
  }[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'active' | 'paused' | 'deleted';
  last_generated?: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface AnalyticsReportCreateDTO {
  organization_id: string;
  name: string;
  description?: string;
  type: 'campaign' | 'influencer' | 'content' | 'audience' | 'engagement' | 'roi' | 'custom';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    day_of_week?: number;
    day_of_month?: number;
    time?: string;
    timezone?: string;
  };
  filters?: {
    campaigns?: string[];
    influencers?: string[];
    platforms?: string[];
    date_range?: {
      start_date: Date;
      end_date: Date;
    };
    metrics?: string[];
  };
  recipients?: {
    email: string;
    name?: string;
    role?: string;
  }[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
}

export interface AnalyticsReportUpdateDTO extends Partial<AnalyticsReportCreateDTO> {
  status?: 'active' | 'paused' | 'deleted';
  last_generated?: Date;
} 
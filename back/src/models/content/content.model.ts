export interface Content {
  id: string;
  campaign_id: string;
  influencer_id: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'tweet' | 'article';
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  url: string;
  title?: string;
  description?: string;
  media_urls?: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'deleted';
  scheduled_date?: Date;
  published_date?: Date;
  metrics: {
    reach?: number;
    impressions?: number;
    engagement?: number;
    clicks?: number;
    shares?: number;
    saves?: number;
    comments?: number;
    likes?: number;
    views?: number;
    watch_time?: number;
    platform_specific?: {
      instagram?: {
        story_views?: number;
        story_exits?: number;
        story_replies?: number;
        reel_plays?: number;
        reel_completion_rate?: number;
      };
      tiktok?: {
        video_plays?: number;
        completion_rate?: number;
        shares?: number;
        favorites?: number;
      };
      youtube?: {
        watch_time?: number;
        average_view_duration?: number;
        subscribers_gained?: number;
        subscribers_lost?: number;
      };
      twitter?: {
        retweets?: number;
        replies?: number;
        quote_tweets?: number;
        profile_visits?: number;
      };
      facebook?: {
        post_reach?: number;
        post_impressions?: number;
        reactions?: number;
        shares?: number;
      };
    };
  };
  tags?: string[];
  location?: {
    name?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  cost?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface ContentCreateDTO {
  campaign_id: string;
  influencer_id: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'tweet' | 'article';
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  url: string;
  title?: string;
  description?: string;
  media_urls?: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'deleted';
  scheduled_date?: Date;
  published_date?: Date;
  metrics?: Content['metrics'];
  tags?: string[];
  location?: {
    name?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  cost?: number;
  notes?: string;
}

export interface ContentUpdateDTO extends Partial<ContentCreateDTO> {
  status?: 'draft' | 'scheduled' | 'published' | 'failed' | 'deleted';
  published_date?: Date;
  metrics?: Partial<Content['metrics']>;
}

export interface ContentMetrics {
  id: string;
  content_id: string;
  date: Date;
  metrics: Content['metrics'];
  created_at: Date;
}

export interface ContentMetricsCreateDTO {
  content_id: string;
  date: Date;
  metrics: Content['metrics'];
}

export interface ContentMetricsUpdateDTO extends Partial<ContentMetricsCreateDTO> {} 
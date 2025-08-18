export interface InfluencerCache {
  id: string;
  influencer_id: string;
  platform_data: {
    instagram?: {
      username: string;
      followers: number;
      engagement_rate: number;
      posts_count: number;
      average_likes: number;
      average_comments: number;
      recent_posts: Array<{
        id: string;
        url: string;
        type: string;
        likes: number;
        comments: number;
        timestamp: Date;
      }>;
      raw_data: any;
    };
    tiktok?: {
      username: string;
      followers: number;
      engagement_rate: number;
      videos_count: number;
      total_likes: number;
      recent_videos: Array<{
        id: string;
        url: string;
        views: number;
        likes: number;
        comments: number;
        shares: number;
        timestamp: Date;
      }>;
      raw_data: any;
    };
    youtube?: {
      channel_id: string;
      subscribers: number;
      total_views: number;
      videos_count: number;
      engagement_rate: number;
      recent_videos: Array<{
        id: string;
        url: string;
        views: number;
        likes: number;
        comments: number;
        timestamp: Date;
      }>;
      raw_data: any;
    };
  };
  last_fetched: {
    instagram?: Date;
    tiktok?: Date;
    youtube?: Date;
  };
  created_at: Date;
  updated_at: Date;
}

export interface InfluencerCacheCreateDTO {
  influencer_id: string;
  platform_data: InfluencerCache['platform_data'];
}

export interface InfluencerCacheUpdateDTO extends Partial<InfluencerCacheCreateDTO> {
  last_fetched?: {
    instagram?: Date;
    tiktok?: Date;
    youtube?: Date;
  };
} 
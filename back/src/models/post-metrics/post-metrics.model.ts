export interface PostMetrics {
  id: string;
  post_id: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  post_url: string;
  
  // Datos generales del post
  title?: string;
  description?: string;
  author_username?: string;
  author_display_name?: string;
  post_date?: Date;
  
  // Métricas comunes
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  
  // Métricas específicas por plataforma
  youtube_metrics?: YouTubeMetrics;
  instagram_metrics?: InstagramMetrics;
  tiktok_metrics?: TikTokMetrics;
  twitter_metrics?: TwitterMetrics;
  
  // Datos raw de la API
  raw_api_response?: any;
  
  // Control de actualizaciones
  last_fetched_at: Date;
  api_status: 'success' | 'error' | 'pending';
  api_error_message?: string;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface YouTubeMetrics {
  channel_id?: string;
  channel_name?: string;
  video_id?: string;
  duration?: number;
  category?: string;
  tags?: string[];
  subscriber_count?: number;
  channel_views?: number;
  upload_date?: string;
}

export interface InstagramMetrics {
  post_code?: string;
  post_type?: string; // 'photo' | 'video' | 'carousel'
  is_video?: boolean;
  location?: {
    name?: string;
    id?: string;
  };
  hashtags?: string[];
  mentions?: string[];
  media_urls?: string[];
}

export interface TikTokMetrics {
  video_id?: string;
  music_info?: {
    title?: string;
    author?: string;
    duration?: number;
  };
  effects?: string[];
  hashtags?: string[];
  mentions?: string[];
  video_duration?: number;
  play_count?: number;
}

export interface TwitterMetrics {
  tweet_id?: string;
  tweet_type?: string;
  reply_count?: number;
  retweet_count?: number;
  quote_count?: number;
  favorite_count?: number;
  hashtags?: string[];
  mentions?: string[];
  urls?: string[];
  media_urls?: string[];
}

export interface PostMetricsHistory {
  id: string;
  post_metrics_id: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  views_count?: number;
  platform_metrics?: any;
  snapshot_date: Date;
  created_at: Date;
}

export interface PostMetricsCreateDTO {
  post_id: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  post_url: string;
  title?: string;
  description?: string;
  author_username?: string;
  author_display_name?: string;
  post_date?: Date;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  youtube_metrics?: YouTubeMetrics;
  instagram_metrics?: InstagramMetrics;
  tiktok_metrics?: TikTokMetrics;
  twitter_metrics?: TwitterMetrics;
  raw_api_response?: any;
  api_status?: 'success' | 'error' | 'pending';
  api_error_message?: string;
}

export interface PostMetricsUpdateDTO extends Partial<PostMetricsCreateDTO> {
  last_fetched_at?: Date;
} 
// =====================================================
// MODELO OPTIMIZADO PARA CREATORDB
// =====================================================

export interface PostMetrics {
  id: string;
  
  // Identificadores
  post_id: string;
  platform: 'youtube' | 'instagram' | 'tiktok';
  content_id: string; // videoId, postId, etc.
  post_url: string;
  
  // Métricas básicas (directas de CreatorDB)
  title?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  engagement_rate: number; // engageRate de CreatorDB
  
  // Metadatos específicos por plataforma
  platform_data?: any; // JSONB - todo el objeto basicYoutubePost/etc.
  
  // Info de CreatorDB API
  quota_used: number;
  api_timestamp?: number; // timestamp de CreatorDB
  api_success: boolean;
  api_error?: string;
  
  // Respuesta completa para debugging
  raw_response?: any; // JSONB - respuesta completa de CreatorDB
  
  // Control interno
  created_at: Date;
  updated_at: Date;
}

// DTO para crear métricas
export interface PostMetricsCreateDTO {
  post_id: string;
  platform: 'youtube' | 'instagram' | 'tiktok';
  content_id: string;
  post_url: string;
  title?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  engagement_rate: number;
  platform_data?: any;
  quota_used: number;
  api_timestamp?: number;
  api_success: boolean;
  api_error?: string;
  raw_response?: any;
}

// Tipos específicos para respuestas de CreatorDB
export interface CreatorDBResponse {
  data: {
    basicYoutubePost?: YouTubePostData;
    basicInstagramPost?: InstagramPostData;
    basicTikTokPost?: TikTokPostData;
  };
  quotaUsed: number;
  quotaUsedTotal: number;
  remainingPlanCredit: number;
  remainingPrepurchasedCredit: number;
  timestamp: number;
  error: string;
  success: boolean;
}

export interface YouTubePostData {
  uploadDate: number;
  videoId: string;
  length: number;
  title: string;
  likes: number;
  comments: number;
  selfCommentRatio: number;
  commentLikeRatio: number;
  commentReplyRatio: number;
  views: number;
  engageRate: number;
  category: string;
  lang: string;
  isPaidPromote: boolean;
  isStreaming: boolean;
  isShorts: boolean;
  hashtags: string[];
}

export interface InstagramPostData {
  postId: string;
  shortcode: string;
  likes: number;
  comments: number;
  views?: number;
  media_type: string;
  hashtags: string[];
  // Agregar más campos según la respuesta real de Instagram
}

export interface TikTokPostData {
  videoId: string;
  likes: number;
  comments: number;
  views: number;
  shares: number;
  hashtags: string[];
  // Agregar más campos según la respuesta real de TikTok
} 
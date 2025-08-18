export interface InfluencerPost {
  id: string;
  influencer_id: string;
  campaign_id: string;
  image_url?: string;
  caption?: string;
  post_date?: Date;
  likes_count?: number;
  comments_count?: number;
  performance_rating?: string;
  platform: string;
  post_url: string;
  metrics?: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface InfluencerPostCreateDTO {
  influencer_id: string;
  campaign_id: string;
  image_url?: string;
  caption?: string;
  post_date?: Date;
  likes_count?: number;
  comments_count?: number;
  performance_rating?: string;
  platform: string;
  post_url: string;
  metrics?: any;
}

export interface InfluencerPostUpdateDTO {
  image_url?: string;
  caption?: string;
  post_date?: Date;
  likes_count?: number;
  comments_count?: number;
  performance_rating?: string;
  platform?: string;
  post_url?: string;
  metrics?: any;
} 
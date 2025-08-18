export interface CampaignInfluencer {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  role: 'primary' | 'secondary' | 'backup';
  budget: number;
  payment_status: 'pending' | 'partial' | 'completed';
  payment_amount: number;
  payment_date?: Date;
  deliverables: {
    type: 'post' | 'story' | 'reel' | 'video' | 'tweet' | 'article';
    platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
    quantity: number;
    description?: string;
    requirements?: string[];
  }[];
  metrics: {
    reach?: number;
    engagement?: number;
    clicks?: number;
    conversions?: number;
    roi?: number;
  };
  notes?: string;
  start_date?: Date;
  end_date?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CampaignInfluencerCreateDTO {
  campaign_id: string;
  influencer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  role: 'primary' | 'secondary' | 'backup';
  budget: number;
  payment_status: 'pending' | 'partial' | 'completed';
  payment_amount: number;
  payment_date?: Date;
  deliverables: {
    type: 'post' | 'story' | 'reel' | 'video' | 'tweet' | 'article';
    platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
    quantity: number;
    description?: string;
    requirements?: string[];
  }[];
  metrics?: {
    reach?: number;
    engagement?: number;
    clicks?: number;
    conversions?: number;
    roi?: number;
  };
  notes?: string;
  start_date?: Date;
  end_date?: Date;
}

export interface CampaignInfluencerUpdateDTO extends Partial<CampaignInfluencerCreateDTO> {
  status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'partial' | 'completed';
  payment_date?: Date;
  metrics?: Partial<CampaignInfluencer['metrics']>;
} 
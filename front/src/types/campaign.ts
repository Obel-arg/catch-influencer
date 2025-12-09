export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft' | 'planned';

export interface CampaignGoal {
  type: string;
  value: number;
  unit: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  budget: number;
  start_date: string;
  end_date: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  currency: string;
  goals?: CampaignGoal[];
  // Mantener compatibilidad con nombres anteriores
  startDate: string;
  endDate: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  // 🚀 OPTIMIZACIÓN: Métricas pre-calculadas del backend optimizado
  influencers_count?: number;
  posts_count?: number;
  avg_engagement_rate?: number;
  // ⭐ Favorite flag added by backend join
  is_favorited?: boolean;
}

export interface CreateCampaignDto {
  name: string;
  description: string;
  status: CampaignStatus;
  budget: number;
  startDate: string;
  endDate: string;
  organizationId: string;
}

export interface UpdateCampaignDto {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  budget?: number;
  start_date?: Date;
  end_date?: Date;
  goals?: CampaignGoal[];
}

export interface CampaignFilters {
  status?: CampaignStatus;
  startDate?: string;
  endDate?: string;
  organizationId?: string;
}

export interface ContentSchedule {
  id: string;
  campaignId: string;
  influencerId: string;
  influencerName: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
  contentType: 'post' | 'story' | 'reel' | 'video' | 'live';
  title: string;
  description?: string;
  scheduledDate: string;
  scheduledTime?: string;
  duration?: number; // en minutos
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  assignedBudget?: number;
  requirements?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string[];
  influencer: string;
  platform: string;
  contentType: string;
  status: string;
}

export interface ContentType {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export interface Platform {
  value: string;
  label: string;
  icon: string;
  color: string;
} 
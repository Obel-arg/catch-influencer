export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "cancelled";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  startDate: Date;
  endDate: Date;
  budget: number;
  targetAudience: {
    ageRange: [number, number];
    gender: string[];
    interests: string[];
    locations: string[];
  };
  goals: {
    type: string;
    target: number;
    metric: string;
  }[];
  platforms: string[];
  influencers: string[];
  metrics: {
    reach: number;
    engagement: number;
    conversions: number;
    revenue: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignMetrics {
  reach: number;
  engagement: number;
  conversions: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roi: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface CampaignInfluencer {
  id: string;
  campaignId: string;
  influencerId: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  budget: number;
  deliverables: string[];
  metrics?: {
    posts: number;
    reach: number;
    engagement: number;
    conversions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCampaignDto = Omit<Campaign, "id" | "createdAt" | "updatedAt" | "metrics">;

export type UpdateCampaignDto = Partial<Omit<Campaign, "id" | "createdAt" | "updatedAt" | "metrics">>;

export interface CampaignFilters {
  status?: Campaign["status"];
  startDate?: Date;
  endDate?: Date;
  platforms?: string[];
  influencers?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 
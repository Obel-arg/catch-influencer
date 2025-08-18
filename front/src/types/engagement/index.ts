export interface Engagement {
  id: string;
  type: "like" | "comment" | "share" | "view" | "click" | "follow";
  platform: string;
  contentId: string;
  userId: string;
  metadata: {
    text?: string;
    url?: string;
    device?: string;
    location?: string;
    timestamp: Date;
  };
  metrics: {
    reach: number;
    impressions: number;
    engagement: number;
    conversion?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EngagementMetrics {
  total: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    views: number;
  };
  growth: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    views: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

export interface EngagementAnalytics {
  id: string;
  contentId: string;
  platform: "instagram" | "tiktok" | "youtube" | "facebook";
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    views: number;
    engagementRate: number;
    reach: number;
    impressions: number;
  };
  demographics: {
    ageGroups: {
      [key: string]: number;
    };
    genders: {
      [key: string]: number;
    };
    locations: {
      [key: string]: number;
    };
  };
  period: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EngagementSummary {
  total: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    clicks: number;
    follows: number;
    engagement: number;
  };
  byPlatform: {
    [platform: string]: {
      likes: number;
      comments: number;
      shares: number;
      views: number;
      clicks: number;
      follows: number;
      engagement: number;
    };
  };
  byType: {
    [type in Engagement["type"]]: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

export interface EngagementFilters {
  type?: Engagement["type"];
  platform?: string;
  contentId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} 
export interface Analytics {
  id: string;
  type: string;
  referenceId: string;
  data: {
    followers: number;
    engagement: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  period: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsSummary {
  total: {
    followers: number;
    engagement: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  growth: {
    followers: number;
    engagement: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

export interface AnalyticsComparison {
  current: AnalyticsSummary;
  previous: AnalyticsSummary;
  changes: {
    followers: number;
    engagement: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

export interface AnalyticsFilters {
  type?: string;
  referenceId?: string;
  period?: string;
  compareWith?: string;
  startDate?: Date;
  endDate?: Date;
  groupBy?: string;
  metrics?: string[];
} 
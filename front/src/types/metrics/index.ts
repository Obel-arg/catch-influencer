export interface Metrics {
  id: string;
  type: "campaign" | "influencer" | "content" | "organization";
  referenceId: string;
  data: {
    followers: number;
    engagement: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
    ctr: number;
    cpc: number;
    cpm: number;
    cpa: number;
  };
  period: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricsSummary {
  total: {
    followers: number;
    engagement: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
    ctr: number;
    cpc: number;
    cpm: number;
    cpa: number;
  };
  growth: {
    followers: number;
    engagement: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
    ctr: number;
    cpc: number;
    cpm: number;
    cpa: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

export interface MetricsComparison {
  current: MetricsSummary;
  previous: MetricsSummary;
  changes: {
    followers: number;
    engagement: number;
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
    ctr: number;
    cpc: number;
    cpm: number;
    cpa: number;
  };
  period: {
    current: {
      start: Date;
      end: Date;
    };
    previous: {
      start: Date;
      end: Date;
    };
  };
} 
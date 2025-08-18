export type MetricType = 
  | 'reach'
  | 'impressions'
  | 'engagement_rate'
  | 'click_through_rate'
  | 'conversion_rate'
  | 'cost_per_engagement'
  | 'cost_per_click'
  | 'cost_per_conversion'
  | 'return_on_investment'
  | 'audience_growth'
  | 'sentiment_analysis'
  | 'brand_mentions';

export type MetricPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Metric {
  id: string;
  campaign_id: string;
  content_id?: string;
  influencer_id?: string;
  type: MetricType;
  value: number;
  period: MetricPeriod;
  date: Date;
  metadata?: {
    breakdown?: {
      [key: string]: number;
    };
    comparison?: {
      previous_period: number;
      change_percentage: number;
    };
    [key: string]: any;
  };
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface MetricCreateDTO {
  campaign_id: string;
  content_id?: string;
  influencer_id?: string;
  type: MetricType;
  value: number;
  period: MetricPeriod;
  date: Date;
  metadata?: Metric['metadata'];
}

export interface MetricUpdateDTO {
  value?: number;
  metadata?: Metric['metadata'];
}

export interface MetricSummary {
  total_value: number;
  average_value: number;
  min_value: number;
  max_value: number;
  trend: {
    date: Date;
    value: number;
  }[];
  breakdown?: {
    [key: string]: {
      total: number;
      average: number;
      percentage: number;
    };
  };
}

export interface CampaignMetrics {
  campaign_id: string;
  metrics: {
    [key in MetricType]?: MetricSummary;
  };
  overall_performance: {
    total_reach: number;
    total_engagement: number;
    average_engagement_rate: number;
    total_conversions: number;
    total_cost: number;
    roi: number;
  };
  influencer_performance: {
    [influencer_id: string]: {
      total_reach: number;
      total_engagement: number;
      engagement_rate: number;
      total_conversions: number;
      cost_performance: number;
    };
  };
  content_performance: {
    [content_id: string]: {
      reach: number;
      engagement: number;
      engagement_rate: number;
      conversions: number;
      cost_performance: number;
    };
  };
  period_comparison: {
    current: {
      start_date: Date;
      end_date: Date;
      metrics: {
        [key in MetricType]?: number;
      };
    };
    previous: {
      start_date: Date;
      end_date: Date;
      metrics: {
        [key in MetricType]?: number;
      };
    };
    change_percentage: {
      [key in MetricType]?: number;
    };
  };
} 
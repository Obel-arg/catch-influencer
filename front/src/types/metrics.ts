export type MetricsType = 'campaign' | 'influencer' | 'content' | 'organization';

export interface Metrics {
  id: string;
  type: MetricsType;
  referenceId: string;
  period: string;
  data: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMetricsDto {
  type: MetricsType;
  referenceId: string;
  period: string;
  data: Record<string, number>;
}

export interface MetricsSummary {
  total: number;
  average: number;
  trend: number;
  period: string;
}

export interface MetricsComparison {
  current: Metrics;
  previous: Metrics;
  change: number;
} 
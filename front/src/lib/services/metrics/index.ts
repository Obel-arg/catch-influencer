import { httpClient } from "../../http";
import { Metrics, MetricsSummary, MetricsComparison } from "@/types/metrics";
import { AxiosHeaders } from "axios";

export class MetricsService {
  private static instance: MetricsService;
  private baseUrl = "/metrics";

  private constructor() {}

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  async getMetrics(type: string, referenceId: string, period: string): Promise<Metrics> {
    const response = await httpClient.get<Metrics>(`${this.baseUrl}/${type}/${referenceId}`, {
      params: { period },
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getMetricsSummary(type: string, period: string): Promise<MetricsSummary> {
    const response = await httpClient.get<MetricsSummary>(`${this.baseUrl}/${type}/summary`, {
      params: { period },
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getMetricsComparison(
    type: string,
    period: string,
    compareWith: string
  ): Promise<MetricsComparison> {
    const response = await httpClient.get<MetricsComparison>(`${this.baseUrl}/${type}/comparison`, {
      params: { period, compareWith },
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getCampaignMetrics(campaignId: string, period: string): Promise<Metrics> {
    const response = await httpClient.get<Metrics>(`${this.baseUrl}/campaigns/${campaignId}`, {
      params: { period },
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getInfluencerMetrics(influencerId: string, period: string): Promise<Metrics> {
    const response = await httpClient.get<Metrics>(`${this.baseUrl}/influencers/${influencerId}`, {
      params: { period },
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getContentMetrics(contentId: string, period: string): Promise<Metrics> {
    const response = await httpClient.get<Metrics>(`${this.baseUrl}/content/${contentId}`, {
      params: { period },
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getOrganizationMetrics(organizationId: string, period: string): Promise<Metrics> {
    const response = await httpClient.get<Metrics>(`${this.baseUrl}/organizations/${organizationId}`, {
      params: { period },
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getMetricsByPlatform(type: string, referenceId: string, platform: string, period: string): Promise<Metrics> {
    const response = await httpClient.get<Metrics>(`${this.baseUrl}/${type}/${referenceId}/platform/${platform}`, {
      params: { period },
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getMetricsByMetric(type: string, referenceId: string, metric: string, period: string): Promise<Metrics> {
    const response = await httpClient.get<Metrics>(`${this.baseUrl}/${type}/${referenceId}/metric/${metric}`, {
      params: { period },
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createMetrics(metrics: Omit<Metrics, "id" | "createdAt" | "updatedAt">): Promise<Metrics> {
    const response = await httpClient.post<Metrics>(this.baseUrl, metrics, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateMetrics(id: string, metrics: Partial<Metrics>): Promise<Metrics> {
    const response = await httpClient.put<Metrics>(`${this.baseUrl}/${id}`, metrics, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async deleteMetrics(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }
}

export const metricsService = MetricsService.getInstance(); 
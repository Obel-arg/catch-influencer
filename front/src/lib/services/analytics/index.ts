import { httpClient } from "../../http";
import { Analytics, AnalyticsSummary, AnalyticsComparison, AnalyticsFilters } from "@/types/analytics";
import { AxiosHeaders } from "axios";

export class AnalyticsService {
  private static instance: AnalyticsService;
  private baseUrl = "/analytics";

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async getAnalytics(filters: AnalyticsFilters): Promise<Analytics[]> {
    const response = await httpClient.get<Analytics[]>(this.baseUrl, {
      params: filters,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getAnalyticsSummary(filters: AnalyticsFilters): Promise<AnalyticsSummary> {
    const response = await httpClient.get<AnalyticsSummary>(`${this.baseUrl}/summary`, {
      params: filters,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getAnalyticsComparison(filters: AnalyticsFilters): Promise<AnalyticsComparison> {
    const response = await httpClient.get<AnalyticsComparison>(`${this.baseUrl}/comparison`, {
      params: filters,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getCampaignAnalytics(campaignId: string, filters: AnalyticsFilters): Promise<Analytics> {
    const response = await httpClient.get<Analytics>(`${this.baseUrl}/campaigns/${campaignId}`, {
      params: filters,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getInfluencerAnalytics(influencerId: string, filters: AnalyticsFilters): Promise<Analytics> {
    const response = await httpClient.get<Analytics>(`${this.baseUrl}/influencers/${influencerId}`, {
      params: filters,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }
}

export const analyticsService = AnalyticsService.getInstance(); 
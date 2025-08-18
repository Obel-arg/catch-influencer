import { httpClient } from "../../http";
import { Engagement, EngagementSummary, EngagementFilters } from "@/types/engagement";
import { PaginatedResponse } from "@/types/common";
import { AxiosHeaders } from "axios";

export class EngagementService {
  private static instance: EngagementService;
  private baseUrl = "/engagements";

  private constructor() {}

  public static getInstance(): EngagementService {
    if (!EngagementService.instance) {
      EngagementService.instance = new EngagementService();
    }
    return EngagementService.instance;
  }

  async getEngagements(filters?: EngagementFilters): Promise<Engagement[]> {
    const response = await httpClient.get<PaginatedResponse<Engagement>>(this.baseUrl, {
      params: filters,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data.items;
  }

  async getEngagementById(id: string): Promise<Engagement> {
    const response = await httpClient.get<Engagement>(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getEngagementSummary(filters?: EngagementFilters): Promise<EngagementSummary> {
    const response = await httpClient.get<EngagementSummary>(`${this.baseUrl}/summary`, {
      params: filters,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getEngagementByPlatform(platform: string, filters?: EngagementFilters): Promise<Engagement[]> {
    const response = await httpClient.get<PaginatedResponse<Engagement>>(`${this.baseUrl}/platform/${platform}`, {
      params: filters,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data.items;
  }

  async getEngagementByType(type: string, filters?: EngagementFilters): Promise<Engagement[]> {
    const response = await httpClient.get<PaginatedResponse<Engagement>>(`${this.baseUrl}/type/${type}`, {
      params: filters,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data.items;
  }

  async createEngagement(engagement: Omit<Engagement, "id" | "createdAt" | "updatedAt">): Promise<Engagement> {
    const response = await httpClient.post<Engagement>(this.baseUrl, engagement, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateEngagement(id: string, engagement: Partial<Engagement>): Promise<Engagement> {
    const response = await httpClient.patch<Engagement>(`${this.baseUrl}/${id}`, engagement, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async deleteEngagement(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }
}

export const engagementService = EngagementService.getInstance(); 
import { httpClient } from "../../http";
import { Content, ContentTemplate, ContentSchedule, CreateContentDto, UpdateContentDto, ContentFilters } from "@/types/content";
import { PaginatedResponse } from "@/types/common";
import { AxiosHeaders } from "axios";

export class ContentService {
  private static instance: ContentService;
  private baseUrl = "/contents";

  private constructor() {}

  public static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  async getContents(filters?: ContentFilters): Promise<Content[]> {
    const response = await httpClient.get<PaginatedResponse<Content>>(this.baseUrl, {
      params: filters,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data.items;
  }

  async getContentById(id: string): Promise<Content> {
    const response = await httpClient.get<Content>(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createContent(content: CreateContentDto): Promise<Content> {
    const response = await httpClient.post<Content>(this.baseUrl, content, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateContent(id: string, content: UpdateContentDto): Promise<Content> {
    const response = await httpClient.patch<Content>(`${this.baseUrl}/${id}`, content, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async deleteContent(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  async getTemplates(): Promise<ContentTemplate[]> {
    const response = await httpClient.get<ContentTemplate[]>(`${this.baseUrl}/templates`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createTemplate(template: Omit<ContentTemplate, "id" | "createdAt" | "updatedAt">): Promise<ContentTemplate> {
    const response = await httpClient.post<ContentTemplate>(`${this.baseUrl}/templates`, template, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateTemplate(id: string, template: Partial<ContentTemplate>): Promise<ContentTemplate> {
    const response = await httpClient.patch<ContentTemplate>(`${this.baseUrl}/templates/${id}`, template, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/templates/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  async getSchedules(): Promise<ContentSchedule[]> {
    const response = await httpClient.get<ContentSchedule[]>(`${this.baseUrl}/schedules`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createSchedule(schedule: Omit<ContentSchedule, "id" | "createdAt" | "updatedAt">): Promise<ContentSchedule> {
    const response = await httpClient.post<ContentSchedule>(`${this.baseUrl}/schedules`, schedule, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateSchedule(id: string, schedule: Partial<ContentSchedule>): Promise<ContentSchedule> {
    const response = await httpClient.patch<ContentSchedule>(`${this.baseUrl}/schedules/${id}`, schedule, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async deleteSchedule(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/schedules/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }
}

export const contentService = ContentService.getInstance(); 
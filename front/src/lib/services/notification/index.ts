import { httpClient } from "../../http";
import { Notification, NotificationPreferences, NotificationSettings } from "@/types/notification";
import { PaginationParams } from "@/types/common";
import { AxiosHeaders } from "axios";

export class NotificationService {
  private static instance: NotificationService;
  private baseUrl = "/notifications";

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getNotifications(params?: PaginationParams) {
    const response = await httpClient.get<{ data: Notification[]; total: number }>(this.baseUrl, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async markAsRead(id: string): Promise<void> {
    await httpClient.patch(`${this.baseUrl}/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await httpClient.patch(`${this.baseUrl}/read-all`);
  }

  async getPreferences() {
    const response = await httpClient.get<NotificationPreferences>(`${this.baseUrl}/preferences`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>) {
    const response = await httpClient.put<NotificationPreferences>(`${this.baseUrl}/preferences`, preferences, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getSettings() {
    const response = await httpClient.get<NotificationSettings>(`${this.baseUrl}/settings`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateSettings(settings: Partial<NotificationSettings>) {
    const response = await httpClient.put<NotificationSettings>(`${this.baseUrl}/settings`, settings, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }
}

export const notificationService = NotificationService.getInstance(); 
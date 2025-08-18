import { httpClient } from "../../http";
import { Report, ReportTemplate, ReportSchedule, CreateReportDto, CreateReportTemplateDto, CreateReportScheduleDto } from "@/types/report";
import { AxiosHeaders } from "axios";
import { PaginationParams } from "@/types/common";

export class ReportService {
  private static instance: ReportService;
  private baseUrl = "/reports";

  private constructor() {}

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  async getReports(params?: PaginationParams): Promise<Report[]> {
    const response = await httpClient.get<Report[]>(this.baseUrl, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getReportById(id: string): Promise<Report> {
    const response = await httpClient.get<Report>(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createReport(report: CreateReportDto): Promise<Report> {
    const response = await httpClient.post<Report>(this.baseUrl, report, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getTemplates(): Promise<ReportTemplate[]> {
    const response = await httpClient.get<ReportTemplate[]>(`${this.baseUrl}/templates`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getTemplateById(id: string): Promise<ReportTemplate> {
    const response = await httpClient.get<ReportTemplate>(`${this.baseUrl}/templates/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createTemplate(template: CreateReportTemplateDto): Promise<ReportTemplate> {
    const response = await httpClient.post<ReportTemplate>(`${this.baseUrl}/templates`, template, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getSchedules(): Promise<ReportSchedule[]> {
    const response = await httpClient.get<ReportSchedule[]>(`${this.baseUrl}/schedules`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getScheduleById(id: string): Promise<ReportSchedule> {
    const response = await httpClient.get<ReportSchedule>(`${this.baseUrl}/schedules/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createSchedule(schedule: CreateReportScheduleDto): Promise<ReportSchedule> {
    const response = await httpClient.post<ReportSchedule>(`${this.baseUrl}/schedules`, schedule, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updateSchedule(id: string, schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const response = await httpClient.put<ReportSchedule>(`${this.baseUrl}/schedules/${id}`, schedule, {
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

export const reportService = ReportService.getInstance(); 
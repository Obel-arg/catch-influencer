export interface Report {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: "campaign" | "influencer" | "analytics" | "custom";
  format: "pdf" | "excel" | "csv" | "json";
  status: "pending" | "processing" | "completed" | "failed";
  data: Record<string, any>;
  filters?: Record<string, any>;
  schedule?: ReportSchedule;
  template?: ReportTemplate;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: "campaign" | "influencer" | "analytics" | "custom";
  format: "pdf" | "excel" | "csv" | "json";
  layout: Record<string, any>;
  sections: {
    id: string;
    name: string;
    type: string;
    config: Record<string, any>;
  }[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSchedule {
  id: string;
  organizationId: string;
  reportId: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  time: string;
  timezone: string;
  recipients: string[];
  status: "active" | "inactive" | "paused";
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportDto {
  name: string;
  description?: string;
  type: "campaign" | "influencer" | "analytics" | "custom";
  format: "pdf" | "excel" | "csv" | "json";
  data?: Record<string, any>;
  filters?: Record<string, any>;
  schedule?: Omit<ReportSchedule, "id" | "organizationId" | "reportId" | "createdAt" | "updatedAt">;
  templateId?: string;
}

export interface CreateReportTemplateDto {
  name: string;
  description?: string;
  type: "campaign" | "influencer" | "analytics" | "custom";
  format: "pdf" | "excel" | "csv" | "json";
  layout: Record<string, any>;
  sections: {
    name: string;
    type: string;
    config: Record<string, any>;
  }[];
  isDefault?: boolean;
}

export interface CreateReportScheduleDto {
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  time: string;
  timezone: string;
  recipients: string[];
  status?: "active" | "inactive" | "paused";
} 
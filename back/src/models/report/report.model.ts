export type ReportType = 
  | 'campaign_performance'
  | 'influencer_performance'
  | 'engagement_analysis'
  | 'metrics_summary'
  | 'content_performance'
  | 'roi_analysis'
  | 'custom';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Report {
  id: string;
  user_id: string;
  organization_id: string;
  type: ReportType;
  title: string;
  description?: string;
  format: ReportFormat;
  status: ReportStatus;
  parameters: Record<string, any>;
  filters?: Record<string, any>;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  generated_at?: string;
  file_url?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ReportCreateDTO {
  user_id: string;
  organization_id: string;
  type: ReportType;
  title: string;
  description?: string;
  format: ReportFormat;
  parameters: Record<string, any>;
  filters?: Record<string, any>;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

export interface ReportUpdateDTO {
  title?: string;
  description?: string;
  format?: ReportFormat;
  parameters?: Record<string, any>;
  filters?: Record<string, any>;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

export interface ReportSchedule {
  id: string;
  report_id: string;
  user_id: string;
  organization_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule_time: string;
  recipients: string[];
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportScheduleCreateDTO {
  report_id: string;
  user_id: string;
  organization_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule_time: string;
  recipients: string[];
}

export interface ReportScheduleUpdateDTO {
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule_time?: string;
  recipients?: string[];
  is_active?: boolean;
} 
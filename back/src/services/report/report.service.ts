import supabase from '../../config/supabase';
import { 
  Report, 
  ReportCreateDTO, 
  ReportUpdateDTO,
  ReportSchedule,
  ReportScheduleCreateDTO,
  ReportScheduleUpdateDTO
} from '../../models/report/report.model';

export class ReportService {
  async createReport(data: ReportCreateDTO): Promise<Report> {
    const { data: report, error } = await supabase
      .from('reports')
      .insert([{
        ...data,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return report;
  }

  async getReportById(id: string): Promise<Report | null> {
    const { data: report, error } = await supabase
      .from('reports')
      .select()
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return report;
  }

  async getUserReports(userId: string): Promise<Report[]> {
    const { data: reports, error } = await supabase
      .from('reports')
      .select()
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return reports;
  }

  async getOrganizationReports(organizationId: string): Promise<Report[]> {
    const { data: reports, error } = await supabase
      .from('reports')
      .select()
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return reports;
  }

  async updateReport(id: string, data: ReportUpdateDTO): Promise<Report> {
    const { data: report, error } = await supabase
      .from('reports')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return report;
  }

  async deleteReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async getReportsByType(userId: string, type: string): Promise<Report[]> {
    const { data: reports, error } = await supabase
      .from('reports')
      .select()
      .eq('user_id', userId)
      .eq('type', type)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return reports;
  }

  async getReportsByStatus(userId: string, status: string): Promise<Report[]> {
    const { data: reports, error } = await supabase
      .from('reports')
      .select()
      .eq('user_id', userId)
      .eq('status', status)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return reports;
  }

  // Programación de reportes
  async createReportSchedule(data: ReportScheduleCreateDTO): Promise<ReportSchedule> {
    const { data: schedule, error } = await supabase
      .from('report_schedules')
      .insert([{
        ...data,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return schedule;
  }

  async getReportScheduleById(id: string): Promise<ReportSchedule | null> {
    const { data: schedule, error } = await supabase
      .from('report_schedules')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return schedule;
  }

  async getUserReportSchedules(userId: string): Promise<ReportSchedule[]> {
    const { data: schedules, error } = await supabase
      .from('report_schedules')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return schedules;
  }

  async updateReportSchedule(id: string, data: ReportScheduleUpdateDTO): Promise<ReportSchedule> {
    const { data: schedule, error } = await supabase
      .from('report_schedules')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return schedule;
  }

  async deleteReportSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('report_schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getActiveReportSchedules(): Promise<ReportSchedule[]> {
    const { data: schedules, error } = await supabase
      .from('report_schedules')
      .select()
      .eq('is_active', true)
      .order('next_run', { ascending: true });

    if (error) throw error;
    return schedules;
  }

  async updateScheduleNextRun(id: string, nextRun: string): Promise<void> {
    const { error } = await supabase
      .from('report_schedules')
      .update({ 
        last_run: new Date().toISOString(),
        next_run: nextRun
      })
      .eq('id', id);

    if (error) throw error;
  }
} 
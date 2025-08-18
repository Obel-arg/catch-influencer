import supabase from '../../config/supabase';
import { Analytics, AnalyticsCreateDTO, AnalyticsUpdateDTO, AnalyticsReport, AnalyticsReportCreateDTO, AnalyticsReportUpdateDTO } from '../../models/analytics/analytics.model';

export class AnalyticsService {
  async createAnalytics(data: AnalyticsCreateDTO): Promise<Analytics> {
    const { data: analytics, error } = await supabase
      .from('analytics')
      .insert([{
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return analytics;
  }

  async getAnalyticsById(id: string): Promise<Analytics> {
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return analytics;
  }

  async getAnalyticsByOrganization(organizationId: string): Promise<Analytics[]> {
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return analytics;
  }

  async getAnalyticsByCampaign(campaignId: string): Promise<Analytics[]> {
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return analytics;
  }

  async getAnalyticsByInfluencer(influencerId: string): Promise<Analytics[]> {
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return analytics;
  }

  async updateAnalytics(id: string, data: AnalyticsUpdateDTO): Promise<Analytics> {
    const { data: analytics, error } = await supabase
      .from('analytics')
      .update({
        ...data,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return analytics;
  }

  async deleteAnalytics(id: string): Promise<void> {
    const { error } = await supabase
      .from('analytics')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Reportes
  async createReport(data: AnalyticsReportCreateDTO, userId: string): Promise<AnalyticsReport> {
    const { data: report, error } = await supabase
      .from('analytics_reports')
      .insert([{
        ...data,
        status: 'active',
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return report;
  }

  async getReportById(id: string): Promise<AnalyticsReport> {
    const { data: report, error } = await supabase
      .from('analytics_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return report;
  }

  async getReportsByOrganization(organizationId: string): Promise<AnalyticsReport[]> {
    const { data: reports, error } = await supabase
      .from('analytics_reports')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return reports;
  }

  async updateReport(id: string, data: AnalyticsReportUpdateDTO): Promise<AnalyticsReport> {
    const { data: report, error } = await supabase
      .from('analytics_reports')
      .update({
        ...data,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return report;
  }

  async deleteReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('analytics_reports')
      .update({
        status: 'deleted',
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async generateReport(id: string): Promise<AnalyticsReport> {
    const report = await this.getReportById(id);
    
    // Aquí iría la lógica para generar el reporte según el formato especificado
    // Por ahora solo actualizamos la fecha de última generación
    
    const { data: updatedReport, error } = await supabase
      .from('analytics_reports')
      .update({
        last_generated: new Date(),
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedReport;
  }

  async getAnalyticsMetrics(organizationId: string, filters: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    campaignId?: string;
    influencerId?: string;
  }): Promise<any> {
    let query = supabase
      .from('analytics')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters.startDate) {
      query = query.gte('start_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('end_date', filters.endDate);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.campaignId) {
      query = query.eq('campaign_id', filters.campaignId);
    }
    if (filters.influencerId) {
      query = query.eq('influencer_id', filters.influencerId);
    }

    const { data: analytics, error } = await query;

    if (error) throw error;

    // Aquí iría la lógica para procesar y agregar las métricas
    // Por ahora retornamos los datos crudos
    return analytics;
  }
} 
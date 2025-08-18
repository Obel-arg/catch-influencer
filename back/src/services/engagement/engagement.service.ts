import supabase from '../../config/supabase';
import { 
  Engagement, 
  EngagementCreateDTO, 
  EngagementUpdateDTO,
  EngagementMetrics,
  EngagementType,
  EngagementPlatform
} from '../../models/engagement/engagement.model';

export class EngagementService {
  async createEngagement(data: EngagementCreateDTO): Promise<Engagement> {
    const { data: engagement, error } = await supabase
      .from('engagements')
      .insert([{
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return engagement;
  }

  async getEngagementById(id: string): Promise<Engagement> {
    const { data: engagement, error } = await supabase
      .from('engagements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return engagement;
  }

  async getEngagementsByContent(contentId: string): Promise<Engagement[]> {
    const { data: engagements, error } = await supabase
      .from('engagements')
      .select('*')
      .eq('content_id', contentId)
      .order('date', { ascending: false });

    if (error) throw error;
    return engagements;
  }

  async getEngagementsByInfluencer(influencerId: string): Promise<Engagement[]> {
    const { data: engagements, error } = await supabase
      .from('engagements')
      .select('*')
      .eq('influencer_id', influencerId)
      .order('date', { ascending: false });

    if (error) throw error;
    return engagements;
  }

  async getEngagementsByCampaign(campaignId: string): Promise<Engagement[]> {
    const { data: engagements, error } = await supabase
      .from('engagements')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('date', { ascending: false });

    if (error) throw error;
    return engagements;
  }

  async updateEngagement(id: string, data: EngagementUpdateDTO): Promise<Engagement> {
    const { data: engagement, error } = await supabase
      .from('engagements')
      .update({
        ...data,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return engagement;
  }

  async deleteEngagement(id: string): Promise<void> {
    const { error } = await supabase
      .from('engagements')
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async getEngagementsByType(type: EngagementType): Promise<Engagement[]> {
    const { data: engagements, error } = await supabase
      .from('engagements')
      .select('*')
      .eq('type', type)
      .order('date', { ascending: false });

    if (error) throw error;
    return engagements;
  }

  async getEngagementsByPlatform(platform: EngagementPlatform): Promise<Engagement[]> {
    const { data: engagements, error } = await supabase
      .from('engagements')
      .select('*')
      .eq('platform', platform)
      .order('date', { ascending: false });

    if (error) throw error;
    return engagements;
  }

  async getEngagementsByDateRange(startDate: Date, endDate: Date): Promise<Engagement[]> {
    const { data: engagements, error } = await supabase
      .from('engagements')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return engagements;
  }

  async calculateEngagementMetrics(
    contentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<EngagementMetrics> {
    let query = supabase
      .from('engagements')
      .select('*')
      .eq('content_id', contentId);

    if (startDate && endDate) {
      query = query
        .gte('date', startDate)
        .lte('date', endDate);
    }

    const { data: engagements, error } = await query;

    if (error) throw error;

    const metrics: EngagementMetrics = {
      total_engagements: 0,
      engagement_rate: 0,
      platform_breakdown: {},
      type_breakdown: {},
      trend: []
    };

    // Procesar los engagements para calcular las métricas
    engagements.forEach(engagement => {
      // Total de engagements
      metrics.total_engagements += engagement.count;

      // Desglose por plataforma
      const platform = engagement.platform as EngagementPlatform;
      const type = engagement.type as EngagementType;
      
      if (!metrics.platform_breakdown[platform]) {
        metrics.platform_breakdown[platform] = {
          total: 0,
          by_type: {}
        };
      }
      metrics.platform_breakdown[platform].total += engagement.count;

      // Desglose por tipo dentro de cada plataforma
      if (!metrics.platform_breakdown[platform].by_type[type]) {
        metrics.platform_breakdown[platform].by_type[type] = 0;
      }
      metrics.platform_breakdown[platform].by_type[type] += engagement.count;

      // Desglose por tipo general
      if (!metrics.type_breakdown[type]) {
        metrics.type_breakdown[type] = 0;
      }
      metrics.type_breakdown[type] += engagement.count;

      // Tendencia
      metrics.trend.push({
        date: new Date(engagement.date),
        count: engagement.count
      });
    });

    // Ordenar la tendencia por fecha
    metrics.trend.sort((a, b) => a.date.getTime() - b.date.getTime());

    return metrics;
  }
} 
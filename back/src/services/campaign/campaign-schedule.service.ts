import supabase from '../../config/supabase';
import { 
  CampaignSchedule, 
  CampaignScheduleCreateDTO, 
  CampaignScheduleUpdateDTO, 
  CampaignScheduleFilters 
} from '../../models/campaign/campaign-schedule.model';

export class CampaignScheduleService {
  
  // Crear un nuevo contenido programado
  async createSchedule(data: CampaignScheduleCreateDTO): Promise<CampaignSchedule> {
    try {
      const { data: schedule, error } = await supabase
        .from('campaign_schedule')
        .insert({
          ...data,
          objectives: data.objectives || [],
          metrics: {},
          assigned_budget: data.assigned_budget || 0,
          actual_cost: 0
        })
        .select(`
          *,
          influencers!inner(
            name,
            avatar
          )
        `)
        .single();

      if (error) {
        console.error('Error creating campaign schedule:', error);
        throw new Error(`Error creating campaign schedule: ${error.message}`);
      }

      // Transformar los datos para usar el avatar de la tabla influencers
      const transformedSchedule = {
        ...schedule,
        influencer_avatar: schedule.influencers?.avatar || schedule.influencer_avatar
      };

      return transformedSchedule;
    } catch (error) {
      console.error('CampaignScheduleService.createSchedule error:', error);
      throw error;
    }
  }

  // Obtener un contenido programado por ID
  async getScheduleById(id: string): Promise<CampaignSchedule | null> {
    try {
      const { data: schedule, error } = await supabase
        .from('campaign_schedule')
        .select(`
          *,
          influencers!inner(
            name,
            avatar
          )
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        console.error('Error fetching campaign schedule:', error);
        throw new Error(`Error fetching campaign schedule: ${error.message}`);
      }

      // Transformar los datos para usar el avatar de la tabla influencers
      const transformedSchedule = schedule ? {
        ...schedule,
        influencer_avatar: schedule.influencers?.avatar || schedule.influencer_avatar
      } : null;

      return transformedSchedule;
    } catch (error) {
      console.error('CampaignScheduleService.getScheduleById error:', error);
      throw error;
    }
  }

  // Obtener todos los contenidos programados de una campaña
  async getSchedulesByCampaign(campaignId: string, filters?: CampaignScheduleFilters): Promise<CampaignSchedule[]> {
    try {
      let query = supabase
        .from('campaign_schedule')
        .select(`
          *,
          influencers!inner(
            name,
            avatar
          )
        `)
        .eq('campaign_id', campaignId)
        .is('deleted_at', null)
        .order('start_date', { ascending: true });

      // Aplicar filtros adicionales
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.platform) {
          query = query.eq('platform', filters.platform);
        }
        if (filters.content_type) {
          query = query.eq('content_type', filters.content_type);
        }
        if (filters.influencer_id) {
          query = query.eq('influencer_id', filters.influencer_id);
        }
        if (filters.start_date) {
          query = query.gte('start_date', filters.start_date.toISOString().split('T')[0]);
        }
        if (filters.end_date) {
          query = query.lte('end_date', filters.end_date.toISOString().split('T')[0]);
        }
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,influencer_name.ilike.%${filters.search}%`);
        }
      }

      const { data: schedules, error } = await query;

      if (error) {
        console.error('Error fetching campaign schedules:', error);
        throw new Error(`Error fetching campaign schedules: ${error.message}`);
      }

      // Transformar los datos para usar el avatar de la tabla influencers
      const transformedSchedules = schedules?.map(schedule => ({
        ...schedule,
        influencer_avatar: schedule.influencers?.avatar || schedule.influencer_avatar // Usar avatar de influencers si está disponible
      })) || [];

      return transformedSchedules;
    } catch (error) {
      console.error('CampaignScheduleService.getSchedulesByCampaign error:', error);
      throw error;
    }
  }

  // Obtener todos los contenidos programados con filtros
  async getSchedules(filters?: CampaignScheduleFilters): Promise<CampaignSchedule[]> {
    try {
      let query = supabase
        .from('campaign_schedule')
        .select(`
          *,
          influencers!inner(
            name,
            avatar
          )
        `)
        .is('deleted_at', null)
        .order('start_date', { ascending: true });

      // Aplicar filtros
      if (filters) {
        if (filters.campaign_id) {
          query = query.eq('campaign_id', filters.campaign_id);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.platform) {
          query = query.eq('platform', filters.platform);
        }
        if (filters.content_type) {
          query = query.eq('content_type', filters.content_type);
        }
        if (filters.influencer_id) {
          query = query.eq('influencer_id', filters.influencer_id);
        }
        if (filters.start_date) {
          query = query.gte('start_date', filters.start_date.toISOString().split('T')[0]);
        }
        if (filters.end_date) {
          query = query.lte('end_date', filters.end_date.toISOString().split('T')[0]);
        }
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,influencer_name.ilike.%${filters.search}%`);
        }
      }

      const { data: schedules, error } = await query;

      if (error) {
        console.error('Error fetching campaign schedules:', error);
        throw new Error(`Error fetching campaign schedules: ${error.message}`);
      }

      // Transformar los datos para usar el avatar de la tabla influencers
      const transformedSchedules = schedules?.map(schedule => ({
        ...schedule,
        influencer_avatar: schedule.influencers?.avatar || schedule.influencer_avatar
      })) || [];

      return transformedSchedules;
    } catch (error) {
      console.error('CampaignScheduleService.getSchedules error:', error);
      throw error;
    }
  }

  // Actualizar un contenido programado
  async updateSchedule(id: string, data: CampaignScheduleUpdateDTO): Promise<CampaignSchedule> {
    try {
      const { data: schedule, error } = await supabase
        .from('campaign_schedule')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at', null)
        .select(`
          *,
          influencers!inner(
            name,
            avatar
          )
        `)
        .single();

      if (error) {
        console.error('Error updating campaign schedule:', error);
        throw new Error(`Error updating campaign schedule: ${error.message}`);
      }

      // Transformar los datos para usar el avatar de la tabla influencers
      const transformedSchedule = {
        ...schedule,
        influencer_avatar: schedule.influencers?.avatar || schedule.influencer_avatar
      };

      return transformedSchedule;
    } catch (error) {
      console.error('CampaignScheduleService.updateSchedule error:', error);
      throw error;
    }
  }

  // Eliminar un contenido programado (soft delete)
  async deleteSchedule(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('campaign_schedule')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting campaign schedule:', error);
        throw new Error(`Error deleting campaign schedule: ${error.message}`);
      }
    } catch (error) {
      console.error('CampaignScheduleService.deleteSchedule error:', error);
      throw error;
    }
  }

  // Actualizar métricas de un contenido
  async updateMetrics(id: string, metrics: Record<string, any>): Promise<CampaignSchedule> {
    try {
      const { data: schedule, error } = await supabase
        .from('campaign_schedule')
        .update({
          metrics,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at', null)
        .select(`
          *,
          influencers!inner(
            name,
            avatar
          )
        `)
        .single();

      if (error) {
        console.error('Error updating campaign schedule metrics:', error);
        throw new Error(`Error updating campaign schedule metrics: ${error.message}`);
      }

      // Transformar los datos para usar el avatar de la tabla influencers
      const transformedSchedule = {
        ...schedule,
        influencer_avatar: schedule.influencers?.avatar || schedule.influencer_avatar
      };

      return transformedSchedule;
    } catch (error) {
      console.error('CampaignScheduleService.updateMetrics error:', error);
      throw error;
    }
  }

  // Actualizar objetivos de un contenido
  async updateObjectives(id: string, objectives: any[]): Promise<CampaignSchedule> {
    try {
      const { data: schedule, error } = await supabase
        .from('campaign_schedule')
        .update({
          objectives,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at', null)
        .select(`
          *,
          influencers!inner(
            name,
            avatar
          )
        `)
        .single();

      if (error) {
        console.error('Error updating campaign schedule objectives:', error);
        throw new Error(`Error updating campaign schedule objectives: ${error.message}`);
      }

      // Transformar los datos para usar el avatar de la tabla influencers
      const transformedSchedule = {
        ...schedule,
        influencer_avatar: schedule.influencers?.avatar || schedule.influencer_avatar
      };

      return transformedSchedule;
    } catch (error) {
      console.error('CampaignScheduleService.updateObjectives error:', error);
      throw error;
    }
  }

  // Obtener estadísticas de una campaña
  async getCampaignStats(campaignId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
  }> {
    try {
      const { data: schedules, error } = await supabase
        .from('campaign_schedule')
        .select('status')
        .eq('campaign_id', campaignId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching campaign stats:', error);
        throw new Error(`Error fetching campaign stats: ${error.message}`);
      }

      const stats = {
        total: schedules?.length || 0,
        pending: schedules?.filter(s => s.status === 'pending').length || 0,
        inProgress: schedules?.filter(s => s.status === 'in-progress').length || 0,
        completed: schedules?.filter(s => s.status === 'completed').length || 0,
        cancelled: schedules?.filter(s => s.status === 'cancelled').length || 0,
        overdue: schedules?.filter(s => s.status === 'overdue').length || 0,
      };

      return stats;
    } catch (error) {
      console.error('CampaignScheduleService.getCampaignStats error:', error);
      throw error;
    }
  }

  /**
   * Obtiene las métricas de posts relacionados con un contenido programado
   */
  async getPostMetricsForSchedule(scheduleId: string): Promise<any> {
    try {
      // Obtener el contenido programado
      const { data: schedule, error: scheduleError } = await supabase
        .from('campaign_schedule')
        .select('content_url')
        .eq('id', scheduleId)
        .single()

      if (scheduleError) throw scheduleError
      if (!schedule) return null

      // Si no tiene content_url, no hay post linkeado
      if (!schedule.content_url || schedule.content_url.trim() === '') {
        return null
      }

      // Buscar métricas por post_url que coincida con content_url
      const { data: metrics, error: metricsError } = await supabase
        .from('post_metrics')
        .select('likes_count, comments_count, views_count, engagement_rate, created_at')
        .eq('post_url', schedule.content_url)
        .order('created_at', { ascending: false })
        .limit(1)

      if (metricsError) {
        console.warn('Error fetching post metrics:', metricsError)
        return null
      }

      // Retornar la métrica más reciente si existe
      if (metrics && metrics.length > 0) {
        return metrics[0]
      }

      return null
    } catch (error) {
      console.error('❌ Error getting post metrics for schedule:', error)
      throw error
    }
  }

  /**
   * Obtiene las métricas de posts para múltiples contenidos programados
   */
  async getPostMetricsForSchedules(scheduleIds: string[]): Promise<Record<string, any>> {
    try {
      const result: Record<string, any> = {}

      // Obtener todos los contenidos programados con content_url
      const { data: schedules, error: schedulesError } = await supabase
        .from('campaign_schedule')
        .select('id, content_url')
        .in('id', scheduleIds)
        .not('content_url', 'is', null)

      if (schedulesError) throw schedulesError
      if (!schedules || schedules.length === 0) return result

      // Buscar métricas para cada schedule que tenga content_url
      for (const schedule of schedules) {
        if (!schedule.content_url || schedule.content_url.trim() === '') continue

        // Buscar métricas por post_url que coincida con content_url
        const { data: metrics, error: metricsError } = await supabase
          .from('post_metrics')
          .select('likes_count, comments_count, views_count, engagement_rate, created_at')
          .eq('post_url', schedule.content_url)
          .order('created_at', { ascending: false })
          .limit(1)

        if (metricsError) {
          console.warn('Error fetching metrics for schedule:', schedule.id, metricsError)
          continue
        }

        // Asignar métricas si existen
        if (metrics && metrics.length > 0) {
          result[schedule.id] = metrics[0]
        }
      }

      return result
    } catch (error) {
      console.error('❌ Error getting batch post metrics for schedules:', error)
      throw error
    }
  }
} 
import { useState, useEffect, useCallback } from 'react';
import { 
  campaignScheduleService, 
  CampaignSchedule, 
  CampaignScheduleCreateDTO, 
  CampaignScheduleUpdateDTO, 
  CampaignScheduleFilters 
} from '@/lib/services/campaign/campaign-schedule.service';
import { influencerPostService } from '@/lib/services/influencer-posts';

export function useCampaignSchedule(campaignId?: string) {
  const [schedules, setSchedules] = useState<CampaignSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
  } | null>(null);

    /**
   * Obtiene las métricas de posts para múltiples contenidos programados
   */
  const getPostMetricsForSchedules = useCallback(async (scheduleIds: string[]) => {
    try {
      // Obtener métricas básicas del schedule service (sin raw_response)
      const result = await campaignScheduleService.getPostMetricsForSchedules(scheduleIds);
      
      
      
      // Retornar métricas básicas - el alcance aproximado se calculará en el ListView
      return result.data || {};
    } catch (error) {
      console.error('🔍 useCampaignSchedule: Error getting basic metrics:', error);
      return {};
    }
  }, [campaignScheduleService])

  // Cargar contenidos programados de una campaña
  const loadSchedules = useCallback(async (filters?: CampaignScheduleFilters) => {
    if (!campaignId) {
      
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await campaignScheduleService.getSchedulesByCampaign(campaignId, filters);
      
      
      
      
      // Handle the API response format: {success: true, data: Array, count: number}
      let data;
      if (response && typeof response === 'object' && 'data' in response) {
        // API returns {success, data, count} format
        data = response.data;
        
      } else {
        // Direct array response (fallback)
        data = response;
        
      }
      
      
      
      
      const processedData = Array.isArray(data) ? data : [];
      
      
      // Cargar métricas de posts para todos los schedules completados
      if (processedData.length > 0) {
        try {
          const completedSchedules = processedData.filter(schedule => 
            schedule.status === 'completed' && schedule.content_url
          );
          
                     if (completedSchedules.length > 0) {
                      
             const scheduleIds = completedSchedules.map(s => s.id);
             const metricsData = await getPostMetricsForSchedules(scheduleIds);
             
             
             // Log detallado de métricas cargadas
              console.log('🔍 [METRICS LOADED] Detalle de métricas cargadas:', {
               totalSchedules: completedSchedules.length,
               metricsDataKeys: Object.keys(metricsData),
               metricsDataDetails: Object.entries(metricsData).map(([scheduleId, metrics]) => ({
                 scheduleId,
                 hasRawResponse: !!(metrics as any).raw_response,
                 rawResponseKeys: (metrics as any).raw_response ? Object.keys((metrics as any).raw_response) : [],
                 dataKeys: (metrics as any).raw_response?.data ? Object.keys((metrics as any).raw_response.data) : [],
                 basicInstagramPostKeys: (metrics as any).raw_response?.data?.basicInstagramPost ? 
                   Object.keys((metrics as any).raw_response.data.basicInstagramPost) : [],
                 views_count: (metrics as any).views_count,
                 engagement_rate: (metrics as any).engagement_rate
               }))
             });
             
             // Debug: mostrar estructura de métricas para Instagram
             Object.entries(metricsData).forEach(([scheduleId, metrics]) => {
               const metricsData = metrics as any;
               if (metricsData.raw_response?.data?.basicInstagramPost) {
                 console.log('🔍 [DEBUG] Instagram raw_response structure for schedule', scheduleId, ':', {
                   hasRawResponse: !!metricsData.raw_response,
                   hasData: !!metricsData.raw_response.data,
                   hasBasicInstagramPost: !!metricsData.raw_response.data.basicInstagramPost,
                   rawFields: Object.keys(metricsData.raw_response.data.basicInstagramPost || {}),
                   views_count: metricsData.views_count,
                   rawViews: metricsData.raw_response.data.basicInstagramPost?.views,
                   rawVideoViews: metricsData.raw_response.data.basicInstagramPost?.videoViews,
                   rawReach: metricsData.raw_response.data.basicInstagramPost?.reach
                 });
               }
             });
            
                         // Enriquecer los schedules con las métricas
             const enrichedData = processedData.map(schedule => {
               if (metricsData[schedule.id]) {
                 // Extraer métricas del raw_response si están disponibles (como en posts)
                 let enrichedMetrics = { ...metricsData[schedule.id] };
                 
                 if (schedule.platform?.toLowerCase() === 'instagram' && 
                     metricsData[schedule.id].raw_response?.data?.basicInstagramPost) {
                   
                   const instagramData = metricsData[schedule.id].raw_response.data.basicInstagramPost;
                   
                   // Buscar alcance en múltiples campos posibles para Instagram (misma lógica que en posts)
                   const reachValue = instagramData.videoViews ?? 
                                     instagramData.views ?? 
                                     instagramData.reach ?? 
                                     instagramData.impressions ?? 
                                     instagramData.viewsCount;
                   
                   if (reachValue && reachValue !== 0) {
                     enrichedMetrics.views_count = reachValue;
                     
                   }
                 }
                 
                 // Log detallado de métricas para este schedule
                 console.log('🔍 [SCHEDULE METRICS] Métricas finales para schedule:', {
                   scheduleId: schedule.id,
                   title: schedule.title,
                   platform: schedule.platform,
                   status: schedule.status,
                   contentUrl: schedule.content_url,
                   originalMetrics: metricsData[schedule.id],
                   enrichedMetrics: enrichedMetrics,
                   hasRawResponse: !!enrichedMetrics.raw_response,
                   rawResponseData: enrichedMetrics.raw_response?.data,
                   instagramData: enrichedMetrics.raw_response?.data?.basicInstagramPost,
                   // Campos específicos para alcance
                   reachFields: {
                     reach: enrichedMetrics.reach,
                     views_count: enrichedMetrics.views_count,
                     views: enrichedMetrics.views,
                     impressions: enrichedMetrics.impressions,
                     reach_count: enrichedMetrics.reach_count,
                     videoViews: enrichedMetrics.videoViews,
                     viewsCount: enrichedMetrics.viewsCount
                   },
                   // Campos específicos para engagement
                   engagementFields: {
                     engagement: enrichedMetrics.engagement,
                     engagement_rate: enrichedMetrics.engagement_rate,
                     engagementPercentage: enrichedMetrics.engagementPercentage,
                     engagement_rate_percent: enrichedMetrics.engagement_rate_percent
                   }
                 });
                 
                 return {
                   ...schedule,
                   realMetrics: enrichedMetrics
                 };
               }
               return schedule;
             });
            
            setSchedules(enrichedData);
            return;
          }
        } catch (metricsError) {
          console.warn('🔍 loadSchedules: Error loading metrics, continuing with basic data:', metricsError);
        }
      }
      
      setSchedules(processedData);
    } catch (err) {
      console.error('🔍 loadSchedules: Error occurred:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los contenidos programados');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [campaignId, getPostMetricsForSchedules]);

  // Cargar estadísticas de la campaña
  const loadStats = useCallback(async () => {
    if (!campaignId) return;
    
    try {
      const data = await campaignScheduleService.getCampaignStats(campaignId);
      setStats(data);
    } catch (err) {
      console.error('Error loading campaign stats:', err);
    }
  }, [campaignId]);

  // Crear nuevo contenido programado
  const createSchedule = useCallback(async (data: CampaignScheduleCreateDTO): Promise<CampaignSchedule | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newSchedule = await campaignScheduleService.createSchedule(data);
      setSchedules(prev => Array.isArray(prev) ? [...prev, newSchedule] : [newSchedule]);
      
      // Recargar estadísticas
      await loadStats();
      
      return newSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el contenido programado');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Actualizar contenido programado
  const updateSchedule = useCallback(async (id: string, data: CampaignScheduleUpdateDTO): Promise<CampaignSchedule | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSchedule = await campaignScheduleService.updateSchedule(id, data);
      setSchedules(prev => Array.isArray(prev) ? prev.map(schedule => 
        schedule.id === id ? updatedSchedule : schedule
      ) : [updatedSchedule]);
      
      return updatedSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el contenido programado');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar contenido programado
  const deleteSchedule = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await campaignScheduleService.deleteSchedule(id);
      setSchedules(prev => Array.isArray(prev) ? prev.filter(schedule => schedule.id !== id) : []);
      
      // Recargar estadísticas
      await loadStats();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el contenido programado');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Actualizar métricas
  const updateMetrics = useCallback(async (id: string, metrics: Record<string, any>): Promise<CampaignSchedule | null> => {
    try {
      const updatedSchedule = await campaignScheduleService.updateMetrics(id, metrics);
      setSchedules(prev => Array.isArray(prev) ? prev.map(schedule => 
        schedule.id === id ? updatedSchedule : schedule
      ) : [updatedSchedule]);
      
      return updatedSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar las métricas');
      return null;
    }
  }, []);

  // Actualizar objetivos
  const updateObjectives = useCallback(async (id: string, objectives: any[]): Promise<CampaignSchedule | null> => {
    try {
      const updatedSchedule = await campaignScheduleService.updateObjectives(id, objectives);
      setSchedules(prev => Array.isArray(prev) ? prev.map(schedule => 
        schedule.id === id ? updatedSchedule : schedule
      ) : [updatedSchedule]);
      
      return updatedSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar los objetivos');
      return null;
    }
  }, []);

  /**
   * Obtiene las métricas de posts para un contenido programado
   */
  const getPostMetricsForSchedule = useCallback(async (scheduleId: string) => {
    try {
      const result = await campaignScheduleService.getPostMetricsForSchedule(scheduleId)
      return result.data
    } catch (error) {
      console.error('🔍 useCampaignSchedule: Error getting post metrics:', error)
      return null
    }
  }, [campaignScheduleService])

  /**
   * Hace matching de métricas reales con objetivos
   */
  const matchMetricsWithObjectives = useCallback((objectives: any[], metrics: any) => {
    if (!metrics || !objectives) return objectives

    return objectives.map(objective => {
      const objectiveTitle = objective.title.toLowerCase()
      
      // Matching por tipo de objetivo
      if (objectiveTitle.includes('alcance') || objectiveTitle.includes('reach') || objectiveTitle.includes('vistas')) {
        const updatedObjective = {
          ...objective,
          current: metrics.views_count?.toString() || '0',
          percentComplete: metrics.views_count && objective.target ? 
            Math.min(100, Math.round((metrics.views_count / parseInt(objective.target.replace(/[^\d]/g, ''))) * 100)) : 
            objective.percentComplete
        }

        if (objective.status === 'completed') {

        }
        
        return updatedObjective
      }
      
      if (objectiveTitle.includes('engagement') || objectiveTitle.includes('interacción') || objectiveTitle.includes('engage')) {
        const engagementRate = metrics.engagement_rate ? (metrics.engagement_rate * 100).toFixed(1) : '0'
        const updatedObjective = {
          ...objective,
          current: `${engagementRate}%`,
          percentComplete: metrics.engagement_rate && objective.target ? 
            Math.min(100, Math.round((metrics.engagement_rate * 100 / parseFloat(objective.target.replace('%', ''))) * 100)) : 
            objective.percentComplete
        }
        
        if (objective.status === 'completed') {

        }
        
        return updatedObjective
      }
      
      if (objectiveTitle.includes('likes') || objectiveTitle.includes('me gusta')) {
        const updatedObjective = {
          ...objective,
          current: metrics.likes_count?.toString() || '0',
          percentComplete: metrics.likes_count && objective.target ? 
            Math.min(100, Math.round((metrics.likes_count / parseInt(objective.target.replace(/[^\d]/g, ''))) * 100)) : 
            objective.percentComplete
        }
        
        if (objective.status === 'completed') {

        }
        
        return updatedObjective
      }
      
      if (objectiveTitle.includes('comentarios') || objectiveTitle.includes('comments')) {
        const updatedObjective = {
          ...objective,
          current: metrics.comments_count?.toString() || '0',
          percentComplete: metrics.comments_count && objective.target ? 
            Math.min(100, Math.round((metrics.comments_count / parseInt(objective.target.replace(/[^\d]/g, ''))) * 100)) : 
            objective.percentComplete
        }
        
        
        if (objective.status === 'completed') {
     
        }
        
        return updatedObjective
      }
      
      if (objectiveTitle.includes('compartidos') || objectiveTitle.includes('shares')) {
        const updatedObjective = {
          ...objective,
          current: metrics.shares_count?.toString() || '0',
          percentComplete: metrics.shares_count && objective.target ? 
            Math.min(100, Math.round((metrics.shares_count / parseInt(objective.target.replace(/[^\d]/g, ''))) * 100)) : 
            objective.percentComplete
        }
        
        if (objective.status === 'completed') {
        
        }
        
        return updatedObjective
      }
      
      return objective
    })
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    if (campaignId) {
      loadSchedules();
      loadStats();
    } else {
    }
  }, [campaignId, loadSchedules, loadStats]);



  return {
    schedules,
    loading,
    error,
    stats,
    loadSchedules,
    loadStats,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    updateMetrics,
    updateObjectives,
    getPostMetricsForSchedule,
    getPostMetricsForSchedules,
    matchMetricsWithObjectives,
    clearError: () => setError(null)
  };
}

// Hook para un contenido programado específico
export function useCampaignScheduleById(id: string) {
  const [schedule, setSchedule] = useState<CampaignSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await campaignScheduleService.getScheduleById(id);
      setSchedule(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el contenido programado');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadSchedule();
    }
  }, [id, loadSchedule]);

  return {
    schedule,
    loading,
    error,
    loadSchedule,
    clearError: () => setError(null)
  };
} 
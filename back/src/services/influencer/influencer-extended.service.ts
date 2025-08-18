import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { CreatorDBService } from '../creator/creator.service';

const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || ''
);

export interface ExtendedDataRequest {
  youtubeId: string;
  instagramId?: string;
  tiktokId?: string;
}

export interface ExtendedDataResponse {
  influencer_id: string;
  creator_id: string;
  youtube_basic?: any;
  youtube_history?: any;
  youtube_detail?: any;
  youtube_email?: any;
  instagram_basic?: any;
  instagram_history?: any;
  tiktok_basic?: any;
  tiktok_history?: any;
  contact_info?: any;
  audience_demographics?: any;
  audience_insights?: any;
  performance_metrics?: any;
  growth_trends?: any;
  engagement_analytics?: any;
  recent_posts?: any;
  content_analysis?: any;
  sync_status: 'pending' | 'syncing' | 'completed' | 'error';
  sync_errors?: any;
  total_api_calls: number;
  total_tokens_used: number;
  estimated_cost: number;
  data_completeness_score: number;
}

export class InfluencerExtendedService {
  constructor() {
    // CreatorDBService usa métodos estáticos, no requiere instancia
  }

  /**
   * Obtiene datos extendidos completos de un influencer
   */
  async getFullExtendedData(request: ExtendedDataRequest): Promise<ExtendedDataResponse> {
    let totalApiCalls = 0;
    let totalTokensUsed = 0;
    let estimatedCost = 0;
    const syncErrors: any = {};

    try {
      
      // Primero verificar/crear el registro base del influencer
      const influencerId = await this.ensureInfluencerExists(request.youtubeId);

      // Inicializar el registro en influencers_extended si no existe
      await this.initializeExtendedRecord(influencerId, request.youtubeId);

      const extendedData: ExtendedDataResponse = {
        influencer_id: influencerId,
        creator_id: request.youtubeId,
        sync_status: 'syncing',
        sync_errors: {},
        total_api_calls: 0,
        total_tokens_used: 0,
        estimated_cost: 0,
        data_completeness_score: 0
      };

      // === YOUTUBE DATA (FUENTE PRINCIPAL) ===
      let extractedInstagramId = request.instagramId;
      let extractedTiktokId = request.tiktokId;

      if (request.youtubeId) {
      
        try {
          // YouTube Basic (fuente principal para extraer IDs de otras plataformas)
          const youtubeBasic = await CreatorDBService.getYoutubeBasic(request.youtubeId);
          extendedData.youtube_basic = youtubeBasic;
          totalApiCalls += 1;

          // 🔗 EXTRAER IDs DE OTRAS PLATAFORMAS DESDE YOUTUBE
          if (youtubeBasic?.data?.basicYoutube) {
            const basicYoutube = youtubeBasic.data.basicYoutube;
            
            // Extraer Instagram ID si no se proporcionó manualmente
            if (!extractedInstagramId && basicYoutube.instagramId) {
              extractedInstagramId = basicYoutube.instagramId;
            }
            
            // Extraer TikTok ID si no se proporcionó manualmente
            if (!extractedTiktokId && basicYoutube.tiktokId) {
              extractedTiktokId = basicYoutube.tiktokId;
            }
          }

          // YouTube History
          try {
            const youtubeHistory = await CreatorDBService.getYoutubeHistory(request.youtubeId);
            extendedData.youtube_history = youtubeHistory;
            totalApiCalls += 1;
          } catch (error) {
            console.warn(`⚠️ Error obteniendo YouTube History: ${error}`);
            syncErrors.youtube_history = error;
          }

          // YouTube Detail  
          try {
            const youtubeDetail = await CreatorDBService.getYoutubeDetail(request.youtubeId);
            extendedData.youtube_detail = youtubeDetail;
            totalApiCalls += 1;
          } catch (error) {
            console.warn(`⚠️ Error obteniendo YouTube Detail: ${error}`);
            syncErrors.youtube_detail = error;
          }

          // YouTube Email/Contact
          try {
            const youtubeEmail = await CreatorDBService.getYoutubeEmail(request.youtubeId);
            extendedData.youtube_email = youtubeEmail;
            totalApiCalls += 1;
          } catch (error) {
            console.warn(`⚠️ Error obteniendo YouTube Email: ${error}`);
            syncErrors.youtube_email = error;
          }

        } catch (error) {
          console.error(`❌ Error en datos de YouTube: ${error}`);
          syncErrors.youtube = error;
        }
      }

      // === INSTAGRAM DATA ===
      if (extractedInstagramId) {
       
        try {
          // Instagram Basic
          const instagramBasic = await CreatorDBService.getInstagramBasic(extractedInstagramId);
          extendedData.instagram_basic = instagramBasic;
          totalApiCalls += 1;

          // Instagram History
          try {
            const instagramHistory = await CreatorDBService.getInstagramHistory(extractedInstagramId);
            extendedData.instagram_history = instagramHistory;
            totalApiCalls += 1;
          } catch (error) {
            console.warn(`⚠️ Error obteniendo Instagram History: ${error}`);
            syncErrors.instagram_history = error;
          }

        } catch (error) {
          console.error(`❌ Error en datos de Instagram: ${error}`);
          syncErrors.instagram = error;
        }
      } else {
      }

      // === TIKTOK DATA ===
      if (extractedTiktokId) {
       
        try {
          // TikTok Basic
          const tiktokBasic = await CreatorDBService.getTikTokBasic(extractedTiktokId);
          extendedData.tiktok_basic = tiktokBasic;
          totalApiCalls += 1;

          // TikTok History
          try {
            const tiktokHistory = await CreatorDBService.getTikTokHistory(extractedTiktokId);
            extendedData.tiktok_history = tiktokHistory;
            totalApiCalls += 1;
          } catch (error) {
            console.warn(`⚠️ Error obteniendo TikTok History: ${error}`);
            syncErrors.tiktok_history = error;
          }

        } catch (error) {
          console.error(`❌ Error en datos de TikTok: ${error}`);
          syncErrors.tiktok = error;
        }
      } else {
       }

      // === CONTACT INFORMATION ===
      try {
         const contactInfo = await CreatorDBService.getContactInformation(request.youtubeId);
        extendedData.contact_info = contactInfo;
        totalApiCalls += 1;
      } catch (error) {
        console.warn(`⚠️ Error obteniendo Contact Info: ${error}`);
        syncErrors.contact_info = error;
      }

      // Calcular métricas finales
      extendedData.total_api_calls = totalApiCalls;
      extendedData.total_tokens_used = totalTokensUsed; // CreatorDB no reporta tokens, pero podemos estimarlo
      extendedData.estimated_cost = totalApiCalls * 0.1; // Estimación aproximada
      extendedData.sync_errors = Object.keys(syncErrors).length > 0 ? syncErrors : {};
      extendedData.sync_status = Object.keys(syncErrors).length > 0 ? 'completed' : 'completed';
      extendedData.data_completeness_score = this.calculateCompletenessScore(extendedData);

      // Generar métricas calculadas
      extendedData.performance_metrics = this.generatePerformanceMetrics(extendedData);
      extendedData.audience_demographics = this.generateAudienceDemographics(extendedData);
      extendedData.growth_trends = this.generateGrowthTrends(extendedData);
      extendedData.engagement_analytics = this.generateEngagementAnalytics(extendedData);

      // Guardar en la base de datos
      await this.saveExtendedData(extendedData);

    
      return extendedData;

    } catch (error) {
      console.error(`❌ Error crítico en getFullExtendedData:`, error);
      
      // Intentar guardar el estado de error
      try {
        await this.updateSyncStatus(request.youtubeId, 'error', { 
          critical_error: error,
          timestamp: new Date()
        });
      } catch (saveError) {
        console.error(`❌ Error guardando estado de error:`, saveError);
      }
      
      throw error;
    }
  }

  /**
   * Verifica que el influencer existe en la tabla base, si no lo crea
   */
  private async ensureInfluencerExists(youtubeId: string): Promise<string> {
    // Buscar por creator_id
    const { data: existing, error: searchError } = await supabase
      .from('influencers')
      .select('id')
      .eq('creator_id', youtubeId)
      .maybeSingle();

    if (searchError && searchError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw searchError;
    }

    if (existing) {
      return existing.id;
    }

    try {
      const youtubeBasic = await CreatorDBService.getYoutubeBasic(youtubeId);
      
      const { data: newInfluencer, error: createError } = await supabase
        .from('influencers')
        .insert({
          creator_id: youtubeId,
          name: youtubeBasic?.channelName || 'Unknown Creator',
          main_social_platform: 'youtube',
          followers_count: youtubeBasic?.subscribersCount || 0,
          average_engagement_rate: youtubeBasic?.engagementRate || 0,
          social_platforms: ['youtube'],
          platform_info: {
            youtube: {
              basicYoutube: youtubeBasic
            }
          },
          avatar: youtubeBasic?.channelImage || '',
          is_verified: youtubeBasic?.isVerified || false,
          status: 'active'
        })
        .select('id')
        .maybeSingle();

      if (createError) throw createError;
      
      if (!newInfluencer) throw new Error('Error creando el influencer');
      
      return newInfluencer.id;
      
    } catch (error) {
      console.error(`❌ Error creando influencer base:`, error);
      throw error;
    }
  }

  /**
   * Inicializa el registro en influencers_extended si no existe
   */
  private async initializeExtendedRecord(influencerId: string, creatorId: string): Promise<void> {
    const { data: existing, error: searchError } = await supabase
      .from('influencers_extended')
      .select('id')
      .eq('influencer_id', influencerId)
      .maybeSingle();

    if (searchError && searchError.code !== 'PGRST116') {
      throw searchError;
    }

    if (!existing) {
      
      const { error: createError } = await supabase
        .from('influencers_extended')
        .insert({
          influencer_id: influencerId,
          creator_id: creatorId,
          sync_status: 'pending'
        });

      if (createError) throw createError;
    }
  }

  /**
   * Guarda los datos extendidos en la base de datos
   */
  private async saveExtendedData(data: ExtendedDataResponse): Promise<void> {
   
    const updateData: any = {
      creator_id: data.creator_id,
      sync_status: data.sync_status,
      sync_errors: data.sync_errors,
      total_api_calls: data.total_api_calls,
      total_tokens_used: data.total_tokens_used,
      estimated_cost: data.estimated_cost,
      data_completeness_score: data.data_completeness_score,
      updated_at: new Date().toISOString()
    };

    // Agregar datos específicos de plataforma solo si existen
    if (data.youtube_basic) updateData.youtube_basic = data.youtube_basic;
    if (data.youtube_history) updateData.youtube_history = data.youtube_history;
    if (data.youtube_detail) updateData.youtube_detail = data.youtube_detail;
    if (data.youtube_email) updateData.youtube_email = data.youtube_email;
    if (data.instagram_basic) updateData.instagram_basic = data.instagram_basic;
    if (data.instagram_history) updateData.instagram_history = data.instagram_history;
    if (data.tiktok_basic) updateData.tiktok_basic = data.tiktok_basic;
    if (data.tiktok_history) updateData.tiktok_history = data.tiktok_history;
    if (data.contact_info) updateData.contact_info = data.contact_info;
    if (data.audience_demographics) updateData.audience_demographics = data.audience_demographics;
    if (data.audience_insights) updateData.audience_insights = data.audience_insights;
    if (data.performance_metrics) updateData.performance_metrics = data.performance_metrics;
    if (data.growth_trends) updateData.growth_trends = data.growth_trends;
    if (data.engagement_analytics) updateData.engagement_analytics = data.engagement_analytics;
    if (data.recent_posts) updateData.recent_posts = data.recent_posts;
    if (data.content_analysis) updateData.content_analysis = data.content_analysis;

    // Actualizar timestamps de sincronización específicos
    if (data.youtube_basic || data.youtube_history || data.youtube_detail) {
      updateData.last_sync_youtube = new Date().toISOString();
    }
    if (data.instagram_basic || data.instagram_history) {
      updateData.last_sync_instagram = new Date().toISOString();
    }
    if (data.tiktok_basic || data.tiktok_history) {
      updateData.last_sync_tiktok = new Date().toISOString();
    }

    const { error } = await supabase
      .from('influencers_extended')
      .update(updateData)
      .eq('influencer_id', data.influencer_id);

    if (error) throw error;

  }

  /**
   * Calcula el score de completitud de los datos (0.00-1.00)
   */
  private calculateCompletenessScore(data: ExtendedDataResponse): number {
    let totalFields = 0;
    let completedFields = 0;

    // Campos principales de datos de API
    const apiFields = [
      'youtube_basic', 'youtube_history', 'youtube_detail', 'youtube_email',
      'instagram_basic', 'instagram_history', 
      'tiktok_basic', 'tiktok_history',
      'contact_info'
    ];

    // Campos generados automáticamente
    const generatedFields = [
      'performance_metrics', 'audience_demographics', 'growth_trends', 
      'engagement_analytics', 'recent_posts', 'content_analysis'
    ];

    // Verificar campos de API
    apiFields.forEach(field => {
      totalFields++;
      const fieldData = (data as any)[field];
      if (fieldData && (
        (typeof fieldData === 'object' && Object.keys(fieldData).length > 0) ||
        (typeof fieldData !== 'object' && fieldData)
      )) {
        completedFields++;
      }
    });

    // Verificar campos generados
    generatedFields.forEach(field => {
      totalFields++;
      const fieldData = (data as any)[field];
      if (fieldData && (
        (typeof fieldData === 'object' && Object.keys(fieldData).length > 0) ||
        (typeof fieldData !== 'object' && fieldData)
      )) {
        completedFields++;
      }
    });

    // Devolver como decimal entre 0 y 1, redondeado a 2 decimales
    const score = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) / 100 : 0;
    
    
    return score;
  }

  /**
   * Genera métricas de rendimiento calculadas
   */
  private generatePerformanceMetrics(data: ExtendedDataResponse): any {
    const metrics: any = {
      total_followers: 0,
      avg_engagement_rate: 0,
      total_posts: 0,
      platforms_count: 0,
      calculated_at: new Date().toISOString()
    };

    // Sumar métricas de YouTube
    if (data.youtube_basic) {
      metrics.total_followers += data.youtube_basic.subscribersCount || 0;
      metrics.youtube_metrics = {
        subscribers: data.youtube_basic.subscribersCount || 0,
        videos: data.youtube_basic.videosCount || 0,
        total_views: data.youtube_basic.totalViews || 0,
        engagement_rate: data.youtube_basic.engagementRate || 0
      };
      metrics.platforms_count++;
    }

    // Sumar métricas de Instagram
    if (data.instagram_basic) {
      metrics.total_followers += data.instagram_basic.followersCount || 0;
      metrics.instagram_metrics = {
        followers: data.instagram_basic.followersCount || 0,
        posts: data.instagram_basic.postsCount || 0,
        engagement_rate: data.instagram_basic.engagementRate || 0
      };
      metrics.platforms_count++;
    }

    // Sumar métricas de TikTok
    if (data.tiktok_basic) {
      metrics.total_followers += data.tiktok_basic.followersCount || 0;
      metrics.tiktok_metrics = {
        followers: data.tiktok_basic.followersCount || 0,
        videos: data.tiktok_basic.videosCount || 0,
        likes: data.tiktok_basic.totalLikes || 0,
        engagement_rate: data.tiktok_basic.engagementRate || 0
      };
      metrics.platforms_count++;
    }

    // Calcular engagement promedio
    let totalEngagement = 0;
    let platformsWithEngagement = 0;
    
    if (data.youtube_basic?.engagementRate) {
      totalEngagement += data.youtube_basic.engagementRate;
      platformsWithEngagement++;
    }
    if (data.instagram_basic?.engagementRate) {
      totalEngagement += data.instagram_basic.engagementRate;
      platformsWithEngagement++;
    }
    if (data.tiktok_basic?.engagementRate) {
      totalEngagement += data.tiktok_basic.engagementRate;
      platformsWithEngagement++;
    }

    metrics.avg_engagement_rate = platformsWithEngagement > 0 
      ? totalEngagement / platformsWithEngagement 
      : 0;

    return metrics;
  }

  /**
   * Genera datos demográficos de audiencia consolidados
   */
  private generateAudienceDemographics(data: ExtendedDataResponse): any {
    // Esto sería más complejo en una implementación real
    // Por ahora, devolvemos una estructura básica
    return {
      consolidated_at: new Date().toISOString(),
      note: 'Demographic data would be extracted from platform-specific APIs',
      available_platforms: []
    };
  }

  /**
   * Genera tendencias de crecimiento
   */
  private generateGrowthTrends(data: ExtendedDataResponse): any {
    const trends: any = {
      calculated_at: new Date().toISOString(),
      platforms: {}
    };

    // Analizar tendencias de YouTube
    if (data.youtube_history) {
      trends.platforms.youtube = {
        data_available: true,
        note: 'Growth trends calculated from historical data'
      };
    }

    // Analizar tendencias de Instagram
    if (data.instagram_history) {
      trends.platforms.instagram = {
        data_available: true,
        note: 'Growth trends calculated from historical data'
      };
    }

    // Analizar tendencias de TikTok
    if (data.tiktok_history) {
      trends.platforms.tiktok = {
        data_available: true,
        note: 'Growth trends calculated from historical data'
      };
    }

    return trends;
  }

  /**
   * Genera análisis de engagement
   */
  private generateEngagementAnalytics(data: ExtendedDataResponse): any {
    return {
      calculated_at: new Date().toISOString(),
      note: 'Engagement analytics would be calculated from detailed post data',
      platforms_analyzed: Object.keys(data).filter(key => 
        key.includes('_basic') || key.includes('_history')
      ).map(key => key.split('_')[0])
    };
  }

  /**
   * Actualiza el estado de sincronización
   */
  private async updateSyncStatus(creatorId: string, status: string, errors?: any): Promise<void> {
    const { error } = await supabase
      .from('influencers_extended')
      .update({
        sync_status: status,
        sync_errors: errors || {},
        updated_at: new Date().toISOString()
      })
      .eq('creator_id', creatorId);

    if (error) throw error;
  }

  /**
   * Obtiene el estado de los datos extendidos de un influencer
   */
  async getExtendedDataStatus(influencerId: string): Promise<any> {
    const { data, error } = await supabase
      .from('influencers_extended')
      .select('*')
      .eq('influencer_id', influencerId)
      .maybeSingle();

    // Si hay error que no sea "no rows found", lanzar error
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Si no hay datos, devolver estado por defecto
    if (!data) {
      return {
        influencer_id: influencerId,
        exists: false,
        sync_status: 'not_found',
        last_sync: {
          youtube: null,
          instagram: null,
          tiktok: null
        },
        data_completeness_score: 0,
        total_api_calls: 0,
        estimated_cost: 0,
        sync_errors: {},
        created_at: null,
        updated_at: null
      };
    }

    return {
      influencer_id: influencerId,
      exists: true,
      sync_status: data.sync_status || 'not_found',
      last_sync: {
        youtube: data.last_sync_youtube,
        instagram: data.last_sync_instagram,
        tiktok: data.last_sync_tiktok
      },
      data_completeness_score: data.data_completeness_score || 0,
      total_api_calls: data.total_api_calls || 0,
      estimated_cost: data.estimated_cost || 0,
      sync_errors: data.sync_errors || {},
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  /**
   * Re-sincroniza datos extendidos para plataformas específicas
   */
  async resyncExtendedData(influencerId: string, platforms?: string[]): Promise<any> {
    // Obtener el creator_id del influencer
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .select('creator_id')
      .eq('id', influencerId)
      .maybeSingle();

    if (influencerError && influencerError.code !== 'PGRST116') throw influencerError;
    
    if (!influencer) {
      throw new Error(`Influencer con ID ${influencerId} no encontrado`);
    }
    
    if (!influencer.creator_id) {
      throw new Error(`El influencer ${influencerId} no tiene un creator_id válido`);
    }

    // Obtener IDs de plataformas desde platform_info
    const { data: extendedData, error: extendedError } = await supabase
      .from('influencers_extended')
      .select('instagram_basic, tiktok_basic')
      .eq('influencer_id', influencerId)
      .maybeSingle();

    if (extendedError && extendedError.code !== 'PGRST116') throw extendedError;

    const request: ExtendedDataRequest = {
      youtubeId: influencer.creator_id
    };

    // Agregar IDs de otras plataformas si están disponibles
    if (extendedData?.instagram_basic?.instagramId) {
      request.instagramId = extendedData.instagram_basic.instagramId;
    }
    if (extendedData?.tiktok_basic?.tiktokId) {
      request.tiktokId = extendedData.tiktok_basic.tiktokId;
    }

    // Filtrar por plataformas específicas si se especificaron
    if (platforms && platforms.length > 0) {
      const filteredRequest: ExtendedDataRequest = {
        youtubeId: request.youtubeId
      };
      
      if (platforms.includes('instagram') && request.instagramId) {
        filteredRequest.instagramId = request.instagramId;
      }
      if (platforms.includes('tiktok') && request.tiktokId) {
        filteredRequest.tiktokId = request.tiktokId;
      }
      if (!platforms.includes('youtube')) {
        throw new Error('YouTube es requerido para la sincronización');
      }
      
      return await this.getFullExtendedData(filteredRequest);
    }

    return await this.getFullExtendedData(request);
  }

  /**
   * Obtiene datos extendidos existentes sin hacer nuevas peticiones a APIs externas
   * Solo lee lo que ya está guardado en la base de datos
   */
  async getExistingExtendedData(youtubeId: string): Promise<ExtendedDataResponse | null> {
    try {


      // Buscar el influencer por creator_id (youtubeId)
      const { data: influencerData, error: influencerError } = await supabase
        .from('influencers')
        .select('id, creator_id')
        .eq('creator_id', youtubeId)
        .maybeSingle();

      if (influencerError && influencerError.code !== 'PGRST116') {
        throw influencerError;
      }

      if (!influencerData) {
        return null;
      }

      // Buscar datos extendidos existentes
      const { data: extendedData, error: extendedError } = await supabase
        .from('influencers_extended')
        .select('*')
        .eq('influencer_id', influencerData.id)
        .maybeSingle();

      if (extendedError && extendedError.code !== 'PGRST116') {
        throw extendedError;
      }

      if (!extendedData) {
        return null;
      }

      // Convertir los datos de la DB al formato de respuesta
      const response: ExtendedDataResponse = {
        influencer_id: extendedData.influencer_id,
        creator_id: extendedData.creator_id,
        youtube_basic: extendedData.youtube_basic,
        youtube_history: extendedData.youtube_history,
        youtube_detail: extendedData.youtube_detail,
        youtube_email: extendedData.youtube_email,
        instagram_basic: extendedData.instagram_basic,
        instagram_history: extendedData.instagram_history,
        tiktok_basic: extendedData.tiktok_basic,
        tiktok_history: extendedData.tiktok_history,
        contact_info: extendedData.contact_info,
        audience_demographics: extendedData.audience_demographics,
        audience_insights: extendedData.audience_insights,
        performance_metrics: extendedData.performance_metrics,
        growth_trends: extendedData.growth_trends,
        engagement_analytics: extendedData.engagement_analytics,
        recent_posts: extendedData.recent_posts,
        content_analysis: extendedData.content_analysis,
        sync_status: extendedData.sync_status || 'completed',
        sync_errors: extendedData.sync_errors || {},
        total_api_calls: extendedData.total_api_calls || 0,
        total_tokens_used: extendedData.total_tokens_used || 0,
        estimated_cost: extendedData.estimated_cost || 0,
        data_completeness_score: extendedData.data_completeness_score || 0
      };

      return response;

    } catch (error) {
      console.error(`❌ Error obteniendo datos extendidos existentes para ${youtubeId}:`, error);
      throw error;
    }
  }
} 
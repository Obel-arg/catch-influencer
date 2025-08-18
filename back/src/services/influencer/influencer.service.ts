import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { 
  Influencer, 
  InfluencerCreateDTO, 
  InfluencerUpdateDTO,
  InfluencerTeam,
  InfluencerTeamCreateDTO,
  InfluencerTeamUpdateDTO,
  InfluencerCampaign,
  InfluencerCampaignCreateDTO,
  InfluencerCampaignUpdateDTO
} from '../../models/influencer/influencer.model';
import { InfluencerYoutubeService, YoutubeBasic } from './influencer.youtube.service';
import { InfluencerInstagramService, InstagramBasic } from './influencer.instagram.service';
import { InfluencerTiktokService, TiktokBasic } from './influencer.tiktok.service';
import { InfluencerCacheService } from './influencer-cache.service';

const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || ''
);

export class InfluencerService {
  private static cacheService = new InfluencerCacheService();

  // ... (CRUD, equipos, campañas, stats igual que antes)

  /**
   * Obtiene la data unificada de un influencer a partir de youtubeId, instagramId o tiktokId.
   * Primero busca en la base de datos local, si no encuentra o está desactualizado, consulta las APIs.
   */
  async getFullInfluencerData(params: { youtubeId?: string, instagramId?: string, tiktokId?: string }, forceRefresh: boolean = false): Promise<any> {
    const { youtubeId, instagramId, tiktokId } = params;
    
    // 🎯 ARREGLO: Usar todos los IDs disponibles, no solo uno
    const allIds = [youtubeId, instagramId, tiktokId].filter(Boolean);
    const creatorId = allIds[0]; // Usar el primer ID para compatibilidad
    
    if (!creatorId) return null;

    try {
      // 1. Primero intentar obtener de la base de datos local
      const { data: localData, error: localError } = await supabase
        .from('influencers')
        .select('*')
        .eq('creator_id', creatorId)
        .single();

      // Si encontramos datos locales y no están desactualizados (menos de 24 horas) Y no se fuerza refresh
      if (localData && !localError && !forceRefresh) {
        const lastUpdate = new Date(localData.updated_at);
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate < 24) {
          console.log(`✅ [INFLUENCER SERVICE] Datos encontrados en BD local para ${creatorId}`);
          return this.transformCacheToFullData(localData);
        } 
      }

      console.log(`🔄 [INFLUENCER SERVICE] Obteniendo datos frescos para IDs: ${allIds.join(', ')}${forceRefresh ? ' (FORZADO)' : ''}`);

      // 2. Si no hay datos locales o están desactualizados, obtener de las APIs
      let basic: YoutubeBasic | InstagramBasic | TiktokBasic | null = null;
      let yt: YoutubeBasic | null = null;
      let tiktok: TiktokBasic | null = null;
      let instagram: InstagramBasic | null = null;
      let currentYoutubeId = youtubeId;
      let currentTiktokId = tiktokId;
      let currentInstagramId = instagramId;

      // 🎯 NUEVA LÓGICA: Hacer peticiones a TODAS las plataformas disponibles
      const promises: Promise<{ platform: string; data?: any; error?: any }>[] = [];

      // Petición a Instagram si está disponible
      if (currentInstagramId) {
        promises.push(
          InfluencerInstagramService.getBasic(currentInstagramId)
            .then(result => ({ platform: 'instagram', data: result }))
            .catch(error => ({ platform: 'instagram', error }))
        );
      }

      // Petición a YouTube si está disponible
      if (currentYoutubeId) {
        promises.push(
          InfluencerYoutubeService.getBasic(currentYoutubeId)
            .then(result => ({ platform: 'youtube', data: result }))
            .catch(error => ({ platform: 'youtube', error }))
        );
      }

      // Petición a TikTok si está disponible
      if (currentTiktokId) {
        promises.push(
          InfluencerTiktokService.getBasic(currentTiktokId)
            .then(result => ({ platform: 'tiktok', data: result }))
            .catch(error => ({ platform: 'tiktok', error }))
        );
      }

      // 🎯 NUEVO: Ejecutar TODAS las peticiones en paralelo
      const results = await Promise.allSettled(promises);
      
      // Procesar resultados
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { platform, data, error } = result.value;
          
          if (data && !error) {
            console.log(`✅ [INFLUENCER SERVICE] Datos obtenidos de ${platform}`);
            
            if (platform === 'instagram') {
              instagram = data;
              if (!basic) basic = data;
            } else if (platform === 'youtube') {
              yt = data;
              if (!basic) basic = data;
            } else if (platform === 'tiktok') {
              tiktok = data;
              if (!basic) basic = data;
            }
          } else {
            console.warn(`⚠️ [INFLUENCER SERVICE] Error obteniendo datos de ${platform}:`, error);
          }
        } else {
          console.error(`❌ [INFLUENCER SERVICE] Error en petición:`, result.reason);
        }
      });

      // Si no obtuvimos datos de ninguna plataforma, retornar null
      if (!basic) {
        
        return null;
      }

      // Obtener los otros perfiles si tenemos los ids
      if (!tiktok && currentTiktokId) {
        try { 
          tiktok = await InfluencerTiktokService.getBasic(currentTiktokId); 
        } catch (error) {
        }
        // Fallback: si no hay datos y tenemos nombre de YouTube, intentar buscar por nombre
        if (!tiktok && yt && yt.youtubeName) {
          try { 
            tiktok = await InfluencerTiktokService.getBasic(yt.youtubeName); 
                     } catch (error) {
           }
        }
      }
      
      if (!instagram && currentInstagramId) {
        try { 
          instagram = await InfluencerInstagramService.getBasic(currentInstagramId); 
                 } catch (error) {
         }
        // Fallback: si no hay datos y tenemos nombre de YouTube, intentar buscar por nombre
        if (!instagram && yt && yt.youtubeName) {
          try { 
            instagram = await InfluencerInstagramService.getBasic(yt.youtubeName); 
                     } catch (error) {  
           }
        }
      }
      
      

      // Obtener los topics/niches de YouTube si es la plataforma principal
      const topics: string[] = [];
      const niches: string[] = [];
      // TODO: Implementar la obtención de topics/niches desde CreatorDB o una fuente similar.
      // La siguiente llamada a getTopics está comentada porque el método no existe en InfluencerYoutubeService.
      /*
      if (currentYoutubeId) {
        try {
          // const topicData = await InfluencerYoutubeService.getTopics(currentYoutubeId);
          // if (topicData) {
          //   topics = topicData.topic_list?.map((t: any) => t.topic) || [];
          //   niches = topicData.niche_list?.map((n: any) => n.niche) || [];
          // }
        } catch {}
      }
      */

      // Crear el objeto unificado con mejor lógica para nombres y engagement
      let influencerName = 'Influencer';
      
      // Intentar diferentes variaciones de nombres para cada plataforma
      if (yt) {
        influencerName = yt.youtubeName || yt.channelTitle || yt.name || yt.title || influencerName;
      } else if (instagram) {
        // 🔧 CORREGIR: Instagram devuelve directamente el objeto, no envuelto en basicInstagram
        const igData = instagram.basicInstagram || instagram;
        influencerName = igData.instagramName || igData.username || igData.name || igData.title || igData.displayName || influencerName;
        
      } else if (tiktok) {
        // 🔧 SIMILAR: Manejar tanto wrapper como directo para TikTok
        const tkData = tiktok.basicTikTok || tiktok;
        influencerName = tkData.tiktokName || tkData.username || tkData.name || tkData.title || tkData.displayName || influencerName;
      }
      
      // Fallback general si aún no se encontró un nombre válido
      if (influencerName === 'Influencer') {
        influencerName = (basic as any).youtubeName || (basic as any).channelTitle || (basic as any).name ||
                        (basic as any).instagramName || (basic as any).username || 
                        (basic as any).tiktokName || (basic as any).displayName || 'Influencer';
      }
      
      
      
      // Determinar plataformas basado en datos reales, no solo IDs
      const hasYouTube = yt !== null && yt !== undefined && Object.keys(yt).length > 0;
      const hasInstagram = instagram !== null && instagram !== undefined && Object.keys(instagram).length > 0;
      const hasTikTok = tiktok !== null && tiktok !== undefined && Object.keys(tiktok).length > 0;
      
      // Determinar main platform basado en qué plataforma tiene datos
      let mainPlatform = 'youtube'; // default
      if (hasInstagram && !hasYouTube) {
        mainPlatform = 'instagram';
      } else if (hasTikTok && !hasYouTube && !hasInstagram) {
        mainPlatform = 'tiktok';
      } else if (hasYouTube) {
        mainPlatform = 'youtube';
      } else if (hasInstagram) {
        mainPlatform = 'instagram';
      } else if (hasTikTok) {
        mainPlatform = 'tiktok';
      }
      
      // Obtener el mejor avatar disponible de cualquier plataforma
      let bestAvatar = basic?.avatar || '';
      
      // 🔧 CORREGIR: Manejar tanto wrapper como directo para todas las plataformas
      if (!bestAvatar && instagram) {
        const igData = instagram.basicInstagram || instagram;
        bestAvatar = igData.avatar;

      } 
      if (!bestAvatar && yt?.avatar) {
        bestAvatar = yt.avatar;
      } 
      if (!bestAvatar && tiktok) {
        const tkData = tiktok.basicTikTok || tiktok;
        bestAvatar = tkData.avatar;
      }
      
      const fullData = {
        creatorId: currentYoutubeId || currentInstagramId || currentTiktokId,
        name: influencerName,
        avatar: bestAvatar,
        country: (() => {
          // Prioridad 1: YouTube country
          if (yt && yt.country && yt.country.trim()) {
            return yt.country.trim();
          }
          // Prioridad 2: Instagram country
          if (instagram) {
            const igData = instagram.basicInstagram || instagram;
            if (igData.country && igData.country.trim()) {
              return igData.country.trim();
            }
          }
          // Prioridad 3: TikTok country
          if (tiktok) {
            const tkData = tiktok.basicTikTok || tiktok;
            if (tkData.country && tkData.country.trim()) {
              return tkData.country.trim();
            }
          }
          // Prioridad 4: Basic country
          if (basic && (basic as any).country && (basic as any).country.trim()) {
            return (basic as any).country.trim();
          }
          // Fallback: null si no hay datos
          return null;
        })(),
        language: (() => {
          // Prioridad 1: YouTube language
          if (yt && yt.lang && yt.lang.trim()) {
            return yt.lang.trim();
          }
          // Prioridad 2: Instagram language
          if (instagram) {
            const igData = instagram.basicInstagram || instagram;
            if (igData.lang && igData.lang.trim()) {
              return igData.lang.trim();
            }
          }
          // Prioridad 3: TikTok language
          if (tiktok) {
            const tkData = tiktok.basicTikTok || tiktok;
            if (tkData.lang && tkData.lang.trim()) {
              return tkData.lang.trim();
            }
          }
          // Prioridad 4: Basic language
          if (basic && (basic as any).lang && (basic as any).lang.trim()) {
            return (basic as any).lang.trim();
          }
          // Fallback: null si no hay datos
          return null;
        })(),
        socialPlatforms: [
          hasYouTube ? 'youtube' : null,
          hasInstagram ? 'instagram' : null,
          hasTikTok ? 'tiktok' : null
        ].filter(Boolean),
        mainSocialPlatform: mainPlatform,
        // ✅ EXTRAER: mainCategory de la plataforma principal
        mainCategory: (() => {
          if (yt && yt.mainCategory) return yt.mainCategory;
          if (instagram) {
            const igData = instagram.basicInstagram || instagram;
            if (igData.mainCategory) return igData.mainCategory;
          }
          if (tiktok) {
            const tkData = tiktok.basicTikTok || tiktok;
            if (tkData.mainCategory) return tkData.mainCategory;
          }
          return null;
        })(),
        // 🔧 CORREGIR: Obtener seguidores según la plataforma principal
        followersCount: (() => {
          let followers = 0;
          
          // Usar la plataforma principal determinada
          if (mainPlatform === 'youtube' && yt) {
            followers = yt.subscribers || yt.followers || 0;
          } else if (mainPlatform === 'instagram' && instagram) {
            const igData = instagram.basicInstagram || instagram;
            followers = igData.followers || igData.subscribers || 0;
          } else if (mainPlatform === 'tiktok' && tiktok) {
            const tkData = tiktok.basicTikTok || tiktok;
            followers = tkData.followers || tkData.subscribers || 0;
          } else {
            // Fallback: intentar con cualquier plataforma disponible
            if (yt) {
              followers = yt.subscribers || yt.followers || 0;
            } else if (instagram) {
              const igData = instagram.basicInstagram || instagram;
              followers = igData.followers || igData.subscribers || 0;
            } else if (tiktok) {
              const tkData = tiktok.basicTikTok || tiktok;
              followers = tkData.followers || tkData.subscribers || 0;
            } else {
              // Fallback a basic
              followers = (basic as any).subscribers || (basic as any).followers || 0;
            }
          }
          return followers;
        })(),
        contentTopics: topics,
        contentNiches: niches,
        // 🔧 CORREGIR: Obtener engagement según la plataforma principal  
        averageEngagementRate: (() => {
          let engagement = 0;
          
          // Usar la plataforma principal determinada
          if (mainPlatform === 'youtube' && yt) {
            engagement = yt.engageRate1Y || yt.engageRate || yt.engagement || 0;
          } else if (mainPlatform === 'instagram' && instagram) {
            const igData = instagram.basicInstagram || instagram;
            engagement = igData.engageRate || igData.engagement || igData.engageRate1Y || 0;
          } else if (mainPlatform === 'tiktok' && tiktok) {
            const tkData = tiktok.basicTikTok || tiktok;
            engagement = tkData.engageRate || tkData.engagement || tkData.engageRate1Y || 0;  
          } else {
            // Fallback: intentar con cualquier plataforma disponible
            if (yt) {
              engagement = yt.engageRate1Y || yt.engageRate || yt.engagement || 0;
            } else if (instagram) {
              const igData = instagram.basicInstagram || instagram;
              engagement = igData.engageRate || igData.engagement || igData.engageRate1Y || 0;
            } else if (tiktok) {
              const tkData = tiktok.basicTikTok || tiktok;
              engagement = tkData.engageRate || tkData.engagement || tkData.engageRate1Y || 0;  
            } else {
              // Fallback a basic
              engagement = (basic as any).engageRate1Y || (basic as any).engagement || (basic as any).engageRate || 0;
            }
          }
          return engagement;
        })(),
        isVerified: true,
        platformInfo: {
          youtube: yt,
          instagram: instagram,
          tiktok: tiktok
        },
      };

     
      // 3. Guardar/Actualizar en la base de datos local
      const { error: upsertError } = await supabase
        .from('influencers')
        .upsert({
          creator_id: fullData.creatorId,
          name: fullData.name,
          avatar: fullData.avatar,
          location: fullData.country,
          main_social_platform: fullData.mainSocialPlatform,
          categories: fullData.mainCategory ? [fullData.mainCategory] : [],
          followers_count: fullData.followersCount,
          average_engagement_rate: fullData.averageEngagementRate,
          social_platforms: fullData.socialPlatforms,
          content_niches: fullData.contentNiches,
          platform_info: fullData.platformInfo,
          is_verified: fullData.isVerified,
          language: fullData.language,
          created_by: '8e30ccde-d824-4db2-91f9-1f8ea43468da', // UUID del usuario actual
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'creator_id'
        });

      if (upsertError) {
        console.error('❌ [SERVICE] Error updating local cache:', upsertError);
      } else {
      }

      return fullData;
    } catch (error) {
      console.error('💥 [ERROR] Error getting full influencer data:', error);
      throw error;
    }
  }

  /**
   * Obtiene solo los datos básicos de las plataformas disponibles sin guardar en BD
   * Usado para mostrar datos en el panel del influencer
   */
  async getBasicPlatformData(params: { youtubeId?: string, instagramId?: string, tiktokId?: string }): Promise<any> {
    const { youtubeId, instagramId, tiktokId } = params;
    
    // 🎯 ARREGLO: Usar todos los IDs disponibles, no solo uno
    const allIds = [youtubeId, instagramId, tiktokId].filter(Boolean);
    
    if (allIds.length === 0) return null;

    console.log(`🔄 [BASIC PLATFORM DATA] Obteniendo datos básicos para IDs: ${allIds.join(', ')}`);

    // 🎯 NUEVA LÓGICA: Hacer peticiones a TODAS las plataformas disponibles
    const promises: Promise<{ platform: string; data?: any; error?: any }>[] = [];

    // Petición a Instagram si está disponible
    if (instagramId) {
      promises.push(
        InfluencerInstagramService.getBasic(instagramId)
          .then(result => ({ platform: 'instagram', data: result }))
          .catch(error => ({ platform: 'instagram', error }))
      );
    }

    // Petición a YouTube si está disponible
    if (youtubeId) {
      promises.push(
        InfluencerYoutubeService.getBasic(youtubeId)
          .then(result => ({ platform: 'youtube', data: result }))
          .catch(error => ({ platform: 'youtube', error }))
      );
    }

    // Petición a TikTok si está disponible
    if (tiktokId) {
      promises.push(
        InfluencerTiktokService.getBasic(tiktokId)
          .then(result => ({ platform: 'tiktok', data: result }))
          .catch(error => ({ platform: 'tiktok', error }))
      );
    }

    // 🎯 NUEVO: Ejecutar TODAS las peticiones en paralelo
    const results = await Promise.allSettled(promises);
    
    // Procesar resultados
    const platformData: any = {
      youtube: null,
      instagram: null,
      tiktok: null
    };

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { platform, data, error } = result.value;
        
        if (data && !error) {
          console.log(`✅ [BASIC PLATFORM DATA] Datos obtenidos de ${platform}`);
          // Estructurar datos correctamente según la plataforma
          platformData[platform] = data;
        } else {
          console.warn(`⚠️ [BASIC PLATFORM DATA] Error obteniendo datos de ${platform}:`, error);
        }
      } else {
        console.error(`❌ [BASIC PLATFORM DATA] Error en petición:`, result.reason);
      }
    });

    return {
      platformInfo: platformData,
      // Determinar qué plataformas tienen datos
      hasYouTube: platformData.youtube !== null,
      hasInstagram: platformData.instagram !== null,
      hasTikTok: platformData.tiktok !== null
    };
  }

  private transformCacheToFullData(cachedData: any) {
    return {
      creatorId: cachedData.creator_id,
      name: cachedData.name,
      avatar: cachedData.avatar,
      country: cachedData.location,
      language: cachedData.language, // Este campo puede ser nulo si la migración no se ha ejecutado
      socialPlatforms: cachedData.social_platforms,
      mainSocialPlatform: cachedData.main_social_platform,
              mainCategory: cachedData.categories && cachedData.categories.length > 0 ? cachedData.categories[0] : null,
      followersCount: cachedData.followers_count,
      contentTopics: cachedData.content_topics,
      contentNiches: cachedData.content_niches,
      averageEngagementRate: cachedData.average_engagement_rate,
      isVerified: cachedData.is_verified,
      platformInfo: cachedData.platform_info,
    };
  }

  /**
   * Busca influencers en la base de datos local aplicando filtros
   */
  async searchInfluencers(filters: {
    platform?: string;
    category?: string;
    location?: string;
    minFollowers?: number;
    maxFollowers?: number;
    minEngagement?: number;
    maxEngagement?: number;
    query?: string;
    page?: number;
    size?: number;
  }) {
    try {
      let query = supabase
        .from('influencers')
        .select('*')
        .is('deleted_at', null);

      // Aplicar filtros
      if (filters.platform && filters.platform !== 'all') {
        query = query.eq('main_social_platform', filters.platform.toLowerCase());
      }

      if (filters.location && filters.location !== 'all') {
        query = query.eq('location', filters.location);
      }

      if (filters.category && filters.category !== 'all') {
            // ✅ CORREGIDO: Buscar en categories como array, no en main_category que no existe
    query = query.contains('categories', [filters.category]);
      }

      if (filters.minFollowers) {
        query = query.gte('followers_count', filters.minFollowers);
      }

      if (filters.maxFollowers) {
        query = query.lte('followers_count', filters.maxFollowers);
      }

      if (filters.minEngagement) {
        query = query.gte('average_engagement_rate', filters.minEngagement);
      }

      if (filters.maxEngagement) {
        query = query.lte('average_engagement_rate', filters.maxEngagement);
      }

      if (filters.query) {
        query = query.ilike('name', `%${filters.query}%`);
      }

      // Paginación
      const page = filters.page || 1;
      const size = filters.size || 10;
      const start = (page - 1) * size;
      
      query = query
        .order('followers_count', { ascending: false })
        .range(start, start + size - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ [SERVICE] Error searching influencers:', error);
        throw error;
      }

      // Transformar los datos al formato esperado
      const items = data?.map(this.transformCacheToFullData) || [];

      return {
        items,
        total: count || 0,
        page,
        size,
      };
    } catch (error) {
      console.error('Error searching influencers:', error);
      throw error;
    }
  }

  async getAll() {
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .is('deleted_at', null);

    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    // Verificar si el ID es un UUID válido
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      // Si es UUID, buscar por id
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    } else {
      // Si no es UUID, buscar por creator_id
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('creator_id', id)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    }
  }

  async create(data: any) {
    return this.createInfluencer(data);
  }

  async update(id: string, data: any) {
    const { data: updatedInfluencer, error } = await supabase
      .from('influencers')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedInfluencer;
  }

  /**
   * Actualiza los datos de un influencer desde las APIs externas
   * Este método:
   * 1. Obtiene el influencer por ID
   * 2. Extrae todos los IDs de plataformas disponibles
   * 3. Hace peticiones a las APIs para actualizar datos
   * 4. Actualiza la base de datos con los nuevos datos
   * 5. Maneja casos especiales como datos faltantes
   */
  async refreshInfluencerData(influencerId: string): Promise<any> {
    try {
      console.log(`🔄 [REFRESH] Iniciando refresh para influencer ID: ${influencerId}`);

      // 1. Buscar el influencer en la base de datos
      const { data: influencer, error: fetchError } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', influencerId)
        .is('deleted_at', null)
        .single();

      if (fetchError || !influencer) {
        throw new Error(`Influencer no encontrado: ${influencerId}`);
      }

      console.log(`📋 [REFRESH] Influencer encontrado: ${influencer.name} (${influencer.creator_id})`);

      // 2. Extraer IDs de plataformas desde platform_info y creator_id de manera inteligente
      const platformInfo = influencer.platform_info || {};
      
      // Determinar la plataforma principal y extraer IDs correctamente
      let youtubeId: string | undefined;
      let instagramId: string | undefined;
      let tiktokId: string | undefined;

      // Si tiene platform_info, extraer desde ahí primero
      if (platformInfo.instagram?.basicInstagram?.instagramId) {
        instagramId = platformInfo.instagram.basicInstagram.instagramId;
      }
      if (platformInfo.tiktok?.basicTikTok?.tiktokId) {
        tiktokId = platformInfo.tiktok.basicTikTok.tiktokId;
      }
      if (platformInfo.youtube?.youtubeId) {
        youtubeId = platformInfo.youtube.youtubeId;
      }

      // Si no tiene platform_info o está vacío, usar creator_id según la plataforma principal
      if (!youtubeId && !instagramId && !tiktokId) {
        if (influencer.main_social_platform === 'youtube') {
          youtubeId = influencer.creator_id;
        } else if (influencer.main_social_platform === 'instagram') {
          instagramId = influencer.creator_id;
        } else if (influencer.main_social_platform === 'tiktok') {
          tiktokId = influencer.creator_id;
        }
      }

      console.log(`🔍 [REFRESH] IDs iniciales extraídos:`, { youtubeId, instagramId, tiktokId });

      // 3. Obtener datos actualizados SOLO para los IDs guardados (sin búsqueda recursiva)
      const fullData = await this.getBasicPlatformDataForRefresh({ youtubeId, instagramId, tiktokId });

      if (!fullData) {
        throw new Error('No se pudieron obtener datos actualizados');
      }

      // 4. Usar los IDs originales del influencer (no buscar IDs adicionales)
      const originalPlatformIds = { youtubeId, instagramId, tiktokId };
      console.log(`🔍 [REFRESH] Usando IDs originales del influencer:`, originalPlatformIds);

      // 5. Verificar duplicados antes de actualizar (usando IDs originales)
      const existingDuplicate = await this.checkForDuplicateInfluencer(originalPlatformIds);
      
      if (existingDuplicate && existingDuplicate.id !== influencerId) {
        console.log(`⚠️ [REFRESH] Duplicado detectado. Actualizando influencer existente: ${existingDuplicate.id}`);
        
        // Actualizar el influencer existente en lugar del original
        const updateData = {
          name: fullData.name,
          avatar: fullData.avatar,
          location: fullData.country,
          main_social_platform: fullData.mainSocialPlatform,
          categories: fullData.mainCategory ? [fullData.mainCategory] : [],
          followers_count: fullData.followersCount,
          average_engagement_rate: fullData.averageEngagementRate,
          social_platforms: fullData.socialPlatforms,
          content_niches: fullData.contentNiches,
          platform_info: fullData.platformInfo,
          is_verified: fullData.isVerified,
          updated_at: new Date().toISOString(),
          language: fullData.language,
        };

        const { data: updatedInfluencer, error: updateError } = await supabase
          .from('influencers')
          .update(updateData)
          .eq('id', existingDuplicate.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Error actualizando influencer: ${updateError.message}`);
        }

        // Eliminar el influencer original si es diferente al duplicado
        if (existingDuplicate.id !== influencerId) {
          await supabase
            .from('influencers')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', influencerId);
          
          console.log(`🗑️ [REFRESH] Influencer original eliminado: ${influencerId}`);
        }

        console.log(`✅ [REFRESH] Refresh completado. Influencer actualizado: ${updatedInfluencer.name}`);
        return updatedInfluencer;
      }

      // 6. Si no hay duplicados, actualizar el influencer original
      const updateData = {
        name: fullData.name,
        avatar: fullData.avatar,
        location: fullData.country,
        main_social_platform: fullData.mainSocialPlatform,
        categories: fullData.mainCategory ? [fullData.mainCategory] : [],
        followers_count: fullData.followersCount,
        average_engagement_rate: fullData.averageEngagementRate,
        social_platforms: fullData.socialPlatforms,
        content_niches: fullData.contentNiches,
        platform_info: fullData.platformInfo,
        is_verified: fullData.isVerified,
        updated_at: new Date().toISOString(),
        language: fullData.language,
      };

      const { data: updatedInfluencer, error: updateError } = await supabase
        .from('influencers')
        .update(updateData)
        .eq('id', influencerId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Error actualizando influencer: ${updateError.message}`);
      }

      console.log(`✅ [REFRESH] Refresh completado. Influencer actualizado: ${updatedInfluencer.name}`);
      return updatedInfluencer;

    } catch (error) {
      console.error('❌ [REFRESH] Error en refresh:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos completos de un influencer de forma recursiva
   * Busca IDs de otras plataformas en los datos obtenidos y continúa la búsqueda
   */
  private async getFullInfluencerDataRecursive(params: { 
    youtubeId?: string, 
    instagramId?: string, 
    tiktokId?: string 
  }, visitedIds: Set<string> = new Set(), forceRefresh: boolean = false): Promise<any> {
    try {
      console.log(`🔄 [RECURSIVE] Buscando datos con IDs:`, params);
      
      // Obtener datos básicos (forzar refresh si es necesario)
      const basicData = await this.getFullInfluencerData(params, forceRefresh);
      
      if (!basicData) {
        return null;
      }

      // Extraer nuevos IDs de plataformas de los datos obtenidos
      const newIds = this.extractPlatformIdsFromData(basicData);
      console.log(`🔍 [RECURSIVE] Nuevos IDs encontrados:`, newIds);

      // Filtrar IDs que no hemos visitado aún
      const unvisitedIds = {
        youtubeId: newIds.youtubeId && !visitedIds.has(`yt:${newIds.youtubeId}`) ? newIds.youtubeId : undefined,
        instagramId: newIds.instagramId && !visitedIds.has(`ig:${newIds.instagramId}`) ? newIds.instagramId : undefined,
        tiktokId: newIds.tiktokId && !visitedIds.has(`tk:${newIds.tiktokId}`) ? newIds.tiktokId : undefined,
      };

      // Marcar IDs como visitados
      if (unvisitedIds.youtubeId) visitedIds.add(`yt:${unvisitedIds.youtubeId}`);
      if (unvisitedIds.instagramId) visitedIds.add(`ig:${unvisitedIds.instagramId}`);
      if (unvisitedIds.tiktokId) visitedIds.add(`tk:${unvisitedIds.tiktokId}`);

      // Si hay nuevos IDs no visitados, continuar la búsqueda recursiva
      if (unvisitedIds.youtubeId || unvisitedIds.instagramId || unvisitedIds.tiktokId) {
        console.log(`🔄 [RECURSIVE] Continuando búsqueda con nuevos IDs...`);
        const additionalData = await this.getFullInfluencerDataRecursive(unvisitedIds, visitedIds, forceRefresh);
        
        if (additionalData) {
          // Combinar datos (priorizar datos más completos)
          return this.mergeInfluencerData(basicData, additionalData);
        }
      }

      return basicData;

    } catch (error) {
      console.error('❌ [RECURSIVE] Error en búsqueda recursiva:', error);
      return null;
    }
  }

  /**
   * Extrae IDs de plataformas de los datos obtenidos
   */
  private extractPlatformIdsFromData(data: any): { youtubeId?: string, instagramId?: string, tiktokId?: string } {
    const ids: { youtubeId?: string, instagramId?: string, tiktokId?: string } = {};

    try {
      // Buscar en platformInfo
      if (data.platformInfo) {
        // YouTube IDs
        if (data.platformInfo.youtube?.youtubeId) {
          ids.youtubeId = data.platformInfo.youtube.youtubeId;
        }
        if (data.platformInfo.youtube?.basicYoutube?.youtubeId) {
          ids.youtubeId = data.platformInfo.youtube.basicYoutube.youtubeId;
        }
        
        // Instagram IDs
        if (data.platformInfo.instagram?.instagramId) {
          ids.instagramId = data.platformInfo.instagram.instagramId;
        }
        if (data.platformInfo.instagram?.basicInstagram?.instagramId) {
          ids.instagramId = data.platformInfo.instagram.basicInstagram.instagramId;
        }
        
        // TikTok IDs
        if (data.platformInfo.tiktok?.tiktokId) {
          ids.tiktokId = data.platformInfo.tiktok.tiktokId;
        }
        if (data.platformInfo.tiktok?.basicTikTok?.tiktokId) {
          ids.tiktokId = data.platformInfo.tiktok.basicTikTok.tiktokId;
        }
      }

      // Buscar IDs cruzados en datos de YouTube
      if (data.platformInfo?.youtube) {
        const yt = data.platformInfo.youtube;
        if (yt.instagramId && !ids.instagramId) {
          ids.instagramId = yt.instagramId;
        }
        if (yt.tiktokId && !ids.tiktokId) {
          ids.tiktokId = yt.tiktokId;
        }
      }
      if (data.platformInfo?.youtube?.basicYoutube) {
        const yt = data.platformInfo.youtube.basicYoutube;
        if (yt.instagramId && !ids.instagramId) {
          ids.instagramId = yt.instagramId;
        }
        if (yt.tiktokId && !ids.tiktokId) {
          ids.tiktokId = yt.tiktokId;
        }
      }

      // Buscar IDs cruzados en datos de Instagram
      if (data.platformInfo?.instagram) {
        const ig = data.platformInfo.instagram;
        if (ig.youtubeId && !ids.youtubeId) {
          ids.youtubeId = ig.youtubeId;
        }
        if (ig.tiktokId && !ids.tiktokId) {
          ids.tiktokId = ig.tiktokId;
        }
      }
      if (data.platformInfo?.instagram?.basicInstagram) {
        const ig = data.platformInfo.instagram.basicInstagram;
        if (ig.youtubeId && !ids.youtubeId) {
          ids.youtubeId = ig.youtubeId;
        }
        if (ig.tiktokId && !ids.tiktokId) {
          ids.tiktokId = ig.tiktokId;
        }
      }

      // Buscar IDs cruzados en datos de TikTok
      if (data.platformInfo?.tiktok) {
        const tk = data.platformInfo.tiktok;
        if (tk.youtubeId && !ids.youtubeId) {
          ids.youtubeId = tk.youtubeId;
        }
        if (tk.instagramId && !ids.instagramId) {
          ids.instagramId = tk.instagramId;
        }
      }
      if (data.platformInfo?.tiktok?.basicTikTok) {
        const tk = data.platformInfo.tiktok.basicTikTok;
        if (tk.youtubeId && !ids.youtubeId) {
          ids.youtubeId = tk.youtubeId;
        }
        if (tk.instagramId && !ids.instagramId) {
          ids.instagramId = tk.instagramId;
        }
      }

    } catch (error) {
      console.error('❌ [EXTRACT] Error extrayendo IDs:', error);
    }

    return ids;
  }

  /**
   * Combina datos de diferentes fuentes, priorizando datos más completos
   */
  private mergeInfluencerData(data1: any, data2: any): any {
    // Priorizar datos más completos (más campos no nulos)
    const data1Completeness = this.calculateDataCompleteness(data1);
    const data2Completeness = this.calculateDataCompleteness(data2);

    const primary = data1Completeness >= data2Completeness ? data1 : data2;
    const secondary = data1Completeness >= data2Completeness ? data2 : data1;

    // Combinar platformInfo
    const mergedPlatformInfo = {
      youtube: { ...secondary.platformInfo?.youtube, ...primary.platformInfo?.youtube },
      instagram: { ...secondary.platformInfo?.instagram, ...primary.platformInfo?.instagram },
      tiktok: { ...secondary.platformInfo?.tiktok, ...primary.platformInfo?.tiktok }
    };

    return {
      ...primary,
      platformInfo: mergedPlatformInfo
    };
  }

  /**
   * Calcula qué tan completo están los datos
   */
  private calculateDataCompleteness(data: any): number {
    if (!data) return 0;
    
    const fields = ['name', 'avatar', 'country', 'followersCount', 'averageEngagementRate', 'socialPlatforms'];
    let completeness = 0;
    
    fields.forEach(field => {
      if (data[field] && (typeof data[field] === 'string' ? data[field].trim() : data[field])) {
        completeness++;
      }
    });
    
    return completeness;
  }

  async delete(id: string) {
    const { error } = await supabase
      .from('influencers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Verifica si ya existe un influencer con algún ID de plataforma
   * Retorna el influencer existente si lo encuentra, null si no existe
   */
  async checkForDuplicateInfluencer(platformIds: { 
    youtubeId?: string, 
    instagramId?: string, 
    tiktokId?: string 
  }): Promise<any> {
    try {
      console.log(`🔍 [DUPLICATE CHECK] Verificando duplicados para IDs:`, platformIds);
      
      // Verificar creator_id (YouTube ID principal)
      if (platformIds.youtubeId) {
        const { data: existingByCreatorId, error: error1 } = await supabase
          .from('influencers')
          .select('*')
          .eq('creator_id', platformIds.youtubeId)
          .is('deleted_at', null)
          .single();

        if (existingByCreatorId) {
          console.log(`⚠️ [DUPLICATE CHECK] Duplicado encontrado por creator_id:`, existingByCreatorId.name);
          return existingByCreatorId;
        }
      }

      // Verificar en platform_info usando consultas separadas
      if (platformIds.youtubeId) {
        const { data: existingByYoutubeId, error: error2 } = await supabase
          .from('influencers')
          .select('*')
          .eq('platform_info->youtube->youtubeId', platformIds.youtubeId)
          .is('deleted_at', null)
          .single();

        if (existingByYoutubeId) {
          console.log(`⚠️ [DUPLICATE CHECK] Duplicado encontrado por youtubeId:`, existingByYoutubeId.name);
          return existingByYoutubeId;
        }
      }

      if (platformIds.instagramId) {
        const { data: existingByInstagramId, error: error3 } = await supabase
          .from('influencers')
          .select('*')
          .or(`platform_info->youtube->instagramId.eq.${platformIds.instagramId},platform_info->instagram->instagramId.eq.${platformIds.instagramId}`)
          .is('deleted_at', null)
          .single();

        if (existingByInstagramId) {
          console.log(`⚠️ [DUPLICATE CHECK] Duplicado encontrado por instagramId:`, existingByInstagramId.name);
          return existingByInstagramId;
        }
      }

      if (platformIds.tiktokId) {
        const { data: existingByTiktokId, error: error4 } = await supabase
          .from('influencers')
          .select('*')
          .or(`platform_info->youtube->tiktokId.eq.${platformIds.tiktokId},platform_info->tiktok->tiktokId.eq.${platformIds.tiktokId}`)
          .is('deleted_at', null)
          .single();

        if (existingByTiktokId) {
          console.log(`⚠️ [DUPLICATE CHECK] Duplicado encontrado por tiktokId:`, existingByTiktokId.name);
          return existingByTiktokId;
        }
      }

      console.log(`✅ [DUPLICATE CHECK] No se encontraron duplicados`);
      return null;

    } catch (error) {
      console.error('❌ [DUPLICATE CHECK] Error en verificación de duplicados:', error);
      return null;
    }
  }

  /**
   * Crea un nuevo influencer con validación de duplicados
   */
  async createInfluencer(influencerData: any): Promise<any> {
    try {
      console.log(`🔄 [CREATE] Iniciando creación de influencer:`, influencerData.name);

      // 1. Extraer IDs de plataformas del influencer a crear
      const platformIds = {
        youtubeId: influencerData.creator_id || influencerData.platform_info?.youtube?.youtubeId,
        instagramId: influencerData.platform_info?.youtube?.instagramId || influencerData.platform_info?.instagram?.instagramId,
        tiktokId: influencerData.platform_info?.youtube?.tiktokId || influencerData.platform_info?.tiktok?.tiktokId
      };

      // 2. Verificar si ya existe un influencer con alguno de estos IDs
      const existingInfluencer = await this.checkForDuplicateInfluencer(platformIds);

      if (existingInfluencer) {
        console.log(`⚠️ [CREATE] Influencer duplicado detectado. ID existente: ${existingInfluencer.id}`);
        
        // Retornar el influencer existente en lugar de crear uno nuevo
        return {
          success: false,
          duplicate: true,
          existingInfluencer,
          message: `Ya existe un influencer con alguno de los IDs proporcionados: ${existingInfluencer.name} (ID: ${existingInfluencer.id})`
        };
      }

      // 3. Si no hay duplicados, proceder con la creación normal
      console.log(`✅ [CREATE] No hay duplicados, procediendo con la creación`);
      
      const { data: newInfluencer, error } = await supabase
        .from('influencers')
        .insert(influencerData)
        .select()
        .single();

      if (error) {
        console.error('❌ [CREATE] Error creando influencer:', error);
        throw error;
      }

      console.log(`✅ [CREATE] Influencer creado exitosamente: ${newInfluencer.name}`);
      return {
        success: true,
        duplicate: false,
        influencer: newInfluencer,
        message: 'Influencer creado exitosamente'
      };

    } catch (error) {
      console.error('💥 [CREATE] Error en createInfluencer:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos básicos de plataformas SOLO para los IDs proporcionados (sin búsqueda recursiva)
   * Usado específicamente para refresh de influencers
   */
  private async getBasicPlatformDataForRefresh(params: { 
    youtubeId?: string, 
    instagramId?: string, 
    tiktokId?: string 
  }): Promise<any> {
    try {
      console.log(`🔄 [REFRESH DATA] Obteniendo datos básicos para IDs:`, params);

      // Crear array de promesas para obtener datos de cada plataforma
      const promises = [];

      if (params.youtubeId) {
        promises.push(
          InfluencerYoutubeService.getBasic(params.youtubeId)
            .then(data => ({ platform: 'youtube', data, error: null }))
            .catch(error => ({ platform: 'youtube', data: null, error }))
        );
      }

      if (params.instagramId) {
        promises.push(
          InfluencerInstagramService.getBasic(params.instagramId)
            .then(data => ({ platform: 'instagram', data, error: null }))
            .catch(error => ({ platform: 'instagram', data: null, error }))
        );
      }

      if (params.tiktokId) {
        promises.push(
          InfluencerTiktokService.getBasic(params.tiktokId)
            .then(data => ({ platform: 'tiktok', data, error: null }))
            .catch(error => ({ platform: 'tiktok', data: null, error }))
        );
      }

      // Ejecutar todas las peticiones en paralelo
      const results = await Promise.allSettled(promises);

      // Procesar resultados
      const platformData: any = {
        youtube: null,
        instagram: null,
        tiktok: null
      };

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { platform, data, error } = result.value;
          
          if (data && !error) {
            console.log(`✅ [REFRESH DATA] Datos obtenidos de ${platform}`);
            platformData[platform] = data;
          } else {
            console.warn(`⚠️ [REFRESH DATA] Error obteniendo datos de ${platform}:`, error);
          }
        } else {
          console.error(`❌ [REFRESH DATA] Error en petición:`, result.reason);
        }
      });

      // Construir respuesta con estructura similar a getFullInfluencerData
      const response = {
        name: null,
        avatar: null,
        country: null,
        mainSocialPlatform: null,
        mainCategory: null,
        followersCount: 0,
        averageEngagementRate: 0,
        socialPlatforms: [],
        contentNiches: [],
        platformInfo: platformData,
        isVerified: false,
        language: null
      };

      // Determinar plataformas basado en datos reales
      const hasYouTube = platformData.youtube !== null && platformData.youtube !== undefined && Object.keys(platformData.youtube).length > 0;
      const hasInstagram = platformData.instagram !== null && platformData.instagram !== undefined && Object.keys(platformData.instagram).length > 0;
      const hasTikTok = platformData.tiktok !== null && platformData.tiktok !== undefined && Object.keys(platformData.tiktok).length > 0;
      
      // Determinar main platform basado en qué plataforma tiene datos
      let mainPlatform = 'youtube'; // default
      if (hasInstagram && !hasYouTube) {
        mainPlatform = 'instagram';
      } else if (hasTikTok && !hasYouTube && !hasInstagram) {
        mainPlatform = 'tiktok';
      } else if (hasYouTube) {
        mainPlatform = 'youtube';
      } else if (hasInstagram) {
        mainPlatform = 'instagram';
      } else if (hasTikTok) {
        mainPlatform = 'tiktok';
      }

      // Extraer información básica de los datos obtenidos usando la misma lógica que getFullInfluencerData
      if (platformData.youtube) {
        response.name = response.name || platformData.youtube.youtubeName || platformData.youtube.channelTitle || platformData.youtube.name;
        response.avatar = response.avatar || platformData.youtube.avatar;
        response.country = response.country || platformData.youtube.country;
        response.language = response.language || platformData.youtube.lang;
        response.socialPlatforms.push('youtube');
      }

      if (platformData.instagram) {
        const igData = platformData.instagram.basicInstagram || platformData.instagram;
        response.name = response.name || igData.instagramName || igData.username || igData.name;
        response.avatar = response.avatar || igData.avatar;
        response.country = response.country || igData.country;
        response.language = response.language || igData.lang;
        response.socialPlatforms.push('instagram');
      }

      if (platformData.tiktok) {
        const tkData = platformData.tiktok.basicTikTok || platformData.tiktok;
        response.name = response.name || tkData.tiktokName || tkData.username || tkData.name;
        response.avatar = response.avatar || tkData.avatar;
        response.country = response.country || tkData.country;
        response.language = response.language || tkData.lang;
        response.socialPlatforms.push('tiktok');
      }

      // Usar la plataforma principal para extraer followers y engagement
      response.mainSocialPlatform = mainPlatform;
      
      // Extraer followers según la plataforma principal
      if (mainPlatform === 'youtube' && platformData.youtube) {
        response.followersCount = platformData.youtube.subscribers || platformData.youtube.followers || 0;
      } else if (mainPlatform === 'instagram' && platformData.instagram) {
        const igData = platformData.instagram.basicInstagram || platformData.instagram;
        response.followersCount = igData.followers || igData.subscribers || 0;
      } else if (mainPlatform === 'tiktok' && platformData.tiktok) {
        const tkData = platformData.tiktok.basicTikTok || platformData.tiktok;
        response.followersCount = tkData.followers || tkData.subscribers || 0;
      } else {
        // Fallback: intentar con cualquier plataforma disponible
        if (platformData.youtube) {
          response.followersCount = platformData.youtube.subscribers || platformData.youtube.followers || 0;
        } else if (platformData.instagram) {
          const igData = platformData.instagram.basicInstagram || platformData.instagram;
          response.followersCount = igData.followers || igData.subscribers || 0;
        } else if (platformData.tiktok) {
          const tkData = platformData.tiktok.basicTikTok || platformData.tiktok;
          response.followersCount = tkData.followers || tkData.subscribers || 0;
        }
      }

      // Extraer engagement según la plataforma principal
      if (mainPlatform === 'youtube' && platformData.youtube) {
        response.averageEngagementRate = platformData.youtube.engageRate1Y || platformData.youtube.engageRate || platformData.youtube.engagement || 0;
      } else if (mainPlatform === 'instagram' && platformData.instagram) {
        const igData = platformData.instagram.basicInstagram || platformData.instagram;
        response.averageEngagementRate = igData.engageRate || igData.engagement || igData.engageRate1Y || 0;
      } else if (mainPlatform === 'tiktok' && platformData.tiktok) {
        const tkData = platformData.tiktok.basicTikTok || platformData.tiktok;
        response.averageEngagementRate = tkData.engageRate || tkData.engagement || tkData.engageRate1Y || 0;
      } else {
        // Fallback: intentar con cualquier plataforma disponible
        if (platformData.youtube) {
          response.averageEngagementRate = platformData.youtube.engageRate1Y || platformData.youtube.engageRate || platformData.youtube.engagement || 0;
        } else if (platformData.instagram) {
          const igData = platformData.instagram.basicInstagram || platformData.instagram;
          response.averageEngagementRate = igData.engageRate || igData.engagement || igData.engageRate1Y || 0;
        } else if (platformData.tiktok) {
          const tkData = platformData.tiktok.basicTikTok || platformData.tiktok;
          response.averageEngagementRate = tkData.engageRate || tkData.engagement || tkData.engageRate1Y || 0;
        }
      }

      console.log(`✅ [REFRESH DATA] Datos construidos exitosamente`);
      return response;

    } catch (error) {
      console.error('❌ [REFRESH DATA] Error obteniendo datos básicos:', error);
      throw error;
    }
  }
} 
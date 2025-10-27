import creatorDBClient from '../../lib/creatorDBClient';
import { supabaseAdmin } from '../../config/supabase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 segundos

export class CreatorDBService {
  // Método genérico para GET con reintentos
  static async get(endpoint: string, params: Record<string, any> = {}, retryCount = 0): Promise<any> {
    const startTime = Date.now();
    try {
      const response = await creatorDBClient.get(endpoint, { params });
      const endTime = Date.now();
     
      return response.data;
    } catch (error: any) {
      console.error(`❌ [CREATOR-DB] Error calling ${endpoint}:`, {
        status: error.response?.status,
        error: error.response?.data?.error || error.message,
        params
      });

      // Si es un error de autenticación o no hay créditos, no reintentar
      if (error.response?.data?.error === 'AuthFailed' || 
          (error.response?.data?.remainingPlanCredit === 0 && 
           error.response?.data?.remainingPrepurchasedCredit === 0)) {
        throw error;
      }

      // Reintentar si no hemos alcanzado el máximo de intentos
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return this.get(endpoint, params, retryCount + 1);
      }

      throw error;
    }
  }

  // ==============================================
  // 🆕 MÉTODOS GENERALES
  // ==============================================

  // Obtener estado de la API y créditos
  static async getApiStatus(): Promise<any> {
    return this.get('/apiStatus');
  }

  // Enviar creadores para que sean agregados a la base de datos
  static async submitCreators(platform: string, platformUserIds: string[]): Promise<any> {
    const response = await creatorDBClient.post('/submitCreators', {
      platform: platform.toLowerCase(),
      platformUserIds
    });
    return response.data;
  }

  // Verificar si un ID existe en CreatorDB
  static async checkIdExists(platform: string, platformUserId: string): Promise<{ exists: boolean; data?: any; error?: string }> {
    try {
      let result;
      
      switch (platform.toLowerCase()) {
        case 'youtube':
          result = await this.getYoutubeBasic(platformUserId);
          break;
        case 'instagram':
          result = await this.getInstagramBasic(platformUserId);
          break;
        case 'tiktok':
          result = await this.getTikTokBasic(platformUserId);
          break;
        default:
          return { exists: false, error: 'Plataforma no soportada' };
      }

      // Si obtenemos datos, significa que existe
      return { 
        exists: true, 
        data: result 
      };
      
    } catch (error: any) {
      // Si el error es 404 o similar, significa que no existe
      if (error.response?.status === 404 || 
          error.response?.data?.error?.includes('not found') ||
          error.response?.data?.error?.includes('No data found')) {
        return { exists: false };
      }
      
      // Otros errores (como problemas de API, etc.)
      return { 
        exists: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }

  // ==============================================
  // 🆕 MÉTODOS PARA SUBMIT CREATORS
  // ==============================================

  /**
   * Extrae la plataforma y el ID de usuario de una URL de redes sociales
   */
  static extractPlatformAndId(url: string): { platform: string; platformUserId: string } | null {
    try {
      const cleanUrl = url.trim().toLowerCase();
      
      // Instagram
      if (cleanUrl.includes('instagram.com/')) {
        const match = cleanUrl.match(/instagram\.com\/([^\/\?]+)/);
        if (match && match[1]) {
          return {
            platform: 'instagram',
            platformUserId: match[1]
          };
        }
      }
      
      // TikTok
      if (cleanUrl.includes('tiktok.com/')) {
        const match = cleanUrl.match(/tiktok\.com\/@([^\/\?]+)/);
        if (match && match[1]) {
          return {
            platform: 'tiktok',
            platformUserId: match[1]
          };
        }
      }
      
      // YouTube (requiere ID del canal, no URL)
      if (cleanUrl.includes('youtube.com/')) {
        // Para YouTube necesitamos el ID del canal, no la URL
        return {
          platform: 'youtube',
          platformUserId: '' // Se debe obtener manualmente
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error extrayendo plataforma e ID:', error);
      return null;
    }
  }

  /**
   * Envía un creador a CreatorDB y guarda el historial en la base de datos
   */
  static async submitCreatorWithHistory(
    platform: string, 
    platformUserId: string, 
    url: string, 
    userId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // 1. Enviar a CreatorDB API
      const creatorDbResponse = await this.submitCreators(platform, [platformUserId]);
      
      // 2. Guardar en nuestra base de datos
      try {
        if (supabaseAdmin) {
          const { data: insertResult, error: insertError } = await supabaseAdmin
            .from('submit_creators')
            .insert({
              user_id: userId,
              platform: platform,
              platform_user_id: platformUserId,
              url: url,
              status: 'pending',
              response_data: creatorDbResponse || null
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error guardando en submit_creators:', insertError);
          } else {
          
          }
        }
      } catch (dbError) {
        console.error('Error conectando a la base de datos:', dbError);
      }
      
      return {
        success: true,
        data: {
          creatorDbResponse,
          platform,
          platformUserId,
          url,
          userId
        }
      };
      
    } catch (error: any) {
      console.error('Error en submitCreatorWithHistory:', error);
      return {
        success: false,
        error: error.message || 'Error al enviar creador a CreatorDB'
      };
    }
  }

  static async getSubmitHistory(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!supabaseAdmin) {
        return {
          success: true,
          data: []
        };
      }
      
      const { data: history, error: queryError } = await supabaseAdmin
        .from('submit_creators')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });

      if (queryError) {
        console.error('Error consultando submit_creators:', queryError);
        return {
          success: false,
          error: 'Error consultando historial'
        };
      }

      return {
        success: true,
        data: history || []
      };
      
    } catch (error: any) {
      console.error('Error en getSubmitHistory:', error);
      return {
        success: false,
        error: error.message || 'Error obteniendo historial'
      };
    }
  }

  // Obtener métricas de un post específico por ID con reintentos
  static async getPostById(postId: string, platform: string): Promise<any> {
    return this.get('/getPostById', { 
      postId,
      platform: platform.toLowerCase()
    });
  }

  // Obtener métricas de un post por URL con reintentos
  static async getPostByLink(postUrl: string): Promise<any> {
    return this.get('/getPostByLink', {
      postLink: postUrl
    });
  }

  // ==============================================
  // YOUTUBE METHODS - CORREGIDOS SEGÚN API v2
  // ==============================================
  
  static async getYoutubeBasic(youtubeId: string) {
    return this.get('/youtubeBasic', { youtubeId });
  }

  static async getYoutubeHistory(youtubeId: string) {
    return this.get('/youtubeHistory', { youtubeId });
  }

  static async getYoutubeDetail(youtubeId: string) {
    return this.get('/youtubeDetail', { youtubeId });
  }

  // ==============================================
  // INSTAGRAM METHODS - CORREGIDOS SEGÚN API v2
  // ==============================================
  
  static async getInstagramBasic(instagramId: string) {
    const startTime = Date.now();
    const result = await this.get('/instagramBasic', { instagramId });
    const endTime = Date.now();
    return result;
  }

  static async getInstagramHistory(instagramId: string) {
    return this.get('/instagramHistory', { instagramId });
  }

  // ==============================================
  // TIKTOK METHODS - CORREGIDOS SEGÚN API v2
  // ==============================================
  
  static async getTikTokBasic(tiktokId: string) {
    return this.get('/tiktokBasic', { tiktokId });
  }

  static async getTikTokHistory(tiktokId: string) {
    return this.get('/tiktokHistory', { tiktokId });
  }

  // ==============================================
  // THREADS METHODS - SEGÚN API v2
  // ==============================================
  
  static async getThreadsBasic(threadsId: string) {
    return this.get('/threadsBasic', { threadsId });
  }

  static async getThreadsHistory(threadsId: string) {
    return this.get('/threadsHistory', { threadsId });
  }

  // ==============================================
  // FACEBOOK METHODS - SEGÚN API v2
  // ==============================================
  
  static async getFacebookBasic(facebookId: string) {
    return this.get('/facebookBasic', { facebookId });
  }

  static async getFacebookHistory(facebookId: string) {
    return this.get('/facebookHistory', { facebookId });
  }

  // ==============================================
  // TOPIC & BRAND METHODS - CORREGIDOS Y NUEVOS
  // ==============================================
  
  static async getTopicTable(platform: string = 'instagram') {
    return this.get('/topicTable', { platform });
  }

  static async getTopicReport(topicId: string) {
    return this.get('/topicReport', { topicId });
  }

  static async getBrandTable() {
    return this.get('/brandTable');
  }

  static async getBrandReport(brandId: string) {
    return this.get('/brandReport', { brandId });
  }

  static async getRelatedNiches(platform: string, nicheIds: string[]) {
    const response = await creatorDBClient.post('/getRelatedNiches', {
      platform: platform.toLowerCase(),
      nicheIds
    });
    return response.data;
  }



  /**
   * 🔍 Buscar influencers usando CreatorDB API con optimizaciones
   */
  static async searchInfluencers(filters: Record<string, any>) {
    const startTime = Date.now();
    const { platform = 'all' } = filters; // 🎯 Cambiar default a 'all' para nueva prioridad

    // Soportamos todas las plataformas disponibles en CreatorDB
    const supportedPlatforms = ['youtube', 'instagram', 'tiktok', 'threads', 'facebook', 'all'];
    const normalizedPlatform = platform.toLowerCase();
    
    if (!supportedPlatforms.includes(normalizedPlatform)) {
      console.warn(`Búsqueda avanzada para la plataforma '${platform}' aún no implementada.`);
      return { items: [], count: 0, page: filters.page || 1, size: filters.size || 5 };
    }

    // 🎯 NUEVA LÓGICA: Determinar endpoint con prioridad Instagram para "all"
    let endpoint: string;
    let body: Record<string, any>;
    
    if (normalizedPlatform === 'instagram') {
      endpoint = '/instagramAdvancedSearch';
      body = this.buildInstagramSearchBody(filters);
       
    } else if (normalizedPlatform === 'tiktok') {
      endpoint = '/tiktokAdvancedSearch';
      body = this.buildTikTokSearchBody(filters);
      
    } else if (normalizedPlatform === 'threads') {
      endpoint = '/threadsAdvancedSearch';
      body = this.buildThreadsSearchBody(filters);
      
    } else if (normalizedPlatform === 'facebook') {
      endpoint = '/facebookAdvancedSearch';
      body = this.buildFacebookSearchBody(filters);
      
    } else if (normalizedPlatform === 'youtube') {
      endpoint = '/youtubeAdvancedSearch';
      body = this.buildYoutubeSearchBody(filters);
      
    } else {
      // 🎯 CAMBIO CLAVE: Para 'all' ahora usamos Instagram como principal
      endpoint = '/instagramAdvancedSearch';
      body = this.buildInstagramSearchBody(filters);
      
    }

    try {
      // ✅ VALIDACIÓN PREVIA: Verificar filtros antes de enviar a CreatorDB
      const validation = this.validateAPIFilters(filters, normalizedPlatform);
      if (!validation.isValid) {
        console.error('❌ [VALIDATION] Filtros inválidos:', validation.errors);
        throw new Error(`Filtros inválidos: ${validation.errors.join(', ')}`);
      }

      // 🎯 NUEVA LÓGICA: Obtener 25 IDs primero
      const searchStartTime = Date.now();

      const searchResponse = await creatorDBClient.post(endpoint, body) as any;
      const searchEndTime = Date.now();
      
      const influencerIds = searchResponse.data.results || searchResponse.data.data || searchResponse.data || [];
      
      if (!influencerIds || influencerIds.length === 0) {
        return { items: [], count: 0, page: filters.page || 1, size: filters.size || 5 };
      }
      

      // 🎯 NUEVA LÓGICA: Calcular qué IDs necesitamos para esta página
      const requestedPage = filters.page || 1;
      const requestedSize = filters.size || 5;
      const startIndex = (requestedPage - 1) * requestedSize;
      const endIndex = startIndex + requestedSize;
      
      // Obtener solo los IDs que necesitamos para esta página
      const pageIds = influencerIds.slice(startIndex, endIndex);
      
      if (pageIds.length === 0) {
       
        return { items: [], count: influencerIds.length, page: requestedPage, size: requestedSize };
      }
      
      // 🎯 NUEVA LÓGICA: Hacer basic calls solo para los IDs de esta página
      let processingPlatform = normalizedPlatform === 'all' ? 'instagram' : normalizedPlatform;
      
      const processingStartTime = Date.now();
     
      
      let pageResults: any[];
      
      if (processingPlatform === 'instagram') {
        pageResults = await this.processInstagramSearchResults(pageIds);
      } else if (processingPlatform === 'tiktok') {
        pageResults = await this.processTikTokSearchResults(pageIds);
      } else if (processingPlatform === 'threads') {
        pageResults = await this.processThreadsSearchResults(pageIds);
      } else if (processingPlatform === 'facebook') {
        pageResults = await this.processFacebookSearchResults(pageIds);
      } else {
        pageResults = await this.processYouTubeSearchResults(pageIds);
      }
      
      const processingEndTime = Date.now();

      const totalTime = Date.now() - startTime;
     

      // 🎯 ORDENAR POR FOLLOWER COUNT (considerando follower breakdown total si está disponible)
      const sortedResults = pageResults.sort((a, b) => {
        const aFollowers = a.followerBreakdown?.total || a.followersCount || 0;
        const bFollowers = b.followerBreakdown?.total || b.followersCount || 0;
        return bFollowers - aFollowers;
      });

      // ✅ NUEVA VALIDACIÓN POST-CREATORDB - MANTIENE COMPATIBILIDAD TOTAL
      let finalResults = sortedResults;
      let validationInfo = { applied: false, filtered: 0, warnings: [] as any[] };
      
      // Solo aplicar validación si hay filtros específicos que pueden fallar
      const hasStrictFilters = filters.minFollowers || filters.maxFollowers || filters.minEngagement || filters.maxEngagement;
      
      if (hasStrictFilters && sortedResults.length > 0) {
        const validation = this.validateCreatorDBResults(sortedResults, filters);
        
        if (validation.validationApplied && validation.validResults.length < sortedResults.length) {
          finalResults = validation.validResults;
          validationInfo = {
            applied: true,
            filtered: sortedResults.length - validation.validResults.length,
            warnings: validation.invalidResults
          };
          
          
        }
      }

     

      return {
        items: finalResults,
        // 🎯 NUEVO: Usar el total real de IDs disponibles
        count: influencerIds.length,
        page: requestedPage,
        size: requestedSize,
        // ✅ METADATOS ADICIONALES PARA TRANSPARENCIA
        searchMeta: {
          primaryPlatform: processingPlatform,
          endpoint: endpoint,
          isAllPlatforms: normalizedPlatform === 'all',
          instagramPriority: normalizedPlatform === 'all',
          totalIdsAvailable: influencerIds.length,
          idsProcessed: pageIds.length,
          estimatedCount: false // Ahora es el total real
        },
        ...(validationInfo.applied && {
          validation: {
            applied: true,
            originalCount: sortedResults.length,
            filteredCount: validationInfo.filtered,
            reason: 'CreatorDB returned results outside filter criteria'
          }
        })
      };

    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      
      // ✅ MANEJO DE ERRORES MEJORADO - Específico para FilterValueType
      console.error(`❌ [SEARCH OPTIMIZED] Error después de ${totalTime}ms:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });

      // Mensajes de error más específicos
      let errorMessage = 'Error en la búsqueda de influencers';
      let errorCode = 'SEARCH_ERROR';

      if (error.response) {
        const status = error.response.status;
        const apiError = error.response.data?.error;

        switch (status) {
          case 403:
            if (apiError === 'FilterValueType') {
              errorMessage = 'Error en el formato de filtros. Los valores numéricos deben ser números, no texto. Verifique minFollowers, maxFollowers, minEngagement y maxEngagement.';
              errorCode = 'FILTER_VALUE_TYPE_ERROR';
              console.error('🔧 [FIX HINT] Los filtros enviados contienen valores string donde se esperan números. Verifique la conversión de tipos en buildInstagramSearchBody.');
            } else {
              errorMessage = 'Acceso denegado a la API de CreatorDB. Verifique las credenciales.';
              errorCode = 'API_ACCESS_DENIED';
            }
            break;
          case 400:
            errorMessage = 'Solicitud inválida. Verifique los parámetros de búsqueda.';
            errorCode = 'INVALID_REQUEST';
            break;
          case 429:
            errorMessage = 'Límite de solicitudes excedido. Intente nuevamente en unos minutos.';
            errorCode = 'RATE_LIMIT_EXCEEDED';
            break;
          case 500:
            errorMessage = 'Error interno del servidor de CreatorDB.';
            errorCode = 'API_SERVER_ERROR';
            break;
          default:
            errorMessage = `Error de API: ${status} - ${error.response.statusText}`;
            errorCode = 'API_ERROR';
        }
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'No se puede conectar a la API de CreatorDB.';
        errorCode = 'CONNECTION_REFUSED';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Tiempo de espera agotado al conectar con CreatorDB.';
        errorCode = 'TIMEOUT';
      }

      // Crear error personalizado con más contexto
      const enhancedError = new Error(`[${errorCode}] ${errorMessage}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).errorCode = errorCode;
      (enhancedError as any).filters = filters;
      (enhancedError as any).endpoint = endpoint;
      (enhancedError as any).body = body;
      
      throw enhancedError;
    }
  }

  /**
   * Procesa los resultados de YouTube Advanced Search - OPTIMIZADO ✅
   */
  private static async processYouTubeSearchResults(influencerIds: string[]): Promise<any[]> {
    const startTime = Date.now();
    
    
    
    // ✅ OPTIMIZACIÓN: Procesar TODOS en paralelo real (sin delays escalonados)
    const allResults = await Promise.allSettled(
      influencerIds.map(async (id: string, index: number) => {
        // ⚡ ELIMINADO: Delay escalonado para procesamiento paralelo real
        // Ahora todas las llamadas se ejecutan al mismo tiempo
        
        try {
          // ✅ OPTIMIZACIÓN: Solo YouTube básico inicialmente
          const ytRes = await this.getYoutubeBasic(id);
          const ytData = ytRes?.data?.basicYoutube;
          
          if (!ytData) {
            console.warn(`⚠️ [YOUTUBE] No se encontraron datos para ${id}`);
            return null;
          }

          // ✅ OPTIMIZACIÓN: NO buscar otras plataformas automáticamente
          const instagramId = ytData.instagramId && ytData.instagramId.trim() !== '' ? ytData.instagramId : null;
          const tiktokId = ytData.tiktokId && ytData.tiktokId.trim() !== '' ? ytData.tiktokId : null;
          const youtubeId = ytData.youtubeId && ytData.youtubeId.trim() !== '' ? ytData.youtubeId : null;

          // Calcular valores antes de usarlos
          const youtubeFollowers = ytData.subscribers || 0;
          const youtubeEngagement = ytData.engageRate1Y || ytData.engageRate || 0;
          const totalFollowers = youtubeFollowers; // Solo YouTube por defecto
          const primaryEngagement = youtubeEngagement;

          // Avatar
          let bestAvatar = '';
          if (ytData.avatar && ytData.avatar.trim() !== '' && ytData.avatar !== 'null') {
            bestAvatar = ytData.avatar;
          } else {
            bestAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent((ytData.youtubeName || 'U').charAt(0))}&background=6366f1&color=fff&size=128`;
          }

          // NUEVO: Guardar siempre los IDs de todas las plataformas asociadas
          const platformInfo: any = {
            youtube: youtubeId ? { id: youtubeId, ...ytData, subscribers: youtubeFollowers, engageRate1Y: youtubeEngagement, avatar: bestAvatar } : null,
            instagram: instagramId ? { id: instagramId, needsFetch: true } : null,
            tiktok: tiktokId ? { id: tiktokId, needsFetch: true } : null
          };

          return {
            creatorId: ytData.youtubeId,
            name: ytData.youtubeName || 'Sin nombre',
            avatar: bestAvatar,
            image: bestAvatar,
            isVerified: false,
            contentNiches: ytData.hashtags || [],
            country: ytData.country || '-',
            language: ytData.lang || 'N/A',
            followersCount: totalFollowers, // ✅ Usar solo YouTube para filtros precisos
            averageEngagementRate: primaryEngagement,
            mainSocialPlatform: 'YouTube', // ✅ Indicar plataforma principal
            platformInfo,
            // 📊 Información adicional para debugging
            followerBreakdown: {
              total: totalFollowers,
              youtube: youtubeFollowers,
              instagram: 0, // Se puede llenar después si es necesario
              tiktok: 0
            }
          };
          
        } catch (err) {
          console.error(`❌ [YOUTUBE] Error procesando ${id}:`, (err as any).message);
          return null;
        }
      })
    );

    // Extraer resultados exitosos
    const validResults = allResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<any>).value);

    const processingTime = Date.now() - startTime;
    const tokensUsed = influencerIds.length * 2; // 2 tokens por getYoutubeBasic
    
    

    return validResults;
  }

  // NUEVA FUNCIÓN OPTIMIZADA: Procesa los resultados de Instagram Advanced Search
  private static async processInstagramSearchResults(influencerIds: string[]): Promise<any[]> {
    const startTime = Date.now();
    
    
    
    // ✅ OPTIMIZACIÓN: Procesar TODOS en paralelo real (sin delays escalonados)
    // CreatorDB soporta hasta 50 req/seg, así que podemos hacer todas simultáneamente
    const allResults = await Promise.allSettled(
      influencerIds.map(async (id: string, index: number) => {
        // ⚡ ELIMINADO: Delay escalonado para procesamiento paralelo real
        // Ahora todas las llamadas se ejecutan al mismo tiempo
        
        try {
          // ✅ OPTIMIZACIÓN: Solo Instagram básico inicialmente
          const igResStartTime = Date.now();
          const igRes = await this.getInstagramBasic(id);
          const igResEndTime = Date.now();
          
          const igData = igRes?.data?.basicInstagram;
          
          if (!igData) {
            console.warn(`⚠️ [INSTAGRAM] No se encontraron datos para ${id}`);
            return null;
          }

          // ✅ OPTIMIZACIÓN: NO buscar otras plataformas automáticamente
          // Solo usar los IDs que vienen en Instagram si están disponibles
          
          // 🎯 ARREGLO: Validar que el youtubeId sea realmente un YouTube ID, no el Instagram username
          let youtubeId = null;
          if (igData.youtubeId && igData.youtubeId.trim() !== '') {
            const potentialYoutubeId = igData.youtubeId.trim();
            // Si el youtubeId es diferente al instagramId, probablemente es válido
            if (potentialYoutubeId !== igData.instagramId && potentialYoutubeId !== id) {
              youtubeId = potentialYoutubeId;
            } else {
              console.warn(`⚠️ [INSTAGRAM] youtubeId parece ser el mismo que instagramId: ${potentialYoutubeId}`);
            }
          }
          
          // 🎯 ARREGLO: Validar que el tiktokId sea realmente un TikTok ID, no el Instagram username
          let tiktokId = null;
          if (igData.tiktokId && igData.tiktokId.trim() !== '') {
            const potentialTiktokId = igData.tiktokId.trim();
            // Si el tiktokId es diferente al instagramId, probablemente es válido
            if (potentialTiktokId !== igData.instagramId && potentialTiktokId !== id) {
              tiktokId = potentialTiktokId;
            } else {
              console.warn(`⚠️ [INSTAGRAM] tiktokId parece ser el mismo que instagramId: ${potentialTiktokId}`);
            }
          }
          
          const instagramId = igData.instagramId && igData.instagramId.trim() !== '' ? igData.instagramId : null;

          // Calcular valores antes de usarlos
          const instagramFollowers = igData.followers || 0;
          const instagramEngagement = igData.engageRate || 0;
          const totalFollowers = instagramFollowers; // Solo Instagram por defecto
          const primaryEngagement = instagramEngagement;

          // ✅ AVATAR CORREGIDO: Extraer correctamente el avatar de Instagram
          let bestAvatar = '';
          if (igData.avatar && igData.avatar.trim() !== '' && igData.avatar !== 'null') {
            bestAvatar = igData.avatar;
          } else {
            bestAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent((igData.instagramName || 'U').charAt(0))}&background=6366f1&color=fff&size=128`;
          }

          // NUEVO: Guardar siempre los IDs de todas las plataformas asociadas
          const platformInfo: any = {
            instagram: instagramId ? { 
              id: instagramId, 
              ...igData, 
              followers: instagramFollowers, 
              engageRate: instagramEngagement, 
              avatar: bestAvatar // ✅ Asegurar que el avatar se pase correctamente
            } : null,
            youtube: youtubeId ? { id: youtubeId, needsFetch: true } : null,
            tiktok: tiktokId ? { id: tiktokId, needsFetch: true } : null
          };

          const result = {
            creatorId: igData.instagramId,
            name: igData.instagramName || 'Sin nombre',
            avatar: bestAvatar, // ✅ Usar el avatar extraído correctamente
            image: bestAvatar, // ✅ Para compatibilidad
            isVerified: igData.isVerified || false,
            contentNiches: igData.hashtags || [],
            country: igData.country || '-',
            language: igData.lang || 'N/A',
            followersCount: totalFollowers, // ✅ Usar solo Instagram para filtros precisos
            averageEngagementRate: primaryEngagement,
            mainSocialPlatform: 'Instagram', // ✅ Indicar plataforma principal
            platformInfo,
            // 📊 Información adicional para debugging
            followerBreakdown: {
              total: totalFollowers,
              instagram: instagramFollowers,
              youtube: 0, // Se puede llenar después si es necesario
              tiktok: 0
            }
          };

          return result;
          
        } catch (err) {
          console.error(`❌ [INSTAGRAM] Error procesando ${id}:`, (err as any).message);
          return null;
        }
      })
    );

    // Extraer resultados exitosos
    const validResults = allResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<any>).value);

    const processingTime = Date.now() - startTime;
    

    return validResults;
  }

  /**
   * NUEVA FUNCIÓN OPTIMIZADA: Procesa los resultados de TikTok Advanced Search
   */
  private static async processTikTokSearchResults(influencerIds: string[]): Promise<any[]> {
    const startTime = Date.now();
    
    
    // ✅ OPTIMIZACIÓN: Procesar TODOS en paralelo real (sin delays escalonados)
    const allResults = await Promise.allSettled(
      influencerIds.map(async (id: string, index: number) => {
        // ⚡ ELIMINADO: Delay escalonado para procesamiento paralelo real
        // Ahora todas las llamadas se ejecutan al mismo tiempo
        
        try {
          const ttRes = await this.getTikTokBasic(id);
          const ttData = ttRes?.data?.basicTikTok;
          
          if (!ttData) {
            console.warn(`⚠️ [TIKTOK] No se encontraron datos para ${id}`);
            return null;
          }

          const youtubeId = ttData.youtubeId && ttData.youtubeId.trim() !== '' ? ttData.youtubeId : null;
          const instagramId = ttData.instagramId && ttData.instagramId.trim() !== '' ? ttData.instagramId : null;
          const tiktokId = ttData.tiktokId && ttData.tiktokId.trim() !== '' ? ttData.tiktokId : null;

          const tiktokFollowers = ttData.followers || 0;
          const tiktokEngagement = ttData.engageRate || 0;
          const totalFollowers = tiktokFollowers;
          const primaryEngagement = tiktokEngagement;

          let bestAvatar = '';
          if (ttData.avatar && ttData.avatar.trim() !== '' && ttData.avatar !== 'null') {
            bestAvatar = ttData.avatar;
          } else {
            bestAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent((ttData.tiktokName || 'U').charAt(0))}&background=6366f1&color=fff&size=128`;
          }

          const platformInfo: any = {
            tiktok: tiktokId ? { id: tiktokId, ...ttData, followers: tiktokFollowers, engageRate: tiktokEngagement, avatar: bestAvatar } : null,
            youtube: youtubeId ? { id: youtubeId, needsFetch: true } : null,
            instagram: instagramId ? { id: instagramId, needsFetch: true } : null
          };

          return {
            creatorId: ttData.tiktokId,
            name: ttData.tiktokName || 'Sin nombre',
            avatar: bestAvatar,
            image: bestAvatar,
            isVerified: ttData.isVerified || false,
            contentNiches: ttData.hashtags || [],
            country: ttData.country || '-',
            language: ttData.lang || 'N/A',
            followersCount: totalFollowers,
            averageEngagementRate: primaryEngagement,
            mainSocialPlatform: 'TikTok',
            platformInfo,
            followerBreakdown: {
              total: totalFollowers,
              tiktok: tiktokFollowers,
              youtube: 0,
              instagram: 0
            }
          };
          
        } catch (err) {
          console.error(`❌ [TIKTOK] Error procesando ${id}:`, (err as any).message);
          return null;
        }
      })
    );

    const validResults = allResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<any>).value);

    const processingTime = Date.now() - startTime;
    

    return validResults;
  }

  /**
   * NUEVA FUNCIÓN: Procesa los resultados de Threads Advanced Search
   */
  private static async processThreadsSearchResults(influencerIds: string[]): Promise<any[]> {
    const startTime = Date.now();

    
    // ✅ OPTIMIZACIÓN: Procesar TODOS en paralelo real (sin delays escalonados)
    const allResults = await Promise.allSettled(
      influencerIds.map(async (id: string, index: number) => {
        // ⚡ ELIMINADO: Delay escalonado para procesamiento paralelo real
        // Ahora todas las llamadas se ejecutan al mismo tiempo
        
        try {
          const thRes = await this.getThreadsBasic(id);
          const thData = thRes?.data?.basicThreads;
          
          if (!thData) {
            console.warn(`⚠️ [THREADS] No se encontraron datos para ${id}`);
            return null;
          }

          const threadsId = thData.threadsId && thData.threadsId.trim() !== '' ? thData.threadsId : null;
          const threadsFollowers = thData.followers || 0;
          const threadsEngagement = thData.gRateThreadsTabAvgLikes || 0;
          const totalFollowers = threadsFollowers;
          const primaryEngagement = threadsEngagement;

          let bestAvatar = '';
          if (thData.avatar && thData.avatar.trim() !== '' && thData.avatar !== 'null') {
            bestAvatar = thData.avatar;
          } else {
            bestAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent((thData.threadsName || 'U').charAt(0))}&background=6366f1&color=fff&size=128`;
          }

          const platformInfo: any = {
            threads: threadsId ? { id: threadsId, ...thData, followers: threadsFollowers, engageRate: threadsEngagement, avatar: bestAvatar } : null
          };

          return {
            creatorId: thData.threadsId,
            name: thData.threadsName || 'Sin nombre',
            avatar: bestAvatar,
            image: bestAvatar,
            isVerified: thData.isVerified || false,
            contentNiches: thData.hashtags || [],
            country: thData.country || '-',
            language: thData.lang || 'N/A',
            followersCount: totalFollowers,
            averageEngagementRate: primaryEngagement,
            mainSocialPlatform: 'Threads',
            platformInfo,
            followerBreakdown: {
              total: totalFollowers,
              threads: threadsFollowers
            }
          };
          
        } catch (err) {
          console.error(`❌ [THREADS] Error procesando ${id}:`, (err as any).message);
          return null;
        }
      })
    );

    const validResults = allResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<any>).value);

    const processingTime = Date.now() - startTime;
    

    return validResults;
  }

  /**
   * NUEVA FUNCIÓN: Procesa los resultados de Facebook Advanced Search
   */
  private static async processFacebookSearchResults(influencerIds: string[]): Promise<any[]> {
    const startTime = Date.now();
    
    
    // ✅ OPTIMIZACIÓN: Procesar TODOS en paralelo real (sin delays escalonados)
    const allResults = await Promise.allSettled(
      influencerIds.map(async (id: string, index: number) => {
        // ⚡ ELIMINADO: Delay escalonado para procesamiento paralelo real
        // Ahora todas las llamadas se ejecutan al mismo tiempo
        
        try {
          const fbRes = await this.getFacebookBasic(id);
          const fbData = fbRes?.data?.basicFacebook;
          
          if (!fbData) {
            console.warn(`⚠️ [FACEBOOK] No se encontraron datos para ${id}`);
            return null;
          }

          const facebookId = fbData.facebookId && fbData.facebookId.trim() !== '' ? fbData.facebookId : null;
          const facebookFollowers = fbData.followers || 0;
          const facebookEngagement = fbData.engageRate || 0;
          const totalFollowers = facebookFollowers;
          const primaryEngagement = facebookEngagement;

          let bestAvatar = '';
          if (fbData.avatar && fbData.avatar.trim() !== '' && fbData.avatar !== 'null') {
            bestAvatar = fbData.avatar;
          } else {
            bestAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent((fbData.facebookName || 'U').charAt(0))}&background=6366f1&color=fff&size=128`;
          }

          const platformInfo: any = {
            facebook: facebookId ? { id: facebookId, ...fbData, followers: facebookFollowers, engageRate: facebookEngagement, avatar: bestAvatar } : null
          };

          return {
            creatorId: fbData.facebookId,
            name: fbData.facebookName || 'Sin nombre',
            avatar: bestAvatar,
            image: bestAvatar,
            isVerified: fbData.isVerified || false,
            contentNiches: fbData.hashtags || [],
            country: fbData.country || '-',
            language: fbData.lang || 'N/A',
            followersCount: totalFollowers,
            averageEngagementRate: primaryEngagement,
            mainSocialPlatform: 'Facebook',
            platformInfo,
            followerBreakdown: {
              total: totalFollowers,
              facebook: facebookFollowers
            }
          };
          
        } catch (err) {
          console.error(`❌ [FACEBOOK] Error procesando ${id}:`, (err as any).message);
          return null;
        }
      })
    );

    const validResults = allResults
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<any>).value);

    const processingTime = Date.now() - startTime;
      

    return validResults;
  }

  /**
   * 🔍 VALIDACIÓN POST-CREATORDB - NUEVA FUNCIONALIDAD ✅
   * Valida que los resultados de CreatorDB cumplan realmente los filtros aplicados
   * Esta función se ejecuta después de recibir resultados de CreatorDB como fallback
   */
  private static validateCreatorDBResults(influencers: any[], appliedFilters: Record<string, any>) {
    if (!influencers || influencers.length === 0) {
      return { validResults: [], invalidResults: [], validationApplied: false };
    }

    const validResults: any[] = [];
    const invalidResults: any[] = [];
    let validationApplied = false;

    influencers.forEach(influencer => {
      let isValid = true;
      const reasons: string[] = [];
      
      try {
        // Obtener datos para validación según plataforma
        const platformData = this.extractPlatformDataForValidation(influencer, appliedFilters.platform);
        
        if (!platformData) {
          // Si no hay datos de plataforma, lo consideramos válido (mejor que perder el resultado)
          validResults.push(influencer);
          
          return;
        }

        const { followers, engagement, platform: detectedPlatform } = platformData;
        

        // ✅ VALIDAR FOLLOWERS
        if (appliedFilters.minFollowers && followers < appliedFilters.minFollowers) {
          isValid = false;
          reasons.push(`${followers} followers < ${appliedFilters.minFollowers} (mín)`);
        }
        
        if (appliedFilters.maxFollowers && appliedFilters.maxFollowers < 100000000 && followers > appliedFilters.maxFollowers) {
          isValid = false;
          reasons.push(`${followers} followers > ${appliedFilters.maxFollowers} (máx)`);
        }

        // ✅ VALIDAR ENGAGEMENT (convertir a porcentaje para comparar)
        if (engagement !== null && engagement !== undefined) {
          const engagementPercent = engagement * 100; // CreatorDB usa decimales (0.05 = 5%)
          
          if (appliedFilters.minEngagement && engagementPercent < appliedFilters.minEngagement) {
            isValid = false;
            reasons.push(`${engagementPercent.toFixed(2)}% engagement < ${appliedFilters.minEngagement}% (mín)`);
          }
          
          if (appliedFilters.maxEngagement && appliedFilters.maxEngagement < 100 && engagementPercent > appliedFilters.maxEngagement) {
            isValid = false;
            reasons.push(`${engagementPercent.toFixed(2)}% engagement > ${appliedFilters.maxEngagement}% (máx)`);
          }
        }

        // ✅ VALIDAR PAÍS (si está especificado)
        if (appliedFilters.country && appliedFilters.country !== 'all') {
          const influencerCountry = influencer.country || influencer.platformInfo?.youtube?.country || 
                                   influencer.platformInfo?.instagram?.country || influencer.platformInfo?.tiktok?.country;
          
          if (influencerCountry && influencerCountry !== appliedFilters.country) {
            isValid = false;
            reasons.push(`País ${influencerCountry} ≠ ${appliedFilters.country}`);
          }
        }

        if (isValid) {
          validResults.push(influencer);
        } else {
          validationApplied = true;
          invalidResults.push({
            influencer: influencer.name || 'Desconocido',
            reasons,
            followers,
            engagement: engagement ? (engagement * 100).toFixed(2) + '%' : 'N/A'
          });
          
        }

      } catch (error) {
        // En caso de error en validación, mejor incluir el resultado que perderlo
        
        validResults.push(influencer);
      }
    });

    // Log del resultado de validación
    if (validationApplied) {
      
      invalidResults.forEach(invalid => {
        
      });
    }

    return { validResults, invalidResults, validationApplied };
  }

  /**
   * Extrae datos de followers y engagement según la plataforma
   */
  private static extractPlatformDataForValidation(influencer: any, platform?: string) {
    try {
      // Priorizar según la plataforma de búsqueda
      if (platform === 'instagram' || platform === 'Instagram') {
        const igData = influencer.platformInfo?.instagram;
        if (igData && igData.followers !== undefined) {
          return {
            followers: igData.followers,
            engagement: igData.engageRate,
            platform: 'instagram'
          };
        }
      }

      if (platform === 'youtube' || platform === 'YouTube') {
        const ytData = influencer.platformInfo?.youtube;
        if (ytData && ytData.subscribers !== undefined) {
          return {
            followers: ytData.subscribers,
            engagement: ytData.engageRate1Y || ytData.engageRate,
            platform: 'youtube'
          };
        }
      }

      if (platform === 'tiktok' || platform === 'TikTok') {
        const ttData = influencer.platformInfo?.tiktok;
        if (ttData && ttData.followers !== undefined) {
          return {
            followers: ttData.followers,
            engagement: ttData.engageRate,
            platform: 'tiktok'
          };
        }
      }

      // Fallback: usar socialPlatforms array o buscar en cualquier plataforma
      if (influencer.socialPlatforms && influencer.socialPlatforms.length > 0) {
        const mainPlatform = influencer.socialPlatforms[0];
        return {
          followers: mainPlatform.followers,
          engagement: mainPlatform.engagement,
          platform: mainPlatform.platform
        };
      }

      // Último fallback: buscar en cualquier platformInfo disponible
      const platformInfo = influencer.platformInfo || {};
      for (const [platformName, data] of Object.entries(platformInfo)) {
        if (data && typeof data === 'object') {
          const followers = (data as any).followers || (data as any).subscribers;
          const engagement = (data as any).engageRate || (data as any).engageRate1Y;
          
          if (followers !== undefined) {
            return { followers, engagement, platform: platformName };
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Error extracting platform data for validation:', error);
      return null;
    }
  }

  /**
   * 🔍 BÚSQUEDA INTELIGENTE MULTI-PLATAFORMA - CORREGIDA ✅
   * Detecta automáticamente el tipo de búsqueda y usa los endpoints apropiados
   * 🎯 NUEVA PRIORIDAD: Instagram como plataforma principal para búsquedas "all"
   */
  static async smartSearch(query: string, platform: string) {
    const startTime = Date.now();
    
    

    try {
      // Detectar tipo de búsqueda
      const detectStartTime = Date.now();
      const searchType = this.detectSearchType(query);
      const detectEndTime = Date.now();
      


      let results: any[] = [];
      let searchSummary = { youtube: 0, instagram: 0, tiktok: 0 };
      let foundIds = { youtube: [], instagram: [], tiktok: [] }; // 🎯 AGREGAR IDs ENCONTRADOS

      if (platform === 'all') {
        // 🎯 NUEVA ESTRATEGIA: Solo buscar en Instagram y extraer IDs de otras plataformas
        
        
        const optimizedSearchStartTime = Date.now();
        
        // PASO 1: Buscar solo en Instagram (más rápido) - SIN FILTROS ADICIONALES
        const instagramResults = await this.searchInstagramSmart(query, searchType);
        
        
        // PASO 2: Obtener datos completos de Instagram y extraer IDs de otras plataformas
        const enrichedInstagramResults = await this.enrichSearchResults(
          instagramResults.map((id: string) => ({ id, platform: 'instagram' })), 
          'instagram'
        );
        
        // PASO 3: Extraer IDs de otras plataformas desde los datos de Instagram
        const crossPlatformResults = await this.extractCrossPlatformIds(enrichedInstagramResults);
        
        const optimizedSearchEndTime = Date.now();
        
        
        // Combinar resultados
        results = crossPlatformResults;
        searchSummary.instagram = instagramResults.length;
        
        // 🎯 CONTAR PLATAFORMAS ENCONTRADAS EN CADA PERFIL UNIFICADO
        let youtubeCount = 0;
        let tiktokCount = 0;
        
        crossPlatformResults.forEach((profile: any) => {
          if (profile.fullData?.youtube) youtubeCount++;
          if (profile.fullData?.tiktok) tiktokCount++;
        });
        
        searchSummary.youtube = youtubeCount;
        searchSummary.tiktok = tiktokCount;
      } else if (platform === 'YouTube') {
        const youtubeIds = await this.searchYoutubeSmart(query, searchType);
        results = youtubeIds.map((id: string) => ({ id, platform: 'youtube' }));
        searchSummary.youtube = youtubeIds.length;
      } else if (platform === 'Instagram') {
        const instagramIds = await this.searchInstagramSmart(query, searchType);
        results = instagramIds.map((id: string) => ({ id, platform: 'instagram' }));
        searchSummary.instagram = instagramIds.length;
      } else if (platform === 'TikTok') {
        const tiktokIds = await this.searchTikTokSmart(query, searchType);
        results = tiktokIds.map((id: string) => ({ id, platform: 'tiktok' }));
        searchSummary.tiktok = tiktokIds.length;
      }

      

      // Procesar y enriquecer resultados
      const enrichStartTime = Date.now();
      
      
      let enrichedResults: any[];
      
      if (platform === 'all') {
        // 🎯 NUEVA LÓGICA: Para búsqueda optimizada, ya tenemos los datos completos
        
        enrichedResults = results.map((result: any) => {
          if (result.fullData) {
            return this.convertToInfluencerFormat(result.fullData);
          }
          return result;
        });
      } else {
        // Lógica original para búsquedas específicas de plataforma
        enrichedResults = await this.enrichSearchResults(results, platform);
      }
      
      const enrichEndTime = Date.now();
      

      // 🔄 DEDUPLICAR RESULTADOS POR NOMBRE SIMILAR Y SEGUIDORES
      const deduplicateStartTime = Date.now();

      const deduplicatedResults = this.deduplicateInfluencers(enrichedResults);
      const deduplicateEndTime = Date.now();
      
      
      const totalTime = Date.now() - startTime;
      

      return {
        items: deduplicatedResults,
        count: deduplicatedResults.length,
        query,
        platform,
        searchType,
        searchSummary,
        executionTime: totalTime,
        priorityPlatform: platform === 'all' ? 'instagram' : platform.toLowerCase()
      };

    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      
      throw error;
    }
  }

  /**
   * Detecta el tipo de búsqueda basado en el query
   */
  private static detectSearchType(query: string): 'username' | 'name' | 'hashtag' | 'keyword' {
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.startsWith('@')) {
      return 'username';
    }
    if (trimmedQuery.startsWith('#')) {
      return 'hashtag';
    }
    // Si parece un nombre propio (mayúscula inicial, una o pocas palabras)
    if (/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/.test(trimmedQuery) && trimmedQuery.split(' ').length <= 3) {
      return 'name';
    }
    // Por defecto, buscar como keyword
    return 'keyword';
  }

  /**
   * 🎯 NUEVA FUNCIÓN: Extrae IDs de otras plataformas y crea perfiles unificados
   * Cuando obtenemos datos de Instagram, busca IDs de YouTube, TikTok, etc. y combina todo en un perfil
   */
  private static async extractCrossPlatformIds(instagramResults: any[]): Promise<any[]> {
    const startTime = Date.now();
    
    
    const unifiedProfiles: any[] = [];
    
    for (const instagramData of instagramResults) {
      try {
        // 🎯 CREAR PERFIL UNIFICADO CON DATOS DE INSTAGRAM
        const unifiedProfile = {
          id: instagramData.instagramId || instagramData.id,
          platform: 'all',
          priority: 1,
          fullData: {
            instagram: instagramData,
            youtube: null,
            tiktok: null,
            threads: null,
            facebook: null
          }
        };
        
        // 🎯 EXTRAER IDs DE OTRAS PLATAFORMAS Y OBTENER DATOS COMPLETOS
        const platformInfo = instagramData.platformInfo || {};
        
        // YouTube - Obtener datos completos
        if (platformInfo.youtube?.youtubeId) {
          
          try {
            const youtubeData = await this.getYoutubeBasic(platformInfo.youtube.youtubeId);
            if (youtubeData.success && youtubeData.data) {
              
              unifiedProfile.fullData.youtube = youtubeData.data;
            }
          } catch (youtubeError) {
            console.warn(`⚠️ [CROSS-PLATFORM] Error obteniendo datos de YouTube:`, youtubeError);
          }
        }
        
        // TikTok - Obtener datos completos
        if (platformInfo.tiktok?.tiktokId) {
          
          try {
            const tiktokData = await this.getTikTokBasic(platformInfo.tiktok.tiktokId);
            if (tiktokData.success && tiktokData.data) {
              
              unifiedProfile.fullData.tiktok = tiktokData.data;
            }
          } catch (tiktokError) {
            console.warn(`⚠️ [CROSS-PLATFORM] Error obteniendo datos de TikTok:`, tiktokError);
          }
        }
        
        // Threads - Obtener datos completos
        if (platformInfo.threads?.threadsId) {
          
          try {
            const threadsData = await this.getThreadsBasic(platformInfo.threads.threadsId);
            if (threadsData.success && threadsData.data) {
              
              unifiedProfile.fullData.threads = threadsData.data;
            }
          } catch (threadsError) {
            console.warn(`⚠️ [CROSS-PLATFORM] Error obteniendo datos de Threads:`, threadsError);
          }
        }
        
        // Facebook - Obtener datos completos
        if (platformInfo.facebook?.facebookId) {
          
          try {
            const facebookData = await this.getFacebookBasic(platformInfo.facebook.facebookId);
            if (facebookData.success && facebookData.data) {
              
              unifiedProfile.fullData.facebook = facebookData.data;
            }
          } catch (facebookError) {
            console.warn(`⚠️ [CROSS-PLATFORM] Error obteniendo datos de Facebook:`, facebookError);
          }
        }
        
        // Agregar el perfil unificado
        unifiedProfiles.push(unifiedProfile);
        
      } catch (error) {
        console.warn(`⚠️ [CROSS-PLATFORM] Error extrayendo IDs cruzados:`, error);
      }
    }
    
    const totalTime = Date.now() - startTime;

    
    return unifiedProfiles;
  }

  /**
   * 🎯 NUEVA FUNCIÓN: Genera variantes de búsqueda inteligentes
   * Ejemplo: "Lali" → ["lali", "Lali", "LALI", "lalii", "lali_official"]
   */
  private static generateSearchVariants(query: string): string[] {
    const cleanQuery = query.trim().toLowerCase();
    const variants = new Set<string>();
    
    // Variante original
    variants.add(cleanQuery);
    
    // Variante con primera letra mayúscula
    variants.add(cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1));
    
    // Variante todo mayúsculas
    variants.add(cleanQuery.toUpperCase());
    
    // Variante con doble 'i' al final (común en usernames)
    if (!cleanQuery.endsWith('i')) {
      variants.add(cleanQuery + 'i');
      variants.add(cleanQuery + 'ii');
    }
    
    // Variante con underscore (común en Instagram)
    variants.add(cleanQuery + '_');
    variants.add('_' + cleanQuery);
    variants.add(cleanQuery + '_official');
    
    // Variante con números comunes
    variants.add(cleanQuery + '1');
    variants.add(cleanQuery + '123');
    
    // Variante sin vocales (para casos como "lalii" → "lali")
    const withoutVowels = cleanQuery.replace(/[aeiou]/g, '');
    if (withoutVowels !== cleanQuery && withoutVowels.length > 2) {
      variants.add(withoutVowels);
    }
    
    // Filtrar variantes muy cortas o muy largas
    const filteredVariants = Array.from(variants).filter(variant => 
      variant.length >= 2 && variant.length <= 20
    );
    
    
    
    return filteredVariants;
  }

  /**
   * Búsqueda inteligente en YouTube - CORREGIDA ✅
   */
  private static async searchYoutubeSmart(query: string, searchType: string): Promise<any[]> {
    const cleanQuery = query.replace(/^[@#]/, ''); // Remover @ y # del inicio

    try {
      // 🔍 CONSTRUIR FILTROS PARA BÚSQUEDA AVANZADA
      const filters: {filterKey: string, op: string, value: any}[] = [];
      
      // Para nombres usar operador = (exacto) con channelTitle o youtubeName
      filters.push({ filterKey: 'channelTitle', op: '=', value: cleanQuery });

      const body = {
        maxResults: 20,
        offset: 0,
        sortBy: 'subscribers',
        desc: true,
        filters
      };

      

      const response = await creatorDBClient.post('/youtubeAdvancedSearch', body);
      
      
      
      // La respuesta viene en response.data.data como array de IDs
      return response.data.data || [];
      
    } catch (error: any) {
      console.error('Error en búsqueda YouTube:', error.message);
      // Intentar con youtubeName como fallback
      try {
        const fallbackFilters = [{ filterKey: 'youtubeName', op: '=', value: cleanQuery }];
        const fallbackBody = {
          maxResults: 20,
          offset: 0,
          sortBy: 'subscribers',
          desc: true,
          filters: fallbackFilters
        };
        
        
        const fallbackResponse = await creatorDBClient.post('/youtubeAdvancedSearch', fallbackBody);
        return fallbackResponse.data.data || [];
        
      } catch (fallbackError: any) {
        console.error('Error en fallback YouTube:', fallbackError.message);
        return [];
      }
    }
  }

  /**
   * Búsqueda inteligente en Instagram - ESTRATEGIA HÍBRIDA ✅
   */
  private static async searchInstagramSmart(query: string, searchType: string): Promise<any[]> {
    const startTime = Date.now();
    
    
    const cleanQuery = query.replace(/^[@#]/, '');

    try {
      // 🎯 NUEVA ESTRATEGIA: Generar variantes de búsqueda
      const searchVariants = this.generateSearchVariants(cleanQuery);
      
      
      // ESTRATEGIA 1: Búsquedas directas paralelas con variantes
      const directStartTime = Date.now();
      
      
      const directPromises = searchVariants.map(async (variant: string, index: number) => {
        // Rate limiting escalonado para búsquedas directas
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, index * 50)); // 50ms entre variantes
        }
        
        try {
          const response = await creatorDBClient.get('/instagramBasic', {
            params: { instagramId: variant }
          });
          
          if (response.data.success && response.data.data) {
            
            return variant;
          }
        } catch (error) {
          // Silenciar errores de búsqueda directa
        }
        return null;
      });
      
      const directResults = await Promise.allSettled(directPromises);
      const successfulDirect = directResults
        .filter((result: PromiseSettledResult<string | null>) => result.status === 'fulfilled' && result.value !== null)
        .map((result: PromiseSettledResult<string | null>) => (result as PromiseFulfilledResult<string>).value);
      
      const directEndTime = Date.now();
      
      if (successfulDirect.length > 0) {
        return successfulDirect;
      }

      // ESTRATEGIA 2: Búsqueda general con filtros adicionales y variantes
      const generalStartTime = Date.now();
      

      // Construir filtros básicos para búsqueda inteligente - SIN FILTROS ADICIONALES
      const searchFilters = {
        size: 200, // Más resultados para filtrar con variantes
        page: 1
      };
      
      const body = this.buildInstagramSearchBody(searchFilters);
      
      // Agregar filtro mínimo de seguidores si no está presente
      const hasMinFollowers = body.filters.some((f: any) => f.filterKey === 'followers' && f.op === '>');
      if (!hasMinFollowers) {
        body.filters.push({ filterKey: 'followers', op: '>', value: 1000 }); // Al menos 1K seguidores
      }

      const responseStartTime = Date.now();
      const response = await creatorDBClient.post('/instagramAdvancedSearch', body);
      const responseEndTime = Date.now();
      

      // ESTRATEGIA 3: Filtrar resultados localmente con variantes
      const filterStartTime = Date.now();
      const allResults = response.data.data || [];
      
      // 🎯 NUEVO: Filtrar con todas las variantes
      const filtered = allResults.filter((id: string) => {
        const lowerId = id.toLowerCase();
        return searchVariants.some(variant => 
          lowerId.includes(variant.toLowerCase()) || 
          variant.toLowerCase().includes(lowerId)
        );
      });
      
      const filterEndTime = Date.now();
      
      
      if (filtered.length === 0) {
       
      }
      
      const totalTime = Date.now() - startTime;
      
      
      return filtered.slice(0, 20); // Limitar a 20 resultados
      
    } catch (error: any) {
      console.error('Error en búsqueda Instagram:', error.message);
      return [];
    }
  }

  /**
   * Búsqueda inteligente en TikTok - ESTRATEGIA HÍBRIDA ✅
   */
  private static async searchTikTokSmart(query: string, searchType: string): Promise<any[]> {
    const startTime = Date.now();
    
    
    const cleanQuery = query.replace(/^[@#]/, '');

    try {
      // 🎯 NUEVA ESTRATEGIA: Generar variantes de búsqueda
      const searchVariants = this.generateSearchVariants(cleanQuery);
      
      
      // ESTRATEGIA 1: Búsquedas directas paralelas con variantes
      const directStartTime = Date.now();
      
      
      const directPromises = searchVariants.map(async (variant: string, index: number) => {
        // Rate limiting escalonado para búsquedas directas
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, index * 50)); // 50ms entre variantes
        }
        
        try {
          const response = await creatorDBClient.get('/tiktokBasic', {
            params: { tiktokId: variant }
          });
          
          if (response.data.success && response.data.data) {
            
            return variant;
          }
        } catch (error) {
          // Silenciar errores de búsqueda directa
        }
        return null;
      });
      
      const directResults = await Promise.allSettled(directPromises);
      const successfulDirect = directResults
        .filter((result: PromiseSettledResult<string | null>) => result.status === 'fulfilled' && result.value !== null)
        .map((result: PromiseSettledResult<string | null>) => (result as PromiseFulfilledResult<string>).value);
      
      const directEndTime = Date.now();
      
      
      if (successfulDirect.length > 0) {
        return successfulDirect;
      }

      // ESTRATEGIA 2: Búsqueda general con filtros mínimos y variantes
      const generalStartTime = Date.now();
      
      
      const filters: {filterKey: string, op: string, value: any}[] = [];
      
      // Usar filtros mínimos que sí funcionan
      filters.push({ filterKey: 'followers', op: '>', value: 1000 }); // Al menos 1K seguidores

      const body = {
        maxResults: 200, // Más resultados para filtrar con variantes
        offset: 0,
        sortBy: 'followers',
        desc: true,
        filters
      };

      const responseStartTime = Date.now();
      const response = await creatorDBClient.post('/tiktokAdvancedSearch', body);
      const responseEndTime = Date.now();
      

      // ESTRATEGIA 3: Filtrar resultados localmente con variantes
      const filterStartTime = Date.now();
      const allResults = response.data.data || [];
      
      // 🎯 NUEVO: Filtrar con todas las variantes
      const filtered = allResults.filter((id: string) => {
        const lowerId = id.toLowerCase();
        return searchVariants.some(variant => 
          lowerId.includes(variant.toLowerCase()) || 
          variant.toLowerCase().includes(lowerId)
        );
      });
      
      const filterEndTime = Date.now();

      if (filtered.length === 0) {
        }
      
      const totalTime = Date.now() - startTime;
        
      return filtered.slice(0, 20); // Limitar a 20 resultados
      
    } catch (error: any) {
      console.error('Error en búsqueda TikTok:', error.message);
      return [];
    }
  }

  /**
   * NOTA: Los filtros adicionales (país, seguidores, etc.) se implementarán 
   * en una segunda fase ya que requieren endpoints avanzados con sintaxis específica.
   * Por ahora, la búsqueda inteligente se enfoca en la búsqueda por texto.
   */

  /**
   * Enriquece los resultados de búsqueda con datos adicionales
   * 🎯 MEJORADO: Busca IDs vinculados cuando viene de Instagram Advanced Search
   */
  private static async enrichSearchResults(results: any[], platform: string): Promise<any[]> {
    const startTime = Date.now();

    // Procesar en batches para evitar saturar la API
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < results.length; i += batchSize) {
      batches.push(results.slice(i, i + batchSize));
    }

    const allEnrichedResults: any[] = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchStartTime = Date.now();
        
      const batchResults = await Promise.allSettled(
        batch.map(async (result: any) => {
          try {
            const { id, platform: sourcePlatform } = result;
            let enrichedData: any = { ...result };

            // 🎯 NUEVA LÓGICA: Buscar IDs vinculados cuando viene de Instagram
            if (sourcePlatform === 'instagram' && platform === 'all') {

              
              // 1. Obtener Instagram Basic para conseguir IDs vinculados
              try {
                const instagramData = await CreatorDBService.getInstagramBasic(id);
                if (instagramData?.basicInstagram) {
                  const instagramBasic = instagramData.basicInstagram;
                  
                  // 🎯 EXTRAER TODOS LOS IDs VINCULADOS POSIBLES
                  const linkedIds = {
                    youtubeId: instagramBasic.youtubeId,
                    tiktokId: instagramBasic.tiktokId,
                    facebookId: (instagramBasic as any).facebookId,
                    threadsId: (instagramBasic as any).threadsId
                  };
                  
                  
                  
                  // 2. Buscar datos de TODAS las plataformas vinculadas en paralelo
                  const linkedPlatformPromises = [];
                  
                  if (linkedIds.youtubeId) {
                    
                    linkedPlatformPromises.push(
                      CreatorDBService.getYoutubeBasic(linkedIds.youtubeId)
                        .then(data => ({ platform: 'youtube', data: data?.basicYoutube }))
                        .catch(err => {
                          console.warn(`⚠️ Error obteniendo YouTube ${linkedIds.youtubeId}:`, err.message);
                          return { platform: 'youtube', data: null };
                        })
                    );
                  }
                  
                  if (linkedIds.tiktokId) {
                    
                    linkedPlatformPromises.push(
                      CreatorDBService.getTikTokBasic(linkedIds.tiktokId)
                        .then(data => ({ platform: 'tiktok', data: data?.basicTikTok }))
                        .catch(err => {
                          console.warn(`⚠️ Error obteniendo TikTok ${linkedIds.tiktokId}:`, err.message);
                          return { platform: 'tiktok', data: null };
                        })
                    );
                  }
                  
                  if (linkedIds.facebookId) {
                    
                    linkedPlatformPromises.push(
                      CreatorDBService.getFacebookBasic(linkedIds.facebookId)
                        .then(data => ({ platform: 'facebook', data: data?.basicFacebook }))
                        .catch(err => {
                          console.warn(`⚠️ Error obteniendo Facebook ${linkedIds.facebookId}:`, err.message);
                          return { platform: 'facebook', data: null };
                        })
                    );
                  }
                  
                  if (linkedIds.threadsId) {
                    
                    linkedPlatformPromises.push(
                      CreatorDBService.getThreadsBasic(linkedIds.threadsId)
                        .then(data => ({ platform: 'threads', data: data?.basicThreads }))
                        .catch(err => {
                          console.warn(`⚠️ Error obteniendo Threads ${linkedIds.threadsId}:`, err.message);
                          return { platform: 'threads', data: null };
                        })
                    );
                  }
                  
                  // 3. Combinar todos los datos
                  enrichedData = {
                    id: id, // Usar Instagram ID como principal
                    platform: 'instagram', // Plataforma principal
                    instagram: instagramBasic,
                    youtube: null,
                    tiktok: null,
                    threads: null,
                    facebook: null
                  };
                  
                  if (linkedPlatformPromises.length > 0) {
                    
                    const linkedResults = await Promise.allSettled(linkedPlatformPromises);
                    
                    // Agregar datos de plataformas vinculadas
                    linkedResults.forEach(result => {
                      if (result.status === 'fulfilled' && result.value.data) {
                        enrichedData[result.value.platform] = result.value.data;
                        
                      }
                    });
                    
                    const obtainedPlatforms = Object.keys(enrichedData).filter(key => 
                      key !== 'id' && key !== 'platform' && enrichedData[key] !== null
                    );
                    
                    
                  } else {
                    
                  }
                  
                  // 🎯 CONVERTIR A FORMATO COMPATIBLE CON SAVEIFNOTEXISTS
                  const processedInfluencer = this.convertToInfluencerFormat(enrichedData);
                  return processedInfluencer;
                }
              } catch (error) {
                
                // Usar datos originales si falla la búsqueda vinculada
              }
            } else {
              // 🔄 LÓGICA ORIGINAL: Para plataformas específicas o no-Instagram
              if (sourcePlatform === 'youtube') {
                try {
                  const ytData = await CreatorDBService.getYoutubeBasic(id);
                  if (ytData?.basicYoutube) {
                    const { instagramId, tiktokId } = ytData.basicYoutube;
                    
                    const linkedPromises = [];
                    if (instagramId) {
                      linkedPromises.push(
                        CreatorDBService.getInstagramBasic(instagramId)
                          .then(data => ({ platform: 'instagram', data: data?.basicInstagram }))
                          .catch(() => ({ platform: 'instagram', data: null }))
                      );
                    }
                    if (tiktokId) {
                      linkedPromises.push(
                        CreatorDBService.getTikTokBasic(tiktokId)
                          .then(data => ({ platform: 'tiktok', data: data?.basicTikTok }))
                          .catch(() => ({ platform: 'tiktok', data: null }))
                      );
                    }
                    
                    enrichedData = {
                      id: id,
                      platform: 'youtube',
                      youtube: ytData.basicYoutube,
                      instagram: null,
                      tiktok: null,
                      threads: null,
                      facebook: null
                    };
                    
                    if (linkedPromises.length > 0) {
                      const linkedResults = await Promise.allSettled(linkedPromises);
                      linkedResults.forEach(result => {
                        if (result.status === 'fulfilled' && result.value.data) {
                          enrichedData[result.value.platform] = result.value.data;
                        }
                      });
                    }
                    
                    // Convertir a formato compatible
                    const processedInfluencer = this.convertToInfluencerFormat(enrichedData);
                    return processedInfluencer;
                  }
                } catch (error) {
                  console.warn(`⚠️ Error enriqueciendo YouTube ${id}:`, error);
                }
              }
              
              if (sourcePlatform === 'tiktok') {
                try {
                  const tiktokData = await CreatorDBService.getTikTokBasic(id);
                  if (tiktokData?.basicTikTok) {
                    enrichedData = {
                      id: id,
                      platform: 'tiktok',
                      tiktok: tiktokData.basicTikTok,
                      youtube: null,
                      instagram: null,
                      threads: null,
                      facebook: null
                    };
                    
                    // Convertir a formato compatible
                    const processedInfluencer = this.convertToInfluencerFormat(enrichedData);
                    return processedInfluencer;
                  }
                } catch (error) {
                  console.warn(`⚠️ Error enriqueciendo TikTok ${id}:`, error);
                }
              }
            }

            return enrichedData;
          } catch (error) {
            console.error(`Error procesando resultado ${result.id}:`, error);
            return result;
          }
        })
      );

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          allEnrichedResults.push(result.value);
        }
      });
      
      const batchEndTime = Date.now();
    
    }

    const totalTime = Date.now() - startTime;
    
    return allEnrichedResults;
  }

  /**
   * Deduplicar influencers que pueden aparecer desde múltiples plataformas
   */
  private static deduplicateInfluencers(influencers: any[]): any[] {
    const startTime = Date.now();
    
    // 🎯 NUEVA LÓGICA: Ser menos estricto con la deduplicación
    const seen = new Map<string, any>();
    
    for (const influencer of influencers) {
      // Verificar que el influencer tenga datos válidos
      if (!influencer) {
        continue;
      }
      
      // 🎯 NUEVA LÓGICA: Usar creatorId como identificador principal
      const creatorId = influencer.creatorId;
      const name = influencer.name?.toLowerCase().trim();
      const username = influencer.username?.toLowerCase().trim();
      
      // 🎯 CORRECCIÓN: Si no hay creatorId, usar otros identificadores
      const identifier = creatorId || name || username || `unknown_${Date.now()}`;
      
      // 🎯 CORRECCIÓN: No saltar si el nombre es "sin nombre" pero hay creatorId
      if (!identifier || identifier.length < 2) {
        
        
      }
      
      // 🎯 NUEVA LÓGICA: Usar creatorId como clave principal si está disponible
      const primaryKey = creatorId || identifier;
      
      if (!seen.has(primaryKey)) {
        // Primera vez que vemos este influencer
        
        seen.set(primaryKey, influencer);
      } else {
        // Ya existe, mantener el que tenga más datos completos
        const existing = seen.get(primaryKey);
        
        
        // Priorizar el que tenga:
        // 1. Más seguidores (datos más actualizados)
        // 2. Más plataformas activas
        // 3. Mejor engagement rate
        const existingPlatforms = Object.values(existing.platformInfo || {}).filter(p => p !== null).length;
        const currentPlatforms = Object.values(influencer.platformInfo || {}).filter(p => p !== null).length;
        
        const shouldReplace = 
          (influencer.followersCount || 0) > (existing.followersCount || 0) ||
          ((influencer.followersCount || 0) === (existing.followersCount || 0) && currentPlatforms > existingPlatforms) ||
          ((influencer.followersCount || 0) === (existing.followersCount || 0) && currentPlatforms === existingPlatforms && 
           (influencer.averageEngagementRate || 0) > (existing.averageEngagementRate || 0));
           
        if (shouldReplace) {
          
          seen.set(primaryKey, influencer);
        } else {
          
        }
      }
    }
    
    const deduplicated = Array.from(seen.values());
    
    const totalTime = Date.now() - startTime;
    
    
    return deduplicated.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0));
  }

  /**
   * 🔍 Construir body para búsqueda avanzada de Instagram
   */
  private static buildInstagramSearchBody(filters: Record<string, any>): Record<string, any> {
    
    
    // 🎯 NUEVO: Siempre pedir 50 resultados para optimizar caché
    const CACHE_BATCH_SIZE = 50;  
    
    const body: any = {
      maxResults: CACHE_BATCH_SIZE, // 🎯 CAMBIO: Siempre pedir 50, no el size solicitado
      offset: ((filters.page || 1) - 1) * (filters.size || 5), // Mantener offset original para paginación
      sortBy: filters.sortBy || 'followers',
      desc: filters.sortOrder !== 'asc',
      filters: [] as any[],
    };

    

    // Si hay username o query, agregar filtro por nombre de usuario
    if (filters.username) {
      
      body.filters.push({ filterKey: 'username', op: '=', value: filters.username });
    }

    // ✅ FILTRO DE PAÍS - CORREGIDO
    if (filters.country) {
      
      body.filters.push({ filterKey: 'country', op: '=', value: filters.country });
    }

    // ✅ FILTROS DE FOLLOWERS - CORREGIDO: Convertir a números
    if (filters.minFollowers) {
      const minFollowersValue = parseInt(filters.minFollowers.toString(), 10);
      
      body.filters.push({ filterKey: 'followers', op: '>', value: minFollowersValue });
    }

    if (filters.maxFollowers) {
      const maxFollowersValue = parseInt(filters.maxFollowers.toString(), 10);
      
      body.filters.push({ filterKey: 'followers', op: '<', value: maxFollowersValue });
    }

    // ✅ FILTRO POR DEFECTO: Si no hay filtros de seguidores, agregar +1M mínimo
    if (!filters.minFollowers && !filters.maxFollowers) {
     
      body.filters.push({ filterKey: 'followers', op: '>', value: 1000000 });
    }

    // ✅ FILTROS DE ENGAGEMENT - CORREGIDO: Usar 'engageRate' y convertir porcentaje a decimal
    if (filters.minEngagement) {
      const minEngagementValue = parseFloat(filters.minEngagement.toString()) / 100; // Convertir % a decimal

      body.filters.push({ filterKey: 'engageRate', op: '>', value: minEngagementValue });
    }

    if (filters.maxEngagement) {
      const maxEngagementValue = parseFloat(filters.maxEngagement.toString()) / 100; // Convertir % a decimal
      
      body.filters.push({ filterKey: 'engageRate', op: '<', value: maxEngagementValue });
    }

    // ✅ FILTRO DE CATEGORÍAS - ACTUALIZADO para manejar array
    if (filters.categories && Array.isArray(filters.categories) && filters.categories.length > 0) {
      
      body.filters.push({ filterKey: 'category', op: 'in', value: filters.categories });
    } else if (filters.category) {
      // Mantener compatibilidad con filtro de categoría única
      
      body.filters.push({ filterKey: 'category', op: '=', value: filters.category });
    }

    // ✅ FILTRO DE NICHOS - NUEVO (Instagram usa 'nicheIds')
    if (filters.nicheIds && Array.isArray(filters.nicheIds) && filters.nicheIds.length > 0) {
      
      // Instagram acepta múltiples nichos, los agregamos uno por uno
      filters.nicheIds.forEach((niche: string) => {
        body.filters.push({ filterKey: 'nicheIds', op: '=', value: niche });
      });
    }

    // ✅ FILTRO DE HASHTAGS - NUEVO
    if (filters.hashtags) {
      
      body.filters.push({ filterKey: 'hashtags', op: '=', value: filters.hashtags });
    }

    // ✅ FILTRO DE GROWTH RATE FOLLOWERS - NUEVO (RANGO)
    if (filters.minGRateFollowers || filters.maxGRateFollowers) {
      
      
      const minValue = filters.minGRateFollowers ? parseFloat(filters.minGRateFollowers.toString()) : 0;
      const maxValue = filters.maxGRateFollowers ? parseFloat(filters.maxGRateFollowers.toString()) : 1;
      
      
      if (filters.minGRateFollowers) {
        
        body.filters.push({ filterKey: 'gRateFollowers', op: '>', value: minValue });
      }
      
      if (filters.maxGRateFollowers && filters.maxGRateFollowers < 1) {
        
        body.filters.push({ filterKey: 'gRateFollowers', op: '<', value: maxValue });
      }
    }

    
    return body;
  }

  /**
   * Construye el cuerpo de la petición para youtubeAdvancedSearch según la documentación.
   */
  private static buildYoutubeSearchBody(filters: Record<string, any>): Record<string, any> {
   
    
    const { 
      page = 1, 
      size = 5, 
      minFollowers, 
      maxFollowers,
      country,
      minEngagement,
      maxEngagement,
      username,
    } = filters;

    const apiFilters: {filterKey: string, op: string, value: any}[] = [];

    if (country) {
      
      apiFilters.push({ filterKey: 'country', op: '=', value: country });
    }
    
    // ✅ CORREGIDO: Convertir a números
    if (minFollowers) {
      const minFollowersValue = parseInt(minFollowers.toString(), 10);
      
      apiFilters.push({ filterKey: 'subscribers', op: '>', value: minFollowersValue });
    }
    
    if (maxFollowers) {
      const maxFollowersValue = parseInt(maxFollowers.toString(), 10);
      
      apiFilters.push({ filterKey: 'subscribers', op: '<', value: maxFollowersValue });
    }

    // ✅ FILTRO POR DEFECTO: Si no hay filtros de seguidores, agregar +1M mínimo
    if (!minFollowers && !maxFollowers) {
      
      apiFilters.push({ filterKey: 'subscribers', op: '>', value: 1000000 });
    }
    
    // ✅ CORREGIDO: Convertir a números
    if (minEngagement) {
      const minEngagementValue = parseFloat(minEngagement.toString());
      
      apiFilters.push({ filterKey: 'engageRate1Y', op: '>', value: minEngagementValue / 100 });
    }
    
    if (maxEngagement) {
      const maxEngagementValue = parseFloat(maxEngagement.toString());
      
      apiFilters.push({ filterKey: 'engageRate1Y', op: '<', value: maxEngagementValue / 100 });
    }

    if (username) {
      
      apiFilters.push({ filterKey: 'youtube_handle', op: '=', value: username });
    }

    // ✅ FILTRO DE GROWTH RATE SUBSCRIBERS - NUEVO (YouTube usa 'gSubscribers')
    if (filters.minGRateFollowers || filters.maxGRateFollowers) {

      
      const minValue = filters.minGRateFollowers ? parseFloat(filters.minGRateFollowers.toString()) : 0;
      const maxValue = filters.maxGRateFollowers ? parseFloat(filters.maxGRateFollowers.toString()) : 1;
      
      
      if (filters.minGRateFollowers) {
       
        apiFilters.push({ filterKey: 'gSubscribers', op: '>', value: minValue });
      }
      
      if (filters.maxGRateFollowers && filters.maxGRateFollowers < 1) {
       
        apiFilters.push({ filterKey: 'gSubscribers', op: '<', value: maxValue });
      }
    }

    // ✅ FILTRO DE CATEGORÍAS - ACTUALIZADO para manejar array (YouTube usa mainCategory)
    if (filters.categories && Array.isArray(filters.categories) && filters.categories.length > 0) {

      // YouTube soporta múltiples categorías, las agregamos una por una
      filters.categories.forEach((category: string) => {
        apiFilters.push({ filterKey: 'mainCategory', op: '=', value: category });
      });
    } else if (filters.category) {
      // Mantener compatibilidad con filtro de categoría única
     
      apiFilters.push({ filterKey: 'mainCategory', op: '=', value: filters.category });
    }

    // ✅ FILTRO DE NICHOS - NUEVO (YouTube usa 'niche')
    if (filters.nicheIds && Array.isArray(filters.nicheIds) && filters.nicheIds.length > 0) {
      
      // YouTube acepta múltiples nichos, los agregamos uno por uno
      filters.nicheIds.forEach((niche: string) => {
        apiFilters.push({ filterKey: 'niche', op: '=', value: niche });
      });
    }

    // ❌ REMOVIDO: YouTube no soporta filtros de hashtags

    // 🎯 NUEVO: Siempre pedir 100 resultados para optimizar caché
    const CACHE_BATCH_SIZE = 50;
    
    const body = {
      maxResults: CACHE_BATCH_SIZE, // 🎯 CAMBIO: Siempre pedir 100, no el size solicitado
      offset: (page - 1) * size, // Mantener offset original para paginación
      sortBy: 'subscribers',
      desc: true,
      filters: apiFilters,
    };

    
    return body;
  }

  /**
   * 🔍 Construir body para búsqueda avanzada de TikTok
   */
  private static buildTikTokSearchBody(filters: Record<string, any>): Record<string, any> {
    
    // 🎯 NUEVO: Siempre pedir 100 resultados para optimizar caché
    const CACHE_BATCH_SIZE = 50;
    
    const { 
      page = 1, 
      size = 5, 
      minFollowers, 
      maxFollowers,
      country,
      minEngagement,
      maxEngagement,
      username,
    } = filters;

    const apiFilters: {filterKey: string, op: string, value: any}[] = [];

    if (country) {
      apiFilters.push({ filterKey: 'country', op: '=', value: country });
    }
    
    // ✅ CORREGIDO: Convertir a números
    if (minFollowers) {
      const minFollowersValue = parseInt(minFollowers.toString(), 10);
      apiFilters.push({ filterKey: 'followers', op: '>', value: minFollowersValue });
    }
    
    if (maxFollowers) {
      const maxFollowersValue = parseInt(maxFollowers.toString(), 10);
      apiFilters.push({ filterKey: 'followers', op: '<', value: maxFollowersValue });
    }

    // ✅ FILTRO POR DEFECTO: Si no hay filtros de seguidores, agregar +1M mínimo
    if (!minFollowers && !maxFollowers) {
      
      apiFilters.push({ filterKey: 'followers', op: '>', value: 1000000 });
    }
    
    // ✅ CORREGIDO: Convertir a números
    if (minEngagement) {
      const minEngagementValue = parseFloat(minEngagement.toString());
      apiFilters.push({ filterKey: 'engageRate', op: '>', value: minEngagementValue / 100 });
    }
    
    if (maxEngagement) {
      const maxEngagementValue = parseFloat(maxEngagement.toString());
      apiFilters.push({ filterKey: 'engageRate', op: '<', value: maxEngagementValue / 100 });
    }

    if (username) {
      apiFilters.push({ filterKey: 'username', op: '=', value: username });
    }

    // ✅ FILTRO DE GROWTH RATE FOLLOWERS - TikTok usa 'gRateFollowers'
    if (filters.minGRateFollowers || filters.maxGRateFollowers) {
     
      
      const minValue = filters.minGRateFollowers ? parseFloat(filters.minGRateFollowers.toString()) : 0;
      const maxValue = filters.maxGRateFollowers ? parseFloat(filters.maxGRateFollowers.toString()) : 1;
      
      
      if (filters.minGRateFollowers) {
       
        apiFilters.push({ filterKey: 'gRateFollowers', op: '>', value: minValue });
      }
      
      if (filters.maxGRateFollowers && filters.maxGRateFollowers < 1) {
       
        apiFilters.push({ filterKey: 'gRateFollowers', op: '<', value: maxValue });
      }
    }

    // ✅ FILTRO DE CATEGORÍAS - ACTUALIZADO para manejar array (TikTok usa category)
    if (filters.categories && Array.isArray(filters.categories) && filters.categories.length > 0) {
     
      // TikTok soporta múltiples categorías, las agregamos una por una
      filters.categories.forEach((category: string) => {
        apiFilters.push({ filterKey: 'category', op: '=', value: category });
      });
    } else if (filters.category) {
      // Mantener compatibilidad con filtro de categoría única
      
      apiFilters.push({ filterKey: 'category', op: '=', value: filters.category });
    }

    // ✅ FILTRO DE NICHOS - NUEVO (TikTok usa 'niche')
    if (filters.nicheIds && Array.isArray(filters.nicheIds) && filters.nicheIds.length > 0) {
      
      // TikTok acepta múltiples nichos, los agregamos uno por uno
      filters.nicheIds.forEach((niche: string) => {
        apiFilters.push({ filterKey: 'niche', op: '=', value: niche });
      });
    }

    const body = {
      maxResults: CACHE_BATCH_SIZE, // 🎯 CAMBIO: Siempre pedir 50, no el size solicitado
      offset: (page - 1) * size, // Mantener offset original para paginación
      sortBy: 'followers', 
      desc: true,
      filters: apiFilters,
    };


    return body;
  }

  /**
   * Construye el cuerpo de la petición para threadsAdvancedSearch según la documentación.
   */
  private static buildThreadsSearchBody(filters: Record<string, any>): Record<string, any> {
    // 🎯 NUEVO: Siempre pedir 100 resultados para optimizar caché
    const CACHE_BATCH_SIZE = 50;
    
    const body: any = {
      maxResults: CACHE_BATCH_SIZE, // 🎯 CAMBIO: Siempre pedir 50, no el size solicitado
      offset: ((filters.page || 1) - 1) * (filters.size || 5), // Mantener offset original para paginación
      sortBy: filters.sortBy || 'followers',
      desc: filters.sortOrder !== 'asc',
      filters: [] as any[],
    };

    // Si hay username o query, agregar filtro por nombre de usuario
    if (filters.username || filters.query) {
      const username = filters.username || filters.query;
      body.filters.push({ filterKey: 'threadsName', op: '=', value: username });
    }

    if (filters.minFollowers) {
      body.filters.push({ filterKey: 'followers', op: '>', value: filters.minFollowers });
    }
    if (filters.maxFollowers) {
      body.filters.push({ filterKey: 'followers', op: '<', value: filters.maxFollowers });
    }

    // ✅ FILTRO POR DEFECTO: Si no hay filtros de seguidores, agregar +1M mínimo
    if (!filters.minFollowers && !filters.maxFollowers) {
      
      body.filters.push({ filterKey: 'followers', op: '>', value: 1000000 });
    }
    if (filters.minEngagement) {
      body.filters.push({ filterKey: 'gRateThreadsTabAvgLikes', op: '>', value: filters.minEngagement / 100 });
    }
    if (filters.maxEngagement) {
      body.filters.push({ filterKey: 'gRateThreadsTabAvgLikes', op: '<', value: filters.maxEngagement / 100 });
    }

    // Si no hay ningún filtro, agregar uno por defecto
    if (body.filters.length === 0) {
      body.filters.push({ filterKey: 'followers', op: '>', value: 0 });
      body.filters.push({ filterKey: 'followers', op: '<', value: 1000000000 });
    }

    return body;
  }

  /**
   * Construye el cuerpo de la petición para facebookAdvancedSearch según la documentación.
   * ⚠️ LIMITADO: Facebook NO soporta filtros de país ni engagement_rate estándar
   */
  private static buildFacebookSearchBody(filters: Record<string, any>): Record<string, any> {
    
    
    // 🎯 NUEVO: Siempre pedir 50 resultados para optimizar caché
    const CACHE_BATCH_SIZE = 50; 
    
    const body: any = {   
      maxResults: CACHE_BATCH_SIZE, // 🎯 CAMBIO: Siempre pedir 50, no el size solicitado
      offset: ((filters.page || 1) - 1) * (filters.size || 5), // Mantener offset original para paginación
      sortBy: filters.sortBy || 'followers',
      desc: filters.sortOrder !== 'asc',
      filters: [] as any[],
    };

    

    // Si hay username o query, agregar filtro por nombre de usuario
    if (filters.username || filters.query) {
      const username = filters.username || filters.query;
      
      body.filters.push({ filterKey: 'facebookName', op: '=', value: username });
    }

    // ⚠️ ADVERTENCIA: Facebook NO soporta filtro de país
    if (filters.country) {
     
    }

    // ✅ FILTROS DE FOLLOWERS - Estos SÍ funcionan en Facebook
    if (filters.minFollowers) {
      const minFollowersValue = parseInt(filters.minFollowers.toString(), 10);
      
      body.filters.push({ filterKey: 'followers', op: '>', value: minFollowersValue });
    }
    
    if (filters.maxFollowers) {
      const maxFollowersValue = parseInt(filters.maxFollowers.toString(), 10);
      body.filters.push({ filterKey: 'followers', op: '<', value: maxFollowersValue });
    }

    // ✅ FILTRO POR DEFECTO: Si no hay filtros de seguidores, agregar +1M mínimo
    if (!filters.minFollowers && !filters.maxFollowers) {
      body.filters.push({ filterKey: 'followers', op: '>', value: 1000000 });
    }

    // ⚠️ ADVERTENCIA: Facebook NO tiene engagement_rate, usar avgReactions como alternativa
    if (filters.minEngagement || filters.maxEngagement) {
      
      
      // Como alternativa, podríamos usar avgReactions pero es diferente
      // if (filters.minEngagement) {
      //   const minValue = parseFloat(filters.minEngagement.toString());
      //   body.filters.push({ filterKey: 'avgReactions', op: '>', value: minValue });
      // }
    }

    // ✅ FILTRO DE CATEGORÍAS - Facebook SÍ soporta category
    if (filters.categories && Array.isArray(filters.categories) && filters.categories.length > 0) {
      
      // Facebook soporta múltiples categorías, las agregamos una por una
      filters.categories.forEach((category: string) => {
        body.filters.push({ filterKey: 'category', op: '=', value: category });
      });
    }

   
    return body;
  }

  // Buscar influencer por username en Instagram
  static async searchInstagramInfluencer(username: string) {
    const response = await creatorDBClient.get('/instagram/search', { params: { username } });
    return response.data;
  }

  // Buscar influencer por username en TikTok
  static async searchTikTokInfluencer(username: string) {
    const response = await creatorDBClient.get('/tiktok/search', { params: { username } });
    return response.data;
  }

  // Buscar influencer por username en YouTube
  static async searchYouTubeInfluencer(username: string) {
    const response = await creatorDBClient.get('/youtube/search', { params: { username } });
    return response.data;
  }

  /**
   * 🔄 CONVIERTE DATOS ENRIQUECIDOS AL FORMATO COMPATIBLE
   * Transforma la estructura de datos multi-plataforma al formato esperado por saveIfNotExists
   */
  private static convertToInfluencerFormat(enrichedData: any) {
    try {
      const { id, platform: sourcePlatform, instagram, youtube, tiktok, threads, facebook } = enrichedData;
      
      // 🎯 CALCULAR FOLLOWER BREAKDOWN TOTAL
      const youtubeFollowers = youtube?.subscribers || 0;
      const instagramFollowers = instagram?.followers || 0;
      const tiktokFollowers = tiktok?.followers || 0;
      const threadsFollowers = threads?.followers || 0;
      const facebookFollowers = facebook?.followers || 0;
      
      const totalFollowers = youtubeFollowers + instagramFollowers + tiktokFollowers + threadsFollowers + facebookFollowers;
      
      // 🎯 DETERMINAR PLATAFORMA PRINCIPAL Y DATOS PRIMARIOS
      let primaryData = null;
      let mainPlatform = sourcePlatform;
      let primaryFollowers = 0;
      let primaryEngagement = 0;
      
      // Priorizar Instagram para búsquedas "all", luego por seguidores
      if (instagram && instagramFollowers > 0) {
        primaryData = instagram;
        mainPlatform = 'Instagram';
        primaryFollowers = instagramFollowers;
        primaryEngagement = instagram.engageRate || 0;
      } else if (youtube && youtubeFollowers > primaryFollowers) {
        primaryData = youtube;
        mainPlatform = 'YouTube';
        primaryFollowers = youtubeFollowers;
        primaryEngagement = youtube.engageRate1Y || youtube.engageRate || 0;
      } else if (tiktok && tiktokFollowers > primaryFollowers) {
        primaryData = tiktok;
        mainPlatform = 'TikTok';
        primaryFollowers = tiktokFollowers;
        primaryEngagement = tiktok.engageRate || 0;
      } else if (facebook && facebookFollowers > primaryFollowers) {
        primaryData = facebook;
        mainPlatform = 'Facebook';
        primaryFollowers = facebookFollowers;
        primaryEngagement = facebook.engageRate || 0;
      } else if (threads && threadsFollowers > primaryFollowers) {
        primaryData = threads;
        mainPlatform = 'Threads';
        primaryFollowers = threadsFollowers;
        primaryEngagement = threads.gRateThreadsTabAvgLikes || 0;
      }
      
      if (!primaryData) {
        
        return null;
      }
      
      // 🎯 DETERMINAR MEJOR AVATAR
      let bestAvatar = 'https://ui-avatars.com/api/?name=U&background=6366f1&color=fff&size=128';
      if (instagram?.avatar) bestAvatar = instagram.avatar;
      else if (youtube?.avatar) bestAvatar = youtube.avatar;
      else if (tiktok?.avatar) bestAvatar = tiktok.avatar;
      else if (facebook?.avatar) bestAvatar = facebook.avatar;
      else if (threads?.avatar) bestAvatar = threads.avatar;
      
      // 🎯 CONSTRUIR PLATFORM INFO COMPLETO (formato compatible con frontend)
      const platformInfo: any = {};
      
      if (youtube) {
        platformInfo.youtube = {
          id: youtube.youtubeId,
          ...youtube,
          subscribers: youtubeFollowers,
          engageRate1Y: youtube.engageRate1Y || youtube.engageRate || 0,
          avatar: youtube.avatar || bestAvatar
        };
      }
      
      if (instagram) {
        platformInfo.instagram = {
          id: instagram.instagramId,
          basicInstagram: instagram,
          ...instagram,
          followers: instagramFollowers,
          engageRate: instagram.engageRate || 0,
          avatar: instagram.avatar || bestAvatar
        };
      }
      
      if (tiktok) {
        platformInfo.tiktok = {
          id: tiktok.tiktokId,
          basicTikTok: tiktok,
          ...tiktok,
          followers: tiktokFollowers,
          engageRate: tiktok.engageRate || 0,
          avatar: tiktok.avatar || bestAvatar
        };
      }
      
      if (facebook) {
        platformInfo.facebook = {
          id: facebook.facebookId,
          basicFacebook: facebook,
          ...facebook,
          followers: facebookFollowers,
          engageRate: facebook.engageRate || 0,
          avatar: facebook.avatar || bestAvatar
        };
      }
      
      if (threads) {
        platformInfo.threads = {
          id: threads.threadsId,
          basicThreads: threads,
          ...threads,
          followers: threadsFollowers,
          engageRate: threads.gRateThreadsTabAvgLikes || 0,
          avatar: threads.avatar || bestAvatar
        };
      }
      
      // Debug información
      const availablePlatforms = Object.keys(platformInfo);
     
      // 🎯 DETERMINAR NOMBRE A MOSTRAR
      const rawName = primaryData.instagramName || primaryData.youtubeName || primaryData.tiktokName || primaryData.facebookName || primaryData.threadsName || 'Sin nombre';
      
      // Si el nombre es "Sin nombre" o contiene números, usar el ID
      const displayName = (rawName === 'Sin nombre' || /\d/.test(rawName)) ? id : rawName;

      return {
        creatorId: id,
        name: displayName,
        avatar: bestAvatar,
        image: bestAvatar,
        isVerified: primaryData.isVerified || false,
        contentNiches: primaryData.hashtags || [],
        country: primaryData.country || '-',
        language: primaryData.lang || 'N/A',
        followersCount: totalFollowers > 0 ? totalFollowers : primaryFollowers,
        averageEngagementRate: primaryEngagement,
        mainSocialPlatform: mainPlatform,
        platformInfo,
        // 📊 Información detallada para debugging y UI
        followerBreakdown: {
          total: totalFollowers,
          youtube: youtubeFollowers,
          instagram: instagramFollowers,
          tiktok: tiktokFollowers,
          threads: threadsFollowers,
          facebook: facebookFollowers
        },
        // 🎯 Metadatos adicionales
        searchMeta: {
          sourcePlatform,
          platformsFound: availablePlatforms.length,
          isMultiPlatform: availablePlatforms.length > 1,
          enrichmentSuccess: true
        }
      };
      
    } catch (error) {
      console.error('Error convirtiendo datos enriquecidos:', error);
      return null;
    }
  }

  /**
   * ✅ Validar filtros según documentación de CreatorDB antes de enviar
   */
  private static validateAPIFilters(filters: Record<string, any>, platform: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validaciones comunes para todas las plataformas
    if (filters.minFollowers && filters.maxFollowers && filters.minFollowers >= filters.maxFollowers) {
      errors.push('minFollowers debe ser menor que maxFollowers');
    }
    
    if (filters.minEngagement && filters.maxEngagement && filters.minEngagement >= filters.maxEngagement) {
      errors.push('minEngagement debe ser menor que maxEngagement');
    }
    
    // Validaciones específicas por plataforma según documentación
    switch (platform.toLowerCase()) {
      case 'instagram':
        // Instagram Advanced Search validations
        if (filters.minFollowers && filters.minFollowers < 0) {
          errors.push('Instagram: minFollowers debe ser >= 0');
        }
        if (filters.maxFollowers && filters.maxFollowers > 1000000000) {
          errors.push('Instagram: maxFollowers debe ser <= 1,000,000,000');
        }
        if (filters.minEngagement && (filters.minEngagement < 0 || filters.minEngagement > 100)) {
          errors.push('Instagram: minEngagement debe estar entre 0 y 100');
        }
        if (filters.maxEngagement && (filters.maxEngagement < 0 || filters.maxEngagement > 100)) {
          errors.push('Instagram: maxEngagement debe estar entre 0 y 100');
        }
        break;
        
      case 'youtube':
        // YouTube Advanced Search validations
        if (filters.minFollowers && filters.minFollowers < 0) {
          errors.push('YouTube: minFollowers (subscribers) debe ser >= 0');
        }
        if (filters.maxFollowers && filters.maxFollowers > 1000000000) {
          errors.push('YouTube: maxFollowers (subscribers) debe ser <= 1,000,000,000');
        }
        break;
        
      case 'tiktok':
        // TikTok Advanced Search validations
        if (filters.minFollowers && filters.minFollowers < 0) {
          errors.push('TikTok: minFollowers debe ser >= 0');
        }
        if (filters.maxFollowers && filters.maxFollowers > 1000000000) {
          errors.push('TikTok: maxFollowers debe ser <= 1,000,000,000');
        }
        break;
    }
    
    // Validación de país (ISO 3-letter codes)
    if (filters.country && filters.country.length !== 3) {
      errors.push('country debe ser un código ISO de 3 letras (ej: ARG, USA, ESP)');
    }
    
    // Validación de hashtags
    if (filters.hashtags && typeof filters.hashtags !== 'string') {
      errors.push('hashtags debe ser una cadena de texto');
    }
    
                  // Validación de minGRateFollowers y maxGRateFollowers
              if (filters.minGRateFollowers) {
                const minValue = parseFloat(filters.minGRateFollowers.toString());
                if (isNaN(minValue)) {
                  errors.push('minGRateFollowers debe ser un número válido');
                } else if (minValue < 0) {
                  errors.push('minGRateFollowers debe ser >= 0');
                }
              }
              
              if (filters.maxGRateFollowers) {
                const maxValue = parseFloat(filters.maxGRateFollowers.toString());
                if (isNaN(maxValue)) {
                  errors.push('maxGRateFollowers debe ser un número válido');
                } else if (maxValue < 0) {
                  errors.push('maxGRateFollowers debe ser >= 0');
                }
              }
              
              // Validar que min <= max si ambos están presentes
              if (filters.minGRateFollowers && filters.maxGRateFollowers) {
                const minValue = parseFloat(filters.minGRateFollowers.toString());
                const maxValue = parseFloat(filters.maxGRateFollowers.toString());
                if (minValue > maxValue) {
                  errors.push('minGRateFollowers debe ser <= maxGRateFollowers');
                }
              }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 🎯 PREFETCH OPTIMISTA: Estima el total para habilitar prefetch
   * 
   * Lógica: Si la API devuelve exactamente el size solicitado,
   * probablemente hay más resultados disponibles.
   */
  private static estimateCountForPrefetch(currentCount: number, size: number, page: number): number {
   
    
    // Si obtuvimos exactamente lo que pedimos, probablemente hay más páginas
    if (currentCount === size) {
      // Estimar conservadoramente: al menos una página más
      const estimatedTotal = (page * size) + size;
     
      return estimatedTotal;
    }
    
    // Si obtuvimos menos de lo que pedimos, probablemente es la última página
    const actualTotal = ((page - 1) * size) + currentCount;
   
    return actualTotal;
  }

  /**
   * 🔧 MÉTODO DE FALLBACK: Obtener influencers específicos por IDs cuando smartSearch falla
   * Usado cuando searchSummary tiene resultados pero items está vacío
   */
  static async getInfluencersByIds(platformIds: { platform: string, ids: string[] }[]) {
    
    
    const allResults: any[] = [];
    
    for (const { platform, ids } of platformIds) {
      if (!ids || ids.length === 0) continue;
      
     
      
      // Procesar hasta 5 IDs por plataforma para no sobrecargar
      const limitedIds = ids.slice(0, 5);
      
      if (platform === 'instagram') {
        const results = await this.processInstagramSearchResults(limitedIds);
        allResults.push(...results);
      } else if (platform === 'youtube') {
        const results = await this.processYouTubeSearchResults(limitedIds);
        allResults.push(...results);
      } else if (platform === 'tiktok') {
        const results = await this.processTikTokSearchResults(limitedIds);
        allResults.push(...results);
      }
    }
    
    // Deduplicar y devolver
    const deduplicatedResults = this.deduplicateInfluencers(allResults);
    
   
    
    return {
      items: deduplicatedResults,
      count: deduplicatedResults.length,
      fallbackUsed: true
    };
  }
}

export default CreatorDBService; 
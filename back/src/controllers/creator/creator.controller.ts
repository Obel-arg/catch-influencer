import { Request, Response } from 'express';
import CreatorDBService from '../../services/creator/creator.service';
import ExplorerCacheService from '../../services/creator/explorer-cache.service';

export class CreatorDBController {
  // Método genérico para GET
  static async proxyGet(req: Request, res: Response) {
    try {
      const { endpoint, ...params } = req.query;
      if (!endpoint || typeof endpoint !== 'string') {
        return res.status(400).json({ error: 'Endpoint es requerido' });
      }
      const data = await CreatorDBService.get(endpoint, params);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  // ==============================================
  // 🆕 MÉTODOS GENERALES
  // ==============================================

  // Obtener estado de la API y créditos
  static async getApiStatus(req: Request, res: Response) {
    try {
      const data = await CreatorDBService.getApiStatus();
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error obteniendo estado de API' });
    }
  }

  // Enviar creadores para que sean agregados a la base de datos
  static async submitCreators(req: Request, res: Response) {
    try {
      const { platform, platformUserIds } = req.body;
      if (!platform || !platformUserIds || !Array.isArray(platformUserIds)) {
        return res.status(400).json({ 
          error: 'platform y platformUserIds (array) son requeridos',
          example: { platform: 'youtube', platformUserIds: ['UCX6OQ3DkcsbYNE6H8uQQuVA'] }
        });
      }
      const data = await CreatorDBService.submitCreators(platform, platformUserIds);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error enviando creadores' });
    }
  }

  // Obtener métricas de un post específico por ID
  static async getPostById(req: Request, res: Response) {
    try {
      const { postId, platform } = req.query;
      if (!postId || typeof postId !== 'string' || !platform || typeof platform !== 'string') {
        return res.status(400).json({ error: 'postId y platform son requeridos' });
      }
      const data = await CreatorDBService.getPostById(postId, platform);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error obteniendo post por ID' });
    }
  }

  // Obtener métricas de un post por URL
  static async getPostByLink(req: Request, res: Response) {
    try {
      const { postUrl } = req.query;
      if (!postUrl || typeof postUrl !== 'string') {
        return res.status(400).json({ error: 'postUrl es requerido' });
      }
      const data = await CreatorDBService.getPostByLink(postUrl);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error obteniendo post por URL' });
    }
  }

  // ==============================================
  // YOUTUBE METHODS
  // ==============================================

  static async youtubeBasic(req: Request, res: Response) {
    const { youtubeId } = req.query;
    if (!youtubeId || typeof youtubeId !== 'string') {
      return res.status(400).json({ error: 'youtubeId es requerido' });
    }
    try {
      const data = await CreatorDBService.getYoutubeBasic(youtubeId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  static async youtubeHistorical(req: Request, res: Response) {
    const { youtubeId } = req.query;
    if (!youtubeId || typeof youtubeId !== 'string') {
      return res.status(400).json({ error: 'youtubeId es requerido' });
    }
    try {
      const data = await CreatorDBService.getYoutubeHistory(youtubeId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  static async youtubeRecent(req: Request, res: Response) {
    const { youtubeId } = req.query;
    if (!youtubeId || typeof youtubeId !== 'string') {
      return res.status(400).json({ error: 'youtubeId es requerido' });
    }
    try {
      const data = await CreatorDBService.getYoutubeDetail(youtubeId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  // CORREGIDO: Ahora usa getYoutubeDetail en lugar de getYoutubeTopic inexistente
  static async youtubeTopic(req: Request, res: Response) {
    const { youtubeId } = req.query;
    if (!youtubeId || typeof youtubeId !== 'string') {
      return res.status(400).json({ error: 'youtubeId es requerido' });
    }
    try {
      const data = await CreatorDBService.getYoutubeDetail(youtubeId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  // ==============================================
  // INSTAGRAM METHODS
  // ==============================================

  static async instagramBasic(req: Request, res: Response) {
    const { instagramId } = req.query;
    if (!instagramId || typeof instagramId !== 'string') {
      return res.status(400).json({ error: 'instagramId es requerido' });
    }
    try {
      const data = await CreatorDBService.getInstagramBasic(instagramId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  static async instagramHistorical(req: Request, res: Response) {
    const { instagramId } = req.query;
    if (!instagramId || typeof instagramId !== 'string') {
      return res.status(400).json({ error: 'instagramId es requerido' });
    }
    try {
      const data = await CreatorDBService.getInstagramHistory(instagramId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  static async instagramRecent(req: Request, res: Response) {
    const { instagramId } = req.query;
    if (!instagramId || typeof instagramId !== 'string') {
      return res.status(400).json({ error: 'instagramId es requerido' });
    }
    try {
      const data = await CreatorDBService.getInstagramBasic(instagramId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  // ==============================================
  // TIKTOK METHODS
  // ==============================================

  static async tiktokBasic(req: Request, res: Response) {
    const { tiktokId } = req.query;
    if (!tiktokId || typeof tiktokId !== 'string') {
      return res.status(400).json({ error: 'tiktokId es requerido' });
    }
    try {
      const data = await CreatorDBService.getTikTokBasic(tiktokId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  static async tiktokHistorical(req: Request, res: Response) {
    const { tiktokId } = req.query;
    if (!tiktokId || typeof tiktokId !== 'string') {
      return res.status(400).json({ error: 'tiktokId es requerido' });
    }
    try {
      const data = await CreatorDBService.getTikTokHistory(tiktokId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  static async tiktokRecent(req: Request, res: Response) {
    const { tiktokId } = req.query;
    if (!tiktokId || typeof tiktokId !== 'string') {
      return res.status(400).json({ error: 'tiktokId es requerido' });
    }
    try {
      const data = await CreatorDBService.getTikTokBasic(tiktokId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  // ==============================================
  // THREADS METHODS - NUEVOS
  // ==============================================

  static async threadsBasic(req: Request, res: Response) {
    const { threadsId } = req.query;
    if (!threadsId || typeof threadsId !== 'string') {
      return res.status(400).json({ error: 'threadsId es requerido' });
    }
    try {
      const data = await CreatorDBService.getThreadsBasic(threadsId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  static async threadsHistorical(req: Request, res: Response) {
    const { threadsId } = req.query;
    if (!threadsId || typeof threadsId !== 'string') {
      return res.status(400).json({ error: 'threadsId es requerido' });
    }
    try {
      const data = await CreatorDBService.getThreadsHistory(threadsId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  // ==============================================
  // FACEBOOK METHODS - NUEVOS
  // ==============================================

  static async facebookBasic(req: Request, res: Response) {
    const { facebookId } = req.query;
    if (!facebookId || typeof facebookId !== 'string') {
      return res.status(400).json({ error: 'facebookId es requerido' });
    }
    try {
      const data = await CreatorDBService.getFacebookBasic(facebookId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  static async facebookHistorical(req: Request, res: Response) {
    const { facebookId } = req.query;
    if (!facebookId || typeof facebookId !== 'string') {
      return res.status(400).json({ error: 'facebookId es requerido' });
    }
    try {
      const data = await CreatorDBService.getFacebookHistory(facebookId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  // ==============================================
  // TOPIC & BRAND METHODS
  // ==============================================

  static async getTopicTable(req: Request, res: Response) {
    try {
      const { platform = 'instagram' } = req.query;
      const data = await CreatorDBService.getTopicTable(platform as string);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error obteniendo tabla de topics' });
    }
  }

  static async topicReport(req: Request, res: Response) {
    const { topicId } = req.query;
    if (!topicId || typeof topicId !== 'string') {
      return res.status(400).json({ error: 'topicId es requerido' });
    }
    try {
      const data = await CreatorDBService.getTopicReport(topicId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  static async getBrandTable(req: Request, res: Response) {
    try {
      const data = await CreatorDBService.getBrandTable();
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error obteniendo tabla de marcas' });
    }
  }

  static async brandReport(req: Request, res: Response) {
    const { brandId } = req.query;
    if (!brandId || typeof brandId !== 'string') {
      return res.status(400).json({ error: 'brandId es requerido' });
    }
    try {
      const data = await CreatorDBService.getBrandReport(brandId);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error en CreatorDB' });
    }
  }

  static async getRelatedNiches(req: Request, res: Response) {
    try {
      const { platform, nicheIds } = req.body;
      if (!platform || !nicheIds || !Array.isArray(nicheIds)) {
        return res.status(400).json({ 
          error: 'platform y nicheIds (array) son requeridos',
          example: { platform: 'youtube', nicheIds: ['1', '2', '3'] }
        });
      }
      const data = await CreatorDBService.getRelatedNiches(platform, nicheIds);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error obteniendo nichos relacionados' });
    }
  }

  // ==============================================
  // SEARCH METHODS - NUEVOS
  // ==============================================

  static async searchInstagramInfluencer(req: Request, res: Response) {
    try {
      const { username } = req.query;
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'username es requerido' });
      }
      const data = await CreatorDBService.searchInstagramInfluencer(username);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error buscando influencer de Instagram' });
    }
  }

  static async searchTikTokInfluencer(req: Request, res: Response) {
    try {
      const { username } = req.query;
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'username es requerido' });
      }
      const data = await CreatorDBService.searchTikTokInfluencer(username);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error buscando influencer de TikTok' });
    }
  }

  static async searchYouTubeInfluencer(req: Request, res: Response) {
    try {
      const { username } = req.query;
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'username es requerido' });
      }
      const data = await CreatorDBService.searchYouTubeInfluencer(username);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error buscando influencer de YouTube' });
    }
  }

  // ==============================================
  // EXPLORER METHODS
  // ==============================================

  // Búsqueda avanzada para el explorador con sistema de caché
  static async searchInfluencers(req: Request, res: Response) {
    try {
      // Filtros y paginado
      const { page = 1, size = 5, categories, ...filters } = req.query;
      
      // Procesar el parámetro categories que puede venir como array
      let processedFilters = { ...filters };
      if (categories) {
        // Si categories es un array, mantenerlo como array
        if (Array.isArray(categories)) {
          processedFilters.categories = categories;
        } else {
          // Si es un string, convertirlo a array
          processedFilters.categories = [categories];
        }
      }
      
      // Obtener información del usuario si está autenticado
      const userId = (req as any).user?.id || null;
      const userEmail = (req as any).user?.email || null;
      
      // Usar el nuevo servicio con caché
      const searchResult = await ExplorerCacheService.searchInfluencersWithCache(
        {
          ...processedFilters,
          page: Number(page),
          size: Number(size),
        },
        userId,
        userEmail
      );
      
      return res.json(searchResult);
    } catch (error: any) {
      console.error('Error in searchInfluencers controller:', error);
      return res.status(500).json({ 
        error: error.message || 'Error en búsqueda de influencers',
        cached: false 
      });
    }
  }

  // Analytics del sistema de caché
  static async getCacheAnalytics(req: Request, res: Response) {
    try {
      const { days = 30 } = req.query;
      const analytics = await ExplorerCacheService.getCacheAnalytics(Number(days));
      
      return res.json({
        success: true,
        data: analytics,
        period: `${days} días`
      });
    } catch (error: any) {
      console.error('Error getting cache analytics:', error);
      return res.status(500).json({ 
        error: error.message || 'Error obteniendo analytics del caché' 
      });
    }
  }

  // Búsquedas populares
  static async getPopularSearches(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;
      const popularSearches = await ExplorerCacheService.getPopularSearches(Number(limit));
      
      return res.json({
        success: true,
        data: popularSearches,
        total: popularSearches.length
      });
    } catch (error: any) {
      console.error('Error getting popular searches:', error);
      return res.status(500).json({ 
        error: error.message || 'Error obteniendo búsquedas populares' 
      });
    }
  }

  // NUEVO: Controlador para verificar estado del caché
  static async getCacheCheck(req: Request, res: Response) {
    try {
      // Tomar los filtros de la query
      const filters = { ...req.query };
      // Eliminar page y size si están presentes
      delete filters.page;
      delete filters.size;
      
      // Usar el método público del servicio
      const cacheInfo = await ExplorerCacheService.checkCacheStatus(filters);
      
      if (cacheInfo && cacheInfo.cache_id) {
        return res.json({
          cached: true,
          cacheInfo: {
            cacheId: cacheInfo.cache_id,
            searchHash: cacheInfo.search_hash,
            expiresAt: cacheInfo.expires_at,
            pagesCached: cacheInfo.pages_cached,
            tokensSaved: cacheInfo.tokens_saved
          }
        });
      } else {
        return res.json({ cached: false });
      }
    } catch (error: any) {
      console.error('Error en getCacheCheck:', error);
      return res.status(500).json({ 
        error: 'Error consultando el cache', 
        details: error?.message || 'Error desconocido' 
      });
    }
  }

  // 🔍 BÚSQUEDA INTELIGENTE NUEVA
  static async smartSearch(req: Request, res: Response) {
    const controllerStartTime = Date.now();
    console.log(`🚀 [BACKEND CONTROLLER] Iniciando smartSearch - query: "${req.body.query}"`);
    
    try {
      const { 
        query, 
        platform = 'all'
      } = req.body;

      // Validar parámetros requeridos
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ 
          error: 'Query de búsqueda es requerido',
          example: {
            query: "MrBeast",
            platform: "all"
          }
        });
      }

      // Ejecutar búsqueda inteligente - SOLO QUERY Y PLATFORM
      const serviceStartTime = Date.now();
      console.log(`🚀 [BACKEND CONTROLLER] Llamando CreatorDBService.smartSearch...`);
      const searchResult = await CreatorDBService.smartSearch(
        query.trim(),
        platform
      );
      const serviceEndTime = Date.now();
      console.log(`⏱️ [BACKEND CONTROLLER] CreatorDBService.smartSearch completado en ${serviceEndTime - serviceStartTime}ms`);

      // Obtener información del usuario si está autenticado
      const userId = (req as any).user?.id || null;
      const userEmail = (req as any).user?.email || null;

    
      return res.json({
        success: true,
        ...searchResult,
        // Metadatos adicionales
        metadata: {
          userId,
          userEmail,
          timestamp: new Date().toISOString(),
          searchTips: {
            examples: [
              "MrBeast - buscar por nombre",
              "@kingjames - buscar por username", 
              "#gaming - buscar por hashtag",
              "fitness motivation - buscar por keywords"
            ],
            supportedPlatforms: ["all", "YouTube", "Instagram", "TikTok"]
          }
        }
      });

    } catch (error: any) {
      console.error('❌ [SMART SEARCH] Error en controlador:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message || 'Error en búsqueda inteligente',
        query: req.body.query,
        platform: req.body.platform
      });
    } finally {
      const controllerEndTime = Date.now();
      console.log(`✅ [BACKEND CONTROLLER] smartSearch completado en ${controllerEndTime - controllerStartTime}ms`);
    }
  }

  // 🔧 FALLBACK: Obtener influencers específicos por IDs
  static async getInfluencersByIds(req: Request, res: Response) {
    try {
      const { platformIds } = req.body;

      if (!platformIds || !Array.isArray(platformIds)) {
        return res.status(400).json({ 
          error: 'platformIds es requerido y debe ser un array',
          example: {
            platformIds: [
              { platform: 'instagram', ids: ['id1', 'id2'] },
              { platform: 'tiktok', ids: ['id3', 'id4'] }
            ]
          }
        });
      }

      const result = await CreatorDBService.getInfluencersByIds(platformIds);

      return res.json({
        success: true,
        ...result,
        metadata: {
          timestamp: new Date().toISOString(),
          fallbackUsed: true
        }
      });

    } catch (error: any) {
      console.error('❌ Error en getInfluencersByIds:', error);
      return res.status(500).json({ 
        error: error.message || 'Error interno del servidor',
        fallbackUsed: true
      });
    }
  }

  // ==============================================
  // 🆕 MÉTODOS PARA SUBMIT CREATORS CON HISTORIAL
  // ==============================================

  // Enviar un nuevo creador y guardar en historial
  static async submitCreatorWithHistory(req: Request, res: Response) {
    try {
      const { platform, platformUserId, url } = req.body;
      if (!platform || !platformUserId || !url) {
        return res.status(400).json({ 
          error: 'platform, platformUserId y url son requeridos'
        });
      }
      const data = await CreatorDBService.submitCreatorWithHistory(platform, platformUserId, url, 'temp-user-id');
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error enviando creador' });
    }
  }

  // Obtener historial de pedidos de creadores
  static async getSubmitHistory(req: Request, res: Response) {
    try {
      const data = await CreatorDBService.getSubmitHistory('temp-user-id');
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error obteniendo historial' });
    }
  }

  // Extraer plataforma e ID de una URL
  static async extractPlatformAndId(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL es requerida'
        });
      }

      const result = CreatorDBService.extractPlatformAndId(url);

      if (!result) {
        return res.status(400).json({
          success: false,
          error: 'No se pudo extraer la plataforma e ID de la URL proporcionada'
        });
      }

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error en extractPlatformAndId:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Verificar si un ID existe en CreatorDB
  static async checkIdExists(req: Request, res: Response) {
    try {
      const { platform, platformUserId } = req.body;

      if (!platform || !platformUserId) {
        return res.status(400).json({
          success: false,
          error: 'platform y platformUserId son requeridos'
        });
      }

      const result = await CreatorDBService.checkIdExists(platform, platformUserId);

      return res.status(200).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('Error en checkIdExists:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

export default CreatorDBController; 
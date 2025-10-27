import { httpApiClient } from '@/lib/http';
import { AxiosHeaders } from 'axios';
import { withContext } from '@/lib/http/httpInterceptor';

export class CreatorService {
  private static instance: CreatorService;
  private readonly baseUrl = '/creator';

  private constructor() {}

  public static getInstance(): CreatorService {
    if (!CreatorService.instance) {
      CreatorService.instance = new CreatorService();
    }
    return CreatorService.instance;
  }

  // ==============================================
  // 🆕 MÉTODOS GENERALES
  // ==============================================

  // Obtener estado de la API y créditos
  public async getApiStatus(): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/api-status`, {
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', 'getApiStatus').headers
      }),
    });
    return response.data;
  }

  // Enviar creadores para que sean agregados a la base de datos
  public async submitCreators(platform: string, platformUserIds: string[]): Promise<any> {
    const response = await httpApiClient.post(`${this.baseUrl}/submit-creators`, {
      platform,
      platformUserIds
    }, {
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `submitCreators(${platform}, ${platformUserIds.length} users)`).headers
      }),
    });
    return response.data;
  }

  // ==============================================
  // 🆕 MÉTODOS PARA SUBMIT CREATORS CON HISTORIAL
  // ==============================================

  // Enviar un nuevo creador y guardar en historial
  public async submitCreatorWithHistory(platform: string, platformUserId: string, url: string): Promise<any> {
    const response = await httpApiClient.post(`${this.baseUrl}/submit-creators-with-history`, {
      platform,
      platformUserId,
      url
    }, {
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `submitCreatorWithHistory(${platform}, ${platformUserId})`).headers
      }),
    });
    return response.data;
  }

  // Obtener historial de pedidos de creadores
  public async getSubmitHistory(): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/submit-creators-history`, {
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', 'getSubmitHistory').headers
      }),
    });
    return response.data;
  }

  // Extraer plataforma e ID de una URL
  public extractPlatformAndId(url: string): { platform: string; platformUserId: string } | null {
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
      
      // YouTube
      if (cleanUrl.includes('youtube.com/')) {
        // Extraer ID del canal de URLs como youtube.com/channel/UC...
        const channelMatch = cleanUrl.match(/youtube\.com\/channel\/([^\/\?]+)/);
        if (channelMatch && channelMatch[1]) {
          return {
            platform: 'youtube',
            platformUserId: channelMatch[1]
          };
        }
        
        // Extraer ID del canal de URLs como youtube.com/UC... (sin /channel/)
        const directChannelMatch = cleanUrl.match(/youtube\.com\/(UC[a-zA-Z0-9_-]+)/);
        if (directChannelMatch && directChannelMatch[1]) {
          return {
            platform: 'youtube',
            platformUserId: directChannelMatch[1]
          };
        }
        
        // También soportar URLs con @ (aunque no es el formato principal)
        const handleMatch = cleanUrl.match(/youtube\.com\/@([^\/\?]+)/);
        if (handleMatch && handleMatch[1]) {
          return {
            platform: 'youtube',
            platformUserId: handleMatch[1]
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extrayendo plataforma e ID:', error);
      return null;
    }
  }

  // Verificar si un ID existe en CreatorDB
  public async checkIdExists(platform: string, platformUserId: string): Promise<{ exists: boolean; data?: any; error?: string }> {
    try {
      const response = await httpApiClient.post(`${this.baseUrl}/check-id-exists`, {
        platform,
        platformUserId
      }, {
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
          ...withContext('CreatorService', `checkIdExists(${platform}, ${platformUserId})`).headers
        })
      });

      return response.data;
    } catch (error: any) {
      console.error('Error verificando ID:', error);
      return {
        exists: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Obtener métricas de un post específico por ID
  public async getPostById(postId: string, platform: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/post/by-id`, {
      params: { postId, platform },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getPostById(${postId}, ${platform})`).headers
      }),
    });
    return response.data;
  }

  // Obtener métricas de un post por URL
  public async getPostByLink(postUrl: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/post/by-link`, {
      params: { postUrl },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getPostByLink(${postUrl})`).headers
      }),
    });
    return response.data;
  }

  // ==============================================
  // YOUTUBE METHODS
  // ==============================================

  public async searchYouTube(channelId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/youtube/basic`, {
      params: { youtubeId: channelId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `searchYouTube(${channelId})`).headers
      }),
    });
    return response.data;
  }

  public async getYouTubeHistorical(youtubeId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/youtube/historical`, {
      params: { youtubeId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getYouTubeHistorical(${youtubeId})`).headers
      }),
    });
    return response.data;
  }

  public async getYouTubeRecent(youtubeId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/youtube/recent`, {
      params: { youtubeId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getYouTubeRecent(${youtubeId})`).headers
      }),
    });
    return response.data;
  }

  public async getYouTubeTopic(youtubeId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/youtube/topic`, {
      params: { youtubeId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getYouTubeTopic(${youtubeId})`).headers
      }),
    });
    return response.data;
  }

  // ==============================================
  // INSTAGRAM METHODS
  // ==============================================

  public async searchInstagram(username: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/instagram/basic`, {
      params: { instagramId: username },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `searchInstagram(${username})`).headers
      }),
    });
    return response.data;
  }

  public async getInstagramHistorical(instagramId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/instagram/historical`, {
      params: { instagramId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getInstagramHistorical(${instagramId})`).headers
      }),
    });
    return response.data;
  }

  public async getInstagramRecent(instagramId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/instagram/recent`, {
      params: { instagramId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getInstagramRecent(${instagramId})`).headers
      }),
    });
    return response.data;
  }

  // ==============================================
  // TIKTOK METHODS
  // ==============================================

  public async searchTikTok(tiktokId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/tiktok/basic`, {
      params: { tiktokId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `searchTikTok(${tiktokId})`).headers
      }),
    });
    return response.data;
  }

  public async getTikTokHistorical(tiktokId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/tiktok/historical`, {
      params: { tiktokId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getTikTokHistorical(${tiktokId})`).headers
      }),
    });
    return response.data;
  }

  public async getTikTokRecent(tiktokId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/tiktok/recent`, {
      params: { tiktokId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getTikTokRecent(${tiktokId})`).headers
      }),
    });
    return response.data;
  }

  // ==============================================
  // THREADS METHODS - NUEVOS
  // ==============================================

  public async getThreadsBasic(threadsId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/threads/basic`, {
      params: { threadsId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getThreadsBasic(${threadsId})`).headers
      }),
    });
    return response.data;
  }

  public async getThreadsHistorical(threadsId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/threads/historical`, {
      params: { threadsId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getThreadsHistorical(${threadsId})`).headers
      }),
    });
    return response.data;
  }

  // ==============================================
  // FACEBOOK METHODS - NUEVOS
  // ==============================================

  public async getFacebookBasic(facebookId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/facebook/basic`, {
      params: { facebookId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getFacebookBasic(${facebookId})`).headers
      }),
    });
    return response.data;
  }

  public async getFacebookHistorical(facebookId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/facebook/historical`, {
      params: { facebookId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getFacebookHistorical(${facebookId})`).headers
      }),
    });
    return response.data;
  }

  // ==============================================
  // TOPIC & BRAND METHODS - NUEVOS
  // ==============================================

  public async getTopicTable(platform: string = 'youtube'): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/topic/table`, {
      params: { platform },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getTopicTable(${platform})`).headers
      }),
    });
    return response.data;
  }

  public async getTopicReport(topicId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/topic/report`, {
      params: { topicId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getTopicReport(${topicId})`).headers
      }),
    });
    return response.data;
  }

  public async getBrandTable(): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/brand/table`, {
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', 'getBrandTable').headers
      }),
    });
    return response.data;
  }

  public async getBrandReport(brandId: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/brand/report`, {
      params: { brandId },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getBrandReport(${brandId})`).headers
      }),
    });
    return response.data;
  }

  public async getRelatedNiches(platform: string, nicheIds: string[]): Promise<any> {
    const response = await httpApiClient.post(`${this.baseUrl}/niches/related`, {
      platform,
      nicheIds
    }, {
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getRelatedNiches(${platform}, ${nicheIds.length} niches)`).headers
      }),
    });
    return response.data;
  }

  // ==============================================
  // SEARCH METHODS - NUEVOS
  // ==============================================

  public async searchInstagramInfluencer(username: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/search/instagram`, {
      params: { username },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `searchInstagramInfluencer(${username})`).headers
      }),
    });
    return response.data;
  }

  public async searchTikTokInfluencer(username: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/search/tiktok`, {
      params: { username },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `searchTikTokInfluencer(${username})`).headers
      }),
    });
    return response.data;
  }

  public async searchYouTubeInfluencer(username: string): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/search/youtube`, {
      params: { username },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `searchYouTubeInfluencer(${username})`).headers
      }),
    });
    return response.data;
  }

  // ==============================================
  // EXPLORER METHODS
  // ==============================================

  public async explorerSearch(filters: Record<string, any>): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/explorer/search`, {
      params: filters,
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `explorerSearch(page: ${filters.page || 1})`).headers
      }),
    });
    return response.data;
  }

  // 🔍 BÚSQUEDA INTELIGENTE
  public async smartSearch(searchData: {
    query: string;
    platform?: string;
  }): Promise<any> {
    const smartSearchStartTime = Date.now();
    
    const response = await httpApiClient.post(`${this.baseUrl}/explorer/smart-search`, searchData, {
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `smartSearch("${searchData.query}", ${searchData.platform || 'all'})`).headers
      }),
    });
    
    const smartSearchEndTime = Date.now();
    
    return response.data;
  }

  // 🔧 FALLBACK: Obtener influencers específicos por IDs
  public async getInfluencersByIds(platformIds: { platform: string, ids: string[] }[]): Promise<any> {
    const response = await httpApiClient.post(`${this.baseUrl}/explorer/fallback-search`, {
      platformIds
    }, {
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getInfluencersByIds(${platformIds.length} platforms)`).headers
      }),
    });
    return response.data;
  }

  // Analytics del sistema de caché
  public async getCacheAnalytics(days: number = 30): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/explorer/cache/analytics`, {
      params: { days },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getCacheAnalytics(${days})`).headers
      }),
    });
    return response.data;
  }

  // Búsquedas populares
  public async getPopularSearches(limit: number = 10): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/explorer/cache/popular-searches`, {
      params: { limit },
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', `getPopularSearches(${limit})`).headers
      }),
    });
    return response.data;
  }

  // Estado del caché
  public async getCacheCheck(filters: Record<string, any>): Promise<any> {
    const response = await httpApiClient.get(`${this.baseUrl}/explorer/cache/check`, {
      params: filters,
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
        ...withContext('CreatorService', 'getCacheCheck').headers
      }),
    });
    return response.data;
  }
}

export const creatorService = CreatorService.getInstance(); 
import { PostMetrics, PostMetricsCreateDTO, CreatorDBResponse } from '../../models/post-metrics/optimized-post-metrics.model';
import { PostMetricsRepository } from '../../repositories/post-metrics.repository';
import { CreatorDBService } from '../creator/creator.service';

export class OptimizedPostMetricsService {
  private postMetricsRepository = new PostMetricsRepository();

  /**
   * Extrae métricas usando CreatorDB y las guarda de forma optimizada
   */
  async extractAndSaveMetrics(postId: string, postUrl: string, platform: string): Promise<{
    success: boolean;
    metrics?: PostMetrics;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // 1. Extraer content ID de la URL
      const contentId = this.extractContentIdFromUrl(postUrl, platform);
      if (!contentId) {
        console.error(`❌ [METRICS] Failed to extract content ID from URL: ${postUrl}`);
        return {
          success: false,
          error: `No se pudo extraer el content ID de la URL: ${postUrl}`
        };
      }

      // 2. Para Instagram, intentar extraer username pero no es obligatorio
      let userId: string | undefined;
      if (platform.toLowerCase() === 'instagram') {
        const username = this.extractInstagramUsername(postUrl);
        if (username) {
          userId = username;
        } else {
        }
      }

      // 3. Llamar a CreatorDB
      
      const creatorDbResponse: CreatorDBResponse = await CreatorDBService.getPostByLink(postUrl);
      

      if (!creatorDbResponse.success) {
        const errorMsg = creatorDbResponse.error || 'Error de CreatorDB API';
        
        // Verificar si es un error esperado (post no encontrado)
        if (errorMsg.includes('No user found with post') || errorMsg.includes('not found')) {
        } else {
          console.error(`❌ [METRICS] CreatorDB API error for post ${postId}:`, errorMsg);
        }
        
        return {
          success: false,
          error: errorMsg
        };
      }

      // 3. Convertir respuesta a nuestro formato optimizado
      const metricsData = this.convertToOptimizedFormat(
        postId, 
        contentId, 
        postUrl, 
        platform as 'youtube' | 'instagram' | 'tiktok', 
        creatorDbResponse
      );


      // 4. Guardar en base de datos
      const savedMetrics = await this.postMetricsRepository.createOptimizedPostMetrics(metricsData);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        metrics: savedMetrics
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ [METRICS] Critical error after ${processingTime}ms for post ${postId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private extractInstagramUsername(url: string): string | null {
    try {
      const usernameMatch = url.match(/instagram\.com\/([^\/]+)\/p\//);
      
      if (usernameMatch && usernameMatch[1] !== 'p') {
        const username = usernameMatch[1];
        return username;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ [INSTAGRAM] Error extracting username:`, error);
      return null;
    }
  }

  private extractContentIdFromUrl(url: string, platform: string): string | null {
    const platformLower = platform.toLowerCase();
    
    try {
      let contentId: string | null = null;

      if (platformLower === 'youtube') {
        // Patrones para diferentes formatos de URLs de YouTube incluyendo Shorts
        const patterns = [
          /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
          /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
          /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
          /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
          /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
          /(?:youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            contentId = match[1];
            break;
          }
        }
      }
      
      else if (platformLower === 'instagram') {
        const directMatch = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
        const usernameMatch = url.match(/instagram\.com\/[^\/]+\/p\/([a-zA-Z0-9_-]+)/);
        contentId = directMatch ? directMatch[1] : (usernameMatch ? usernameMatch[1] : null);
      }
      
      else if (platformLower === 'tiktok') {
        const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
        contentId = match ? match[1] : null;
      }

      if (contentId) {
      } else {
        console.warn(`⚠️ [CONTENT-ID] No ID found in URL: ${url} for platform: ${platformLower}`);
      }
      
      return contentId;
    } catch (error) {
      console.error(`❌ [CONTENT-ID] Error extracting ID:`, error);
      return null;
    }
  }

  private convertToOptimizedFormat(
    postId: string,
    contentId: string,
    postUrl: string,
    platform: 'youtube' | 'instagram' | 'tiktok',
    response: CreatorDBResponse
  ): PostMetricsCreateDTO {
    
    const baseData: PostMetricsCreateDTO = {
      post_id: postId,
      platform,
      content_id: contentId,
      post_url: postUrl,
      likes_count: 0,
      comments_count: 0,
      views_count: 0,
      engagement_rate: 0,
      quota_used: response.quotaUsed || 0,
      api_timestamp: response.timestamp,
      api_success: response.success,
      api_error: response.error || undefined,
      raw_response: response
    };

    let convertedData: PostMetricsCreateDTO = baseData;

    // Extraer datos específicos según la plataforma
    if (platform === 'youtube' && response.data?.basicYoutubePost) {
      const ytData = response.data.basicYoutubePost;
      
      convertedData = {
        ...baseData,
        title: ytData.title,
        likes_count: ytData.likes || 0,
        comments_count: ytData.comments || 0,
        views_count: ytData.views || 0,
        engagement_rate: ytData.engageRate || 0,
        platform_data: ytData
      };
    }
    else if (platform === 'instagram' && response.data?.basicInstagramPost) {
      const igData = response.data.basicInstagramPost;
      
      convertedData = {
        ...baseData,
        title: `Instagram Post ${igData.shortcode}`,
        likes_count: igData.likes || 0,
        comments_count: igData.comments || 0,
        views_count: igData.views || 0,
        engagement_rate: 0,
        platform_data: igData
      };
    }
    else if (platform === 'tiktok' && response.data?.basicTikTokPost) {
      const tkData = response.data.basicTikTokPost;
      
      convertedData = {
        ...baseData,
        title: `TikTok Video ${tkData.videoId}`,
        likes_count: tkData.likes || 0,
        comments_count: tkData.comments || 0,
        views_count: tkData.views || 0,
        engagement_rate: 0,
        platform_data: tkData
      };
    }
    else {
      console.warn(`⚠️ [CONVERT] No platform-specific data found in response`);
    }

    

    return convertedData;
  }

  async getPostMetrics(postId: string): Promise<PostMetrics[]> {
    const oldMetrics = await this.postMetricsRepository.getPostMetricsByPostId(postId);
    return [];
  }

  async refreshPostMetrics(postId: string, postUrl: string, platform: string): Promise<PostMetrics> {
    const result = await this.extractAndSaveMetrics(postId, postUrl, platform);
    
    if (!result.success || !result.metrics) {
      console.error(`❌ [REFRESH] Failed to refresh metrics:`, result.error);
      throw new Error(result.error || 'Error al actualizar métricas');
    }
    
    return result.metrics;
  }
} 
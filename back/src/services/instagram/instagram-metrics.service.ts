import axios from 'axios';

export interface InstagramMetrics {
  postId: string;
  postUrl: string;
  caption?: string;
  likes: number;
  comments: number;
  views?: number;
  engagementRate: number;
  uploadDate?: Date;
  imageUrl?: string;
  videoUrl?: string;
  isVideo: boolean;
  location?: string;
  hashtags: string[];
  mentions: string[];
  rawData: any;
}

export class InstagramMetricsService {
  private static instance: InstagramMetricsService;
  private apiToken = process.env.APIFY_API_TOKEN || '';
  private actorId = 'apify~instagram-post-scraper';
  private baseUrl = 'https://api.apify.com/v2';

  private constructor() {}

  public static getInstance(): InstagramMetricsService {
    if (!InstagramMetricsService.instance) {
      InstagramMetricsService.instance = new InstagramMetricsService();
    }
    return InstagramMetricsService.instance;
  }

  /**
   * Obtiene métricas de un post de Instagram usando Apify
   */
  async getPostMetrics(postUrl: string): Promise<{
    success: boolean;
    data?: InstagramMetrics;
    error?: string;
  }> {
    try {
      // Omitir métricas para historias de Instagram por ahora
      if (/instagram\.com\/stories\//i.test(postUrl)) {
        return {
          success: false,
          error: 'Stories de Instagram: métricas deshabilitadas temporalmente'
        };
      }

      // Extraer post ID de la URL
      const postId = this.extractPostIdFromUrl(postUrl);
      if (!postId) {
        return {
          success: false,
          error: 'No se pudo extraer el ID del post de la URL de Instagram'
        };
      }

      // Configurar input para el actor de Apify
      const input = {
        username: [postUrl]
      };

      // Ejecutar el actor de Apify
      const response = await axios.post(
        `${this.baseUrl}/acts/${this.actorId}/run-sync-get-dataset-items`,
        input,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            token: this.apiToken,
            format: 'json',
            clean: true
          },
          timeout: 60000 // 60 segundos timeout
        }
      );

      const results = response.data || [];
      
      if (!results || results.length === 0) {
        return {
          success: false,
          error: 'No se obtuvieron resultados del actor de Instagram'
        };
      }

      // Procesar los resultados
      const processedData = this.processApifyResponse(results, postUrl, postId);

      if (!processedData) {
        return {
          success: false,
          error: 'No se pudieron procesar los datos del post de Instagram'
        };
      }

      return {
        success: true,
        data: processedData
      };

    } catch (error) {
      console.error(`❌ [INSTAGRAM-METRICS] Critical error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Procesa la respuesta de Apify y la convierte al formato del sistema
   */
  private processApifyResponse(apifyData: any, postUrl: string, postId: string): InstagramMetrics | null {
    try {
      // Verificar que hay datos válidos
      if (!apifyData || !Array.isArray(apifyData) || apifyData.length === 0) {
        console.warn(`⚠️ [INSTAGRAM-METRICS] No valid data in Apify response`);
        return null;
      }

      const postData = apifyData[0];
      
      // Extraer métricas básicas
      const likes = postData.likesCount || postData.likes || 0;
      const comments = postData.commentsCount || postData.comments || 0;
      const views = postData.videoViewCount || postData.views || 0;
      
      // Calcular engagement rate (likes + comments) / followers
      // Como no tenemos followers, usamos un cálculo basado en likes
      const engagementRate = likes > 0 ? (likes + comments) / (likes * 10) : 0;
      
      // Extraer hashtags y menciones
      const hashtags = this.extractHashtags(postData.caption || '');
      const mentions = this.extractMentions(postData.caption || '');

      // Determinar si es video
      const isVideo = postData.type === 'video' || postData.isVideo || false;

      // Extraer fecha de subida
      const uploadDate = postData.timestamp ? new Date(postData.timestamp) : undefined;

      const metrics: InstagramMetrics = {
        postId,
        postUrl,
        caption: postData.caption || postData.text || '',
        likes,
        comments,
        views: isVideo ? views : undefined,
        engagementRate: Math.min(engagementRate, 1), // Limitar a 100%
        uploadDate,
        imageUrl: postData.displayUrl || postData.imageUrl || postData.mediaUrl,
        videoUrl: isVideo ? (postData.videoUrl || postData.mediaUrl) : undefined,
        isVideo,
        location: postData.location?.name || postData.location,
        hashtags,
        mentions,
        rawData: postData
      };

      return metrics;

    } catch (error) {
      console.error(`❌ [INSTAGRAM-METRICS] Error processing Apify response:`, error);
      return null;
    }
  }

  /**
   * Extrae el ID del post de una URL de Instagram
   */
  private extractPostIdFromUrl(postUrl: string): string | null {
    try {
      // Patrones comunes de URLs de Instagram
      const patterns = [
        /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/tv\/([A-Za-z0-9_-]+)/
      ];

      for (const pattern of patterns) {
        const match = postUrl.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ [INSTAGRAM-METRICS] Error extracting post ID:`, error);
      return null;
    }
  }

  /**
   * Extrae hashtags de un texto
   */
  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return text.match(hashtagRegex) || [];
  }

  /**
   * Extrae menciones de un texto
   */
  private extractMentions(text: string): string[] {
    const mentionRegex = /@[\w.]+/g;
    return text.match(mentionRegex) || [];
  }

  /**
   * Convierte los datos de Instagram al formato del sistema
   */
  convertToSystemFormat(postId: string, postUrl: string, instagramData: InstagramMetrics): any {
    return {
      post_id: postId,
      platform: 'instagram',
      content_id: postId,
      post_url: postUrl,
      title: instagramData.caption || '',
      likes_count: instagramData.likes,
      comments_count: instagramData.comments,
      views_count: instagramData.views || 0,
      engagement_rate: instagramData.engagementRate,
      platform_data: {
        isVideo: instagramData.isVideo,
        uploadDate: instagramData.uploadDate,
        location: instagramData.location,
        hashtags: instagramData.hashtags,
        mentions: instagramData.mentions,
        imageUrl: instagramData.imageUrl,
        videoUrl: instagramData.videoUrl
      },
      quota_used: 1,
      api_timestamp: Date.now(),
      api_success: true,
      raw_response: {
        data: {
          basicInstagramPost: {
            id: postId,
            url: postUrl,
            caption: instagramData.caption,
            likes: instagramData.likes,
            comments: instagramData.comments,
            views: instagramData.views || 0,
            engageRate: instagramData.engagementRate,
            uploadDate: instagramData.uploadDate,
            isVideo: instagramData.isVideo,
            location: instagramData.location,
            hashtags: instagramData.hashtags,
            mentions: instagramData.mentions,
            imageUrl: instagramData.imageUrl,
            videoUrl: instagramData.videoUrl,
            rawData: instagramData.rawData
          }
        }
      }
    };
  }

  /**
   * Obtiene información del servicio
   */
  getServiceInfo(): {
    provider: string;
    actorId: string;
    capabilities: string[];
  } {
    return {
      provider: 'Apify',
      actorId: this.actorId,
      capabilities: [
        'Extract Instagram post metrics',
        'Extract post captions',
        'Extract engagement data',
        'Extract hashtags and mentions',
        'Extract media information',
        'Extract location data'
      ]
    };
  }
} 
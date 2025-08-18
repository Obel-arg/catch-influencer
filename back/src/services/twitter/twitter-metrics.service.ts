import axios from 'axios';

export interface TwitterMetrics {
  tweetId: string;
  tweetText: string;
  author: string;
  username: string;
  verified: boolean;
  likes: number;
  retweets: number;
  replies: number;
  quotes?: number;
  views?: number;
  engagementRate: number;
  publishedAt: string;
  hashtags: string[];
  mentions: string[];
  urls: string[];
  mediaCount: number;
  isRetweet: boolean;
  isReply: boolean;
  isQuote: boolean;
  followers?: number;
  following?: number;
  postsCount?: number;
  verificationType?: string;
}

export interface TwitterMetricsResult {
  success: boolean;
  data?: TwitterMetrics;
  error?: string;
}

export class TwitterMetricsService {
  private static instance: TwitterMetricsService;
  private apiToken = 'apify_api_2kNmLwhgbS02MR2Xmh1zL6PmQ8wetW1aC5PN';
  private actorId = 'pratikdani~twitter-posts-scraper';
  private baseUrl = 'https://api.apify.com/v2';

  private constructor() {}

  public static getInstance(): TwitterMetricsService {
    if (!TwitterMetricsService.instance) {
      TwitterMetricsService.instance = new TwitterMetricsService();
    }
    return TwitterMetricsService.instance;
  }

  /**
   * Extrae el ID del tweet de una URL de Twitter/X
   */
  private extractTwitterTweetId(url: string): string | null {
    const patterns = [
      /twitter\.com\/[^\/]+\/status\/(\d+)/,
      /x\.com\/[^\/]+\/status\/(\d+)/,
      /mobile\.twitter\.com\/[^\/]+\/status\/(\d+)/,
      /twitter\.com\/i\/web\/status\/(\d+)/,
      /x\.com\/i\/web\/status\/(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Valida si una URL es de Twitter/X
   */
  public isValidTwitterUrl(url: string): boolean {
    return this.extractTwitterTweetId(url) !== null;
  }

  /**
   * Obtiene métricas de un tweet usando el actor de Apify
   */
  public async getTweetMetrics(twitterUrl: string): Promise<TwitterMetricsResult> {
    try {
      
      // Validar URL y extraer ID
      const tweetId = this.extractTwitterTweetId(twitterUrl);
      if (!tweetId) {
        throw new Error('URL de Twitter/X inválida. Debe contener un ID de tweet válido.');
      }

      // Configurar input para el nuevo actor
      const input = {
        url: twitterUrl
      };

      // Llamar al actor de forma síncrona para obtener los datos directamente
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
          timeout: 120000 // 2 minutos de timeout
        }
      );

      const results = response.data || [];
      
      if (!results || results.length === 0) {
        throw new Error('No se obtuvieron resultados del actor de Twitter');
      }

      // Procesar el primer resultado (debería ser el tweet principal)
      const tweetData = results[0];
      const metrics = this.processTweetData(tweetData, twitterUrl);

      
      return {
        success: true,
        data: metrics
      };

    } catch (error: any) {
      console.error('❌ [TWITTER-METRICS] Error getting tweet metrics:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Error desconocido al obtener métricas de Twitter'
      };
    }
  }

  /**
   * Procesa los datos raw del actor a nuestro formato
   */
  private processTweetData(tweetData: any, originalUrl: string): TwitterMetrics {
    const tweetId = this.extractTwitterTweetId(originalUrl) || tweetData.id;
    
    // Extraer hashtags
    const hashtags = this.extractHashtags(tweetData);
    
    // Extraer menciones
    const mentions = this.extractMentions(tweetData);
    
    // Extraer URLs
    const urls = this.extractUrls(tweetData);
    
    // Contar media
    const mediaCount = this.countMedia(tweetData);
    
    // Calcular engagement rate
    const engagementRate = this.calculateEngagementRate(tweetData);
    
    // Determinar tipo de tweet
    const isRetweet = tweetData.parent_post_details?.post_id ? true : false;
    const isReply = tweetData.parent_post_details?.post_id ? true : false;
    const isQuote = tweetData.quoted_post?.post_id ? true : false;

    return {
      tweetId: tweetId,
      tweetText: tweetData.description || 'Tweet de Twitter/X',
      author: tweetData.name || 'Usuario de Twitter',
      username: tweetData.user_posted || 'usuario',
      verified: tweetData.is_verified || false,
      likes: tweetData.likes || 0,
      retweets: tweetData.reposts || 0,
      replies: tweetData.replies || 0,
      quotes: tweetData.quotes || 0,
      views: tweetData.views || 0,
      engagementRate: Math.min(engagementRate, 100), // Cap at 100%
      publishedAt: tweetData.date_posted || new Date().toISOString(),
      hashtags,
      mentions,
      urls,
      mediaCount,
      isRetweet,
      isReply,
      isQuote,
      followers: tweetData.followers || 0,
      following: tweetData.following || 0,
      postsCount: tweetData.posts_count || 0,
      verificationType: tweetData.verification_type || null
    };
  }

  /**
   * Extrae hashtags del tweet
   */
  private extractHashtags(tweetData: any): string[] {
    const hashtags: string[] = [];
    
    // Buscar hashtags en diferentes ubicaciones
    if (tweetData.hashtags && Array.isArray(tweetData.hashtags)) {
      hashtags.push(...tweetData.hashtags.map((tag: any) => 
        typeof tag === 'string' ? `#${tag}` : `#${tag.text || tag.name || tag}`
      ));
    }
    
    if (tweetData.entities?.hashtags && Array.isArray(tweetData.entities.hashtags)) {
      hashtags.push(...tweetData.entities.hashtags.map((tag: any) => 
        typeof tag === 'string' ? `#${tag}` : `#${tag.text || tag.name || tag}`
      ));
    }
    
    // Extraer hashtags del texto si no se encontraron en los campos específicos
    if (hashtags.length === 0 && tweetData.description) {
      const hashtagRegex = /#\w+/g;
      const matches = tweetData.description.match(hashtagRegex);
      if (matches) {
        hashtags.push(...matches);
      }
    }
    
    return [...new Set(hashtags)]; // Remover duplicados
  }

  /**
   * Extrae menciones del tweet
   */
  private extractMentions(tweetData: any): string[] {
    const mentions: string[] = [];
    
    if (tweetData.tagged_users && Array.isArray(tweetData.tagged_users)) {
      mentions.push(...tweetData.tagged_users.map((mention: any) => 
        typeof mention === 'string' ? mention : mention.screen_name || mention.username || mention
      ));
    }
    
    if (tweetData.entities?.user_mentions && Array.isArray(tweetData.entities.user_mentions)) {
      mentions.push(...tweetData.entities.user_mentions.map((mention: any) => 
        mention.screen_name || mention.username || mention
      ));
    }
    
    // Extraer menciones del texto si no se encontraron en los campos específicos
    if (mentions.length === 0 && tweetData.description) {
      const mentionRegex = /@\w+/g;
      const matches = tweetData.description.match(mentionRegex);
      if (matches) {
        mentions.push(...matches);
      }
    }
    
    return [...new Set(mentions)]; // Remover duplicados
  }

  /**
   * Extrae URLs del tweet
   */
  private extractUrls(tweetData: any): string[] {
    const urls: string[] = [];
    
    if (tweetData.external_url) {
      urls.push(tweetData.external_url);
    }
    
    if (tweetData.urls && Array.isArray(tweetData.urls)) {
      urls.push(...tweetData.urls.map((url: any) => 
        typeof url === 'string' ? url : url.expanded_url || url.url || url
      ));
    }
    
    if (tweetData.entities?.urls && Array.isArray(tweetData.entities.urls)) {
      urls.push(...tweetData.entities.urls.map((url: any) => 
        url.expanded_url || url.url || url
      ));
    }
    
    return [...new Set(urls)]; // Remover duplicados
  }

  /**
   * Cuenta el número de elementos multimedia
   */
  private countMedia(tweetData: any): number {
    let count = 0;
    
    if (tweetData.photos && Array.isArray(tweetData.photos)) {
      count += tweetData.photos.length;
    }
    
    if (tweetData.videos && Array.isArray(tweetData.videos)) {
      count += tweetData.videos.length;
    }
    
    if (tweetData.external_image_urls && Array.isArray(tweetData.external_image_urls)) {
      count += tweetData.external_image_urls.length;
    }
    
    if (tweetData.external_video_urls && Array.isArray(tweetData.external_video_urls)) {
      count += tweetData.external_video_urls.length;
    }
    
    if (tweetData.entities?.media && Array.isArray(tweetData.entities.media)) {
      count += tweetData.entities.media.length;
    }
    
    return count;
  }

  /**
   * Calcula la tasa de engagement
   */
  private calculateEngagementRate(tweetData: any): number {
    const likes = tweetData.likes || 0;
    const retweets = tweetData.reposts || 0;
    const replies = tweetData.replies || 0;
    const views = tweetData.views || 0;
    
    const totalEngagement = likes + retweets + replies;
    
    if (views > 0) {
      return Math.min((totalEngagement / views), 100);
    } else if (totalEngagement > 0) {
      // Si no hay views, usar un cálculo basado en engagement absoluto
      return Math.min(totalEngagement, 100);
    }
    
    return 0;
  }

  /**
   * Convierte los datos de Twitter al formato del sistema
   */
  public convertToSystemFormat(postId: string, postUrl: string, twitterData: TwitterMetrics): any {
    return {
      post_id: postId,
      platform: 'twitter',
      content_id: twitterData.tweetId,
      post_url: postUrl,
      title: twitterData.tweetText.substring(0, 255), // Limitar a 255 caracteres
      likes_count: twitterData.likes,
      comments_count: twitterData.replies,
      views_count: twitterData.views || 0,
      engagement_rate: twitterData.engagementRate,
      platform_data: {
        tweetId: twitterData.tweetId,
        author: twitterData.author,
        username: twitterData.username,
        verified: twitterData.verified,
        retweets: twitterData.retweets,
        quotes: twitterData.quotes || 0,
        hashtags: twitterData.hashtags,
        mentions: twitterData.mentions,
        urls: twitterData.urls,
        mediaCount: twitterData.mediaCount,
        isRetweet: twitterData.isRetweet,
        isReply: twitterData.isReply,
        isQuote: twitterData.isQuote,
        publishedAt: twitterData.publishedAt,
        followers: twitterData.followers || 0,
        following: twitterData.following || 0,
        postsCount: twitterData.postsCount || 0,
        verificationType: twitterData.verificationType || null
      },
      quota_used: 1,
      api_timestamp: Date.now(),
      api_success: true,
      api_error: null,
      raw_response: {
        data: {
          basicTwitterPost: {
            tweetId: twitterData.tweetId,
            title: twitterData.tweetText,
            author: twitterData.author,
            username: twitterData.username,
            verified: twitterData.verified,
            likes: twitterData.likes,
            retweets: twitterData.retweets,
            replies: twitterData.replies,
            quotes: twitterData.quotes || 0,
            views: twitterData.views || 0,
            engageRate: twitterData.engagementRate,
            hashtags: twitterData.hashtags,
            mentions: twitterData.mentions,
            urls: twitterData.urls,
            mediaCount: twitterData.mediaCount,
            isRetweet: twitterData.isRetweet,
            isReply: twitterData.isReply,
            isQuote: twitterData.isQuote,
            publishedAt: twitterData.publishedAt,
            followers: twitterData.followers || 0,
            following: twitterData.following || 0,
            postsCount: twitterData.postsCount || 0,
            verificationType: twitterData.verificationType || null
          }
        },
        error: "",
        success: true,
        quotaUsed: 1,
        timestamp: Date.now(),
        quotaUsedTotal: 1,
        remainingPlanCredit: 9999,
        remainingPrepurchasedCredit: 0
      }
    };
  }

  /**
   * Obtiene información del servicio
   */
  public getServiceInfo(): {
    provider: string;
    actorId: string;
    capabilities: string[];
  } {
    return {
      provider: 'Apify',
      actorId: this.actorId,
      capabilities: [
        'Extracción de métricas de tweets',
        'Información completa del tweet',
        'Datos de engagement (likes, retweets, replies, views)',
        'Información del usuario (verificado, followers)',
        'Hashtags, menciones y URLs',
        'Conteo de media (imágenes, videos, GIFs)',
        'Detección de tipos de tweet (retweet, reply, quote)',
        'Cálculo de tasa de engagement'
      ]
    };
  }
}

export const twitterMetricsService = TwitterMetricsService.getInstance(); 
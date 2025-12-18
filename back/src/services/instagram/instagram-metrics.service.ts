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
    const methodStartTime = Date.now();
    console.log(`\n${'*'.repeat(70)}`);
    console.log(`📸 [INSTAGRAM-METRICS] ========== getPostMetrics CALLED ==========`);
    console.log(`📸 [INSTAGRAM-METRICS] Post URL: ${postUrl}`);
    console.log(`📸 [INSTAGRAM-METRICS] Timestamp: ${new Date().toISOString()}`);
    console.log(`📸 [INSTAGRAM-METRICS] API Token configured: ${this.apiToken ? 'YES (length: ' + this.apiToken.length + ')' : 'NO - MISSING!'}`);
    console.log(`📸 [INSTAGRAM-METRICS] Actor ID: ${this.actorId}`);
    console.log(`📸 [INSTAGRAM-METRICS] Base URL: ${this.baseUrl}`);

    try {
      // Omitir métricas para historias de Instagram por ahora
      console.log(`📸 [INSTAGRAM-METRICS] Checking if URL is a story...`);
      if (/instagram\.com\/stories\//i.test(postUrl)) {
        console.log(`⚠️ [INSTAGRAM-METRICS] URL is a story - skipping metrics extraction`);
        return {
          success: false,
          error: 'Stories de Instagram: métricas deshabilitadas temporalmente'
        };
      }
      console.log(`📸 [INSTAGRAM-METRICS] URL is NOT a story - proceeding`);

      // Extraer post ID de la URL
      console.log(`📸 [INSTAGRAM-METRICS] Extracting post ID from URL...`);
      const postId = this.extractPostIdFromUrl(postUrl);
      console.log(`📸 [INSTAGRAM-METRICS] Extracted post ID: ${postId}`);

      if (!postId) {
        console.error(`❌ [INSTAGRAM-METRICS] Failed to extract post ID from URL: ${postUrl}`);
        return {
          success: false,
          error: 'No se pudo extraer el ID del post de la URL de Instagram'
        };
      }

      // Configurar input para el actor de Apify
      const input = {
        username: [postUrl]
      };
      console.log(`📸 [INSTAGRAM-METRICS] Apify input configured:`, JSON.stringify(input, null, 2));

      // Ejecutar el actor de Apify
      const apifyUrl = `${this.baseUrl}/acts/${this.actorId}/run-sync-get-dataset-items`;
      console.log(`\n🌐 [INSTAGRAM-METRICS] -------- CALLING APIFY API --------`);
      console.log(`🌐 [INSTAGRAM-METRICS] Full URL: ${apifyUrl}`);
      console.log(`🌐 [INSTAGRAM-METRICS] Method: POST`);
      console.log(`🌐 [INSTAGRAM-METRICS] Headers: Authorization=Bearer ${this.apiToken?.substring(0, 10)}...`);
      console.log(`🌐 [INSTAGRAM-METRICS] Timeout: 60000ms`);
      console.log(`🌐 [INSTAGRAM-METRICS] Request start time: ${new Date().toISOString()}`);

      const apiStartTime = Date.now();
      const response = await axios.post(
        apifyUrl,
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
      const apiDuration = Date.now() - apiStartTime;

      console.log(`\n🌐 [INSTAGRAM-METRICS] -------- APIFY API RESPONSE --------`);
      console.log(`🌐 [INSTAGRAM-METRICS] Response status: ${response.status}`);
      console.log(`🌐 [INSTAGRAM-METRICS] Response statusText: ${response.statusText}`);
      console.log(`🌐 [INSTAGRAM-METRICS] API call duration: ${apiDuration}ms`);
      console.log(`🌐 [INSTAGRAM-METRICS] Response headers:`, JSON.stringify(response.headers, null, 2));
      console.log(`🌐 [INSTAGRAM-METRICS] Response data type: ${typeof response.data}`);
      console.log(`🌐 [INSTAGRAM-METRICS] Response data is array: ${Array.isArray(response.data)}`);
      console.log(`🌐 [INSTAGRAM-METRICS] Response data length: ${response.data?.length || 0}`);
      console.log(`🌐 [INSTAGRAM-METRICS] Raw response data:`, JSON.stringify(response.data, null, 2));

      const results = response.data || [];

      if (!results || results.length === 0) {
        console.error(`❌ [INSTAGRAM-METRICS] No results returned from Apify!`);
        console.error(`❌ [INSTAGRAM-METRICS] Response was: ${JSON.stringify(response.data)}`);
        return {
          success: false,
          error: 'No se obtuvieron resultados del actor de Instagram'
        };
      }

      console.log(`✅ [INSTAGRAM-METRICS] Got ${results.length} result(s) from Apify`);

      // Procesar los resultados
      console.log(`\n🔄 [INSTAGRAM-METRICS] -------- PROCESSING APIFY RESPONSE --------`);
      const processedData = this.processApifyResponse(results, postUrl, postId);

      if (!processedData) {
        console.error(`❌ [INSTAGRAM-METRICS] Failed to process Apify response`);
        return {
          success: false,
          error: 'No se pudieron procesar los datos del post de Instagram'
        };
      }

      const totalDuration = Date.now() - methodStartTime;
      console.log(`\n✅ [INSTAGRAM-METRICS] ========== getPostMetrics COMPLETED ==========`);
      console.log(`✅ [INSTAGRAM-METRICS] Total duration: ${totalDuration}ms`);
      console.log(`✅ [INSTAGRAM-METRICS] API call duration: ${apiDuration}ms`);
      console.log(`✅ [INSTAGRAM-METRICS] Processing duration: ${totalDuration - apiDuration}ms`);
      console.log(`✅ [INSTAGRAM-METRICS] Final processed data:`, JSON.stringify(processedData, null, 2));
      console.log(`${'*'.repeat(70)}\n`);

      return {
        success: true,
        data: processedData
      };

    } catch (error) {
      const errorDuration = Date.now() - methodStartTime;
      console.error(`\n❌ [INSTAGRAM-METRICS] ========== CRITICAL ERROR ==========`);
      console.error(`❌ [INSTAGRAM-METRICS] Post URL: ${postUrl}`);
      console.error(`❌ [INSTAGRAM-METRICS] Duration until error: ${errorDuration}ms`);
      console.error(`❌ [INSTAGRAM-METRICS] Error type: ${error?.constructor?.name || 'Unknown'}`);
      console.error(`❌ [INSTAGRAM-METRICS] Error message: ${error instanceof Error ? error.message : 'Error desconocido'}`);

      if (axios.isAxiosError(error)) {
        console.error(`❌ [INSTAGRAM-METRICS] Axios error details:`);
        console.error(`❌ [INSTAGRAM-METRICS]   - Status: ${error.response?.status}`);
        console.error(`❌ [INSTAGRAM-METRICS]   - StatusText: ${error.response?.statusText}`);
        console.error(`❌ [INSTAGRAM-METRICS]   - Response data: ${JSON.stringify(error.response?.data)}`);
        console.error(`❌ [INSTAGRAM-METRICS]   - Request URL: ${error.config?.url}`);
        console.error(`❌ [INSTAGRAM-METRICS]   - Request method: ${error.config?.method}`);
        console.error(`❌ [INSTAGRAM-METRICS]   - Timeout: ${error.code === 'ECONNABORTED' ? 'YES' : 'NO'}`);
      }

      console.error(`❌ [INSTAGRAM-METRICS] Error stack:`, error instanceof Error ? error.stack : 'N/A');
      console.error(`${'*'.repeat(70)}\n`);

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
    console.log(`🔄 [INSTAGRAM-METRICS] processApifyResponse called`);
    console.log(`🔄 [INSTAGRAM-METRICS] Post URL: ${postUrl}`);
    console.log(`🔄 [INSTAGRAM-METRICS] Post ID: ${postId}`);
    console.log(`🔄 [INSTAGRAM-METRICS] Apify data type: ${typeof apifyData}`);
    console.log(`🔄 [INSTAGRAM-METRICS] Apify data is array: ${Array.isArray(apifyData)}`);
    console.log(`🔄 [INSTAGRAM-METRICS] Apify data length: ${apifyData?.length || 0}`);

    try {
      // Verificar que hay datos válidos
      if (!apifyData || !Array.isArray(apifyData) || apifyData.length === 0) {
        console.warn(`⚠️ [INSTAGRAM-METRICS] No valid data in Apify response`);
        console.warn(`⚠️ [INSTAGRAM-METRICS] apifyData: ${JSON.stringify(apifyData)}`);
        return null;
      }

      const postData = apifyData[0];
      console.log(`🔄 [INSTAGRAM-METRICS] First item from Apify response:`, JSON.stringify(postData, null, 2));
      console.log(`🔄 [INSTAGRAM-METRICS] Available keys in postData: ${Object.keys(postData || {}).join(', ')}`);

      // Extraer métricas básicas
      console.log(`\n📊 [INSTAGRAM-METRICS] -------- EXTRACTING METRICS --------`);
      console.log(`📊 [INSTAGRAM-METRICS] postData.likesCount: ${postData.likesCount}`);
      console.log(`📊 [INSTAGRAM-METRICS] postData.likes: ${postData.likes}`);
      console.log(`📊 [INSTAGRAM-METRICS] postData.commentsCount: ${postData.commentsCount}`);
      console.log(`📊 [INSTAGRAM-METRICS] postData.comments: ${postData.comments}`);
      console.log(`📊 [INSTAGRAM-METRICS] postData.videoViewCount: ${postData.videoViewCount}`);
      console.log(`📊 [INSTAGRAM-METRICS] postData.views: ${postData.views}`);

      const likes = postData.likesCount || postData.likes || 0;
      const comments = postData.commentsCount || postData.comments || 0;
      const views = postData.videoViewCount || postData.views || 0;

      console.log(`📊 [INSTAGRAM-METRICS] Final likes: ${likes}`);
      console.log(`📊 [INSTAGRAM-METRICS] Final comments: ${comments}`);
      console.log(`📊 [INSTAGRAM-METRICS] Final views: ${views}`);

      // Calcular engagement rate (likes + comments) / followers
      // Como no tenemos followers, usamos un cálculo basado en likes
      const engagementRate = likes > 0 ? (likes + comments) / (likes * 10) : 0;
      console.log(`📊 [INSTAGRAM-METRICS] Calculated engagement rate: ${engagementRate}`);

      // Extraer hashtags y menciones
      const caption = postData.caption || '';
      console.log(`📊 [INSTAGRAM-METRICS] Caption (first 200 chars): ${caption.substring(0, 200)}...`);

      const hashtags = this.extractHashtags(caption);
      const mentions = this.extractMentions(caption);
      console.log(`📊 [INSTAGRAM-METRICS] Extracted hashtags: ${hashtags.join(', ')}`);
      console.log(`📊 [INSTAGRAM-METRICS] Extracted mentions: ${mentions.join(', ')}`);

      // Determinar si es video
      console.log(`📊 [INSTAGRAM-METRICS] postData.type: ${postData.type}`);
      console.log(`📊 [INSTAGRAM-METRICS] postData.isVideo: ${postData.isVideo}`);
      const isVideo = postData.type === 'video' || postData.isVideo || false;
      console.log(`📊 [INSTAGRAM-METRICS] Is video: ${isVideo}`);

      // Extraer fecha de subida
      console.log(`📊 [INSTAGRAM-METRICS] postData.timestamp: ${postData.timestamp}`);
      const uploadDate = postData.timestamp ? new Date(postData.timestamp) : undefined;
      console.log(`📊 [INSTAGRAM-METRICS] Upload date: ${uploadDate}`);

      // Extraer URLs de medios
      console.log(`📊 [INSTAGRAM-METRICS] postData.displayUrl: ${postData.displayUrl}`);
      console.log(`📊 [INSTAGRAM-METRICS] postData.imageUrl: ${postData.imageUrl}`);
      console.log(`📊 [INSTAGRAM-METRICS] postData.mediaUrl: ${postData.mediaUrl}`);
      console.log(`📊 [INSTAGRAM-METRICS] postData.videoUrl: ${postData.videoUrl}`);

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

      console.log(`\n✅ [INSTAGRAM-METRICS] -------- METRICS OBJECT CREATED --------`);
      console.log(`✅ [INSTAGRAM-METRICS] metrics.postId: ${metrics.postId}`);
      console.log(`✅ [INSTAGRAM-METRICS] metrics.likes: ${metrics.likes}`);
      console.log(`✅ [INSTAGRAM-METRICS] metrics.comments: ${metrics.comments}`);
      console.log(`✅ [INSTAGRAM-METRICS] metrics.views: ${metrics.views}`);
      console.log(`✅ [INSTAGRAM-METRICS] metrics.engagementRate: ${metrics.engagementRate}`);
      console.log(`✅ [INSTAGRAM-METRICS] metrics.isVideo: ${metrics.isVideo}`);
      console.log(`✅ [INSTAGRAM-METRICS] metrics.imageUrl: ${metrics.imageUrl}`);

      return metrics;

    } catch (error) {
      console.error(`❌ [INSTAGRAM-METRICS] Error processing Apify response:`);
      console.error(`❌ [INSTAGRAM-METRICS] Error type: ${error?.constructor?.name}`);
      console.error(`❌ [INSTAGRAM-METRICS] Error message: ${error instanceof Error ? error.message : 'Unknown'}`);
      console.error(`❌ [INSTAGRAM-METRICS] Error stack:`, error instanceof Error ? error.stack : 'N/A');
      console.error(`❌ [INSTAGRAM-METRICS] Apify data was:`, JSON.stringify(apifyData, null, 2));
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
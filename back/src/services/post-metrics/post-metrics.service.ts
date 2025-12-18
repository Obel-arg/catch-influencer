import { PostMetricsRepository } from '../../repositories/post-metrics.repository';
import { CreatorDBService } from '../creator/creator.service';
import { YouTubeMetricsService } from '../youtube/youtube-metrics.service';
import { TikTokMetricsService } from '../tiktok/tiktok-metrics.service';
import { TwitterMetricsService } from '../twitter/twitter-metrics.service';
import { InstagramMetricsService } from '../instagram/instagram-metrics.service';
import { postgresCacheService } from '../cache/postgres-cache.service';

// Interface que coincide exactamente con la tabla del usuario
interface UserPostMetrics {
  id?: string;
  post_id: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  content_id: string;
  post_url: string;
  title?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  engagement_rate: number;
  platform_data?: any;
  quota_used: number;
  api_timestamp?: number;
  api_success: boolean;
  api_error?: string;
  raw_response?: any;
  created_at?: Date;
  updated_at?: Date;
}

export class PostMetricsService {
  private postMetricsRepository = new PostMetricsRepository();
  private youtubeMetricsService = YouTubeMetricsService.getInstance();
  private tiktokMetricsService = TikTokMetricsService.getInstance();
  private twitterMetricsService = TwitterMetricsService.getInstance();
  private instagramMetricsService = InstagramMetricsService.getInstance();

  // Control de concurrencia para evitar procesamiento duplicado
  private static processingPosts = new Set<string>();
  private static processingLock = new Map<string, Promise<any>>();

  /**
   * Verifica si un post ya está siendo procesado
   */
  private isPostBeingProcessed(postId: string): boolean {
    return PostMetricsService.processingPosts.has(postId);
  }

  /**
   * Marca un post como en procesamiento
   */
  private markPostAsProcessing(postId: string): void {
    PostMetricsService.processingPosts.add(postId);
  }

  /**
   * Marca un post como procesado
   */
  private markPostAsProcessed(postId: string): void {
    PostMetricsService.processingPosts.delete(postId);
  }

  /**
   * Obtiene o crea un lock para un post específico
   */
  private async getProcessingLock(
    postId: string,
    processor: () => Promise<any>,
  ): Promise<any> {
    // Si ya hay un lock para este post, esperar a que termine
    if (PostMetricsService.processingLock.has(postId)) {
      return await PostMetricsService.processingLock.get(postId);
    }

    // Crear nuevo lock
    const lockPromise = processor().finally(() => {
      PostMetricsService.processingLock.delete(postId);
    });

    PostMetricsService.processingLock.set(postId, lockPromise);
    return lockPromise;
  }

  /**
   * Utilidad para reintentos automáticos optimizada para velocidad
   */
  private async withRetries<T>(
    fn: () => Promise<T>,
    retries = 2,
    delayMs = 500,
  ): Promise<T> {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (i < retries - 1) {
          await new Promise((res) => setTimeout(res, delayMs * (i + 1)));
        }
      }
    }
    throw lastError;
  }

  /**
   * Utilidad para esperar un tiempo específico
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Extrae métricas de un post usando YouTube API para YouTube y CreatorDB para otras plataformas
   */
  async extractAndSaveMetrics(
    postId: string,
    postUrl: string,
    platform: string,
  ): Promise<{
    success: boolean;
    metrics?: UserPostMetrics;
    error?: string;
  }> {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(
      `📥 [POST-METRICS] ======= extractAndSaveMetrics CALLED =======`,
    );
    console.log(`📥 [POST-METRICS] Post ID: ${postId}`);
    console.log(`📥 [POST-METRICS] Post URL: ${postUrl}`);
    console.log(`📥 [POST-METRICS] Platform: ${platform}`);
    console.log(`📥 [POST-METRICS] Timestamp: ${new Date().toISOString()}`);

    // Usar control de concurrencia para evitar procesamiento duplicado
    console.log(
      `🔒 [POST-METRICS] Acquiring processing lock for post ${postId}...`,
    );
    return this.getProcessingLock(postId, async () => {
      const startTime = Date.now();
      console.log(`🔒 [POST-METRICS] Lock acquired for post ${postId}`);

      try {
        // Verificar si ya existe un registro en post_metrics
        console.log(
          `🔍 [POST-METRICS] Checking for existing metrics in database...`,
        );
        const existingMetrics = await this.getPostMetricsByPostId(postId);
        console.log(
          `🔍 [POST-METRICS] Existing metrics found: ${
            existingMetrics?.length || 0
          }`,
        );

        if (existingMetrics && existingMetrics.length > 0) {
          console.log(
            `✅ [POST-METRICS] Using existing metrics for post ${postId}`,
          );
          console.log(
            `✅ [POST-METRICS] Existing metrics data:`,
            JSON.stringify(existingMetrics[0], null, 2),
          );
          return {
            success: true,
            metrics: existingMetrics[0],
          };
        }

        // Marcar como en procesamiento
        console.log(
          `🏷️ [POST-METRICS] Marking post ${postId} as processing...`,
        );
        this.markPostAsProcessing(postId);

        // Extraer ID del post de la URL
        console.log(`🔗 [POST-METRICS] Extracting post ID from URL...`);
        const postIdFromUrl = this.extractPostIdFromUrl(postUrl, platform);
        console.log(
          `🔗 [POST-METRICS] Extracted post ID from URL: ${postIdFromUrl}`,
        );

        if (!postIdFromUrl) {
          console.error(
            `❌ [POST-METRICS] Failed to extract post ID from URL: ${postUrl}`,
          );
          console.error(`❌ [POST-METRICS] Platform: ${platform}`);
          return {
            success: false,
            error: `No se pudo extraer el ID del post de la URL: ${postUrl}`,
          };
        }

        let metricsData: any;
        console.log(`\n🎯 [POST-METRICS] -------- PLATFORM ROUTING --------`);
        console.log(
          `🎯 [POST-METRICS] Platform detected: ${platform.toLowerCase()}`,
        );

        // Usar YouTube API para videos de YouTube
        if (platform.toLowerCase() === 'youtube') {
          const youtubeResult =
            await this.youtubeMetricsService.getVideoMetrics(postUrl);

          if (!youtubeResult.success) {
            console.error(
              `❌ [POST-METRICS] YouTube API failed:`,
              youtubeResult.error,
            );
            return {
              success: false,
              error: youtubeResult.error,
            };
          }

          // Convertir a formato del sistema
          metricsData = this.youtubeMetricsService.convertToSystemFormat(
            postId,
            postUrl,
            youtubeResult.data!,
          );
        } else if (platform.toLowerCase() === 'tiktok') {
          // Usar Apify para videos de TikTok
          const tiktokResult = await this.tiktokMetricsService.getVideoMetrics(
            postUrl,
          );

          if (!tiktokResult.success) {
            console.error(
              `❌ [POST-METRICS] TikTok API failed:`,
              tiktokResult.error,
            );
            return {
              success: false,
              error: tiktokResult.error,
            };
          }

          // Convertir a formato del sistema (now async)
          metricsData = await this.tiktokMetricsService.convertToSystemFormat(
            postId,
            postUrl,
            tiktokResult.data!,
          );
        } else if (platform.toLowerCase() === 'twitter') {
          // Usar Apify para tweets de Twitter/X
          console.log(
            `🐦 [POST-METRICS] Extracting Twitter metrics for post ${postId}`,
          );
          console.log(`🐦 [POST-METRICS] Tweet URL: ${postUrl}`);

          const twitterResult =
            await this.twitterMetricsService.getTweetMetrics(postUrl);

          if (!twitterResult.success) {
            console.error(
              `❌ [POST-METRICS] Twitter API failed for post ${postId}:`,
              twitterResult.error,
            );
            console.error(`❌ [POST-METRICS] URL: ${postUrl}`);
            return {
              success: false,
              error: twitterResult.error,
            };
          }

          console.log(
            `✅ [POST-METRICS] Successfully extracted Twitter metrics for post ${postId}`,
          );

          // Convertir a formato del sistema
          metricsData = this.twitterMetricsService.convertToSystemFormat(
            postId,
            postUrl,
            twitterResult.data!,
          );

          console.log(
            `✅ [POST-METRICS] Twitter metrics converted to system format:`,
            {
              likes_count: metricsData.likes_count,
              comments_count: metricsData.comments_count,
              views_count: metricsData.views_count,
              engagement_rate: metricsData.engagement_rate,
            },
          );
        } else if (platform.toLowerCase() === 'instagram') {
          // Usar Apify para posts de Instagram
          console.log(
            `\n📸 [POST-METRICS] ======= INSTAGRAM METRICS EXTRACTION =======`,
          );
          console.log(`📸 [POST-METRICS] Post URL: ${postUrl}`);
          console.log(`📸 [POST-METRICS] Post ID: ${postId}`);
          console.log(
            `📸 [POST-METRICS] Calling InstagramMetricsService.getPostMetrics()...`,
          );
          console.log(
            `📸 [POST-METRICS] Start time: ${new Date().toISOString()}`,
          );

          const instagramStartTime = Date.now();
          const instagramResult =
            await this.instagramMetricsService.getPostMetrics(postUrl);
          const instagramDuration = Date.now() - instagramStartTime;

          console.log(
            `📸 [POST-METRICS] Instagram API call completed in ${instagramDuration}ms`,
          );
          console.log(
            `📸 [POST-METRICS] Instagram result success: ${instagramResult.success}`,
          );
          console.log(
            `📸 [POST-METRICS] Instagram result error: ${
              instagramResult.error || 'none'
            }`,
          );

          if (!instagramResult.success) {
            console.error(`❌ [POST-METRICS] Instagram API failed!`);
            console.error(`❌ [POST-METRICS] Error: ${instagramResult.error}`);
            console.error(`❌ [POST-METRICS] Post URL: ${postUrl}`);
            console.error(`❌ [POST-METRICS] Duration: ${instagramDuration}ms`);
            return {
              success: false,
              error: instagramResult.error,
            };
          }

          console.log(`✅ [POST-METRICS] Instagram API succeeded!`);
          console.log(
            `✅ [POST-METRICS] Likes: ${instagramResult.data?.likes}`,
          );
          console.log(
            `✅ [POST-METRICS] Comments: ${instagramResult.data?.comments}`,
          );
          console.log(
            `✅ [POST-METRICS] Views: ${instagramResult.data?.views}`,
          );
          console.log(
            `✅ [POST-METRICS] Engagement Rate: ${instagramResult.data?.engagementRate}`,
          );

          // Convertir a formato del sistema
          console.log(
            `🔄 [POST-METRICS] Converting Instagram data to system format...`,
          );
          metricsData = this.instagramMetricsService.convertToSystemFormat(
            postId,
            postUrl,
            instagramResult.data!,
          );
          console.log(
            `🔄 [POST-METRICS] Converted metrics data:`,
            JSON.stringify(metricsData, null, 2),
          );
        } else {
          // Usar CreatorDB para otras plataformas
          const creatorDbData = await this.withRetries(
            () =>
              this.fetchPostMetricsFromCreatorDB(
                postIdFromUrl,
                platform,
                postUrl,
              ),
            2,
            1000,
          );

          if (!creatorDbData.success) {
            console.error(
              `❌ [POST-METRICS] CreatorDB fetch failed:`,
              creatorDbData.error,
            );
            return {
              success: false,
              error: creatorDbData.error,
            };
          }

          // Convertir datos de CreatorDB a nuestro formato
          metricsData = this.convertCreatorDbDataToUserMetrics(
            postId,
            postIdFromUrl,
            creatorDbData.data,
            platform,
            postUrl,
          );
        }

        // Guardar métricas en la base de datos
        console.log(
          `\n💾 [POST-METRICS] -------- SAVING METRICS TO DATABASE --------`,
        );
        console.log(`💾 [POST-METRICS] Post ID: ${postId}`);
        console.log(`💾 [POST-METRICS] Platform: ${platform}`);
        console.log(
          `💾 [POST-METRICS] Metrics data to save:`,
          JSON.stringify(metricsData, null, 2),
        );

        const saveStartTime = Date.now();
        const savedMetrics = await this.createUserPostMetrics(metricsData);
        const saveDuration = Date.now() - saveStartTime;

        console.log(`💾 [POST-METRICS] Save completed in ${saveDuration}ms`);

        const processingTime = Date.now() - startTime;
        console.log(
          `\n✅ [POST-METRICS] ======= EXTRACTION COMPLETED SUCCESSFULLY =======`,
        );
        console.log(`✅ [POST-METRICS] Post ID: ${postId}`);
        console.log(`✅ [POST-METRICS] Platform: ${platform}`);
        console.log(
          `✅ [POST-METRICS] Total processing time: ${processingTime}ms`,
        );
        console.log(`${'─'.repeat(60)}\n`);

        return {
          success: true,
          metrics: savedMetrics,
        };
      } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`\n❌ [POST-METRICS] ======= EXTRACTION FAILED =======`);
        console.error(`❌ [POST-METRICS] Post ID: ${postId}`);
        console.error(`❌ [POST-METRICS] Platform: ${platform}`);
        console.error(`❌ [POST-METRICS] Post URL: ${postUrl}`);
        console.error(
          `❌ [POST-METRICS] Processing time until error: ${processingTime}ms`,
        );
        console.error(
          `❌ [POST-METRICS] Error type: ${
            error?.constructor?.name || 'Unknown'
          }`,
        );
        console.error(
          `❌ [POST-METRICS] Error message: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`,
        );
        console.error(
          `❌ [POST-METRICS] Error stack:`,
          error instanceof Error ? error.stack : 'N/A',
        );
        console.error(`${'─'.repeat(60)}\n`);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        };
      } finally {
        // Marcar como procesado
        console.log(
          `🏷️ [POST-METRICS] Marking post ${postId} as processed (removing from processing set)...`,
        );
        this.markPostAsProcessed(postId);
      }
    });
  }

  /**
   * Sync metrics back to influencer_posts table
   */
  private async syncMetricsToInfluencerPost(
    postId: string,
    metrics: UserPostMetrics,
  ): Promise<void> {
    const supabase = require('../../config/supabase').default;

    try {
      // Calculate performance rating based on engagement rate
      let performanceRating = 'average';
      if (metrics.engagement_rate >= 0.05) {
        performanceRating = 'excellent';
      } else if (metrics.engagement_rate >= 0.03) {
        performanceRating = 'good';
      } else if (metrics.engagement_rate < 0.01) {
        performanceRating = 'poor';
      }

      const updateData: any = {
        likes_count: metrics.likes_count,
        comments_count: metrics.comments_count,
        performance_rating: performanceRating,
        updated_at: new Date(),
      };

      // Add caption if available (from title field in metrics)
      if (metrics.title) {
        updateData.caption = metrics.title;
      }

      // Add image URL if available from raw_response
      let imageUrl = null;
      if (metrics.raw_response?.data?.basicInstagramPost?.imageUrl) {
        imageUrl = metrics.raw_response.data.basicInstagramPost.imageUrl;
      } else if (
        metrics.raw_response?.data?.basicInstagramPost?.rawData?.displayUrl
      ) {
        imageUrl =
          metrics.raw_response.data.basicInstagramPost.rawData.displayUrl;
      } else if (metrics.platform_data?.imageUrl) {
        imageUrl = metrics.platform_data.imageUrl;
      } else if (metrics.raw_response?.data?.basicTikTokVideo?.cover) {
        // 🎵 TikTok thumbnail from raw response
        imageUrl = metrics.raw_response.data.basicTikTokVideo.cover;
      } else if ((metrics as any).thumbnail_url) {
        // 🎵 TikTok thumbnail from direct field
        imageUrl = (metrics as any).thumbnail_url;
      }

      // For Instagram URLs, use proxy to avoid CORS issues
      if (
        imageUrl &&
        (imageUrl.includes('instagram.com') ||
          imageUrl.includes('fbcdn.net') ||
          imageUrl.includes('cdninstagram.com'))
      ) {
        updateData.image_url = `https://images.weserv.nl/?url=${encodeURIComponent(
          imageUrl,
        )}&w=800&h=800&fit=cover&output=webp`;
      } else if (imageUrl) {
        updateData.image_url = imageUrl;
      }

      const { error } = await supabase
        .from('influencer_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) {
        console.error(
          `❌ [SYNC] Error syncing metrics to influencer_posts:`,
          error,
        );
      } else {
        console.log(
          `✅ [SYNC] Metrics synced to influencer_posts for post ${postId}`,
        );
      }
    } catch (error) {
      console.error(`❌ [SYNC] Critical error syncing metrics:`, error);
    }
  }

  /**
   * Crear métricas usando la estructura de tabla del usuario
   * GARANTIZA UN SOLO REGISTRO POR POST
   */
  public async createUserPostMetrics(
    metrics: UserPostMetrics,
  ): Promise<UserPostMetrics> {
    const supabase = require('../../config/supabase').default;

    try {
      // Verificar si ya existe un registro para este post_id
      const { data: existingRecords, error: checkError } = await supabase
        .from('post_metrics')
        .select('id, created_at')
        .eq('post_id', metrics.post_id);

      if (checkError) {
        console.error(
          `❌ [DB-SAVE] Error checking existing records:`,
          checkError,
        );
        throw checkError;
      }

      // Si hay múltiples registros, eliminar todos excepto el más reciente
      if (existingRecords && existingRecords.length > 1) {
        console.warn(
          `⚠️ [DB-SAVE] Found ${existingRecords.length} duplicate records for post ${metrics.post_id}. Cleaning up...`,
        );

        // Ordenar por fecha de creación y mantener solo el más reciente
        const sortedRecords = existingRecords.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        const recordsToDelete = sortedRecords.slice(1).map((r: any) => r.id);

        if (recordsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('post_metrics')
            .delete()
            .in('id', recordsToDelete);

          if (deleteError) {
            console.error(
              `❌ [DB-SAVE] Error deleting duplicate records:`,
              deleteError,
            );
            throw deleteError;
          }
        }

        // Actualizar el registro restante
        const { data, error } = await supabase
          .from('post_metrics')
          .update({
            platform: metrics.platform,
            content_id: metrics.content_id,
            post_url: metrics.post_url,
            title: metrics.title,
            likes_count: metrics.likes_count,
            comments_count: metrics.comments_count,
            views_count: metrics.views_count,
            engagement_rate: metrics.engagement_rate,
            platform_data: metrics.platform_data,
            quota_used: metrics.quota_used,
            api_timestamp: metrics.api_timestamp,
            api_success: metrics.api_success,
            api_error: metrics.api_error,
            raw_response: metrics.raw_response,
            updated_at: new Date(),
          })
          .eq('post_id', metrics.post_id)
          .select()
          .single();

        if (error) {
          console.error(`❌ [DB-SAVE] Error updating existing metrics:`, error);
          throw error;
        }

        // Sync metrics to influencer_posts table
        await this.syncMetricsToInfluencerPost(metrics.post_id, metrics);

        return data;
      } else if (existingRecords && existingRecords.length === 1) {
        // Actualizar el registro existente
        const { data, error } = await supabase
          .from('post_metrics')
          .update({
            platform: metrics.platform,
            content_id: metrics.content_id,
            post_url: metrics.post_url,
            title: metrics.title,
            likes_count: metrics.likes_count,
            comments_count: metrics.comments_count,
            views_count: metrics.views_count,
            engagement_rate: metrics.engagement_rate,
            platform_data: metrics.platform_data,
            quota_used: metrics.quota_used,
            api_timestamp: metrics.api_timestamp,
            api_success: metrics.api_success,
            api_error: metrics.api_error,
            raw_response: metrics.raw_response,
            updated_at: new Date(),
          })
          .eq('post_id', metrics.post_id)
          .select()
          .single();

        if (error) {
          console.error(`❌ [DB-SAVE] Error updating metrics:`, error);
          throw error;
        }

        // Sync metrics to influencer_posts table
        await this.syncMetricsToInfluencerPost(metrics.post_id, metrics);

        return data;
      } else {
        // Crear nuevo registro
        const { data, error } = await supabase
          .from('post_metrics')
          .insert([
            {
              post_id: metrics.post_id,
              platform: metrics.platform,
              content_id: metrics.content_id,
              post_url: metrics.post_url,
              title: metrics.title,
              likes_count: metrics.likes_count,
              comments_count: metrics.comments_count,
              views_count: metrics.views_count,
              engagement_rate: metrics.engagement_rate,
              platform_data: metrics.platform_data,
              quota_used: metrics.quota_used,
              api_timestamp: metrics.api_timestamp,
              api_success: metrics.api_success,
              api_error: metrics.api_error,
              raw_response: metrics.raw_response,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ])
          .select()
          .single();

        if (error) {
          console.error(`❌ [DB-SAVE] Error saving new metrics:`, error);
          throw error;
        }

        // Sync metrics to influencer_posts table
        await this.syncMetricsToInfluencerPost(metrics.post_id, metrics);

        return data;
      }
    } catch (error) {
      console.error(`❌ [DB-SAVE] Critical error saving metrics:`, error);
      throw error;
    }
  }

  /**
   * Llama a CreatorDB para obtener métricas del post con timeouts optimizados
   */
  private async fetchPostMetricsFromCreatorDB(
    postId: string,
    platform: string,
    postUrl: string,
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    // Pequeña espera para no saturar la API externa
    await this.delay(200); // Reducido de 500ms a 200ms

    // Intentar obtener del caché primero
    const cacheKey = `metrics:${platform}:${postId}`;
    try {
      const cachedMetrics = await this.getFromCache(cacheKey);
      if (cachedMetrics) {
        return {
          success: true,
          data: cachedMetrics,
        };
      }
    } catch (error) {
      console.warn(`Error al leer caché:`, error);
    }

    try {
      // Timeout optimizado para CreatorDB
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('CreatorDB timeout')), 30000); // 30s timeout
      });

      // Usar directamente getPostByLink ya que CreatorDB debe buscar por URL

      const response = (await Promise.race([
        CreatorDBService.getPostByLink(postUrl),
        timeoutPromise,
      ])) as any;

      // Esperar después de la llamada
      await this.delay(500);

      // Si la llamada fue exitosa, guardar en caché
      if (response.success && response.data) {
        try {
          await this.saveToCache(cacheKey, response, 3600); // Caché por 1 hora
        } catch (error) {
          console.warn(`Error al guardar en caché:`, error);
        }
      }

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      // Si hay error pero tenemos caché, usarlo como fallback
      try {
        const cachedMetrics = await this.getFromCache(cacheKey);
        if (cachedMetrics) {
          return {
            success: true,
            data: cachedMetrics,
          };
        }
      } catch (cacheError) {
        // Ignorar errores de caché en modo fallback
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Error al llamar CreatorDB',
      };
    }
  }

  /**
   * Reconstruye la URL del post basado en su ID y plataforma
   */
  private reconstructPostUrl(postId: string, platform: string): string | null {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return `https://www.youtube.com/watch?v=${postId}`;
      case 'instagram':
        // No podemos reconstruir URLs de Instagram sin el username
        return null;
      case 'tiktok':
        // No podemos reconstruir URLs de TikTok sin el username
        return null;
      case 'twitter':
        return `https://twitter.com/i/status/${postId}`;
      default:
        return null;
    }
  }

  /**
   * Convierte los datos de CreatorDB al formato de la tabla del usuario
   */
  private convertCreatorDbDataToUserMetrics(
    postId: string,
    contentId: string,
    creatorDbData: any,
    platform: string,
    postUrl: string,
  ): UserPostMetrics {
    const platformLower = platform.toLowerCase() as
      | 'youtube'
      | 'instagram'
      | 'tiktok'
      | 'twitter';

    const baseMetrics: UserPostMetrics = {
      post_id: postId,
      platform: platformLower,
      content_id: contentId,
      post_url: postUrl,
      title: '',
      likes_count: 0,
      comments_count: 0,
      views_count: 0,
      engagement_rate: 0,
      platform_data: creatorDbData,
      quota_used: creatorDbData.quotaUsed || 0,
      api_timestamp: Date.now(),
      api_success: creatorDbData.success || false,
      api_error: undefined,
      raw_response: creatorDbData,
    };

    // Extraer métricas específicas según la plataforma
    if (platformLower === 'youtube' && creatorDbData.data?.basicYoutubePost) {
      const youtubeData = creatorDbData.data.basicYoutubePost;

      baseMetrics.likes_count = youtubeData.likes || 0;
      baseMetrics.comments_count = youtubeData.comments || 0;
      baseMetrics.views_count = youtubeData.views || 0;
      baseMetrics.title = youtubeData.title || '';
      baseMetrics.engagement_rate = youtubeData.engageRate || 0;
    } else if (
      platformLower === 'instagram' &&
      creatorDbData.data?.basicInstagramPost
    ) {
      const instagramData = creatorDbData.data.basicInstagramPost;

      baseMetrics.likes_count = instagramData.likes || 0;
      baseMetrics.comments_count = instagramData.comments || 0;
      baseMetrics.views_count = instagramData.views || 0;
      baseMetrics.title = instagramData.caption || '';
      baseMetrics.engagement_rate = instagramData.engageRate || 0;
    } else if (
      platformLower === 'tiktok' &&
      creatorDbData.data?.basicTikTokPost
    ) {
      const tiktokData = creatorDbData.data.basicTikTokPost;

      baseMetrics.likes_count = tiktokData.likes || 0;
      baseMetrics.comments_count = tiktokData.comments || 0;
      baseMetrics.views_count = tiktokData.views || 0;
      baseMetrics.title = tiktokData.description || '';
      baseMetrics.engagement_rate = tiktokData.engageRate || 0;
    } else if (
      platformLower === 'twitter' &&
      creatorDbData.data?.basicTwitterPost
    ) {
      const twitterData = creatorDbData.data.basicTwitterPost;

      baseMetrics.likes_count =
        twitterData.likes || twitterData.favorite_count || 0;
      baseMetrics.comments_count =
        twitterData.replies || twitterData.reply_count || 0;
      baseMetrics.views_count =
        twitterData.views || twitterData.impressions || 0;
      baseMetrics.title = twitterData.text || twitterData.content || '';
      baseMetrics.engagement_rate = twitterData.engageRate || 0;
    } else {
      console.warn(
        `⚠️ [CONVERT] No platform-specific data found in response for platform: ${platformLower}`,
      );
    }

    return baseMetrics;
  }

  /**
   * Extrae el ID del post de la URL según la plataforma
   */
  private extractPostIdFromUrl(
    postUrl: string,
    platform: string,
  ): string | null {
    const platformLower = platform.toLowerCase();

    try {
      let postId: string | null = null;

      if (platformLower === 'youtube') {
        // Patrones para diferentes formatos de URLs de YouTube
        const patterns = [
          /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
          /(?:youtu\.be\/)([^&\n?#]+)/,
          /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
          /(?:youtube\.com\/v\/)([^&\n?#]+)/,
          /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
          /(?:youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
        ];

        for (const pattern of patterns) {
          const match = postUrl.match(pattern);
          if (match && match[1]) {
            postId = match[1];
            break;
          }
        }

        // Fallback para URLs con parámetros complejos
        if (!postId) {
          try {
            const urlObj = new URL(postUrl);
            postId = urlObj.searchParams.get('v');
          } catch (e) {
            // Si falla el parsing de URL, continuar con null
          }
        }
      } else if (platformLower === 'instagram') {
        const patterns = [
          /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
          /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
          /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
        ];

        for (const pattern of patterns) {
          const match = postUrl.match(pattern);
          if (match && match[1]) {
            postId = match[1];
            break;
          }
        }
      } else if (platformLower === 'tiktok') {
        const match = postUrl.match(/\/video\/(\d+)/);
        postId = match ? match[1] : null;
      } else if (platformLower === 'twitter') {
        const patterns = [
          /twitter\.com\/[^\/]+\/status\/(\d+)/,
          /x\.com\/[^\/]+\/status\/(\d+)/,
          /mobile\.twitter\.com\/[^\/]+\/status\/(\d+)/,
          /twitter\.com\/i\/web\/status\/(\d+)/,
          /x\.com\/i\/web\/status\/(\d+)/,
        ];

        for (const pattern of patterns) {
          const match = postUrl.match(pattern);
          if (match && match[1]) {
            postId = match[1];
            break;
          }
        }
      }

      if (postId) {
      } else {
        console.warn(
          `⚠️ [URL-EXTRACT] Failed to extract ID from URL for platform: ${platformLower} - URL: ${postUrl}`,
        );
      }

      return postId;
    } catch (error) {
      console.error(`❌ [URL-EXTRACT] Error extracting post ID:`, error);
      return null;
    }
  }

  /**
   * Obtiene métricas existentes de un post
   */
  async getPostMetricsByPostId(postId: string): Promise<UserPostMetrics[]> {
    const supabase = require('../../config/supabase').default;

    const { data, error } = await supabase
      .from('post_metrics')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo métricas:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Actualiza métricas de un post existente
   */
  async fetchAndStorePostMetrics(
    postId: string,
    postUrl: string,
    platform: string,
  ): Promise<UserPostMetrics> {
    const result = await this.extractAndSaveMetrics(postId, postUrl, platform);

    if (!result.success || !result.metrics) {
      throw new Error(result.error || 'Error al obtener métricas');
    }

    return result.metrics;
  }

  /**
   * Guarda datos en caché
   */
  private async saveToCache(
    key: string,
    data: any,
    ttlSeconds: number,
  ): Promise<void> {
    try {
      await postgresCacheService.set(key, data, ttlSeconds);
    } catch (error) {
      console.error(`❌ [CACHE] Error saving to cache:`, error);
      throw error;
    }
  }

  /**
   * Obtiene datos de caché
   */
  private async getFromCache(key: string): Promise<any | null> {
    try {
      return await postgresCacheService.get(key);
    } catch (error) {
      console.error(`❌ [CACHE] Error reading from cache:`, error);
      return null;
    }
  }

  /**
   * Limpia duplicados masivamente en post_metrics
   * MANTIENE SOLO UN REGISTRO POR POST
   */
  async cleanupDuplicateMetrics(): Promise<{
    totalPosts: number;
    duplicatePosts: number;
    cleanedPosts: number;
    errors: string[];
  }> {
    const supabase = require('../../config/supabase').default;
    const result = {
      totalPosts: 0,
      duplicatePosts: 0,
      cleanedPosts: 0,
      errors: [] as string[],
    };

    try {
      // Obtener todos los post_ids que tienen múltiples registros
      const { data: duplicateGroups, error: groupError } = await supabase
        .from('post_metrics')
        .select('post_id')
        .group('post_id')
        .having('count(*)', 'gt', 1);

      if (groupError) {
        console.error(
          '❌ [CLEANUP] Error finding duplicate groups:',
          groupError,
        );
        result.errors.push(`Error finding duplicates: ${groupError.message}`);
        return result;
      }

      if (!duplicateGroups || duplicateGroups.length === 0) {
        return result;
      }

      result.duplicatePosts = duplicateGroups.length;

      // Procesar cada post con duplicados
      for (const group of duplicateGroups) {
        try {
          const postId = group.post_id;

          // Obtener todos los registros para este post
          const { data: records, error: recordsError } = await supabase
            .from('post_metrics')
            .select('id, created_at')
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

          if (recordsError) {
            console.error(
              `❌ [CLEANUP] Error getting records for post ${postId}:`,
              recordsError,
            );
            result.errors.push(
              `Error getting records for ${postId}: ${recordsError.message}`,
            );
            continue;
          }

          if (records && records.length > 1) {
            // Mantener solo el registro más reciente
            const recordsToDelete = records.slice(1).map((r: any) => r.id);

            const { error: deleteError } = await supabase
              .from('post_metrics')
              .delete()
              .in('id', recordsToDelete);

            if (deleteError) {
              console.error(
                `❌ [CLEANUP] Error deleting duplicates for post ${postId}:`,
                deleteError,
              );
              result.errors.push(
                `Error deleting duplicates for ${postId}: ${deleteError.message}`,
              );
            } else {
              result.cleanedPosts++;
            }
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : 'Unknown error';
          console.error(
            `❌ [CLEANUP] Error processing post ${group.post_id}:`,
            error,
          );
          result.errors.push(`Error processing ${group.post_id}: ${errorMsg}`);
        }
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [CLEANUP] Critical error in mass cleanup:', error);
      result.errors.push(`Critical error: ${errorMsg}`);
      return result;
    }
  }
}

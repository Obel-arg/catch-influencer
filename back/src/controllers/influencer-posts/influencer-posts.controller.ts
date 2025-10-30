import { Request, Response } from 'express';
import supabase from '../../config/supabase';
import { InfluencerPostService } from '../../services/influencer/influencer-post.service';
import { PostMetricsService } from '../../services/post-metrics/post-metrics.service';
import { AutoScrapingService } from '../../services/scraping/auto-scraping.service';
import { postTopicsService } from '../../services/post-topics.service';
import { postgresCacheService } from '../../services/cache/postgres-cache.service';
import { postgresQueueService } from '../../services/queues/postgres-queue.service';

export class InfluencerPostsController {
  private influencerPostService = new InfluencerPostService();
  private postMetricsService = new PostMetricsService();

  // Control de concurrencia para análisis de temas
  private topicAnalysisInProgress = new Set<string>();

  async createPost(req: Request, res: Response) {
    const startTime = Date.now();
    
    try {
      const postData = req.body;
      
      // 1. Crear el post (operación rápida)
      const newPost = await this.influencerPostService.createInfluencerPost(postData);
      
      // 2. Respuesta inmediata al usuario
      const responseTime = Date.now() - startTime;
      
      res.status(201).json({
        success: true,
        message: 'Post creado exitosamente. Procesamiento en background iniciado.',
        data: {
          ...newPost,
          processingStatus: 'queued',
          responseTime: `${responseTime}ms`
        }
      });

      // 3. Iniciar procesamiento en background (no bloquea la respuesta)
      this.initiateBackgroundProcessing(newPost.id, newPost.post_url, newPost.platform);

    } catch (error) {
      console.error('❌ [POST-CREATION] Error creating post:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el post',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Inicia todo el procesamiento en background usando workers optimizados
   */
  private async initiateBackgroundProcessing(postId: string, postUrl: string, platform: string) {
    try {
      // Omitir procesamiento automático para historias de Instagram
      if (platform.toLowerCase() === 'instagram' && /instagram\.com\/stories\//i.test(postUrl)) {
       
        return;
      }

      // 1. Extraer métricas de CreatorDB (más rápido)
      await postgresQueueService.send('metrics', {
        type: 'extract-metrics',
        postId,
        postUrl,
        platform
      });

      // 2. Extraer comentarios y análisis de sentimientos (paralelo)
      if (this.shouldAutoScrape(platform, postUrl)) {
        await postgresQueueService.send('comment-fetch', {
          type: 'extract-comments',
          postId,
          postUrl,
          platform,
          maxComments: 500, // Reducido para velocidad
          includeSentiment: true
        });
      }

    } catch (error) {
      console.error(`❌ [BACKGROUND] Error iniciando procesamiento para post ${postId}:`, error);
    }
  }

  async getPosts(req: Request, res: Response) {
    try {
      const { campaignId, influencerId, limit = '50', offset = '0' } = req.query;
      
      // Optimización: usar límites y paginación
      const limitNum = Math.min(parseInt(limit as string), 100);
      const offsetNum = parseInt(offset as string);
      
      let posts;
      if (campaignId && influencerId) {
        posts = await this.influencerPostService.getInfluencerPostsByCampaignAndInfluencer(
          campaignId as string, 
          influencerId as string,
          limitNum,
          offsetNum
        );
      } else if (campaignId) {
        posts = await this.influencerPostService.getInfluencerPostsByCampaign(
          campaignId as string,
          limitNum,
          offsetNum
        );
      } else {
        posts = await this.influencerPostService.getInfluencerPostsWithMetrics('', limitNum, offsetNum);
      }
      
      res.status(200).json({
        success: true,
        data: posts,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          count: posts.length
        }
      });
    } catch (error) {
      console.error('❌ [GET-POSTS] Error getting posts:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los posts',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getPostWithMetrics(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      
      // Paralelizar consultas independientes
      const [post, metrics] = await Promise.all([
        this.influencerPostService.getInfluencerPostById(postId),
        this.postMetricsService.getPostMetricsByPostId(postId)
      ]);
      
      res.status(200).json({
        success: true,
        data: {
          post,
          metrics: metrics[0] || null // Solo la métrica más reciente
        }
      });
    } catch (error) {
      console.error('❌ [GET-POST-METRICS] Error getting post with metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el post con métricas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async refreshPostMetrics(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      
      const post = await this.influencerPostService.getInfluencerPostById(postId);
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post no encontrado'
        });
      }
      
      // Usar worker para refresh en background
      await postgresQueueService.send('metrics', {
        type: 'refresh-metrics',
        postId,
        postUrl: post.post_url,
        platform: post.platform
      });
      
      res.status(200).json({
        success: true,
        message: 'Actualización de métricas iniciada en background',
        jobStatus: 'queued'
      });
    } catch (error) {
      console.error('❌ [REFRESH-METRICS] Error refreshing post metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar las métricas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Get all metrics for all posts in a campaign (for evolution charts)
   */
  async getAllMetricsForCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;

      if (!campaignId) {
        return res.status(400).json({
          success: false,
          message: 'Campaign ID is required'
        });
      }

      
      // Get all posts for this campaign using the service
      const influencerPosts = await this.influencerPostService.getInfluencerPostsByCampaign(campaignId, 1000, 0);

      if (!influencerPosts || influencerPosts.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Get post IDs
      const postIds = influencerPosts.map(post => post.id);

      // Get ALL metrics for these posts using the service
      // Use Promise.allSettled to handle individual failures gracefully
      const allMetricsPromises = postIds.map(async (postId) => {
        try {
          return await this.postMetricsService.getPostMetricsByPostId(postId);
        } catch (error) {
          console.warn(`⚠️ [ALL-METRICS] Error fetching metrics for post ${postId}:`, error);
          return []; // Return empty array on error
        }
      });
      
      const allMetricsResults = await Promise.all(allMetricsPromises);
      const allMetrics = allMetricsResults.flat();


      // Return all metrics with their creation dates
      return res.json({
        success: true,
        data: allMetrics || []
      });

    } catch (error) {
      console.error('❌ [ALL-METRICS] Error in getAllMetricsForCampaign:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Determina si se debe realizar auto-scraping para una plataforma y URL
   */
  private shouldAutoScrape(platform: string, postUrl: string): boolean {
    const supportedPlatforms = ['youtube', 'tiktok', 'twitter', 'instagram'];
    
    if (!supportedPlatforms.includes(platform.toLowerCase())) {
      return false;
    }
    
    // Verificar que la URL sea válida para la plataforma
    const platformLower = platform.toLowerCase();
    
    if (platformLower === 'youtube' && (postUrl.includes('youtube.com') || postUrl.includes('youtu.be'))) {
      return true;
    }
    
    if (platformLower === 'tiktok' && (postUrl.includes('tiktok.com') || postUrl.includes('vm.tiktok.com'))) {
      return true;
    }
    
    if (platformLower === 'twitter' && (postUrl.includes('twitter.com') || postUrl.includes('x.com'))) {
      return true;
    }
    
    if (platformLower === 'instagram' && postUrl.includes('instagram.com')) {
      return true;
    }
    
    return false;
  }

  /**
   * Realiza análisis de temas basado en los comentarios extraídos
   */
  private performTopicAnalysis(postId: string, scrapingResult: any): void {
    if (this.topicAnalysisInProgress.has(postId)) {
      return;
    }
    
    this.topicAnalysisInProgress.add(postId);
    
    // Usar worker para análisis de temas en background
    setTimeout(async () => {
      try {
        if (!scrapingResult.success || !scrapingResult.commentsExtracted || scrapingResult.commentsExtracted === 0) {
          return;
        }
        
        const comments = await this.getRealCommentsFromDatabase(postId);
        if (comments.length === 0) {
          return;
        }
        
        const topicsResult = await postTopicsService.analyzeAndSavePostTopics(postId, comments);
        this.logTopicResults(postId, topicsResult);
      } catch (error) {
        console.error(`❌ [TOPIC-ANALYSIS] Error en análisis de temas para post ${postId}:`, error instanceof Error ? error.message : error);
      } finally {
        this.topicAnalysisInProgress.delete(postId);
      }
    }, 2000); // Reducido de 3s a 2s
  }

  /**
   * Obtiene comentarios reales de la base de datos con sentimientos
   */
  private async getRealCommentsFromDatabase(postId: string): Promise<Array<{ text: string; sentiment?: string }>> {
    try {
      // Usar PostgreSQL cache service
      const storedComments = await postgresCacheService.get(`comments:${postId}`) as any;
      
      if (storedComments && storedComments.comments && storedComments.comments.length > 0) {
        return storedComments.comments
          .map((comment: any) => ({
            text: comment.text || '',
            sentiment: comment.sentiment?.label || 'neutral'
          }))
          .filter((comment: any) => comment.text && comment.text.length > 10)
          .slice(0, 200); // Limitar a 200 comentarios para velocidad
      }

      // Fallback a Supabase
      const { supabase } = require('../../lib/supabase');
      
      const { data: comments, error } = await supabase
        .from('post_comments')
        .select('text, sentiment')
        .eq('post_id', postId)
        .not('text', 'is', null)
        .limit(200); // Reducido de 1000 a 200

      if (error) {
        console.error(`❌ [TOPIC-ANALYSIS] Error obteniendo comentarios de Supabase:`, error);
        return [];
      }

      if (comments && comments.length > 0) {
        return comments
          .filter((comment: any) => comment.text && comment.text.length > 10)
          .slice(0, 200);
      }

      return [];

    } catch (error) {
      console.error(`❌ [TOPIC-ANALYSIS] Error obteniendo comentarios reales:`, error);
      return [];
    }
  }

  /**
   * Registra los resultados del análisis de temas
   */
  private logTopicResults(postId: string, topicsResult: any): void {
    if (topicsResult.topics.length > 0) {
    }
  }
} 
import { Request, Response } from 'express';
import { InfluencerPostService } from '../../services/influencer/influencer-post.service';
import { AutoScrapingService } from '../../services/scraping/auto-scraping.service';
import { OptimizedPostMetricsService } from '../../services/post-metrics/optimized-post-metrics.service';

export class InfluencerPostController {
  private influencerPostService: InfluencerPostService;
  private postMetricsService: OptimizedPostMetricsService;

  constructor() {
    this.influencerPostService = new InfluencerPostService();
    this.postMetricsService = new OptimizedPostMetricsService();
  }

  async createInfluencerPost(req: Request, res: Response) {
    try {
      const postData = req.body;
      
      // Crear el post primero
      const influencerPost = await this.influencerPostService.createInfluencerPost(postData);
      
      
      // Si el post tiene URL y es de una plataforma soportada, iniciar scraping automático
      if (influencerPost.post_url && this.shouldAutoScrape(postData.platform, influencerPost.post_url)) {
        
        // Ejecutar scraping en background (no bloquear la respuesta)
        this.performBackgroundScraping(influencerPost.id, influencerPost.post_url)
          .catch(error => {
            console.error(`❌ [POST-CREATION] Error en auto-scraping background para post ${influencerPost.id}:`, error);
          });
        
        // Agregar información sobre el scraping iniciado
        const responseWithScraping = {
          ...influencerPost,
          _scraping: {
            initiated: true,
            platform: postData.platform,
            message: 'Scraping de comentarios, análisis de sentimientos y métricas de CreatorDB iniciados en background'
          }
        };
        
        res.status(201).json(responseWithScraping);
      } else {
        res.status(201).json(influencerPost);
      }
      
    } catch (error) {
      console.error('❌ [POST-CREATION] Error creating influencer post:', error);
      res.status(500).json({ error: 'Error creating influencer post' });
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
   * Realiza scraping en background sin bloquear la respuesta
   */
  private async performBackgroundScraping(postId: string, postUrl: string): Promise<void> {
    try {

      
      const result = await AutoScrapingService.scrapePostComments(postId, postUrl);


      
      if (result.success) {
        // DESPUÉS del scraping exitoso, extraer métricas de CreatorDB
        this.extractPostMetricsAfterScraping(postId, postUrl, result.platform);
      } else {
        console.error(`❌ [BACKGROUND-SCRAPING] Auto-scraping falló para post ${postId}:`);
        console.error(`   🏷️ Plataforma: ${result.platform}`);
        console.error(`   ❌ Error: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`❌ [BACKGROUND-SCRAPING] Error crítico en auto-scraping para post ${postId}:`, error);
      console.error(`🔍 [BACKGROUND-SCRAPING] Detalles:`, {
        postId,
        postUrl,
        errorMessage: error instanceof Error ? error.message : 'Error desconocido',
        errorStack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  // Nuevo endpoint para obtener comentarios almacenados
  async getPostComments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      
      // Obtener el post para conseguir la URL
      const post = await this.influencerPostService.getInfluencerPostById(id);
      if (!post || !post.post_url) {
        return res.status(404).json({ 
          error: 'Post no encontrado o sin URL'
        });
      }

      // Buscar comentarios en Redis por URL
      const storedComments = await AutoScrapingService.hasStoredComments(post.post_url);
      
      if (!storedComments) {
        return res.status(404).json({ 
          error: 'No se encontraron comentarios almacenados para este post',
          suggestion: 'Los comentarios se extraen automáticamente al crear el post si la plataforma es soportada'
        });
      }
      
      res.json({
        success: true,
        message: 'Comentarios disponibles en caché',
        hasComments: true
      });
      
    } catch (error) {
      console.error('Error getting post comments:', error);
      res.status(500).json({ error: 'Error getting post comments' });
    }
  }

  // Nuevo endpoint para forzar re-scraping
  async rescrapPost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Obtener información del post
      const post = await this.influencerPostService.getInfluencerPostById(id);
      
      if (!post || !post.post_url) {
        return res.status(404).json({ error: 'Post no encontrado o sin URL' });
      }
      
      if (!this.shouldAutoScrape(post.platform, post.post_url)) {
        return res.status(400).json({ 
          error: 'Plataforma no soportada para scraping',
          supportedPlatforms: ['youtube', 'tiktok', 'twitter', 'instagram']
        });
      }
      
      
      const result = await AutoScrapingService.scrapePostComments(id, post.post_url);
      
      res.json({
        success: result.success,
        data: result,
        message: result.success 
          ? `Re-scraping completado: ${result.commentsExtracted} comentarios extraídos, análisis de sentimientos: ${result.sentimentAnalyzed ? 'completado' : 'error'}`
          : `Re-scraping falló: ${result.error}`
      });
      
    } catch (error) {
      console.error('Error re-scraping post:', error);
      res.status(500).json({ error: 'Error re-scraping post' });
    }
  }

  // Nuevo endpoint para estadísticas de scraping
  async getScrapingStats(req: Request, res: Response) {
    try {
      const stats = await AutoScrapingService.getScrapingStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting scraping stats:', error);
      res.status(500).json({ error: 'Error getting scraping stats' });
    }
  }

  async getInfluencerPostById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const influencerPost = await this.influencerPostService.getInfluencerPostById(id);
      res.json(influencerPost);
    } catch (error) {
      console.error('Error getting influencer post:', error);
      res.status(500).json({ error: 'Error getting influencer post' });
    }
  }

  async getInfluencerPostsByCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const influencerPosts = await this.influencerPostService.getInfluencerPostsByCampaign(campaignId);
      res.json(influencerPosts);
    } catch (error) {
      console.error('Error getting influencer posts by campaign:', error);
      res.status(500).json({ error: 'Error getting influencer posts by campaign' });
    }
  }

  async getInfluencerPostsByInfluencer(req: Request, res: Response) {
    try {
      const { influencerId } = req.params;
      const influencerPosts = await this.influencerPostService.getInfluencerPostsByInfluencer(influencerId);
      res.json(influencerPosts);
    } catch (error) {
      console.error('Error getting influencer posts by influencer:', error);
      res.status(500).json({ error: 'Error getting influencer posts by influencer' });
    }
  }

  async getInfluencerPostsByCampaignAndInfluencer(req: Request, res: Response) {
    try {
      const { campaignId, influencerId } = req.params;
      const influencerPosts = await this.influencerPostService.getInfluencerPostsByCampaignAndInfluencer(campaignId, influencerId);
      res.json(influencerPosts);
    } catch (error) {
      console.error('Error getting influencer posts by campaign and influencer:', error);
      res.status(500).json({ error: 'Error getting influencer posts by campaign and influencer' });
    }
  }

  async updateInfluencerPost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const influencerPost = await this.influencerPostService.updateInfluencerPost(id, updateData);
      res.json(influencerPost);
    } catch (error) {
      console.error('Error updating influencer post:', error);
      res.status(500).json({ error: 'Error updating influencer post' });
    }
  }

  async deleteInfluencerPost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.influencerPostService.deleteInfluencerPost(id);
      res.json({ message: 'Influencer post deleted successfully' });
    } catch (error) {
      console.error('Error deleting influencer post:', error);
      res.status(500).json({ error: 'Error deleting influencer post' });
    }
  }

  async getInfluencerPostsByPlatform(req: Request, res: Response) {
    try {
      const { platform } = req.params;
      const influencerPosts = await this.influencerPostService.getInfluencerPostsByPlatform(platform);
      res.json(influencerPosts);
    } catch (error) {
      console.error('Error getting influencer posts by platform:', error);
      res.status(500).json({ error: 'Error getting influencer posts by platform' });
    }
  }

  async getInfluencerPostsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      const influencerPosts = await this.influencerPostService.getInfluencerPostsByDateRange(start, end);
      res.json(influencerPosts);
    } catch (error) {
      console.error('Error getting influencer posts by date range:', error);
      res.status(500).json({ error: 'Error getting influencer posts by date range' });
    }
  }

  async getInfluencerPostsWithMetrics(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const influencerPosts = await this.influencerPostService.getInfluencerPostsWithMetrics(campaignId);
      res.json(influencerPosts);
    } catch (error) {
      console.error('Error getting influencer posts with metrics:', error);
      res.status(500).json({ error: 'Error getting influencer posts with metrics' });
    }
  }

  /**
   * Extrae métricas de CreatorDB después de completar el scraping exitosamente
   */
  private extractPostMetricsAfterScraping(postId: string, postUrl: string, platform: string): void {
    
    // Ejecutar en segundo plano con un delay para no interferir con el scraping
    setTimeout(async () => {
      try {

        const result = await this.postMetricsService.extractAndSaveMetrics(postId, postUrl, platform);
        

        
        if (result.success) {
        } else {
          // Verificar si es un error esperado (post no encontrado en CreatorDB)
          if (String(result.error).includes('No user found with post') || 
              String(result.error).includes('not found') || 
              String(result.error).includes('403')) {
          } else {
            console.error(`❌ [METRICS-EXTRACTION] Error extrayendo métricas para post ${postId}:`, result.error);
          }
        }
        
      } catch (error) {
        console.error(`❌ [METRICS-EXTRACTION] Error crítico extrayendo métricas para post ${postId}:`, error);
        console.error(`🔍 [METRICS-EXTRACTION] Detalles del error:`, {
          postId,
          postUrl,
          platform,
          errorMessage: error instanceof Error ? error.message : 'Error desconocido',
          errorStack: error instanceof Error ? error.stack : undefined
        });
      }
    }, 5000); // Esperar 5 segundos después del scraping para evitar conflictos
  }
} 
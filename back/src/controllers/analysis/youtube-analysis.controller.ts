import { Request, Response } from 'express';
import { YouTubeAnalysisService } from '../../services/analysis/youtube-analysis.service';
import { InstagramAnalysisService } from '../../services/analysis/instagram-analysis.service';

export class YouTubeAnalysisController {
  private youtubeAnalysisService: YouTubeAnalysisService;
  private instagramAnalysisService: InstagramAnalysisService;

  constructor() {
    this.youtubeAnalysisService = new YouTubeAnalysisService();
    this.instagramAnalysisService = new InstagramAnalysisService();
  }

  /**
   * Endpoint unificado para analizar posts de YouTube, TikTok y Twitter
   */
  async analyzePost(req: Request, res: Response) {
    try {
      const { postUrl } = req.body;

      if (!postUrl) {
        return res.status(400).json({
          error: 'URL del post es requerida'
        });
      }

      // Detectar plataforma
      const isYouTubeUrl = /(?:youtube\.com|youtu\.be)/.test(postUrl);
      const isTikTokUrl = /(?:tiktok\.com|vm\.tiktok\.com)/.test(postUrl);
      const isTwitterUrl = /(?:twitter\.com|x\.com)/.test(postUrl);
      const isInstagramUrl = /(?:instagram\.com)/.test(postUrl);
      
      if (!isYouTubeUrl && !isTikTokUrl && !isTwitterUrl && !isInstagramUrl) {
        return res.status(400).json({
          error: 'La URL debe ser de YouTube, TikTok, Twitter/X o Instagram'
        });
      }

      const platform = isYouTubeUrl ? 'YouTube' : isTikTokUrl ? 'TikTok' : isTwitterUrl ? 'Twitter/X' : 'Instagram';
      const startTime = Date.now();

      // Usar el servicio apropiado según la plataforma
      let analysis;
      if (isInstagramUrl) {
        analysis = await this.instagramAnalysisService.analyzeInstagramPost(postUrl);
      } else {
        // Usar el método unificado para YouTube, TikTok y Twitter
        analysis = await this.youtubeAnalysisService.analyzePost(postUrl);
      }
      
      const totalTime = Date.now() - startTime;

      res.json({
        success: true,
        data: analysis
      });

    } catch (error: any) {
      console.error('❌ Error en análisis unificado:', error);
      
      res.status(500).json({
        error: 'Error al analizar el post',
        details: error.message
      });
    }
  }

  async analyzeYouTubePost(req: Request, res: Response) {
    try {
      const { postUrl } = req.body;

      if (!postUrl) {
        return res.status(400).json({
          error: 'URL del post es requerida'
        });
      }

      // Verificar que sea una URL de YouTube
      const isYouTubeUrl = /(?:youtube\.com|youtu\.be)/.test(postUrl);
      if (!isYouTubeUrl) {
        return res.status(400).json({
          error: 'La URL debe ser de YouTube'
        });
      }

      const startTime = Date.now();

      // Usar el método optimizado que devuelve solo una muestra de comentarios
      const analysis = await this.youtubeAnalysisService.analyzeYouTubeVideo(postUrl);
      
      const totalTime = Date.now() - startTime;

      // Convertir a formato legacy para compatibilidad con el frontend
      const legacyResponse = {
        videoId: analysis.videoId,
        videoTitle: analysis.videoTitle,
        totalComments: analysis.totalComments,
        analyzedComments: analysis.analyzedComments,
        comments: analysis.comments, // Solo la muestra optimizada
        sentimentSummary: analysis.sentimentSummary,
        platform: analysis.platform,
        // Agregar estadísticas adicionales para debugging
        _meta: {
          processingStats: analysis.processingStats,
          sampleSize: analysis.comments.length,
          totalProcessingTime: totalTime
        }
      };

      res.json({
        success: true,
        data: legacyResponse
      });

    } catch (error: any) {
      console.error('❌ Error en análisis optimizado:', error);
      
      res.status(500).json({
        error: 'Error al analizar el video de YouTube',
        details: error.message
      });
    }
  }

  async getAnalysisStatus(req: Request, res: Response) {
    try {
      // Endpoint para verificar el estado del servicio con información de rendimiento
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      res.json({
        success: true,
        status: 'active',
        services: {
          youtube: 'active',
          tiktok: 'active (Apify)',
          twitter: 'active (Apify)',
          instagram: 'active (Apify)',
          sentiment: 'active (RoBERTa + VADER AI)',
          optimization: 'enabled'
        },
        performance: {
          uptime: `${Math.floor(uptime / 60)} minutos`,
          memoryUsage: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
          }
        },
        limits: {
          maxCommentsPerAnalysis: 10000,
          sampleSizeForUI: 200,
          batchSize: 200
        },
        platforms: {
          youtube: 'Soporte completo con YouTube Data API v3',
          tiktok: 'Soporte completo con Apify Actor JBefhs9roQqoTQXHv',
          twitter: 'Soporte completo con Apify Actor aLoAjAhdEpacDuwjr',
          instagram: 'Soporte completo con Apify Instagram Comments Scraper'
        }
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al verificar el estado del servicio',
        details: error.message
      });
    }
  }
} 
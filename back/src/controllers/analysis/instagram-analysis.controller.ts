import { Request, Response } from 'express';
import { InstagramAnalysisService } from '../../services/analysis/instagram-analysis.service';

export class InstagramAnalysisController {
  private instagramAnalysisService: InstagramAnalysisService;

  constructor() {
    this.instagramAnalysisService = new InstagramAnalysisService();
  }

  /**
   * Endpoint para analizar posts de Instagram
   */
  async analyzeInstagramPost(req: Request, res: Response) {
    try {
      const { postUrl } = req.body;

      if (!postUrl) {
        return res.status(400).json({
          error: 'URL del post es requerida'
        });
      }

      // Verificar que sea una URL de Instagram
      const isInstagramUrl = /(?:instagram\.com)/.test(postUrl);
      if (!isInstagramUrl) {
        return res.status(400).json({
          error: 'La URL debe ser de Instagram'
        });
      }

      const startTime = Date.now();

      // Usar el método optimizado que devuelve solo una muestra de comentarios
      const analysis = await this.instagramAnalysisService.analyzeInstagramPost(postUrl);
      
      const totalTime = Date.now() - startTime;

      // Convertir a formato legacy para compatibilidad con el frontend
      const legacyResponse = {
        postId: analysis.postId,
        postUrl: analysis.postUrl,
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
      console.error('❌ Error en análisis de Instagram:', error);
      
      res.status(500).json({
        error: 'Error al analizar el post de Instagram',
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
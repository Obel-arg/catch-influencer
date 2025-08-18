import { Request, Response } from 'express';
import { PostMetricsService } from '../../services/post-metrics/post-metrics.service';
import { PostTopicsService } from '../../services/post-topics.service';

export class CleanupController {
  private static instance: CleanupController;
  private postMetricsService: PostMetricsService;
  private postTopicsService: PostTopicsService;

  private constructor() {
    this.postMetricsService = new PostMetricsService();
    this.postTopicsService = PostTopicsService.getInstance();
  }

  public static getInstance(): CleanupController {
    if (!CleanupController.instance) {
      CleanupController.instance = new CleanupController();
    }
    return CleanupController.instance;
  }

  /**
   * Limpia duplicados en post_metrics
   */
  async cleanupMetrics(req: Request, res: Response) {
    try {
      
      const result = await this.postMetricsService.cleanupDuplicateMetrics();
      
      res.json({
        success: true,
        message: 'Metrics cleanup completed',
        data: result
      });
    } catch (error) {
      console.error('❌ [ADMIN-CLEANUP] Error in metrics cleanup:', error);
      res.status(500).json({
        success: false,
        error: 'Error during metrics cleanup',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Limpia duplicados en post_topics
   */
  async cleanupTopics(req: Request, res: Response) {
    try {
      
      const result = await this.postTopicsService.cleanupDuplicateTopics();
      
      res.json({
        success: true,
        message: 'Topics cleanup completed',
        data: result
      });
    } catch (error) {
      console.error('❌ [ADMIN-CLEANUP] Error in topics cleanup:', error);
      res.status(500).json({
        success: false,
        error: 'Error during topics cleanup',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Limpia duplicados en ambas tablas
   */
  async cleanupAll(req: Request, res: Response) {
    try {
      
      const [metricsResult, topicsResult] = await Promise.all([
        this.postMetricsService.cleanupDuplicateMetrics(),
        this.postTopicsService.cleanupDuplicateTopics()
      ]);
      
      const totalCleaned = metricsResult.cleanedPosts + topicsResult.cleanedPosts;
      const totalErrors = metricsResult.errors.length + topicsResult.errors.length;
      
      res.json({
        success: true,
        message: 'Full cleanup completed',
        data: {
          metrics: metricsResult,
          topics: topicsResult,
          summary: {
            totalCleaned,
            totalErrors,
            hasDuplicates: totalCleaned > 0
          }
        }
      });
    } catch (error) {
      console.error('❌ [ADMIN-CLEANUP] Error in full cleanup:', error);
      res.status(500).json({
        success: false,
        error: 'Error during full cleanup',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtiene estadísticas de duplicados sin limpiar
   */
  async getDuplicateStats(req: Request, res: Response) {
    try {
      
      // Obtener estadísticas de duplicados sin limpiar
      const supabase = require('../../config/supabase').default;
      
      // Contar posts con múltiples métricas
      const { data: metricsDuplicates, error: metricsError } = await supabase
        .from('post_metrics')
        .select('post_id')
        .group('post_id')
        .having('count(*)', 'gt', 1);

      // Contar posts con múltiples temas
      const { data: topicsDuplicates, error: topicsError } = await supabase
        .from('post_topics')
        .select('post_id')
        .group('post_id')
        .having('count(*)', 'gt', 1);

      if (metricsError || topicsError) {
        throw new Error(`Database error: ${metricsError?.message || topicsError?.message}`);
      }

      const stats = {
        metrics: {
          duplicatePosts: metricsDuplicates?.length || 0,
          totalRecords: 0
        },
        topics: {
          duplicatePosts: topicsDuplicates?.length || 0,
          totalRecords: 0
        }
      };

      // Obtener totales si hay duplicados
      if (stats.metrics.duplicatePosts > 0) {
        const { count } = await supabase
          .from('post_metrics')
          .select('*', { count: 'exact', head: true });
        stats.metrics.totalRecords = count || 0;
      }

      if (stats.topics.duplicatePosts > 0) {
        const { count } = await supabase
          .from('post_topics')
          .select('*', { count: 'exact', head: true });
        stats.topics.totalRecords = count || 0;
      }

      res.json({
        success: true,
        message: 'Duplicate statistics retrieved',
        data: stats
      });
    } catch (error) {
      console.error('❌ [ADMIN-CLEANUP] Error getting duplicate stats:', error);
      res.status(500).json({
        success: false,
        error: 'Error getting duplicate statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 
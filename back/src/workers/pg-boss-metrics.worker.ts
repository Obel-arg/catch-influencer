import { pgBossQueueService } from '../lib/queue/pg-boss-queue.service';
import { PostMetricsService } from '../services/post-metrics/post-metrics.service';
import { postCommentsAnalysisService } from '../services/post-metrics/post-comments-analysis.service';

// Configuración del worker
const WORKER_CONFIG = {
  name: 'metrics-queue',
  concurrency: 2,
  retryLimit: 3,
  retryDelay: 5000,
  timeout: 300000, // 5 minutos
};

// Servicios
const postMetricsService = new PostMetricsService();

/**
 * Procesar job de métricas
 */
async function processMetricsJob(job: { id: string; data: any }): Promise<void> {
  const { postId, postUrl, platform } = job.data;
    
  try {
    // Extraer métricas básicas
    await postMetricsService.extractAndSaveMetrics(postId, postUrl, platform);
    
    
  } catch (error) {
    console.error(`❌ [PG-BOSS-METRICS] Job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Procesar análisis de comentarios
 */
async function processCommentsAnalysis(
  postId: string, 
  comments: any[], 
  platform: string
): Promise<void> {
  try {
    // Obtener análisis existente o crear uno nuevo
    let existingAnalysis = await postCommentsAnalysisService.getCommentsAnalysis(postId);
    
    if (!existingAnalysis) {
      existingAnalysis = {
        analysis_metadata: {
          analyzed_at: new Date().toISOString(),
          model_used: 'pg-boss-worker',
          processing_time_ms: 0,
          total_comments: 0,
          platform,
        }
      };
    }
    
    // Convertir comentarios al formato estándar
    const formattedComments = comments.map(comment => ({
      id: comment.id || comment.commentId,
      text: comment.text || comment.content,
      author: comment.author || comment.authorName,
      publishedAt: comment.publishedAt || comment.createdAt,
      likeCount: comment.likeCount || 0,
      replyCount: comment.replyCount || 0,
      platform: platform as 'youtube' | 'instagram' | 'tiktok',
      scrapedAt: new Date().toISOString(),
    }));
    
    // Actualizar análisis
    const updatedAnalysis = {
      ...existingAnalysis,
      comments: [...(existingAnalysis?.comments || []), ...formattedComments],
      analysis_metadata: {
        analyzed_at: new Date().toISOString(),
        model_used: 'pg-boss-worker',
        processing_time_ms: 0,
        total_comments: formattedComments.length,
        platform,
      }
    };
    
    await postCommentsAnalysisService.saveCommentsAnalysis(postId, updatedAnalysis);
    
    
  } catch (error) {
    console.error(`❌ [PG-BOSS-METRICS] Error processing comments for post ${postId}:`, error);
    throw error;
  }
}

/**
 * Inicializar y ejecutar el worker
 */
async function startMetricsWorker(): Promise<void> {
  try {
    
    // Inicializar el servicio de colas
    await pgBossQueueService.initialize();
    
    // Procesar cola de métricas
    await pgBossQueueService.processQueue(WORKER_CONFIG.name, processMetricsJob);
    
    
  } catch (error) {
    console.error('❌ [PG-BOSS-METRICS] Failed to start worker:', error);
    throw error;
  }
}

/**
 * Enviar job de métricas a la cola
 */
async function sendMetricsJob(postId: string, postUrl: string, platform: string): Promise<string> {
  try {
    const jobId = await pgBossQueueService.sendJob(WORKER_CONFIG.name, {
      postId,
      postUrl,
      platform,
    }, {
      priority: 1,
      retryLimit: WORKER_CONFIG.retryLimit,
      retryDelay: WORKER_CONFIG.retryDelay,
    });
    
    return jobId;
    
  } catch (error) {
    console.error(`❌ [PG-BOSS-METRICS] Failed to send metrics job:`, error);
    throw error;
  }
}

/**
 * Obtener estadísticas de la cola
 */
async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  try {
    return await pgBossQueueService.getQueueStats(WORKER_CONFIG.name);
  } catch (error) {
    console.error(`❌ [PG-BOSS-METRICS] Failed to get queue stats:`, error);
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    };
  }
}

/**
 * Detener el worker
 */
async function stopMetricsWorker(): Promise<void> {
  try {
    await pgBossQueueService.stop();
  } catch (error) {
    console.error('❌ [PG-BOSS-METRICS] Error stopping worker:', error);
    throw error;
  }
}

// Exportar funciones
export {
  startMetricsWorker,
  sendMetricsJob,
  getQueueStats,
  stopMetricsWorker,
  processMetricsJob,
};

// Ejecutar si es el archivo principal
if (require.main === module) {
  startMetricsWorker().catch(error => {
    console.error('❌ [PG-BOSS-METRICS] Worker failed to start:', error);
    process.exit(1);
  });
} 
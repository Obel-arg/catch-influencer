import { postgresQueueService } from '../services/queues/postgres-queue.service';
import { createClient } from '@supabase/supabase-js';
import config from '../config/environment';

// Configuración de Supabase
const supabase = createClient(config.supabase.url!, config.supabase.serviceKey!);

interface MissingMetricsJob {
  id: string;
  data: {
    postId: string;
    influencerId: string;
    platform: string;
    postUrl?: string;
    createdAt: string;
  };
  timestamp: number;
}

interface MissingMetricsResult {
  postId: string;
  influencerId: string;
  platform: string;
  postUrl?: string;
  createdAt: string;
  timeSinceCreation: number; // minutos
  status: 'missing_metrics' | 'processing' | 'error';
  error?: string;
}

interface InfluencerPost {
  id: string;
  influencer_id: string;
  platform: string;
  post_url?: string;
  created_at: string;
}

export class MissingMetricsWorker {
  private static instance: MissingMetricsWorker;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastCheck: Date | null = null;
  private processedCount = 0;
  private errorCount = 0;

  private constructor() {}

  static getInstance(): MissingMetricsWorker {
    if (!MissingMetricsWorker.instance) {
      MissingMetricsWorker.instance = new MissingMetricsWorker();
    }
    return MissingMetricsWorker.instance;
  }

  // Iniciar el worker
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Ejecutar inmediatamente la primera verificación
    await this.checkMissingMetrics();

    // Programar verificación cada 30 minutos
    this.intervalId = setInterval(async () => {
      await this.checkMissingMetrics();
    }, 30 * 60 * 1000); // 30 minutos

  }

  // Detener el worker
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

  }

  // Verificar posts sin métricas
  private async checkMissingMetrics(): Promise<void> {
    try {
      this.lastCheck = new Date();

      const missingPosts = await this.findMissingMetricsPosts();
      
      if (missingPosts.length === 0) {
        return;
      }


      // Procesar cada post faltante
      for (const post of missingPosts) {
        await this.processMissingMetricsPost(post);
      }

      this.processedCount += missingPosts.length;

    } catch (error) {
      this.errorCount++;
      console.error('❌ [MISSING_METRICS_WORKER] Error checking missing metrics:', error);
    }
  }

  // Buscar posts sin métricas
  private async findMissingMetricsPosts(): Promise<MissingMetricsResult[]> {
    try {
      const cutoffTime = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      // Usar una consulta SQL directa para evitar problemas con arrays grandes
      const { data: missingPosts, error } = await supabase
        .rpc('find_posts_without_metrics', {
          cutoff_time: cutoffTime
        });

      if (error) {
        // Si la función RPC no existe, usar consulta alternativa
       
        return await this.findMissingMetricsPostsAlternative();
      }


      return missingPosts.map((post: any) => ({
        postId: post.id,
        influencerId: post.influencer_id,
        platform: post.platform,
        postUrl: post.post_url,
        createdAt: post.created_at,
        timeSinceCreation: Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60)),
        status: 'missing_metrics' as const
      }));

    } catch (error) {
      console.error('❌ [MISSING_METRICS_WORKER] Error finding missing metrics posts:', error);
      throw error;
    }
  }

  // Método alternativo usando consulta directa
  private async findMissingMetricsPostsAlternative(): Promise<MissingMetricsResult[]> {
    try {
      // Obtener posts recientes sin métricas usando una consulta más simple
      const { data: missingPosts, error } = await supabase
        .from('influencer_posts')
        .select(`
          id,
          influencer_id,
          platform,
          post_url,
          created_at
        `)
        .is('deleted_at', null)
        .lt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // 10+ minutos atrás
        .limit(50); // Limitar para evitar problemas de rendimiento

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Filtrar posts que no tienen métricas
      const postsWithoutMetrics: MissingMetricsResult[] = [];
      for (const post of missingPosts as InfluencerPost[]) {
        const { data: metrics, error: metricsError } = await supabase
          .from('post_metrics')
          .select('id')
          .eq('post_id', post.id)
          .limit(1);

        if (metricsError) {
          console.warn(`⚠️ [MISSING_METRICS_WORKER] Error checking metrics for post ${post.id}:`, metricsError);
          continue;
        }

        if (!metrics || metrics.length === 0) {
          postsWithoutMetrics.push({
            postId: post.id,
            influencerId: post.influencer_id,
            platform: post.platform,
            postUrl: post.post_url,
            createdAt: post.created_at,
            timeSinceCreation: Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60)),
            status: 'missing_metrics' as const
          });
        }
      }

      return postsWithoutMetrics;

    } catch (error) {
      console.error('❌ [MISSING_METRICS_WORKER] Error in alternative query:', error);
      throw error;
    }
  }

  // Procesar un post sin métricas
  private async processMissingMetricsPost(post: MissingMetricsResult): Promise<void> {
    try {

      // Intentar re-procesar las métricas
      await this.triggerMetricsProcessing(post);

      // Registrar el evento
      await this.logMissingMetricsEvent(post);


    } catch (error) {
      console.error(`❌ [MISSING_METRICS_WORKER] Error processing post ${post.postId}:`, error);
      
      // Registrar el error
      await this.logMissingMetricsEvent({
        ...post,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Disparar el procesamiento de métricas
  private async triggerMetricsProcessing(post: MissingMetricsResult): Promise<void> {
    try {
      // Agregar job a la cola de métricas
      const jobData = {
        postId: post.postId,
        influencerId: post.influencerId,
        platform: post.platform,
        postUrl: post.postUrl,
        priority: 'high',
        retryCount: 0,
        source: 'missing_metrics_worker'
      };

      // Usar PostgreSQL para agregar a la cola
      await postgresQueueService.send('metrics_queue', jobData);
      

    } catch (error) {
      console.error(`❌ [MISSING_METRICS_WORKER] Error triggering metrics processing for post ${post.postId}:`, error);
      throw error;
    }
  }

  // Registrar evento de métricas faltantes
  private async logMissingMetricsEvent(post: MissingMetricsResult): Promise<void> {
    try {
      const eventData = {
        post_id: post.postId,
        influencer_id: post.influencerId,
        platform: post.platform,
        post_url: post.postUrl,
        created_at: post.createdAt,
        time_since_creation_minutes: post.timeSinceCreation,
        status: post.status,
        error: post.error,
        detected_at: new Date().toISOString(),
        worker_name: 'missing_metrics_worker'
      };

      // Insertar en tabla de logs (crear si no existe)
      const { error } = await supabase
        .from('worker_logs')
        .insert(eventData);

      if (error) {
        console.warn(`⚠️ [MISSING_METRICS_WORKER] Could not log event: ${error.message}`);
      }

    } catch (error) {
      console.warn(`⚠️ [MISSING_METRICS_WORKER] Error logging event:`, error);
    }
  }

  // Obtener estadísticas del worker
  getStats() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      processedCount: this.processedCount,
      errorCount: this.errorCount,
      nextCheck: this.intervalId ? new Date(Date.now() + 30 * 60 * 1000) : null
    };
  }

  // Verificar estado del worker
  isHealthy(): boolean {
    return this.isRunning && this.errorCount < 10;
  }
}

// Función para procesar job individual (para compatibilidad con el sistema de workers)
export async function processMissingMetricsJob(job: MissingMetricsJob): Promise<void> {
  const worker = MissingMetricsWorker.getInstance();
  
  try {
    
    // Buscar posts sin métricas
    const missingPosts = await worker['findMissingMetricsPosts']();
    
    // Procesar cada post
    for (const post of missingPosts) {
      await worker['processMissingMetricsPost'](post);
    }
    
    
  } catch (error) {
    console.error(`❌ [MISSING_METRICS_WORKER] Job ${job.id} failed:`, error);
    throw error;
  }
} 
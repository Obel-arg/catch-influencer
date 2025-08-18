import { PostgresQueueService } from '../../services/queues/postgres-queue.service';

export class DeadLetterManager {
  private static instance: DeadLetterManager;
  private queueService = PostgresQueueService.getInstance();

  static getInstance(): DeadLetterManager {
    if (!DeadLetterManager.instance) {
      DeadLetterManager.instance = new DeadLetterManager();
    }
    return DeadLetterManager.instance;
  }

  /**
   * Analizar jobs problemáticos y tomar acciones correctivas
   */
  async analyzeAndFixStuckJobs(): Promise<{
    stuckJobsFound: number;
    stuckJobsFixed: number;
    failedJobsRetried: number;
    errors: string[];
  }> {
    const result = {
      stuckJobsFound: 0,
      stuckJobsFixed: 0,
      failedJobsRetried: 0,
      errors: [] as string[]
    };

    try {
      const allQueues = await this.queueService.getQueues();
      
      for (const queueName of allQueues) {
        try {
          // 1. RESET TODOS LOS JOBS FALLIDOS (sin importar intentos)
          const failedJobs = await this.queueService.getFailedJobs(queueName, 1000);
          result.stuckJobsFound += failedJobs.length;
          
          if (failedJobs.length > 0) {
            
            for (const job of failedJobs) {
              try {
                await this.queueService.restartJob(job.id);
                result.failedJobsRetried++;
              } catch (restartError) {
                console.error(`❌ [DLQ_MANAGER] Error restarting job ${job.id}:`, restartError);
                result.errors.push(`Error restarting job ${job.id}: ${restartError}`);
              }
            }
          }
          
          // 2. RESET JOBS COLGADOS EN PROCESSING (más de 1 minuto)
          const stuckJobs = await this.queueService.getStuckJobs(queueName, 1); // 1 minuto
          result.stuckJobsFound += stuckJobs.length;
          
          if (stuckJobs.length > 0) {
            
            for (const job of stuckJobs) {
              try {
                await this.queueService.restartJob(job.id);
                result.stuckJobsFixed++;
              } catch (resetError) {
                console.error(`❌ [DLQ_MANAGER] Error resetting stuck job ${job.id}:`, resetError);
                result.errors.push(`Error resetting stuck job ${job.id}: ${resetError}`);
              }
            }
          }
          
        } catch (queueError) {
          const errorMsg = `Error processing queue ${queueName}: ${queueError}`;
          console.error(`❌ [DLQ_MANAGER] ${errorMsg}`);
          result.errors.push(errorMsg);
        }
      }
      
    } catch (error) {
      const errorMsg = `Error in analyzeAndFixStuckJobs: ${error}`;
      console.error(`❌ [DLQ_MANAGER] ${errorMsg}`);
      result.errors.push(errorMsg);
    }

    return result;
  }

  /**
   * Obtener estadísticas de jobs problemáticos
   */
  async getProblematicJobsStats(): Promise<{
    totalStuckJobs: number;
    totalFailedJobs: number;
    totalJobsNeedingRetry: number;
    queueStats: Record<string, {
      stuck: number;
      failed: number;
      needsRetry: number;
    }>;
  }> {
    const stats = {
      totalStuckJobs: 0,
      totalFailedJobs: 0,
      totalJobsNeedingRetry: 0,
      queueStats: {} as Record<string, {
        stuck: number;
        failed: number;
        needsRetry: number;
      }>
    };

    try {
      const allQueues = await this.queueService.getQueues();
      
      for (const queueName of allQueues) {
        try {
          const stuckJobs = await this.queueService.getStuckJobs(queueName, 5);
          const failedJobs = await this.queueService.getFailedJobs(queueName, 1000);
          const jobsNeedingRetry = await this.queueService.getJobsNeedingRetry(queueName);
          
          stats.queueStats[queueName] = {
            stuck: stuckJobs.length,
            failed: failedJobs.length,
            needsRetry: jobsNeedingRetry.length
          };
          
          stats.totalStuckJobs += stuckJobs.length;
          stats.totalFailedJobs += failedJobs.length;
          stats.totalJobsNeedingRetry += jobsNeedingRetry.length;
          
        } catch (queueError) {
          console.error(`❌ [DLQ_MANAGER] Error getting stats for queue ${queueName}:`, queueError);
        }
      }
      
    } catch (error) {
      console.error(`❌ [DLQ_MANAGER] Error getting problematic jobs stats:`, error);
    }

    return stats;
  }

  /**
   * Iniciar auto-retry de jobs fallidos
   */
  async startAutoRetry(): Promise<void> {
    
    // Ejecutar análisis inicial
    await this.analyzeAndFixStuckJobs();
    
    // Configurar intervalo para auto-retry (cada 2 minutos)
    setInterval(async () => {
      try {
        await this.analyzeAndFixStuckJobs();
      } catch (error) {
        console.error('❌ [DLQ_MANAGER] Error in auto-retry interval:', error);
      }
    }, 2 * 60 * 1000);
  }

  /**
   * Detener auto-retry
   */
  stopAutoRetry(): void {
    
    // Los intervalos se limpiarán en el graceful shutdown
  }
}
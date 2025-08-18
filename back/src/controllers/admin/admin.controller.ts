import { Request, Response } from 'express';
import { postgresQueueService } from '../../services/queues/postgres-queue.service';
import { MissingMetricsWorker } from '../../workers/missing-metrics.worker';
import { WorkerAutoScaler } from '../../workers/auto-scaler';
import { WorkerFactory } from '../../workers/worker-factory';
import { DEFAULT_METRICS_CONFIG, DEFAULT_SENTIMENT_CONFIG, DEFAULT_COMMENT_FETCH_CONFIG } from '../../workers/config/worker-config';
import { processMetricsJob } from '../../workers/metrics.worker';
import { processSentimentJob } from '../../workers/sentiment.worker';
import { processCommentFetchJob } from '../../workers/comment-fetch.worker';

// Funciones auxiliares para información de jobs
function getEstimatedDuration(jobName: string, jobData: any): string {
  switch (jobName) {
    case 'metrics':
      return '30-60 segundos';
    case 'sentiment':
      return '10-30 segundos';
    case 'comment-fetch':
      return '15-45 segundos';
    default:
      return 'Desconocido';
  }
}

function getPriorityLevel(priority: number): 'Alta' | 'Media' | 'Baja' {
  if (priority >= 10) return 'Alta';
  if (priority >= 5) return 'Media';
  return 'Baja';
}

// Sistema de gestión de workers unificado
interface WorkerInstance {
  name: string;
  worker: any;
  status: 'running' | 'stopped' | 'restarting';
  lastRestart?: Date;
}

class WorkerManager {
  private workers = new Map<string, WorkerInstance>();
  private stoppedWorkers = new Set<string>(); // Track workers that were explicitly stopped
  private workerFactory = WorkerFactory.getInstance();

  constructor() {
    // No necesitamos factories separadas, usamos el WorkerFactory unificado
  }

  async getWorker(name: string): Promise<WorkerInstance | null> {
    // Si ya tenemos el worker registrado, retornarlo
    const existing = this.workers.get(name);
    if (existing) {
      return existing;
    }
    
    // Si el worker fue explícitamente detenido, no recrearlo automáticamente
    if (this.stoppedWorkers.has(name)) {
      return null;
    }
    
    // Si no está registrado y no fue detenido explícitamente, intentar obtenerlo del WorkerFactory
    try {
      const configs = {
        'metrics': DEFAULT_METRICS_CONFIG,
        'sentiment': DEFAULT_SENTIMENT_CONFIG,
        'comment-fetch': DEFAULT_COMMENT_FETCH_CONFIG
      };
      
      const processors = {
        'metrics': processMetricsJob,
        'sentiment': processSentimentJob,
        'comment-fetch': processCommentFetchJob
      };
      
      const config = configs[name as keyof typeof configs];
      const processor = processors[name as keyof typeof processors];
      
      if (config && processor) {
        const worker = await this.workerFactory.initializeWorker(name, config, processor);
        if (worker) {
          const workerInstance: WorkerInstance = {
            name,
            worker,
            status: 'running'
          };
          this.workers.set(name, workerInstance);
          return workerInstance;
        }
      }
    } catch (error) {
      console.error(`❌ Error getting worker ${name} from WorkerFactory:`, error);
    }
    
    return null;
  }

  async getAllWorkers(): Promise<WorkerInstance[]> {
    return Array.from(this.workers.values());
  }

  async startWorker(name: string): Promise<boolean> {
    try {
      const configs = {
        'metrics': DEFAULT_METRICS_CONFIG,
        'sentiment': DEFAULT_SENTIMENT_CONFIG,
        'comment-fetch': DEFAULT_COMMENT_FETCH_CONFIG
      };
      
      const processors = {
        'metrics': processMetricsJob,
        'sentiment': processSentimentJob,
        'comment-fetch': processCommentFetchJob
      };
      
      const config = configs[name as keyof typeof configs];
      const processor = processors[name as keyof typeof processors];
      
      if (!config || !processor) {
        throw new Error(`Worker configuration not found for ${name}`);
      }

      // Detener worker existente si está corriendo
      const existing = this.workers.get(name);
      if (existing && existing.status === 'running') {
        await this.stopWorker(name);
        // Esperar un momento para asegurar que se detenga completamente
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Remover de la lista de workers detenidos explícitamente
      this.stoppedWorkers.delete(name);
      
      // Crear nuevo worker usando WorkerFactory
      const worker = await this.workerFactory.initializeWorker(name, config, processor);
      
      // Verificar que el worker se creó correctamente
      if (!worker) {
        throw new Error(`Failed to create worker instance for ${name} - worker is undefined after initialization`);
      }

      const workerInstance: WorkerInstance = {
        name,
        worker,
        status: 'running'
      };

      this.workers.set(name, workerInstance);
      return true;
    } catch (error) {
      console.error(`❌ Error starting worker ${name}:`, error);
      return false;
    }
  }

  async stopWorker(name: string): Promise<boolean> {
    try {
      const workerInstance = this.workers.get(name);
      if (!workerInstance) {
        console.warn(`⚠️ Worker ${name} not found in workers map`);
        // Si no está en el mapa pero tampoco en stoppedWorkers, marcarlo como detenido
        if (!this.stoppedWorkers.has(name)) {
          this.stoppedWorkers.add(name);
        }
        return true;
      }

      workerInstance.status = 'stopped';
      
      try {
        // Usar el WorkerFactory para cerrar el worker
        await this.workerFactory.reinitializeWorker(name, {}, async () => {});
      } catch (closeError) {
        console.warn(`⚠️ Error closing worker ${name}:`, closeError);
        // Aún marcamos como detenido aunque falle el cierre
      }
      
      // Remover el worker del mapa y marcarlo como detenido explícitamente
      this.workers.delete(name);
      this.stoppedWorkers.add(name);
      
      return true;
    } catch (error) {
      console.error(`❌ Error stopping worker ${name}:`, error);
      return false;
    }
  }

  async restartWorker(name: string): Promise<boolean> {
    try {
      const workerInstance = this.workers.get(name);
      if (!workerInstance) {
        // Si no existe, intentar crearlo
        return await this.startWorker(name);
      }

      workerInstance.status = 'restarting';
      workerInstance.lastRestart = new Date();

      // Detener worker actual
      await this.stopWorker(name);

      // Esperar un momento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Iniciar nuevo worker
      const success = await this.startWorker(name);
      
      if (success) {
        const newInstance = this.workers.get(name);
        if (newInstance) {
          newInstance.status = 'running';
        }
      }

      return success;
    } catch (error) {
      console.error(`❌ Error restarting worker ${name}:`, error);
      return false;
    }
  }

  async getWorkerStatus(name: string): Promise<'running' | 'stopped' | 'restarting' | 'unknown'> {
    // Si el worker fue explícitamente detenido, retornar 'stopped'
    if (this.stoppedWorkers.has(name)) {
      return 'stopped';
    }
    
    const workerInstance = await this.getWorker(name);
    return workerInstance ? workerInstance.status : 'unknown';
  }

  // Método para forzar la inicialización de un worker
  async forceInitializeWorker(name: string): Promise<boolean> {
    try {
      // Remover worker existente si existe
      this.workers.delete(name);
      
      // Remover de la lista de workers detenidos explícitamente
      this.stoppedWorkers.delete(name);
      
      // Intentar crear nuevo worker
      return await this.startWorker(name);
    } catch (error) {
      console.error(`❌ Error force initializing worker ${name}:`, error);
      return false;
    }
  }

  // Método para obtener información de debug del estado de los workers
  getDebugInfo() {
    return {
      activeWorkers: Array.from(this.workers.keys()),
      stoppedWorkers: Array.from(this.stoppedWorkers),
      workerStates: Array.from(this.workers.entries()).map(([name, instance]) => ({
        name,
        status: instance.status,
        hasWorker: !!instance.worker
      }))
    };
  }
}

// Instancia global del manager
const workerManager = new WorkerManager();

// Inicializar workers al arrancar (solo los esenciales)
async function initializeWorkers() {
  // Solo inicializar workers esenciales por defecto
  const essentialWorkers = ['metrics', 'comment-fetch'];
  
  for (const workerName of essentialWorkers) {
    try {
      await workerManager.startWorker(workerName);
    } catch (error) {
      console.error(`❌ Failed to initialize worker ${workerName}:`, error);
    }
  }
  
  // Marcar sentiment como detenido por defecto ya que no se usa activamente
  workerManager['stoppedWorkers'].add('sentiment');
}

// Inicializar workers cuando se importa el módulo
initializeWorkers().catch(console.error);

export { initializeWorkers };

export class AdminController {
  
  // Obtener estado de todos los workers
  async getWorkersStatus(req: Request, res: Response) {
    try {
      const workers = [
        { name: 'metrics' },
        { name: 'sentiment' },
        { name: 'comment-fetch' }
      ];

      const workersStatus = await Promise.all(workers.map(async ({ name }) => {
        // Obtener datos reales de la cola
        let queueSize = 0;
        let processed = 0;
        let failed = 0;
        let workerStatus: 'running' | 'stopped' | 'restarting' | 'unknown' = 'unknown';
        let lastRestart = null;
        
        try {
          // Obtener estado del worker desde el WorkerManager
          const workerInstance = await workerManager.getWorker(name);
          if (workerInstance) {
            workerStatus = workerInstance.status;
            lastRestart = workerInstance.lastRestart?.toISOString() || null;
          } else {
            // Si no hay instancia, verificar si fue detenido explícitamente
            const workerStatusFromManager = await workerManager.getWorkerStatus(name);
            if (workerStatusFromManager === 'stopped') {
              workerStatus = 'stopped';
            }
          }
          
          // Usar PostgreSQL queue service para obtener estadísticas
          const queueName = name;
          const stats = await postgresQueueService.getQueueStats(queueName);
          
          queueSize = stats.pending + stats.processing;
          processed = stats.completed;
          failed = stats.failed;
          
          // Solo asumir que está corriendo si no tenemos estado y hay actividad reciente
          if (workerStatus === 'unknown' && (processed > 0 || queueSize > 0)) {
            workerStatus = 'running';
          }
          
        } catch (error) {
          console.error(`Error getting queue data for ${name}:`, error);
          queueSize = 0;
          processed = 0;
          failed = 0;
          workerStatus = 'unknown';
        }
        
        const isInfiniteLoop = processed > 1000 && failed === 0;
        
        return {
          name,
          status: workerStatus,
          processed,
          failed,
          successRate: processed > 0 
            ? ((processed / (processed + failed)) * 100)
            : 0,
          lastActivity: new Date().toLocaleString(),
          queueSize,
          isInfiniteLoop,
          lastRestart
        };
      }));

      res.json({ workers: workersStatus });
    } catch (error) {
      console.error('Error getting workers status:', error);
      res.status(500).json({ error: 'Error getting workers status' });
    }
  }

  // Obtener jobs completados
  async getCompletedJobs(req: Request, res: Response) {
    try {
      const { workerName } = req.params;
      const { limit = 50 } = req.query;
      
      const completedJobs = await postgresQueueService.getCompletedJobs(workerName, Number(limit));
      
      res.json({
        jobs: completedJobs.map((job: any) => ({
          id: job.id,
          name: job.name,
          data: job.data,
          timestamp: job.created_at,
          processedOn: job.started_at,
          finishedOn: job.completed_at,
          returnvalue: job.result
        }))
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Error fetching completed jobs', details: error?.message });
    }
  }

  // Obtener jobs fallidos
  async getFailedJobs(req: Request, res: Response) {
    try {
      const { workerName } = req.params;
      const { limit = 50 } = req.query;
      
      const failedJobs = await postgresQueueService.getFailedJobs(workerName, Number(limit));
      
      res.json({
        jobs: failedJobs.map((job: any) => ({
          id: job.id,
          name: job.name,
          data: JSON.parse(job.data),
          timestamp: job.created_at,
          processedOn: job.started_at,
          failedReason: job.error,
          attemptsMade: job.attempts
        }))
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Error fetching failed jobs', details: error?.message });
    }
  }

  // Controlar worker específico
  async controlWorker(req: Request, res: Response) {
    try {
      const { workerName, action } = req.params;
      
      let success = false;
      let message = '';

      switch (action) {
        case 'start':
          success = await workerManager.startWorker(workerName);
          message = success ? `Worker ${workerName} started successfully` : `Failed to start worker ${workerName}`;
          break;
          
        case 'stop':
          success = await workerManager.stopWorker(workerName);
          message = success ? `Worker ${workerName} stopped successfully` : `Failed to stop worker ${workerName}`;
          break;
          
        case 'restart':
          success = await workerManager.restartWorker(workerName);
          message = success ? `Worker ${workerName} restarted successfully` : `Failed to restart worker ${workerName}`;
          break;
          
        case 'force-init':
          success = await workerManager.forceInitializeWorker(workerName);
          message = success ? `Worker ${workerName} force initialized successfully` : `Failed to force initialize worker ${workerName}`;
          break;
          
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      res.json({ 
        success, 
        message,
        workerName,
        action,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error controlling worker ${req.params.workerName}:`, error);
      res.status(500).json({ error: 'Error controlling worker' });
    }
  }

  // Obtener logs del worker
  async getWorkerLogs(req: Request, res: Response) {
    try {
      const { workerName } = req.params;
      const { limit = 100 } = req.query;
      
      // Crear logs basados en el estado actual
      const logs = [];
      
      // Log del estado general del worker
      const workerInstance = await workerManager.getWorker(workerName);
      const workerStatus = await workerManager.getWorkerStatus(workerName);
      
      logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Worker ${workerName} status: ${workerStatus}`,
        data: { 
          status: workerStatus,
          hasInstance: !!workerInstance,
          lastRestart: workerInstance?.lastRestart?.toISOString()
        }
      });
      
      // Log de intento de control del worker
      if (workerInstance) {
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Worker ${workerName} instance found and managed`,
          data: { 
            workerType: typeof workerInstance.worker,
            hasWorker: !!workerInstance.worker
          }
        });
      } else {
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'warning',
          message: `Worker ${workerName} instance not found in manager`,
          data: { 
            suggestion: 'Try starting the worker first'
          }
        });
      }
      
      // Obtener jobs activos para información en tiempo real
      const activeJobs = await postgresQueueService.getActiveJobs(workerName);
      
      // Logs de jobs activos
      activeJobs.forEach((job: any) => {
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Processing job ${job.id} (${job.name})`,
          data: {
            jobId: job.id,
            jobName: job.name,
            attempts: job.attempts,
            data: JSON.parse(job.data)
          }
        });
      });
      
      // Logs de jobs recientemente completados
      const recentCompleted = await postgresQueueService.getCompletedJobs(workerName, 5);
      recentCompleted.forEach((job: any) => {
        logs.push({
          timestamp: job.completed_at ? new Date(job.completed_at).toISOString() : new Date().toISOString(),
          level: 'success',
          message: `Job ${job.id} completed successfully`,
          data: {
            jobId: job.id,
            jobName: job.name,
            processingTime: job.completed_at && job.started_at ? 
              new Date(job.completed_at).getTime() - new Date(job.started_at).getTime() : null
          }
        });
      });

      // Log de estadísticas de la cola
      try {
        const stats = await postgresQueueService.getQueueStats(workerName);
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Queue stats for ${workerName}`,
          data: {
            pending: stats.pending,
            processing: stats.processing,
            completed: stats.completed,
            failed: stats.failed,
            total: stats.total
          }
        });
      } catch (statsError) {
        logs.push({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Failed to get queue stats for ${workerName}`,
          data: { error: statsError instanceof Error ? statsError.message : 'Unknown error' }
        });
      }

      res.json({ logs: logs.slice(0, Number(limit)) });
    } catch (error) {
      console.error(`Error getting logs for worker ${req.params.workerName}:`, error);
      res.status(500).json({ error: 'Error getting worker logs' });
    }
  }

  // Limpiar cola del worker
  async clearWorkerQueue(req: Request, res: Response) {
    try {
      const { workerName } = req.params;
      
      const deletedCount = await postgresQueueService.clearQueue(workerName);
      res.json({ 
        message: `Queue cleared for worker ${workerName}`,
        deletedCount
      });
    } catch (error) {
      console.error(`Error clearing queue for worker ${req.params.workerName}:`, error);
      res.status(500).json({ error: 'Error clearing worker queue' });
    }
  }

  async forceTerminateJob(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      
      
      // Forzar la terminación del job sin importar su estado
      const result = await postgresQueueService.forceTerminateJob(jobId);
      
      res.json({
        success: true,
        message: `Job ${jobId} terminado forzadamente`,
        jobId,
        previousState: result.previousState,
        action: result.action
      });
      
    } catch (error: any) {
      console.error(`❌ [ADMIN] Error forzando terminación del job ${req.params.jobId}:`, error);
      res.status(500).json({ 
        success: false,
        error: 'Error forzando terminación del job',
        details: error?.message 
      });
    }
  }

  async restartJob(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      
      // Reiniciar el job
      const result = await postgresQueueService.restartJob(jobId);
      
      res.json({
        success: true,
        message: `Job ${jobId} reiniciado exitosamente`,
        jobId,
        previousState: result.previousState,
        action: result.action,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error(`❌ [ADMIN] Error reiniciando job ${req.params.jobId}:`, error);
      res.status(500).json({ 
        success: false,
        error: 'Error reiniciando job',
        details: error?.message 
      });
    }
  }

  async deleteFailedJob(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      
      
      // Eliminar el job fallido definitivamente
      await postgresQueueService.deleteJob(jobId);
      
      res.json({
        success: true,
        message: `Job fallido ${jobId} eliminado definitivamente`,
        jobId
      });
      
    } catch (error: any) {
      console.error(`❌ [ADMIN] Error eliminando job fallido ${req.params.jobId}:`, error);
      res.status(500).json({ 
        success: false,
        error: 'Error eliminando job fallido',
        details: error?.message 
      });
    }
  }

  async getWorkerQueue(req: Request, res: Response) {
    const { workerName } = req.params;
    try {
      // Obtener jobs en diferentes estados
      const pending = await postgresQueueService.getActiveJobs(workerName);
      const completed = await postgresQueueService.getCompletedJobs(workerName, 10);
      const failed = await postgresQueueService.getFailedJobs(workerName, 10);
      
      // Combinar todos los jobs con información detallada
      const allJobs = [
        ...pending.map((job: any) => ({ 
          ...job, 
          state: job.status,
          data: JSON.parse(job.data)
        })),
        ...completed.map((job: any) => ({ 
          ...job, 
          state: 'completed',
          data: JSON.parse(job.data)
        })),
        ...failed.map((job: any) => ({ 
          ...job, 
          state: 'failed',
          data: JSON.parse(job.data)
        }))
      ];
      
      // Obtener información adicional de la cola
      const queueStats = await postgresQueueService.getQueueStats(workerName);
      
      res.json({
        queue: allJobs.map((job: any) => ({
          id: job.id,
          name: job.name,
          data: job.data,
          timestamp: job.created_at,
          attemptsMade: job.attempts,
          state: job.state,
          processedOn: job.started_at,
          finishedOn: job.completed_at,
          failedReason: job.error,
          // Información adicional del job
          jobData: {
            postId: job.data?.postId,
            postUrl: job.data?.postUrl,
            platform: job.data?.platform,
            influencerId: job.data?.influencerId,
            campaignId: job.data?.campaignId,
            // Tiempo estimado de procesamiento basado en el tipo de job
            estimatedDuration: getEstimatedDuration(job.name, job.data),
            // Prioridad visual
            priorityLevel: getPriorityLevel(0)
          }
        })),
        queueStats: {
          total: queueStats.total,
          pending: queueStats.pending,
          processing: queueStats.processing,
          completed: queueStats.completed,
          failed: queueStats.failed
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Error fetching queue', details: error?.message });
    }
  }

  // Controlar Missing Metrics Worker
  async controlMissingMetricsWorker(req: Request, res: Response) {
    try {
      const { action } = req.params;
      const missingMetricsWorker = MissingMetricsWorker.getInstance();

      switch (action) {
        case 'start':
          await missingMetricsWorker.start();
          res.json({
            success: true,
            message: 'Missing Metrics Worker started successfully'
          });
          break;

        case 'stop':
          await missingMetricsWorker.stop();
          res.json({
            success: true,
            message: 'Missing Metrics Worker stopped successfully'
          });
          break;

        case 'restart':
          await missingMetricsWorker.stop();
          await missingMetricsWorker.start();
          res.json({
            success: true,
            message: 'Missing Metrics Worker restarted successfully'
          });
          break;

        default:
          res.status(400).json({
            success: false,
            error: 'Invalid action. Use: start, stop, restart'
          });
      }
    } catch (error) {
      console.error('❌ [ADMIN_CONTROLLER] Error controlling missing metrics worker:', error);
      res.status(500).json({
        success: false,
        error: 'Error controlling missing metrics worker'
      });
    }
  }

  // Obtener estado del Missing Metrics Worker
  async getMissingMetricsWorkerStatus(req: Request, res: Response) {
    try {
      const missingMetricsWorker = MissingMetricsWorker.getInstance();
      const stats = missingMetricsWorker.getStats();

      res.json({
        success: true,
        data: {
          name: 'missing-metrics',
          status: stats.isRunning ? 'running' : 'stopped',
          isHealthy: missingMetricsWorker.isHealthy(),
          lastCheck: stats.lastCheck,
          processedCount: stats.processedCount,
          errorCount: stats.errorCount,
          nextCheck: stats.nextCheck,
          uptime: stats.lastCheck ? Date.now() - stats.lastCheck.getTime() : 0
        }
      });
    } catch (error) {
      console.error('❌ [ADMIN_CONTROLLER] Error getting missing metrics worker status:', error);
      res.status(500).json({
        success: false,
        error: 'Error getting missing metrics worker status'
      });
    }
  }

  // Ejecutar verificación manual de métricas faltantes
  async triggerMissingMetricsCheck(req: Request, res: Response) {
    try {
      const missingMetricsWorker = MissingMetricsWorker.getInstance();
      
      // Ejecutar verificación manual
      await missingMetricsWorker['checkMissingMetrics']();
      
      res.json({
        success: true,
        message: 'Manual missing metrics check triggered successfully'
      });
    } catch (error) {
      console.error('❌ [ADMIN_CONTROLLER] Error triggering missing metrics check:', error);
      res.status(500).json({
        success: false,
        error: 'Error triggering missing metrics check'
      });
    }
  }

  /**
   * Obtiene información del auto-scaling
   */
  async getAutoScalingStatus(req: Request, res: Response) {
    try {
      const autoScaler = WorkerAutoScaler.getInstance();
      const status = autoScaler.getStatus();
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error obteniendo estado de auto-scaling:', error);
      res.status(500).json({ 
        error: 'Error al obtener estado de auto-scaling',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene historial de escalado
   */
  async getScalingHistory(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          history: [],
          message: 'Auto-scaling desactivado durante migración a PostgreSQL'
        }
      });
    } catch (error) {
      console.error('Error obteniendo historial de escalado:', error);
      res.status(500).json({ 
        error: 'Error al obtener historial de escalado',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Actualiza configuración de auto-scaling
   */
  async updateScalingConfig(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Auto-scaling desactivado durante migración a PostgreSQL'
      });
    } catch (error) {
      console.error('Error actualizando configuración de auto-scaling:', error);
      res.status(500).json({ 
        error: 'Error al actualizar configuración de auto-scaling',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener información de debug de los workers
  async getWorkersDebug(req: Request, res: Response) {
    try {
      const debugInfo = workerManager.getDebugInfo();
      
      res.json({
        success: true,
        data: debugInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting workers debug info:', error);
      res.status(500).json({ error: 'Error getting workers debug info' });
    }
  }

  // Verificar estado de salud de los workers
  async getWorkersHealth(req: Request, res: Response) {
    try {
      const workers = [
        { name: 'metrics' },
        { name: 'sentiment' },
        { name: 'comment-fetch' }
      ];

      const healthStatus = await Promise.all(workers.map(async ({ name }) => {
        const workerInstance = await workerManager.getWorker(name);
        const workerStatus = await workerManager.getWorkerStatus(name);
        
        // Verificar si el worker existe y tiene las propiedades necesarias
        const hasWorkerInstance = !!workerInstance;
        const hasWorker = !!workerInstance?.worker;
        const isRunning = workerStatus === 'running';
        
        // Diagnosticar problemas comunes
        const issues = [];
        if (!hasWorkerInstance) {
          issues.push('Worker instance not found in manager');
        }
        if (!hasWorker) {
          issues.push('Worker object is null or undefined');
        }
        if (!isRunning) {
          issues.push(`Worker status is '${workerStatus}' instead of 'running'`);
        }

        // Verificar estado de la cola
        try {
          const stats = await postgresQueueService.getQueueStats(name);
          if (stats.pending > 100) {
            issues.push(`High pending jobs: ${stats.pending}`);
          }
          if (stats.failed > 50) {
            issues.push(`High failed jobs: ${stats.failed}`);
          }
        } catch (queueError) {
          issues.push(`Cannot access queue stats: ${queueError instanceof Error ? queueError.message : 'Unknown error'}`);
        }

        return {
          name,
          status: workerStatus,
          hasWorkerInstance,
          hasWorker,
          isRunning,
          issues: issues.length > 0 ? issues : null,
          lastRestart: workerInstance?.lastRestart?.toISOString(),
          health: issues.length === 0 ? 'healthy' : 'unhealthy'
        };
      }));

      const overallHealth = healthStatus.every(w => w.health === 'healthy') ? 'healthy' : 'unhealthy';
      const unhealthyWorkers = healthStatus.filter(w => w.health === 'unhealthy');

      res.json({
        overallHealth,
        workers: healthStatus,
        summary: {
          total: healthStatus.length,
          healthy: healthStatus.filter(w => w.health === 'healthy').length,
          unhealthy: unhealthyWorkers.length,
          unhealthyWorkers: unhealthyWorkers.map(w => w.name)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting workers health:', error);
      res.status(500).json({ error: 'Error getting workers health' });
    }
  }
} 
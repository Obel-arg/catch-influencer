import { getWorkerMetrics, getWorkerHealth } from './workers/base.worker';
import { WorkerConfigManager } from './workers/config/worker-config';
import { RateLimiterFactory } from './workers/rate-limiting/adaptive-rate-limiter';
import { WorkerFactory } from './workers/worker-factory';
import { DependencyHealthManager } from './workers/health-checks/dependency-health';
import { DeadLetterManager } from './workers/dead-letter-queue/dead-letter-manager';
import { FallbackManager } from './workers/fallback-manager';
import { ResponseValidator } from './workers/response-validator';
import { AlertManager } from './workers/alert-manager';
import { MissingMetricsWorker } from './workers/missing-metrics.worker';
import { WorkerAutoScaler } from './workers/auto-scaler';
import { DEFAULT_METRICS_CONFIG, DEFAULT_SENTIMENT_CONFIG, DEFAULT_COMMENT_FETCH_CONFIG } from './workers/config/worker-config';
import { processMetricsJob } from './workers/metrics.worker';
import { processSentimentJob } from './workers/sentiment.worker';
import { processCommentFetchJob } from './workers/comment-fetch.worker';
import { PostgresQueueService } from './services/queues/postgres-queue.service';
import supabase from './config/supabase';

// Inicializar managers
const configManager = WorkerConfigManager.getInstance();
const workerFactory = WorkerFactory.getInstance();
const healthManager = DependencyHealthManager.getInstance();
const dlqManager = DeadLetterManager.getInstance();
const fallbackManager = FallbackManager.getInstance();
const responseValidator = ResponseValidator.getInstance();
const alertManager = AlertManager.getInstance();
const missingMetricsWorker = MissingMetricsWorker.getInstance();
const autoScaler = WorkerAutoScaler.getInstance();

// Workers inicializados
let workers: Array<{ name: string; worker: any }> = [];

// Función para inicializar configuración
async function initializeWorkerSystem() {
  try {
    
    // Cargar configuraciones
    await configManager.getMetricsConfig();
    await configManager.getSentimentConfig();
    await configManager.getCommentFetchConfig();
    
    // Cargar estados de rate limiters
    await RateLimiterFactory.getCreatorDBLimiter().loadState();
    await RateLimiterFactory.getOpenAILimiter().loadState();
    await RateLimiterFactory.getYouTubeLimiter().loadState();
    await RateLimiterFactory.getTikTokLimiter().loadState();
    await RateLimiterFactory.getTwitterLimiter().loadState();
    await RateLimiterFactory.getInstagramLimiter().loadState();
    
    // Iniciar health checks de dependencias
    healthManager.startMonitoring();
    
    // Iniciar dead letter queue
    await dlqManager.startAutoRetry();
    
    // Iniciar fallback manager
    fallbackManager.startHealthMonitoring();
    
    // Iniciar missing metrics worker
    await missingMetricsWorker.start();
    
    // Iniciar alert manager
    alertManager.updateConfig({
      enableAlerts: true,
      escalationEnabled: true,
      alertChannels: [
        {
          type: 'console',
          name: 'console',
          config: {},
          enabled: true,
          priority: 'low'
        },
        {
          type: 'slack',
          name: 'slack',
          config: {
            webhookUrl: process.env.SLACK_WEBHOOK_URL
          },
          enabled: !!process.env.SLACK_WEBHOOK_URL,
          priority: 'high'
        }
      ]
    });
        
  } catch (error) {
    console.error('❌ [WORKER_SYSTEM] Error initializing worker system:', error);
  }
}

// Función para inicializar workers
async function initializeWorkers() {
  try {
    
    // Inicializar workers usando el factory
    const metricsWorker = await workerFactory.initializeWorker('metrics', DEFAULT_METRICS_CONFIG, processMetricsJob);
    
    const sentimentWorker = await workerFactory.initializeWorker('sentiment', DEFAULT_SENTIMENT_CONFIG, processSentimentJob);
    
    const commentFetchWorker = await workerFactory.initializeWorker('comment-fetch', DEFAULT_COMMENT_FETCH_CONFIG, processCommentFetchJob);
    
    workers = [
      { name: 'metrics', worker: metricsWorker },
      { name: 'sentiment', worker: sentimentWorker },
      { name: 'comment-fetch', worker: commentFetchWorker }
    ];
    
    
  } catch (error) {
    console.error('❌ [WORKER_SYSTEM] Error initializing workers:', error);
  }
}

// Estado de salud de los workers
interface WorkerHealthStatus {
  name: string;
  isHealthy: boolean;
  successRate: string;
  consecutiveFailures: number;
  circuitBreakerState: string;
  lastProcessedAt?: Date;
  lastErrorAt?: Date;
  uptime: number;
}

// Monitoreo de memoria
interface MemoryUsage {
  rss: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
}

// Función para obtener uso de memoria
function getMemoryUsage(): MemoryUsage {
  const memUsage = process.memoryUsage();
  return {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
}

// Función para mostrar métricas de workers mejorada
function logWorkerMetrics() {
  const metrics = getWorkerMetrics();
  if (!metrics) {
    return;
  }
  
  const healthStatuses: WorkerHealthStatus[] = [];
  
  Object.entries(metrics).forEach(([workerName, workerMetrics]) => {
    if (workerMetrics) {
      const health = getWorkerHealth(workerName);
      const successRate = workerMetrics.processed > 0 
        ? ((workerMetrics.processed / (workerMetrics.processed + workerMetrics.failed)) * 100).toFixed(2)
        : '0.00';
      
      const uptime = workerMetrics.lastProcessedAt 
        ? Date.now() - workerMetrics.lastProcessedAt.getTime()
        : 0;
      
      const status: WorkerHealthStatus = {
        name: workerName,
        isHealthy: health?.isHealthy || false,
        successRate: health?.successRate || '0.00',
        consecutiveFailures: workerMetrics.consecutiveFailures,
        circuitBreakerState: workerMetrics.circuitBreakerState,
        lastProcessedAt: workerMetrics.lastProcessedAt,
        lastErrorAt: workerMetrics.lastErrorAt,
        uptime: uptime
      };
      
      healthStatuses.push(status);
    }
  });
  
  // Memory usage
  const memUsage = getMemoryUsage();
  
  // Overall health
  const healthyWorkers = healthStatuses.filter(w => w.isHealthy).length;
  const totalWorkers = healthStatuses.length;
  const overallHealth = healthyWorkers === totalWorkers ? '✅ HEALTHY' : '⚠️ DEGRADED';
  
  // Dependency health
  const dependencyHealth = healthManager.getAllHealth();
  const criticalDepsHealthy = healthManager.areCriticalDependenciesHealthy();
  const healthStats = healthManager.getHealthStats();
  
  // Fallback stats
  const fallbackStats = fallbackManager.getStats();
  
  // Alert stats
  const alertMetrics = alertManager.getAlertMetrics();
  
  // Evaluar alertas para cada worker
  healthStatuses.forEach(status => {
    alertManager.evaluateData(`worker_${status.name}`, {
      consecutiveFailures: status.consecutiveFailures,
      circuitBreakerState: status.circuitBreakerState,
      successRate: parseFloat(status.successRate),
      isHealthy: status.isHealthy
    }, ['worker_health', status.name]);
  });
  
  // Evaluar alertas de memoria
  alertManager.evaluateData('memory_usage', memUsage, ['system_health', 'memory']);
  
  // Evaluar alertas de dependencias
  alertManager.evaluateData('dependencies', {
    criticalDepsHealthy,
    healthStats,
    dependencyHealth
  }, ['system_health', 'dependencies']);
  
  // Evaluar alertas de fallbacks
  alertManager.evaluateData('fallbacks', fallbackStats, ['system_health', 'fallbacks']);
  
  return healthStatuses;
}

// Health check function mejorada
function performHealthCheck(): boolean {
  const healthStatuses = logWorkerMetrics();
  if (!healthStatuses) return false;
  
  const unhealthyWorkers = healthStatuses.filter(w => !w.isHealthy);
  const criticalDepsHealthy = healthManager.areCriticalDependenciesHealthy();
  
  if (unhealthyWorkers.length > 0) {
    console.warn('⚠️ [WORKER_SYSTEM] Unhealthy workers detected:', unhealthyWorkers.map(w => w.name));
    
    // Check for critical issues
    const criticalWorkers = unhealthyWorkers.filter(w => 
      w.consecutiveFailures > 10 || 
      w.circuitBreakerState === 'open'
    );
    
    if (criticalWorkers.length > 0) {
      console.error('🚨 [WORKER_SYSTEM] Critical worker issues detected:', criticalWorkers.map(w => w.name));
      return false;
    }
  }
  
  if (!criticalDepsHealthy) {
    console.error('🚨 [WORKER_SYSTEM] Critical dependencies unhealthy');
    return false;
  }
  
  return true;
}

// Auto-restart mechanism for unhealthy workers
async function restartUnhealthyWorkers() {
  const healthStatuses = logWorkerMetrics();
  if (!healthStatuses) return;
  
  const unhealthyWorkers = healthStatuses.filter(w => 
    !w.isHealthy && w.consecutiveFailures > 5
  );
  
  for (const unhealthyWorker of unhealthyWorkers) {
    console.warn(`🔄 [WORKER_SYSTEM] Attempting to restart unhealthy worker: ${unhealthyWorker.name}`);
    
    try {
      // Reinicializar worker usando el factory
      const configs = {
        metrics: DEFAULT_METRICS_CONFIG,
        sentiment: DEFAULT_SENTIMENT_CONFIG,
        'comment-fetch': DEFAULT_COMMENT_FETCH_CONFIG
      };
      
      const config = configs[unhealthyWorker.name as keyof typeof configs];
      if (config) {
        await workerFactory.reinitializeWorker(unhealthyWorker.name, config, async (job: any) => {
          switch (unhealthyWorker.name) {
            case 'metrics':
              return processMetricsJob(job);
            case 'sentiment':
              return processSentimentJob(job);
            case 'comment-fetch':
              return processCommentFetchJob(job);
            default:
              throw new Error(`Unknown worker: ${unhealthyWorker.name}`);
          }
        });
        
      }
    } catch (error) {
      console.error(`❌ [WORKER_SYSTEM] Error restarting worker ${unhealthyWorker.name}:`, error);
    }
  }
}

// Función para monitorear colas y asegurar procesamiento completo
async function monitorQueueCompletion() {
  try {
    const queueService = PostgresQueueService.getInstance();
    const allQueues = await queueService.getQueues();
    
    for (const queueName of allQueues) {
      const stats = await queueService.getQueueStats(queueName);
      
      // Alertar si hay jobs pendientes por mucho tiempo
      if (stats.pending > 0) {
        console.warn(`⚠️ [QUEUE_MONITOR] Queue ${queueName} has ${stats.pending} pending jobs`);
        
        // Si hay muchos jobs pendientes, verificar si el worker está funcionando
        if (stats.pending > 50) {
          const worker = workers.find(w => w.name === queueName);
          if (worker && worker.worker.getStats) {
            const workerStats = worker.worker.getStats();
            console.warn(`⚠️ [QUEUE_MONITOR] Worker ${queueName} stats:`, workerStats);
          }
        }
      }
      
      // Alertar si hay jobs procesándose por mucho tiempo
      if (stats.processing > 0) {
        console.warn(`⚠️ [QUEUE_MONITOR] Queue ${queueName} has ${stats.processing} jobs stuck in processing`);
      }

      // Verificar jobs fallidos que necesiten retry
      if (stats.failed > 0) {
        const jobsNeedingRetry = await queueService.getJobsNeedingRetry(queueName);
        if (jobsNeedingRetry.length > 0) {
          
          // Retry automático si hay muchos jobs fallidos
          if (jobsNeedingRetry.length > 10) {
            const retryCount = await queueService.retryFailedJobs(queueName);
          }
        }
      }
    }
    
    // Log general de estado de colas
    let totalPending = 0;
    let totalProcessing = 0;
    let totalFailed = 0;
    
    for (const queueName of allQueues) {
      const stats = await queueService.getQueueStats(queueName);
      totalPending += stats.pending;
      totalProcessing += stats.processing;
      totalFailed += stats.failed;
    }

    // Alertar si hay demasiados jobs en total
    if (totalPending > 100) {
      console.warn(`🚨 [QUEUE_MONITOR] High total pending jobs: ${totalPending}`);
    }
    
  } catch (error) {
    console.error(`❌ [QUEUE_MONITOR] Error monitoring queues:`, error);
  }
}

// Función para resetear jobs atascados (NO eliminar)
async function resetStuckJobs() {
  try {
    const queueService = PostgresQueueService.getInstance();
    const allQueues = await queueService.getQueues();
    
    for (const queueName of allQueues) {
      // Resetear jobs que han estado procesándose por más de 3 minutos
      const stuckJobs = await queueService.getStuckJobs(queueName, 3);
      if (stuckJobs.length > 0) {
        
        for (const job of stuckJobs) {
          try {
            await queueService.restartJob(job.id);
          } catch (resetError) {
            console.error(`❌ [STUCK_RESET] Error resetting job ${job.id}:`, resetError);
          }
        }
      }
    }
    
  } catch (error) {
    console.error(`❌ [STUCK_RESET] Error resetting stuck jobs:`, error);
  }
}

// 🚀 NUEVA FUNCIÓN: Forzar procesamiento de jobs de comment-fetch atascados
async function forceProcessStuckCommentFetchJobs() {
  try {
    const queueService = PostgresQueueService.getInstance();
    
    // Obtener jobs de comment-fetch que han estado en pending por más de 2 minutos
    const { data: stuckCommentFetchJobs, error } = await supabase
      .from('queue_jobs')
      .select('*')
      .eq('name', 'comment-fetch')
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 2 * 60 * 1000).toISOString()); // Más de 2 minutos

    if (error) {
      console.error('❌ [FORCE_PROCESS] Error getting stuck comment-fetch jobs:', error);
      return;
    }

    if (!stuckCommentFetchJobs || stuckCommentFetchJobs.length === 0) {
      return; // No hay jobs atascados
    }


    for (const commentJob of stuckCommentFetchJobs) {
      try {
        const jobData = commentJob.data;
        const postId = jobData?.postId;

        if (!postId) {
          console.warn(`⚠️ [FORCE_PROCESS] Comment job ${commentJob.id} has no postId, skipping`);
          continue;
        }

        // Verificar si el job de metrics correspondiente ya se completó o falló
        const { data: metricsJobs, error: metricsError } = await supabase
          .from('queue_jobs')
          .select('*')
          .eq('name', 'metrics')
          .in('status', ['completed', 'failed'])
          .contains('data', { postId: postId });

        if (metricsError) {
          console.error(`❌ [FORCE_PROCESS] Error checking metrics jobs for post ${postId}:`, metricsError);
          continue;
        }

        // Si hay al menos un job de metrics completado o fallado para este post
        if (metricsJobs && metricsJobs.length > 0) {
          const completedMetrics = metricsJobs.filter(job => job.status === 'completed');
          const failedMetrics = metricsJobs.filter(job => job.status === 'failed');
          
          
          
          // Marcar el job como processing para forzar su ejecución
          await queueService.markJobProcessing(commentJob.id);
          
          // Log del evento
        } else {
        }

      } catch (jobError) {
        console.error(`❌ [FORCE_PROCESS] Error processing stuck job ${commentJob.id}:`, jobError);
      }
    }

  } catch (error) {
    console.error(`❌ [FORCE_PROCESS] Error in force process stuck comment-fetch jobs:`, error);
  }
}

// Función para retry automático de jobs fallidos y reset de jobs colgados
async function aggressiveJobRecovery() {
  try {
    const queueService = PostgresQueueService.getInstance();
    const allQueues = await queueService.getQueues();
    
    for (const queueName of allQueues) {
      try {
        // 1. RETRY TODOS LOS JOBS FALLIDOS (sin importar intentos)
        const failedJobs = await queueService.getFailedJobs(queueName, 1000);
        if (failedJobs.length > 0) {
          
          // Resetear TODOS los jobs fallidos a pending
          for (const job of failedJobs) {
            try {
              await queueService.restartJob(job.id);
            } catch (restartError) {
              console.error(`❌ [AGGRESSIVE_RECOVERY] Error restarting job ${job.id}:`, restartError);
            }
          }
        }
        
        // 2. RESET JOBS COLGADOS EN PROCESSING (más de 2 minutos)
        const stuckJobs = await queueService.getStuckJobs(queueName, 2); // 2 minutos
        if (stuckJobs.length > 0) {
          
          for (const job of stuckJobs) {
            try {
              await queueService.restartJob(job.id);
            } catch (resetError) {
              console.error(`❌ [AGGRESSIVE_RECOVERY] Error resetting stuck job ${job.id}:`, resetError);
            }
          }
        }
        
        // 3. VERIFICAR SI HAY JOBS PENDIENTES Y FORZAR PROCESAMIENTO
        const stats = await queueService.getQueueStats(queueName);
        if (stats.pending > 0) {
        }
        
        if (stats.processing > 0) {
        }
        
      } catch (queueError) {
        console.error(`❌ [AGGRESSIVE_RECOVERY] Error processing queue ${queueName}:`, queueError);
      }
    }
    
  } catch (error) {
    console.error(`❌ [AGGRESSIVE_RECOVERY] Error in aggressive job recovery:`, error);
  }
}

// Función para monitoreo agresivo de colas
async function aggressiveQueueMonitoring() {
  try {
    const queueService = PostgresQueueService.getInstance();
    const allQueues = await queueService.getQueues();
    
    for (const queueName of allQueues) {
      try {
        const stats = await queueService.getQueueStats(queueName);
        
        // Si hay jobs pendientes, verificar que los workers estén funcionando
        if (stats.pending > 0) {
          
          // Si hay muchos jobs pendientes, forzar procesamiento
          if (stats.pending > 10) {
            
            // Verificar si hay workers activos
            const worker = workers.find(w => w.name === queueName);
            if (worker && worker.worker.getHealth) {
              const health = worker.worker.getHealth();
              if (!health.isHealthy) {
                console.warn(`⚠️ [AGGRESSIVE_MONITOR] Worker ${queueName} is unhealthy, attempting restart`);
                // Aquí podrías reiniciar el worker si es necesario
              }
            }
          }
        }
        
        // Si hay jobs en processing por mucho tiempo, resetearlos
        if (stats.processing > 0) {
          
          // Si hay muchos jobs en processing, verificar si están colgados
          if (stats.processing > 5) {
            const stuckJobs = await queueService.getStuckJobs(queueName, 1); // 1 minuto
            if (stuckJobs.length > 0) {
              for (const job of stuckJobs) {
                try {
                  await queueService.restartJob(job.id);
                } catch (error) {
                  console.error(`❌ [AGGRESSIVE_MONITOR] Error resetting job ${job.id}:`, error);
                }
              }
            }
          }
        }
        
        // Si hay jobs fallidos, reintentarlos inmediatamente
        if (stats.failed > 0) {
          
          const failedJobs = await queueService.getFailedJobs(queueName, 100);
          if (failedJobs.length > 0) {
            for (const job of failedJobs) {
              try {
                await queueService.restartJob(job.id);
              } catch (error) {
                console.error(`❌ [AGGRESSIVE_MONITOR] Error retrying job ${job.id}:`, error);
              }
            }
          }
        }
        
      } catch (queueError) {
        console.error(`❌ [AGGRESSIVE_MONITOR] Error monitoring queue ${queueName}:`, queueError);
      }
    }
    
  } catch (error) {
    console.error(`❌ [AGGRESSIVE_MONITOR] Error in aggressive queue monitoring:`, error);
  }
}

// Variables para intervalos
let metricsInterval: NodeJS.Timeout;
let healthCheckInterval: NodeJS.Timeout;
let restartCheckInterval: NodeJS.Timeout;
// let autoScalingInterval: NodeJS.Timeout; // TEMPORALMENTE DESHABILITADO
let memoryInterval: NodeJS.Timeout;
let cleanupInterval: NodeJS.Timeout;
let forceProcessInterval: NodeJS.Timeout;
let aggressiveRecoveryInterval: NodeJS.Timeout; // Nuevo intervalo para aggressiveJobRecovery
let aggressiveQueueMonitoringInterval: NodeJS.Timeout; // Nuevo intervalo para aggressiveQueueMonitoring
let keepAliveInterval: NodeJS.Timeout; // Keep-alive para mantener el proceso siempre vivo
let processHealthInterval: NodeJS.Timeout; // Monitoreo de salud del proceso

// Inicializar sistema completo
async function initializeCompleteSystem() {
  try {
    // Inicializar sistema base
    await initializeWorkerSystem();
    
    // Inicializar workers
    await initializeWorkers();

    // Inicializar auto-scaler - TEMPORALMENTE DESHABILITADO
    // await autoScaler.initialize();
    
    // Iniciar monitoreo
    startMonitoring();
    
    
  } catch (error) {
    console.error('❌ [WORKER_SYSTEM] Error initializing complete system:', error);
  }
}

// Keep-alive mechanism - CRÍTICO para mantener el proceso siempre vivo
function startKeepAlive() {
  // Heartbeat cada 30 segundos para mantener el proceso activo
  keepAliveInterval = setInterval(() => {
    try {
      // Verificar que el proceso esté activo
      const uptime = process.uptime();
      const memUsage = getMemoryUsage();
      
      // Log cada 10 minutos para no saturar logs
      const uptimeMinutes = Math.floor(uptime / 60);
      if (uptimeMinutes > 0 && uptimeMinutes % 10 === 0 && uptime % 60 < 30) {
        console.log(`💓 [WORKER_SYSTEM] Keep-alive: Worker running for ${uptimeMinutes} minutes | Memory: ${memUsage.heapUsed}MB / ${memUsage.heapTotal}MB`);
      }
      
      // Verificar que los workers estén activos
      if (workers.length === 0) {
        console.warn('⚠️ [WORKER_SYSTEM] No workers detected, attempting reinitialization...');
        initializeWorkers().catch(err => {
          console.error('❌ [WORKER_SYSTEM] Error reinitializing workers:', err);
        });
      }
    } catch (error) {
      console.error('❌ [WORKER_SYSTEM] Error in keep-alive check:', error);
      // NO lanzar el error - solo loggear
    }
  }, 30000); // Cada 30 segundos
  
  // Monitoreo de salud del proceso cada 1 minuto
  processHealthInterval = setInterval(() => {
    try {
      const memUsage = getMemoryUsage();
      const uptime = process.uptime();
      
      // Verificar memoria crítica
      if (memUsage.heapUsed > 2500) { // 2.5GB
        console.error(`🚨 [WORKER_SYSTEM] Critical memory usage: ${memUsage.heapUsed}MB`);
        // Forzar garbage collection si está disponible
        if (global.gc) {
          global.gc();
          console.log('🧹 [WORKER_SYSTEM] Forced garbage collection');
        }
      }
      
      // Verificar que el proceso no esté colgado
      if (uptime > 0) {
        // Proceso está vivo
        const healthStatuses = logWorkerMetrics();
        if (healthStatuses) {
          const allUnhealthy = healthStatuses.every(w => !w.isHealthy);
          if (allUnhealthy && workers.length > 0) {
            console.warn('⚠️ [WORKER_SYSTEM] All workers unhealthy, attempting recovery...');
            restartUnhealthyWorkers().catch(err => {
              console.error('❌ [WORKER_SYSTEM] Error in worker recovery:', err);
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ [WORKER_SYSTEM] Error in process health check:', error);
      // NO lanzar el error - solo loggear
    }
  }, 60000); // Cada 1 minuto
}

// Iniciar monitoreo
function startMonitoring() {
  // Iniciar keep-alive PRIMERO - esto es crítico para mantener el proceso vivo
  startKeepAlive();
  
  // Log métricas cada 5 minutos
  metricsInterval = setInterval(logWorkerMetrics, 5 * 60 * 1000);

  // Health check cada 2 minutos
  healthCheckInterval = setInterval(() => {
    const isHealthy = performHealthCheck();
    if (!isHealthy) {
      console.warn('⚠️ [WORKER_SYSTEM] System health check failed');
    }
  }, 2 * 60 * 1000);

  // Auto-restart check cada 10 minutos
  restartCheckInterval = setInterval(restartUnhealthyWorkers, 10 * 60 * 1000);

  // Monitoreo de colas cada 3 minutos
  const queueMonitorInterval = setInterval(monitorQueueCompletion, 3 * 60 * 1000);

  // 🚀 Forzar procesamiento de comment-fetch jobs atascados cada 2 minutos
  forceProcessInterval = setInterval(async () => {
    try {
      await forceProcessStuckCommentFetchJobs();
    } catch (error) {
      console.error('❌ [WORKER_SYSTEM] Error in force process check:', error);
    }
  }, 2 * 60 * 1000);

  // Retry failed jobs cada 5 minutos
  // retryFailedInterval = setInterval(retryFailedJobs, 5 * 60 * 1000); // Eliminado

  // Auto-scaling check cada 2 minutos - TEMPORALMENTE DESHABILITADO
  // autoScalingInterval = setInterval(async () => {
  //   try {
  //     await autoScaler.monitor();
  //   } catch (error) {
  //     console.error('❌ [WORKER_SYSTEM] Error in auto-scaling check:', error);
  //   }
  // }, 2 * 60 * 1000);

  // Memory monitoring cada 30 segundos
  memoryInterval = setInterval(() => {
    const memUsage = getMemoryUsage();
    
    if (memUsage.heapUsed > 1500) { // Warning at 1.5GB for Vercel Pro
      console.warn('⚠️ [WORKER_SYSTEM] High memory usage detected:', memUsage);
    }
    
    if (memUsage.heapUsed > 2500) { // Critical at 2.5GB for Vercel Pro
      console.error('🚨 [WORKER_SYSTEM] Critical memory usage detected:', memUsage);
    }
  }, 30000);
  
  // Reset interval cada 2 minutos para jobs colgados
  cleanupInterval = setInterval(async () => {
    try {
      // Resetear jobs colgados
      await resetStuckJobs();
    } catch (error) {
      console.error('❌ [WORKER_SYSTEM] Error during stuck jobs reset:', error);
    }
  }, 2 * 60 * 1000);

  // Cleanup completo cada hora
  const fullCleanupInterval = setInterval(async () => {
    try {
      // Limpiar cache de validación
      await responseValidator.clearCache();
      
      // Limpiar cache de fallbacks
      await fallbackManager.clearCache();
      
      // Resetear colas atascadas
      await resetStuckJobs();
      
      // Forzar procesamiento de jobs de comment-fetch atascados
      await forceProcessStuckCommentFetchJobs();
      
    } catch (error) {
      console.error('❌ [WORKER_SYSTEM] Error during full cleanup:', error);
    }
  }, 60 * 60 * 1000);

  // Recuperación agresiva de jobs cada 2 minutos
  aggressiveRecoveryInterval = setInterval(aggressiveJobRecovery, 2 * 60 * 1000);

  // Monitoreo agresivo de colas cada 1 minuto
  aggressiveQueueMonitoringInterval = setInterval(aggressiveQueueMonitoring, 1 * 60 * 1000);
}

// Manejo de errores no capturados - CRÍTICO: NO cerrar el proceso
// Estos handlers previenen que el worker se apague por errores no críticos
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 [WORKER_SYSTEM] Unhandled Rejection at:', promise, 'reason:', reason);
  // NO cerrar el proceso - solo loggear y continuar
  // Esto es crítico para mantener el worker siempre activo
});

process.on('uncaughtException', (error) => {
  console.error('🚨 [WORKER_SYSTEM] Uncaught Exception:', error);
  // NO cerrar el proceso - solo loggear y continuar
  // Esto es crítico para mantener el worker siempre activo
  // El proceso debe seguir corriendo incluso con errores no críticos
});

// Manejo de shutdown mejorado
async function gracefulShutdown(signal: string) {
  console.log(`🛑 [WORKER_SYSTEM] Received ${signal} signal, initiating graceful shutdown...`);
  
  // Limpiar intervalos de forma segura
  if (metricsInterval) clearInterval(metricsInterval);
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  if (restartCheckInterval) clearInterval(restartCheckInterval);
  // clearInterval(autoScalingInterval); // TEMPORALMENTE DESHABILITADO
  if (memoryInterval) clearInterval(memoryInterval);
  if (cleanupInterval) clearInterval(cleanupInterval);
  if (forceProcessInterval) clearInterval(forceProcessInterval);
  if (aggressiveRecoveryInterval) clearInterval(aggressiveRecoveryInterval);
  if (aggressiveQueueMonitoringInterval) clearInterval(aggressiveQueueMonitoringInterval);
  if (keepAliveInterval) clearInterval(keepAliveInterval);
  if (processHealthInterval) clearInterval(processHealthInterval);
  
  // Detener health checks
  healthManager.stopMonitoring();
  
  // Detener auto-retry de DLQ
  dlqManager.stopAutoRetry();
  
  // Detener fallback manager
  fallbackManager.stopHealthMonitoring();

  // Detener missing metrics worker
  await missingMetricsWorker.stop();

  // Detener auto-scaler - TEMPORALMENTE DESHABILITADO
  // await autoScaler.stop();
  
  // Mostrar métricas finales
  logWorkerMetrics();
  
  
  
  // Cerrar todos los workers
  await workerFactory.closeAllWorkers();
  
  // Final memory report
  const finalMemUsage = getMemoryUsage();

  process.exit(0);
}

// Event listeners para shutdown - SOLO para señales explícitas del sistema
// NOTA: Los handlers de uncaughtException y unhandledRejection están definidos arriba
// y NO llaman a gracefulShutdown para mantener el worker siempre activo
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Inicializar sistema completo
initializeCompleteSystem();

// Initial health check after 30 seconds
setTimeout(() => {
  performHealthCheck();
}, 30000);

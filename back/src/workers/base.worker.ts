import { PostgresQueueService } from '../services/queues/postgres-queue.service';
import { BaseWorkerConfig } from './config/worker-config';
import { AdaptiveRateLimiter, RateLimiterFactory } from './rate-limiting/adaptive-rate-limiter';

// Configuración optimizada para diferentes tipos de workers
export interface WorkerConfig extends BaseWorkerConfig {}

// Métricas de performance mejoradas
interface WorkerMetrics {
  processed: number;
  failed: number;
  avgProcessingTime: number;
  lastProcessedAt?: Date;
  lastErrorAt?: Date;
  consecutiveFailures: number;
  circuitBreakerState: 'closed' | 'open' | 'half-open';
  circuitBreakerOpenedAt?: Date;
}

// Circuit Breaker State
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
  threshold: number;
  timeout: number;
}

const workerMetrics = new Map<string, WorkerMetrics>();
const circuitBreakers = new Map<string, CircuitBreakerState>();

// Logging estructurado mejorado
function logWorkerEvent(level: 'info' | 'error' | 'warn', workerName: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    worker: workerName,
    message,
    ...(data && { data })
  };
  
  // Logging estructurado con colores
  const colors = {
    info: '\x1b[32m', // Verde
    warn: '\x1b[33m', // Amarillo
    error: '\x1b[31m', // Rojo
    reset: '\x1b[0m'   // Reset
  };
}

// Circuit Breaker Implementation
function getCircuitBreaker(workerName: string, config: WorkerConfig): CircuitBreakerState {
  if (!circuitBreakers.has(workerName)) {
    circuitBreakers.set(workerName, {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
      threshold: config.circuitBreakerThreshold || 5,
      timeout: config.circuitBreakerTimeout || 60000 // 1 minuto
    });
  }
  return circuitBreakers.get(workerName)!;
}

function updateCircuitBreaker(workerName: string, success: boolean, config: WorkerConfig) {
  const cb = getCircuitBreaker(workerName, config);
  
  if (success) {
    cb.failures = 0;
    cb.state = 'closed';
    logWorkerEvent('info', workerName, 'Circuit breaker closed - service recovered');
  } else {
    cb.failures++;
    cb.lastFailureTime = Date.now();
    
    if (cb.failures >= cb.threshold && cb.state === 'closed') {
      cb.state = 'open';
      logWorkerEvent('warn', workerName, `Circuit breaker opened after ${cb.failures} consecutive failures`);
    }
  }
}

function isCircuitBreakerOpen(workerName: string, config: WorkerConfig): boolean {
  const cb = getCircuitBreaker(workerName, config);
  
  if (cb.state === 'closed') return false;
  
  if (cb.state === 'open') {
    const timeSinceLastFailure = Date.now() - cb.lastFailureTime;
    if (timeSinceLastFailure >= cb.timeout) {
      cb.state = 'half-open';
      logWorkerEvent('info', workerName, 'Circuit breaker half-open - testing recovery');
      return false;
    }
    return true;
  }
  
  return false;
}

// Exponential Backoff Implementation
function calculateBackoffDelay(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 segundos
}

// Función para actualizar métricas mejorada
function updateMetrics(workerName: string, success: boolean, processingTime: number) {
  const metrics = workerMetrics.get(workerName) || {
    processed: 0,
    failed: 0,
    avgProcessingTime: 0,
    consecutiveFailures: 0,
    circuitBreakerState: 'closed' as const
  };

  if (success) {
    metrics.processed++;
    metrics.avgProcessingTime = (metrics.avgProcessingTime + processingTime) / 2;
    metrics.lastProcessedAt = new Date();
    metrics.consecutiveFailures = 0;
  } else {
    metrics.failed++;
    metrics.lastErrorAt = new Date();
    metrics.consecutiveFailures++;
  }

  // Update circuit breaker state
  const cb = getCircuitBreaker(workerName, { 
    name: workerName, 
    concurrency: 1,
    maxRetries: 3,
    backoffDelay: 2000,
    timeout: 300000,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000,
    rateLimitInterval: 1000,
    rateLimitMaxCalls: 10,
    adaptiveRateLimit: true,
    memoryWarningThreshold: 500,
    memoryCriticalThreshold: 1000,
    healthCheckInterval: 30000,
    metricsRetentionHours: 24
  });
  metrics.circuitBreakerState = cb.state;
  if (cb.state === 'open') {
    metrics.circuitBreakerOpenedAt = new Date(cb.lastFailureTime);
  }

  workerMetrics.set(workerName, metrics);
}

// Función para obtener métricas mejorada
export function getWorkerMetrics(workerName?: string): WorkerMetrics | Record<string, WorkerMetrics> | undefined {
  if (workerName) {
    return workerMetrics.get(workerName);
  }
  return Object.fromEntries(workerMetrics);
}

// Health check function
export function getWorkerHealth(workerName?: string) {
  const metrics = getWorkerMetrics(workerName) as WorkerMetrics | undefined;
  if (!metrics) return null;
  
  const totalJobs = metrics.processed + metrics.failed;
  const successRate = totalJobs > 0 ? (metrics.processed / totalJobs) * 100 : 100;
  // Workers are healthy if:
  // - They haven't processed any jobs yet (totalJobs === 0) OR
  // - Success rate > 80% AND consecutive failures < 5
  const isHealthy = totalJobs === 0 || (successRate > 80 && metrics.consecutiveFailures < 5);
  
  return {
    isHealthy,
    successRate: successRate.toFixed(2),
    consecutiveFailures: metrics.consecutiveFailures,
    circuitBreakerState: metrics.circuitBreakerState,
    avgProcessingTime: metrics.avgProcessingTime.toFixed(2),
    lastProcessedAt: metrics.lastProcessedAt,
    lastErrorAt: metrics.lastErrorAt
  };
}

export function createOptimizedWorker<T>(
  config: WorkerConfig,
  processor: (job: { id: string; data: T }) => Promise<void>
): any {
  const startTime = Date.now();
  const queueService = PostgresQueueService.getInstance();
  
  // Use the config name directly as queue name, don't add extra suffixes
  const queueName = config.name;
  
  // Variables de estado del worker
  let isProcessing = true;
  let activeJobs = 0;
  let totalProcessed = 0;
  let totalFailed = 0;
  let lastJobTime = Date.now();
  let lastHeartbeat = Date.now();
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 20; // Aumentado para ser menos restrictivo
  const maxConcurrency = config.concurrency || 5; // Aumentar concurrencia por defecto
  let processingInterval: NodeJS.Timeout | null = null;
  
  // Función para verificar si hay jobs pendientes
  const checkPendingJobs = async (iteration?: number): Promise<number> => {
    try {
      const stats = await queueService.getQueueStats(queueName);
      const total = stats.pending + stats.processing;
      
      // Log detallado cada 20 iteraciones para diagnóstico, o si hay jobs pendientes
      if (iteration && (iteration % 20 === 0 || total > 0)) {
        console.log(`📊 [${config.name.toUpperCase()}_WORKER] Queue stats for ${queueName}: pending=${stats.pending}, processing=${stats.processing}, completed=${stats.completed}, failed=${stats.failed}, total=${total}`);
      }
      
      return total;
    } catch (error) {
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Error checking pending jobs for ${queueName}:`, error);
      // En caso de error, retornar -1 para indicar que hubo un problema
      return -1;
    }
  };
  
  // Función para procesar jobs de forma continua
  const processJobsContinuously = async () => {
    console.log(`🚀 [${config.name.toUpperCase()}_WORKER] Starting continuous job processing loop for queue: ${queueName}`);
    let loopIterations = 0;
    
    while (isProcessing) {
      try {
        loopIterations++;
        
        // Log cada 100 iteraciones para no saturar logs
        if (loopIterations % 100 === 0) {
          console.log(`🔄 [${config.name.toUpperCase()}_WORKER] Processing loop iteration ${loopIterations}, activeJobs: ${activeJobs}, totalProcessed: ${totalProcessed}, totalFailed: ${totalFailed}`);
        }
        
        // Actualizar heartbeat
        lastHeartbeat = Date.now();
        
        // Verificar jobs pendientes
        const pendingJobs = await checkPendingJobs(loopIterations);
        
        // Si hubo un error al verificar (retornó -1), esperar un poco y reintentar
        if (pendingJobs === -1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        if (pendingJobs === 0) {
          // No hay jobs, verificar si hay jobs fallidos que necesiten retry
          await retryFailedJobs();
          
          // Log solo cada 50 iteraciones cuando no hay jobs
          if (loopIterations % 50 === 0) {
            console.log(`⏳ [${config.name.toUpperCase()}_WORKER] No pending jobs, waiting... (iteration ${loopIterations})`);
          }
          
          // Esperar un poco más
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        // Log cuando hay jobs pendientes
        if (loopIterations % 10 === 0) {
          console.log(`📋 [${config.name.toUpperCase()}_WORKER] Found ${pendingJobs} pending jobs, activeJobs: ${activeJobs}/${maxConcurrency}`);
        }
        
        // Verificar límite de concurrencia
        if (activeJobs >= maxConcurrency) {
          await new Promise(resolve => setTimeout(resolve, 50)); // Reducir espera
          continue;
        }
        
        // Obtener siguiente job usando claim atómico
        const job = await queueService.claimNextJob(queueName);
        
        if (!job) {
          // No hay jobs disponibles, pero sabemos que hay pendientes
          // Esto puede indicar un problema de race condition o que los jobs están siendo procesados por otro worker
          if (loopIterations % 10 === 0 || pendingJobs > 0) {
            console.log(`⚠️ [${config.name.toUpperCase()}_WORKER] No job available from claimNextJob but pending=${pendingJobs}. Possible race condition or jobs being processed by another worker.`);
            // Verificar stats nuevamente para diagnóstico
            const currentStats = await queueService.getQueueStats(queueName);
            console.log(`🔍 [${config.name.toUpperCase()}_WORKER] Current queue stats: pending=${currentStats.pending}, processing=${currentStats.processing}, completed=${currentStats.completed}`);
          }
          await new Promise(resolve => setTimeout(resolve, 500)); // Reducir espera para reintentar más rápido
          continue;
        }
        
        console.log(`✅ [${config.name.toUpperCase()}_WORKER] Claimed job ${job.id}, starting processing...`);
        console.log(`📋 [${config.name.toUpperCase()}_WORKER] Job data:`, JSON.stringify(job.data, null, 2));
        
        // Procesar job en paralelo
        activeJobs++;
        processJob(job).catch(error => {
          console.error(`❌ [${config.name.toUpperCase()}_WORKER] Unhandled error processing job ${job.id}:`, error);
        }).finally(() => {
          activeJobs--;
        });
        
        // Resetear contador de errores consecutivos si llegamos aquí
        consecutiveErrors = 0;
        
        // Pausa mínima para no sobrecargar la base de datos
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        console.error(`❌ [${config.name.toUpperCase()}_WORKER] Error in processing loop:`, error);
        consecutiveErrors++;
        
        // Si hay demasiados errores consecutivos, pausar brevemente el worker
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(`🚨 [${config.name.toUpperCase()}_WORKER] Too many consecutive errors (${consecutiveErrors}), pausing worker for 10 seconds`);
          await new Promise(resolve => setTimeout(resolve, 10000));
          consecutiveErrors = 0; // Resetear después de la pausa
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar menos tiempo en caso de error
        }
      }
    }
    
    console.log(`🛑 [${config.name.toUpperCase()}_WORKER] Processing loop stopped after ${loopIterations} iterations`);
  };

  // Función para reintentar jobs fallidos
  const retryFailedJobs = async () => {
    try {
      const retryCount = await queueService.retryFailedJobs(queueName);
      if (retryCount > 0) {
      }
    } catch (error) {
      console.warn(`⚠️ [${config.name.toUpperCase()}_WORKER] Error retrying failed jobs:`, error);
    }
  };
  
  // Función para procesar un job individual
  const processJob = async (job: any) => {
    const jobStartTime = Date.now();
    const loggerPrefix = `[${config.name} | Job ${job.id}]`;
    
    try {
      // Verificar circuit breaker
      if (isCircuitBreakerOpen(config.name, config)) {
        const error = new Error(`Circuit breaker is open for ${config.name}`);
        logWorkerEvent('error', config.name, `Circuit breaker blocked job ${job.id}`, {
          circuitBreakerState: getCircuitBreaker(config.name, config).state
        });
        throw error;
      }

      // Verificar uso de memoria
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      
      if (heapUsedMB > (config.memoryCriticalThreshold || 1000)) {
        logWorkerEvent('error', config.name, `Critical memory usage: ${heapUsedMB.toFixed(2)}MB`, {
          heapUsed: heapUsedMB,
          threshold: config.memoryCriticalThreshold
        });
        throw new Error('Critical memory usage detected');
      } else if (heapUsedMB > (config.memoryWarningThreshold || 500)) {
        logWorkerEvent('warn', config.name, `High memory usage: ${heapUsedMB.toFixed(2)}MB`, {
          heapUsed: heapUsedMB,
          threshold: config.memoryWarningThreshold
        });
      }

      console.log(`🚀 [${config.name.toUpperCase()}_WORKER] Starting to process job ${job.id}...`);
      
      // Procesar el job con timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), config.timeout || 300000);
      });
      
      const jobPromise = processor(job as { id: string; data: T });
      
      await Promise.race([jobPromise, timeoutPromise]);
      
      console.log(`✅ [${config.name.toUpperCase()}_WORKER] Job ${job.id} processor completed successfully`);
          
      const processingTime = Date.now() - jobStartTime;
      
      // Marcar job como completado en la base de datos
      try {
        await queueService.markJobCompleted(job.id);
      } catch (markError) {
        console.error(`❌ [${config.name.toUpperCase()}_WORKER] Failed to mark job ${job.id} as completed:`, markError);
      }
      
      updateMetrics(config.name, true, processingTime);
      updateCircuitBreaker(config.name, true, config);
      
      totalProcessed++;
      lastJobTime = Date.now();
          
      logWorkerEvent('info', config.name, `Job ${job.id} completed successfully`, {
        processingTime,
        memoryUsage: heapUsedMB.toFixed(2),
        totalProcessed,
        activeJobs
      });
          
    } catch (error) {
      const processingTime = Date.now() - jobStartTime;
      updateMetrics(config.name, false, processingTime);
      updateCircuitBreaker(config.name, false, config);
      
      totalFailed++;
      
      // Asegurar que el job se marque como fallido en la base de datos
      try {
        await queueService.markJobFailed(job.id, error instanceof Error ? error.message : String(error));
      } catch (markError) {
        console.error(`❌ [${config.name.toUpperCase()}_WORKER] Failed to mark job ${job.id} as failed:`, markError);
      }
          
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : 'N/A';
      
      // 🔍 DIAGNÓSTICO: Log detallado de errores
      console.error(`\n❌ [${config.name.toUpperCase()}_WORKER] ========== JOB FAILURE DETAILS ==========`);
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Job ID: ${job.id}`);
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Job Data:`, JSON.stringify(job.data, null, 2));
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Error Message: ${errorMessage}`);
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Error Stack: ${errorStack}`);
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Processing Time: ${processingTime}ms`);
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Attempts: ${job.attempts || 1}`);
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Total Failed: ${totalFailed}`);
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Consecutive Failures: ${consecutiveErrors}`);
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] ===========================================\n`);
      
      logWorkerEvent('error', config.name, `Job ${job.id} failed`, {
        error: errorMessage,
        processingTime,
        attempts: job.attempts || 1,
        totalFailed,
        consecutiveErrors
      });
          
      throw error;
    }
  };
  
  // Función para monitorear la salud del worker
  const monitorWorkerHealth = async () => {
    try {
      const pendingJobs = await checkPendingJobs();
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      
      // Verificar heartbeat
      const timeSinceHeartbeat = Date.now() - lastHeartbeat;
      if (timeSinceHeartbeat > 60000) { // Más de 1 minuto sin heartbeat
        console.warn(`⚠️ [${config.name.toUpperCase()}_WORKER] No heartbeat for ${Math.round(timeSinceHeartbeat / 1000)}s`);
      }

      // Alertar si no hay procesamiento reciente
      if (lastJobTime && Date.now() - lastJobTime > 300000) { // 5 minutos
        console.warn(`⚠️ [${config.name.toUpperCase()}_WORKER] No jobs processed in the last 5 minutes`);
      }
      
      // Alertar si hay muchos jobs pendientes
      if (pendingJobs > 100) {
        console.warn(`⚠️ [${config.name.toUpperCase()}_WORKER] High number of pending jobs: ${pendingJobs}`);
      }
      
      // Alertar si hay muchos errores consecutivos
      if (consecutiveErrors > 5) {
        console.warn(`⚠️ [${config.name.toUpperCase()}_WORKER] High number of consecutive errors: ${consecutiveErrors}`);
      }
      
    } catch (error) {
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Error in health monitoring:`, error);
    }
  };

  // Iniciar procesamiento continuo ANTES del return
  console.log(`🚀 [${config.name.toUpperCase()}_WORKER] Initializing worker for queue: ${queueName}`);
  console.log(`🚀 [${config.name.toUpperCase()}_WORKER] About to start processing loop...`);
  
  try {
    processJobsContinuously().catch(error => {
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Fatal error in job processing loop:`, error);
      console.error(`❌ [${config.name.toUpperCase()}_WORKER] Stack:`, error instanceof Error ? error.stack : 'N/A');
    });
    console.log(`✅ [${config.name.toUpperCase()}_WORKER] Processing loop started successfully`);
  } catch (error) {
    console.error(`❌ [${config.name.toUpperCase()}_WORKER] Error starting processing loop:`, error);
    console.error(`❌ [${config.name.toUpperCase()}_WORKER] Stack:`, error instanceof Error ? error.stack : 'N/A');
  }

  // Iniciar monitoreo de salud
  try {
    processingInterval = setInterval(monitorWorkerHealth, 5 * 60 * 1000); // Cada 5 minutos
    console.log(`✅ [${config.name.toUpperCase()}_WORKER] Health monitoring started`);
  } catch (error) {
    console.error(`❌ [${config.name.toUpperCase()}_WORKER] Error starting health monitoring:`, error);
  }
  
  console.log(`✅ [${config.name.toUpperCase()}_WORKER] Worker initialized and processing started`);

  // Retornar worker con métricas y estado
  return {
    name: config.name,
    async process(handler: (job: any) => Promise<void>) {
      return await queueService.process(queueName, handler);
    },
    async close() {
      isProcessing = false;
      if (processingInterval) {
        clearInterval(processingInterval);
        processingInterval = null;
      }
    },
    getStats() {
      return {
        name: config.name,
        isProcessing,
        activeJobs,
        totalProcessed,
        totalFailed,
        lastJobTime,
        lastHeartbeat,
        consecutiveErrors,
        memoryUsage: process.memoryUsage()
      };
    },
    getHealth() {
      const timeSinceHeartbeat = Date.now() - lastHeartbeat;
      const timeSinceLastJob = lastJobTime ? Date.now() - lastJobTime : 0;
      
      return {
        isHealthy: timeSinceHeartbeat < 60000 && consecutiveErrors < maxConsecutiveErrors,
        timeSinceHeartbeat,
        timeSinceLastJob,
        consecutiveErrors,
        activeJobs
      };
    }
  };
} 
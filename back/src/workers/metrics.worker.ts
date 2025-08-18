import { PostMetricsService } from '../services/post-metrics/post-metrics.service';
import { postgresQueueService } from '../services/queues/postgres-queue.service';
import { postgresCacheService } from '../services/cache/postgres-cache.service';
import { WorkerConfigManager, DEFAULT_METRICS_CONFIG } from './config/worker-config';
import { RateLimiterFactory } from './rate-limiting/adaptive-rate-limiter';
import { FallbackManager } from './fallback-manager';
import { ResponseValidator } from './response-validator';
import { AlertManager } from './alert-manager';

const metricsService = new PostMetricsService();
const configManager = WorkerConfigManager.getInstance();
const creatorDBLimiter = RateLimiterFactory.getCreatorDBLimiter();
const fallbackManager = FallbackManager.getInstance();
const responseValidator = ResponseValidator.getInstance();
const alertManager = AlertManager.getInstance();

// Configuración dinámica para métricas
let metricsConfig = DEFAULT_METRICS_CONFIG;

// Validación de datos de entrada mejorada
function validateMetricsJobData(data: any): { isValid: boolean; error?: string; quality?: number } {
  if (!data) {
    return { isValid: false, error: 'No data provided', quality: 0 };
  }
  
  let quality = 1.0;
  const issues: string[] = [];
  
  if (!data.postId || typeof data.postId !== 'string') {
    issues.push('Invalid or missing postId');
    quality -= 0.3;
  }
  
  if (!data.postUrl || typeof data.postUrl !== 'string') {
    issues.push('Invalid or missing postUrl');
    quality -= 0.3;
  }
  
  if (!data.platform || !['youtube', 'tiktok', 'twitter', 'instagram'].includes(data.platform)) {
    issues.push('Invalid or missing platform');
    quality -= 0.2;
  }
  
  // Validar formato de URL
  try {
    new URL(data.postUrl);
  } catch {
    issues.push('Invalid URL format');
    quality -= 0.2;
  }
  
  return { 
    isValid: quality >= 0.5, 
    error: issues.length > 0 ? issues.join('; ') : undefined,
    quality: Math.max(0, quality)
  };
}

// Proveedores de fallback para métricas
async function createMetricsProviders(postId: string, postUrl: string, platform: string) {
  return [
    {
      name: 'CreatorDB',
      priority: 1,
      isAvailable: true,
      execute: async () => {
        await creatorDBLimiter.waitForNextCall();
        return await metricsService.extractAndSaveMetrics(postId, postUrl, platform);
      },
      healthCheck: async () => {
        try {
          // Health check simple para CreatorDB
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Cache',
      priority: 2,
      isAvailable: true,
      execute: async () => {
        const cached = await postgresCacheService.get(`metrics:${postId}`);
        if (cached) {
          return cached;
        }
        throw new Error('No cached data available');
      },
      healthCheck: async () => {
        try {
          // Verificar que el servicio de cache esté funcionando
          await postgresCacheService.getStats();
          return true;
        } catch {
          return false;
        }
      }
    }
  ];
}

// Inicializar configuración
async function initializeMetricsConfig() {
  metricsConfig = await configManager.getMetricsConfig();
}

async function processMetricsJob(job: any): Promise<void> {

  // Verificar que job.data existe y es válido
  if (!job.data || typeof job.data !== 'object') {
    console.error(`❌ [METRICS_WORKER] Invalid job data for job ${job.id}:`, job.data);
    throw new Error('Invalid job data: data is missing or not an object');
  }

  const { postId, postUrl, platform } = job.data;
  
  // Validar datos de entrada con calidad
  const validation = validateMetricsJobData(job.data);
  if (!validation.isValid) {
    console.error(`❌ [METRICS_WORKER] Validation failed for post ${postId || 'undefined'}:`, validation.error);
    throw new Error(`Validation failed: ${validation.error}`);
  }
  
  // Evaluar alertas de calidad de datos
  if (validation.quality && validation.quality < 0.8) {
    await alertManager.evaluateData('metrics_worker', {
      postId,
      postUrl,
      platform,
      quality: validation.quality,
      issues: validation.error
    }, ['data_quality', 'metrics']);
  }
  
  try {        
    // Crear proveedores de fallback
    const providers = await createMetricsProviders(postId, postUrl, platform);
    
    // Ejecutar con fallbacks y timeout
    const fallbackPromise = fallbackManager.executeWithFallbacks(
      'metrics_extraction',
      providers,
      `metrics:${postId}`
    );
    
    // Timeout de 2 minutos para evitar jobs colgados
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Metrics extraction timeout after 2 minutes')), 120000);
    });
    
    const result = await Promise.race([fallbackPromise, timeoutPromise]);
    
    // Validar respuesta
    const validationResult = await responseValidator.validateResponse(
      result.data,
      'metrics',
      { platform, postId }
    );

    if (!validationResult.isValid) {
      // Evaluar alertas de calidad de datos
      await alertManager.evaluateData('metrics_worker', {
        postId,
        postUrl,
        platform,
        quality: validationResult.quality,
        issues: validationResult.issues,
        warnings: validationResult.warnings
      }, ['data_quality', 'metrics']);
    }

    // Registrar éxito en rate limiter
    creatorDBLimiter.recordSuccess();
            
  } catch (error) {
    console.error(`❌ [METRICS_WORKER] Failed to extract metrics for ${platform} post ${postId}:`, error);
    
    // Registrar fallo en rate limiter
    creatorDBLimiter.recordFailure();
    
    // Evaluar alertas de fallo
    await alertManager.evaluateData('metrics_worker', {
      postId,
      postUrl,
      platform,
      error: error instanceof Error ? error.message : 'Unknown error',
      attempts: job.attempts || 1
    }, ['worker_failure', 'metrics']);
    
    throw error;
  }
}

// Inicializar configuración y crear worker
let worker: any;
let metricsQueue: any;
let isInitialized = false;
let initPromise: Promise<void>;

// Función para inicializar el worker
async function initializeWorker() {
  if (isInitialized) return;
  
  if (!initPromise) {
    initPromise = initializeMetricsConfig().then(async () => {
      
      // Usar PostgreSQL queue service en lugar de BullMQ
      worker = {
        name: metricsConfig.name,
        async process(handler: (job: any) => Promise<void>) {
          return await postgresQueueService.process(metricsConfig.name, handler);
        },
        async close() {
          // Para PostgreSQL queues, no necesitamos cerrar nada específico
          // pero mantenemos la interfaz compatible con BullMQ
        }
      };
      
      // Iniciar el procesamiento automáticamente
      
      await postgresQueueService.process(metricsConfig.name, processMetricsJob);
      
      isInitialized = true;
      
    });
  }
  
  await initPromise;
}

// Función para obtener el worker (espera a que se inicialice)
export async function getMetricsWorker() {
  await initializeWorker();
  return worker;
}

// Función para obtener la cola (espera a que se inicialice)
export async function getMetricsQueue() {
  await initializeWorker();
  
  // Usar PostgreSQL queue service para obtener estadísticas
  const stats = await postgresQueueService.getQueueStats(metricsConfig.name);
  return stats;
}

// Inicializar automáticamente
initializeWorker().catch(console.error);

export { worker as metricsWorker, processMetricsJob }; 
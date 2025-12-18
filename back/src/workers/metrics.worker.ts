import { PostMetricsService } from '../services/post-metrics/post-metrics.service';
import { postgresQueueService } from '../services/queues/postgres-queue.service';
import { postgresCacheService } from '../services/cache/postgres-cache.service';
import {
  WorkerConfigManager,
  DEFAULT_METRICS_CONFIG,
} from './config/worker-config';
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
function validateMetricsJobData(data: any): {
  isValid: boolean;
  error?: string;
  quality?: number;
} {
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

  if (
    !data.platform ||
    !['youtube', 'tiktok', 'twitter', 'instagram'].includes(data.platform)
  ) {
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
    quality: Math.max(0, quality),
  };
}

// Proveedores de fallback para métricas
async function createMetricsProviders(
  postId: string,
  postUrl: string,
  platform: string,
) {
  return [
    {
      name: 'CreatorDB',
      priority: 1,
      isAvailable: true,
      execute: async () => {
        await creatorDBLimiter.waitForNextCall();
        return await metricsService.extractAndSaveMetrics(
          postId,
          postUrl,
          platform,
        );
      },
      healthCheck: async () => {
        try {
          // Health check simple para CreatorDB
          return true;
        } catch {
          return false;
        }
      },
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
      },
    },
  ];
}

// Inicializar configuración
async function initializeMetricsConfig() {
  metricsConfig = await configManager.getMetricsConfig();
}

async function processMetricsJob(job: any): Promise<void> {
  const jobStartTime = Date.now();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔄 [METRICS_WORKER] ========== STARTING METRICS JOB ==========`);
  console.log(`🔄 [METRICS_WORKER] Job ID: ${job.id || 'unknown'}`);
  console.log(`🔄 [METRICS_WORKER] Timestamp: ${new Date().toISOString()}`);
  console.log(
    `🔄 [METRICS_WORKER] Full job object:`,
    JSON.stringify(job, null, 2),
  );

  // Verificar que job.data existe y es válido
  if (!job.data || typeof job.data !== 'object') {
    console.error(
      `❌ [METRICS_WORKER] Invalid job data for job ${job.id}:`,
      job.data,
    );
    console.error(`❌ [METRICS_WORKER] job.data type: ${typeof job.data}`);
    console.error(
      `❌ [METRICS_WORKER] job keys: ${Object.keys(job || {}).join(', ')}`,
    );
    throw new Error('Invalid job data: data is missing or not an object');
  }

  const { postId, postUrl, platform } = job.data;

  console.log(`📋 [METRICS_WORKER] -------- JOB DETAILS --------`);
  console.log(`📋 [METRICS_WORKER] Post ID: ${postId}`);
  console.log(`📋 [METRICS_WORKER] Platform: ${platform}`);
  console.log(`📋 [METRICS_WORKER] Post URL (full): ${postUrl}`);
  console.log(`📋 [METRICS_WORKER] Job attempts: ${job.attempts || 1}`);
  console.log(
    `📋 [METRICS_WORKER] Job data keys: ${Object.keys(job.data).join(', ')}`,
  );

  // Validar datos de entrada con calidad
  console.log(`🔍 [METRICS_WORKER] -------- VALIDATING JOB DATA --------`);
  const validation = validateMetricsJobData(job.data);
  console.log(
    `🔍 [METRICS_WORKER] Validation result:`,
    JSON.stringify(validation, null, 2),
  );

  if (!validation.isValid) {
    console.error(
      `❌ [METRICS_WORKER] Validation failed for post ${
        postId || 'undefined'
      }:`,
      validation.error,
    );
    console.error(
      `❌ [METRICS_WORKER] Validation quality score: ${validation.quality}`,
    );
    throw new Error(`Validation failed: ${validation.error}`);
  }
  console.log(
    `✅ [METRICS_WORKER] Validation passed with quality: ${validation.quality}`,
  );

  // Evaluar alertas de calidad de datos
  if (validation.quality && validation.quality < 0.8) {
    await alertManager.evaluateData(
      'metrics_worker',
      {
        postId,
        postUrl,
        platform,
        quality: validation.quality,
        issues: validation.error,
      },
      ['data_quality', 'metrics'],
    );
  }

  try {
    console.log(`\n🚀 [METRICS_WORKER] -------- STARTING EXTRACTION --------`);
    console.log(`🚀 [METRICS_WORKER] Platform: ${platform}`);
    console.log(`🚀 [METRICS_WORKER] Post ID: ${postId}`);
    console.log(`🚀 [METRICS_WORKER] Post URL: ${postUrl}`);
    console.log(
      `🚀 [METRICS_WORKER] Time elapsed so far: ${Date.now() - jobStartTime}ms`,
    );

    // Crear proveedores de fallback
    console.log(`📦 [METRICS_WORKER] Creating fallback providers...`);
    const providers = await createMetricsProviders(postId, postUrl, platform);
    console.log(
      `📦 [METRICS_WORKER] Created ${providers.length} fallback providers:`,
    );
    providers.forEach((p, i) => {
      console.log(
        `📦 [METRICS_WORKER]   ${i + 1}. ${p.name} (priority: ${
          p.priority
        }, available: ${p.isAvailable})`,
      );
    });

    // Ejecutar con fallbacks y timeout
    console.log(
      `\n⚙️ [METRICS_WORKER] -------- EXECUTING WITH FALLBACKS --------`,
    );
    console.log(`⚙️ [METRICS_WORKER] Operation: metrics_extraction`);
    console.log(`⚙️ [METRICS_WORKER] Cache key: metrics:${postId}`);

    const fallbackPromise = fallbackManager.executeWithFallbacks(
      'metrics_extraction',
      providers,
      `metrics:${postId}`,
    );

    // Timeout de 2 minutos para evitar jobs colgados
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error('Metrics extraction timeout after 2 minutes')),
        120000,
      );
    });

    console.log(`⏱️ [METRICS_WORKER] Racing extraction vs timeout (2 min)...`);
    console.log(
      `⏱️ [METRICS_WORKER] Extraction start time: ${new Date().toISOString()}`,
    );

    const result = await Promise.race([fallbackPromise, timeoutPromise]);

    const extractionDuration = Date.now() - jobStartTime;
    console.log(`\n✅ [METRICS_WORKER] -------- EXTRACTION COMPLETED --------`);
    console.log(`✅ [METRICS_WORKER] Post ID: ${postId}`);
    console.log(`✅ [METRICS_WORKER] Duration: ${extractionDuration}ms`);
    console.log(`✅ [METRICS_WORKER] Result type: ${typeof result}`);
    console.log(
      `✅ [METRICS_WORKER] Result keys: ${Object.keys(result || {}).join(
        ', ',
      )}`,
    );

    // Validar respuesta
    console.log(`\n🔎 [METRICS_WORKER] -------- VALIDATING RESPONSE --------`);
    const validationResult = await responseValidator.validateResponse(
      result.data,
      'metrics',
      { platform, postId },
    );
    console.log(
      `🔎 [METRICS_WORKER] Response validation result:`,
      JSON.stringify(validationResult, null, 2),
    );

    if (!validationResult.isValid) {
      console.warn(`⚠️ [METRICS_WORKER] Response validation failed!`);
      console.warn(`⚠️ [METRICS_WORKER] Quality: ${validationResult.quality}`);
      console.warn(
        `⚠️ [METRICS_WORKER] Issues: ${validationResult.issues?.join(', ')}`,
      );
      console.warn(
        `⚠️ [METRICS_WORKER] Warnings: ${validationResult.warnings?.join(
          ', ',
        )}`,
      );
      // Evaluar alertas de calidad de datos
      await alertManager.evaluateData(
        'metrics_worker',
        {
          postId,
          postUrl,
          platform,
          quality: validationResult.quality,
          issues: validationResult.issues,
          warnings: validationResult.warnings,
        },
        ['data_quality', 'metrics'],
      );
    } else {
      console.log(`✅ [METRICS_WORKER] Response validation passed!`);
    }

    // Registrar éxito en rate limiter
    console.log(`📊 [METRICS_WORKER] Recording success in rate limiter...`);
    creatorDBLimiter.recordSuccess();

    const totalDuration = Date.now() - jobStartTime;
    console.log(
      `\n🎉 [METRICS_WORKER] ========== JOB COMPLETED SUCCESSFULLY ==========`,
    );
    console.log(`🎉 [METRICS_WORKER] Post ID: ${postId}`);
    console.log(`🎉 [METRICS_WORKER] Platform: ${platform}`);
    console.log(`🎉 [METRICS_WORKER] Total duration: ${totalDuration}ms`);
    console.log(`${'='.repeat(80)}\n`);
  } catch (error) {
    const errorDuration = Date.now() - jobStartTime;
    console.error(`\n❌ [METRICS_WORKER] ========== JOB FAILED ==========`);
    console.error(`❌ [METRICS_WORKER] Post ID: ${postId}`);
    console.error(`❌ [METRICS_WORKER] Platform: ${platform}`);
    console.error(`❌ [METRICS_WORKER] Post URL: ${postUrl}`);
    console.error(
      `❌ [METRICS_WORKER] Duration until failure: ${errorDuration}ms`,
    );
    console.error(
      `❌ [METRICS_WORKER] Error type: ${
        error?.constructor?.name || 'Unknown'
      }`,
    );
    console.error(
      `❌ [METRICS_WORKER] Error message: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
    console.error(
      `❌ [METRICS_WORKER] Error stack:`,
      error instanceof Error ? error.stack : 'N/A',
    );
    console.error(`❌ [METRICS_WORKER] Job attempts: ${job.attempts || 1}`);
    console.error(
      `❌ [METRICS_WORKER] Full error object:`,
      JSON.stringify(error, Object.getOwnPropertyNames(error || {}), 2),
    );

    // Registrar fallo en rate limiter
    console.error(`❌ [METRICS_WORKER] Recording failure in rate limiter...`);
    creatorDBLimiter.recordFailure();

    // Evaluar alertas de fallo
    console.error(`❌ [METRICS_WORKER] Evaluating failure alerts...`);
    await alertManager.evaluateData(
      'metrics_worker',
      {
        postId,
        postUrl,
        platform,
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts: job.attempts || 1,
      },
      ['worker_failure', 'metrics'],
    );

    console.error(`${'='.repeat(80)}\n`);
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
          return await postgresQueueService.process(
            metricsConfig.name,
            handler,
          );
        },
        async close() {
          // Para PostgreSQL queues, no necesitamos cerrar nada específico
          // pero mantenemos la interfaz compatible con BullMQ
        },
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

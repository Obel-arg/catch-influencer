import { createOptimizedWorker } from './base.worker';
import { ISentimentJob } from '../services/queues/sentiment.queue';
import { openAISentimentService } from '../services/analysis/openai-sentiment.service';
import { SentimentAnalysisService } from '../services/database/sentiment-analysis.service';
import { PostTopicsService } from '../services/post-topics.service';
import { postgresQueueService } from '../services/queues/postgres-queue.service';
import { WorkerConfigManager, DEFAULT_SENTIMENT_CONFIG } from './config/worker-config';
import { RateLimiterFactory } from './rate-limiting/adaptive-rate-limiter';

const configManager = WorkerConfigManager.getInstance();
const openAILimiter = RateLimiterFactory.getOpenAILimiter();

// Configuración dinámica para sentimientos
let sentimentConfig = DEFAULT_SENTIMENT_CONFIG;

// Inicializar configuración
async function initializeSentimentConfig() {
  sentimentConfig = await configManager.getSentimentConfig();
}

// Validación de datos de entrada
function validateSentimentJobData(data: any): { isValid: boolean; error?: string; estimatedTokens?: number } {
  if (!data) {
    return { isValid: false, error: 'No data provided' };
  }
  
  if (!data.postId || typeof data.postId !== 'string') {
    return { isValid: false, error: 'Invalid or missing postId' };
  }
  
  if (!data.comments || !Array.isArray(data.comments)) {
    return { isValid: false, error: 'Invalid or missing comments array' };
  }
  
  if (data.comments.length === 0) {
    return { isValid: false, error: 'Comments array is empty' };
  }
  
  // Validar cada comentario
  let totalTextLength = 0;
  for (const comment of data.comments) {
    if (!comment || typeof comment !== 'object') {
      return { isValid: false, error: 'Invalid comment object' };
    }
    
    if (!comment.text || typeof comment.text !== 'string') {
      return { isValid: false, error: 'Invalid or missing comment text' };
    }
    
    totalTextLength += comment.text.length;
  }
  
  // Estimar tokens (aproximadamente 4 caracteres por token)
  const estimatedTokens = Math.ceil(totalTextLength / 4);
  
  if (estimatedTokens > 8000) { // Límite conservador por batch
    return { isValid: false, error: 'Batch too large, too many tokens' };
  }
  
  return { isValid: true, estimatedTokens };
}

// Procesamiento en batches para evitar rate limits
async function processCommentsInBatches(comments: any[], batchSize: number = 50) {
  const batches = [];
  for (let i = 0; i < comments.length; i += batchSize) {
    batches.push(comments.slice(i, i + batchSize));
  }
  
  const results = [];
  for (const batch of batches) {
    // Rate limiting adaptativo entre batches
    await openAILimiter.waitForNextCall();
    
    const batchTexts = batch.map(c => c.text).filter(text => text && text.trim().length > 0);
    
    if (batchTexts.length === 0) {
      results.push([]);
      continue;
    }
    
    try {
      const { results: sentimentResults } = await openAISentimentService.analyzeSentimentsBatch(batchTexts);
      results.push(sentimentResults);
      
      // Estimar tokens usados (tracking simplificado)
      const estimatedTokens = Math.ceil(batchTexts.join('').length / 4);
      // Registrar uso de tokens en el rate limiter
      if (estimatedTokens > 1000) {
        openAILimiter.recordFailure(); // Penalizar por uso alto de tokens
      } else {
        openAILimiter.recordSuccess(); // Registrar éxito
      }
      
    } catch (error) {
      console.error('❌ [SENTIMENT_WORKER] Error processing batch:', error);
      // Continuar con batch vacío en caso de error
      results.push([]);
    }
  }
  
  return results.flat();
}

async function processSentimentJob(job: { id: string; data: ISentimentJob }): Promise<void> {
  const { postId, comments, isLastBatch } = job.data;

  

  // Validar datos de entrada
  const validation = validateSentimentJobData(job.data);
  if (!validation.isValid) {
    console.warn(`⚠️ [SENTIMENT_WORKER] Validation failed for post ${postId}: ${validation.error}`);
    
    if (isLastBatch) {
      try {
        await SentimentAnalysisService.markPostAnalysisAsCompleted(postId);
      } catch (error) {
        console.error(`❌ [SENTIMENT_WORKER] Error marking post ${postId} as completed:`, error);
      }
    }
    return;
  }


  // Verificar límite de tokens usando configuración dinámica
  const estimatedTokens = validation.estimatedTokens || 0;
  
  if (estimatedTokens > sentimentConfig.openAIMaxTokensPerMinute) {
    // Retrasar el job por 1 minuto
    await new Promise(resolve => setTimeout(resolve, 60000));
    throw new Error('Token limit exceeded, job will be retried');
  }

  try {
    // Filtrar comentarios válidos
    const validComments = comments.filter(c => c.text && c.text.trim().length > 0);
    
    if (validComments.length === 0) {
      console.warn(`⚠️ [SENTIMENT_WORKER] No valid comments to analyze for post ${postId}`);
      if (isLastBatch) {
        await SentimentAnalysisService.markPostAnalysisAsCompleted(postId);
      }
      return;
    }

    // Procesar comentarios en batches usando configuración dinámica
    const sentimentResults = await processCommentsInBatches(validComments, sentimentConfig.openAIBatchSize);
    
    if (sentimentResults.length > 0) {
      await SentimentAnalysisService.saveSentimentResults(postId, sentimentResults);
    }

    // Si es el último lote, analizar temas clave
    if (isLastBatch) {
      try {
        // Crear comentarios con sentimientos para el análisis de temas
        const commentsWithSentiments = comments.map((comment, index) => ({
          text: comment.text,
          sentiment: sentimentResults[index]?.label || 'neutral'
        }));

        // Analizar y guardar temas
        const postTopicsService = PostTopicsService.getInstance();
        const topicsResult = await postTopicsService.analyzeAndSavePostTopics(postId, commentsWithSentiments);
        
        if (topicsResult.success) {
        } else {
          console.warn(`⚠️ [SENTIMENT_WORKER] Topics analysis failed for post ${postId}`);
        }
      } catch (topicsError) {
        console.error(`❌ [SENTIMENT_WORKER] Error in topics analysis for post ${postId}:`, topicsError);
        // Continuar sin temas, no fallar el job completo
      }

      await SentimentAnalysisService.markPostAnalysisAsCompleted(postId);
    }
  } catch (error) {
    console.error(`❌ [SENTIMENT_WORKER] Error processing sentiment for post ${postId}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      postId,
      commentsCount: comments?.length,
      isLastBatch,
      jobId: job.id,
      timestamp: new Date().toISOString()
    });
    
    // Determinar si el error es recuperable
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    const isRecoverable = !errorMessage.includes('rate limit') && 
                         !errorMessage.includes('quota exceeded') &&
                         !errorMessage.includes('invalid api key');
    
    if (!isRecoverable) {
      console.warn(`⚠️ [SENTIMENT_WORKER] Non-recoverable error for post ${postId}, not retrying`);
      if (isLastBatch) {
        await SentimentAnalysisService.markPostAnalysisAsCompleted(postId);
      }
      return;
    }
    
    throw error;
  }
}

// Inicializar configuración y crear worker
let worker: any;
let sentimentQueue: any;
let isInitialized = false;
let initPromise: Promise<void>;

// Función para inicializar el worker
async function initializeWorker() {
  if (isInitialized) return;
  
  if (!initPromise) {
    initPromise = initializeSentimentConfig().then(async () => {
      
      // Usar PostgreSQL queue service en lugar de BullMQ
      worker = {
        name: sentimentConfig.name,
        async process(handler: (job: any) => Promise<void>) {
          return await postgresQueueService.process(sentimentConfig.name, handler);
        },
        async close() {
          // Para PostgreSQL queues, no necesitamos cerrar nada específico
          // pero mantenemos la interfaz compatible con BullMQ
        }
      };
      
      // Iniciar el procesamiento automáticamente
      await postgresQueueService.process(sentimentConfig.name, processSentimentJob);
      
      isInitialized = true; 
    });
  }
  
  await initPromise;
}

// Función para obtener el worker (espera a que se inicialice)
export async function getSentimentWorker() {
  await initializeWorker();
  return worker;
}

// Función para obtener la cola (espera a que se inicialice)
export async function getSentimentQueue() {
  await initializeWorker();
  
  // Usar PostgreSQL queue service para obtener estadísticas
  const stats = await postgresQueueService.getQueueStats(sentimentConfig.name);
  return stats;
}

// Inicializar automáticamente
initializeWorker().catch(console.error);

export { worker as sentimentWorker, processSentimentJob }; 
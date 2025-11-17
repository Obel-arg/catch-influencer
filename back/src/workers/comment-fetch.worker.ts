import { PostgresQueueService } from '../services/queues/postgres-queue.service';
import { PostCommentsAnalysisService } from '../services/post-metrics/post-comments-analysis.service';
import { YouTubeAnalysisService } from '../services/analysis/youtube-analysis.service';
import { InstagramAnalysisService } from '../services/analysis/instagram-analysis.service';
import { postgresCacheService } from '../services/cache/postgres-cache.service';
import { RateLimiterFactory } from './rate-limiting/adaptive-rate-limiter';
import { WorkerConfigManager } from './config/worker-config';
import { postTopicsService } from '../services/post-topics.service';
import { SentimentAnalysisService } from '../services/database/sentiment-analysis.service';
import supabase from '../config/supabase';

// Interfaces
export interface ICommentFetchJob {
  postId: string;
  postUrl: string;
  platform: 'youtube' | 'tiktok' | 'twitter' | 'instagram';
  maxComments?: number;
  includeSentiment?: boolean;
}

interface BaseExtractionResult {
  success: boolean;
  platform: string;
  error?: string;
}

interface YouTubeExtractionResult extends BaseExtractionResult {
  success: true;
  comments: any[];
  totalComments: number;
  analyzedComments: number;
  sentimentSummary: {
    positive: number;
    negative: number;
    neutral: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
  };
  topics?: any[];
  topicsStats?: any;
}

interface TikTokExtractionResult extends BaseExtractionResult {
  success: true;
  comments: any[];
  totalComments: number;
  extractedComments: number;
  webhookProcessed?: boolean;
  topics?: any[];
  topicsStats?: any;
}

interface TwitterExtractionResult extends BaseExtractionResult {
  success: true;
  comments: any[];
  totalComments: number;
  extractedComments: number;
  topics?: any[];
  topicsStats?: any;
}

interface InstagramExtractionResult extends BaseExtractionResult {
  success: true;
  comments: any[];
  totalComments: number;
  analyzedComments: number;
  sentimentSummary: {
    positive: number;
    negative: number;
    neutral: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
  };
  topics?: any[];
  topicsStats?: any;
}

type ExtractionResult = 
  | YouTubeExtractionResult 
  | TikTokExtractionResult 
  | TwitterExtractionResult 
  | InstagramExtractionResult
  | { success: false; platform: string; error: string };

// Configuración
let commentFetchConfig: any;
const postgresQueueService = PostgresQueueService.getInstance();
const postCommentsAnalysisService = PostCommentsAnalysisService.getInstance();

// Crear instancias de los servicios de análisis
const youtubeAnalysisService = new YouTubeAnalysisService();
const instagramAnalysisService = new InstagramAnalysisService();

// Inicializar configuración
async function initializeCommentFetchConfig() {
  const configManager = WorkerConfigManager.getInstance();
  commentFetchConfig = await configManager.getCommentFetchConfig();
}

// Detectar plataforma desde URL
function detectPlatform(url: string): 'youtube' | 'tiktok' | 'twitter' | 'instagram' {
  if (!url || typeof url !== 'string') {
    console.warn(`⚠️ [COMMENT-FETCH] Invalid URL for platform detection:`, url);
    return 'youtube'; // Default fallback
  }

  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.includes('tiktok.com')) return 'tiktok';
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
  if (lowerUrl.includes('instagram.com')) return 'instagram';
  
  console.warn(`⚠️ [COMMENT-FETCH] Unknown platform for URL: ${url}, defaulting to youtube`);
  return 'youtube'; // Default
}

// Extraer comentarios de YouTube
async function extractYouTubeComments(postUrl: string, maxComments: number = 500): Promise<ExtractionResult> {
  try {
    
    const result = await youtubeAnalysisService.analyzeYouTubeVideo(postUrl);
    
    if (result && result.comments) {
      return {
        success: true,
        platform: 'youtube',
        comments: result.comments,
        totalComments: result.totalComments || result.comments.length,
        analyzedComments: result.analyzedComments || result.comments.length,
        sentimentSummary: result.sentimentSummary || {
          positive: 0,
          negative: 0,
          neutral: 0,
          positivePercentage: 0,
          negativePercentage: 0,
          neutralPercentage: 0
        }
      };
    } else {
      console.error(`❌ [COMMENT-FETCH] YouTube extraction failed: No comments found`);
      return {
        success: false,
        platform: 'youtube',
        error: 'No comments found'
      };
    }
  } catch (error) {
    console.error(`❌ [COMMENT-FETCH] YouTube extraction error:`, error);
    return {
      success: false,
      platform: 'youtube',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Extraer comentarios de TikTok
async function extractTikTokComments(postUrl: string, maxComments: number = 500): Promise<ExtractionResult> {
  try {
    
    const result = await youtubeAnalysisService.analyzeTikTokVideo(postUrl);
    
    if (result && result.comments) {
      return {
        success: true,
        platform: 'tiktok',
        comments: result.comments,
        totalComments: result.totalComments || result.comments.length,
        extractedComments: result.analyzedComments || result.comments.length,
        webhookProcessed: false
      };
    } else {
      console.error(`❌ [COMMENT-FETCH] TikTok extraction failed: No comments found`);
      return {
        success: false,
        platform: 'tiktok',
        error: 'No comments found'
      };
    }
  } catch (error) {
    console.error(`❌ [COMMENT-FETCH] TikTok extraction error:`, error);
    return {
      success: false,
      platform: 'tiktok',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Extraer comentarios de Twitter
async function extractTwitterComments(postUrl: string, maxComments: number = 500): Promise<ExtractionResult> {
  try {
    
    const result = await youtubeAnalysisService.analyzeTwitterPost(postUrl);
    
    if (result && result.comments) {
      return {
        success: true,
        platform: 'twitter',
        comments: result.comments,
        totalComments: result.totalComments || result.comments.length,
        extractedComments: result.analyzedComments || result.comments.length
      };
    } else {
      console.error(`❌ [COMMENT-FETCH] Twitter extraction failed: No comments found`);
      return {
        success: false,
        platform: 'twitter',
        error: 'No comments found'
      };
    }
  } catch (error) {
    console.error(`❌ [COMMENT-FETCH] Twitter extraction error:`, error);
    return {
      success: false,
      platform: 'twitter',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Extraer comentarios de Instagram
async function extractInstagramComments(postUrl: string, maxComments: number = 500): Promise<ExtractionResult> {
  try {
    
    // Usar el servicio de análisis de Instagram que maneja todo el proceso
    const result = await instagramAnalysisService.analyzeInstagramPost(postUrl);
    
    if (!result || result.comments.length === 0) {
      return {
        success: false,
        platform: 'instagram',
        error: 'No comments found or analysis failed'
      };
    }
    
    
    return {
      success: true,
      platform: 'instagram',
      comments: result.comments,
      totalComments: result.totalComments,
      analyzedComments: result.analyzedComments,
      sentimentSummary: result.sentimentSummary,
      topics: [],
      topicsStats: {}
    };
    
  } catch (error) {
    console.error(`❌ [INSTAGRAM-COMMENTS] Error extracting comments:`, error);
    return {
      success: false,
      platform: 'instagram',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extrae comentarios de Instagram usando el postId del sistema (UUID)
 */
async function extractInstagramCommentsWithSystemId(systemPostId: string, postUrl: string, maxComments: number = 500): Promise<ExtractionResult> {
  try {
    
    // Usar el servicio de análisis de Instagram que maneja todo el proceso
    const result = await instagramAnalysisService.analyzeInstagramPost(postUrl, systemPostId);
    
    if (!result || result.comments.length === 0) {
      return {
        success: false,
        platform: 'instagram',
        error: 'No comments found or analysis failed'
      };
    }
    
    
    return {
      success: true,
      platform: 'instagram',
      comments: result.comments,
      totalComments: result.totalComments,
      analyzedComments: result.analyzedComments,
      sentimentSummary: result.sentimentSummary,
      topics: [],
      topicsStats: {}
    };
    
  } catch (error) {
    console.error(`❌ [INSTAGRAM-COMMENTS] Error extracting comments:`, error);
    return {
      success: false,
      platform: 'instagram',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Guarda los comentarios en la nueva columna JSONB de post_metrics
 */
async function saveCommentsToDatabase(postId: string, platform: string, comments: any[], sentimentSummary?: any) {
  

  try {
    
    if (!postId || !comments || comments.length === 0) {
      console.warn(`⚠️ [COMMENT-FETCH] Datos inválidos para guardar comentarios: postId=${postId}, comments.length=${comments?.length}`);
      return;
    }

    // Verificar si existe el registro en post_metrics y crearlo si no existe
    let attempts = 0;
    const maxAttempts = 10; // Reducido a 10 intentos = 30 segundos máximo
    const waitTime = 3000; // 3 segundos entre intentos
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Verificar si existe el registro en post_metrics
      const { data: existingRecord, error: checkError } = await supabase
        .from('post_metrics')
        .select('id')
        .eq('post_id', postId)
        .limit(1);
      
      if (checkError) {
        console.error(`❌ [COMMENT-FETCH] Error checking for post_metrics record:`, checkError);
      } else if (existingRecord && existingRecord.length > 0) {
        break;
      } else {
        
        if (attempts >= maxAttempts) {
          // Crear un registro básico en post_metrics para que podamos guardar los comentarios
          
          const { data: newRecord, error: createError } = await supabase
            .from('post_metrics')
            .insert([{
              post_id: postId,
              platform: platform as 'youtube' | 'instagram' | 'tiktok' | 'twitter',
              content_id: postId, // Usar postId como content_id temporal
              post_url: '', // URL vacía por ahora
              title: '',
              likes_count: 0,
              comments_count: comments.length,
              views_count: 0,
              engagement_rate: 0,
              platform_data: {},
              quota_used: 0,
              api_timestamp: Date.now(),
              api_success: true,
              api_error: null,
              raw_response: null,
              created_at: new Date(),
              updated_at: new Date()
            }])
            .select()
            .single();

          if (createError) {
            console.error(`❌ [COMMENT-FETCH] Error creating basic post_metrics record:`, createError);
            return;
          }
          
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Convertir comentarios al formato estándar
    const formattedComments = comments.map((comment, index) => {
      const formatted = {
        id: comment.id || comment.commentId || Math.random().toString(36),
        text: comment.text || comment.content || '',
        author: comment.author || comment.authorName || 'Usuario desconocido',
        publishedAt: comment.publishedAt || comment.createdAt || new Date().toISOString(),
        likeCount: comment.likeCount || comment.likes || 0,
        replyCount: comment.replyCount || comment.replies || 0,
        platform: platform as 'youtube' | 'instagram' | 'tiktok',
        sentiment: comment.sentiment ? {
          label: comment.sentiment.label || 'neutral',
          score: comment.sentiment.score || 0.5,
          confidence: comment.sentiment.confidence || 0.1,
          method: comment.sentiment.method || 'openai'
        } : undefined,
        scrapedAt: new Date().toISOString(),
      };

      

      return formatted;
    });

    

    // Calcular resumen de sentimientos
    
    const positiveCount = formattedComments.filter(c => c.sentiment?.label === 'positive').length;
    const negativeCount = formattedComments.filter(c => c.sentiment?.label === 'negative').length;
    const neutralCount = formattedComments.filter(c => c.sentiment?.label === 'neutral').length;
    const totalAnalyzed = formattedComments.filter(c => c.sentiment).length;
    
    const sentimentSummaryData = sentimentSummary || {
      positive: positiveCount,
      negative: negativeCount,
      neutral: neutralCount,
      total_analyzed: totalAnalyzed,
      average_score: formattedComments.reduce((sum, c) => sum + (c.sentiment?.score || 0), 0) / formattedComments.length,
      positivePercentage: totalAnalyzed > 0 ? (positiveCount / totalAnalyzed) * 100 : 0,
      negativePercentage: totalAnalyzed > 0 ? (negativeCount / totalAnalyzed) * 100 : 0,
      neutralPercentage: totalAnalyzed > 0 ? (neutralCount / totalAnalyzed) * 100 : 0
    };

    // Determinar el sentimiento predominante para el frontend
    let predominantSentiment = 'neutral';
    if (sentimentSummaryData.positive > sentimentSummaryData.negative && sentimentSummaryData.positive > sentimentSummaryData.neutral) {
      predominantSentiment = 'positive';
    } else if (sentimentSummaryData.negative > sentimentSummaryData.positive && sentimentSummaryData.negative > sentimentSummaryData.neutral) {
      predominantSentiment = 'negative';
    }

    

    // Extraer temas si existen
    const topics = comments[0]?.topics || [];

    const analysisData = {
      comments: formattedComments,
      analysis_metadata: {
        analyzed_at: new Date().toISOString(),
        model_used: 'comment-fetch-worker',
        processing_time_ms: 0,
        total_comments: formattedComments.length,
        platform
      }
    };

    

    // Guardar en la nueva columna JSONB
    
    await postCommentsAnalysisService.saveCommentsAnalysis(postId, analysisData);

    

    // Guardar también en sentiment_analysis para el frontend
    
    const sentimentData = {
      post_id: postId,
      platform: platform as 'youtube' | 'tiktok' | 'twitter' | 'instagram',
      positive_count: sentimentSummaryData.positive || 0,
      negative_count: sentimentSummaryData.negative || 0,
      neutral_count: sentimentSummaryData.neutral || 0,
      total_comments: formattedComments.length,
      positive_percentage: sentimentSummaryData.positivePercentage || 0,
      negative_percentage: sentimentSummaryData.negativePercentage || 0,
      neutral_percentage: sentimentSummaryData.neutralPercentage || 0,
      analyzed_at: new Date().toISOString()
    };

    try {
      await SentimentAnalysisService.saveSentimentAnalysis(sentimentData);
      
    } catch (sentimentError) {
      console.error(`❌ [COMMENT-FETCH] Error saving sentiment analysis:`, sentimentError);
    }

    // Verificar que se guardó correctamente
    
    const savedAnalysis = await postCommentsAnalysisService.getCommentsAnalysis(postId);
    if (savedAnalysis) {
      
    } else {
      console.warn(`⚠️ [COMMENT-FETCH] Verification failed: No analysis data found after saving`);
      
      // Intentar verificar directamente en la base de datos
      
      const { data: directCheck, error: directError } = await supabase
        .from('post_metrics')
        .select('id, updated_at, comments_analysis')
        .eq('post_id', postId)
        .order('updated_at', { ascending: false });

      if (directError) {
        console.error(`❌ [COMMENT-FETCH] Direct verification error:`, directError);
      } else if (directCheck && directCheck.length > 0) {
        
        
        // Buscar el registro más reciente con comments_analysis
        const recordWithComments = directCheck.find(r => r.comments_analysis);
        if (recordWithComments) {
          
        } else {
          console.warn(`⚠️ [COMMENT-FETCH] Records exist but none have comments_analysis - UPDATE may have failed`);
          
          // Verificar si hay algún registro con comments_analysis no nulo
          const { data: nonNullCheck, error: nonNullError } = await supabase
            .from('post_metrics')
            .select('id, updated_at, comments_analysis')
            .eq('post_id', postId)
            .not('comments_analysis', 'is', null)
            .limit(1);
            
          if (nonNullError) {
            console.error(`❌ [COMMENT-FETCH] Error checking for non-null comments_analysis:`, nonNullError);
          } else if (nonNullCheck && nonNullCheck.length > 0) {
            
          } else {
            console.error(`❌ [COMMENT-FETCH] No records found with comments_analysis - UPDATE definitely failed`);
          }
        }
      } else {
        console.warn(`⚠️ [COMMENT-FETCH] No records found for post ${postId}`);
      }
    }

  } catch (error) {
    console.error(`❌ [COMMENT-FETCH] Error saving comments to database:`, error);
    console.error(`🔍 [COMMENT-FETCH] Error details:`, {
      postId,
      platform,
      commentsCount: comments?.length,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    });
  }
}

/**
 * Función principal del worker optimizada
 */
async function processCommentFetchJob(job: any): Promise<void> {
  console.log(`🔵 [COMMENT-FETCH] ========== STARTING JOB ${job.id} ==========`);
  console.log(`🔵 [COMMENT-FETCH] Job created at: ${new Date(job.created_at || Date.now()).toISOString()}`);

  // Verificar que job.data existe y es válido
  if (!job.data || typeof job.data !== 'object') {
    console.error(`❌ [COMMENT-FETCH] Invalid job data for job ${job.id}:`, job.data);
    throw new Error('Invalid job data: data is missing or not an object');
  }

  const { postId, postUrl, platform: specifiedPlatform, maxComments = 500, includeSentiment = true } = job.data as ICommentFetchJob;
  console.log(`🔵 [COMMENT-FETCH] Job data: postId=${postId}, platform=${specifiedPlatform}, url=${postUrl}`);

  // Validar datos requeridos
  if (!postId) {
    console.error(`❌ [COMMENT-FETCH] Missing postId in job data:`, job.data);
    throw new Error('Missing required field: postId');
  }

  if (!postUrl) {
    console.error(`❌ [COMMENT-FETCH] Missing postUrl in job data:`, job.data);
    throw new Error('Missing required field: postUrl');
  }

  try {
    // Detectar plataforma si no se especifica
    const platform = specifiedPlatform || detectPlatform(postUrl);
    console.log(`🔵 [COMMENT-FETCH] Detected platform: ${platform}`);

    let result: ExtractionResult;

    // Extraer comentarios según la plataforma con timeout
    const extractionPromise = (async () => {
      switch (platform) {
        case 'youtube':
          return await extractYouTubeComments(postUrl, maxComments);
        case 'tiktok':
          return await extractTikTokComments(postUrl, maxComments);
        case 'twitter':
          return await extractTwitterComments(postUrl, maxComments);
        case 'instagram':
          // Para Instagram, usar el postId del sistema (UUID) en lugar del ID del post de Instagram
          return await extractInstagramCommentsWithSystemId(postId, postUrl, maxComments);
        default:
          throw new Error(`Plataforma no soportada: ${platform}`);
      }
    })();
    
    // Timeout de 10 minutos para extracción de comentarios
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Comment extraction timeout after 10 minutes')), 600000);
    });
    
    result = await Promise.race([extractionPromise, timeoutPromise]);

    if (!result.success) {
      // Mark analysis as completed with 0 comments so UI knows it failed
      console.log(`⚠️ [COMMENT-FETCH] Extraction failed for ${postId}, marking as completed with no comments`);
      await SentimentAnalysisService.markPostAnalysisAsCompleted(postId);
      throw new Error(`Error en extracción de ${platform}: ${result.error}`);
    }

    // Guardar en la nueva columna JSONB de post_metrics
    const sentimentSummary = 'sentimentSummary' in result ? result.sentimentSummary : undefined;
    await saveCommentsToDatabase(postId, platform, result.comments, sentimentSummary);


    // Analizar temas de los comentarios extraídos con timeout
    
    try {
      // Verificar si ya existen temas para este post
      const existingTopics = await postTopicsService.getPostTopics(postId);
      if (existingTopics && existingTopics.length > 0) {
      } else {
        
        // Ejecutar análisis de temas con timeout de 2 minutos
        const topicAnalysisPromise = postTopicsService.analyzeTopics(postId);
        const topicTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Topic analysis timeout after 2 minutes')), 120000);
        });
        
        const topicAnalysisResult = await Promise.race([topicAnalysisPromise, topicTimeoutPromise]) as {
          success: boolean;
          error?: string;
          method?: string;
        };
        
        if (topicAnalysisResult.success) {
        } else {
          console.warn(`⚠️ [COMMENT-FETCH] Topic analysis failed for post ${postId}:`, {
            error: topicAnalysisResult.error,
            method: topicAnalysisResult.method
          });
        }
      }
    } catch (topicError) {
      console.error(`❌ [COMMENT-FETCH] Error in topic analysis for post ${postId}:`, topicError);
      // No fallar el job completo por errores de análisis de temas
    }


  } catch (error) {
    console.error(`❌ [COMMENT-FETCH] Error en procesamiento:`, error);
    throw error;
  }
}

// Inicializar configuración y crear worker
let worker: any;
let commentFetchQueue: any;
let isInitialized = false;
let initPromise: Promise<void>;

// Función para inicializar el worker
async function initializeWorker() {
  if (isInitialized) return;
  
  if (!initPromise) {
    initPromise = initializeCommentFetchConfig().then(async () => {
      
      
      // Usar PostgreSQL queue service en lugar de BullMQ
      worker = {
        name: commentFetchConfig.name,
        async process(handler: (job: any) => Promise<void>) {
          return await postgresQueueService.process(commentFetchConfig.name, handler);
        },
        async close() {
          // Para PostgreSQL queues, no necesitamos cerrar nada específico
          // pero mantenemos la interfaz compatible con BullMQ
          
        }
      };
      
      // Iniciar el procesamiento automáticamente
      
      await postgresQueueService.process(commentFetchConfig.name, processCommentFetchJob);
      
      isInitialized = true;
      
    });
  }
  
  await initPromise;
}

// Función para obtener el worker (espera a que se inicialice)
export async function getCommentFetchWorker() {
  await initializeWorker();
  return worker;
}

// Función para obtener la cola (espera a que se inicialice)
export async function getCommentFetchQueue() {
  await initializeWorker();
  
  // Usar PostgreSQL queue service para obtener estadísticas
  const stats = await postgresQueueService.getQueueStats(commentFetchConfig.name);
  return stats;
}

// Inicializar automáticamente
initializeWorker().catch(console.error);

export { worker as commentFetchWorker, processCommentFetchJob }; 
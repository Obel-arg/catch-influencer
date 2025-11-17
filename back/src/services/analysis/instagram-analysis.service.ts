import { InstagramCommentsService } from '../instagram/instagram-comments.service';
import { openAISentimentService, HybridSentimentResult } from './openai-sentiment.service';
import { multilingualRobertaSentimentService, MultilingualRobertaSentimentResult } from './multilingual-roberta-sentiment.service';
import { postgresCacheService } from '../cache/postgres-cache.service';
import { postCommentsAnalysisService } from '../post-metrics/post-comments-analysis.service';
import { SentimentAnalysisService, PostMetrics } from '../database/sentiment-analysis.service';
const vader = require('vader-sentiment');

function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), ms)
  );
  return Promise.race([promise, timeout]);
}

export interface InstagramComment {
  id: string;
  text: string;
  author: string;
  publishedAt: string;
  likeCount: number;
  replyCount: number;
}

export interface SentimentResult {
  label: string;
  score: number;
  confidence: number;
  method: string; // 'xenova', 'contextual', 'vader', 'pattern'
  rawScores?: {
    negative: number;
    neutral: number;
    positive: number;
  };
}

export interface CommentWithSentiment extends InstagramComment {
  sentiment: SentimentResult;
}

export interface InstagramAnalysisResult {
  postId: string;
  postUrl: string;
  totalComments: number;
  analyzedComments: number;
  comments: CommentWithSentiment[];
  sentimentSummary: {
    positive: number;
    negative: number;
    neutral: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
  };
  platform: string;
}

export interface OptimizedInstagramAnalysisResult extends Omit<InstagramAnalysisResult, 'comments'> {
  comments: CommentWithSentiment[];
  processingStats: {
    totalProcessed: number;
    processingTimeMs: number;
    batchesProcessed: number;
    averageProcessingTimePerComment: number;
    modelInfo?: {
      name: string;
      method: string;
      accuracy: string;
    };
  };
  source?: 'cache' | 'live';
}

export class InstagramAnalysisService {
  // Patrones contextuales multiidioma para fallback
  private contextualPatterns = {
    // Patrones de sentimientos positivos
    positive: {
      spanish: [
        /muy\s+(bueno|buena|bien|genial|excelente|increíble|fantástico|perfecto)/i,
        /me\s+(encanta|gusta|fascina|ama)/i,
        /(excelente|genial|increíble|fantástico|maravilloso|perfecto|brutal|espectacular)/i,
        /te\s+(quiero|amo|adoro)/i,
        /(gracias|felicidades|enhorabuena)/i,
        /muy\s+bien/i,
        /qué\s+(bueno|bien|genial)/i,
        /(love|amazing|great|excellent|awesome|perfect|wonderful)/i
      ],
      english: [
        /(love|amazing|great|excellent|awesome|perfect|wonderful|fantastic|incredible|brilliant)/i,
        /very\s+(good|nice|cool|great)/i,
        /(thank\s+you|thanks|appreciate)/i,
        /so\s+(good|great|cool|nice)/i
      ],
      portuguese: [
        /(muito\s+bom|excelente|incrível|fantástico|perfeito|maravilhoso)/i,
        /te\s+(amo|adoro)/i,
        /(obrigado|parabéns)/i
      ]
    },
    
    // Patrones de sentimientos negativos
    negative: {
      spanish: [
        /muy\s+(malo|mala|mal|horrible|terrible|pésimo|awful)/i,
        /me\s+(disgusta|molesta|fastidia|da\s+asco)/i,
        /(horrible|terrible|pésimo|awful|disgusting|hate)/i,
        /qué\s+(malo|mal|horrible)/i,
        /(odio|detesto)/i
      ],
      english: [
        /(hate|terrible|awful|horrible|disgusting|worst|sucks|bad|pathetic)/i,
        /very\s+(bad|terrible|awful)/i,
        /so\s+(bad|terrible|awful|annoying)/i
      ],
      portuguese: [
        /(muito\s+ruim|horrível|terrível|péssimo|odeio)/i,
        /que\s+(ruim|horrível)/i
      ]
    },

    // Patrones de contexto positivo
    positiveContext: [
      /no\s+está\s+(mal|nada\s+mal)/i,
      /nada\s+mal/i,
      /para\s+nada\s+mal/i,
      /que\s+mal\s*[;,]*\s*que\s+bien/i,
      /mal.*bien/i,
      /not\s+bad/i,
      /não\s+está\s+mal/i
    ],

    // Patrones de negación que invierten el sentimiento
    negation: [
      /no\s+es\s+(malo|mala|horrible|terrible)/i,
      /no\s+está\s+(mal|malo)/i,
      /not\s+(bad|terrible|awful)/i,
      /não\s+(é|está)\s+(ruim|mal)/i
    ]
  };

  /**
   * Convierte comentarios de Instagram al formato estándar
   */
  private convertInstagramCommentsFormat(instagramComments: any[]): InstagramComment[] {
    return instagramComments.map(comment => ({
      id: comment.id || Math.random().toString(36).substr(2, 9),
      text: comment.text || comment.comment || '',
      author: comment.author?.username || comment.username || 'unknown',
      publishedAt: comment.timestamp || comment.createdAt || new Date().toISOString(),
      likeCount: comment.likesCount || comment.likes || 0,
      replyCount: comment.repliesCount || comment.replies?.length || 0
    }));
  }

  /**
   * Extrae el ID del post de una URL de Instagram
   */
  private extractPostId(url: string): string | null {
    
    const patterns = [
      // Mejorado para manejar parámetros de query como ?img_index=1
      /instagram\.com\/(?:[^\/]+\/)?p\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/(?:[^\/]+\/)?reel\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/(?:[^\/]+\/)?tv\/([A-Za-z0-9_-]+)/,
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = url.match(pattern);
      
      if (match && match[1]) {
        return match[1];
      }
    }

    console.error(`❌ [INSTAGRAM ANALYSIS] No se pudo extraer Post ID de: ${url}`);
    return null;
  }

  /**
   * Extrae comentarios de Instagram usando Apify y devuelve el total.
   */
  private async extractComments(postUrl: string, maxComments: number = 10000): Promise<{ comments: InstagramComment[], totalComments: number }> {
    try {
      const EXTRACTION_TIMEOUT = 180000; // 3 minutos
      const instagramCommentsService = InstagramCommentsService.getInstance();
      const request = instagramCommentsService.getPostComments(postUrl, maxComments);
      const result = await withTimeout(
        request, 
        EXTRACTION_TIMEOUT,
        `Timeout de ${EXTRACTION_TIMEOUT / 1000}s superado para extraer comentarios de Instagram: ${postUrl}`
      );
      
      if (!result || !result.success || !result.data) {
        return { comments: [], totalComments: 0 };
      }

      const convertedComments = this.convertInstagramCommentsFormat(result.data);
      return { comments: convertedComments, totalComments: result.totalComments || convertedComments.length };

    } catch (error) {
      console.error('❌ [APIFY] ERROR extrayendo comentarios de Instagram:', error);
      return { comments: [], totalComments: 0 };
    }
  }

  /**
   * Analiza sentimiento usando el modelo principal (RoBERTa multilingüe)
   */
  private async analyzeSentimentWithModel(text: string): Promise<SentimentResult> {
    try {
      const ROBERTA_TIMEOUT = 10000; // 10 segundos
      const request = multilingualRobertaSentimentService.analyzeSentiment(text);
      const result: MultilingualRobertaSentimentResult = await withTimeout(
        request,
        ROBERTA_TIMEOUT,
        `Timeout de ${ROBERTA_TIMEOUT}ms superado para analizar sentimiento con RoBERTa.`
      );
      
      return {
        label: result.label,
        score: result.score,
        confidence: result.confidence,
        method: 'multilingual-roberta',
        rawScores: result.rawScores
      };
    } catch (error) {
      return this.analyzeSentimentIntelligent(text);
    }
  }

  /**
   * Análisis de sentimiento inteligente con patrones contextuales (fallback)
   */
  private analyzeSentimentIntelligent(text: string): SentimentResult {
    const cleanText = text.toLowerCase().trim();
    
    // Verificar patrones de negación primero
    const hasNegation = this.contextualPatterns.negation.some(pattern => pattern.test(cleanText));
    if (hasNegation) {
      return {
        label: 'POSITIVE',
        score: 0.7,
        confidence: 0.8,
        method: 'contextual-negation'
      };
    }

    // Verificar contexto positivo
    const hasPositiveContext = this.contextualPatterns.positiveContext.some(pattern => pattern.test(cleanText));
    if (hasPositiveContext) {
      return {
        label: 'POSITIVE',
        score: 0.6,
        confidence: 0.75,
        method: 'contextual-positive'
      };
    }

    // Contar patrones positivos y negativos
    let positiveCount = 0;
    let negativeCount = 0;

    // Contar patrones en todos los idiomas
    Object.values(this.contextualPatterns.positive).forEach(patterns => {
      positiveCount += patterns.filter(pattern => pattern.test(cleanText)).length;
    });

    Object.values(this.contextualPatterns.negative).forEach(patterns => {
      negativeCount += patterns.filter(pattern => pattern.test(cleanText)).length;
    });

    // Determinar sentimiento basado en patrones
    if (positiveCount > negativeCount) {
      return {
        label: 'POSITIVE',
        score: Math.min(0.6 + (positiveCount * 0.1), 0.9),
        confidence: 0.7,
        method: 'contextual-patterns'
      };
    } else if (negativeCount > positiveCount) {
      return {
        label: 'NEGATIVE',
        score: Math.min(0.6 + (negativeCount * 0.1), 0.9),
        confidence: 0.7,
        method: 'contextual-patterns'
      };
    }

    // Fallback a VADER si no hay patrones claros
    try {
      const vaderResult = vader.SentimentIntensityAnalyzer.polarity_scores(text);
      const compound = vaderResult.compound;
      
      let label: string;
      if (compound >= 0.05) {
        label = 'POSITIVE';
      } else if (compound <= -0.05) {
        label = 'NEGATIVE';
      } else {
        label = 'NEUTRAL';
      }

      return {
        label,
        score: Math.abs(compound),
        confidence: 0.6,
        method: 'vader',
        rawScores: {
          positive: vaderResult.pos,
          neutral: vaderResult.neu,
          negative: vaderResult.neg
        }
      };
    } catch (error) {
      // Último fallback: neutral
      return {
        label: 'NEUTRAL',
        score: 0.5,
        confidence: 0.5,
        method: 'fallback'
      };
    }
  }

  /**
   * Analiza sentimientos en lotes usando OpenAI como método principal
   */
  private async analyzeSentimentsBatch(comments: InstagramComment[]): Promise<{
    results: CommentWithSentiment[];
    stats: { 
      processingTimeMs: number; 
      batchesProcessed: number; 
      averageTimePerComment: number; 
      modelInfo?: {
        name: string;
        method: string;
        accuracy: string;
      } 
    };
  }> {
    const startTime = Date.now();
    
    // Extraer textos de los comentarios
    const commentTexts = comments.map(comment => comment.text);
    
    try {
      // Usar OpenAI como método principal
      const sentimentResult = await openAISentimentService.analyzeSentimentsBatch(commentTexts, 10);
      
      // Combinar resultados de sentimientos con datos de comentarios
      const results: CommentWithSentiment[] = comments.map((comment, index) => {
        const sentiment = sentimentResult.results[index];
        return {
          ...comment,
          sentiment: {
            label: sentiment.label,
            score: sentiment.score,
            confidence: sentiment.confidence,
            method: sentiment.method,
            reasoning: sentiment.reasoning,
            rawScores: sentiment.rawScores
          }
        };
      });

      return {
        results,
        stats: {
          processingTimeMs: sentimentResult.stats.processingTimeMs,
          batchesProcessed: sentimentResult.stats.batchesProcessed,
          averageTimePerComment: sentimentResult.stats.averageTimePerComment,
          modelInfo: {
            name: sentimentResult.stats.modelInfo.primary,
            method: 'hybrid-openai',
            accuracy: sentimentResult.stats.modelInfo.accuracy
          }
        }
      };

    } catch (error) {
      console.error('❌ Error en análisis de sentimientos con OpenAI, usando fallback:', error);
      
      // Fallback al método anterior
      const batchSize = 200;
      const results: CommentWithSentiment[] = [];
      let batchesProcessed = 0;

      for (let i = 0; i < comments.length; i += batchSize) {
        const batch = comments.slice(i, i + batchSize);

        const batchPromises = batch.map(async (comment) => {
          const sentiment = await this.analyzeSentimentWithModel(comment.text);
          return {
            ...comment,
            sentiment
          };
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        batchesProcessed++;

        if (i + batchSize < comments.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const processingTimeMs = Date.now() - startTime;

      return {
        results,
        stats: {
          processingTimeMs,
          batchesProcessed,
          averageTimePerComment: processingTimeMs / comments.length,
          modelInfo: {
            name: 'RoBERTa Multilingüe + Contextual Patterns + VADER (Fallback)',
            method: 'hybrid-fallback',
            accuracy: 'Alta precisión multilingüe (modo fallback)'
          }
        }
      };
    }
  }

  /**
   * Calcula resumen de sentimientos usando el servicio híbrido
   */
  private calculateSentimentSummary(comments: CommentWithSentiment[]) {
    // Convertir comentarios al formato HybridSentimentResult
    const hybridResults: HybridSentimentResult[] = comments.map(comment => ({
      label: comment.sentiment.label as 'positive' | 'negative' | 'neutral',
      score: comment.sentiment.score,
      confidence: comment.sentiment.confidence,
      method: comment.sentiment.method,
      reasoning: (comment.sentiment as any).reasoning,
      rawScores: comment.sentiment.rawScores
    }));

    // Usar el método del servicio OpenAI para calcular el resumen
    const summary = openAISentimentService.calculateSentimentSummary(hybridResults, 0.5);

    return {
      positive: summary.positive,
      negative: summary.negative,
      neutral: summary.neutral,
      positivePercentage: summary.positivePercentage,
      negativePercentage: summary.negativePercentage,
      neutralPercentage: summary.neutralPercentage
    };
  }

  /**
   * Selecciona una muestra representativa de comentarios
   */
  private selectCommentsSample(comments: CommentWithSentiment[], sampleSize: number = 100): CommentWithSentiment[] {
    if (comments.length <= sampleSize) {
      return comments;
    }

    // Separar por sentimiento
    const positive = comments.filter(c => c.sentiment.label === 'positive');
    const negative = comments.filter(c => c.sentiment.label === 'negative');
    const neutral = comments.filter(c => c.sentiment.label === 'neutral');

    // Calcular proporciones
    const total = comments.length;
    const positiveRatio = positive.length / total;
    const negativeRatio = negative.length / total;
    const neutralRatio = neutral.length / total;

    // Calcular tamaños de muestra manteniendo proporciones
    const positiveSample = Math.round(sampleSize * positiveRatio);
    const negativeSample = Math.round(sampleSize * negativeRatio);
    const neutralSample = sampleSize - positiveSample - negativeSample;

    // Seleccionar muestras aleatorias
    const selectedPositive = this.getRandomSample(positive, positiveSample);
    const selectedNegative = this.getRandomSample(negative, negativeSample);
    const selectedNeutral = this.getRandomSample(neutral, neutralSample);

    // Combinar y mezclar
    const sample = [...selectedPositive, ...selectedNegative, ...selectedNeutral];
    return this.shuffleArray(sample);
  }

  /**
   * Obtiene una muestra aleatoria de un array
   */
  private getRandomSample<T>(array: T[], size: number): T[] {
    if (array.length <= size) return array;
    
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }

  /**
   * Mezcla un array aleatoriamente
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Guarda comentarios en la nueva columna JSONB de post_metrics
   */
  private async saveCommentsToJSONB(postId: string, postUrl: string, comments: CommentWithSentiment[]): Promise<void> {
    try {
      // Convertir comentarios al formato estándar
      const formattedComments = comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        author: comment.author,
        publishedAt: comment.publishedAt,
        likeCount: comment.likeCount,
        replyCount: comment.replyCount,
        platform: 'instagram' as const,
        sentiment: {
          label: comment.sentiment.label as 'positive' | 'negative' | 'neutral',
          score: comment.sentiment.score,
          confidence: comment.sentiment.confidence,
          method: comment.sentiment.method
        },
        scrapedAt: new Date().toISOString(),
      }));

      // Calcular resumen de sentimientos
      const sentimentSummary = {
        positive: comments.filter(c => c.sentiment.label === 'positive').length,
        negative: comments.filter(c => c.sentiment.label === 'negative').length,
        neutral: comments.filter(c => c.sentiment.label === 'neutral').length,
        total_analyzed: comments.length,
        average_score: comments.reduce((sum, c) => sum + c.sentiment.score, 0) / comments.length
      };

      // Crear estructura de análisis completa
      const analysisData = {
        comments: formattedComments,
        sentiment_summary: sentimentSummary,
        analysis_metadata: {
          analyzed_at: new Date().toISOString(),
          model_used: 'instagram-analysis-service',
          processing_time_ms: 0,
          total_comments: comments.length,
          platform: 'instagram'
        }
      };

      // Guardar en la nueva columna JSONB
      await postCommentsAnalysisService.saveCommentsAnalysis(postId, analysisData);
      
      
    } catch (error) {
      console.error('❌ [INSTAGRAM-ANALYSIS] ERROR saving comments to JSONB:', error);
      console.error('🔍 [INSTAGRAM-ANALYSIS] Error details:', {
        postId,
        postUrl,
        commentsCount: comments.length,
        errorMessage: error instanceof Error ? error.message : 'Error desconocido'
      });
      // No lanzar error para no interrumpir el análisis
    }
  }

  /**
   * Calcula métricas del post de Instagram basadas en los comentarios
   */
  private calculateInstagramPostMetrics(comments: CommentWithSentiment[]): PostMetrics | undefined {
    try {
      if (!comments || comments.length === 0) {
        return undefined;
      }

      // Calcular métricas agregadas de los comentarios
      const totalLikes = comments.reduce((sum, comment) => sum + (comment.likeCount || 0), 0);
      const totalReplies = comments.reduce((sum, comment) => sum + (comment.replyCount || 0), 0);
      
      // Estimar shares para Instagram (stories, DMs, etc.)
      // Instagram tiene más sharing que otras plataformas
      const estimatedShares = Math.floor(totalLikes / 30) + Math.floor(totalReplies / 15);
      
      // Estimar views basado en comentarios (Instagram tiene ratio más alto)
      const estimatedViews = comments.length * 200; // 1 comentario por cada 200 views aproximadamente

      const metrics: PostMetrics = {
        likesCount: totalLikes,
        commentsCount: comments.length,
        sharesCount: Math.max(estimatedShares, 0),
        viewsCount: estimatedViews,
        followerCount: undefined // No disponible desde comentarios
      };

      

      return metrics;
    } catch (error) {
      console.error('❌ [INSTAGRAM-METRICS] Error calculando métricas:', error);
      return undefined;
    }
  }

  /**
   * Guarda el análisis de sentimientos en Supabase
   */
  private async saveSentimentAnalysisToSupabase(
    postId: string, 
    sentimentSummary: any, 
    comments?: CommentWithSentiment[]
  ): Promise<void> {
    try {
      
      
      const sentimentData = {
        post_id: postId,
        platform: 'instagram' as const,
        positive_count: sentimentSummary.positive,
        negative_count: sentimentSummary.negative,
        neutral_count: sentimentSummary.neutral,
        total_comments: sentimentSummary.positive + sentimentSummary.negative + sentimentSummary.neutral,
        positive_percentage: sentimentSummary.positivePercentage,
        negative_percentage: sentimentSummary.negativePercentage,
        neutral_percentage: sentimentSummary.neutralPercentage
      };

      // Calcular métricas avanzadas si se proporcionan los comentarios
      let postMetrics: PostMetrics | undefined = undefined;
      if (comments && comments.length > 0) {
        postMetrics = this.calculateInstagramPostMetrics(comments);
        
        if (postMetrics) {
          
        }
      }


      await SentimentAnalysisService.saveSentimentAnalysis(sentimentData, postMetrics);
      
      
    } catch (error) {
      console.error('❌ [SUPABASE] ERROR guardando análisis de sentimientos:', error);
      console.error('🔍 [SUPABASE] Detalles del error:', {
        postId,
        platform: 'instagram',
        sentimentSummary,
        errorMessage: error instanceof Error ? error.message : 'Error desconocido'
      });
      // No lanzar error para no interrumpir el análisis
    }
  }

  /**
   * Crea un resultado vacío para Instagram
   */
  private createEmptyResult(postId: string, postUrl: string): OptimizedInstagramAnalysisResult {
    return {
      postId,
      postUrl,
      totalComments: 0,
      analyzedComments: 0,
      comments: [],
      sentimentSummary: { positive: 0, negative: 0, neutral: 0, positivePercentage: 0, negativePercentage: 0, neutralPercentage: 0 },
      platform: 'instagram',
      processingStats: { totalProcessed: 0, processingTimeMs: 0, batchesProcessed: 0, averageProcessingTimePerComment: 0 },
      source: 'live'
    };
  }

  /**
   * Método principal para analizar un post de Instagram
   */
  async analyzeInstagramPost(postUrl: string, systemPostId?: string): Promise<OptimizedInstagramAnalysisResult> {
    try {
      
      const startTime = Date.now();

      // Omitir análisis para historias de Instagram
      if (/instagram\.com\/stories\//i.test(postUrl)) {
        const fallbackId = systemPostId || `story-${Date.now()}`;
        return this.createEmptyResult(fallbackId, postUrl);
      }

      // Extraer ID del post de la URL (para referencia)
      const instagramPostId = this.extractPostId(postUrl);
      if (!instagramPostId) {
        console.error('❌ [INSTAGRAM ANALYSIS] ERROR: No se pudo extraer el ID del post de Instagram');
        throw new Error('No se pudo extraer el ID del post de Instagram');
      }

      // Usar el postId del sistema si se proporciona, de lo contrario usar el ID de Instagram
      const postId = systemPostId || instagramPostId;

      const cacheKey = `analysis:instagram:${postId}`;
      const cachedResult = await postgresCacheService.get<OptimizedInstagramAnalysisResult>(cacheKey);
      if (cachedResult) {
        return { ...cachedResult, source: 'cache' };
      }
      

      // Limit to 50 comments for faster processing (Instagram scraping is slow)
      const { comments, totalComments } = await this.extractComments(postUrl, 50);
      if (comments.length === 0) {
        return this.createEmptyResult(postId, postUrl);
      }
      
      const { results, stats } = await this.analyzeSentimentsBatch(comments);
      
      const sentimentSummary = this.calculateSentimentSummary(results);

      const finalResult: OptimizedInstagramAnalysisResult = {
        postId,
        postUrl,
        totalComments: totalComments,
        analyzedComments: results.length,
        comments: results, 
        sentimentSummary,
        platform: 'instagram',
        processingStats: {
          totalProcessed: results.length,
          processingTimeMs: stats.processingTimeMs,
          batchesProcessed: stats.batchesProcessed,
          averageProcessingTimePerComment: stats.averageTimePerComment,
          modelInfo: stats.modelInfo
        },
        source: 'live'
      };
      
      // Guardar en la nueva columna JSONB usando el postId del sistema
      await this.saveCommentsToJSONB(postId, postUrl, results);
      await this.saveSentimentAnalysisToSupabase(postId, sentimentSummary, results);
      
      await postgresCacheService.set(cacheKey, finalResult, 3600 * 24).catch((err: any) => {
        console.error(`❌ [CACHE] Error guardando análisis en PostgreSQL para ${postId}:`, err);
      });

      return finalResult;

    } catch (error) {
      console.error('❌ Error en análisis de Instagram:', error);
      throw error;
    }
  }

  /**
   * NUEVO: Inicia la extracción de Instagram de forma asincrónica con webhook
   * (similar al patrón de TikTok)
   */
  async startInstagramExtractionWithWebhook(postUrl: string, postId: string): Promise<void> {
    try {
      
      // En lugar de procesar sincrónicamente, iniciamos el proceso en background
      // y configuramos un webhook para cuando termine
      
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
      const webhookUrl = `${backendUrl}/api/webhooks/instagram/comments-ready?postId=${postId}`;
      
      // Iniciar la extracción en background usando el servicio de Instagram
      this.processInstagramInBackground(postUrl, postId, webhookUrl)
        .catch(error => {
          console.error(`❌ [InstagramAnalysisService] Background processing failed for ${postId}:`, error);
        });
      
      
    } catch (error) {
      console.error(`❌ [InstagramAnalysisService] Error starting extraction with webhook:`, error);
      throw error;
    }
  }

  /**
   * Procesa Instagram en background y llama al webhook cuando termine
   */
  private async processInstagramInBackground(postUrl: string, postId: string, webhookUrl: string): Promise<void> {
    try {
      
      // 1. Extraer solo los comentarios (sin análisis de sentimientos)
      const { comments, totalComments } = await this.extractComments(postUrl, 10000);
      
      if (comments.length === 0) {
        return;
      }
      
      // 2. Llamar al webhook con los comentarios extraídos
      const webhookPayload = {
        postId,
        postUrl,
        platform: 'instagram',
        comments: comments.map(c => ({ id: c.id, text: c.text })),
        totalComments,
        extractionStatus: 'completed'
      };
      
      // 3. Hacer la llamada al webhook
      const fetch = (await import('node-fetch')).default;
      const request = fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'InstagramAnalysisService/1.0'
        },
        body: JSON.stringify(webhookPayload)
      });
      
      const WEBHOOK_TIMEOUT = 30000; // 30 segundos
      const response = await withTimeout(
        request,
        WEBHOOK_TIMEOUT,
        `Timeout de ${WEBHOOK_TIMEOUT}ms superado para el webhook de Instagram: ${webhookUrl}`
      );
      
      if (!response.ok) {
        throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`);
      }
      
      
    } catch (error) {
      console.error(`❌ [InstagramAnalysisService] Background processing failed for ${postId}:`, error);
      throw error;
    }
  }
}
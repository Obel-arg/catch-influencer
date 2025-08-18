import { openAIAnalysisService, OpenAITopicResult } from './openai-analysis.service';
import { IntelligentTopicAnalysisService, IntelligentTopicResult } from './intelligent-topic-analysis.service';

export interface HybridTopicResult {
  topic_label: string;
  topic_description: string;
  keywords: string[];
  relevance_score: number;
  confidence_score: number;
  comment_count: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  extracted_method: string;
  language_detected: string;
  reasoning?: string;
}

export interface TopicAnalysisStats {
  totalProcessed: number;
  processingTimeMs: number;
  topicsExtracted: number;
  averageConfidence: number;
  methodUsed: string;
  languagesDetected: string[];
}

export class OpenAITopicsService {
  private static instance: OpenAITopicsService;
  private intelligentService: IntelligentTopicAnalysisService;

  private constructor() {
    this.intelligentService = IntelligentTopicAnalysisService.getInstance();
  }

  public static getInstance(): OpenAITopicsService {
    if (!OpenAITopicsService.instance) {
      OpenAITopicsService.instance = new OpenAITopicsService();
    }
    return OpenAITopicsService.instance;
  }

  /**
   * Analiza temas principales usando OpenAI como método principal
   */
  public async analyzeTopics(comments: string[]): Promise<{
    topics: HybridTopicResult[];
    stats: TopicAnalysisStats;
  }> {
    const startTime = Date.now();
    
    // Filtrar comentarios válidos
    const validComments = comments
      .filter(comment => comment && comment.trim().length > 10)
      .slice(0, 30); // REDUCCIÓN DE LOTE: máximo 30


    if (validComments.length < 3) {
      return {
        topics: this.createFallbackTopics(validComments),
        stats: {
          totalProcessed: validComments.length,
          processingTimeMs: Date.now() - startTime,
          topicsExtracted: 1,
          averageConfidence: 0.1,
          methodUsed: 'insufficient-data',
          languagesDetected: ['unknown']
        }
      };
    }

    // Utilidad para reintentos
    async function withRetries<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
      let lastError;
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (err) {
          lastError = err;
          await new Promise(res => setTimeout(res, delayMs * (i + 1)));
        }
      }
      throw lastError;
    }

    // Método 1: Intentar con OpenAI
    try {
      // El análisis de temas puede ser lento. Se establece un timeout de 25 segundos.
      const TIMEOUT_MS = 25000;

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`OpenAI topics analysis timed out after ${TIMEOUT_MS}ms`)), TIMEOUT_MS)
      );

      let batchSucceeded = false;
      let currentBatchSize = Math.min(validComments.length, 15); // REDUCCIÓN DE LOTE
      let openaiTopics: any[] = [];
      for (let attempt = 0; attempt < 3 && !batchSucceeded; attempt++) {
        try {
          openaiTopics = await Promise.race([
            withRetries(() => openAIAnalysisService.analyzeTopics(validComments.slice(0, currentBatchSize)), 2, 1500),
            timeoutPromise
          ]);
          batchSucceeded = true;
        } catch (err) {
          console.warn(`⚠️ OpenAI topics batch failed (batchSize=${currentBatchSize}, attempt=${attempt+1}):`, err instanceof Error ? err.message : err);
          currentBatchSize = Math.max(3, Math.floor(currentBatchSize / 2));
        }
      }
      if (!batchSucceeded) throw new Error('OpenAI topics batch failed after retries');
      
      const hybridTopics = openaiTopics.map(topic => ({
        topic_label: topic.topic_label,
        topic_description: topic.topic_description,
        keywords: topic.keywords,
        relevance_score: topic.relevance_score,
        confidence_score: topic.confidence_score,
        comment_count: topic.comment_count,
        sentiment_distribution: topic.sentiment_distribution,
        extracted_method: 'openai-gpt',
        language_detected: 'auto',
        reasoning: `Análisis realizado por OpenAI con ${validComments.length} comentarios`
      }));

      const processingTime = Date.now() - startTime;

      return {
        topics: hybridTopics,
        stats: {
          totalProcessed: validComments.length,
          processingTimeMs: processingTime,
          topicsExtracted: hybridTopics.length,
          averageConfidence: this.calculateAverageConfidence(hybridTopics),
          methodUsed: 'openai-gpt',
          languagesDetected: ['auto']
        }
      };

    } catch (openaiError) {
      console.warn('⚠️ [OPENAI-TOPICS] OpenAI analysis failed, trying intelligent fallback:', openaiError instanceof Error ? openaiError.message : openaiError);
    }

    // Método 2: Fallback al análisis inteligente existente
    try {
      const intelligentTopics = await this.intelligentService.analyzeTopicsIntelligently(validComments);
      
      const hybridTopics = intelligentTopics.map(topic => ({
        topic_label: topic.topic_label,
        topic_description: topic.topic_description,
        keywords: topic.keywords,
        relevance_score: topic.relevance_score,
        confidence_score: topic.confidence_score,
        comment_count: topic.comment_count,
        sentiment_distribution: topic.sentiment_distribution,
        extracted_method: 'intelligent-analysis-fallback',
        language_detected: topic.language_detected || 'es',
        reasoning: `Fallback a análisis inteligente con ${validComments.length} comentarios`
      }));

      const processingTime = Date.now() - startTime;

      return {
        topics: hybridTopics,
        stats: {
          totalProcessed: validComments.length,
          processingTimeMs: processingTime,
          topicsExtracted: hybridTopics.length,
          averageConfidence: this.calculateAverageConfidence(hybridTopics),
          methodUsed: 'intelligent-analysis-fallback',
          languagesDetected: intelligentTopics.map(topic => topic.language_detected || 'es')
        }
      };

    } catch (intelligentError) {
      console.warn('⚠️ [OPENAI-TOPICS] Intelligent analysis failed, using basic fallback:', intelligentError instanceof Error ? intelligentError.message : intelligentError);
    }

    // Método 3: Fallback básico
    const fallbackTopics = this.createFallbackTopics(validComments);
    const processingTime = Date.now() - startTime;
    
    return {
      topics: fallbackTopics,
      stats: {
        totalProcessed: validComments.length,
        processingTimeMs: processingTime,
        topicsExtracted: fallbackTopics.length,
        averageConfidence: 0.3,
        methodUsed: 'basic-fallback',
        languagesDetected: ['es']
      }
    };
  }

  /**
   * Extrae temas claves simples usando OpenAI
   */
  public async extractKeyTopics(comments: string[]): Promise<string[]> {
    const validComments = comments
      .filter(comment => comment && comment.trim().length > 10)
      .slice(0, 30);

    if (validComments.length < 3) {
      return this.extractBasicKeywords(validComments);
    }

    // Intentar con OpenAI
    try {
      const topicsResult = await this.analyzeTopics(validComments);
      
      // Extraer solo los labels de los 3 temas más relevantes
      return topicsResult.topics
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 3)
        .map(topic => topic.topic_label);

    } catch (error) {
      console.warn('⚠️ OpenAI key topics extraction failed:', error instanceof Error ? error.message : error);
      return this.extractBasicKeywords(validComments);
    }
  }

  /**
   * Analiza temas y los guarda en formato compatible con la base de datos
   */
  public async analyzeAndFormatForDatabase(
    postId: string, 
    comments: Array<{ text: string; sentiment?: string }>
  ): Promise<{
    success: boolean;
    summary: {
      totalTopics: number;
      highConfidenceTopics: number;
      languagesDetected: string[];
    };
    topics: HybridTopicResult[];
    processingStats: {
      processingTimeMs: number;
      extractionMethod: string;
    };
  }> {
    const startTime = Date.now();
    
    try {
      const commentTexts = comments.map(c => c.text).filter(Boolean);
      
      const result = await this.analyzeTopics(commentTexts);
      
      // Filtrar solo los 3 temas más relevantes
      const topTopics = result.topics
        .sort((a, b) => (b.relevance_score + b.confidence_score) - (a.relevance_score + a.confidence_score))
        .slice(0, 3);

      const highConfidenceTopics = topTopics.filter(t => t.confidence_score > 0.6);

      return {
        success: true,
        summary: {
          totalTopics: topTopics.length,
          highConfidenceTopics: highConfidenceTopics.length,
          languagesDetected: result.stats.languagesDetected
        },
        topics: topTopics,
        processingStats: {
          processingTimeMs: Date.now() - startTime,
          extractionMethod: result.stats.methodUsed
        }
      };

    } catch (error) {
      console.error('❌ Error in analyzeAndFormatForDatabase:', error);
      
      return {
        success: false,
        summary: {
          totalTopics: 0,
          highConfidenceTopics: 0,
          languagesDetected: []
        },
        topics: [],
        processingStats: {
          processingTimeMs: Date.now() - startTime,
          extractionMethod: 'error-fallback'
        }
      };
    }
  }

  /**
   * Crea temas de fallback cuando no se pueden extraer temas específicos
   */
  private createFallbackTopics(comments: string[]): HybridTopicResult[] {
    return [{
      topic_label: 'Interacción general',
      topic_description: 'Comentarios generales de los usuarios sin temas específicos identificables.',
      keywords: this.extractBasicKeywords(comments),
      relevance_score: 0.3,
      confidence_score: 0.2,
      comment_count: comments.length,
      sentiment_distribution: {
        positive: 0.4,
        neutral: 0.4,
        negative: 0.2
      },
      extracted_method: 'basic-fallback',
      language_detected: 'es',
      reasoning: 'Análisis básico debido a falta de temas específicos'
    }];
  }

  /**
   * Extrae palabras clave básicas de los comentarios
   */
  private extractBasicKeywords(comments: string[]): string[] {
    const wordCounts: Record<string, number> = {};
    const stopWords = new Set([
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo',
      'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las',
      'una', 'como', 'muy', 'más', 'pero', 'ya', 'me', 'mi', 'tu', 'si', 'este',
      'esta', 'está', 'ser', 'tiene', 'todo', 'bien', 'bueno', 'malo', 'the', 'and',
      'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
    ]);

    comments.forEach(comment => {
      const words = comment.toLowerCase()
        .replace(/[^a-záéíóúñü\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    return Object.entries(wordCounts)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([word, _]) => word);
  }

  /**
   * Calcula la confianza promedio de los temas
   */
  private calculateAverageConfidence(topics: HybridTopicResult[]): number {
    if (topics.length === 0) return 0;
    
    const totalConfidence = topics.reduce((sum, topic) => sum + topic.confidence_score, 0);
    return Math.round((totalConfidence / topics.length) * 100) / 100;
  }

  /**
   * Información del servicio
   */
  public getServiceInfo(): {
    name: string;
    version: string;
    methods: string[];
    capabilities: string[];
    status: string;
  } {
    const openaiInfo = openAIAnalysisService.getModelInfo();
    
    return {
      name: 'Hybrid Topic Analysis Service',
      version: '2.0.0',
      methods: ['OpenAI GPT-3.5', 'Intelligent Analysis', 'Basic Keywords'],
      capabilities: [
        'Análisis de temas multilingüe',
        'Extracción de palabras clave',
        'Distribución de sentimientos por tema',
        'Múltiples fallbacks automáticos',
        'Análisis contextual de redes sociales'
      ],
      status: openaiInfo.isConfigured ? 'OpenAI configurado - Máxima precisión' : 'Solo fallbacks disponibles'
    };
  }
}

export const openAITopicsService = OpenAITopicsService.getInstance(); 
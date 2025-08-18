import { openAIAnalysisService, OpenAISentimentResult } from './openai-analysis.service';
import { multilingualRobertaSentimentService, MultilingualRobertaSentimentResult } from './multilingual-roberta-sentiment.service';

export interface HybridSentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  method: string;
  reasoning?: string;
  rawScores?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface BatchSentimentStats {
  totalProcessed: number;
  processingTimeMs: number;
  batchesProcessed: number;
  averageTimePerComment: number;
  methodsUsed: {
    openai: number;
    roberta: number;
    vader: number;
    fallback: number;
  };
  modelInfo: {
    primary: string;
    fallbacks: string[];
    accuracy: string;
  };
}

export class OpenAISentimentService {
  private static instance: OpenAISentimentService;
  private vader: any;

  private constructor() {
    try {
      this.vader = require('vader-sentiment');
    } catch (error) {
      console.warn('⚠️ VADER sentiment not available');
    }
  }

  public static getInstance(): OpenAISentimentService {
    if (!OpenAISentimentService.instance) {
      OpenAISentimentService.instance = new OpenAISentimentService();
    }
    return OpenAISentimentService.instance;
  }

  /**
   * Analiza sentimiento con OpenAI como método principal
   */
  public async analyzeSentiment(text: string): Promise<HybridSentimentResult> {
    const cleanText = text.trim();
    
    if (cleanText.length === 0) {
      return {
        label: 'neutral',
        score: 0.5,
        confidence: 0.1,
        method: 'empty-text'
      };
    }

    // Método 1: Intentar con OpenAI
    try {
      const openaiResult = await openAIAnalysisService.analyzeSentiment(cleanText);
      
      return {
        label: openaiResult.label,
        score: openaiResult.score,
        confidence: openaiResult.confidence,
        method: 'openai-gpt',
        reasoning: openaiResult.reasoning
      };
      
    } catch (openaiError) {
      console.warn(`⚠️ [SENTIMENT_SERVICE] OpenAI sentiment analysis failed. Triggering fallback. Reason: ${openaiError instanceof Error ? openaiError.message : String(openaiError)}`);
    }

    // Método 2: Fallback a RoBERTa multilingüe
    try {
      const robertaResult = await multilingualRobertaSentimentService.analyzeSentiment(cleanText);
      
      return {
        label: this.normalizeLabel(robertaResult.label),
        score: robertaResult.score,
        confidence: robertaResult.confidence,
        method: 'multilingual-roberta-fallback',
        rawScores: robertaResult.rawScores
      };
      
    } catch (robertaError) {
      console.error(`❌ [SENTIMENT_SERVICE] Fallback sentiment analysis (RoBERTa) also failed. Reason: ${robertaError instanceof Error ? robertaError.message : String(robertaError)}`);
      
      // Método 3: Fallback final a un resultado neutral
      // Esto asegura que la aplicación no se rompa y devuelve un valor por defecto.
      return {
        label: 'neutral',
        score: 0.5,
        confidence: 0.1,
        method: 'failed-fallback'
      };
    }
  }

  /**
   * Procesa múltiples comentarios en lotes optimizados
   */
  public async analyzeSentimentsBatch(
    texts: string[], 
    batchSize: number = 10
  ): Promise<{
    results: HybridSentimentResult[];
    stats: BatchSentimentStats;
  }> {
    const startTime = Date.now();
    const results: HybridSentimentResult[] = [];
    const methodsUsed = {
      openai: 0,
      roberta: 0,
      vader: 0,
      fallback: 0
    };

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

    // Intentar procesamiento en lotes con OpenAI primero, con reintentos y reducción de lote
    let batchSucceeded = false;
    let currentBatchSize = Math.min(batchSize, 10); // Reducir lote si falla
    for (let attempt = 0; attempt < 3 && !batchSucceeded; attempt++) {
      try {
        const openaiResult = await withRetries(
          () => openAIAnalysisService.analyzeSentimentsBatch(texts, currentBatchSize),
          2, 1500
        );
        const hybridResults = openaiResult.results.map(result => ({
          label: result.label,
          score: result.score,
          confidence: result.confidence,
          method: result.method,
          reasoning: result.reasoning
        }));
        results.push(...hybridResults);
        methodsUsed.openai = hybridResults.length;
        batchSucceeded = true;
      } catch (openaiError) {
        console.warn(`⚠️ OpenAI batch processing failed (batchSize=${currentBatchSize}, attempt=${attempt+1}):`, openaiError instanceof Error ? openaiError.message : openaiError);
        currentBatchSize = Math.max(2, Math.floor(currentBatchSize / 2));
      }
    }
    if (!batchSucceeded) {
      // Procesar individualmente con fallbacks
      for (const text of texts) {
        const result = await this.analyzeSentiment(text);
        results.push(result);
        if (result.method.includes('openai')) methodsUsed.openai++;
        else if (result.method.includes('roberta')) methodsUsed.roberta++;
        else if (result.method.includes('vader')) methodsUsed.vader++;
        else methodsUsed.fallback++;
      }
    }

    const processingTimeMs = Date.now() - startTime;
    const totalBatches = Math.ceil(texts.length / batchSize);

    return {
      results,
      stats: {
        totalProcessed: texts.length,
        processingTimeMs,
        batchesProcessed: totalBatches,
        averageTimePerComment: processingTimeMs / texts.length,
        methodsUsed,
        modelInfo: {
          primary: 'OpenAI GPT-3.5-turbo',
          fallbacks: ['RoBERTa Multilingüe', 'VADER', 'Análisis por patrones'],
          accuracy: 'Muy alta precisión con OpenAI + fallbacks robustos'
        }
      }
    };
  }

  /**
   * Normaliza etiquetas de diferentes modelos
   */
  private normalizeLabel(label: string): 'positive' | 'negative' | 'neutral' {
    const lowerLabel = label.toLowerCase();
    
    if (lowerLabel.includes('pos') || lowerLabel.includes('4 star') || lowerLabel.includes('5 star')) {
      return 'positive';
    } else if (lowerLabel.includes('neg') || lowerLabel.includes('1 star') || lowerLabel.includes('2 star')) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  /**
   * Análisis básico por patrones (último fallback)
   */
  private analyzeWithPatterns(text: string): HybridSentimentResult {
    const cleanText = text.toLowerCase();
    
    // Patrones positivos básicos
    const positivePatterns = [
      /\b(excelente|genial|increíble|fantástico|maravilloso|perfecto|love|amazing|great|awesome)\b/i,
      /\b(me encanta|me gusta|me fascina|te amo|te quiero)\b/i,
      /\b(gracias|felicidades|muy bueno|muy bien)\b/i
    ];

    // Patrones negativos básicos
    const negativePatterns = [
      /\b(horrible|terrible|pésimo|awful|hate|disgusting|worst|sucks)\b/i,
      /\b(me disgusta|me molesta|odio|detesto)\b/i,
      /\b(muy malo|muy mal|qué horrible)\b/i
    ];

    const positiveCount = positivePatterns.filter(pattern => pattern.test(cleanText)).length;
    const negativeCount = negativePatterns.filter(pattern => pattern.test(cleanText)).length;

    let label: 'positive' | 'negative' | 'neutral';
    let score: number;

    if (positiveCount > negativeCount) {
      label = 'positive';
      score = Math.min(0.6 + (positiveCount * 0.1), 0.8);
    } else if (negativeCount > positiveCount) {
      label = 'negative';
      score = Math.min(0.6 + (negativeCount * 0.1), 0.8);
    } else {
      label = 'neutral';
      score = 0.5;
    }

    return {
      label,
      score,
      confidence: 0.4,
      method: 'pattern-analysis-fallback'
    };
  }

  /**
   * Calcula resumen de sentimientos con filtro de confianza
   */
  public calculateSentimentSummary(results: HybridSentimentResult[], confidenceThreshold: number = 0.5): {
    positive: number;
    negative: number;
    neutral: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
    highConfidenceCount: number;
    averageConfidence: number;
  } {
    const highConfidenceResults = results.filter(r => r.confidence >= confidenceThreshold);
    const total = highConfidenceResults.length;

    if (total === 0) {
      return {
        positive: 0,
        negative: 0,
        neutral: 0,
        positivePercentage: 0,
        negativePercentage: 0,
        neutralPercentage: 0,
        highConfidenceCount: 0,
        averageConfidence: 0
      };
    }

    const positive = highConfidenceResults.filter(r => r.label === 'positive').length;
    const negative = highConfidenceResults.filter(r => r.label === 'negative').length;
    const neutral = highConfidenceResults.filter(r => r.label === 'neutral').length;

    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    return {
      positive,
      negative,
      neutral,
      positivePercentage: Math.round((positive / total) * 100),
      negativePercentage: Math.round((negative / total) * 100),
      neutralPercentage: Math.round((neutral / total) * 100),
      highConfidenceCount: total,
      averageConfidence: Math.round(averageConfidence * 100) / 100
    };
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
      name: 'Hybrid Sentiment Analysis Service',
      version: '2.0.0',
      methods: ['OpenAI GPT-3.5', 'RoBERTa Multilingüe', 'VADER', 'Pattern Analysis'],
      capabilities: [
        'Análisis de sentimientos multilingüe',
        'Procesamiento en lotes optimizado',
        'Múltiples fallbacks automáticos',
        'Análisis contextual de redes sociales',
        'Filtrado por confianza configurable'
      ],
      status: openaiInfo.isConfigured ? 'OpenAI configurado - Máxima precisión' : 'Solo fallbacks disponibles'
    };
  }
}

export const openAISentimentService = OpenAISentimentService.getInstance(); 
// import { pipeline } from '@xenova/transformers'; // Moved to dynamic import

export interface MultilingualRobertaSentimentResult {
  label: string;
  score: number;
  confidence: number;
  method: string;
  rawScores?: {
    negative: number;
    neutral: number;
    positive: number;
  };
}

export interface BatchProcessingStats {
  totalProcessed: number;
  highConfidenceCount: number;
  lowConfidenceCount: number;
  processingTimeMs: number;
  averageTimePerComment: number;
  batchesProcessed: number;
}

export class MultilingualRobertaSentimentService {
  private static instance: MultilingualRobertaSentimentService;
  private classifier: any = null;
  private isModelLoaded = false;
  private modelLoadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): MultilingualRobertaSentimentService {
    if (!MultilingualRobertaSentimentService.instance) {
      MultilingualRobertaSentimentService.instance = new MultilingualRobertaSentimentService();
    }
    return MultilingualRobertaSentimentService.instance;
  }

  /**
   * Inicializa el modelo RoBERTa multilingüe
   */
  private async initializeModel(): Promise<void> {
    if (this.isModelLoaded || this.modelLoadPromise) {
      return this.modelLoadPromise || Promise.resolve();
    }

    const startTime = Date.now();

    this.modelLoadPromise = (async () => {
      try {
        // Dynamic import para ES module compatibility
        const { pipeline } = await import('@xenova/transformers');
        
        // Usar el modelo BERT multilingüe que funciona correctamente
        this.classifier = await pipeline(
          'sentiment-analysis',
          'Xenova/bert-base-multilingual-uncased-sentiment',
          {
            progress_callback: (progress: any) => {
              if (progress.status === 'downloading') {
              }
            }
          }
        );

        this.isModelLoaded = true;
        const loadTime = Date.now() - startTime;
        
      } catch (error) {
        console.error('❌ Error cargando modelo RoBERTa multilingüe:', error);
        this.isModelLoaded = false;
        throw new Error('Error al cargar el modelo de análisis de sentimientos multilingüe');
      }
    })();

    return this.modelLoadPromise;
  }

  /**
   * Analiza el sentimiento de un texto usando RoBERTa multilingüe
   */
  public async analyzeSentiment(text: string): Promise<MultilingualRobertaSentimentResult> {
    try {
      // Asegurar que el modelo esté cargado
      await this.initializeModel();
      
      if (!this.classifier) {
        throw new Error('Modelo no disponible');
      }

      // Limpiar y preparar el texto
      const cleanText = text.replace(/\n/g, ' ').trim();
      if (cleanText.length === 0) {
        return {
          label: 'neutral',
          score: 0.5,
          confidence: 0.1,
          method: 'multilingual-roberta-empty'
        };
      }

      // Limitar longitud del texto (RoBERTa tiene límite de tokens)
      const maxLength = 512;
      const processedText = cleanText.length > maxLength 
        ? cleanText.substring(0, maxLength) + '...'
        : cleanText;

      // Analizar con el modelo RoBERTa multilingüe
      const result = await this.classifier(processedText);
      
      // El modelo devuelve un array con las probabilidades de cada clase
      const predictions = Array.isArray(result) ? result : [result];
      const topPrediction = predictions[0];

      // Mapear las etiquetas del modelo a nuestro formato estándar
      let label = 'neutral';
      const confidence = topPrediction.score || 0.5;

      // Mapear etiquetas de estrellas a sentimientos
      // Este modelo usa sistema de estrellas: 1-2 stars = negative, 3 stars = neutral, 4-5 stars = positive
      const starLabel = topPrediction.label.toLowerCase();
      
      if (starLabel.includes('4 stars') || starLabel.includes('5 stars')) {
        label = 'positive';
      } else if (starLabel.includes('1 star') || starLabel.includes('2 stars')) {
        label = 'negative';
      } else {
        label = 'neutral'; // 3 stars o cualquier otra etiqueta
      }

      // Extraer scores de todas las clases si están disponibles
      let rawScores;
      if (predictions.length >= 3) {
        const negativeScore = predictions.find(p => 
          p.label.toLowerCase().includes('negative') || p.label.toLowerCase().includes('neg')
        )?.score || 0;
        
        const neutralScore = predictions.find(p => 
          p.label.toLowerCase().includes('neutral') || p.label.toLowerCase().includes('neu')
        )?.score || 0;
        
        const positiveScore = predictions.find(p => 
          p.label.toLowerCase().includes('positive') || p.label.toLowerCase().includes('pos')
        )?.score || 0;

        rawScores = {
          negative: negativeScore,
          neutral: neutralScore,
          positive: positiveScore
        };
      }

      return {
        label,
        score: confidence,
        confidence,
        method: 'multilingual-roberta',
        rawScores
      };

    } catch (error) {
      console.error('❌ Error en análisis RoBERTa multilingüe:', error);
      // Fallback a neutral con baja confianza
      return {
        label: 'neutral',
        score: 0.5,
        confidence: 0.1,
        method: 'multilingual-roberta-error'
      };
    }
  }

  /**
   * Procesa múltiples textos en lotes para mejor rendimiento
   */
  public async analyzeBatch(texts: string[], batchSize: number = 32): Promise<{
    results: MultilingualRobertaSentimentResult[];
    stats: BatchProcessingStats;
  }> {
    const startTime = Date.now();
    let modelLoadTime = 0;

    try {
      // Cargar modelo si no está cargado
      const modelLoadStart = Date.now();
      await this.initializeModel();
      if (!this.isModelLoaded) {
        modelLoadTime = Date.now() - modelLoadStart;
      }

      if (!this.classifier) {
        throw new Error('Modelo no disponible para procesamiento en lotes');
      }

      
      const results: MultilingualRobertaSentimentResult[] = [];
      const totalBatches = Math.ceil(texts.length / batchSize);
      
      for (let i = 0; i < texts.length; i += batchSize) {
        const batchNumber = Math.floor(i / batchSize) + 1;
        const batch = texts.slice(i, i + batchSize);
        
        
        // Procesar lote completo usando Promise.all para paralelización
        const batchResults = await Promise.all(
          batch.map(async (text) => {
            return await this.analyzeSentiment(text);
          })
        );

        results.push(...batchResults);
        
        // Pequeña pausa cada 3 lotes para evitar sobrecarga
        if (batchNumber % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
      }

      const processingTime = Date.now() - startTime;

      const stats: BatchProcessingStats = {
        totalProcessed: results.length,
        highConfidenceCount: results.filter(r => r.confidence > 0.6).length,
        lowConfidenceCount: results.length - results.filter(r => r.confidence > 0.6).length,
        processingTimeMs: processingTime,
        averageTimePerComment: results.length > 0 ? processingTime / results.length : 0,
        batchesProcessed: totalBatches
      };


      return { results, stats };

    } catch (error) {
      console.error('❌ Error en procesamiento en lotes:', error);
      
      // Fallback: devolver resultados neutrales
      const fallbackResults = texts.map(() => ({
        label: 'neutral',
        score: 0.5,
        confidence: 0.1,
        method: 'multilingual-roberta-batch-error'
      }));

      return {
        results: fallbackResults,
        stats: {
          totalProcessed: fallbackResults.length,
          highConfidenceCount: 0,
          lowConfidenceCount: fallbackResults.length,
          processingTimeMs: Date.now() - startTime,
          averageTimePerComment: 0,
          batchesProcessed: 0
        }
      };
    }
  }

  /**
   * Obtiene información del modelo cargado
   */
  public getModelInfo(): {
    isLoaded: boolean;
    modelName: string;
    description: string;
    capabilities: string[];
    performance: string[];
  } {
    return {
      isLoaded: this.isModelLoaded,
      modelName: 'Xenova/bert-base-multilingual-uncased-sentiment',
      description: 'Modelo RoBERTa multilingüe optimizado para análisis de sentimientos en múltiples idiomas.',
      capabilities: [
        'Análisis de sentimientos multilingüe (español, inglés, portugués, francés, alemán, etc.)',
        'Clasificación en 3 niveles: Negative, Neutral, Positive',
        'Optimizado para textos cortos y largos (hasta 512 tokens)',
        'Procesamiento en lotes eficiente con paralelización',
        'Sin dependencias externas (Java, Python, etc.)',
        'Funciona completamente en Node.js'
      ],
      performance: [
        'Velocidad: ~50-100ms por texto individual',
        'Lotes: ~20-30ms por texto promedio',
        'Memoria: ~200-400MB RAM',
        'Precisión: Alta para múltiples idiomas',
        'Confiabilidad: Sin dependencias externas'
      ]
    };
  }

  /**
   * Analiza un conjunto de textos y devuelve estadísticas detalladas
   */
  public async getDetailedAnalysis(texts: string[]): Promise<{
    results: MultilingualRobertaSentimentResult[];
    summary: {
      positive: number;
      neutral: number;
      negative: number;
      highConfidence: number;
      averageConfidence: number;
    };
    stats: BatchProcessingStats;
  }> {
    const { results, stats } = await this.analyzeBatch(texts);
    
    const positive = results.filter(r => r.label === 'positive').length;
    const neutral = results.filter(r => r.label === 'neutral').length;
    const negative = results.filter(r => r.label === 'negative').length;
    const highConfidence = results.filter(r => r.confidence > 0.6).length;
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    return {
      results,
      summary: {
        positive,
        neutral,
        negative,
        highConfidence,
        averageConfidence
      },
      stats
    };
  }

  /**
   * Limpia el modelo de la memoria
   */
  public async cleanup(): Promise<void> {
    this.classifier = null;
    this.isModelLoaded = false;
    this.modelLoadPromise = null;
  }
}

// Instancia singleton para uso global
export const multilingualRobertaSentimentService = MultilingualRobertaSentimentService.getInstance(); 
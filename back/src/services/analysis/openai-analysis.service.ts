import config from '../../config/environment';

export interface OpenAISentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  reasoning?: string;
  method: string;
}

export interface OpenAITopicResult {
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
}

export class OpenAIAnalysisService {
  private static instance: OpenAIAnalysisService;
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  private constructor() {
    this.apiKey = config.openai?.apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'API-KEY-OPENAI' || this.apiKey.includes('**')) {
      console.warn('⚠️ OpenAI API key not configured properly');
    }
  }

  public static getInstance(): OpenAIAnalysisService {
    if (!OpenAIAnalysisService.instance) {
      OpenAIAnalysisService.instance = new OpenAIAnalysisService();
    }
    return OpenAIAnalysisService.instance;
  }

  private async getFetch(): Promise<any> {
    const { default: fetch } = await import('node-fetch');
    return fetch;
  }

  private isApiKeyValid(): boolean {
    return !!(this.apiKey && this.apiKey !== 'API-KEY-OPENAI' && !this.apiKey.includes('**'));
  }

  /**
   * Analiza el sentimiento de un comentario usando OpenAI
   */
  public async analyzeSentiment(text: string): Promise<OpenAISentimentResult> {
    if (!this.isApiKeyValid()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const cleanText = text.trim();
      if (cleanText.length === 0) {
        return {
          label: 'neutral',
          score: 0.5,
          confidence: 0.1,
          method: 'openai-empty'
        };
      }

      const prompt = `Analiza el sentimiento del siguiente comentario de redes sociales.

Comentario: "${cleanText}"

Instrucciones:
- Clasifica como: positive, negative, o neutral
- Considera el contexto de redes sociales (emojis, jerga, ironía)
- Proporciona un score de 0 a 1 (qué tan fuerte es el sentimiento)
- Proporciona un nivel de confianza de 0 a 1

Responde SOLO en formato JSON:
{
  "label": "positive|negative|neutral",
  "score": 0.8,
  "confidence": 0.9,
  "reasoning": "breve explicación"
}`;

      const response = await this.makeOpenAIRequest(prompt, 150);
      
      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error('Empty content from OpenAI');
      }

      // Limpiar y parsear respuesta JSON
      let parsed;
      try {
        const cleanContent = content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        parsed = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('❌ Error parsing OpenAI sentiment response:', content);
        throw new Error(`Invalid JSON from OpenAI: ${parseError instanceof Error ? parseError.message : parseError}`);
      }
      
      return {
        label: parsed.label,
        score: Math.min(Math.max(parsed.score || 0.5, 0), 1),
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
        reasoning: parsed.reasoning,
        method: 'openai-gpt'
      };

    } catch (error) {
      console.error('❌ OpenAI sentiment analysis error:', error);
      throw error;
    }
  }

  /**
   * Analiza sentimientos de múltiples comentarios en lote
   */
  public async analyzeSentimentsBatch(texts: string[], batchSize: number = 10): Promise<{
    results: OpenAISentimentResult[];
    stats: {
      totalProcessed: number;
      processingTimeMs: number;
      batchesProcessed: number;
      averageTimePerComment: number;
    };
  }> {
    const startTime = Date.now();
    
    if (!this.isApiKeyValid()) {
      throw new Error('OpenAI API key not configured');
    }

    const results: OpenAISentimentResult[] = [];
    const totalBatches = Math.ceil(texts.length / batchSize);
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      try {
        const batchResults = await this.analyzeSentimentsBatchSingle(batch);
        results.push(...batchResults);
        
        // Pequeña pausa entre lotes para no saturar la API
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } catch (error) {
        console.error(`❌ Error processing batch ${Math.floor(i / batchSize) + 1}:`, error);
        
        // Fallback individual para el lote que falló
        for (const text of batch) {
          try {
            const result = await this.analyzeSentiment(text);
            results.push(result);
          } catch (individualError) {
            // Fallback neutral si falla todo
            results.push({
              label: 'neutral',
              score: 0.5,
              confidence: 0.1,
              method: 'openai-fallback'
            });
          }
        }
      }
    }

    const processingTimeMs = Date.now() - startTime;
    
    return {
      results,
      stats: {
        totalProcessed: texts.length,
        processingTimeMs,
        batchesProcessed: totalBatches,
        averageTimePerComment: processingTimeMs / texts.length
      }
    };
  }

  /**
   * Analiza un lote de comentarios en una sola petición
   */
  private async analyzeSentimentsBatchSingle(texts: string[]): Promise<OpenAISentimentResult[]> {
    const commentsFormatted = texts.map((text, index) => `${index + 1}. "${text}"`).join('\n');
    
    const prompt = `Analiza el sentimiento de estos ${texts.length} comentarios de redes sociales.

Comentarios:
${commentsFormatted}

Instrucciones:
- Clasifica cada uno como: positive, negative, o neutral
- Considera el contexto de redes sociales (emojis, jerga, ironía)
- Proporciona un score de 0 a 1 (qué tan fuerte es el sentimiento)
- Proporciona un nivel de confianza de 0 a 1

Responde SOLO en formato JSON array:
[
  {
    "index": 1,
    "label": "positive|negative|neutral",
    "score": 0.8,
    "confidence": 0.9
  },
  ...
]`;

    const response = await this.makeOpenAIRequest(prompt, 300 + texts.length * 50);
    
    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error('No response from OpenAI batch');
    }

    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error('Empty content from OpenAI batch');
    }

    // Limpiar y parsear respuesta JSON
    let parsed;
    try {
      const cleanContent = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      parsed = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Error parsing OpenAI batch response:', content);
      throw new Error(`Invalid JSON from OpenAI batch: ${parseError instanceof Error ? parseError.message : parseError}`);
    }
    
    if (!Array.isArray(parsed)) {
      console.error('❌ OpenAI batch response is not an array:', parsed);
      throw new Error('Invalid response format from OpenAI batch');
    }

    return parsed.map((item: any) => ({
      label: item.label,
      score: Math.min(Math.max(item.score || 0.5, 0), 1),
      confidence: Math.min(Math.max(item.confidence || 0.5, 0), 1),
      method: 'openai-batch'
    }));
  }

  /**
   * Analiza temas principales de un conjunto de comentarios
   */
  public async analyzeTopics(comments: string[]): Promise<OpenAITopicResult[]> {
    if (!this.isApiKeyValid()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Limitar comentarios para no exceder límites de tokens
      const limitedComments = comments.slice(0, 50);
      
      const commentsText = limitedComments.map((comment, index) => 
        `${index + 1}. ${comment}`
      ).join('\n');

      const prompt = `Analiza estos comentarios y extrae EXACTAMENTE 3 temas específicos sobre los que más se habla.

Comentarios:
${commentsText}

INSTRUCCIONES ESPECÍFICAS:
- Identifica los 3 temas principales sobre los que más se habla en los comentarios
- Los temas deben ser específicos y estar basados en el contenido real de los comentarios
- En keywords describe los TIPOS DE COMENTARIOS o PATRONES que encuentras
- Las keywords deben ser descripciones categóricas de lo que hacen o dicen los usuarios

EJEMPLOS de keywords que SÍ quiero:
- "Solicitudes de segunda parte"
- "Comentarios positivos sobre el video"
- "Referencias a personajes históricos mencionados"
- "Usuarios compartiendo experiencias similares"
- "Preguntas sobre detalles específicos"
- "Comparaciones con otros contenidos"

IMPORTANTE: Responde ÚNICAMENTE con un JSON array válido de exactamente 3 elementos.

[
  {
    "topic_label": "Título del tema principal",
    "topic_description": "Descripción de qué se comenta sobre este tema",
    "keywords": ["Tipo de comentario 1", "Patrón de comentario 2", "Categoría de comentario 3"],
    "relevance_score": 0.9,
    "confidence_score": 0.8,
    "comment_count": 12,
    "sentiment_distribution": {
      "positive": 0.6,
      "neutral": 0.3,
      "negative": 0.1
    }
  }
]`;

      const response = await this.makeOpenAIRequest(prompt, 800);
      
      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error('No response from OpenAI topics');
      }

      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error('Empty content from OpenAI topics');
      }

      // Limpiar y parsear respuesta JSON
      let parsed;
      try {
        // Limpiar respuesta (quitar markdown, espacios extra, etc.)
        const cleanContent = content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        parsed = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('❌ Error parsing OpenAI response:', content);
        throw new Error(`Invalid JSON from OpenAI: ${parseError instanceof Error ? parseError.message : parseError}`);
      }
      
      if (!Array.isArray(parsed)) {
        console.error('❌ OpenAI response is not an array:', parsed);
        throw new Error('Invalid response format from OpenAI topics');
      }

      return parsed.map((topic: any) => ({
        topic_label: topic.topic_label || 'Tema identificado',
        topic_description: topic.topic_description || 'Descripción no disponible',
        keywords: Array.isArray(topic.keywords) ? topic.keywords : [],
        relevance_score: Math.min(Math.max(topic.relevance_score || 0.5, 0), 1),
        confidence_score: Math.min(Math.max(topic.confidence_score || 0.5, 0), 1),
        comment_count: topic.comment_count || Math.floor(limitedComments.length / parsed.length),
        sentiment_distribution: {
          positive: Math.min(Math.max(topic.sentiment_distribution?.positive || 0.33, 0), 1),
          neutral: Math.min(Math.max(topic.sentiment_distribution?.neutral || 0.33, 0), 1),
          negative: Math.min(Math.max(topic.sentiment_distribution?.negative || 0.33, 0), 1)
        },
        extracted_method: 'openai-gpt',
        language_detected: 'auto'
      }));

    } catch (error) {
      console.error('❌ OpenAI topics analysis error:', error);
      throw error;
    }
  }

  /**
   * Realiza petición a OpenAI API
   */
  private async makeOpenAIRequest(prompt: string, maxTokens: number = 300): Promise<any> {
    const fetch = await this.getFetch();
    
    const body = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un experto analista de redes sociales. Responde siempre en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.3
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Obtiene información del modelo y configuración
   */
  public getModelInfo(): {
    isConfigured: boolean;
    model: string;
    capabilities: string[];
    status: string;
  } {
    return {
      isConfigured: this.isApiKeyValid(),
      model: 'gpt-3.5-turbo',
      capabilities: [
        'Análisis de sentimientos multilingüe',
        'Detección de temas principales',
        'Procesamiento en lotes',
        'Análisis contextual de redes sociales',
        'Distribución de sentimientos por tema'
      ],
      status: this.isApiKeyValid() ? 'Configurado y listo' : 'API key no configurada'
    };
  }
}

export const openAIAnalysisService = OpenAIAnalysisService.getInstance(); 
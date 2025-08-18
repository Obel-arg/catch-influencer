import keyword_extractor from 'keyword-extractor';
import config from '../../config/environment';

export interface IntelligentTopicResult {
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
  language_detected?: string;
}

export class IntelligentTopicAnalysisService {
  private static instance: IntelligentTopicAnalysisService;
  private readonly MODEL_NAME = "HuggingFaceH4/zephyr-7b-beta";
  private readonly HF_API_URL = "https://api-inference.huggingface.co/models/";
  private readonly HF_API_TOKEN = "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";

  private constructor() {}

  public static getInstance(): IntelligentTopicAnalysisService {
    if (!IntelligentTopicAnalysisService.instance) {
      IntelligentTopicAnalysisService.instance = new IntelligentTopicAnalysisService();
    }
    return IntelligentTopicAnalysisService.instance;
  }

  public async analyzeTopicsIntelligently(comments: string[]): Promise<IntelligentTopicResult[]> {
    const startTime = Date.now();
    
    try {

      const cleanComments = comments
        .map(c => c.trim())
        .filter(c => c.length > 10)
        .slice(0, 30);


      if (cleanComments.length < 3) {
        return this.createSimpleFallback(comments);
      }

      const commentsJson = JSON.stringify(cleanComments, null, 2);
      const prompt = `Analiza estos comentarios y extrae los temas principales con contexto:
${commentsJson}

Formato de respuesta:
1. Tema principal 1: [descripción]
2. Tema principal 2: [descripción]
3. Conclusión general:`;

      const result = await this.queryHuggingFace({ inputs: prompt });
      
      if (!result) {
        console.warn('⚠️ [TOPIC-ANALYSIS] No response from model, using fallback');
        return this.createSimpleFallback(comments);
      }

      const topics = this.parseModelResponse(result, cleanComments.length);
      
      const processingTime = Date.now() - startTime;
      
      return topics;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ [TOPIC-ANALYSIS] Analysis failed after ${processingTime}ms:`, error);
      return this.createSimpleFallback(comments);
    }
  }

  private async queryHuggingFace(payload: { inputs: string }): Promise<string | null> {
    const startTime = Date.now();
    try {
      
      const fetch = await this.getFetch();
      const response = await fetch(`${this.HF_API_URL}${this.MODEL_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.HF_API_TOKEN}`
        },
        body: JSON.stringify(payload)
      });


      if (!response.ok) {
        if (response.status === 503) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          return this.queryHuggingFace(payload);
        }
        
        const errorText = await response.text();
        console.error(`❌ [HF-API] Server error: ${response.status}`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: any = await response.json();
      const processingTime = Date.now() - startTime;
      
      if (Array.isArray(result) && result.length > 0) {
        const firstResult = result[0];
        return firstResult?.generated_text || firstResult?.summary_text || null;
      }
      
      if (typeof result === 'string') {
        return result;
      }

      if (result.generated_text) {
        return result.generated_text;
      }

      console.warn('⚠️ [HF-API] Unexpected response format:', result);
      return null;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ [HF-API] Request failed after ${processingTime}ms:`, error);
      return null;
    }
  }

  private parseModelResponse(response: string, totalComments: number): IntelligentTopicResult[] {
    const topics: IntelligentTopicResult[] = [];
    
    try {
      
      // Buscar patrones de temas en la respuesta
      const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let currentTopic = '';
      let currentDescription = '';
      
      for (const line of lines) {
        
        // Buscar líneas que comienzan con números (1., 2., etc.)
        const topicMatch = line.match(/^(\d+)\.\s*(.+?):\s*(.+)$/);
        if (topicMatch) {
          const [, number, label, description] = topicMatch;
          
          if (currentTopic && currentDescription) {
            topics.push(this.createTopicFromParsed(currentTopic, currentDescription, totalComments));
          }
          
          currentTopic = label.trim();
          currentDescription = description.trim();
        } else if (currentTopic && line.length > 10) {
          // Continuar la descripción en líneas siguientes
          currentDescription += ' ' + line;
        }
      }
      
      // Agregar el último tema
      if (currentTopic && currentDescription) {
        topics.push(this.createTopicFromParsed(currentTopic, currentDescription, totalComments));
      }
      
      // Si no se pudo parsear correctamente, extraer al menos algo útil
      if (topics.length === 0) {
        const generalTopic = this.extractGeneralTopic(response, totalComments);
        topics.push(generalTopic);
      }
      
      
    } catch (error) {
      console.error('❌ Error parseando respuesta:', error);
      const fallbackTopic = this.createTopicFromParsed('Análisis general', response.substring(0, 200), totalComments);
      topics.push(fallbackTopic);
    }
    
    return topics;
  }

  private createTopicFromParsed(label: string, description: string, totalComments: number): IntelligentTopicResult {
    // Extraer keywords de la descripción sin filtros hardcodeados
    const keywords = this.extractSimpleKeywords(label + ' ' + description);
    
    // Calcular scores básicos
    const relevanceScore = Math.min(0.9, 0.3 + (keywords.length * 0.1));
    const confidenceScore = Math.min(0.8, 0.4 + (description.length / 200));
    
    // Distribución de sentimiento básica
    const sentimentDistribution = {
      positive: 0.4,
      neutral: 0.4,
      negative: 0.2
    };

    return {
      topic_label: label,
      topic_description: description,
      keywords,
      relevance_score: relevanceScore,
      confidence_score: confidenceScore,
      comment_count: Math.floor(totalComments / Math.max(1, Math.floor(totalComments / 10))),
      sentiment_distribution: sentimentDistribution,
      extracted_method: 'flan-t5-large',
      language_detected: 'es'
    };
  }

  private extractSimpleKeywords(text: string): string[] {
    // Usar keyword-extractor para español
    const keywords = keyword_extractor.extract(text, {
      language: "spanish",
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    });
    // Devolver las 5-8 más relevantes
    return keywords.slice(0, 8);
  }

  private extractGeneralTopic(response: string, totalComments: number): IntelligentTopicResult {
    const firstSentence = response.split('.')[0].trim();
    const label = firstSentence.length > 50 ? 'Tema identificado por IA' : firstSentence;
    
    return this.createTopicFromParsed(
      label, 
      response.substring(0, 300), 
      totalComments
    );
  }

  private createSimpleFallback(comments: string[]): IntelligentTopicResult[] {
    return [{
      topic_label: 'Análisis no disponible',
      topic_description: 'No se pudo conectar con el modelo de análisis. Servicio temporalmente no disponible.',
      keywords: ['análisis', 'comentarios'],
      relevance_score: 0.1,
      confidence_score: 0.1,
      comment_count: comments.length,
      sentiment_distribution: { positive: 0.33, neutral: 0.34, negative: 0.33 },
      extracted_method: 'fallback',
      language_detected: 'es'
    }];
  }

  public getModelInfo() {
    return {
      isLoaded: true,
      modelName: this.MODEL_NAME,
      description: 'Análisis de temas usando Google FLAN-T5-Large via Hugging Face API gratuita',
      capabilities: [
        'Análisis de texto en lenguaje natural',
        'Extracción de temas contextuales',
        'Sin patrones hardcodeados',
        'Comprensión multilingüe',
        'API gratuita de Hugging Face'
      ]
    };
  }

  public async cleanup(): Promise<void> {
  }

  /**
   * Analiza los comentarios usando OpenAI y devuelve una lista de temas claves
   */
  public async analyzeTopicsWithOpenAI(comments: string[]): Promise<string[]> {
    try {
      // Limitar a 80 comentarios para no exceder el límite de tokens
      const limitedComments = comments.slice(0, 80);
      
      // Verificar si hay una API key válida configurada
      const apiKey = config.openai.apiKey || process.env.OPENAI_API_KEY || 'API-KEY-OPENAI';
      
      // Debug: mostrar información sobre la API key
      
      // Si la API key es el placeholder, devolver temas básicos sin fallar
      if (!apiKey || apiKey === 'API-KEY-OPENAI' || apiKey.includes('**')) {
        return this.extractBasicTopicsFromComments(limitedComments);
      }
      
      const prompt = `Analiza la siguiente lista de comentarios de usuarios sobre un post en redes sociales.\nDevuélveme solo los 3 temas principales que sean comunes o recurrentes en la mayoría de los comentarios.\n\n- Ignora temas mencionados solo una vez o en comentarios aislados.\n- No incluyas temas que no sean relevantes para la mayoría.\n- No repitas temas similares.\n- No incluyas nombres de usuarios ni hashtags.\n- Responde solo con la lista en formato JSON, por ejemplo:\n[\"tema 1\", \"tema 2\", \"tema 3\"]\n\nComentarios:\n\n${limitedComments.map(c => c.replace(/\n/g, ' ')).join('\n')}`;
      const body = {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un asistente experto en análisis de redes sociales." },
          { role: "user", content: prompt }
        ],
        max_tokens: 256,
        temperature: 0.3
      };
      const fetch = await this.getFetch();
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [OPENAI] Error response body:`, errorText);
        if (response.status === 429) {
          console.error('❌ [OPENAI] Error 429: Too Many Requests. Puede que estés superando el límite de la API.');
        } else if (response.status === 401) {
          console.error('❌ [OPENAI] Error 401: API key inválida.');
        }
        
        // En lugar de lanzar error, devolver análisis básico
        return this.extractBasicTopicsFromComments(limitedComments);
      }
      
      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Intentar parsear el JSON de la respuesta
      try {
        const temas = JSON.parse(content);
        if (Array.isArray(temas)) {
          return temas;
        }
      } catch (e) {
        // Si no es JSON puro, intentar extraer el array con regex
        const match = content.match(/\[(.*?)\]/s);
        if (match) {
          try {
            const temas = JSON.parse(match[0]);
            if (Array.isArray(temas)) {
              return temas;
            }
          } catch {}
        }
      }
      
      // Si no se pudo parsear, usar análisis básico
      return this.extractBasicTopicsFromComments(limitedComments);
      
    } catch (error) {
      console.error('❌ [OPENAI] Error en analyzeTopicsWithOpenAI:', error instanceof Error ? error.message : error);
      return this.extractBasicTopicsFromComments(comments.slice(0, 80));
    }
  }
  
  /**
   * Extrae temas básicos de los comentarios sin usar IA externa
   */
  private extractBasicTopicsFromComments(comments: string[]): string[] {
    // Análisis básico por frecuencia de palabras
    const wordCounts: Record<string, number> = {};
    const stopWords = new Set(['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como', 'muy', 'más', 'pero', 'ya', 'me', 'mi', 'tu', 'si', 'este', 'esta', 'está', 'ser', 'tiene', 'todo', 'bien', 'bueno', 'malo']);
    
    comments.forEach(comment => {
      const words = comment.toLowerCase()
        .replace(/[^a-záéíóúñü\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));
        
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });
    
    // Obtener las palabras más frecuentes
    const sortedWords = Object.entries(wordCounts)
      .filter(([_, count]) => count >= 2) // Al menos 2 menciones
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([word, _]) => word);
    
    // Si no hay suficientes palabras frecuentes, usar temas genéricos
    if (sortedWords.length === 0) {
      return ['interacción general', 'comentarios diversos', 'engagement'];
    }
    
    return sortedWords;
  }

  private async getFetch() {
    const mod = await import('node-fetch');
    return mod.default;
  }
}

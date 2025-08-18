import { supabase } from '../lib/supabase';
import { openAITopicsService, HybridTopicResult } from './analysis/openai-topics.service';
import { IntelligentTopicAnalysisService, IntelligentTopicResult } from './analysis/intelligent-topic-analysis.service';
import { postgresCacheService } from './cache/postgres-cache.service';

export interface PostTopicsStats {
  totalComments: number;
  topicsExtracted: number;
  averageConfidence: number;
  languagesDetected: string[];
  processingTimeMs: number;
  extractionMethod: string;
}

export class PostTopicsService {
  private static instance: PostTopicsService;
  private static processingPosts = new Set<string>();
  private static processingLock = new Map<string, Promise<any>>();
  private intelligentService: IntelligentTopicAnalysisService;

  private constructor() {
    this.intelligentService = IntelligentTopicAnalysisService.getInstance();
  }

  public static getInstance(): PostTopicsService {
    if (!PostTopicsService.instance) {
      PostTopicsService.instance = new PostTopicsService();
    }
    return PostTopicsService.instance;
  }

  /**
   * Verifica si un post ya está siendo procesado
   */
  private isPostBeingProcessed(postId: string): boolean {
    return PostTopicsService.processingPosts.has(postId);
  }

  /**
   * Marca un post como en procesamiento
   */
  private markPostAsProcessing(postId: string): void {
    PostTopicsService.processingPosts.add(postId);
  }

  /**
   * Marca un post como procesado
   */
  private markPostAsProcessed(postId: string): void {
    PostTopicsService.processingPosts.delete(postId);
  }

  /**
   * Obtiene o crea un lock para un post específico
   */
  private async getProcessingLock(postId: string, processor: () => Promise<any>): Promise<any> {
    // Si ya hay un lock para este post, esperar a que termine
    if (PostTopicsService.processingLock.has(postId)) {
      return await PostTopicsService.processingLock.get(postId);
    }

    // Crear nuevo lock
    const lockPromise = processor().finally(() => {
      PostTopicsService.processingLock.delete(postId);
    });

    PostTopicsService.processingLock.set(postId, lockPromise);
    return lockPromise;
  }

  /**
   * Analiza temas para un post específico usando análisis inteligente
   */
  public async analyzeTopics(postId: string): Promise<{
    success: boolean;
    topicsCount: number;
    processingTime: number;
    method: string;
    error?: string;
  }> {
    // Usar control de concurrencia para evitar procesamiento duplicado
    return this.getProcessingLock(postId, async () => {
    const startTime = Date.now();
    
    try {
        // Verificar si ya existen temas para este post
        const existingTopics = await this.getPostTopics(postId);
        if (existingTopics && existingTopics.length > 0) {
          return {
            success: true,
            topicsCount: existingTopics.length,
            processingTime: Date.now() - startTime,
            method: 'cached'
          };
        }

        // Marcar como en procesamiento
        this.markPostAsProcessing(postId);
      
      // Buscar comentarios del post
      const comments = await this.getRealCommentsFromDatabase(postId);
      
      if (comments.length === 0) {
        console.warn(`⚠️ No se encontraron comentarios para el post ${postId}`);
        return {
          success: false,
          topicsCount: 0,
          processingTime: Date.now() - startTime,
          method: 'intelligent-conversational-ai',
          error: 'No se encontraron comentarios para analizar'
        };
      }

      // Limpiar temas existentes
      await this.deleteTopicsForPost(postId);

      // Usar OpenAI como método principal
      let commentTexts = comments.map((c: any) => c.text);
      // Limitar a 30 comentarios representativos si hay más
      if (commentTexts.length > 30) {
        // Muestreo simple: tomar los 30 primeros (puedes hacer aleatorio si prefieres)
        commentTexts = commentTexts.slice(0, 30);
      }
      
      try {
        // Intentar con OpenAI primero
        const openaiResult = await openAITopicsService.analyzeTopics(commentTexts);
        const topics = openaiResult.topics;
        
        // Convertir a formato compatible si es necesario
        const convertedTopics = topics.map(topic => ({
          topic_label: topic.topic_label,
          topic_description: topic.topic_description,
          keywords: topic.keywords,
          relevance_score: topic.relevance_score,
          confidence_score: topic.confidence_score,
          comment_count: topic.comment_count,
          sentiment_distribution: topic.sentiment_distribution,
          extracted_method: topic.extracted_method,
          language_detected: topic.language_detected
        }));
        
        // Filtrar los 5 más relevantes
        const topTopics = convertedTopics
          .sort((a, b) => (b.comment_count + b.relevance_score) - (a.comment_count + a.relevance_score))
          .slice(0, 5);

        if (topTopics.length > 0) {
          await this.saveTopicsToDatabase(postId, topTopics);
          return {
            success: true,
            topicsCount: topTopics.length,
            processingTime: Date.now() - startTime,
            method: 'openai-gpt'
          };
        }
      } catch (openaiError) {
        console.warn('⚠️ OpenAI topics analysis failed, using fallback:', openaiError);
      }
      
      // Fallback al método anterior
      const topics = await this.intelligentService.analyzeTopicsIntelligently(commentTexts);

      // Filtrar los 5 más relevantes combinando comment_count y relevance_score
      const topTopics = topics
        .sort((a, b) => (b.comment_count + b.relevance_score) - (a.comment_count + a.relevance_score))
        .slice(0, 5);

      if (topTopics.length === 0) {
        console.warn(`⚠️ No se pudieron extraer temas para el post ${postId}`);
        return {
          success: false,
          topicsCount: 0,
          processingTime: Date.now() - startTime,
          method: 'intelligent-conversational-ai',
          error: 'No se pudieron extraer temas de los comentarios'
        };
      }

      // Guardar solo los 5 más relevantes en la base de datos
      await this.saveTopicsToDatabase(postId, topTopics);

      const processingTime = Date.now() - startTime;
      const highConfidenceTopics = topTopics.filter(t => t.confidence_score > 0.6).length;

      return {
        success: true,
        topicsCount: topTopics.length,
        processingTime,
        method: 'intelligent-conversational-ai'
      };

    } catch (error) {
      console.error(`❌ [TOPIC-ANALYSIS] Error analizando temas para post ${postId}:`, error);
      return {
        success: false,
        topicsCount: 0,
        processingTime: Date.now() - startTime,
        method: 'intelligent-conversational-ai',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
      } finally {
        // Marcar como procesado
        this.markPostAsProcessed(postId);
    }
    });
  }

  /**
   * Obtiene comentarios reales de la base de datos/PostgreSQL
   */
  private async getRealCommentsFromDatabase(postId: string): Promise<Array<{ text: string; sentiment?: string }>> {
    try {
      // Intentar obtener de PostgreSQL cache primero
      const cacheData = await postgresCacheService.get(`comments:${postId}`) as any;
      if (cacheData && cacheData.comments && cacheData.comments.length > 0) {
        return cacheData.comments.map((comment: any) => ({
          text: comment.text,
          sentiment: comment.sentiment?.label
        }));
      }

      // Buscar en la nueva estructura JSONB de post_metrics
      const { data: postMetrics, error: metricsError } = await supabase
        .from('post_metrics')
        .select('comments_analysis')
        .eq('post_id', postId)
        .not('comments_analysis', 'is', null)
        .limit(1);

      if (metricsError) {
        console.error('Error obteniendo comentarios de post_metrics:', metricsError);
      } else if (postMetrics && postMetrics.length > 0 && postMetrics[0].comments_analysis) {
        const commentsAnalysis = postMetrics[0].comments_analysis;
        if (commentsAnalysis.comments && Array.isArray(commentsAnalysis.comments)) {
          return commentsAnalysis.comments.map((comment: any) => ({
            text: comment.text || '',
            sentiment: comment.sentiment?.label || 'neutral'
          }));
        }
      }

      // Fallback: buscar en la tabla comments (legacy)
      const { data: comments, error } = await supabase
        .from('comments')
        .select('text, sentiment')
        .eq('post_id', postId)
        .limit(1000);

      if (error) {
        console.error('Error obteniendo comentarios de Supabase (legacy):', error);
        return [];
      }

      return comments || [];

    } catch (error) {
      console.error('Error obteniendo comentarios:', error);
      return [];
    }
  }

  /**
   * Elimina temas existentes para un post
   * GARANTIZA UN SOLO REGISTRO POR POST
   */
  private async deleteTopicsForPost(postId: string): Promise<void> {
    try {
      
      // Verificar si existen temas para este post
      const { data: existingTopics, error: checkError } = await supabase
        .from('post_topics')
        .select('id, created_at, topic_label')
        .eq('post_id', postId);

      if (checkError) {
        console.error('❌ [TOPICS-CLEANUP] Error checking existing topics:', checkError);
        return;
      }

      if (existingTopics && existingTopics.length > 0) {
        
        // Si hay múltiples registros, loggear información para debugging
        if (existingTopics.length > 1) {
          console.warn(`⚠️ [TOPICS-CLEANUP] Multiple topic records found for post ${postId}:`, 
            existingTopics.map((t: any) => ({ id: t.id, topic: t.topic_label, created: t.created_at }))
          );
        }
        
        const { error } = await supabase
          .from('post_topics')
          .delete()
        .eq('post_id', postId);

      if (error) {
          console.error('❌ [TOPICS-CLEANUP] Error eliminando temas existentes:', error);
          throw error;
        }
        
      } else {
      }
    } catch (error) {
      console.error('❌ [TOPICS-CLEANUP] Error en deleteTopicsForPost:', error);
      throw error;
    }
  }

  /**
   * Guarda temas en la base de datos
   */
  private async saveTopicsToDatabase(postId: string, topics: IntelligentTopicResult[]): Promise<void> {
    try {
      // Eliminar siempre los temas existentes antes de insertar
      await this.deleteTopicsForPost(postId);

      const topicsToInsert = topics.map(topic => ({
        post_id: postId,
        topic_label: topic.topic_label,
        topic_description: topic.topic_description,
        keywords: topic.keywords,
        relevance_score: topic.relevance_score,
        confidence_score: topic.confidence_score,
        comment_count: topic.comment_count,
        sentiment_distribution: topic.sentiment_distribution,
        extracted_method: topic.extracted_method,
        language_detected: topic.language_detected
      }));

      const { error } = await supabase
        .from('post_topics')
        .insert(topicsToInsert);

      if (error) {
        console.error('Error guardando temas:', error);
        throw error;
      }


    } catch (error) {
      console.error('Error en saveTopicsToDatabase:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los temas de un post específico
   */
  public async getPostTopics(postId: string): Promise<IntelligentTopicResult[]> {
    try {
      const { data: topics, error } = await supabase
        .from('post_topics')
        .select('*')
        .eq('post_id', postId)
        .order('relevance_score', { ascending: false });

      if (error) {
        console.error('Error obteniendo temas de post:', error);
        throw new Error(`Error al obtener temas: ${error.message}`);
      }

      return topics || [];
    } catch (error) {
      console.error('Error en getPostTopics:', error);
      return [];
    }
  }

  /**
   * Elimina todos los temas de un post
   */
  public async deletePostTopics(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('post_topics')
        .delete()
        .eq('post_id', postId);

      if (error) {
        console.error('Error eliminando temas de post:', error);
        throw new Error(`Error al eliminar temas: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en deletePostTopics:', error);
      throw error;
    }
  }

  /**
   * Limpia duplicados masivamente en post_topics
   * MANTIENE SOLO UN REGISTRO POR POST
   */
  async cleanupDuplicateTopics(): Promise<{
    totalPosts: number;
    duplicatePosts: number;
    cleanedPosts: number;
    errors: string[];
  }> {
    const result = {
      totalPosts: 0,
      duplicatePosts: 0,
      cleanedPosts: 0,
      errors: [] as string[]
    };

    try {
      
      // Obtener todos los post_ids que tienen múltiples registros usando RPC
      const { data: duplicateGroups, error: groupError } = await supabase
        .rpc('get_duplicate_post_topics');

      if (groupError) {
        console.error('❌ [TOPICS-CLEANUP] Error finding duplicate groups:', groupError);
        result.errors.push(`Error finding duplicates: ${groupError.message}`);
        return result;
      }

      if (!duplicateGroups || duplicateGroups.length === 0) {
        return result;
      }

      result.duplicatePosts = duplicateGroups.length;

      // Procesar cada post con duplicados
      for (const group of duplicateGroups) {
        try {
          const postId = group.post_id;
          
          // Obtener todos los registros para este post
          const { data: records, error: recordsError } = await supabase
            .from('post_topics')
            .select('id, created_at, topic_label')
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

          if (recordsError) {
            console.error(`❌ [TOPICS-CLEANUP] Error getting records for post ${postId}:`, recordsError);
            result.errors.push(`Error getting records for ${postId}: ${recordsError.message}`);
            continue;
          }

          if (records && records.length > 1) {
            console.warn(`⚠️ [TOPICS-CLEANUP] Found ${records.length} topic records for post ${postId}:`, 
              records.map((r: any) => ({ id: r.id, topic: r.topic_label, created: r.created_at }))
            );
            
            // Mantener solo el registro más reciente
            const recordsToDelete = records.slice(1).map((r: any) => r.id);
            
            const { error: deleteError } = await supabase
              .from('post_topics')
              .delete()
              .in('id', recordsToDelete);

            if (deleteError) {
              console.error(`❌ [TOPICS-CLEANUP] Error deleting duplicates for post ${postId}:`, deleteError);
              result.errors.push(`Error deleting duplicates for ${postId}: ${deleteError.message}`);
            } else {
              result.cleanedPosts++;
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ [TOPICS-CLEANUP] Error processing post ${group.post_id}:`, error);
          result.errors.push(`Error processing ${group.post_id}: ${errorMsg}`);
        }
      }

      return result;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [TOPICS-CLEANUP] Critical error in mass cleanup:', error);
      result.errors.push(`Critical error: ${errorMsg}`);
      return result;
    }
  }

  /**
   * Analiza y guarda temas para un post con comentarios específicos usando OpenAI
   */
  public async analyzeAndSavePostTopics(postId: string, comments: Array<{ text: string; sentiment?: string }>): Promise<{
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
      // Limpiar temas existentes
      await this.deleteTopicsForPost(postId);

      // Usar OpenAI como método principal
      const result = await openAITopicsService.analyzeAndFormatForDatabase(postId, comments);
      
      if (result.success && result.topics.length > 0) {
        // Guardar temas en la base de datos
        const topicRecords = result.topics.map(topic => ({
          post_id: postId,
          topic_label: topic.topic_label,
          topic_description: topic.topic_description,
          keywords: topic.keywords,
          relevance_score: topic.relevance_score,
          confidence_score: topic.confidence_score,
          comment_count: topic.comment_count,
          sentiment_distribution: topic.sentiment_distribution,
          extracted_method: topic.extracted_method,
          language_detected: topic.language_detected
        }));

        const { error } = await supabase.from('post_topics').insert(topicRecords);
        if (error) {
          throw error;
        }

        return {
          success: true,
          summary: result.summary,
          topics: result.topics,
          processingStats: result.processingStats
        };
      }
      
      // Si OpenAI falla, usar el método anterior como fallback
      console.warn('⚠️ OpenAI topics analysis failed, using fallback method');
      
      let commentTexts = comments.map((c: any) => c.text).filter(Boolean);
      if (commentTexts.length > 30) {
        commentTexts = commentTexts.slice(0, 30);
      }
      const temasClaves = await this.intelligentService.analyzeTopicsWithOpenAI(commentTexts);

      // Guardar un solo registro en post_topics
      const topicRecord = {
        post_id: postId,
        topic_label: 'Temas claves',
        topic_description: 'Temas principales extraídos automáticamente de los comentarios.',
        keywords: temasClaves,
        relevance_score: 1,
        confidence_score: 1,
        comment_count: commentTexts.length,
        sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
        extracted_method: 'openai-gpt-fallback',
        language_detected: 'es'
      };
      const { error } = await supabase.from('post_topics').insert([topicRecord]);
      if (error) {
        throw error;
      }

      const processingTime = Date.now() - startTime;
      return {
        success: true,
        summary: {
          totalTopics: 1,
          highConfidenceTopics: 1,
          languagesDetected: ['es']
        },
        topics: [topicRecord as HybridTopicResult],
        processingStats: {
          processingTimeMs: processingTime,
          extractionMethod: 'openai-gpt-fallback'
        }
      };

    } catch (error) {
      console.error(`❌ [TOPIC-ANALYSIS] Error en analyzeAndSavePostTopics:`, error);
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
   * Obtiene nichos y topics desde CreatorDB como categorías
   */
  async getTopicNicheCategories(platform: string = 'instagram'): Promise<any> {
    try {
      const { CreatorDBService } = await import('../creator/creator.service');
      const response = await CreatorDBService.getTopicTable(platform);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error obteniendo datos de CreatorDB');
      }

      const categories: any[] = [];

      // Procesar topics
      if (response.data.topics) {
        Object.entries(response.data.topics).forEach(([id, topic]: [string, any]) => {
          categories.push({
            id,
            name: topic.name,
            category: topic.category,
            channelCount: topic.channelCount,
            type: 'topic',
            platform: response.data.platform
          });
        });
      }

      // Procesar niches
      if (response.data.niches) {
        Object.entries(response.data.niches).forEach(([id, niche]: [string, any]) => {
          categories.push({
            id,
            name: niche.name,
            category: niche.category,
            channelCount: niche.channelCount,
            type: 'niche',
            platform: response.data.platform
          });
        });
      }

      // Ordenar por cantidad de canales (descendente)
      categories.sort((a, b) => b.channelCount - a.channelCount);

      return {
        success: true,
        data: {
          platform: response.data.platform,
          categories,
          stats: {
            totalTopics: Object.keys(response.data.topics || {}).length,
            totalNiches: Object.keys(response.data.niches || {}).length,
            totalCategories: categories.length,
            mostPopularCategory: categories[0]?.category || null,
            quotaUsed: response.quotaUsed
          }
        }
      };

    } catch (error) {
      console.error('[POST-TOPICS] Error obteniendo categorías:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene categorías agrupadas por tipo (topics vs niches)
   */
  async getCategoriesByType(platform: string = 'instagram'): Promise<any> {
    try {
      const result = await this.getTopicNicheCategories(platform);
      
      if (!result.success) {
        return result;
      }

      const categories = result.data.categories;
      
      const groupedByType = {
        topics: categories.filter((cat: any) => cat.type === 'topic'),
        niches: categories.filter((cat: any) => cat.type === 'niche')
      };

      const groupedByCategory = categories.reduce((acc: any, cat: any) => {
        if (!acc[cat.category]) {
          acc[cat.category] = [];
        }
        acc[cat.category].push(cat);
        return acc;
      }, {});

      return {
        success: true,
        data: {
          platform: result.data.platform,
          byType: groupedByType,
          byCategory: groupedByCategory,
          stats: result.data.stats
        }
      };

    } catch (error) {
      console.error('[POST-TOPICS] Error agrupando categorías:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Busca categorías por nombre o categoría
   */
  async searchCategories(searchTerm: string, platform: string = 'instagram'): Promise<any> {
    try {
      const result = await this.getTopicNicheCategories(platform);
      
      if (!result.success) {
        return result;
      }

      const searchLower = searchTerm.toLowerCase();
      const filteredCategories = result.data.categories.filter((cat: any) => 
        cat.name.toLowerCase().includes(searchLower) ||
        cat.category.toLowerCase().includes(searchLower)
      );

      return {
        success: true,
        data: {
          platform: result.data.platform,
          searchTerm,
          categories: filteredCategories,
          stats: {
            ...result.data.stats,
            foundResults: filteredCategories.length
          }
        }
      };

    } catch (error) {
      console.error('[POST-TOPICS] Error buscando categorías:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Exportar instancia singleton
export const postTopicsService = PostTopicsService.getInstance(); 
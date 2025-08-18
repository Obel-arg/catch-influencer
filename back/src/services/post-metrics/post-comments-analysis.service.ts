import supabase from '../../config/supabase';

// Interfaces para el análisis de comentarios
export interface CommentAnalysis {
  id: string;
  text: string;
  author: string;
  publishedAt: string;
  likeCount: number;
  replyCount: number;
  platform: 'youtube' | 'instagram' | 'tiktok';
  sentiment?: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    method: string;
  };
  scrapedAt: string;
}

export interface SentimentSummary {
  positive: number;
  negative: number;
  neutral: number;
  total_analyzed: number;
  average_score: number;
}



export interface CommentsAnalysisData {
  comments?: CommentAnalysis[];
  analysis_metadata?: {
    analyzed_at: string;
    model_used: string;
    processing_time_ms: number;
    total_comments: number;
    platform: string;
  };
}

export class PostCommentsAnalysisService {
  private static instance: PostCommentsAnalysisService;
  private static processingPosts = new Set<string>();
  private static processingLock = new Map<string, Promise<any>>();

  private constructor() {}

  static getInstance(): PostCommentsAnalysisService {
    if (!PostCommentsAnalysisService.instance) {
      PostCommentsAnalysisService.instance = new PostCommentsAnalysisService();
    }
    return PostCommentsAnalysisService.instance;
  }

  /**
   * Verifica si un post ya está siendo procesado
   */
  private isPostBeingProcessed(postId: string): boolean {
    return PostCommentsAnalysisService.processingPosts.has(postId);
  }

  /**
   * Marca un post como en procesamiento
   */
  private markPostAsProcessing(postId: string): void {
    PostCommentsAnalysisService.processingPosts.add(postId);
  }

  /**
   * Marca un post como procesado
   */
  private markPostAsProcessed(postId: string): void {
    PostCommentsAnalysisService.processingPosts.delete(postId);
  }

  /**
   * Obtiene o crea un lock para un post específico
   */
  private async getProcessingLock(postId: string, processor: () => Promise<any>): Promise<any> {
    // Si ya hay un lock para este post, esperar a que termine
    if (PostCommentsAnalysisService.processingLock.has(postId)) {
      return await PostCommentsAnalysisService.processingLock.get(postId);
    }

    // Crear nuevo lock
    const lockPromise = processor().finally(() => {
      PostCommentsAnalysisService.processingLock.delete(postId);
    });

    PostCommentsAnalysisService.processingLock.set(postId, lockPromise);
    return lockPromise;
  }

  /**
   * Guardar análisis de comentarios en la columna JSONB
   */
  async saveCommentsAnalysis(
    postId: string, 
    analysisData: CommentsAnalysisData
  ): Promise<void> {
    // Usar control de concurrencia para evitar procesamiento duplicado
    return this.getProcessingLock(postId, async () => {
      try {
        // Verificar si ya existe un análisis para este post
        const existingAnalysis = await this.getCommentsAnalysis(postId);
        if (existingAnalysis) {
          return;
        }

        // Marcar como en procesamiento
        this.markPostAsProcessing(postId);
        
        // Primero verificar que el registro existe
        const { data: existingRecord, error: checkError } = await supabase
          .from('post_metrics')
          .select('id, comments_analysis')
          .eq('post_id', postId)
          .limit(1);
        
        if (checkError) {
          console.error(`❌ [COMMENTS-ANALYSIS] Error checking existing record for post ${postId}:`, checkError);
          throw checkError;
        }
        
        if (!existingRecord || existingRecord.length === 0) {
          console.error(`❌ [COMMENTS-ANALYSIS] No post_metrics record found for post ${postId}`);
          throw new Error(`No post_metrics record found for post ${postId}`);
        }
        
        
        const { error } = await supabase
          .from('post_metrics')
          .update({
            comments_analysis: analysisData,
            updated_at: new Date()
          })
          .eq('post_id', postId);

        if (error) {
          console.error(`❌ [COMMENTS-ANALYSIS] Error saving analysis for post ${postId}:`, error);
          console.error(`🔍 [COMMENTS-ANALYSIS] Error details:`, {
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.details,
            postId,
            analysisDataKeys: Object.keys(analysisData)
          });
          throw error;
        }


      } catch (error) {
        console.error(`❌ [COMMENTS-ANALYSIS] Failed to save analysis for post ${postId}:`, error);
        console.error(`🔍 [COMMENTS-ANALYSIS] Error context:`, {
          postId,
          analysisDataType: typeof analysisData,
          analysisDataKeys: Object.keys(analysisData || {}),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      } finally {
        // Marcar como procesado
        this.markPostAsProcessed(postId);
      }
    });
  }

  /**
   * Obtener análisis de comentarios de la columna JSONB
   */
  async getCommentsAnalysis(postId: string): Promise<CommentsAnalysisData | null> {
    try {
      // Obtener el registro más reciente sin usar .single() para evitar PGRST116
      const { data, error } = await supabase
        .from('post_metrics')
        .select('comments_analysis')
        .eq('post_id', postId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error(`❌ [COMMENTS-ANALYSIS] Error getting analysis for post ${postId}:`, error);
        throw error;
      }

      // Si no hay datos o el primer registro no tiene comments_analysis, retornar null
      if (!data || data.length === 0 || !data[0].comments_analysis) {
        return null;
      }

      return data[0].comments_analysis;
    } catch (error) {
      console.error(`❌ [COMMENTS-ANALYSIS] Failed to get analysis for post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener análisis de comentarios para múltiples posts
   */
  async getCommentsAnalysisBatch(postIds: string[]): Promise<Record<string, CommentsAnalysisData>> {
    try {
      if (postIds.length === 0) return {};

      const { data, error } = await supabase
        .from('post_metrics')
        .select('post_id, comments_analysis')
        .in('post_id', postIds)
        .not('comments_analysis', 'is', null);

      if (error) {
        console.error(`❌ [COMMENTS-ANALYSIS] Error getting batch analysis:`, error);
        throw error;
      }

      const result: Record<string, CommentsAnalysisData> = {};
      data?.forEach(row => {
        if (row.comments_analysis) {
          result[row.post_id] = row.comments_analysis;
        }
      });

      return result;
    } catch (error) {
      console.error(`❌ [COMMENTS-ANALYSIS] Failed to get batch analysis:`, error);
      throw error;
    }
  }





  /**
   * Agregar nuevos comentarios al análisis existente
   */
  async addCommentsToAnalysis(
    postId: string, 
    newComments: CommentAnalysis[]
  ): Promise<void> {
    try {
      // Obtener análisis existente
      const existingAnalysis = await this.getCommentsAnalysis(postId);
      
      const updatedAnalysis: CommentsAnalysisData = {
        ...existingAnalysis,
        comments: [...(existingAnalysis?.comments || []), ...newComments],
        analysis_metadata: {
          analyzed_at: new Date().toISOString(),
          model_used: existingAnalysis?.analysis_metadata?.model_used || 'openai',
          processing_time_ms: existingAnalysis?.analysis_metadata?.processing_time_ms || 0,
          total_comments: 0,
          platform: existingAnalysis?.analysis_metadata?.platform || 'unknown',
        }
      };

      await this.saveCommentsAnalysis(postId, updatedAnalysis);
    } catch (error) {
      console.error(`❌ [COMMENTS-ANALYSIS] Failed to add comments for post ${postId}:`, error);
      throw error;
    }
  }



  /**
   * Obtener estadísticas de análisis
   */
  async getAnalysisStats(): Promise<{
    total_posts_analyzed: number;
    total_comments_analyzed: number;
    posts_by_platform: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('post_metrics')
        .select('comments_analysis')
        .not('comments_analysis', 'is', null);

      if (error) {
        console.error(`❌ [COMMENTS-ANALYSIS] Error getting stats:`, error);
        throw error;
      }

      let totalPosts = 0;
      let totalComments = 0;
      const postsByPlatform: Record<string, number> = {};

      data?.forEach(row => {
        const analysis = row.comments_analysis as CommentsAnalysisData;
        if (analysis) {
          totalPosts++;
          totalComments += analysis.comments?.length || 0;
          
          const platform = analysis.analysis_metadata?.platform || 'unknown';
          postsByPlatform[platform] = (postsByPlatform[platform] || 0) + 1;
        }
      });

      return {
        total_posts_analyzed: totalPosts,
        total_comments_analyzed: totalComments,
        posts_by_platform: postsByPlatform,
      };
    } catch (error) {
      console.error(`❌ [COMMENTS-ANALYSIS] Failed to get stats:`, error);
      throw error;
    }
  }

  /**
   * Limpiar análisis antiguos (más de X días)
   */
  async cleanupOldAnalysis(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabase
        .from('post_metrics')
        .update({ comments_analysis: null })
        .lt('updated_at', cutoffDate.toISOString())
        .not('comments_analysis', 'is', null);

      if (error) {
        console.error(`❌ [COMMENTS-ANALYSIS] Error cleaning up old analysis:`, error);
        throw error;
      }

      return 0;
    } catch (error) {
      console.error(`❌ [COMMENTS-ANALYSIS] Failed to cleanup old analysis:`, error);
      throw error;
    }
  }
}

export const postCommentsAnalysisService = PostCommentsAnalysisService.getInstance(); 
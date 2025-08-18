import { YouTubeAnalysisService } from '../analysis/youtube-analysis.service';
import { InstagramAnalysisService } from '../analysis/instagram-analysis.service';
import { postgresCacheService } from '../cache/postgres-cache.service';
import { SentimentAnalysisService, PostMetrics } from '../database/sentiment-analysis.service';

export interface StoredPostComments {
  postId: string;
  postUrl: string;
  platform: string;
  postTitle: string;
  postAuthor: string;
  totalComments: number;
  extractedComments: number;
  comments: Array<{
    id: string;
    text: string;
    author: string;
    username: string;
    publishedAt: string;
    likeCount: number;
    replyCount: number;
    retweetCount: number;
    verified: boolean;
    platform: string;
    sentiment?: any;
    scrapedAt: string;
  }>;
  sentimentSummary?: any;
  scrapedAt: string;
  lastUpdated: string;
}

export interface ScrapingResult {
  success: boolean;
  postId: string;
  platform: 'youtube' | 'tiktok' | 'twitter' | 'instagram';
  commentsExtracted: number;
  sentimentAnalyzed: boolean;
  error?: string;
}

export class AutoScrapingService {
  
  /**
   * Detecta la plataforma de una URL
   */
  private static detectPlatform(url: string): 'youtube' | 'tiktok' | 'twitter' | 'instagram' | null {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) return 'tiktok';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('instagram.com')) return 'instagram';
    return null;
  }

  /**
   * Realiza scraping automático de comentarios para un post
   */
  static async scrapePostComments(postId: string, postUrl: string): Promise<ScrapingResult> {
    try {
      
      // Detectar plataforma
      const platform = this.detectPlatform(postUrl);
      if (!platform) {
        return {
          success: false,
          postId,
          platform: 'youtube', // default
          commentsExtracted: 0,
          sentimentAnalyzed: false,
          error: 'Plataforma no soportada'
        };
      }

      // ⚠️ CAMBIO: Verificar si ya existe análisis para este POST ID específico (no por URL)
      // Esto permite que diferentes posts con la misma URL tengan análisis independientes
        const existingAnalysis = await SentimentAnalysisService.getSentimentAnalysis(postId);
      if (existingAnalysis) {
        
        
        return {
          success: true,
          postId,
          platform: existingAnalysis.platform as any,
          commentsExtracted: existingAnalysis.total_comments,
          sentimentAnalyzed: true
        };
      }


      let analysisResult;
      
      switch (platform) {
        case 'instagram':
          const instagramService = new InstagramAnalysisService();
          analysisResult = await instagramService.analyzeInstagramPost(postUrl);
          break;
        case 'youtube':
        case 'tiktok':
        case 'twitter':
          const unifiedAnalysisService = new YouTubeAnalysisService();
          analysisResult = await unifiedAnalysisService.analyzePost(postUrl);
          break;
        default:
          throw new Error(`Plataforma no soportada: ${platform}`);
      }
      
      if (!analysisResult || !analysisResult.comments) {
        return {
          success: false,
          postId,
          platform,
          commentsExtracted: 0,
          sentimentAnalyzed: false,
          error: 'Error en análisis o sin comentarios'
        };
      }

      // Convertir formato para Redis
      const comments = (analysisResult as any).comments || (analysisResult as any).commentsSample || [];
      const commentsData: StoredPostComments = {
        postId,
        postUrl,
        platform,
        postTitle: (analysisResult as any).videoTitle || (analysisResult as any).postId || 'Sin título',
        postAuthor: 'Autor desconocido', // No disponible en el resultado optimizado
        totalComments: analysisResult.totalComments || 0,
        extractedComments: analysisResult.analyzedComments || 0,
        comments: comments.map((comment: any) => ({
          id: comment.id || Math.random().toString(36),
          text: comment.text || '',
          author: comment.author || 'Usuario desconocido',
          username: comment.author,
          publishedAt: comment.publishedAt || new Date().toISOString(),
          likeCount: comment.likeCount || 0,
          replyCount: comment.replyCount || 0,
          retweetCount: 0,
          verified: false,
          platform,
          sentiment: comment.sentiment,
          scrapedAt: new Date().toISOString()
        })),
        sentimentSummary: analysisResult.sentimentSummary,
        scrapedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Almacenar en PostgreSQL con estructura organizada
      await postgresCacheService.set(`comments:${postId}`, commentsData, 3600 * 24); // 24 hours

      // Realizar análisis de sentimientos y guardar en Supabase
      const sentimentAnalyzed = await this.performSentimentAnalysis(postId, commentsData, platform);


      return {
        success: true,
        postId,
        platform,
        commentsExtracted: commentsData.extractedComments,
        sentimentAnalyzed
      };

    } catch (error) {
      console.error(`❌ Error en auto-scraping para post ${postId}:`, error);
      return {
        success: false,
        postId,
        platform: 'youtube', // default
        commentsExtracted: 0,
        sentimentAnalyzed: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Realiza análisis de sentimientos y lo guarda en Supabase
   */
  private static async performSentimentAnalysis(
    postId: string, 
    commentsData: StoredPostComments, 
    platform: 'youtube' | 'tiktok' | 'twitter' | 'instagram'
  ): Promise<boolean> {
    try {

      if (!commentsData.sentimentSummary) {
        return false;
      }

      const sentimentData = {
        post_id: postId,
        platform,
        positive_count: commentsData.sentimentSummary.positive,
        negative_count: commentsData.sentimentSummary.negative,
        neutral_count: commentsData.sentimentSummary.neutral,
        total_comments: commentsData.extractedComments,
        positive_percentage: commentsData.sentimentSummary.positivePercentage,
        negative_percentage: commentsData.sentimentSummary.negativePercentage,
        neutral_percentage: commentsData.sentimentSummary.neutralPercentage
      };

      // Calcular métricas del post basadas en los comentarios extraídos
      const postMetrics = this.calculatePostMetrics(commentsData);
      
      if (postMetrics) {
        
      }

      // Guardar análisis de sentimientos con métricas avanzadas
      await SentimentAnalysisService.saveSentimentAnalysis(sentimentData, postMetrics);
      
      
      return true;
    } catch (error) {
      console.error(`❌ Error en análisis de sentimientos para post ${postId}:`, error);
      return false;
    }
  }

  /**
   * Calcula métricas del post basadas en los comentarios y datos disponibles
   */
  private static calculatePostMetrics(commentsData: StoredPostComments): PostMetrics | undefined {
    try {
      if (!commentsData.comments || commentsData.comments.length === 0) {
        return undefined;
      }

      // Calcular métricas agregadas de los comentarios
      const totalLikes = commentsData.comments.reduce((sum, comment) => sum + (comment.likeCount || 0), 0);
      const totalReplies = commentsData.comments.reduce((sum, comment) => sum + (comment.replyCount || 0), 0);
      
      // Estimar shares basado en la actividad de comentarios
      // Para posts con mucha interacción, estimamos que hay shares
      const estimatedShares = Math.floor(totalLikes / 50) + Math.floor(totalReplies / 20);
      
      // Estimar views basado en comentarios (regla general: 1 comentario por cada 100-200 views)
      const estimatedViews = commentsData.totalComments * 150;

      const metrics = {
        likesCount: totalLikes,
        commentsCount: commentsData.totalComments,
        sharesCount: Math.max(estimatedShares, 0),
        viewsCount: estimatedViews,
        followerCount: undefined // No disponible desde comentarios
      };

     

      return metrics;
    } catch (error) {
      console.error('❌ Error calculando métricas del post:', error);
      return undefined;
    }
  }

  /**
   * Verifica si un post ya tiene comentarios almacenados
   */
  static async hasStoredComments(postUrl: string): Promise<boolean> {
    try {
      // For PostgreSQL, we'll need to search by URL in the cache
      // This is a simplified implementation - in a real scenario, you might want to store URL mappings
      const cacheKey = `comments:${postUrl}`;
      const comments = await postgresCacheService.get(cacheKey);
      return comments !== null;
    } catch (error) {
      console.error('❌ Error verificando comentarios almacenados:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de scraping
   */
  static async getScrapingStats(): Promise<{
    totalPosts: number;
    organized: boolean;
  }> {
    try {
      // For PostgreSQL, we'll return a simplified stat
      // In a real implementation, you might want to query the cache_entries table
      return { totalPosts: 0, organized: true };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de scraping:', error);
      return { totalPosts: 0, organized: false };
    }
  }
} 
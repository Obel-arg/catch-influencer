import axios from 'axios';

export interface InstagramComment {
  id: string;
  text: string;
  author: string;
  username: string;
  timestamp: Date;
  likes: number;
  isVerified: boolean;
  profilePicture?: string;
  replies?: InstagramComment[];
}

export interface InstagramCommentsResult {
  success: boolean;
  data?: InstagramComment[];
  error?: string;
  totalComments: number;
}

export class InstagramCommentsService {
  private static instance: InstagramCommentsService;
  private apiToken = process.env.APIFY_API_TOKEN || '';
  private actorId = 'apify~instagram-comment-scraper';
  private baseUrl = 'https://api.apify.com/v2';

  private constructor() {}

  public static getInstance(): InstagramCommentsService {
    if (!InstagramCommentsService.instance) {
      InstagramCommentsService.instance = new InstagramCommentsService();
    }
    return InstagramCommentsService.instance;
  }

  /**
   * Extrae el ID del post de una URL de Instagram
   */
  private extractPostIdFromUrl(postUrl: string): string | null {
    try {
      // Patrones comunes de URLs de Instagram
      const patterns = [
        /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/tv\/([A-Za-z0-9_-]+)/
      ];

      for (const pattern of patterns) {
        const match = postUrl.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ [INSTAGRAM-COMMENTS] Error extracting post ID:`, error);
      return null;
    }
  }

  /**
   * Obtiene comentarios de un post de Instagram usando Apify
   */
  async getPostComments(postUrl: string, maxComments: number = 100): Promise<InstagramCommentsResult> {
    try {
      // Extraer post ID de la URL
      const postId = this.extractPostIdFromUrl(postUrl);
      if (!postId) {
        return {
          success: false,
          error: 'No se pudo extraer el ID del post de la URL de Instagram',
          totalComments: 0
        };
      }

      // Configurar input para el actor de Apify
      const input = {
        directUrls: [postUrl],
        maxComments: maxComments
      };

      // Ejecutar el actor de Apify
      const response = await axios.post(
        `${this.baseUrl}/acts/${this.actorId}/run-sync-get-dataset-items`,
        input,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            token: this.apiToken,
            format: 'json',
            clean: true
          },
          timeout: 120000 // 2 minutos timeout para comentarios
        }
      );

      const results = response.data || [];
      
      if (!results || results.length === 0) {
        return {
          success: false,
          error: 'No se obtuvieron comentarios del actor de Instagram',
          totalComments: 0
        };
      }

      // Procesar los comentarios
      const processedComments = this.processCommentsResponse(results, postId);

      return {
        success: true,
        data: processedComments,
        totalComments: processedComments.length
      };

    } catch (error: any) {
      console.error(`❌ [INSTAGRAM-COMMENTS] Critical error:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Error desconocido',
        totalComments: 0
      };
    }
  }

  /**
   * Procesa la respuesta de Apify y la convierte al formato del sistema
   */
  private processCommentsResponse(apifyData: any[], postId: string): InstagramComment[] {
    try {
      const comments: InstagramComment[] = [];

      // Los comentarios están directamente en el array principal
      for (const item of apifyData) {
        // Verificar si es un comentario (tiene campos de comentario)
        if (item.text && item.ownerUsername) {
          const processedComment = this.processComment(item);
          if (processedComment) {
            comments.push(processedComment);
          }
        }
        // También buscar en latestComments si existe
        else if (item.latestComments && Array.isArray(item.latestComments)) {
          for (const comment of item.latestComments) {
            const processedComment = this.processComment(comment);
            if (processedComment) {
              comments.push(processedComment);
            }
          }
        }
      }

      // Ordenar por fecha (más recientes primero)
      comments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return comments;

    } catch (error) {
      console.error(`❌ [INSTAGRAM-COMMENTS] Error processing comments response:`, error);
      return [];
    }
  }

  /**
   * Procesa un comentario individual
   */
  private processComment(commentData: any): InstagramComment | null {
    try {
      if (!commentData.text) {
        return null;
      }

      // Extraer información del usuario
      const owner = commentData.owner || {};
      const author = owner.full_name || commentData.ownerUsername || 'Usuario';
      const username = commentData.ownerUsername || owner.username || 'usuario';
      const isVerified = owner.is_verified || false;
      const profilePicture = commentData.ownerProfilePicUrl || owner.profile_pic_url;

      const comment: InstagramComment = {
        id: commentData.id || `comment_${Date.now()}_${Math.random()}`,
        text: commentData.text,
        author: author,
        username: username,
        timestamp: commentData.timestamp ? new Date(commentData.timestamp) : new Date(),
        likes: commentData.likesCount || commentData.likes || 0,
        isVerified: isVerified,
        profilePicture: profilePicture,
        replies: []
      };

      // Procesar respuestas si existen
      if (commentData.replies && Array.isArray(commentData.replies)) {
        for (const reply of commentData.replies) {
          const processedReply = this.processComment(reply);
          if (processedReply) {
            comment.replies!.push(processedReply);
          }
        }
      }

      return comment;

    } catch (error) {
      console.error(`❌ [INSTAGRAM-COMMENTS] Error processing individual comment:`, error);
      return null;
    }
  }

  /**
   * Convierte los comentarios al formato del sistema
   */
  convertToSystemFormat(postId: string, comments: InstagramComment[]): any {
    return {
      post_id: postId,
      platform: 'instagram',
      comments: comments.map(comment => ({
        id: comment.id,
        text: comment.text,
        author: comment.author,
        username: comment.username,
        timestamp: comment.timestamp,
        likes: comment.likes,
        isVerified: comment.isVerified,
        profilePicture: comment.profilePicture,
        replies: comment.replies?.map(reply => ({
          id: reply.id,
          text: reply.text,
          author: reply.author,
          username: reply.username,
          timestamp: reply.timestamp,
          likes: reply.likes,
          isVerified: reply.isVerified,
          profilePicture: reply.profilePicture
        })) || []
      })),
      total_comments: comments.length,
      extraction_date: new Date(),
      platform_data: {
        extraction_method: 'apify-instagram-comment-scraper',
        actor_id: this.actorId
      }
    };
  }

  /**
   * Obtiene información del servicio
   */
  getServiceInfo(): {
    provider: string;
    actorId: string;
    capabilities: string[];
  } {
    return {
      provider: 'Apify',
      actorId: this.actorId,
      capabilities: [
        'Extract comments from Instagram posts',
        'Extract comment replies',
        'Extract user information',
        'Extract comment timestamps',
        'Extract comment likes'
      ]
    };
  }

  // =====================
  // Métodos estáticos API legacy para compatibilidad con rutas
  // =====================

  /**
   * Valida si una URL es de Instagram
   */
  public static isInstagramUrl(url: string): boolean {
    const instagramPatterns = [
      /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+/,
      /^https?:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+/,
      /^https?:\/\/(www\.)?instagram\.com\/tv\/[A-Za-z0-9_-]+/,
    ];
    return instagramPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Wrapper legacy para extraer comentarios básicos
   */
  public static async extractComments(url: string, maxItems: number = 1000) {
    const service = InstagramCommentsService.getInstance();
    return service.getPostComments(url, maxItems);
  }

  /**
   * Wrapper legacy para extraer comentarios avanzados (por ahora igual que básico)
   */
  public static async extractCommentsAdvanced(url: string, options: any = {}) {
    // Puedes expandir aquí para soportar más opciones
    const maxItems = options.maxItems || 1000;
    return InstagramCommentsService.extractComments(url, maxItems);
  }

  /**
   * Obtiene estadísticas simples de comentarios
   */
  public static async getCommentsStats(url: string) {
    const result = await InstagramCommentsService.extractComments(url, 1000);
    if (!result || !result.data) return null;
    const comments = result.data;
    const totalComments = comments.length;
    const avgLikesPerComment =
      totalComments > 0 ? comments.reduce((sum, c) => sum + (c.likes || 0), 0) / totalComments : 0;
    const topCommentersMap: Record<string, number> = {};
    comments.forEach(c => {
      topCommentersMap[c.username] = (topCommentersMap[c.username] || 0) + 1;
    });
    const topCommenters = Object.entries(topCommentersMap)
      .map(([username, count]) => ({ username, commentCount: count }))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 5);
    return {
      totalComments,
      avgLikesPerComment,
      topCommenters
    };
  }

  /**
   * Busca comentarios por palabras clave
   */
  public static async searchCommentsByKeyword(url: string, keywords: string[]) {
    const result = await InstagramCommentsService.extractComments(url, 1000);
    if (!result || !result.data) return [];
    const comments = result.data;
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    return comments.filter(c =>
      lowerKeywords.some(k => c.text.toLowerCase().includes(k))
    );
  }
} 
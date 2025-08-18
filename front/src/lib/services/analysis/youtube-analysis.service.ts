import { httpApiClient } from '../../http';
import { AxiosHeaders } from "axios";

export interface YouTubeComment {
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
  method: string; // Para debug: 'contextual', 'vader', 'pattern'
  rawScores?: {
    negative: number;
    neutral: number;
    positive: number;
  };
}

export interface CommentWithSentiment extends YouTubeComment {
  sentiment: SentimentResult;
}

export interface YouTubeAnalysisResult {
  videoId: string;
  videoTitle: string;
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
  platform?: string; // 'youtube' | 'tiktok'
}

// Nueva interfaz para resultados optimizados
export interface OptimizedAnalysisResult extends Omit<YouTubeAnalysisResult, 'comments'> {
  // Solo devolvemos un sample de comentarios para evitar saturar el navegador
  commentsSample: CommentWithSentiment[];
  // Agregamos estadísticas más detalladas
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
}

export interface AnalysisResponse {
  success: boolean;
  data: OptimizedAnalysisResult;
}

export class YouTubeAnalysisService {
  private static instance: YouTubeAnalysisService;
  private baseUrl = '/analysis';

  private constructor() {}

  public static getInstance(): YouTubeAnalysisService {
    if (!YouTubeAnalysisService.instance) {
      YouTubeAnalysisService.instance = new YouTubeAnalysisService();
    }
    return YouTubeAnalysisService.instance;
  }

  /**
   * Detecta el tipo de plataforma basado en la URL
   */
  private detectPlatform(url: string): 'youtube' | 'tiktok' | 'twitter' | 'unknown' {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
      return 'tiktok';
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter';
    }
    return 'unknown';
  }

  /**
   * Analiza un post (YouTube, TikTok o Twitter) usando el endpoint unificado
   */
  public async analyzePost(postUrl: string): Promise<OptimizedAnalysisResult> {
    try {
      const platform = this.detectPlatform(postUrl);
      
      const response = await httpApiClient.post<AnalysisResponse>(
        `${this.baseUrl}/post`, 
        { postUrl },
        {
          headers: new AxiosHeaders({
            "Content-Type": "application/json"
          })
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error: any) {
      console.error('❌ [SERVICE] Error en análisis:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.details) {
        throw new Error(error.response.data.details);
      } else {
        const platform = this.detectPlatform(postUrl);
        throw new Error(`Error al analizar el video de ${platform === 'youtube' ? 'YouTube' : platform === 'tiktok' ? 'TikTok' : platform === 'twitter' ? 'Twitter/X' : 'la plataforma'}`);
      }
    }
  }

  /**
   * Método legacy para compatibilidad con YouTube
   */
  public async analyzeYouTubePost(postUrl: string): Promise<YouTubeAnalysisResult> {
    try {
      
      const response = await httpApiClient.post<AnalysisResponse>(
        `${this.baseUrl}/youtube`, 
        { postUrl },
        {
          headers: new AxiosHeaders({
            "Content-Type": "application/json"
          })
        }
      );

      if (response.data.success) {
        
        // Convertir resultado optimizado al formato legacy
        const optimizedResult = response.data.data;
        return {
          videoId: optimizedResult.videoId,
          videoTitle: optimizedResult.videoTitle,
          totalComments: optimizedResult.totalComments,
          analyzedComments: optimizedResult.analyzedComments,
          comments: optimizedResult.commentsSample, // Solo la muestra
          sentimentSummary: optimizedResult.sentimentSummary,
          platform: optimizedResult.platform
        };
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error: any) {
      console.error('❌ [SERVICE] Error en análisis legacy:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.details) {
        throw new Error(error.response.data.details);
      } else {
        throw new Error('Error al analizar el video de YouTube');
      }
    }
  }

  public async getAnalysisStatus(): Promise<any> {
    try {
      const response = await httpApiClient.get(`${this.baseUrl}/status`, {
        headers: new AxiosHeaders({
          "Content-Type": "application/json"
        })
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ [SERVICE] Error obteniendo estado:', error);
      throw new Error('Error al obtener el estado del servicio');
    }
  }
}

export const youtubeAnalysisService = YouTubeAnalysisService.getInstance(); 
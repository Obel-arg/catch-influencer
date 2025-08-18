import axios from 'axios';

export interface TwitterComment {
  id: string;
  text: string;
  author: string;
  publishedAt: string;
  likeCount: number;
  replyCount: number;
  retweetCount: number;
  username: string;
  verified: boolean;
}

export interface ApifyTwitterResult {
  tweetId: string;
  tweetText: string;
  tweetAuthor: string;
  totalComments: number;
  extractedComments: number;
  comments: TwitterComment[];
}

export interface ApifyRunResult {
  id: string;
  status: string;
  defaultDatasetId: string;
}

export class ApifyTwitterService {
  private static instance: ApifyTwitterService;
  private apiToken = 'apify_api_2kNmLwhgbS02MR2Xmh1zL6PmQ8wetW1aC5PN';
  private actorId = 'aLoAjAhdEpacDuwjr'; // Actor correcto que no requiere cookies
  private baseUrl = 'https://api.apify.com/v2';

  private constructor() {}

  public static getInstance(): ApifyTwitterService {
    if (!ApifyTwitterService.instance) {
      ApifyTwitterService.instance = new ApifyTwitterService();
    }
    return ApifyTwitterService.instance;
  }

  /**
   * Extrae el ID del tweet de una URL de Twitter/X
   */
  private extractTwitterTweetId(url: string): string | null {
    const patterns = [
      /twitter\.com\/[^\/]+\/status\/(\d+)/,
      /x\.com\/[^\/]+\/status\/(\d+)/,
      /mobile\.twitter\.com\/[^\/]+\/status\/(\d+)/,
      /twitter\.com\/i\/web\/status\/(\d+)/,
      /x\.com\/i\/web\/status\/(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Valida si una URL es de Twitter/X
   */
  public isValidTwitterUrl(url: string): boolean {
    return this.extractTwitterTweetId(url) !== null;
  }

  /**
   * Inicia la extracción de comentarios de Twitter usando Apify
   */
  private async startApifyRun(tweetId: string, maxResults: number = 18): Promise<ApifyRunResult> {
    try {

      // Configuración optimizada para el actor
      const input = {
        id: tweetId,
        maxResults: Math.min(maxResults, 50), // Limitar para evitar costos excesivos
        addUserInfo: true,
        addTweetText: true,
        addReplies: true,
        maxRequestRetries: 3,
        requestTimeoutSecs: 60
      };

      const response = await axios.post(
        `${this.baseUrl}/acts/${this.actorId}/runs`,
        input,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            token: this.apiToken
          },
          timeout: 80000 // 80 segundos de timeout
        }
      );

      return response.data.data;

    } catch (error: any) {
      console.error('❌ [TWITTER-COMMENTS] Error starting Apify run:', error.response?.data || error.message);
      
      // Mensaje más específico para diferentes tipos de error
      if (error.response?.data?.error?.type === 'actor-is-not-rented') {
        throw new Error(`Actor de Twitter no disponible. Necesita ser rentado en Apify Console.`);
      } else if (error.response?.data?.error?.type === 'insufficient-credits') {
        throw new Error(`Créditos insuficientes en Apify. Verifica tu cuenta.`);
      } else if (error.response?.data?.error?.type === 'actor-memory-limit-exceeded') {
        throw new Error(`Límite de memoria excedido en Apify. Considera actualizar tu plan.`);
      } else {
        throw new Error(`Error al iniciar extracción de Twitter: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  }

  /**
   * Verifica el estado de un run de Apify
   */
  private async checkRunStatus(runId: string): Promise<{ status: string; finished: boolean }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/acts/${this.actorId}/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          },
          params: {
            token: this.apiToken
          },
          timeout: 15000 // 15 segundos de timeout
        }
      );

      const status = response.data.data.status;
      const finished = ['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status);

      return { status, finished };

    } catch (error: any) {
      console.error('❌ [TWITTER-COMMENTS] Error checking run status:', error.response?.data || error.message);
      throw new Error('Error al verificar estado de la extracción');
    }
  }

  /**
   * Obtiene los resultados de un run completado
   */
  private async getRunResults(runId: string): Promise<any[]> {
    try {
      // Primero obtener información del run para conseguir el defaultDatasetId
      const runInfoResponse = await axios.get(
        `${this.baseUrl}/acts/${this.actorId}/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          },
          params: {
            token: this.apiToken
          },
          timeout: 30000 // 30 segundos de timeout
        }
      );

      const defaultDatasetId = runInfoResponse.data.data.defaultDatasetId;

      if (!defaultDatasetId) {
        throw new Error('No se pudo obtener el ID del dataset');
      }

      // Obtener los items del dataset
      const response = await axios.get(
        `${this.baseUrl}/datasets/${defaultDatasetId}/items`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          },
          params: {
            token: this.apiToken,
            format: 'json',
            clean: true
          },
          timeout: 60000 // 60 segundos, puede ser un dataset grande
        }
      );

      return response.data || [];

    } catch (error: any) {
      console.error('❌ [TWITTER-COMMENTS] Error getting results:', error.response?.data || error.message);
      
      // Log más detallado del error
      if (error.response?.data) {
        console.error('📋 [TWITTER-COMMENTS] Error details:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw new Error('Error al obtener resultados de la extracción');
    }
  }

  /**
   * Espera a que un run se complete con polling
   */
  private async waitForRunCompletion(runId: string, maxWaitTime: number = 300000): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 segundos


    while (Date.now() - startTime < maxWaitTime) {
      const { status, finished } = await this.checkRunStatus(runId);
      

      if (finished) {
        if (status === 'SUCCEEDED') {
          return;
        } else {
          throw new Error(`Run falló con estado: ${status}`);
        }
      }

      // Esperar antes del siguiente poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Timeout esperando completación del run');
  }

  /**
   * Procesa los datos raw de Apify a nuestro formato
   */
  private processApifyResults(rawResults: any[], originalUrl: string): ApifyTwitterResult {
    if (!rawResults || rawResults.length === 0) {
      throw new Error('No se obtuvieron resultados de Apify');
    }


    const comments: TwitterComment[] = [];
    let tweetInfo: any = {};
    const originalTweetId = this.extractTwitterTweetId(originalUrl);

    // Procesar cada item de los resultados
    for (const item of rawResults) {
      // Verificar si es el tweet original o una respuesta
      const isOriginalTweet = item.tweet_id === originalTweetId || 
                             item.id === originalTweetId ||
                             (!item.in_reply_to_status_id_str && !item.in_reply_to_user_id_str);
      
      // Si es el tweet original, guardamos su información
      if (isOriginalTweet && !tweetInfo.id) {
        tweetInfo = {
          id: item.tweet_id || item.id || originalTweetId,
          text: item.text || item.full_text || 'Tweet de Twitter/X',
          author: item.user_info?.name || item.user?.name || item.screen_name || 'Usuario de Twitter'
        };
      }
      
      // Si es una respuesta/comentario (tiene in_reply_to o conversation_id coincide)
      const isReply = item.in_reply_to_status_id_str || 
                     item.in_reply_to_user_id_str || 
                     (item.conversation_id && item.conversation_id === originalTweetId) ||
                     (item.conversation_id && originalTweetId && item.tweet_id !== originalTweetId);
      
      if (isReply && item.text && item.tweet_id !== originalTweetId) {
        const comment: TwitterComment = {
          id: item.tweet_id || item.id || String(comments.length),
          text: item.text || item.full_text || '',
          author: item.user_info?.name || item.user?.name || item.screen_name || 'Usuario',
          username: item.user_info?.screen_name || item.user?.screen_name || item.screen_name || 'usuario',
          publishedAt: item.created_at || new Date().toISOString(),
          likeCount: item.favorites || item.favorite_count || item.like_count || 0,
          replyCount: item.replies || item.reply_count || 0,
          retweetCount: item.retweets || item.retweet_count || 0,
          verified: item.user_info?.verified || item.user?.verified || false
        };
        
        comments.push(comment);
      }
    }

    // Si no encontramos información del tweet original, crear una básica
    if (!tweetInfo.id) {
      tweetInfo = {
        id: originalTweetId || 'unknown',
        text: 'Tweet de Twitter/X',
        author: 'Usuario de Twitter'
      };
    }


    return {
      tweetId: tweetInfo.id,
      tweetText: tweetInfo.text,
      tweetAuthor: tweetInfo.author,
      totalComments: comments.length,
      extractedComments: comments.length,
      comments
    };
  }

  /**
   * Extrae comentarios de un tweet de Twitter/X
   */
  public async extractTwitterComments(twitterUrl: string, maxComments: number = 18): Promise<ApifyTwitterResult> {
    try {
      
      // Validar URL y extraer ID
      const tweetId = this.extractTwitterTweetId(twitterUrl);
      if (!tweetId) {
        throw new Error('URL de Twitter/X inválida. Debe contener un ID de tweet válido.');
      }

      // Iniciar run en Apify
      const runResult = await this.startApifyRun(tweetId, maxComments);
      
      // Esperar completación
      await this.waitForRunCompletion(runResult.id);
      
      // Obtener resultados
      const rawResults = await this.getRunResults(runResult.id);
      
      // Procesar resultados
      const processedResults = this.processApifyResults(rawResults, twitterUrl);
            
      return processedResults;

    } catch (error: any) {
      console.error('❌ [TWITTER-COMMENTS] Error in Twitter comments extraction:', error);
      throw error;
    }
  }

  /**
   * Obtiene información del servicio
   */
  public getServiceInfo(): {
    provider: string;
    actorId: string;
    capabilities: string[];
  } {
    return {
      provider: 'Apify',
      actorId: this.actorId,
      capabilities: [
        'Extracción de comentarios de Twitter/X',
        'No requiere cookies o autenticación',
        'Funciona con IDs de tweets',
        'Soporte para URLs de Twitter y X.com',
        'Extracción de respuestas y replies',
        'Información de engagement y métricas',
        'Información de usuarios verificados'
      ]
    };
  }
}

export const apifyTwitterService = ApifyTwitterService.getInstance(); 
import axios from 'axios';

export interface TikTokComment {
  id: string;
  text: string;
  author: string;
  publishedAt: string;
  likeCount: number;
  replyCount: number;
}

export interface ApifyTikTokResult {
  videoId: string;
  videoTitle: string;
  videoDescription: string;
  author: string;
  totalComments: number;
  extractedComments: number;
  comments: TikTokComment[];
}

export interface ApifyRunResult {
  id: string;
  status: string;
  defaultDatasetId: string;
}

export class ApifyTikTokService {
  private static instance: ApifyTikTokService;
  private apiToken = process.env.APIFY_API_TOKEN || '';
  private actorId = 'BDec00yAmCm1QbMEI'; // TikTok Scraper con soporte para comentarios
  private baseUrl = 'https://api.apify.com/v2';

  private constructor() {}

  public static getInstance(): ApifyTikTokService {
    if (!ApifyTikTokService.instance) {
      ApifyTikTokService.instance = new ApifyTikTokService();
    }
    return ApifyTikTokService.instance;
  }

  /**
   * Utilidad para reintentos automáticos con backoff exponencial
   */
  private async withRetries<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
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

  /**
   * Extrae el ID del video de una URL de TikTok
   */
  private extractTikTokVideoId(url: string): string | null {
    const patterns = [
      /tiktok\.com\/@[^\/]+\/video\/(\d+)/,
      /tiktok\.com\/t\/([a-zA-Z0-9]+)/,
      /vm\.tiktok\.com\/([a-zA-Z0-9]+)/
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
   * Inicia la extracción de comentarios de TikTok usando Apify
   */
  private async startApifyRun(tiktokUrl: string, maxComments: number = 1000): Promise<ApifyRunResult> {
    try {

      // Configuración basada en el ejemplo proporcionado por Apify
      const input = {
        postURLs: [tiktokUrl],
        commentsPerPost: Math.min(maxComments, 50), // REDUCCIÓN AGRESIVA DE LOTE: máximo 50 por request
        resultsPerPage: 25, // REDUCCIÓN AGRESIVA DE LOTE
        profileScrapeSections: ["videos"],
        profileSorting: "latest",
        excludePinnedPosts: false,
        // Configuración para reducir uso de memoria
        memoryMbytes: 1024, // Reducir a 1GB en lugar de 4GB
        timeoutSecs: 300 // 5 minutos máximo
      };


      const response = await this.withRetries(
        () => axios.post(
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
            timeout: 80000 // Aumentado a 60 segundos
          }
        ),
        3, 2000 // 3 reintentos, backoff 2s
      );

      return response.data.data;

    } catch (error: any) {
      console.error('❌ Error iniciando run de Apify:', error.response?.data || error.message);
      
      // Mensaje más específico para diferentes tipos de error
      if (error.response?.data?.error?.type === 'actor-is-not-rented') {
        throw new Error(`Actor de TikTok no disponible. Necesita ser rentado en Apify Console.`);
      } else if (error.response?.data?.error?.type === 'insufficient-credits') {
        throw new Error(`Créditos insuficientes en Apify. Verifica tu cuenta.`);
      } else {
        throw new Error(`Error al iniciar extracción de TikTok: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  }

  /**
   * Inicia una extracción de Apify y configura un webhook para recibir el resultado.
   * El `postId` es crucial para identificar el trabajo cuando Apify llame al webhook.
   */
  public async startApifyRunWithWebhook(tiktokUrl: string, postId: string, maxComments: number = 1000): Promise<ApifyRunResult> {
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
      const webhookUrl = `${backendUrl}/api/webhooks/apify/tiktok-comments-ready?postId=${postId}`;

      const input = {
        postURLs: [tiktokUrl],
        commentsPerPost: Math.min(maxComments, 50), // REDUCCIÓN AGRESIVA DE LOTE
        resultsPerPage: 25, // REDUCCIÓN AGRESIVA DE LOTE
        profileScrapeSections: ["videos"],
        profileSorting: "latest",
        excludePinnedPosts: false,
        // Configuración para reducir uso de memoria
        memoryMbytes: 1024, // Reducir a 1GB en lugar de 4GB
        timeoutSecs: 300 // 5 minutos máximo
      };

      const webhookConfig = `[
        {
          "event_types": ["ACTOR.RUN.SUCCEEDED"],
          "request_url": "${webhookUrl}"
        }
      ]`;
      
      
      const response = await this.withRetries(
        () => axios.post(
          `${this.baseUrl}/acts/${this.actorId}/runs`,
          input,
          {
            headers: {
              'Authorization': `Bearer ${this.apiToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              token: this.apiToken,
              // --- ¡Añadimos el Webhook aquí! ---
              // Apify llamará a esta URL cuando el estado del "run" sea final (SUCCEEDED, FAILED, etc.)
              // El evento `ACTOR.RUN.SUCCEEDED` es el que nos interesa.
              webhooks: webhookConfig,
            },
            timeout: 60000 // Aumentado a 60 segundos
          }
        ),
        3, 2000 // 3 reintentos, backoff 2s
      );

      return response.data.data;

    } catch (error: any) {
      console.error('❌ Error iniciando run de Apify con webhook:', error.response?.data || error.message);
      throw new Error(`Error al iniciar extracción para TikTok con webhook: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Verifica el estado de un run de Apify
   */
  private async checkRunStatus(runId: string): Promise<{ status: string; finished: boolean }> {
    try {
      const response = await this.withRetries(
        () => axios.get(
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
        ),
        2, 1500 // 2 reintentos, backoff 1.5s
      );

      const status = response.data.data.status;
      const finished = ['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status);

      return { status, finished };

    } catch (error: any) {
      console.error('❌ Error verificando estado del run:', error.response?.data || error.message);
      throw new Error('Error al verificar estado de la extracción');
    }
  }

  /**
   * Obtiene los resultados de un run completado
   */
  private async getRunResults(runId: string): Promise<any[]> {
    try {
      // Primero obtener información del run para conseguir el defaultDatasetId
      
      const runInfoResponse = await this.withRetries(
        () => axios.get(
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
        ),
        2, 1500 // 2 reintentos, backoff 1.5s
      );

      const defaultDatasetId = runInfoResponse.data.data.defaultDatasetId;

      if (!defaultDatasetId) {
        throw new Error('No se pudo obtener el ID del dataset');
      }

      // Ahora obtener los items del dataset usando la URL correcta
      
      const response = await this.withRetries(
        () => axios.get(
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
        ),
        2, 2000 // 2 reintentos, backoff 2s
      );

      return response.data || [];

    } catch (error: any) {
      console.error('❌ Error obteniendo resultados:', error.response?.data || error.message);
      
      // Log más detallado del error
      if (error.response?.data) {
        console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
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
   * Adaptado para el actor BDec00yAmCm1QbMEI
   */
  private processApifyResults(rawResults: any[]): ApifyTikTokResult {
    
    if (!rawResults || rawResults.length === 0) {
      console.error('❌ [APIFY-TIKTOK] No se obtuvieron resultados de Apify');
      throw new Error('No se obtuvieron resultados de Apify');
    }

    const comments: TikTokComment[] = [];
    let videoInfo: any = {};

    // El actor BDec00yAmCm1QbMEI puede devolver diferentes tipos de items
    for (const item of rawResults) {

      
      // Si es información del video
      if (item.type === 'video' || item.videoId || item.id) {
        videoInfo = item;

      }
      
      // Si es un comentario - lógica más inclusiva
      const isComment = item.type === 'comment' || 
                       item.text || 
                       item.comment || 
                       item.content ||
                       (item.type === undefined && item.text && !item.videoId && !item.id); // Items con texto que no son video info
      
      if (isComment) {

        
        const commentData = item;
        
        comments.push({
          id: commentData.id || commentData.cid || commentData.commentId || String(comments.length),
          text: commentData.text || commentData.comment || commentData.content || '',
          author: commentData.author || commentData.authorName || commentData.user?.uniqueId || commentData.user?.nickname || commentData.username || 'Usuario',
          publishedAt: commentData.createTime 
            ? new Date(commentData.createTime * 1000).toISOString() 
            : commentData.publishedAt || commentData.createdAt || new Date().toISOString(),
          likeCount: commentData.likeCount || commentData.digg_count || commentData.likes || 0,
          replyCount: commentData.replyCount || commentData.reply_comment_total || commentData.replies || 0
        });
      } else {

      }
      
      // Si el item contiene comentarios en un array
      if (item.comments && Array.isArray(item.comments)) {
        
        for (const comment of item.comments) {
          comments.push({
            id: comment.id || comment.cid || String(comments.length),
            text: comment.text || comment.comment || '',
            author: comment.author || comment.user?.uniqueId || comment.user?.nickname || 'Usuario',
            publishedAt: comment.createTime 
              ? new Date(comment.createTime * 1000).toISOString() 
              : new Date().toISOString(),
            likeCount: comment.likeCount || comment.digg_count || 0,
            replyCount: comment.replyCount || comment.reply_comment_total || 0
          });
        }
        
        // Usar información del video del item que contiene comentarios
        if (!videoInfo.id && item.id) {
          videoInfo = item;
        }
      }
    }


    
    // Si no encontramos información del video, usar el primer item
    if (!videoInfo.id && rawResults.length > 0) {
      videoInfo = rawResults[0];
    }

    return {
      videoId: videoInfo.id || videoInfo.videoId || videoInfo.aweme_id || 'unknown',
      videoTitle: videoInfo.title || videoInfo.desc || videoInfo.description || 'Video de TikTok',
      videoDescription: videoInfo.description || videoInfo.desc || '',
      author: videoInfo.author || videoInfo.authorName || videoInfo.authorMeta?.name || videoInfo.nickname || 'Usuario TikTok',
      totalComments: videoInfo.commentCount || videoInfo.stats?.commentCount || comments.length,
      extractedComments: comments.length,
      comments
    };
  }

  /**
   * Procesa los resultados de un run de Apify que se reciben a través de un webhook.
   * No necesitamos el runId porque los datos ya vienen en el payload del webhook.
   */
  public async processWebhookPayload(payload: any): Promise<ApifyTikTokResult> {
    try {
      
      // El payload del webhook contiene la información del recurso, que a su vez
      // contiene el datasetId.
      const datasetId = payload?.resource?.defaultDatasetId;
      if (!datasetId) {
        console.error('❌ [APIFY-TIKTOK] Payload no contiene defaultDatasetId:', payload);
        throw new Error('El payload del webhook no contiene el defaultDatasetId.');
      }


      const itemsUrl = `${this.baseUrl}/datasets/${datasetId}/items`;
      
      const response = await this.withRetries(
        () => axios.get(itemsUrl, {
          headers: { 'Authorization': `Bearer ${this.apiToken}` },
          params: { token: this.apiToken, format: 'json', clean: true },
          timeout: 60000 // 60 segundos, puede ser un dataset grande
        }),
        2, 2000 // 2 reintentos, backoff 2s
      );

      const rawResults = response.data || [];    
      const processedResults = this.processApifyResults(rawResults);
      
      return processedResults;

    } catch (error: any) {
      console.error('❌ [APIFY-TIKTOK] Error procesando payload de webhook de Apify:', {
        error: error.response?.data || error.message,
        payload: payload ? 'Present' : 'Missing',
        datasetId: payload?.resource?.defaultDatasetId
      });
      throw new Error('Error al procesar resultados del webhook.');
    }
  }

  /**
   * Extrae comentarios de un video de TikTok
   */
  public async extractTikTokComments(tiktokUrl: string, maxComments: number = 1000): Promise<ApifyTikTokResult> {
    try {
      
      // Validar URL
      const videoId = this.extractTikTokVideoId(tiktokUrl);
      if (!videoId) {
        throw new Error('URL de TikTok inválida');
      }

      // Iniciar run en Apify
      const runResult = await this.startApifyRun(tiktokUrl, maxComments);
      
      // Esperar completación
      await this.waitForRunCompletion(runResult.id);
      
      // Obtener resultados
      const rawResults = await this.getRunResults(runResult.id);
      
      // Procesar resultados
      const processedResults = this.processApifyResults(rawResults);
      
      
      return processedResults;

    } catch (error: any) {
      console.error('❌ Error en extracción de TikTok:', error);
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
        'Extracción de comentarios de TikTok',
        'Datos de video (título, autor, estadísticas)',
        'Soporte para URLs de TikTok',
        'Proxy residencial incluido',
        'Rate limiting automático',
        'Actor BDec00yAmCm1QbMEI con soporte mejorado'
      ]
    };
  }
}

export const apifyTikTokService = ApifyTikTokService.getInstance(); 
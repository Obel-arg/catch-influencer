import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { apifyTikTokService, TikTokComment } from '../services/analysis/apify-tiktok.service';
import { postgresQueueService } from '../services/queues/postgres-queue.service';
import { SentimentAnalysisService } from '../services/database/sentiment-analysis.service';
import { postgresCacheService } from '../services/cache/postgres-cache.service';

const BATCH_SIZE = 25;

export default async function (fastify: FastifyInstance) {
  // Webhook para TikTok (Apify)
  fastify.post('/apify/tiktok-comments-ready', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      
      const { postId } = request.query as { postId: string };
      const payload = request.body;
      
      if (!postId) {
        console.error('❌ [WEBHOOK] Falta el postId en la query.');
        return reply.status(400).send({ success: false, message: 'Missing postId' });
      }

      
      // Procesar el payload del webhook para obtener los comentarios
      const result = await apifyTikTokService.processWebhookPayload(payload);
      
      
      
      if (result.comments.length === 0) {
        return reply.status(200).send({ success: true, message: 'No comments found.' });
      }

      // Dividir en lotes y encolar para análisis de sentimiento
      const comments = result.comments;
      
      for (let i = 0; i < comments.length; i += BATCH_SIZE) {
        const batch = comments.slice(i, i + BATCH_SIZE);
        const isLastBatch = (i + BATCH_SIZE) >= comments.length;
        
        
        await postgresQueueService.send('sentiment', {
          type: 'analyze-sentiment',
          postId,
          comments: batch.map((c: TikTokComment) => ({ id: c.id, text: c.text })),
          isLastBatch,
        });
      }

      
      // Cachear los comentarios extraídos
      const cacheKey = `comments:tiktok:${postId}`;
      const cacheData = {
        postId,
        postUrl: '', // No tenemos la URL en el webhook, pero podemos agregarla después
        platform: 'tiktok',
        comments: result.comments,
        totalComments: result.totalComments,
        extractedComments: result.extractedComments,
        extractedAt: new Date().toISOString(),
        webhookProcessed: true
      };

      await postgresCacheService.set(cacheKey, cacheData, 3600 * 24).catch((err: any) => {
        console.warn(`⚠️ [WEBHOOK] Error guardando en cache:`, err);
      });

      
      reply.status(200).send({ success: true });

    } catch (error: any) {
      console.error('❌ [WEBHOOK] Error procesando el webhook de Apify:', {
        error: error.message,
        stack: error.stack,
        postId: (request.query as any)?.postId
      });
      reply.status(500).send({ success: false, message: 'Internal server error' });
    }
  });

  // Webhook para Instagram
  fastify.post('/instagram/comments-ready', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { postId } = request.query as { postId: string };
      const payload = request.body as {
        postId: string;
        postUrl: string;
        platform: string;
        comments: Array<{ id: string; text: string }>;
        totalComments: number;
        extractionStatus: string;
      };
      
      if (!postId) {
        console.error('[Webhook] Falta el postId en la query.');
        return reply.status(400).send({ success: false, message: 'Missing postId' });
      }

      
      if (!payload.comments || payload.comments.length === 0) {
        return reply.status(200).send({ success: true, message: 'No comments found.' });
      }

      // Dividir en lotes y encolar para análisis de sentimiento
      const comments = payload.comments;
      for (let i = 0; i < comments.length; i += BATCH_SIZE) {
        const batch = comments.slice(i, i + BATCH_SIZE);
        const isLastBatch = (i + BATCH_SIZE) >= comments.length;
        
        await postgresQueueService.send('sentiment', {
          type: 'analyze-sentiment',
          postId,
          comments: batch,
          isLastBatch,
        });
      }

      reply.status(200).send({ success: true });

    } catch (error: any) {
      console.error(`[Webhook] Error procesando el webhook de Instagram: ${error.message}`);
      reply.status(500).send({ success: false, message: 'Internal server error' });
    }
  });
} 
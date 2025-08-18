import { postgresQueueService } from '../services/queues/postgres-queue.service';
import { randomUUID } from 'crypto'; // Para generar un ID único para el post

// Suponiendo que tienes un servicio para manejar la tabla de posts
// import { PostRepository } from '../repositories/post.repository';

// Este es un ejemplo de cómo se vería tu endpoint de API
export const createPostAnalysis = async (req: any, res: any) => {
  try {
    const { postUrl, platform, campaignId } = req.body;

    if (!postUrl || !platform || !campaignId) {
      return res.status(400).json({ error: 'Faltan parámetros: postUrl, platform, campaignId' });
    }

    // 1. Crear una entrada inicial para el post en tu base de datos
    // Esto es importante para tener un ID de post que rastrear.
    // El estado inicial sería 'PENDING' o 'QUEUED'.
    const postId = randomUUID(); 
    /*
    const postRepository = new PostRepository();
    const newPost = await postRepository.create({
      id: postId,
      campaign_id: campaignId,
      post_url: postUrl,
      platform: platform,
      status: 'QUEUED',
    });
    */

    // 2. Añadir el trabajo a la cola de MÉTRICAS (el primer paso de la cadena)
    await postgresQueueService.send('metrics', {
      type: 'extract-metrics',
      postId,
      postUrl,
      platform,
      campaignId,
    });

    // 3. Responder inmediatamente al cliente
    return res.status(202).json({ 
      message: 'El análisis del post ha sido aceptado y está en cola.',
      postId: postId 
    });

  } catch (error) {
    console.error('❌ Error encolando trabajo de análisis:', error);
    return res.status(500).json({ error: 'No se pudo encolar el trabajo de análisis.' });
  }
}; 
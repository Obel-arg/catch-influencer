import { Router } from 'express';
import { InfluencerExtendedController } from '../../controllers/influencer/influencer-extended.controller';

const router = Router();
const influencerExtendedController = new InfluencerExtendedController();

/**
 * @swagger
 * /api/influencer/full-extend/{youtubeId}:
 *   get:
 *     summary: Obtiene datos extendidos completos de un influencer
 *     description: Obtiene todos los datos extendidos disponibles de CreatorDB para un influencer y los guarda en la tabla influencers_extended
 *     tags: [Influencer Extended]
 *     parameters:
 *       - in: path
 *         name: youtubeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del canal de YouTube del influencer
 *       - in: query
 *         name: instagramId
 *         schema:
 *           type: string
 *         description: ID de Instagram del influencer (opcional)
 *       - in: query
 *         name: tiktokId
 *         schema:
 *           type: string
 *         description: ID de TikTok del influencer (opcional)
 *     responses:
 *       200:
 *         description: Datos extendidos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     influencer_id:
 *                       type: string
 *                       description: UUID del influencer en la base de datos
 *                     creator_id:
 *                       type: string
 *                       description: YouTube ID del influencer
 *                     sync_status:
 *                       type: string
 *                       enum: [pending, syncing, completed, error]
 *                     data_completeness_score:
 *                       type: number
 *                       description: Puntuación de completitud de datos (0-100)
 *                     total_api_calls:
 *                       type: number
 *                       description: Total de llamadas API realizadas
 *                     estimated_cost:
 *                       type: number
 *                       description: Costo estimado en USD
 *                     youtube_basic:
 *                       type: object
 *                       description: Datos básicos de YouTube
 *                     youtube_history:
 *                       type: object
 *                       description: Historial de YouTube
 *                     youtube_detail:
 *                       type: object
 *                       description: Detalles extendidos de YouTube
 *                     instagram_basic:
 *                       type: object
 *                       description: Datos básicos de Instagram
 *                     instagram_history:
 *                       type: object
 *                       description: Historial de Instagram
 *                     tiktok_basic:
 *                       type: object
 *                       description: Datos básicos de TikTok
 *                     tiktok_history:
 *                       type: object
 *                       description: Historial de TikTok
 *                     contact_info:
 *                       type: object
 *                       description: Información de contacto consolidada
 *                     performance_metrics:
 *                       type: object
 *                       description: Métricas de rendimiento calculadas
 *                     growth_trends:
 *                       type: object
 *                       description: Tendencias de crecimiento
 *                     engagement_analytics:
 *                       type: object
 *                       description: Análisis de engagement
 *                 message:
 *                   type: string
 *                   example: "Datos extendidos obtenidos y guardados exitosamente"
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "youtubeId es requerido"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
/**
 * @swagger
 * /api/influencer/extended/read/{youtubeId}:
 *   get:
 *     summary: Lee datos extendidos existentes sin hacer peticiones nuevas
 *     description: Obtiene los datos extendidos que ya están guardados en la base de datos sin ejecutar nuevas peticiones a APIs externas
 *     tags: [Influencer Extended]
 *     parameters:
 *       - in: path
 *         name: youtubeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del canal de YouTube del influencer
 *     responses:
 *       200:
 *         description: Datos extendidos existentes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Datos extendidos desde base de datos
 *                 message:
 *                   type: string
 *                   example: "Datos extendidos obtenidos desde base de datos"
 *       404:
 *         description: No se encontraron datos extendidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/extended/read/:youtubeId', 
  influencerExtendedController.getExistingExtendedData.bind(influencerExtendedController)
);

router.get('/full-extend/:youtubeId', 
  influencerExtendedController.getFullExtendedInfluencerData.bind(influencerExtendedController)
);

/**
 * @swagger
 * /api/influencer/extended/status/{influencerId}:
 *   get:
 *     summary: Obtiene el estado de sincronización de datos extendidos
 *     description: Devuelve el estado actual de sincronización y completitud de datos para un influencer
 *     tags: [Influencer Extended]
 *     parameters:
 *       - in: path
 *         name: influencerId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del influencer
 *     responses:
 *       200:
 *         description: Estado obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     influencer_id:
 *                       type: string
 *                     exists:
 *                       type: boolean
 *                     sync_status:
 *                       type: string
 *                       enum: [not_found, pending, syncing, completed, error]
 *                     last_sync:
 *                       type: object
 *                       properties:
 *                         youtube:
 *                           type: string
 *                           format: date-time
 *                         instagram:
 *                           type: string
 *                           format: date-time
 *                         tiktok:
 *                           type: string
 *                           format: date-time
 *                     data_completeness_score:
 *                       type: number
 *                     total_api_calls:
 *                       type: number
 *                     estimated_cost:
 *                       type: number
 *                     sync_errors:
 *                       type: object
 *       404:
 *         description: Influencer no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/extended/status/:influencerId', 
  influencerExtendedController.getExtendedDataStatus.bind(influencerExtendedController)
);

/**
 * @swagger
 * /api/influencer/extended/resync/{influencerId}:
 *   post:
 *     summary: Re-sincroniza datos extendidos de un influencer
 *     description: Fuerza la re-sincronización de datos extendidos para plataformas específicas
 *     tags: [Influencer Extended]
 *     parameters:
 *       - in: path
 *         name: influencerId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del influencer
 *     requestBody:
 *       description: Plataformas a re-sincronizar
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [youtube, instagram, tiktok]
 *                 description: Lista de plataformas a sincronizar (opcional, por defecto todas)
 *                 example: ["youtube", "instagram"]
 *     responses:
 *       200:
 *         description: Re-sincronización iniciada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Datos extendidos actualizados
 *                 message:
 *                   type: string
 *                   example: "Re-sincronización iniciada exitosamente"
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Influencer no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/extended/resync/:influencerId', 
  influencerExtendedController.resyncExtendedData.bind(influencerExtendedController)
);

export default router; 
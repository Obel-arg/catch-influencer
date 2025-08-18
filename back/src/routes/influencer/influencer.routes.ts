import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { InfluencerController } from '../../controllers/influencer/influencer.controller';

const router = Router();
const influencerController = new InfluencerController();

// Rutas CRUD básicas
router.get('/', authenticateToken, influencerController.getAll.bind(influencerController));
router.post('/', authenticateToken, influencerController.create.bind(influencerController));

// Ruta para búsqueda local (DEBE ir ANTES de las rutas con parámetros)
router.get('/search/local', authenticateToken, influencerController.searchLocal.bind(influencerController));

// Ruta para obtener datos básicos de plataformas (sin guardar en BD)
router.get('/platforms/basic-data', authenticateToken, influencerController.getBasicPlatformData.bind(influencerController));

// Ruta para obtener data unificada
router.get('/full/:youtubeId', authenticateToken, influencerController.getFullData.bind(influencerController));

// Rutas con parámetros ID (DEBEN ir DESPUÉS de las rutas específicas)
router.get('/:id', authenticateToken, influencerController.getById.bind(influencerController));
router.put('/:id', authenticateToken, influencerController.update.bind(influencerController));

/**
 * @swagger
 * /api/influencers/{id}/refresh:
 *   post:
 *     summary: Actualiza los datos de un influencer desde APIs externas
 *     description: Obtiene datos actualizados de YouTube, Instagram y TikTok para un influencer específico
 *     tags: [Influencers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del influencer
 *     responses:
 *       200:
 *         description: Datos actualizados exitosamente
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
 *                   description: Datos actualizados del influencer
 *                 message:
 *                   type: string
 *                   example: "Datos del influencer actualizados exitosamente"
 *       404:
 *         description: Influencer no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/refresh', authenticateToken, influencerController.refreshInfluencerData.bind(influencerController));

export default router; 
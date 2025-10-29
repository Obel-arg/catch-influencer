import { Router } from 'express';
import { InfluencerController } from '../../controllers/influencer';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const influencerController = new InfluencerController();

// Ruta para búsqueda local (DEBE ir ANTES de las rutas con parámetros)
router.get('/search/local', authenticateToken, influencerController.searchLocal.bind(influencerController));

// Rutas principales de influencers
router.post('/', authenticateToken, influencerController.createInfluencer.bind(influencerController));
router.post('/new', authenticateToken, influencerController.createInfluencerFromHypeAuditor.bind(influencerController));
router.get('/:id', authenticateToken, influencerController.getInfluencerById.bind(influencerController));
router.put('/:id', authenticateToken, influencerController.updateInfluencer.bind(influencerController));
router.delete('/:id', authenticateToken, influencerController.deleteInfluencer.bind(influencerController));

// Rutas de equipos
router.get('/team/:teamId', authenticateToken, influencerController.getInfluencersByTeam.bind(influencerController));
router.post('/team/:teamId', authenticateToken, influencerController.addToTeam.bind(influencerController));
router.put('/team/:teamId/influencer/:influencerId', authenticateToken, influencerController.updateTeamStatus.bind(influencerController));
router.delete('/team/:teamId/influencer/:influencerId', authenticateToken, influencerController.removeFromTeam.bind(influencerController));

// Rutas de campañas
router.post('/campaign/:campaignId', authenticateToken, influencerController.addToCampaign.bind(influencerController));
router.put('/campaign/:campaignId/influencer/:influencerId', authenticateToken, influencerController.updateCampaignStatus.bind(influencerController));
router.delete('/campaign/:campaignId/influencer/:influencerId', authenticateToken, influencerController.removeFromCampaign.bind(influencerController));

// Rutas de estadísticas
router.get('/:id/stats', authenticateToken, influencerController.getInfluencerStats.bind(influencerController));
router.post('/:id/stats', authenticateToken, influencerController.updateInfluencerStats.bind(influencerController));

// Ruta para obtener datos básicos de plataformas (sin guardar en BD)
router.get('/platforms/basic-data', authenticateToken, influencerController.getBasicPlatformData.bind(influencerController));

// Ruta para obtener datos completos de un influencer por youtubeId, instagramId o tiktokId
// Acepta cualquier ID como parámetro y detecta automáticamente la plataforma. También acepta query params específicos.
router.get('/full/:id', authenticateToken, influencerController.getFullInfluencerData.bind(influencerController));

// Ruta para actualizar datos de un influencer desde APIs externas
router.post('/:id/refresh', authenticateToken, influencerController.refreshInfluencerData.bind(influencerController));

router.get('/', authenticateToken, influencerController.getAllInfluencers.bind(influencerController));

export default router; 
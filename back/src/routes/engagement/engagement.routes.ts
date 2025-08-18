import { Router } from 'express';
import { EngagementController } from '../../controllers/engagement/engagement.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const engagementController = new EngagementController();

// Rutas para filtros de Engagement (deben ir antes de las rutas con parámetros)
router.get('/type/:type', authenticateToken, engagementController.getEngagementsByType.bind(engagementController));
router.get('/platform/:platform', authenticateToken, engagementController.getEngagementsByPlatform.bind(engagementController));
router.get('/date-range', authenticateToken, engagementController.getEngagementsByDateRange.bind(engagementController));

// Rutas para Engagement
router.post('/', authenticateToken, engagementController.createEngagement.bind(engagementController));
router.get('/:id', authenticateToken, engagementController.getEngagementById.bind(engagementController));
router.put('/:id', authenticateToken, engagementController.updateEngagement.bind(engagementController));
router.delete('/:id', authenticateToken, engagementController.deleteEngagement.bind(engagementController));

// Rutas para Engagement por entidad
router.get('/content/:contentId', authenticateToken, engagementController.getEngagementsByContent.bind(engagementController));
router.get('/influencer/:influencerId', authenticateToken, engagementController.getEngagementsByInfluencer.bind(engagementController));
router.get('/campaign/:campaignId', authenticateToken, engagementController.getEngagementsByCampaign.bind(engagementController));

// Rutas para métricas
router.get('/content/:contentId/metrics', authenticateToken, engagementController.getEngagementMetrics.bind(engagementController));

export default router; 
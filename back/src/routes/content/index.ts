import { Router } from 'express';
import { ContentController } from '../../controllers/content';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const contentController = new ContentController();

// Rutas para Content
router.post('/', authenticateToken, contentController.createContent.bind(contentController));
router.get('/:id', authenticateToken, contentController.getContentById.bind(contentController));
router.get('/campaign/:campaignId', authenticateToken, contentController.getContentByCampaign.bind(contentController));
router.get('/influencer/:influencerId', authenticateToken, contentController.getContentByInfluencer.bind(contentController));
router.put('/:id', authenticateToken, contentController.updateContent.bind(contentController));
router.delete('/:id', authenticateToken, contentController.deleteContent.bind(contentController));

// Rutas para filtros de Content
router.get('/status/:status', authenticateToken, contentController.getContentByStatus.bind(contentController));
router.get('/platform/:platform', authenticateToken, contentController.getContentByPlatform.bind(contentController));
router.get('/type/:type', authenticateToken, contentController.getContentByType.bind(contentController));
router.get('/scheduled', authenticateToken, contentController.getScheduledContent.bind(contentController));

// Rutas para Métricas
router.post('/:contentId/metrics', authenticateToken, contentController.createContentMetrics.bind(contentController));
router.get('/:contentId/metrics', authenticateToken, contentController.getContentMetrics.bind(contentController));
router.put('/metrics/:id', authenticateToken, contentController.updateContentMetrics.bind(contentController));
router.get('/:contentId/metrics/range', authenticateToken, contentController.getContentMetricsByDateRange.bind(contentController));

export default router; 
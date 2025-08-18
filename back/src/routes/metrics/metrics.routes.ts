import { Router } from 'express';
import { MetricsController } from '../../controllers/metrics/metrics.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const metricsController = new MetricsController();

// Rutas para filtros de Metrics (deben ir antes de las rutas con parámetros)
router.get('/type/:type', authenticateToken, metricsController.getMetricsByType.bind(metricsController));
router.get('/period/:period', authenticateToken, metricsController.getMetricsByPeriod.bind(metricsController));
router.get('/date-range', authenticateToken, metricsController.getMetricsByDateRange.bind(metricsController));

// Rutas para Metrics
router.post('/', authenticateToken, metricsController.createMetric.bind(metricsController));
router.get('/:id', authenticateToken, metricsController.getMetricById.bind(metricsController));
router.put('/:id', authenticateToken, metricsController.updateMetric.bind(metricsController));
router.delete('/:id', authenticateToken, metricsController.deleteMetric.bind(metricsController));

// Rutas para Metrics por entidad
router.get('/campaign/:campaignId', authenticateToken, metricsController.getMetricsByCampaign.bind(metricsController));
router.get('/content/:contentId', authenticateToken, metricsController.getMetricsByContent.bind(metricsController));
router.get('/influencer/:influencerId', authenticateToken, metricsController.getMetricsByInfluencer.bind(metricsController));

// Rutas para métricas calculadas
router.get('/campaign/:campaignId/summary', authenticateToken, metricsController.getCampaignMetrics.bind(metricsController));

export default router; 
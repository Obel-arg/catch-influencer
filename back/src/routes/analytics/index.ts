import { Router } from 'express';
import { AnalyticsController } from '../../controllers/analytics';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// Rutas para Analytics
router.post('/', authenticateToken, analyticsController.createAnalytics.bind(analyticsController));
router.get('/:id', authenticateToken, analyticsController.getAnalyticsById.bind(analyticsController));
router.get('/organization/:organizationId', authenticateToken, analyticsController.getAnalyticsByOrganization.bind(analyticsController));
router.get('/campaign/:campaignId', authenticateToken, analyticsController.getAnalyticsByCampaign.bind(analyticsController));
router.get('/influencer/:influencerId', authenticateToken, analyticsController.getAnalyticsByInfluencer.bind(analyticsController));
router.put('/:id', authenticateToken, analyticsController.updateAnalytics.bind(analyticsController));
router.delete('/:id', authenticateToken, analyticsController.deleteAnalytics.bind(analyticsController));

// Rutas para Reportes
router.post('/reports', authenticateToken, analyticsController.createReport.bind(analyticsController));
router.get('/reports/:id', authenticateToken, analyticsController.getReportById.bind(analyticsController));
router.get('/reports/organization/:organizationId', authenticateToken, analyticsController.getReportsByOrganization.bind(analyticsController));
router.put('/reports/:id', authenticateToken, analyticsController.updateReport.bind(analyticsController));
router.delete('/reports/:id', authenticateToken, analyticsController.deleteReport.bind(analyticsController));
router.post('/reports/:id/generate', authenticateToken, analyticsController.generateReport.bind(analyticsController));

// Rutas para Métricas
router.get('/metrics/organization/:organizationId', authenticateToken, analyticsController.getAnalyticsMetrics.bind(analyticsController));

export default router; 
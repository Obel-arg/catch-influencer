import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { generateCampaignInsights, getInsightsModelInfo } from '../../controllers/campaign/campaign-insights.controller';

const router = Router();

// 🔐 PROTECCIÓN: Solo usuarios autenticados pueden generar insights de campañas
router.use(authenticateToken);

// POST /api/campaign-insights/:campaignId - Generar insights para una campaña
router.post('/:campaignId', generateCampaignInsights);

// GET /api/campaign-insights/model/info - Obtener información del modelo
router.get('/model/info', getInsightsModelInfo);

export default router;
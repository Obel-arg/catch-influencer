import { Router } from 'express';
import { CampaignController } from '../../controllers/campaign';
import { CampaignMetricsController } from '../../controllers/campaign/campaign-metrics.controller';
import { authenticateToken } from '../../middleware/auth';
import campaignInfluencerRoutes from './campaign-influencer.routes';

const router = Router();
const campaignController = new CampaignController();
const campaignMetricsController = new CampaignMetricsController();

// Rutas para filtros de Campaign (deben ir antes de las rutas con parámetros)
router.get('/my-campaigns', authenticateToken, campaignController.getMyCampaigns.bind(campaignController));
router.get('/my-campaigns-with-metrics', authenticateToken, campaignController.getMyCampaignsWithMetrics.bind(campaignController));
router.get('/status/:status', authenticateToken, campaignController.getCampaignsByStatus.bind(campaignController));
router.get('/type/:type', authenticateToken, campaignController.getCampaignsByType.bind(campaignController));
router.get('/active', authenticateToken, campaignController.getActiveCampaigns.bind(campaignController));
router.get('/date-range', authenticateToken, campaignController.getCampaignsByDateRange.bind(campaignController));
router.get('/organization/:organizationId', authenticateToken, campaignController.getCampaignsByOrganization.bind(campaignController));

// Rutas para Campaign
router.post('/', authenticateToken, campaignController.createCampaign.bind(campaignController));
router.get('/:id', authenticateToken, campaignController.getCampaignById.bind(campaignController));
router.put('/:id', authenticateToken, campaignController.updateCampaign.bind(campaignController));
router.delete('/:id', authenticateToken, campaignController.deleteCampaign.bind(campaignController));

// Ruta específica para eliminar influencer de una campaña
router.delete('/:campaignId/influencers/:influencerId', authenticateToken, campaignController.removeInfluencer.bind(campaignController));

// Rutas para Campaign Influencer
router.use('/:campaignId/influencers', campaignInfluencerRoutes);

// Rutas de métricas
router.put('/:id/metrics', authenticateToken, campaignController.updateCampaignMetrics.bind(campaignController));
router.get('/:campaignId/metrics', authenticateToken, campaignMetricsController.getCampaignMetrics.bind(campaignMetricsController));

// 🎯 RUTAS PARA ASIGNACIÓN DE USUARIOS A CAMPAÑAS
router.post('/:campaignId/assign-users', authenticateToken, campaignController.assignUsersToCampaign.bind(campaignController));
router.delete('/:campaignId/remove-users', authenticateToken, campaignController.removeUsersFromCampaign.bind(campaignController));
router.get('/:campaignId/members', authenticateToken, campaignController.getCampaignMembers.bind(campaignController));
router.get('/user/:userId/campaigns', authenticateToken, campaignController.getUserCampaigns.bind(campaignController));

export default router; 
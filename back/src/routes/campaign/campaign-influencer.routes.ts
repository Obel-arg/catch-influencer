import { Router } from 'express';
import { CampaignInfluencerController } from '../../controllers/campaign/campaign-influencer.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const campaignInfluencerController = new CampaignInfluencerController();

// Rutas para Campaign Influencer
router.post('/campaign/:campaignId', authenticateToken, campaignInfluencerController.createCampaignInfluencer.bind(campaignInfluencerController));
router.post('/campaign/:campaignId/check-assignments', authenticateToken, campaignInfluencerController.checkInfluencerAssignments.bind(campaignInfluencerController));
router.get('/:id', authenticateToken, campaignInfluencerController.getCampaignInfluencerById.bind(campaignInfluencerController));
router.get('/campaign/:campaignId', authenticateToken, campaignInfluencerController.getCampaignInfluencersByCampaign.bind(campaignInfluencerController));
router.get('/campaign/:campaignId/details', authenticateToken, campaignInfluencerController.getCampaignInfluencersWithDetails.bind(campaignInfluencerController));
router.get('/influencer/:influencerId', authenticateToken, campaignInfluencerController.getCampaignInfluencersByInfluencer.bind(campaignInfluencerController));
router.put('/:id', authenticateToken, campaignInfluencerController.updateCampaignInfluencer.bind(campaignInfluencerController));
router.delete('/:id', authenticateToken, campaignInfluencerController.deleteCampaignInfluencer.bind(campaignInfluencerController));

// Rutas para filtros
router.get('/status/:status', authenticateToken, campaignInfluencerController.getCampaignInfluencersByStatus.bind(campaignInfluencerController));
router.get('/payment-status/:paymentStatus', authenticateToken, campaignInfluencerController.getCampaignInfluencersByPaymentStatus.bind(campaignInfluencerController));
router.get('/active', authenticateToken, campaignInfluencerController.getActiveCampaignInfluencers.bind(campaignInfluencerController));
router.get('/date-range', authenticateToken, campaignInfluencerController.getCampaignInfluencersByDateRange.bind(campaignInfluencerController));

export default router; 
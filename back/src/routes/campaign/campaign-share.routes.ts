import { Router } from 'express';
import { CampaignShareController } from '../../controllers/campaign/campaign-share.controller';
import { authenticateToken } from '../../middleware/auth';
import { rateLimitMiddleware } from '../../middleware/rate-limit';

const router = Router();
const shareController = new CampaignShareController();

// Protected route - generate share token
router.post(
  '/:campaignId/share',
  authenticateToken,
  shareController.generateShareLink.bind(shareController)
);

// Public routes - no auth, rate limited
router.get(
  '/share/:token',
  rateLimitMiddleware({ windowMs: 60000, max: 30 }),
  shareController.getSharedCampaign.bind(shareController)
);

router.get(
  '/share/:token/metrics',
  rateLimitMiddleware({ windowMs: 60000, max: 30 }),
  shareController.getSharedCampaignMetrics.bind(shareController)
);

export default router;

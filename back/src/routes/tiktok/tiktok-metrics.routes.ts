import { Router } from 'express';
import { TikTokMetricsController } from '../../controllers/tiktok/tiktok-metrics.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const tiktokMetricsController = new TikTokMetricsController();

// Get video metrics
router.post('/video-metrics', authenticateToken, tiktokMetricsController.getVideoMetrics.bind(tiktokMetricsController));

// Extract video ID from URL
router.post('/extract-video-id', authenticateToken, tiktokMetricsController.extractVideoId.bind(tiktokMetricsController));

// Extract user ID from URL
router.post('/extract-user-id', authenticateToken, tiktokMetricsController.extractUserId.bind(tiktokMetricsController));

export default router; 
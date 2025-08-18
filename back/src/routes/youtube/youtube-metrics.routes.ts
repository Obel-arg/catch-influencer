import { Router } from 'express';
import { YouTubeMetricsController } from '../../controllers/youtube/youtube-metrics.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const youtubeMetricsController = new YouTubeMetricsController();

// Get video metrics
router.post('/video-metrics', authenticateToken, youtubeMetricsController.getVideoMetrics.bind(youtubeMetricsController));

// Get channel metrics
router.post('/channel-metrics', authenticateToken, youtubeMetricsController.getChannelMetrics.bind(youtubeMetricsController));

// Extract video ID from URL
router.post('/extract-video-id', authenticateToken, youtubeMetricsController.extractVideoId.bind(youtubeMetricsController));

// Extract channel ID from URL
router.post('/extract-channel-id', authenticateToken, youtubeMetricsController.extractChannelId.bind(youtubeMetricsController));

export default router; 
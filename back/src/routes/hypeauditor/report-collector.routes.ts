import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { ReportCollectorController } from '../../controllers/hypeauditor/report-collector.controller';

const router = Router();

/**
 * HypeAuditor Report Collector Routes
 *
 * These routes are for collecting and managing real HypeAuditor reports
 * for accurate audience demographic inference.
 */

// Collect a single report
// POST /hypeauditor/collector/collect-report
// Body: { username: string, platform: string, influencer_id?: string }
router.post(
  '/collect-report',
  authenticateToken,
  ReportCollectorController.collectReport,
);

// Collect multiple reports in batch
// POST /hypeauditor/collector/collect-batch
// Body: { influencers: Array<{username: string, platform: string, id?: string}> }
router.post(
  '/collect-batch',
  authenticateToken,
  ReportCollectorController.collectBatch,
);

// Get collection statistics
// GET /hypeauditor/collector/collection-stats
router.get(
  '/collection-stats',
  authenticateToken,
  ReportCollectorController.getStats,
);

// Get a stored report for an influencer
// GET /hypeauditor/collector/stored-report/:influencer_id?platform={platform}
router.get(
  '/stored-report/:influencer_id',
  authenticateToken,
  ReportCollectorController.getStoredReport,
);

// Find similar reports
// GET /hypeauditor/collector/similar-reports?follower_count={count}&niche={niche}&platform={platform}
router.get(
  '/similar-reports',
  authenticateToken,
  ReportCollectorController.findSimilarReports,
);

// Info route
router.get('/', (req, res) => {
  res.json({
    message: 'HypeAuditor Report Collector API',
    version: '1.0.0',
    description: 'Collect and manage real HypeAuditor reports for accurate audience inference',
    endpoints: {
      collectReport: 'POST /hypeauditor/collector/collect-report',
      collectBatch: 'POST /hypeauditor/collector/collect-batch',
      stats: 'GET /hypeauditor/collector/collection-stats',
      storedReport: 'GET /hypeauditor/collector/stored-report/:influencer_id',
      similarReports: 'GET /hypeauditor/collector/similar-reports',
    },
    notes: [
      'All routes require authentication',
      'Each report collection consumes 1 HypeAuditor API query',
      'Reports are cached for 30 days',
      'Strategic collection recommended: ~50 diverse influencers for accurate inference',
    ],
  });
});

export default router;

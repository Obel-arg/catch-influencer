import { Request, Response } from 'express';
import { ReportCollectorService } from '../../services/hypeauditor/report-collector.service';

/**
 * ReportCollectorController
 *
 * HTTP endpoints for collecting and managing HypeAuditor audience reports.
 * These endpoints are used to build a library of real reports for accurate
 * audience demographic inference.
 */
export class ReportCollectorController {
  private static collectorService = new ReportCollectorService();

  /**
   * POST /hypeauditor/collector/collect-report
   * Collect a single HypeAuditor report
   *
   * Body:
   * - username: string (required) - Username/handle on the platform
   * - platform: 'instagram' | 'tiktok' | 'youtube' (required)
   * - influencer_id: string (optional) - Internal influencer ID
   */
  static async collectReport(req: Request, res: Response) {
    try {
      const { username, platform, influencer_id } = req.body;

      // Validate required fields
      if (!username || !platform) {
        return res.status(400).json({
          success: false,
          error: 'username and platform are required',
        });
      }

      // Validate platform
      if (!['instagram', 'tiktok', 'youtube'].includes(platform)) {
        return res.status(400).json({
          success: false,
          error: 'platform must be instagram, tiktok, or youtube',
        });
      }

      console.log(`[ReportCollectorController] Collecting report for ${username} on ${platform}`);

      const report = await ReportCollectorController.collectorService.collectAndStoreReport(
        username,
        platform,
        influencer_id,
      );

      if (report) {
        res.json({
          success: true,
          message: 'Report collected and stored successfully',
          report: {
            id: report.id,
            username: report.influencer_username,
            platform: report.platform,
            follower_count: report.follower_count,
            engagement_rate: report.engagement_rate,
            niche: report.influencer_niche,
            collected_at: report.collected_at,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to collect report. Report may not be ready or API error occurred.',
        });
      }
    } catch (error: any) {
      console.error('[ReportCollectorController] Error in collectReport:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Server error',
      });
    }
  }

  /**
   * POST /hypeauditor/collector/collect-batch
   * Collect multiple HypeAuditor reports in batch
   *
   * Body:
   * - influencers: Array<{username: string, platform: string, id?: string}> (required)
   */
  static async collectBatch(req: Request, res: Response) {
    try {
      const { influencers } = req.body;

      // Validate required fields
      if (!Array.isArray(influencers) || influencers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'influencers array is required and must not be empty',
        });
      }

      // Validate each influencer has required fields
      for (const influencer of influencers) {
        if (!influencer.username || !influencer.platform) {
          return res.status(400).json({
            success: false,
            error: 'Each influencer must have username and platform',
          });
        }

        if (!['instagram', 'tiktok', 'youtube'].includes(influencer.platform)) {
          return res.status(400).json({
            success: false,
            error: `Invalid platform: ${influencer.platform}`,
          });
        }
      }

      console.log(`[ReportCollectorController] Starting batch collection of ${influencers.length} reports`);

      const results = await ReportCollectorController.collectorService.collectBatchReports(
        influencers,
      );

      res.json({
        success: true,
        message: `Batch collection complete: ${results.success} success, ${results.failed} failed`,
        summary: {
          total: influencers.length,
          success: results.success,
          failed: results.failed,
        },
        reports: results.reports.map((report) => ({
          id: report.id,
          username: report.influencer_username,
          platform: report.platform,
          follower_count: report.follower_count,
          engagement_rate: report.engagement_rate,
          niche: report.influencer_niche,
          collected_at: report.collected_at,
        })),
      });
    } catch (error: any) {
      console.error('[ReportCollectorController] Error in collectBatch:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Server error',
      });
    }
  }

  /**
   * GET /hypeauditor/collector/collection-stats
   * Get collection statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await ReportCollectorController.collectorService.getCollectionStats();

      res.json({
        success: true,
        stats: {
          total_reports: stats.total_reports,
          by_platform: stats.by_platform,
          total_api_cost: stats.total_cost,
        },
      });
    } catch (error: any) {
      console.error('[ReportCollectorController] Error in getStats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Server error',
      });
    }
  }

  /**
   * GET /hypeauditor/collector/stored-report/:influencer_id
   * Get a stored report for an influencer
   *
   * Params:
   * - influencer_id: string (required)
   *
   * Query:
   * - platform: string (required)
   */
  static async getStoredReport(req: Request, res: Response) {
    try {
      const { influencer_id } = req.params;
      const { platform } = req.query;

      if (!influencer_id || !platform) {
        return res.status(400).json({
          success: false,
          error: 'influencer_id and platform are required',
        });
      }

      const report = await ReportCollectorController.collectorService.getStoredReport(
        influencer_id,
        platform as string,
      );

      if (report) {
        res.json({
          success: true,
          report: {
            id: report.id,
            username: report.influencer_username,
            platform: report.platform,
            audience_demographics: report.audience_demographics,
            audience_geography: report.audience_geography,
            follower_count: report.follower_count,
            engagement_rate: report.engagement_rate,
            niche: report.influencer_niche,
            collected_at: report.collected_at,
            expires_at: report.expires_at,
          },
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Report not found or expired',
        });
      }
    } catch (error: any) {
      console.error('[ReportCollectorController] Error in getStoredReport:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Server error',
      });
    }
  }

  /**
   * GET /hypeauditor/collector/similar-reports
   * Find reports similar to given characteristics
   *
   * Query:
   * - follower_count: number (required)
   * - niche: string (optional)
   * - platform: string (optional)
   */
  static async findSimilarReports(req: Request, res: Response) {
    try {
      const { follower_count, niche, platform } = req.query;

      if (!follower_count) {
        return res.status(400).json({
          success: false,
          error: 'follower_count is required',
        });
      }

      const followerCountNum = parseInt(follower_count as string, 10);
      if (isNaN(followerCountNum)) {
        return res.status(400).json({
          success: false,
          error: 'follower_count must be a number',
        });
      }

      const reports = await ReportCollectorController.collectorService.findSimilarReports(
        followerCountNum,
        niche as string,
        platform as string,
      );

      res.json({
        success: true,
        count: reports.length,
        reports: reports.map((report) => ({
          id: report.id,
          username: report.influencer_username,
          platform: report.platform,
          follower_count: report.follower_count,
          engagement_rate: report.engagement_rate,
          niche: report.influencer_niche,
          collected_at: report.collected_at,
        })),
      });
    } catch (error: any) {
      console.error('[ReportCollectorController] Error in findSimilarReports:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Server error',
      });
    }
  }
}

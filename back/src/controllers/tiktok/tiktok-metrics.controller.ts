import { Request, Response } from 'express';
import { TikTokMetricsService } from '../../services/tiktok/tiktok-metrics.service';

export class TikTokMetricsController {
  private tiktokMetricsService = TikTokMetricsService.getInstance();

  /**
   * Get video metrics
   */
  async getVideoMetrics(req: Request, res: Response) {
    try {
      const { videoUrl } = req.body;

      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          error: 'videoUrl is required'
        });
      }

      const result = await this.tiktokMetricsService.getVideoMetrics(videoUrl);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        data: result.data
      });

    } catch (error) {
      console.error('❌ [TIKTOK-METRICS-CONTROLLER] Error getting video metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Extract video ID from URL
   */
  async extractVideoId(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'url is required'
        });
      }

      // Use the private method through a public wrapper
      const videoId = this.tiktokMetricsService['extractVideoId'](url);

      res.json({
        success: true,
        data: {
          videoId,
          isValid: !!videoId
        }
      });

    } catch (error) {
      console.error('❌ [TIKTOK-METRICS-CONTROLLER] Error extracting video ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Extract user ID from URL
   */
  async extractUserId(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'url is required'
        });
      }

      // Use the private method through a public wrapper
      const userId = this.tiktokMetricsService['extractUserId'](url);

      res.json({
        success: true,
        data: {
          userId,
          isValid: !!userId
        }
      });

    } catch (error) {
      console.error('❌ [TIKTOK-METRICS-CONTROLLER] Error extracting user ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
} 
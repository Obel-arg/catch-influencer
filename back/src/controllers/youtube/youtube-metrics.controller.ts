import { Request, Response } from 'express';
import { YouTubeMetricsService } from '../../services/youtube/youtube-metrics.service';

export class YouTubeMetricsController {
  private youtubeMetricsService = YouTubeMetricsService.getInstance();

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

      const result = await this.youtubeMetricsService.getVideoMetrics(videoUrl);

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
      console.error('❌ [YOUTUBE-METRICS-CONTROLLER] Error getting video metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get channel metrics
   */
  async getChannelMetrics(req: Request, res: Response) {
    try {
      const { channelUrl } = req.body;

      if (!channelUrl) {
        return res.status(400).json({
          success: false,
          error: 'channelUrl is required'
        });
      }

      const result = await this.youtubeMetricsService.getChannelMetrics(channelUrl);

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
      console.error('❌ [YOUTUBE-METRICS-CONTROLLER] Error getting channel metrics:', error);
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
      const videoId = this.youtubeMetricsService['extractVideoId'](url);

      res.json({
        success: true,
        data: {
          videoId,
          isValid: !!videoId
        }
      });

    } catch (error) {
      console.error('❌ [YOUTUBE-METRICS-CONTROLLER] Error extracting video ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Extract channel ID from URL
   */
  async extractChannelId(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'url is required'
        });
      }

      // Use the private method through a public wrapper
      const channelId = this.youtubeMetricsService['extractChannelId'](url);

      res.json({
        success: true,
        data: {
          channelId,
          isValid: !!channelId
        }
      });

    } catch (error) {
      console.error('❌ [YOUTUBE-METRICS-CONTROLLER] Error extracting channel ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
} 
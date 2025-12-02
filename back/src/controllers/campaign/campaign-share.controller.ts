import { Request, Response } from 'express';
import { CampaignShareService } from '../../services/campaign/campaign-share.service';
import { CampaignService } from '../../services/campaign';
import { CampaignMetricsController } from './campaign-metrics.controller';
import config from '../../config/environment';

export class CampaignShareController {
  private shareService: CampaignShareService;
  private campaignService: CampaignService;
  private metricsController: CampaignMetricsController;

  constructor() {
    this.shareService = new CampaignShareService();
    this.campaignService = new CampaignService();
    this.metricsController = new CampaignMetricsController();
  }

  /**
   * Generate share token (authenticated)
   * POST /api/campaigns/:campaignId/share
   */
  async generateShareLink(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const userId = req.user?.id;

      const campaign = await this.campaignService.getCampaignById(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      const shareToken = await this.shareService.createShareToken(campaignId, userId);

      res.json({
        success: true,
        shareToken: shareToken.share_token,
        shareUrl: `${config.frontendUrl}/share/${shareToken.share_token}`
      });
    } catch (error) {
      console.error('Error generating share link:', error);
      res.status(500).json({ error: 'Error generating share link' });
    }
  }

  /**
   * Get shared campaign (public, no auth)
   * GET /api/share/:token
   */
  async getSharedCampaign(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const campaignId = await this.shareService.getCampaignIdByToken(token);
      if (!campaignId) {
        return res.status(404).json({ error: 'Invalid or expired share link' });
      }

      const campaign = await this.campaignService.getCampaignById(campaignId);
      if (!campaign || campaign.deleted_at) {
        return res.status(404).json({ error: 'Campaign not found or has been deleted' });
      }

      // Remove sensitive data
      const sanitizedCampaign = this.sanitizeCampaignData(campaign);

      res.json({
        success: true,
        campaign: sanitizedCampaign
      });
    } catch (error) {
      console.error('Error fetching shared campaign:', error);
      res.status(500).json({ error: 'Error fetching campaign data' });
    }
  }

  /**
   * Get shared campaign metrics (public, no auth)
   * GET /api/share/:token/metrics
   */
  async getSharedCampaignMetrics(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const campaignId = await this.shareService.getCampaignIdByToken(token);
      if (!campaignId) {
        return res.status(404).json({ error: 'Invalid or expired share link' });
      }

      // Reuse existing metrics logic
      req.params.campaignId = campaignId;
      return this.metricsController.getCampaignMetrics(req, res);
    } catch (error) {
      console.error('Error fetching shared campaign metrics:', error);
      res.status(500).json({ error: 'Error fetching campaign metrics' });
    }
  }

  /**
   * Remove sensitive data from campaign
   */
  private sanitizeCampaignData(campaign: any) {
    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      type: campaign.type,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      platforms: campaign.platforms,
      objectives: campaign.objectives,
      goals: campaign.goals,
      avg_engagement_rate: campaign.avg_engagement_rate,
      // EXCLUDED: organization_id, team_id, created_by, budget,
      // currency, deliverables, content_guidelines, hashtags, mentions, notes, target_audience
    };
  }
}

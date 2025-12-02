import { Request, Response } from 'express';
import { SyntheticAudienceService } from '../../services/audience/synthetic-audience.service';
import { InfluencerService } from '../../services/influencer/influencer.service';

export class InfluencerAudienceController {
  private syntheticService: SyntheticAudienceService;
  private influencerService: InfluencerService;

  constructor() {
    this.syntheticService = new SyntheticAudienceService();
    this.influencerService = new InfluencerService();
  }

  /**
   * GET /api/influencers/:id/audience/synthetic
   * Generate synthetic audience demographics for an influencer
   */
  async getSyntheticAudience(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { username, follower_count, platform, niche } = req.query;

      let influencerData: any;

      // Check if influencer data is passed via query params (from explorer)
      if (username && follower_count) {
        // Use query params directly (explorer mode)
        influencerData = {
          id: id,
          username: username as string,
          niche: niche as string || undefined,
          follower_count: parseInt(follower_count as string),
          platform: platform as string || 'instagram',
        };
        console.log('[InfluencerAudience] Using explorer data:', influencerData);
      } else {
        // Try to get influencer from database
        const influencer = await this.influencerService.getById(id);
        if (!influencer) {
          return res.status(404).json({
            success: false,
            error: 'Influencer not found in database. Please provide username and follower_count as query params.'
          });
        }

        // Prepare influencer data for matching
        influencerData = {
          id: influencer.id,
          username: influencer.username || influencer.name,
          niche: influencer.niche || influencer.category,
          follower_count:
            influencer.follower_count ||
            influencer.instagram_followers ||
            influencer.tiktok_followers ||
            influencer.youtube_subscribers ||
            50000, // Default fallback
          platform:
            influencer.primary_platform ||
            this.detectPlatform(influencer),
        };
        console.log('[InfluencerAudience] Using database influencer:', influencerData);
      }

      // Generate audience (hybrid: real or synthetic)
      const audience = await this.syntheticService.getInfluencerAudience(influencerData);

      res.json({
        success: true,
        audience,
      });
    } catch (error) {
      console.error('Error generating synthetic audience:', error);
      res.status(500).json({
        success: false,
        error: 'Error generating audience data'
      });
    }
  }

  /**
   * Helper: Detect primary platform from influencer data
   */
  private detectPlatform(influencer: any): string {
    if (influencer.instagram_id || influencer.instagram_followers) return 'instagram';
    if (influencer.tiktok_id || influencer.tiktok_followers) return 'tiktok';
    if (influencer.youtube_id || influencer.youtube_subscribers) return 'youtube';
    return 'instagram'; // Default
  }
}

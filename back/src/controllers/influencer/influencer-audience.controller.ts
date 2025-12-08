import { Request, Response } from 'express';
import { OpenAIAudienceService } from '../../services/audience/openai-audience.service';
import { InfluencerService } from '../../services/influencer/influencer.service';

export class InfluencerAudienceController {
  private openaiService: OpenAIAudienceService;
  private influencerService: InfluencerService;

  constructor() {
    this.openaiService = new OpenAIAudienceService();
    this.influencerService = new InfluencerService();
  }

  /**
   * GET /api/influencers/:id/audience/synthetic
   * Generate audience demographics using OpenAI inference
   */
  async getSyntheticAudience(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { username, instagram_url, force, search_context } = req.query;

      // Parse search context if provided
      let parsedSearchContext = undefined;
      if (search_context) {
        try {
          parsedSearchContext = JSON.parse(search_context as string);
          console.log(
            '[InfluencerAudience] Search context received:',
            parsedSearchContext,
          );
        } catch (e) {
          console.warn(
            '[InfluencerAudience] Invalid search_context JSON, ignoring',
          );
        }
      }

      let instagramUrl: string;
      let influencerId: string = id;

      // Check if Instagram URL is provided directly
      if (instagram_url) {
        instagramUrl = instagram_url as string;
        console.log(
          '[InfluencerAudience] Using provided Instagram URL:',
          instagramUrl,
        );
      } else if (username) {
        // Clean username: remove spaces, special chars, convert to lowercase
        const cleanUsername = (username as string)
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '') // Remove all spaces
          .replace(/[^a-z0-9._]/g, ''); // Keep only valid Instagram characters

        instagramUrl = `https://instagram.com/${cleanUsername}`;
        console.log(
          '[InfluencerAudience] Built Instagram URL from username:',
          instagramUrl,
          username !== cleanUsername ? `(cleaned from: ${username})` : '',
        );
      } else {
        // Try to get influencer from database
        const influencer = await this.influencerService.getById(id);
        if (!influencer) {
          return res.status(404).json({
            success: false,
            error:
              'Influencer not found in database. Please provide username or instagram_url as query params.',
          });
        }

        // Extract Instagram URL or username from influencer data
        console.log(
          '[InfluencerAudience] Fetching influencer from database:',
          influencer,
        );
        const influencerUsername =
          influencer.instagram_username ||
          influencer.username ||
          influencer.name;

        if (!influencerUsername) {
          return res.status(400).json({
            success: false,
            error:
              'No Instagram username found for this influencer. Please provide username or instagram_url.',
          });
        }

        instagramUrl = `https://instagram.com/${influencerUsername}`;
        console.log(
          '[InfluencerAudience] Using database influencer Instagram:',
          instagramUrl,
        );
      }

      // Call OpenAI inference service
      console.log('[InfluencerAudience] Calling OpenAI inference...');
      const result = await this.openaiService.inferAudience(instagramUrl, {
        influencerId: influencerId,
        forceRefresh: force === 'true',
        searchContext: parsedSearchContext,
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || 'Failed to infer audience demographics',
          details: result.details,
        });
      }

      res.json({
        success: true,
        audience: result.demographics,
        cached: result.cached,
        cost: result.cost,
      });
    } catch (error: any) {
      console.error('[InfluencerAudience] Error inferring audience:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error inferring audience data',
      });
    }
  }
}

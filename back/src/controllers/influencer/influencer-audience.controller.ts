import { Request, Response } from "express";
import { AgentAudienceService } from "../../services/audience/agent-audience.service";
import { InfluencerService } from "../../services/influencer/influencer.service";
import { SupportedPlatform } from "../../models/audience/openai-audience-inference.model";

export class InfluencerAudienceController {
  private agentService: AgentAudienceService;
  private influencerService: InfluencerService;

  constructor() {
    this.agentService = new AgentAudienceService();
    this.influencerService = new InfluencerService();
  }

  /**
   * Build platform-specific URL from username/handle
   */
  private buildPlatformUrl(
    username: string,
    platform: SupportedPlatform
  ): string {
    const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, "");

    switch (platform) {
      case "instagram":
        return `https://instagram.com/${cleanUsername}`;
      case "youtube":
        return `https://youtube.com/@${cleanUsername}`;
      case "tiktok":
        return `https://tiktok.com/@${cleanUsername}`;
      case "twitter":
        return `https://twitter.com/${cleanUsername}`;
      case "twitch":
        return `https://twitch.tv/${cleanUsername}`;
      case "threads":
        return `https://threads.net/@${cleanUsername}`;
      default:
        return `https://instagram.com/${cleanUsername}`;
    }
  }

  /**
   * Extract platform-specific username from influencer data
   */
  private extractPlatformUsername(
    influencer: any,
    platform: SupportedPlatform
  ): string | null {
    const platformInfo = influencer.platformInfo || {};

    switch (platform) {
      case "instagram":
        return (
          influencer.instagram_username ||
          platformInfo.instagram?.username ||
          influencer.username ||
          null
        );
      case "youtube":
        return (
          influencer.youtube_id ||
          platformInfo.youtube?.channelId ||
          platformInfo.youtube?.youtubeId ||
          null
        );
      case "tiktok":
        return (
          influencer.tiktok_id ||
          platformInfo.tiktok?.tiktokId ||
          platformInfo.tiktok?.username ||
          null
        );
      case "twitter":
        return (
          influencer.twitter_username || platformInfo.twitter?.username || null
        );
      case "twitch":
        return (
          influencer.twitch_username || platformInfo.twitch?.username || null
        );
      case "threads":
        return (
          influencer.threads_username || platformInfo.threads?.username || null
        );
      default:
        return null;
    }
  }

  /**
   * GET /api/influencers/:id/audience/synthetic
   * Generate audience demographics using Agent inference
   *
   * Query params:
   * - check_only: If true, only check cache without generating (fast path)
   * - username: Platform username/handle
   * - url: Full platform URL (replaces instagram_url)
   * - platform: Platform type (instagram, youtube, tiktok, twitter, twitch, threads)
   * - force: Force refresh cache
   * - search_context: JSON string with search context
   */
  async getSyntheticAudience(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        username,
        url,
        instagram_url, // Legacy support
        platform,
        force,
        search_context,
        check_only,
      } = req.query;

      // Parse search context if provided
      let parsedSearchContext = undefined;
      if (search_context) {
        try {
          parsedSearchContext = JSON.parse(search_context as string);
          console.log(
            "[InfluencerAudience] Search context received:",
            parsedSearchContext
          );
        } catch (e) {
          console.warn(
            "[InfluencerAudience] Invalid search_context JSON, ignoring"
          );
        }
      }

      // Determine platform (default to instagram for backward compatibility)
      const platformParam = (platform as SupportedPlatform) || "instagram";
      const validPlatforms: SupportedPlatform[] = [
        "instagram",
        "youtube",
        "tiktok",
        "twitter",
        "twitch",
        "threads",
        "general",
      ];

      if (!validPlatforms.includes(platformParam)) {
        return res.status(400).json({
          success: false,
          error: `Invalid platform. Must be one of: ${validPlatforms.join(
            ", "
          )}`,
        });
      }

      // Handle general inference request - ONLY merge stored data, never scrape
      if (platformParam === "general") {
        // Use the provided ID directly - it should match what was used when storing platform inferences
        // The ID can be either a UUID or a creator_id
        const actualInfluencerId = id;

        console.log(
          `[General Inference] Processing for influencer ID: ${actualInfluencerId}`
        );

        // Check if general inference exists in cache
        const generalUrl = `general-${actualInfluencerId}`;

        // Use internal cache check (not inferAudience which would scrape)
        const cachedGeneral = await this.agentService.checkGeneralCache(
          generalUrl,
          actualInfluencerId,
          parsedSearchContext
        );

        if (cachedGeneral && !force) {
          // Return cached general inference
          const demographics = cachedGeneral.audience_demographics as any;
          return res.json({
            success: true,
            audience: {
              ...demographics,
              bio: demographics.bio, // Ensure bio is included in response
            },
            description: demographics.bio || (cachedGeneral as any).description,
            cached: true,
            cost: 0,
          });
        }

        // If check_only mode and not cached, return generation_required
        if (check_only === "true") {
          return res.json({
            success: true,
            cached: false,
            generation_required: true,
            message:
              "General inference not found in cache. Generation required.",
          });
        }

        // Generate general inference by merging stored platform inferences
        const generalResult = await this.agentService.generateGeneralInference(
          actualInfluencerId,
          parsedSearchContext
        );

        if (!generalResult.success) {
          return res.status(500).json({
            success: false,
            error:
              generalResult.error || "Failed to generate general inference",
            details: generalResult.details,
          });
        }

        return res.json({
          success: true,
          audience: generalResult.demographics,
          description: generalResult.description,
          cached: false,
          cost: generalResult.cost || 0,
        });
      }

      let profileUrl: string;
      const influencerId: string = id;

      // Check if URL is provided directly (prefer new 'url' param, fallback to 'instagram_url' for legacy)
      if (url) {
        profileUrl = url as string;
        console.log(
          `[InfluencerAudience] Using provided ${platformParam} URL:`,
          profileUrl
        );
      } else if (instagram_url) {
        // Legacy support
        profileUrl = instagram_url as string;
        console.log(
          `[InfluencerAudience] Using provided URL (legacy param):`,
          profileUrl
        );
      } else if (username) {
        // Build platform-specific URL from username
        profileUrl = this.buildPlatformUrl(username as string, platformParam);
        console.log(
          `[InfluencerAudience] Built ${platformParam} URL from username:`,
          profileUrl
        );
      } else {
        // Try to get influencer from database
        const influencer = await this.influencerService.getById(id);
        if (!influencer) {
          return res.status(404).json({
            success: false,
            error:
              "Influencer not found in database. Please provide username or url as query params.",
          });
        }

        // Extract platform-specific username from influencer data
        console.log(
          `[InfluencerAudience] Fetching influencer from database for platform: ${platformParam}`
        );
        const influencerUsername = this.extractPlatformUsername(
          influencer,
          platformParam
        );

        if (!influencerUsername) {
          return res.status(400).json({
            success: false,
            error: `No ${platformParam} username found for this influencer. Please provide username or url.`,
          });
        }

        profileUrl = this.buildPlatformUrl(influencerUsername, platformParam);
        console.log(
          `[InfluencerAudience] Using database influencer ${platformParam}:`,
          profileUrl
        );
      }

      // If check_only=true, only check cache without generating
      if (check_only === "true") {
        console.log("[InfluencerAudience] Check-only mode - checking cache...");
        const cachedResult = await this.agentService.inferAudience(profileUrl, {
          influencerId: influencerId,
          platform: platformParam,
          forceRefresh: false,
          searchContext: parsedSearchContext,
          skipGeneration: true, // New option to skip generation
        });

        if (cachedResult.cached) {
          // Data found in cache
          return res.json({
            success: true,
            audience: cachedResult.demographics,
            description: cachedResult.description,
            cached: true,
            generation_required: false,
            cost: 0,
          });
        } else {
          // No cache found, generation required
          return res.json({
            success: true,
            cached: false,
            generation_required: true,
            message: "Audience data not found in cache. Generation required.",
          });
        }
      }

      // Call Agent inference service (full generation)
      console.log(
        `[InfluencerAudience] Calling Agent inference for ${platformParam}...`
      );
      const result = await this.agentService.inferAudience(profileUrl, {
        influencerId: influencerId,
        platform: platformParam,
        forceRefresh: force === "true",
        searchContext: parsedSearchContext,
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || "Failed to infer audience demographics",
          details: result.details,
        });
      }

      res.json({
        success: true,
        audience: result.demographics,
        description: result.description,
        cached: result.cached,
        cost: result.cost,
      });
    } catch (error: any) {
      console.error("[InfluencerAudience] Error inferring audience:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error inferring audience data",
      });
    }
  }
}

import { Request, Response } from "express";
import { AgentAudienceService } from "../../services/audience/agent-audience.service";
import {
  InferenceOptions,
  SupportedPlatform,
} from "../../models/audience/openai-audience-inference.model";

export class AgentAudienceController {
  private agentAudienceService: AgentAudienceService;

  constructor() {
    this.agentAudienceService = new AgentAudienceService();
  }

  /**
   * Endpoint para analizar la audiencia de un perfil de redes sociales usando agentes AI
   * GET /agent-audience?url=<<url>>&platform=<<platform>>&searchContext=<<json>>
   *
   * Query parameters:
   * - url: Social media profile URL (required, replaces instagramUrl)
   * - instagramUrl: Legacy parameter (still supported)
   * - platform: Platform type (instagram, youtube, tiktok, twitter, twitch, threads) - optional, auto-detected from URL
   * - influencerId: UUID of the influencer (optional)
   * - searchContext: JSON string with search context from frontend (optional)
   * - forceRefresh: "true" to bypass cache (optional)
   * - skipCache: "true" to skip both reading and writing cache (optional)
   */
  async analyzeAudience(req: Request, res: Response) {
    try {
      const {
        url,
        instagramUrl, // Legacy support
        platform,
        influencerId,
        forceRefresh,
        skipCache,
        searchContext,
      } = req.query;

      // Use new 'url' param or fallback to legacy 'instagramUrl'
      const profileUrl = (url || instagramUrl) as string;

      if (!profileUrl || typeof profileUrl !== "string") {
        return res.status(400).json({
          error: "url es requerido como query parameter",
          example:
            "/agent-audience?url=https://instagram.com/username&platform=instagram",
        });
      }

      // Validate platform if provided
      const validPlatforms: SupportedPlatform[] = [
        "instagram",
        "youtube",
        "tiktok",
        "twitter",
        "twitch",
        "threads",
      ];
      
      let platformParam: SupportedPlatform | undefined = undefined;
      if (platform) {
        if (!validPlatforms.includes(platform as SupportedPlatform)) {
          return res.status(400).json({
            error: `Invalid platform. Must be one of: ${validPlatforms.join(", ")}`,
            received: platform,
          });
        }
        platformParam = platform as SupportedPlatform;
      }

      console.log(
        `🔍 [Controller] Analyzing audience for: ${profileUrl}${
          platformParam ? ` (platform: ${platformParam})` : ""
        }`
      );

      const startTime = Date.now();

      // Preparar opciones para el servicio
      const options: InferenceOptions = {};
      if (influencerId && typeof influencerId === "string") {
        options.influencerId = influencerId;
      }
      if (platformParam) {
        options.platform = platformParam;
      }
      if (forceRefresh === "true") {
        options.forceRefresh = true;
      }
      if (skipCache === "true") {
        options.skipCache = true;
      }

      // Parse search context if provided
      if (searchContext && typeof searchContext === "string") {
        try {
          options.searchContext = JSON.parse(searchContext);
          console.log(
            `🔍 [Controller] Search context received:`,
            options.searchContext
          );
        } catch (e) {
          console.warn(
            `⚠️ [Controller] Invalid searchContext JSON, ignoring:`,
            searchContext
          );
        }
      }

      // Llamar al servicio para analizar la audiencia
      const result = await this.agentAudienceService.inferAudience(
        profileUrl,
        options
      );

      const totalTime = Date.now() - startTime;

      console.log(`✅ [Controller] Analysis completed in ${totalTime}ms`);

      if (!result.success) {
        return res.status(500).json({
          error: "Error al analizar la audiencia del perfil",
          details: result.error,
          cost: result.cost,
        });
      }

      // Retornar el análisis en el formato especificado
      res.json(result.demographics);
    } catch (error: any) {
      console.error("❌ [Controller] Error analyzing audience:", error);

      res.status(500).json({
        error: "Error al analizar la audiencia del perfil",
        details: error.message,
      });
    }
  }
}

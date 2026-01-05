import { Request, Response } from "express";
import { AgentAudienceService } from "../../services/audience/agent-audience.service";
import { InferenceOptions } from "../../models/audience/openai-audience-inference.model";

export class AgentAudienceController {
  private agentAudienceService: AgentAudienceService;

  constructor() {
    this.agentAudienceService = new AgentAudienceService();
  }

  /**
   * Endpoint para analizar la audiencia de un perfil de Instagram usando agentes AI
   * GET /agent-audience?instagramUrl=<<url>>&searchContext=<<json>>
   *
   * Query parameters:
   * - instagramUrl: Instagram profile URL (required)
   * - influencerId: UUID of the influencer (optional)
   * - searchContext: JSON string with search context from frontend (optional)
   * - forceRefresh: "true" to bypass cache (optional)
   * - skipCache: "true" to skip both reading and writing cache (optional)
   */
  async analyzeAudience(req: Request, res: Response) {
    try {
      const {
        instagramUrl,
        influencerId,
        forceRefresh,
        skipCache,
        searchContext,
      } = req.query;

      if (!instagramUrl || typeof instagramUrl !== "string") {
        return res.status(400).json({
          error: "instagramUrl es requerido como query parameter",
          example:
            "/agent-audience?instagramUrl=https://instagram.com/username",
        });
      }

      // Validar que sea una URL de Instagram
      const isInstagramUrl = /(?:instagram\.com)/.test(instagramUrl);
      if (!isInstagramUrl) {
        return res.status(400).json({
          error: "La URL debe ser de Instagram",
          received: instagramUrl,
        });
      }

      console.log(`🔍 [Controller] Analyzing audience for: ${instagramUrl}`);

      const startTime = Date.now();

      // Preparar opciones para el servicio
      const options: InferenceOptions = {};
      if (influencerId && typeof influencerId === "string") {
        options.influencerId = influencerId;
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
        instagramUrl,
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

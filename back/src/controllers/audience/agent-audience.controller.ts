import { Request, Response } from "express";
import { AgentAudienceService } from "../../services/audience/agent-audience.service";

export class AgentAudienceController {
  private agentAudienceService: AgentAudienceService;

  constructor() {
    this.agentAudienceService = new AgentAudienceService();
  }

  /**
   * Endpoint para analizar la audiencia de un perfil de Instagram usando agentes AI
   * GET /agent-audience?instagramUrl=<<url>>
   */
  async analyzeAudience(req: Request, res: Response) {
    try {
      const { instagramUrl, influencerId, forceRefresh, skipCache } = req.query;

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
      const options: any = {};
      if (influencerId && typeof influencerId === "string") {
        options.influencerId = influencerId;
      }
      if (forceRefresh === "true") {
        options.forceRefresh = true;
      }
      if (skipCache === "true") {
        options.skipCache = true;
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

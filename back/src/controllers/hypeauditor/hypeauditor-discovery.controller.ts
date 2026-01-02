import { Request, Response } from "express";
import {
  HypeAuditorDiscoveryService,
  ExplorerFilters,
  DiscoverySearchRequest,
} from "../../services/hypeauditor/hypeauditor-discovery.service";

export class HypeAuditorDiscoveryController {
  private static discoveryService: HypeAuditorDiscoveryService;

  // Inicializar el service
  private static getDiscoveryService(): HypeAuditorDiscoveryService {
    if (!HypeAuditorDiscoveryController.discoveryService) {
      HypeAuditorDiscoveryController.discoveryService =
        HypeAuditorDiscoveryService.getInstance();
    }
    return HypeAuditorDiscoveryController.discoveryService;
  }

  /**
   * Búsqueda de discovery usando filtros del Explorer
   */
  static async searchDiscovery(req: Request, res: Response) {
    const startTime = Date.now();

    try {
      const filters: ExplorerFilters = req.body;

      // Validar parámetros requeridos
      if (!filters.platform) {
        return res.status(400).json({
          success: false,
          error: "La plataforma es requerida",
          provider: "HypeAuditor Discovery",
        });
      }

      const service = HypeAuditorDiscoveryController.getDiscoveryService();
      console.log("HypeAuditor Discovery Filters", filters);
      // Transformar filtros del Explorer a formato HypeAuditor
      const hypeAuditorRequest =
        service.transformExplorerFiltersToHypeAuditor(filters);

      console.log("HypeAuditor Discovery Request", hypeAuditorRequest);
      // Realizar búsqueda en HypeAuditor (producción)
      const discoveryResponse = await service.searchDiscovery(
        hypeAuditorRequest
      );

      // Transformar respuesta al formato del Explorer
      const explorerResponse =
        service.transformHypeAuditorResponseToExplorer(discoveryResponse);

      const endTime = Date.now();
      const searchTime = endTime - startTime;

      // Agregar metadatos de tiempo
      explorerResponse.metadata = {
        ...explorerResponse.metadata,
        searchTime,
        filtersApplied:
          HypeAuditorDiscoveryController.getAppliedFilters(filters),
      };

      res.json(explorerResponse);
    } catch (error: any) {
      const endTime = Date.now();
      const searchTime = endTime - startTime;

      res.status(400).json({
        success: false,
        error: error.message,
        provider: "HypeAuditor Discovery",
        metadata: {
          searchTime,
          error: error.message,
        },
      });
    }
  }

  static async searchSuggestion(req: Request, res: Response) {
    const startTime = Date.now();

    try {
      const { search, st } = req.body;

      // Validar parámetros requeridos
      if (!search) {
        return res.status(400).json({
          success: false,
          error: "El search parameter es requerido",
          provider: "HypeAuditor suggester",
        });
      }

      const service = HypeAuditorDiscoveryController.getDiscoveryService();

      // Realizar búsqueda en HypeAuditor (suggester con query parameters)
      const suggestionResponse = await service.searchSuggestion(search, st);

      // Transformar respuesta al formato del Explorer
      const explorerResponse =
        service.transformHypeAuditorSuggestionToExplorer(suggestionResponse);

      res.json(explorerResponse);
    } catch (error: any) {
      const endTime = Date.now();
      const searchTime = endTime - startTime;

      res.status(400).json({
        success: false,
        error: error.message,
        provider: "HypeAuditor Suggester",
        metadata: {
          searchTime,
          error: error.message,
        },
      });
    }
  }

  /**
   * Búsqueda directa usando parámetros de HypeAuditor
   */
  static async searchDirect(req: Request, res: Response) {
    const startTime = Date.now();

    try {
      const request: DiscoverySearchRequest = req.body;

      // Validar parámetros requeridos
      if (!request.social_network) {
        return res.status(400).json({
          success: false,
          error: "El social_network es requerido",
          provider: "HypeAuditor Discovery",
        });
      }

      const service = HypeAuditorDiscoveryController.getDiscoveryService();

      // Realizar búsqueda directa en HypeAuditor
      const discoveryResponse = await service.searchDiscovery(request);

      const endTime = Date.now();
      const searchTime = endTime - startTime;

      res.json({
        success: true,
        data: discoveryResponse,
        provider: "HypeAuditor Discovery",
        metadata: {
          searchTime,
          filtersApplied: Object.keys(request),
          cacheHit: false,
          mode: "production",
        },
      });
    } catch (error: any) {
      const endTime = Date.now();
      const searchTime = endTime - startTime;

      res.status(400).json({
        success: false,
        error: error.message,
        provider: "HypeAuditor Discovery",
        metadata: {
          searchTime,
          error: error.message,
        },
      });
    }
  }

  /**
   * Búsqueda inteligente (combinación de búsqueda por texto y filtros)
   */
  static async smartSearch(req: Request, res: Response) {
    const startTime = Date.now();

    try {
      const { query, platform, filters = {} } = req.body;

      // Validar parámetros requeridos
      if (!query || !platform) {
        return res.status(400).json({
          success: false,
          error: "Query y platform son requeridos",
          provider: "HypeAuditor Discovery",
        });
      }

      const service = HypeAuditorDiscoveryController.getDiscoveryService();

      // Construir request combinando query y filtros
      const hypeAuditorRequest: DiscoverySearchRequest = {
        social_network: platform,
        search: [query],
        ...filters,
      };

      // Realizar búsqueda en HypeAuditor
      const discoveryResponse = await service.searchDiscovery(
        hypeAuditorRequest
      );

      // Transformar respuesta al formato del Explorer
      const explorerResponse =
        service.transformHypeAuditorResponseToExplorer(discoveryResponse);

      const endTime = Date.now();
      const searchTime = endTime - startTime;

      // Agregar metadatos de tiempo
      explorerResponse.metadata = {
        ...explorerResponse.metadata,
        searchTime,
        filtersApplied: HypeAuditorDiscoveryController.getAppliedFilters({
          platform,
          ...filters,
        }),
      };

      res.json(explorerResponse);
    } catch (error: any) {
      const endTime = Date.now();
      const searchTime = endTime - startTime;

      res.status(400).json({
        success: false,
        error: error.message,
        provider: "HypeAuditor Discovery",
        metadata: {
          searchTime,
          error: error.message,
        },
      });
    }
  }

  /**
   * Obtener taxonomía de categorías
   */
  static async getTaxonomy(req: Request, res: Response) {
    try {
      const service = HypeAuditorDiscoveryController.getDiscoveryService();
      const taxonomy = await service.getTaxonomy();

      res.json({
        success: true,
        data: taxonomy,
        provider: "HypeAuditor Discovery",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: "HypeAuditor Discovery",
      });
    }
  }

  /**
   * Buscar posts por keywords
   */
  static async searchKeywordsPosts(req: Request, res: Response) {
    try {
      const { socialNetwork, contentIds } = req.query;

      if (!socialNetwork || !contentIds) {
        return res.status(400).json({
          success: false,
          error: "socialNetwork y contentIds son requeridos",
          provider: "HypeAuditor Discovery",
        });
      }

      const service = HypeAuditorDiscoveryController.getDiscoveryService();
      const contentIdsArray = (
        Array.isArray(contentIds)
          ? contentIds
          : (contentIds as string).split(",")
      ).map(String);
      const posts = await service.searchKeywordsPosts(
        socialNetwork as string,
        contentIdsArray
      );

      res.json({
        success: true,
        data: posts,
        provider: "HypeAuditor Discovery",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: "HypeAuditor Discovery",
      });
    }
  }

  /**
   * Health check del servicio
   */
  static async healthCheck(req: Request, res: Response) {
    try {
      const service = HypeAuditorDiscoveryController.getDiscoveryService();

      // Test actual API connection
      const apiTest = { working: false, error: null as any };
      try {
        const testResult = await service.searchDiscovery({
          social_network: "instagram",
          page: 1,
          subscribers_count: { from: 10000, to: 50000 },
        });
        apiTest.working = !!testResult;
      } catch (error: any) {
        apiTest.error = error.message;
      }

      res.json({
        success: true,
        status: "ok",
        message: "HypeAuditor Discovery service is running",
        provider: "HypeAuditor Discovery",
        timestamp: new Date().toISOString(),
        apiTest,
        env: {
          hasClientId: !!process.env.HYPEAUDITOR_CLIENT_ID,
          hasToken: !!process.env.HYPEAUDITOR_API_TOKEN,
          nodeEnv: process.env.NODE_ENV,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        provider: "HypeAuditor Discovery",
      });
    }
  }

  /**
   * Obtener estadísticas de uso
   */
  static async getUsageStats(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          status: "operational",
          message: "Usage stats not available",
        },
        provider: "HypeAuditor Discovery",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: "HypeAuditor Discovery",
      });
    }
  }

  /**
   * Helper para obtener filtros aplicados
   */
  private static getAppliedFilters(filters: any): string[] {
    const applied: string[] = [];

    if (filters.platform) applied.push("platform");
    if (filters.search && filters.search.length > 0) applied.push("search");
    if (filters.subscribers_count) applied.push("subscribers_count");
    if (filters.er) applied.push("er");
    if (filters.audience_geo) applied.push("audience_geo");
    if (filters.interests) applied.push("interests");
    if (filters.categories) applied.push("categories");
    if (filters.account_type) applied.push("account_type");
    if (filters.verified !== undefined) applied.push("verified");
    if (filters.has_contacts !== undefined) applied.push("has_contacts");
    if (filters.has_launched_advertising !== undefined)
      applied.push("has_launched_advertising");
    if (filters.aqs) applied.push("aqs");
    if (filters.cqs) applied.push("cqs");
    if (filters.sort) applied.push("sort");
    if (filters.page) applied.push("page");

    return applied;
  }
}

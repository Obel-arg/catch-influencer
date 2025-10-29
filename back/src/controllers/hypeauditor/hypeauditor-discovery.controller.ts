import { Request, Response } from 'express';
import {
  HypeAuditorDiscoveryService,
  ExplorerFilters,
  DiscoverySearchRequest,
} from '../../services/hypeauditor/hypeauditor-discovery.service';

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
          error: 'La plataforma es requerida',
          provider: 'HypeAuditor Discovery',
        });
      }

      const service = HypeAuditorDiscoveryController.getDiscoveryService();
      console.log('hypeAuditorRequest', filters);
      // Transformar filtros del Explorer a formato HypeAuditor
      const hypeAuditorRequest =
        service.transformExplorerFiltersToHypeAuditor(filters);

      console.log('hypeAuditorRequest', hypeAuditorRequest);
      // Realizar búsqueda en HypeAuditor (producción)
      const discoveryResponse = await service.searchDiscovery(
        hypeAuditorRequest,
      );

      console.log('######################## DATA ########################');
      console.log(
        'discoveryResponse',
        discoveryResponse.result.search_results[2],
      );
      console.log(
        'discoveryResponse',
        discoveryResponse.result.search_results[2].features,
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
        provider: 'HypeAuditor Discovery',
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
          error: 'El search parameter es requerido',
          provider: 'HypeAuditor suggester',
        });
      }

      const service = HypeAuditorDiscoveryController.getDiscoveryService();

      // Realizar búsqueda en HypeAuditor (suggester con query parameters)
      const suggestionResponse = await service.searchSuggestion(search, st);
      console.log(
        '######################## SUGGESTION DATA ########################',
      );
      console.log('discoveryResponse', suggestionResponse);

      // Transformar respuesta al formato del Explorer
      const explorerResponse =
        service.transformHypeAuditorSuggestionToExplorer(suggestionResponse);
      console.log('explorerResponse', explorerResponse);

      res.json(explorerResponse);
    } catch (error: any) {
      const endTime = Date.now();
      const searchTime = endTime - startTime;

      res.status(400).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor Suggester',
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
          error: 'El social_network es requerido',
          provider: 'HypeAuditor Discovery',
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
        provider: 'HypeAuditor Discovery',
        metadata: {
          searchTime,
          filtersApplied: Object.keys(request),
          cacheHit: false,
          mode: 'production',
        },
      });
    } catch (error: any) {
      const endTime = Date.now();
      const searchTime = endTime - startTime;

      res.status(400).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor Discovery',
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
          error: 'Query y platform son requeridos',
          provider: 'HypeAuditor Discovery',
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
        hypeAuditorRequest,
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
        provider: 'HypeAuditor Discovery',
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
        provider: 'HypeAuditor Discovery',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor Discovery',
      });
    }
  }

  /**
   * Buscar posts por keywords
   */
  static async searchKeywordsPosts(req: Request, res: Response) {
    try {
      const { keywords, platform, limit = 10 } = req.query;

      if (!keywords || !platform) {
        return res.status(400).json({
          success: false,
          error: 'Keywords y platform son requeridos',
          provider: 'HypeAuditor Discovery',
        });
      }

      const service = HypeAuditorDiscoveryController.getDiscoveryService();
      const posts = await service.searchKeywordsPosts(
        keywords as string,
        platform as string,
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: posts,
        provider: 'HypeAuditor Discovery',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor Discovery',
      });
    }
  }

  /**
   * Health check del servicio
   */
  static async healthCheck(req: Request, res: Response) {
    try {
      const service = HypeAuditorDiscoveryController.getDiscoveryService();
      const health = await service.healthCheck();

      res.json({
        success: true,
        data: health,
        provider: 'HypeAuditor Discovery',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor Discovery',
      });
    }
  }

  /**
   * Obtener estadísticas de uso
   */
  static async getUsageStats(req: Request, res: Response) {
    try {
      const service = HypeAuditorDiscoveryController.getDiscoveryService();
      const stats = await service.getUsageStats();

      res.json({
        success: true,
        data: stats,
        provider: 'HypeAuditor Discovery',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor Discovery',
      });
    }
  }

  /**
   * Helper para obtener filtros aplicados
   */
  private static getAppliedFilters(filters: any): string[] {
    const applied: string[] = [];

    if (filters.platform) applied.push('platform');
    if (filters.search && filters.search.length > 0) applied.push('search');
    if (filters.subscribers_count) applied.push('subscribers_count');
    if (filters.er) applied.push('er');
    if (filters.audience_geo) applied.push('audience_geo');
    if (filters.interests) applied.push('interests');
    if (filters.categories) applied.push('categories');
    if (filters.account_type) applied.push('account_type');
    if (filters.verified !== undefined) applied.push('verified');
    if (filters.has_contacts !== undefined) applied.push('has_contacts');
    if (filters.has_launched_advertising !== undefined)
      applied.push('has_launched_advertising');
    if (filters.aqs) applied.push('aqs');
    if (filters.cqs) applied.push('cqs');
    if (filters.sort) applied.push('sort');
    if (filters.page) applied.push('page');

    return applied;
  }
}

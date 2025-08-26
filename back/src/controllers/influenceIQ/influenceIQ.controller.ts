import { Request, Response } from 'express';
import { influenceIQService } from '../../services/influenceIQ/influenceIQ.service';

/**
 * Controlador para la API de InfluencIQ
 */
export class InfluenceIQController {
  
  /**
   * Búsqueda de influencers usando InfluencIQ
   * POST /influenceIQ/search
   */
  static async searchInfluencers(req: Request, res: Response) {
    try {
      const { filters, platform = 'instagram', page = 1, limit = 10 } = req.body;

      console.log(`🔍 [INFLUENCEIQ CONTROLLER] Búsqueda solicitada - plataforma: ${platform}`);

      const result = await influenceIQService.searchInfluencers(
        filters,
        platform,
        page,
        limit
      );

      res.json({
        success: true,
        ...result,
        provider: 'InfluencIQ'
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error en búsqueda:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }

  /**
   * Búsqueda inteligente usando InfluencIQ
   * POST /influenceIQ/smart-search
   */
  static async smartSearch(req: Request, res: Response) {
    try {
      const { query, platform = 'instagram' } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Query de búsqueda es requerido',
          provider: 'InfluencIQ'
        });
      }

      console.log(`🧠 [INFLUENCEIQ CONTROLLER] Búsqueda inteligente - query: "${query}"`);

      const result = await influenceIQService.smartSearch(query, platform);

      res.json({
        success: true,
        ...result,
        provider: 'InfluencIQ',
        metadata: {
          query,
          platform,
          searchType: 'smart',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error en búsqueda inteligente:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }

  /**
   * Búsqueda por filtros avanzados usando InfluencIQ
   * POST /influenceIQ/explorer-search
   */
  static async explorerSearch(req: Request, res: Response) {
    console.log('🔍 [InfluenceIQ Controller] explorerSearch called');
    console.log('🔍 [InfluenceIQ Controller] Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 [InfluenceIQ Controller] Request query:', JSON.stringify(req.query, null, 2));
    
    try {
      const filters = req.body;
      console.log('🔍 [InfluenceIQ Controller] Filters received:', JSON.stringify(filters, null, 2));
      
      const result = await influenceIQService.explorerSearch(filters);
      console.log('🔍 [InfluenceIQ Controller] Service result:', JSON.stringify(result, null, 2));
      
      res.json(result);
    } catch (error) {
      console.error('❌ [InfluenceIQ Controller] Error in explorerSearch:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error en la búsqueda de influencers',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtener insights de un influencer específico
   * GET /influenceIQ/insights/:username
   */
  static async getInfluencerInsights(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const { platform = 'instagram' } = req.query;

      if (!username) {
        return res.status(400).json({
          success: false,
          error: 'Username es requerido',
          provider: 'InfluencIQ'
        });
      }

      console.log(`📊 [INFLUENCEIQ CONTROLLER] Obteniendo insights para @${username}`);

      const result = await influenceIQService.getInfluencerInsights(
        username,
        platform as 'instagram' | 'youtube' | 'tiktok'
      );

      res.json({
        success: true,
        ...result,
        provider: 'InfluencIQ'
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error obteniendo insights:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }

  /**
   * Obtener datos básicos de un influencer
   * GET /influenceIQ/basic/:username
   */
  static async getBasicInfluencerData(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const { platform = 'instagram' } = req.query;

      if (!username) {
        return res.status(400).json({
          success: false,
          error: 'Username es requerido',
          provider: 'InfluencIQ'
        });
      }

      console.log(`📋 [INFLUENCEIQ CONTROLLER] Obteniendo datos básicos para @${username}`);

      const result = await influenceIQService.getBasicInfluencerData(
        username,
        platform as 'instagram' | 'youtube' | 'tiktok'
      );

      res.json({
        success: true,
        data: result,
        provider: 'InfluencIQ'
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error obteniendo datos básicos:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }

  /**
   * Obtener datos completos de un influencer
   * GET /influenceIQ/full/:username
   */
  static async getFullInfluencerData(req: Request, res: Response) {
    try {
      const { username } = req.params;
      const { platform = 'instagram' } = req.query;

      if (!username) {
        return res.status(400).json({
          success: false,
          error: 'Username es requerido',
          provider: 'InfluencIQ'
        });
      }

      console.log(`📊 [INFLUENCEIQ CONTROLLER] Obteniendo datos completos para @${username}`);

      const result = await influenceIQService.getFullInfluencerData(
        username,
        platform as 'instagram' | 'youtube' | 'tiktok'
      );

      res.json({
        success: true,
        data: result,
        provider: 'InfluencIQ'
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error obteniendo datos completos:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }

  /**
   * Verificar estado de la API de InfluencIQ
   * GET /influenceIQ/status
   */
  static async checkApiStatus(req: Request, res: Response) {
    try {
      console.log(`🔍 [INFLUENCEIQ CONTROLLER] Verificando estado de la API`);

      const status = await influenceIQService.checkApiStatus();

      res.json({
        success: true,
        ...status,
        provider: 'InfluencIQ',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error verificando estado:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }

  /**
   * Obtener estadísticas de la API
   * GET /influenceIQ/stats
   */
  static async getApiStats(req: Request, res: Response) {
    try {
      console.log(`📊 [INFLUENCEIQ CONTROLLER] Obteniendo estadísticas`);

      const stats = await influenceIQService.getApiStats();

      res.json({
        success: true,
        ...stats,
        provider: 'InfluencIQ'
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }

  /**
   * Endpoint de prueba para verificar la configuración
   * GET /influenceIQ/test
   */
  static async testConnection(req: Request, res: Response) {
    try {
      console.log(`🧪 [INFLUENCEIQ CONTROLLER] Probando conexión`);

      // Hacer una búsqueda de prueba
      const testFilters = {
        followers: {
          left_number: 1000,
          right_number: 10000
        }
      };

      const searchResult = await influenceIQService.searchInfluencers(
        testFilters,
        'instagram',
        1,
        1
      );

      res.json({
        success: true,
        message: 'Conexión a InfluencIQ exitosa',
        provider: 'InfluencIQ',
        testResult: {
          hasData: searchResult.data && searchResult.data.length > 0,
          totalResults: searchResult.total || 0
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error en prueba de conexión:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtener datos de ubicaciones geográficas
   * GET /influenceIQ/support/geo
   */
  static async getSupportGeo(req: Request, res: Response) {
    try {
      console.log(`🌍 [INFLUENCEIQ CONTROLLER] Obteniendo datos geográficos`);

      const result = await influenceIQService.getSupportData('geo');

      res.json({
        success: true,
        data: result,
        provider: 'InfluencIQ'
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error obteniendo datos geográficos:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }

  /**
   * Obtener datos de intereses/categorías
   * GET /influenceIQ/support/interests
   */
  static async getSupportInterests(req: Request, res: Response) {
    try {
      console.log(`🏷️ [INFLUENCEIQ CONTROLLER] Obteniendo datos de intereses`);

      const result = await influenceIQService.getSupportData('interests');

      res.json({
        success: true,
        data: result,
        provider: 'InfluencIQ'
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error obteniendo datos de intereses:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }

  /**
   * Obtener datos de idiomas
   * GET /influenceIQ/support/languages
   */
  static async getSupportLanguages(req: Request, res: Response) {
    try {
      console.log(`🌐 [INFLUENCEIQ CONTROLLER] Obteniendo datos de idiomas`);

      const result = await influenceIQService.getSupportData('languages');

      res.json({
        success: true,
        data: result,
        provider: 'InfluencIQ'
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error obteniendo datos de idiomas:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }

  /**
   * Exportar datos de influencers
   * POST /influenceIQ/export
   */
  static async exportData(req: Request, res: Response) {
    try {
      const { filters, platform = 'instagram' } = req.body;

      console.log(`📤 [INFLUENCEIQ CONTROLLER] Exportando datos - plataforma: ${platform}`);

      const result = await influenceIQService.exportData(filters, platform);

      res.json({
        success: true,
        data: result,
        provider: 'InfluencIQ'
      });
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ CONTROLLER] Error exportando datos:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        provider: 'InfluencIQ'
      });
    }
  }
}

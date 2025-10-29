import { Request, Response } from 'express';
import { InfluencerExtendedService } from '../../services/influencer/influencer-extended.service';

export class InfluencerExtendedController {
  private influencerExtendedService: InfluencerExtendedService;

  constructor() {
    this.influencerExtendedService = new InfluencerExtendedService();
  }

  /**
   * Obtiene datos extendidos existentes sin hacer nuevas peticiones a APIs
   * GET /influencer/extended/read/:youtubeId
   */
  async getExistingExtendedData(req: Request, res: Response): Promise<void> {
    try {
      const { youtubeId } = req.params;

      if (!youtubeId) {
        res.status(400).json({
          success: false,
          error: 'youtubeId es requerido'
        });
        return;
      }



      const existingData = await this.influencerExtendedService.getExistingExtendedData(youtubeId);

      res.json({
        success: true,
        data: existingData,
        message: 'Datos extendidos obtenidos desde base de datos'
      });

    } catch (error: any) {
      console.error('❌ Error en getExistingExtendedData:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Obtiene datos extendidos de un influencer y los guarda en influencers_extended
   * GET /influencer/full-extend/:youtubeId?instagramId=X&tiktokId=Y
   */
  async getFullExtendedInfluencerData(req: Request, res: Response): Promise<void> {
    try {
      const { youtubeId } = req.params;
      const { instagramId, tiktokId } = req.query;

      if (!youtubeId) {
        res.status(400).json({
          success: false,
          error: 'youtubeId es requerido'
        });
        return;
      }

      const result = await this.influencerExtendedService.getFullExtendedData({
        youtubeId,
        instagramId: instagramId as string,
        tiktokId: tiktokId as string
      });
     
      res.json({
        success: true,
        data: result,
        message: 'Datos extendidos obtenidos y guardados exitosamente'
      });

    } catch (error: any) {
      console.error('❌ Error en getFullExtendedInfluencerData:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Obtiene el estado de sincronización de datos extendidos de un influencer
   * GET /influencer/extended/status/:influencerId
   */
  async getExtendedDataStatus(req: Request, res: Response): Promise<void> {
    try {
      const { influencerId } = req.params;

      if (!influencerId) {
        res.status(400).json({
          success: false,
          error: 'influencerId es requerido'
        });
        return;
      }

      const status = await this.influencerExtendedService.getExtendedDataStatus(influencerId);

      res.json({
        success: true,
        data: status
      });

    } catch (error: any) {
      console.error('❌ Error en getExtendedDataStatus:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Fuerza la re-sincronización de datos extendidos
   * POST /influencer/extended/resync/:influencerId
   */
  async resyncExtendedData(req: Request, res: Response): Promise<void> {
    try {
      const { influencerId } = req.params;
      const { platforms } = req.body; // ['youtube', 'instagram', 'tiktok']

      if (!influencerId) {
        res.status(400).json({
          success: false,
          error: 'influencerId es requerido'
        });
        return;
      }

      const result = await this.influencerExtendedService.resyncExtendedData(influencerId, platforms);

      res.json({
        success: true,
        data: result,
        message: 'Re-sincronización iniciada exitosamente'
      });

    } catch (error: any) {
      console.error('❌ Error en resyncExtendedData:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }
} 
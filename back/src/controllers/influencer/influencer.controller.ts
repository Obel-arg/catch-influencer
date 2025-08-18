import { Request, Response } from 'express';
import { InfluencerService } from '../../services/influencer/influencer.service';
import { InfluencerUpdateDTO } from '../../dto/influencer/influencer-update.dto';

export class InfluencerController {
  private influencerService: InfluencerService;

  constructor() {
    this.influencerService = new InfluencerService();
  }

  async getAll(req: Request, res: Response) {
    try {
      const influencers = await this.influencerService.getAll();
      res.json(influencers);
    } catch (error) {
      console.error('Error getting all influencers:', error);
      res.status(500).json({ error: 'Error getting all influencers' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const influencer = await this.influencerService.getById(id);
      if (!influencer) {
        return res.status(404).json({ error: 'Influencer not found' });
      }
      res.json(influencer);
    } catch (error) {
      console.error('Error getting influencer:', error);
      res.status(500).json({ error: 'Error getting influencer' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const influencer = await this.influencerService.create(req.body);
      res.status(201).json(influencer);
    } catch (error) {
      console.error('Error creating influencer:', error);
      res.status(500).json({ error: 'Error creating influencer' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const influencer = await this.influencerService.update(id, req.body);
      if (!influencer) {
        return res.status(404).json({ error: 'Influencer not found' });
      }
      res.json(influencer);
    } catch (error) {
      console.error('Error updating influencer:', error);
      res.status(500).json({ error: 'Error updating influencer' });
    }
  }

  async updateInfluencer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: InfluencerUpdateDTO = req.body;
      const influencer = await this.influencerService.update(id, updateData);
      res.json(influencer);
    } catch (error) {
      console.error('Error al actualizar influencer:', error);
      res.status(500).json({ error: 'Error al actualizar influencer' });
    }
  }

  /**
   * Actualiza los datos de un influencer desde las APIs externas
   * POST /influencers/:id/refresh
   */
  async refreshInfluencerData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      console.log(`🔄 [CONTROLLER] Iniciando refresh de datos para influencer ${id}`);
      
      const result = await this.influencerService.refreshInfluencerData(id);
      
      res.json({
        success: true,
        data: result,
        message: 'Datos del influencer actualizados exitosamente'
      });
      
    } catch (error: any) {
      console.error('❌ [CONTROLLER] Error al refrescar datos del influencer:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.influencerService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting influencer:', error);
      res.status(500).json({ error: 'Error deleting influencer' });
    }
  }

  async getFullData(req: Request, res: Response) {
    try {
      const { youtubeId } = req.params;
      const { instagramId, tiktokId } = req.query;
      const data = await this.influencerService.getFullInfluencerData({
        youtubeId,
        instagramId: instagramId as string,
        tiktokId: tiktokId as string,
      });
      if (!data) {
        return res.status(404).json({ error: 'Influencer not found' });
      }
      res.json(data);
    } catch (error) {
      console.error('Error getting full influencer data:', error);
      res.status(500).json({ error: 'Error getting full influencer data' });
    }
  }

  async searchLocal(req: Request, res: Response) {
    try {
      const {
        platform,
        category,
        location,
        minFollowers,
        maxFollowers,
        minEngagement,
        maxEngagement,
        query,
        page,
        size,
      } = req.query;

      const filters = {
        platform: platform as string,
        category: category as string,
        location: location as string,
        minFollowers: minFollowers ? Number(minFollowers) : undefined,
        maxFollowers: maxFollowers ? Number(maxFollowers) : undefined,
        minEngagement: minEngagement ? Number(minEngagement) : undefined,
        maxEngagement: maxEngagement ? Number(maxEngagement) : undefined,
        query: query as string,
        page: page ? Number(page) : undefined,
        size: size ? Number(size) : undefined,
      };

      const result = await this.influencerService.searchInfluencers(filters);
      res.json(result);
    } catch (error) {
      console.error('Error searching influencers:', error);
      res.status(500).json({ error: 'Error searching influencers' });
    }
  }

  /**
   * Obtiene datos básicos de las plataformas disponibles sin guardar en BD
   * GET /influencers/platforms/basic-data
   */
  async getBasicPlatformData(req: Request, res: Response) {
    try {
      const { youtubeId, instagramId, tiktokId } = req.query;

      console.log(`🔄 [CONTROLLER] Obteniendo datos básicos de plataformas:`, { youtubeId, instagramId, tiktokId });

      const data = await this.influencerService.getBasicPlatformData({
        youtubeId: youtubeId as string,
        instagramId: instagramId as string,
        tiktokId: tiktokId as string,
      });

      if (!data) {
        return res.status(404).json({ error: 'No se encontraron datos de plataformas' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error al obtener datos básicos de plataformas:', error);
      res.status(500).json({ error: 'Error al obtener datos básicos de plataformas' });
    }
  }
} 
import { Request, Response } from 'express';
import { InfluencerService } from '../../services/influencer';
import { 
  InfluencerCreateDTO, 
  InfluencerUpdateDTO,
  InfluencerTeamCreateDTO,
  InfluencerTeamUpdateDTO,
  InfluencerCampaignCreateDTO,
  InfluencerCampaignUpdateDTO
} from '../../models/influencer/influencer.model';

export class InfluencerController {
  private influencerService: InfluencerService;

  constructor() {
    this.influencerService = new InfluencerService();
  }

  async createInfluencer(req: Request, res: Response) {
    try {
      const influencerData = req.body;

      const result = await this.influencerService.createInfluencer(influencerData);

      if (result.duplicate) {
        // Si es un duplicado, retornar 409 Conflict con información del influencer existente
        return res.status(409).json({
          success: false,
          duplicate: true,
          existingInfluencer: result.existingInfluencer,
          message: result.message
        });
      }

      // Si se creó exitosamente
      res.status(201).json({
        success: true,
        duplicate: false,
        influencer: result.influencer,
        message: result.message
      });

    } catch (error: any) {
      console.error('❌ [CONTROLLER] Error al crear influencer:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  async getInfluencerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const influencer = await this.influencerService.getById(id);
      
      if (!influencer) {
        return res.status(404).json({ error: 'Influencer no encontrado' });
      }

      res.json(influencer);
    } catch (error) {
      console.error('Error al obtener influencer:', error);
      res.status(500).json({ error: 'Error al obtener influencer' });
    }
  }

  async getInfluencersByTeam(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      // TODO: Implement team filtering in service
      const influencers = await this.influencerService.getAll();
      res.json(influencers);
    } catch (error) {
      console.error('Error al obtener influencers:', error);
      res.status(500).json({ error: 'Error al obtener influencers' });
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

  async deleteInfluencer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.influencerService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar influencer:', error);
      res.status(500).json({ error: 'Error al eliminar influencer' });
    }
  }

  async addToTeam(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const teamData: InfluencerTeamCreateDTO = {
        ...req.body,
        team_id: teamId
      };
      // TODO: Implement addToTeam in service
      res.status(501).json({ error: 'Team management not implemented yet' });
    } catch (error) {
      console.error('Error al agregar a equipo:', error);
      res.status(500).json({ error: 'Error al agregar a equipo' });
    }
  }

  async updateTeamStatus(req: Request, res: Response) {
    try {
      const { teamId, influencerId } = req.params;
      const updateData: InfluencerTeamUpdateDTO = req.body;
      // TODO: Implement updateTeamStatus in service
      res.status(501).json({ error: 'Team management not implemented yet' });
    } catch (error) {
      console.error('Error al actualizar estado en equipo:', error);
      res.status(500).json({ error: 'Error al actualizar estado en equipo' });
    }
  }

  async removeFromTeam(req: Request, res: Response) {
    try {
      const { teamId, influencerId } = req.params;
      // TODO: Implement removeFromTeam in service
      res.status(501).json({ error: 'Team management not implemented yet' });
    } catch (error) {
      console.error('Error al remover de equipo:', error);
      res.status(500).json({ error: 'Error al remover de equipo' });
    }
  }

  async addToCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const campaignData: InfluencerCampaignCreateDTO = {
        ...req.body,
        campaign_id: campaignId
      };
      // TODO: Implement addToCampaign in service
      res.status(501).json({ error: 'Campaign management not implemented yet' });
    } catch (error) {
      console.error('Error al agregar a campaña:', error);
      res.status(500).json({ error: 'Error al agregar a campaña' });
    }
  }

  async updateCampaignStatus(req: Request, res: Response) {
    try {
      const { campaignId, influencerId } = req.params;
      const updateData: InfluencerCampaignUpdateDTO = req.body;
      // TODO: Implement updateCampaignStatus in service
      res.status(501).json({ error: 'Campaign management not implemented yet' });
    } catch (error) {
      console.error('Error al actualizar estado en campaña:', error);
      res.status(500).json({ error: 'Error al actualizar estado en campaña' });
    }
  }

  async removeFromCampaign(req: Request, res: Response) {
    try {
      const { campaignId, influencerId } = req.params;
      // TODO: Implement removeFromCampaign in service
      res.status(501).json({ error: 'Campaign management not implemented yet' });
    } catch (error) {
      console.error('Error al remover de campaña:', error);
      res.status(500).json({ error: 'Error al remover de campaña' });
    }
  }

  async getInfluencerStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // TODO: Implement getInfluencerStats in service
      res.status(501).json({ error: 'Stats management not implemented yet' });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }

  async updateInfluencerStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = req.body;
      // TODO: Implement updateInfluencerStats in service
      res.status(501).json({ error: 'Stats management not implemented yet' });
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      res.status(500).json({ error: 'Error al actualizar estadísticas' });
    }
  }

  /**
   * Obtiene datos básicos de las plataformas disponibles sin guardar en BD
   * GET /influencers/platform-data
   */
  async getBasicPlatformData(req: Request, res: Response) {
    try {
      const { youtubeId, instagramId, tiktokId } = req.query;

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

  async getFullInfluencerData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { instagramId, tiktokId } = req.query;

      // Determinar el tipo de ID y extraer los otros IDs
      let youtubeId: string | undefined;
      let extractedInstagramId: string | undefined;
      let extractedTiktokId: string | undefined;

      if (this.isYouTubeId(id)) {
        youtubeId = id;
        extractedInstagramId = instagramId as string;
        extractedTiktokId = tiktokId as string;
      } else if (this.isInstagramId(id)) {
        extractedInstagramId = id;
        youtubeId = req.query.youtubeId as string;
        extractedTiktokId = tiktokId as string;
      } else if (this.isTikTokId(id)) {
        extractedTiktokId = id;
        youtubeId = req.query.youtubeId as string;
        extractedInstagramId = instagramId as string;
      } else {
        // Si no es un ID reconocido, asumir que es YouTube
        youtubeId = id;
        extractedInstagramId = instagramId as string;
        extractedTiktokId = tiktokId as string;
      }

      const data = await this.influencerService.getFullInfluencerData({
        youtubeId,
        instagramId: extractedInstagramId,
        tiktokId: extractedTiktokId,
      });

      if (!data) {
        return res.status(404).json({ error: 'Influencer no encontrado' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error al obtener datos completos del influencer:', error);
      res.status(500).json({ error: 'Error al obtener datos completos del influencer' });
    }
  }

  /**
   * Actualiza los datos de un influencer desde las APIs externas
   * POST /influencers/:id/refresh
   */
  async refreshInfluencerData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
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
  
  // 🔧 FUNCIONES AUXILIARES PARA DETECTAR TIPO DE ID
  private isYouTubeId(id: string): boolean {
    // YouTube IDs suelen ser 24 caracteres alfanuméricos
    return /^[a-zA-Z0-9_-]{24}$/.test(id) || /^UC[a-zA-Z0-9_-]{22}$/.test(id);
  }
  
  private isInstagramId(id: string): boolean {
    // Instagram usernames suelen ser palabras sin espacios, guiones o puntos
    return /^[a-zA-Z0-9._]{1,30}$/.test(id) && !this.isYouTubeId(id) && !this.isTikTokId(id);
  }
  
  private isTikTokId(id: string): boolean {
    // TikTok usernames suelen empezar con @ o ser nombres simples
    return id.startsWith('@') || (/^[a-zA-Z0-9._]{1,24}$/.test(id) && !this.isYouTubeId(id));
  }

  async getAllInfluencers(req: Request, res: Response) {
    try {
      const influencers = await this.influencerService.getAll();
      res.json(influencers);
    } catch (error) {
      console.error('Error al obtener influencers:', error);
      res.status(500).json({ error: 'Error al obtener influencers' });
    }
  }

  /**
   * Búsqueda local de influencers con filtros avanzados
   * GET /influencers/search/local
   */
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
} 
import { Request, Response } from 'express';
import { CampaignService } from '../../services/campaign';
import { 
  CampaignCreateDTO, 
  CampaignUpdateDTO,
  CampaignInfluencerCreateDTO,
  CampaignInfluencerUpdateDTO,
  CampaignContentCreateDTO,
  CampaignContentUpdateDTO
} from '../../models/campaign/campaign.model';

export class CampaignController {
  private campaignService: CampaignService;

  constructor() {
    this.campaignService = new CampaignService();
  }

  async createCampaign(req: Request, res: Response) {
    try {
      const data: CampaignCreateDTO = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Obtener el token del header Authorization
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      const campaign = await this.campaignService.createCampaign(data, userId, token);
      res.status(201).json(campaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: 'Error creating campaign' });
    }
  }

  async getCampaignById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const campaign = await this.campaignService.getCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      console.error('Error getting campaign:', error);
      res.status(500).json({ error: 'Error getting campaign' });
    }
  }

  async getCampaignsByOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const campaigns = await this.campaignService.getCampaignsByOrganization(organizationId);
      res.json(campaigns);
    } catch (error) {
      console.error('Error getting organization campaigns:', error);
      res.status(500).json({ error: 'Error getting organization campaigns' });
    }
  }

  async getMyCampaigns(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const campaigns = await this.campaignService.getMyCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error('Error getting my campaigns:', error);
      res.status(500).json({ error: 'Error getting my campaigns' });
    }
  }

  async getMyCampaignsWithMetrics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const campaigns = await this.campaignService.getMyCampaignsWithMetrics(userId);
      
      res.json(campaigns);
    } catch (error) {
      console.error('❌ [CONTROLLER] Error getting campaigns with metrics:', error);
      res.status(500).json({ error: 'Error getting campaigns with metrics' });
    }
  }

  async getCampaignsByTeam(req: Request, res: Response) {
    try {
      const { teamId } = req.params;
      const campaigns = await this.campaignService.getCampaignsByTeam(teamId);
      res.json(campaigns);
    } catch (error) {
      console.error('Error al obtener campañas:', error);
      res.status(500).json({ error: 'Error al obtener campañas' });
    }
  }

  async updateCampaign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: CampaignUpdateDTO = req.body;
      const campaign = await this.campaignService.updateCampaign(id, data);
      res.json(campaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ error: 'Error updating campaign' });
    }
  }

  async deleteCampaign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.campaignService.deleteCampaign(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ error: 'Error deleting campaign' });
    }
  }

  async addInfluencer(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const influencerData: CampaignInfluencerCreateDTO = {
        ...req.body,
        campaign_id: campaignId
      };
      const influencer = await this.campaignService.addInfluencer(influencerData);
      res.status(201).json(influencer);
    } catch (error) {
      console.error('Error al agregar influencer:', error);
      res.status(500).json({ error: 'Error al agregar influencer' });
    }
  }

  async updateInfluencerStatus(req: Request, res: Response) {
    try {
      const { campaignId, influencerId } = req.params;
      const updateData: CampaignInfluencerUpdateDTO = req.body;
      const influencer = await this.campaignService.updateInfluencerStatus(campaignId, influencerId, updateData);
      res.json(influencer);
    } catch (error) {
      console.error('Error al actualizar estado del influencer:', error);
      res.status(500).json({ error: 'Error al actualizar estado del influencer' });
    }
  }

  async removeInfluencer(req: Request, res: Response) {
    try {
      const { campaignId, influencerId } = req.params;
      
     

      await this.campaignService.removeInfluencer(campaignId, influencerId);
      
      res.status(204).send();
      
    } catch (error) {
      console.error('❌ [CampaignController] Error al remover influencer:', error);
      res.status(500).json({ error: 'Error al remover influencer' });
    }
  }

  async createContent(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const contentData: CampaignContentCreateDTO = {
        ...req.body,
        campaign_id: campaignId
      };
      const content = await this.campaignService.createContent(contentData);
      res.status(201).json(content);
    } catch (error) {
      console.error('Error al crear contenido:', error);
      res.status(500).json({ error: 'Error al crear contenido' });
    }
  }

  async updateContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: CampaignContentUpdateDTO = req.body;
      const content = await this.campaignService.updateContent(id, updateData);
      res.json(content);
    } catch (error) {
      console.error('Error al actualizar contenido:', error);
      res.status(500).json({ error: 'Error al actualizar contenido' });
    }
  }

  async getCampaignContent(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const content = await this.campaignService.getCampaignContent(campaignId);
      res.json(content);
    } catch (error) {
      console.error('Error al obtener contenido:', error);
      res.status(500).json({ error: 'Error al obtener contenido' });
    }
  }

  async getInfluencerContent(req: Request, res: Response) {
    try {
      const { campaignId, influencerId } = req.params;
      const content = await this.campaignService.getInfluencerContent(campaignId, influencerId);
      res.json(content);
    } catch (error) {
      console.error('Error al obtener contenido del influencer:', error);
      res.status(500).json({ error: 'Error al obtener contenido del influencer' });
    }
  }

  async getCampaignsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const campaigns = await this.campaignService.getCampaignsByStatus(status as any);
      res.json(campaigns);
    } catch (error) {
      console.error('Error getting campaigns by status:', error);
      res.status(500).json({ error: 'Error getting campaigns by status' });
    }
  }

  async getCampaignsByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const campaigns = await this.campaignService.getCampaignsByType(type as any);
      res.json(campaigns);
    } catch (error) {
      console.error('Error getting campaigns by type:', error);
      res.status(500).json({ error: 'Error getting campaigns by type' });
    }
  }

  async getActiveCampaigns(req: Request, res: Response) {
    try {
      const campaigns = await this.campaignService.getActiveCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error('Error getting active campaigns:', error);
      res.status(500).json({ error: 'Error getting active campaigns' });
    }
  }

  async getCampaignsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const campaigns = await this.campaignService.getCampaignsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(campaigns);
    } catch (error) {
      console.error('Error getting campaigns by date range:', error);
      res.status(500).json({ error: 'Error getting campaigns by date range' });
    }
  }

  async updateCampaignMetrics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const metrics = req.body;
      const campaign = await this.campaignService.updateCampaignMetrics(id, metrics);
      res.json(campaign);
    } catch (error) {
      console.error('Error updating campaign metrics:', error);
      res.status(500).json({ error: 'Error updating campaign metrics' });
    }
  }

  // 🎯 ENDPOINTS PARA ASIGNACIÓN DE USUARIOS A CAMPAÑAS
  async assignUsersToCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const { userIds } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de IDs de usuarios' });
      }

      await this.campaignService.assignUsersToCampaign(campaignId, userIds);
      res.status(200).json({ message: 'Usuarios asignados exitosamente' });
    } catch (error: any) {
      console.error('Error assigning users to campaign:', error);
      res.status(400).json({ error: error.message || 'Error al asignar usuarios a la campaña' });
    }
  }

  async removeUsersFromCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const { userIds } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de IDs de usuarios' });
      }

      await this.campaignService.removeUsersFromCampaign(campaignId, userIds);
      res.status(200).json({ message: 'Usuarios removidos exitosamente' });
    } catch (error: any) {
      console.error('Error removing users from campaign:', error);
      res.status(400).json({ error: error.message || 'Error al remover usuarios de la campaña' });
    }
  }

  async getCampaignMembers(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const members = await this.campaignService.getCampaignMembers(campaignId);
      res.json(members);
    } catch (error: any) {
      console.error('Error getting campaign members:', error);
      res.status(500).json({ error: error.message || 'Error al obtener miembros de la campaña' });
    }
  }

  async getUserCampaigns(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const campaigns = await this.campaignService.getUserCampaigns(userId);
      res.json(campaigns);
    } catch (error: any) {
      console.error('Error getting user campaigns:', error);
      res.status(500).json({ error: error.message || 'Error al obtener campañas del usuario' });
    }
  }
} 
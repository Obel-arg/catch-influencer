import { Request, Response } from 'express';
import { CampaignInfluencerService } from '../../services/campaign/campaign-influencer.service';
import { CampaignInfluencerCreateDTO, CampaignInfluencerUpdateDTO } from '../../models/campaign/campaign-influencer.model';
import { InfluencerService } from '../../services/influencer';

export class CampaignInfluencerController {
  private campaignInfluencerService: CampaignInfluencerService;
  private influencerService: InfluencerService;

  constructor() {
    this.campaignInfluencerService = new CampaignInfluencerService();
    this.influencerService = new InfluencerService();
  }

  async createCampaignInfluencer(req: Request, res: Response) {
    try {
      const data: any = req.body;
      const influencerId = data.influencerId;
      const campaignId = req.params.campaignId || data.campaignId;
      if (!influencerId || !campaignId) {
        console.error('❌ [CONTROLLER] Faltan datos requeridos: influencerId o campaignId.', { influencerId, campaignId });
        return res.status(400).json({ error: 'Faltan datos requeridos: influencerId o campaignId.' });
      }
      // Validar que el influencer existe
      let influencer = null;
      try {
        influencer = await this.influencerService.getById(influencerId);
      } catch (e) {
        console.error('❌ [CONTROLLER] Error buscando influencer en la base:', e);
        return res.status(400).json({ error: 'Error buscando influencer en la base', details: e });
      }
      if (!influencer || !influencer.id) {
        console.error('❌ [CONTROLLER] Influencer no encontrado en la base.', { influencerId });
        return res.status(400).json({ error: 'Influencer UUID no encontrado en la base.' });
      }
      // Usar la función robusta SIEMPRE
      let campaignInfluencer = null;
      try {
        campaignInfluencer = await this.campaignInfluencerService.assignInfluencerFromExplorer(
          campaignId,
          influencerId,
          { budget: data.assignedBudget || 0 }
        );
      } catch (e) {
        console.error('❌ [CONTROLLER] Error creando campaign influencer en la base:', e);
        return res.status(500).json({ error: 'Error creando campaign influencer', details: e });
      }
      return res.status(201).json(campaignInfluencer);
    } catch (error) {
      // Log extra: error y payload que falló
      console.error('❌ [CONTROLLER] Error inesperado creando campaign influencer:', error);
      if (typeof error === 'object' && error !== null && 'message' in error) {
        console.error('❌ [CONTROLLER] Mensaje de error:', (error as any).message);
      }
      if (req && req.body) {
        console.error('❌ [CONTROLLER] Payload recibido que causó el error:', req.body);
      }
      res.status(500).json({ error: 'Error inesperado creando campaign influencer' });
    }
  }

  async getCampaignInfluencerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const campaignInfluencer = await this.campaignInfluencerService.getCampaignInfluencerById(id);
      if (!campaignInfluencer) {
        return res.status(404).json({ error: 'Campaign influencer not found' });
      }
      res.json(campaignInfluencer);
    } catch (error) {
      console.error('Error getting campaign influencer:', error);
      res.status(500).json({ error: 'Error getting campaign influencer' });
    }
  }

  async getCampaignInfluencersByCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const campaignInfluencers = await this.campaignInfluencerService.getCampaignInfluencersByCampaign(campaignId);
      res.json(campaignInfluencers);
    } catch (error) {
      console.error('Error getting campaign influencers:', error);
      res.status(500).json({ error: 'Error getting campaign influencers' });
    }
  }

  async getCampaignInfluencersWithDetails(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      
      const campaignInfluencers = await this.campaignInfluencerService.getCampaignInfluencersWithDetailsById(campaignId, token);
      
      

      res.json(campaignInfluencers);
    } catch (error) {
      console.error('❌ [CONTROLLER] Error getting campaign influencers with details:', error);
      res.status(500).json({ error: 'Error getting campaign influencers with details' });
    }
  }

  async getCampaignInfluencersByInfluencer(req: Request, res: Response) {
    try {
      const { influencerId } = req.params;
      const campaignInfluencers = await this.campaignInfluencerService.getCampaignInfluencersByInfluencer(influencerId);
      res.json(campaignInfluencers);
    } catch (error) {
      console.error('Error getting influencer campaigns:', error);
      res.status(500).json({ error: 'Error getting influencer campaigns' });
    }
  }

  async updateCampaignInfluencer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: CampaignInfluencerUpdateDTO = req.body;
      const campaignInfluencer = await this.campaignInfluencerService.updateCampaignInfluencer(id, data);
      res.json(campaignInfluencer);
    } catch (error) {
      console.error('Error updating campaign influencer:', error);
      res.status(500).json({ error: 'Error updating campaign influencer' });
    }
  }

  async deleteCampaignInfluencer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.campaignInfluencerService.deleteCampaignInfluencer(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting campaign influencer:', error);
      res.status(500).json({ error: 'Error deleting campaign influencer' });
    }
  }

  async getCampaignInfluencersByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const campaignInfluencers = await this.campaignInfluencerService.getCampaignInfluencersByStatus(status as any);
      res.json(campaignInfluencers);
    } catch (error) {
      console.error('Error getting campaign influencers by status:', error);
      res.status(500).json({ error: 'Error getting campaign influencers by status' });
    }
  }

  async getCampaignInfluencersByPaymentStatus(req: Request, res: Response) {
    try {
      const { paymentStatus } = req.params;
      const campaignInfluencers = await this.campaignInfluencerService.getCampaignInfluencersByPaymentStatus(paymentStatus as any);
      res.json(campaignInfluencers);
    } catch (error) {
      console.error('Error getting campaign influencers by payment status:', error);
      res.status(500).json({ error: 'Error getting campaign influencers by payment status' });
    }
  }

  async getActiveCampaignInfluencers(req: Request, res: Response) {
    try {
      const campaignInfluencers = await this.campaignInfluencerService.getActiveCampaignInfluencers();
      res.json(campaignInfluencers);
    } catch (error) {
      console.error('Error getting active campaign influencers:', error);
      res.status(500).json({ error: 'Error getting active campaign influencers' });
    }
  }

  async getCampaignInfluencersByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const campaignInfluencers = await this.campaignInfluencerService.getCampaignInfluencersByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(campaignInfluencers);
    } catch (error) {
      console.error('Error getting campaign influencers by date range:', error);
      res.status(500).json({ error: 'Error getting campaign influencers by date range' });
    }
  }

  async checkInfluencerAssignments(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const { influencerIds } = req.body;

      if (!influencerIds || !Array.isArray(influencerIds)) {
        return res.status(400).json({ error: 'influencerIds array is required' });
      }

      const result = await this.campaignInfluencerService.checkMultipleInfluencerAssignments(campaignId, influencerIds);
      res.json(result);
    } catch (error) {
      console.error('Error checking influencer assignments:', error);
      res.status(500).json({ error: 'Error checking influencer assignments' });
    }
  }
} 
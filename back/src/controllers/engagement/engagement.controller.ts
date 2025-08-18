import { Request, Response } from 'express';
import { EngagementService } from '../../services/engagement/engagement.service';
import { EngagementCreateDTO, EngagementUpdateDTO } from '../../models/engagement/engagement.model';

export class EngagementController {
  private engagementService: EngagementService;

  constructor() {
    this.engagementService = new EngagementService();
  }

  async createEngagement(req: Request, res: Response) {
    try {
      const data: EngagementCreateDTO = req.body;
      const engagement = await this.engagementService.createEngagement(data);
      res.status(201).json(engagement);
    } catch (error) {
      console.error('Error creating engagement:', error);
      res.status(500).json({ error: 'Error creating engagement' });
    }
  }

  async getEngagementById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const engagement = await this.engagementService.getEngagementById(id);
      if (!engagement) {
        return res.status(404).json({ error: 'Engagement not found' });
      }
      res.json(engagement);
    } catch (error) {
      console.error('Error getting engagement:', error);
      res.status(500).json({ error: 'Error getting engagement' });
    }
  }

  async getEngagementsByContent(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const engagements = await this.engagementService.getEngagementsByContent(contentId);
      res.json(engagements);
    } catch (error) {
      console.error('Error getting content engagements:', error);
      res.status(500).json({ error: 'Error getting content engagements' });
    }
  }

  async getEngagementsByInfluencer(req: Request, res: Response) {
    try {
      const { influencerId } = req.params;
      const engagements = await this.engagementService.getEngagementsByInfluencer(influencerId);
      res.json(engagements);
    } catch (error) {
      console.error('Error getting influencer engagements:', error);
      res.status(500).json({ error: 'Error getting influencer engagements' });
    }
  }

  async getEngagementsByCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const engagements = await this.engagementService.getEngagementsByCampaign(campaignId);
      res.json(engagements);
    } catch (error) {
      console.error('Error getting campaign engagements:', error);
      res.status(500).json({ error: 'Error getting campaign engagements' });
    }
  }

  async updateEngagement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: EngagementUpdateDTO = req.body;
      const engagement = await this.engagementService.updateEngagement(id, data);
      res.json(engagement);
    } catch (error) {
      console.error('Error updating engagement:', error);
      res.status(500).json({ error: 'Error updating engagement' });
    }
  }

  async deleteEngagement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.engagementService.deleteEngagement(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting engagement:', error);
      res.status(500).json({ error: 'Error deleting engagement' });
    }
  }

  async getEngagementsByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const engagements = await this.engagementService.getEngagementsByType(type as any);
      res.json(engagements);
    } catch (error) {
      console.error('Error getting engagements by type:', error);
      res.status(500).json({ error: 'Error getting engagements by type' });
    }
  }

  async getEngagementsByPlatform(req: Request, res: Response) {
    try {
      const { platform } = req.params;
      const engagements = await this.engagementService.getEngagementsByPlatform(platform as any);
      res.json(engagements);
    } catch (error) {
      console.error('Error getting engagements by platform:', error);
      res.status(500).json({ error: 'Error getting engagements by platform' });
    }
  }

  async getEngagementsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const engagements = await this.engagementService.getEngagementsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(engagements);
    } catch (error) {
      console.error('Error getting engagements by date range:', error);
      res.status(500).json({ error: 'Error getting engagements by date range' });
    }
  }

  async getEngagementMetrics(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const { startDate, endDate } = req.query;

      const metrics = await this.engagementService.calculateEngagementMetrics(
        contentId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(metrics);
    } catch (error) {
      console.error('Error calculating engagement metrics:', error);
      res.status(500).json({ error: 'Error calculating engagement metrics' });
    }
  }
} 
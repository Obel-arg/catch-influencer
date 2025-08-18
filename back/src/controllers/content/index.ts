import { Request, Response } from 'express';
import { ContentService } from '../../services/content';
import { ContentCreateDTO, ContentUpdateDTO, ContentMetricsCreateDTO, ContentMetricsUpdateDTO } from '../../models/content/content.model';

export class ContentController {
  private contentService: ContentService;

  constructor() {
    this.contentService = new ContentService();
  }

  async createContent(req: Request, res: Response) {
    try {
      const data: ContentCreateDTO = req.body;
      const content = await this.contentService.createContent(data);
      res.status(201).json(content);
    } catch (error) {
      console.error('Error creating content:', error);
      res.status(500).json({ error: 'Error creating content' });
    }
  }

  async getContentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const content = await this.contentService.getContentById(id);
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json(content);
    } catch (error) {
      console.error('Error getting content:', error);
      res.status(500).json({ error: 'Error getting content' });
    }
  }

  async getContentByCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const content = await this.contentService.getContentByCampaign(campaignId);
      res.json(content);
    } catch (error) {
      console.error('Error getting campaign content:', error);
      res.status(500).json({ error: 'Error getting campaign content' });
    }
  }

  async getContentByInfluencer(req: Request, res: Response) {
    try {
      const { influencerId } = req.params;
      const content = await this.contentService.getContentByInfluencer(influencerId);
      res.json(content);
    } catch (error) {
      console.error('Error getting influencer content:', error);
      res.status(500).json({ error: 'Error getting influencer content' });
    }
  }

  async updateContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: ContentUpdateDTO = req.body;
      const content = await this.contentService.updateContent(id, data);
      res.json(content);
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ error: 'Error updating content' });
    }
  }

  async deleteContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.contentService.deleteContent(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ error: 'Error deleting content' });
    }
  }

  // Métricas
  async createContentMetrics(req: Request, res: Response) {
    try {
      const data: ContentMetricsCreateDTO = req.body;
      const metrics = await this.contentService.createContentMetrics(data);
      res.status(201).json(metrics);
    } catch (error) {
      console.error('Error creating content metrics:', error);
      res.status(500).json({ error: 'Error creating content metrics' });
    }
  }

  async getContentMetrics(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const metrics = await this.contentService.getContentMetrics(contentId);
      res.json(metrics);
    } catch (error) {
      console.error('Error getting content metrics:', error);
      res.status(500).json({ error: 'Error getting content metrics' });
    }
  }

  async updateContentMetrics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: ContentMetricsUpdateDTO = req.body;
      const metrics = await this.contentService.updateContentMetrics(id, data);
      res.json(metrics);
    } catch (error) {
      console.error('Error updating content metrics:', error);
      res.status(500).json({ error: 'Error updating content metrics' });
    }
  }

  async getContentByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const content = await this.contentService.getContentByStatus(status as any);
      res.json(content);
    } catch (error) {
      console.error('Error getting content by status:', error);
      res.status(500).json({ error: 'Error getting content by status' });
    }
  }

  async getContentByPlatform(req: Request, res: Response) {
    try {
      const { platform } = req.params;
      const content = await this.contentService.getContentByPlatform(platform as any);
      res.json(content);
    } catch (error) {
      console.error('Error getting content by platform:', error);
      res.status(500).json({ error: 'Error getting content by platform' });
    }
  }

  async getContentByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const content = await this.contentService.getContentByType(type as any);
      res.json(content);
    } catch (error) {
      console.error('Error getting content by type:', error);
      res.status(500).json({ error: 'Error getting content by type' });
    }
  }

  async getScheduledContent(req: Request, res: Response) {
    try {
      const content = await this.contentService.getScheduledContent();
      res.json(content);
    } catch (error) {
      console.error('Error getting scheduled content:', error);
      res.status(500).json({ error: 'Error getting scheduled content' });
    }
  }

  async getContentMetricsByDateRange(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const metrics = await this.contentService.getContentMetricsByDateRange(
        contentId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(metrics);
    } catch (error) {
      console.error('Error getting content metrics by date range:', error);
      res.status(500).json({ error: 'Error getting content metrics by date range' });
    }
  }
} 
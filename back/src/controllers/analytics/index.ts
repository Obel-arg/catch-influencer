import { Request, Response } from 'express';
import { AnalyticsService } from '../../services/analytics';
import { AnalyticsCreateDTO, AnalyticsUpdateDTO, AnalyticsReportCreateDTO, AnalyticsReportUpdateDTO } from '../../models/analytics/analytics.model';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  async createAnalytics(req: Request, res: Response) {
    try {
      const data: AnalyticsCreateDTO = req.body;
      const analytics = await this.analyticsService.createAnalytics(data);
      res.status(201).json(analytics);
    } catch (error) {
      console.error('Error creating analytics:', error);
      res.status(500).json({ error: 'Error creating analytics' });
    }
  }

  async getAnalyticsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const analytics = await this.analyticsService.getAnalyticsById(id);
      if (!analytics) {
        return res.status(404).json({ error: 'Analytics not found' });
      }
      res.json(analytics);
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ error: 'Error getting analytics' });
    }
  }

  async getAnalyticsByOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const analytics = await this.analyticsService.getAnalyticsByOrganization(organizationId);
      res.json(analytics);
    } catch (error) {
      console.error('Error getting organization analytics:', error);
      res.status(500).json({ error: 'Error getting organization analytics' });
    }
  }

  async getAnalyticsByCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const analytics = await this.analyticsService.getAnalyticsByCampaign(campaignId);
      res.json(analytics);
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      res.status(500).json({ error: 'Error getting campaign analytics' });
    }
  }

  async getAnalyticsByInfluencer(req: Request, res: Response) {
    try {
      const { influencerId } = req.params;
      const analytics = await this.analyticsService.getAnalyticsByInfluencer(influencerId);
      res.json(analytics);
    } catch (error) {
      console.error('Error getting influencer analytics:', error);
      res.status(500).json({ error: 'Error getting influencer analytics' });
    }
  }

  async updateAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: AnalyticsUpdateDTO = req.body;
      const analytics = await this.analyticsService.updateAnalytics(id, data);
      res.json(analytics);
    } catch (error) {
      console.error('Error updating analytics:', error);
      res.status(500).json({ error: 'Error updating analytics' });
    }
  }

  async deleteAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.analyticsService.deleteAnalytics(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting analytics:', error);
      res.status(500).json({ error: 'Error deleting analytics' });
    }
  }

  // Reportes
  async createReport(req: Request, res: Response) {
    try {
      const data: AnalyticsReportCreateDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const report = await this.analyticsService.createReport(data, userId);
      res.status(201).json(report);
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ error: 'Error creating report' });
    }
  }

  async getReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await this.analyticsService.getReportById(id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json(report);
    } catch (error) {
      console.error('Error getting report:', error);
      res.status(500).json({ error: 'Error getting report' });
    }
  }

  async getReportsByOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const reports = await this.analyticsService.getReportsByOrganization(organizationId);
      res.json(reports);
    } catch (error) {
      console.error('Error getting organization reports:', error);
      res.status(500).json({ error: 'Error getting organization reports' });
    }
  }

  async updateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: AnalyticsReportUpdateDTO = req.body;
      const report = await this.analyticsService.updateReport(id, data);
      res.json(report);
    } catch (error) {
      console.error('Error updating report:', error);
      res.status(500).json({ error: 'Error updating report' });
    }
  }

  async deleteReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.analyticsService.deleteReport(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({ error: 'Error deleting report' });
    }
  }

  async generateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await this.analyticsService.generateReport(id);
      res.json(report);
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Error generating report' });
    }
  }

  async getAnalyticsMetrics(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        type: req.query.type as string,
        campaignId: req.query.campaignId as string,
        influencerId: req.query.influencerId as string
      };
      const metrics = await this.analyticsService.getAnalyticsMetrics(organizationId, filters);
      res.json(metrics);
    } catch (error) {
      console.error('Error getting analytics metrics:', error);
      res.status(500).json({ error: 'Error getting analytics metrics' });
    }
  }
} 
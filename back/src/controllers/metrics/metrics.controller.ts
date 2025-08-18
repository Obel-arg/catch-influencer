import { Request, Response } from 'express';
import { MetricsService } from '../../services/metrics/metrics.service';
import { MetricCreateDTO, MetricUpdateDTO } from '../../models/metrics/metrics.model';

export class MetricsController {
  private metricsService: MetricsService;

  constructor() {
    this.metricsService = new MetricsService();
  }

  async createMetric(req: Request, res: Response) {
    try {
      const data: MetricCreateDTO = req.body;
      const metric = await this.metricsService.createMetric(data);
      res.status(201).json(metric);
    } catch (error) {
      console.error('Error creating metric:', error);
      res.status(500).json({ error: 'Error creating metric' });
    }
  }

  async getMetricById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const metric = await this.metricsService.getMetricById(id);
      if (!metric) {
        return res.status(404).json({ error: 'Metric not found' });
      }
      res.json(metric);
    } catch (error) {
      console.error('Error getting metric:', error);
      res.status(500).json({ error: 'Error getting metric' });
    }
  }

  async getMetricsByCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const metrics = await this.metricsService.getMetricsByCampaign(campaignId);
      res.json(metrics);
    } catch (error) {
      console.error('Error getting campaign metrics:', error);
      res.status(500).json({ error: 'Error getting campaign metrics' });
    }
  }

  async getMetricsByContent(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const metrics = await this.metricsService.getMetricsByContent(contentId);
      res.json(metrics);
    } catch (error) {
      console.error('Error getting content metrics:', error);
      res.status(500).json({ error: 'Error getting content metrics' });
    }
  }

  async getMetricsByInfluencer(req: Request, res: Response) {
    try {
      const { influencerId } = req.params;
      const metrics = await this.metricsService.getMetricsByInfluencer(influencerId);
      res.json(metrics);
    } catch (error) {
      console.error('Error getting influencer metrics:', error);
      res.status(500).json({ error: 'Error getting influencer metrics' });
    }
  }

  async updateMetric(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: MetricUpdateDTO = req.body;
      const metric = await this.metricsService.updateMetric(id, data);
      res.json(metric);
    } catch (error) {
      console.error('Error updating metric:', error);
      res.status(500).json({ error: 'Error updating metric' });
    }
  }

  async deleteMetric(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.metricsService.deleteMetric(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting metric:', error);
      res.status(500).json({ error: 'Error deleting metric' });
    }
  }

  async getMetricsByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const metrics = await this.metricsService.getMetricsByType(type as any);
      res.json(metrics);
    } catch (error) {
      console.error('Error getting metrics by type:', error);
      res.status(500).json({ error: 'Error getting metrics by type' });
    }
  }

  async getMetricsByPeriod(req: Request, res: Response) {
    try {
      const { period } = req.params;
      const metrics = await this.metricsService.getMetricsByPeriod(period as any);
      res.json(metrics);
    } catch (error) {
      console.error('Error getting metrics by period:', error);
      res.status(500).json({ error: 'Error getting metrics by period' });
    }
  }

  async getMetricsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const metrics = await this.metricsService.getMetricsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(metrics);
    } catch (error) {
      console.error('Error getting metrics by date range:', error);
      res.status(500).json({ error: 'Error getting metrics by date range' });
    }
  }

  async getCampaignMetrics(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const metrics = await this.metricsService.calculateCampaignMetrics(campaignId);
      res.json(metrics);
    } catch (error) {
      console.error('Error calculating campaign metrics:', error);
      res.status(500).json({ error: 'Error calculating campaign metrics' });
    }
  }
} 
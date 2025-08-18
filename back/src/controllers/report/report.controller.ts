import { Request, Response } from 'express';
import { ReportService } from '../../services/report/report.service';
import { 
  ReportCreateDTO, 
  ReportUpdateDTO,
  ReportScheduleCreateDTO,
  ReportScheduleUpdateDTO
} from '../../models/report/report.model';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  async createReport(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const data: ReportCreateDTO = {
        ...req.body,
        user_id: userId
      };

      const report = await this.reportService.createReport(data);
      res.status(201).json(report);
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ error: 'Error creating report' });
    }
  }

  async getReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await this.reportService.getReportById(id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json(report);
    } catch (error) {
      console.error('Error getting report:', error);
      res.status(500).json({ error: 'Error getting report' });
    }
  }

  async getUserReports(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const reports = await this.reportService.getUserReports(userId);
      res.json(reports);
    } catch (error) {
      console.error('Error getting user reports:', error);
      res.status(500).json({ error: 'Error getting user reports' });
    }
  }

  async getOrganizationReports(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const reports = await this.reportService.getOrganizationReports(organizationId);
      res.json(reports);
    } catch (error) {
      console.error('Error getting organization reports:', error);
      res.status(500).json({ error: 'Error getting organization reports' });
    }
  }

  async updateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: ReportUpdateDTO = req.body;
      const report = await this.reportService.updateReport(id, data);
      res.json(report);
    } catch (error) {
      console.error('Error updating report:', error);
      res.status(500).json({ error: 'Error updating report' });
    }
  }

  async deleteReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.reportService.deleteReport(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({ error: 'Error deleting report' });
    }
  }

  async getReportsByType(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { type } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const reports = await this.reportService.getReportsByType(userId, type);
      res.json(reports);
    } catch (error) {
      console.error('Error getting reports by type:', error);
      res.status(500).json({ error: 'Error getting reports by type' });
    }
  }

  async getReportsByStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { status } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const reports = await this.reportService.getReportsByStatus(userId, status);
      res.json(reports);
    } catch (error) {
      console.error('Error getting reports by status:', error);
      res.status(500).json({ error: 'Error getting reports by status' });
    }
  }

  // Programación de reportes
  async createReportSchedule(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const data: ReportScheduleCreateDTO = {
        ...req.body,
        user_id: userId
      };

      const schedule = await this.reportService.createReportSchedule(data);
      res.status(201).json(schedule);
    } catch (error) {
      console.error('Error creating report schedule:', error);
      res.status(500).json({ error: 'Error creating report schedule' });
    }
  }

  async getReportScheduleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schedule = await this.reportService.getReportScheduleById(id);
      if (!schedule) {
        return res.status(404).json({ error: 'Report schedule not found' });
      }
      res.json(schedule);
    } catch (error) {
      console.error('Error getting report schedule:', error);
      res.status(500).json({ error: 'Error getting report schedule' });
    }
  }

  async getUserReportSchedules(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const schedules = await this.reportService.getUserReportSchedules(userId);
      res.json(schedules);
    } catch (error) {
      console.error('Error getting user report schedules:', error);
      res.status(500).json({ error: 'Error getting user report schedules' });
    }
  }

  async updateReportSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: ReportScheduleUpdateDTO = req.body;
      const schedule = await this.reportService.updateReportSchedule(id, data);
      res.json(schedule);
    } catch (error) {
      console.error('Error updating report schedule:', error);
      res.status(500).json({ error: 'Error updating report schedule' });
    }
  }

  async deleteReportSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.reportService.deleteReportSchedule(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting report schedule:', error);
      res.status(500).json({ error: 'Error deleting report schedule' });
    }
  }
} 
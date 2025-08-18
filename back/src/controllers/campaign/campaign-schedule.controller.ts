import { Request, Response } from 'express';
import { CampaignScheduleService } from '../../services/campaign/campaign-schedule.service';
import { CampaignScheduleCreateDTO, CampaignScheduleUpdateDTO, CampaignScheduleFilters } from '../../models/campaign/campaign-schedule.model';

export class CampaignScheduleController {
  private campaignScheduleService: CampaignScheduleService;

  constructor() {
    this.campaignScheduleService = new CampaignScheduleService();
  }

  // POST /campaign-schedule
  async createSchedule(req: Request, res: Response) {
    try {
      const scheduleData: CampaignScheduleCreateDTO = req.body;
      
      // Validar datos requeridos
      if (!scheduleData.campaign_id || !scheduleData.influencer_id || !scheduleData.title) {
        return res.status(400).json({
          success: false,
          message: 'campaign_id, influencer_id y title son requeridos'
        });
      }

      const schedule = await this.campaignScheduleService.createSchedule(scheduleData);
      
      res.status(201).json({
        success: true,
        data: schedule,
        message: 'Contenido programado creado exitosamente'
      });
    } catch (error) {
      console.error('CampaignScheduleController.createSchedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el contenido programado',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // GET /campaign-schedule/:id
  async getScheduleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const schedule = await this.campaignScheduleService.getScheduleById(id);
      
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Contenido programado no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: schedule
      });
    } catch (error) {
      console.error('CampaignScheduleController.getScheduleById error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el contenido programado',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // GET /campaign-schedule/campaign/:campaignId
  async getSchedulesByCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const filters: CampaignScheduleFilters = req.query as any;
      
      const schedules = await this.campaignScheduleService.getSchedulesByCampaign(campaignId, filters);
      
      res.status(200).json({
        success: true,
        data: schedules,
        count: schedules.length
      });
    } catch (error) {
      console.error('CampaignScheduleController.getSchedulesByCampaign error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los contenidos programados de la campaña',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // GET /campaign-schedule
  async getSchedules(req: Request, res: Response) {
    try {
      const filters: CampaignScheduleFilters = req.query as any;
      
      const schedules = await this.campaignScheduleService.getSchedules(filters);
      
      res.status(200).json({
        success: true,
        data: schedules,
        count: schedules.length
      });
    } catch (error) {
      console.error('CampaignScheduleController.getSchedules error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los contenidos programados',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // PUT /campaign-schedule/:id
  async updateSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: CampaignScheduleUpdateDTO = req.body;
      
      const schedule = await this.campaignScheduleService.updateSchedule(id, updateData);
      
      res.status(200).json({
        success: true,
        data: schedule,
        message: 'Contenido programado actualizado exitosamente'
      });
    } catch (error) {
      console.error('CampaignScheduleController.updateSchedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el contenido programado',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // DELETE /campaign-schedule/:id
  async deleteSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await this.campaignScheduleService.deleteSchedule(id);
      
      res.status(200).json({
        success: true,
        message: 'Contenido programado eliminado exitosamente'
      });
    } catch (error) {
      console.error('CampaignScheduleController.deleteSchedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el contenido programado',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // PUT /campaign-schedule/:id/metrics
  async updateMetrics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { metrics } = req.body;
      
      if (!metrics) {
        return res.status(400).json({
          success: false,
          message: 'metrics es requerido'
        });
      }

      const schedule = await this.campaignScheduleService.updateMetrics(id, metrics);
      
      res.status(200).json({
        success: true,
        data: schedule,
        message: 'Métricas actualizadas exitosamente'
      });
    } catch (error) {
      console.error('CampaignScheduleController.updateMetrics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar las métricas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // PUT /campaign-schedule/:id/objectives
  async updateObjectives(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { objectives } = req.body;
      
      if (!objectives) {
        return res.status(400).json({
          success: false,
          message: 'objectives es requerido'
        });
      }

      const schedule = await this.campaignScheduleService.updateObjectives(id, objectives);
      
      res.status(200).json({
        success: true,
        data: schedule,
        message: 'Objetivos actualizados exitosamente'
      });
    } catch (error) {
      console.error('CampaignScheduleController.updateObjectives error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar los objetivos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // GET /campaign-schedule/campaign/:campaignId/stats
  async getCampaignStats(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      
      const stats = await this.campaignScheduleService.getCampaignStats(campaignId);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('CampaignScheduleController.getCampaignStats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las estadísticas de la campaña',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene las métricas de posts para un contenido programado
   */
  async getPostMetricsForSchedule(req: Request, res: Response) {
    try {
      const { scheduleId } = req.params
      
      const metrics = await this.campaignScheduleService.getPostMetricsForSchedule(scheduleId)
      
      res.status(200).json({
        success: true,
        data: metrics
      })
    } catch (error) {
      console.error('❌ Error getting post metrics for schedule:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas del post',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  /**
   * Obtiene las métricas de posts para múltiples contenidos programados
   */
  async getPostMetricsForSchedules(req: Request, res: Response) {
    try {
      const { scheduleIds } = req.body
      
      if (!Array.isArray(scheduleIds)) {
        return res.status(400).json({
          success: false,
          message: 'scheduleIds debe ser un array'
        })
      }
      
      const metrics = await this.campaignScheduleService.getPostMetricsForSchedules(scheduleIds)
      
      res.status(200).json({
        success: true,
        data: metrics
      })
    } catch (error) {
      console.error('❌ Error getting batch post metrics for schedules:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas de posts',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }
} 
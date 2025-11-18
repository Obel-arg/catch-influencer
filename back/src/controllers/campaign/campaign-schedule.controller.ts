import { Request, Response } from 'express';
import { CampaignScheduleService } from '../../services/campaign/campaign-schedule.service';
import { CampaignInfluencerService } from '../../services/campaign/campaign-influencer.service';
import { CampaignScheduleCreateDTO, CampaignScheduleUpdateDTO, CampaignScheduleFilters } from '../../models/campaign/campaign-schedule.model';
import { ExcelParserService } from '../../services/campaign/excel-parser.service';

export class CampaignScheduleController {
  private campaignScheduleService: CampaignScheduleService;
  private campaignInfluencerService: CampaignInfluencerService;

  constructor() {
    this.campaignScheduleService = new CampaignScheduleService();
    this.campaignInfluencerService = new CampaignInfluencerService();
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

  /**
   * POST /campaign-schedules/bulk-upload
   * Upload Excel file and parse content schedules
   */
  async bulkUploadSchedules(req: Request, res: Response) {
    try {
      const { campaignId } = req.body;

      // Validate campaign ID
      if (!campaignId) {
        return res.status(400).json({
          success: false,
          message: 'campaignId es requerido'
        });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha subido ningún archivo Excel'
        });
      }

      // Get campaign influencers for validation
      const campaignInfluencers = await this.campaignInfluencerService.getCampaignInfluencersWithDetailsById(campaignId);

      if (!campaignInfluencers || campaignInfluencers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay influencers asignados a esta campaña'
        });
      }

      // Map influencers to required format
      const influencers = campaignInfluencers.map(ci => ({
        id: ci.influencer_id,
        name: ci.influencers?.name || '',
        handle: ci.influencers?.username || ci.influencers?.handle || '',
        avatar: ci.influencers?.picture_url || ci.influencers?.avatar || ''
      }));

      // Parse Excel file
      const parsedResults = ExcelParserService.parseExcel(req.file.buffer, influencers);

      // Get summary statistics
      const summary = ExcelParserService.getSummary(parsedResults);

      // Return parsed data with validation results
      res.status(200).json({
        success: true,
        data: {
          parsed: parsedResults,
          summary
        },
        message: `Se procesaron ${summary.total} filas. ${summary.valid} válidas, ${summary.invalid} inválidas.`
      });
    } catch (error) {
      console.error('CampaignScheduleController.bulkUploadSchedules error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar el archivo Excel',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * POST /campaign-schedules/bulk-upload/confirm
   * Confirm and save valid schedules from bulk upload
   */
  async confirmBulkUpload(req: Request, res: Response) {
    try {
      const { campaignId, schedules } = req.body;

      console.log('🔵 confirmBulkUpload called with:', {
        campaignId,
        schedulesCount: schedules?.length
      });

      if (!campaignId || !Array.isArray(schedules)) {
        return res.status(400).json({
          success: false,
          message: 'campaignId y schedules son requeridos'
        });
      }

      // Create all valid schedules
      const createdSchedules = [];
      const errors = [];

      for (const schedule of schedules) {
        try {
          console.log('🟢 Creating schedule:', {
            title: schedule.title,
            influencer_id: schedule.influencer_id,
            influencer_name: schedule.influencer_name
          });

          const scheduleData: CampaignScheduleCreateDTO = {
            ...schedule,
            campaign_id: campaignId
          };

          const created = await this.campaignScheduleService.createSchedule(scheduleData);
          console.log('✅ Schedule created successfully:', created.id);
          createdSchedules.push(created);
        } catch (error) {
          console.error('❌ Error creating schedule:', {
            title: schedule.title,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
          errors.push({
            schedule: schedule.title,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }

      console.log('📊 Bulk upload results:', {
        created: createdSchedules.length,
        errors: errors.length
      });

      res.status(201).json({
        success: true,
        data: {
          created: createdSchedules,
          errors
        },
        message: `Se crearon ${createdSchedules.length} contenidos programados exitosamente`
      });
    } catch (error) {
      console.error('CampaignScheduleController.confirmBulkUpload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al confirmar la importación',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
} 
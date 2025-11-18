import { Router } from 'express';
import { CampaignScheduleController } from '../../controllers/campaign/campaign-schedule.controller';
import { authenticateToken } from '../../middleware/auth';
import multer from 'multer';

const router = Router();
const campaignScheduleController = new CampaignScheduleController();

// Configure multer for Excel file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xls, .xlsx)'));
    }
  }
});

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas principales
router.post('/', campaignScheduleController.createSchedule.bind(campaignScheduleController));
router.get('/', campaignScheduleController.getSchedules.bind(campaignScheduleController));
router.get('/:id', campaignScheduleController.getScheduleById.bind(campaignScheduleController));
router.put('/:id', campaignScheduleController.updateSchedule.bind(campaignScheduleController));
router.delete('/:id', campaignScheduleController.deleteSchedule.bind(campaignScheduleController));

// Rutas específicas por campaña
router.get('/campaign/:campaignId', campaignScheduleController.getSchedulesByCampaign.bind(campaignScheduleController));
router.get('/campaign/:campaignId/stats', campaignScheduleController.getCampaignStats.bind(campaignScheduleController));

// Rutas para métricas y objetivos
router.put('/:id/metrics', campaignScheduleController.updateMetrics.bind(campaignScheduleController));
router.put('/:id/objectives', campaignScheduleController.updateObjectives.bind(campaignScheduleController));

// Rutas para importación masiva (más específicas primero)
router.post('/bulk-upload/confirm', campaignScheduleController.confirmBulkUpload.bind(campaignScheduleController));
router.post('/bulk-upload', upload.single('file'), campaignScheduleController.bulkUploadSchedules.bind(campaignScheduleController));

// Rutas para métricas de posts (más específicas primero)
router.post('/post-metrics/batch', campaignScheduleController.getPostMetricsForSchedules.bind(campaignScheduleController));
router.get('/:scheduleId/post-metrics', campaignScheduleController.getPostMetricsForSchedule.bind(campaignScheduleController));

export default router; 
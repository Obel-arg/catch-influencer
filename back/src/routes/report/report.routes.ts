import { Router } from 'express';
import { ReportController } from '../../controllers/report/report.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const reportController = new ReportController();

// Rutas para reportes
router.post('/', authenticateToken, reportController.createReport.bind(reportController));
router.get('/:id', authenticateToken, reportController.getReportById.bind(reportController));
router.get('/user/all', authenticateToken, reportController.getUserReports.bind(reportController));
router.get('/organization/:organizationId', authenticateToken, reportController.getOrganizationReports.bind(reportController));
router.put('/:id', authenticateToken, reportController.updateReport.bind(reportController));
router.delete('/:id', authenticateToken, reportController.deleteReport.bind(reportController));

// Rutas para filtrar reportes
router.get('/type/:type', authenticateToken, reportController.getReportsByType.bind(reportController));
router.get('/status/:status', authenticateToken, reportController.getReportsByStatus.bind(reportController));

// Rutas para programación de reportes
router.post('/schedule', authenticateToken, reportController.createReportSchedule.bind(reportController));
router.get('/schedule/:id', authenticateToken, reportController.getReportScheduleById.bind(reportController));
router.get('/schedule/user/all', authenticateToken, reportController.getUserReportSchedules.bind(reportController));
router.put('/schedule/:id', authenticateToken, reportController.updateReportSchedule.bind(reportController));
router.delete('/schedule/:id', authenticateToken, reportController.deleteReportSchedule.bind(reportController));

export default router; 
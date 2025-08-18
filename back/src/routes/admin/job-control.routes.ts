import { Router } from 'express';
import { JobControlController } from '../../controllers/admin/job-control.controller';

const router = Router();
const jobControlController = new JobControlController();

// Controlar job específico (pause, resume, remove, retry, promote)
router.post('/workers/:workerName/jobs/:jobId/:action', jobControlController.controlJob.bind(jobControlController));

// Rutas específicas para cada acción (opcional, para mayor claridad)
router.post('/workers/:workerName/jobs/:jobId/pause', jobControlController.pauseJob.bind(jobControlController));
router.post('/workers/:workerName/jobs/:jobId/resume', jobControlController.resumeJob.bind(jobControlController));
router.post('/workers/:workerName/jobs/:jobId/remove', jobControlController.removeJob.bind(jobControlController));
router.post('/workers/:workerName/jobs/:jobId/retry', jobControlController.retryJob.bind(jobControlController));
router.post('/workers/:workerName/jobs/:jobId/promote', jobControlController.promoteJob.bind(jobControlController));

// Obtener información detallada de un job
router.get('/workers/:workerName/jobs/:jobId/info', jobControlController.getJobInfo.bind(jobControlController));

export default router; 
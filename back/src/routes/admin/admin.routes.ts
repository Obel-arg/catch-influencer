import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { AdminController } from '../../controllers/admin/admin.controller';
import jobControlRoutes from './job-control.routes';
import alertRoutes from './alert.routes';
import cleanupRoutes from './cleanup.routes';

const router = Router();

// 🔐 PROTECCIÓN CRÍTICA: Solo administradores autenticados pueden controlar workers
router.use(authenticateToken);
const adminController = new AdminController();

// Obtener estado de todos los workers
router.get('/workers/status', adminController.getWorkersStatus.bind(adminController));

// Verificar estado de salud de los workers
router.get('/workers/health', adminController.getWorkersHealth.bind(adminController));

// Obtener información de debug de los workers
router.get('/workers/debug', adminController.getWorkersDebug.bind(adminController));

// Controlar worker específico (start, stop, restart, force-init)
router.post('/workers/:workerName/:action', adminController.controlWorker.bind(adminController));

// Obtener logs del worker
router.get('/workers/:workerName/logs', adminController.getWorkerLogs.bind(adminController));

// Limpiar cola del worker
router.post('/workers/:workerName/clear-queue', adminController.clearWorkerQueue.bind(adminController));

// Forzar terminación de un job específico
router.post('/jobs/:jobId/force-terminate', adminController.forceTerminateJob.bind(adminController));

// Reiniciar un job específico
router.post('/jobs/:jobId/restart', adminController.restartJob.bind(adminController));

// Eliminar job fallido definitivamente
router.delete('/jobs/:jobId', adminController.deleteFailedJob.bind(adminController));

// Obtener cola del worker
router.get('/workers/:workerName/queue', adminController.getWorkerQueue.bind(adminController));

// Obtener jobs completados del worker
router.get('/workers/:workerName/completed', adminController.getCompletedJobs.bind(adminController));

// Obtener jobs fallidos del worker
router.get('/workers/:workerName/failed', adminController.getFailedJobs.bind(adminController));

// Controlar Missing Metrics Worker
router.post('/workers/missing-metrics/:action', adminController.controlMissingMetricsWorker.bind(adminController));

// Obtener estado del Missing Metrics Worker
router.get('/workers/missing-metrics/status', adminController.getMissingMetricsWorkerStatus.bind(adminController));

// Ejecutar verificación manual de métricas faltantes
router.post('/workers/missing-metrics/trigger', adminController.triggerMissingMetricsCheck.bind(adminController));

// Rutas de auto-scaling
router.get('/auto-scaling/status', adminController.getAutoScalingStatus.bind(adminController));
router.get('/auto-scaling/history', adminController.getScalingHistory.bind(adminController));
router.post('/auto-scaling/config', adminController.updateScalingConfig.bind(adminController));

// Rutas para control de jobs individuales
router.use('/', jobControlRoutes);

// Rutas para alertas y notificaciones
router.use('/alerts', alertRoutes);

// Rutas para limpieza de duplicados
router.use('/cleanup', cleanupRoutes);

export default router; 
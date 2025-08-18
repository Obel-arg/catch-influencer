import { Router } from 'express';
import { AlertController } from '../../controllers/admin/alert.controller';

const router = Router();

// Obtener configuración de alertas
router.get('/config', AlertController.getAlertConfig);

// Actualizar configuración de alertas
router.put('/config', AlertController.updateAlertConfig);

// Configurar webhook de Slack
router.post('/slack/webhook', AlertController.configureSlackWebhook);

// Probar notificación de Slack
router.post('/slack/test', AlertController.testSlackNotification);

// Obtener alertas activas
router.get('/alerts', AlertController.getActiveAlerts);

// Obtener métricas de alertas
router.get('/metrics', AlertController.getAlertMetrics);

// Reconocer alerta
router.post('/alerts/:alertId/acknowledge', AlertController.acknowledgeAlert);

export default router; 
import { Router } from 'express';
import { NotificationController } from '../../controllers/notification/notification.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

// Rutas para notificaciones
router.post('/', authenticateToken, notificationController.createNotification.bind(notificationController));
router.get('/:id', authenticateToken, notificationController.getNotificationById.bind(notificationController));
router.get('/user/all', authenticateToken, notificationController.getUserNotifications.bind(notificationController));
router.get('/user/unread', authenticateToken, notificationController.getUnreadNotifications.bind(notificationController));
router.put('/:id', authenticateToken, notificationController.updateNotification.bind(notificationController));
router.patch('/:id/read', authenticateToken, notificationController.markAsRead.bind(notificationController));
router.patch('/user/read-all', authenticateToken, notificationController.markAllAsRead.bind(notificationController));
router.delete('/:id', authenticateToken, notificationController.deleteNotification.bind(notificationController));

// Rutas para filtrar notificaciones
router.get('/type/:type', authenticateToken, notificationController.getNotificationsByType.bind(notificationController));
router.get('/status/:status', authenticateToken, notificationController.getNotificationsByStatus.bind(notificationController));

// Rutas para preferencias de notificación
router.get('/preferences', authenticateToken, notificationController.getNotificationPreferences.bind(notificationController));
router.put('/preferences', authenticateToken, notificationController.updateNotificationPreferences.bind(notificationController));
router.post('/preferences', authenticateToken, notificationController.createNotificationPreferences.bind(notificationController));

export default router; 
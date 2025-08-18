import { Router } from 'express';
import { FeedbackController } from '../../controllers/feedback/feedback.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const feedbackController = new FeedbackController();

// Rutas protegidas por autenticación
router.use(authenticateToken);

// Crear nuevo feedback
router.post('/', feedbackController.createFeedback.bind(feedbackController));

// Obtener feedback del usuario actual
router.get('/user', feedbackController.getUserFeedback.bind(feedbackController));

// Obtener todos los feedbacks (solo usuarios de obel.la)
router.get('/all', feedbackController.getAllFeedback.bind(feedbackController));

// Actualizar feedback (solo usuarios de obel.la)
router.put('/:id', feedbackController.updateFeedback.bind(feedbackController));

// Obtener estadísticas de feedback (solo usuarios de obel.la)
router.get('/stats', feedbackController.getFeedbackStats.bind(feedbackController));

// Obtener conteo de feedbacks pendientes (solo usuarios de obel.la)
router.get('/pending-count', feedbackController.getPendingFeedbackCount.bind(feedbackController));

// Eliminar feedback (solo usuarios de obel.la)
router.delete('/:id', feedbackController.deleteFeedback.bind(feedbackController));

export default router; 
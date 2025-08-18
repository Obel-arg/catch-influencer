import { Router } from 'express';
import { CleanupController } from '../../controllers/admin/cleanup.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const cleanupController = CleanupController.getInstance();

/**
 * @route GET /admin/cleanup/stats
 * @desc Obtiene estadísticas de duplicados sin limpiar
 * @access Admin only
 */
router.get('/stats', authenticateToken, async (req, res) => {
  await cleanupController.getDuplicateStats(req, res);
});

/**
 * @route POST /admin/cleanup/metrics
 * @desc Limpia duplicados en post_metrics
 * @access Admin only
 */
router.post('/metrics', authenticateToken, async (req, res) => {
  await cleanupController.cleanupMetrics(req, res);
});

/**
 * @route POST /admin/cleanup/topics
 * @desc Limpia duplicados en post_topics
 * @access Admin only
 */
router.post('/topics', authenticateToken, async (req, res) => {
  await cleanupController.cleanupTopics(req, res);
});

/**
 * @route POST /admin/cleanup/all
 * @desc Limpia duplicados en ambas tablas
 * @access Admin only
 */
router.post('/all', authenticateToken, async (req, res) => {
  await cleanupController.cleanupAll(req, res);
});

export default router; 
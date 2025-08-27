import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { twitterController } from '../../controllers/twitter/twitter.controller';

const router = Router();

// 🔐 PROTECCIÓN: Solo usuarios autenticados pueden usar servicios de Twitter
router.use(authenticateToken);

/**
 * @route POST /api/twitter/generate-thumbnail
 * @desc Genera y almacena la miniatura de un tweet en blob storage
 * @access Private
 */
router.post('/generate-thumbnail', twitterController.generateAndStoreThumbnail);

/**
 * @route GET /api/twitter/post-info
 * @desc Obtiene información completa de un tweet
 * @access Private
 */
router.get('/post-info', twitterController.getPostInfo);

/**
 * @route GET /api/twitter/test-screenshotone
 * @desc Prueba la conexión con ScreenshotOne API
 * @access Private
 */
router.get('/test-screenshotone', twitterController.testScreenshotOneConnection);

/**
 * @route GET /api/twitter/screenshotone-usage
 * @desc Obtiene información de uso de ScreenshotOne API
 * @access Private
 */
router.get('/screenshotone-usage', twitterController.getScreenshotOneUsage);

export default router; 
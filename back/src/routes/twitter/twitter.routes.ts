import { Router } from 'express';
import { twitterController } from '../../controllers/twitter/twitter.controller';

const router = Router();

/**
 * @route POST /api/twitter/generate-thumbnail
 * @desc Genera y almacena la miniatura de un tweet en blob storage
 * @access Public
 */
router.post('/generate-thumbnail', twitterController.generateAndStoreThumbnail);

/**
 * @route GET /api/twitter/post-info
 * @desc Obtiene información completa de un tweet
 * @access Public
 */
router.get('/post-info', twitterController.getPostInfo);

/**
 * @route GET /api/twitter/test-screenshotone
 * @desc Prueba la conexión con ScreenshotOne API
 * @access Public
 */
router.get('/test-screenshotone', twitterController.testScreenshotOneConnection);

/**
 * @route GET /api/twitter/screenshotone-usage
 * @desc Obtiene información de uso de ScreenshotOne API
 * @access Public
 */
router.get('/screenshotone-usage', twitterController.getScreenshotOneUsage);

export default router; 
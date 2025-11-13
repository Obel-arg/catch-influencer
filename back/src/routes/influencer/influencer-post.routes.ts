import { Router } from 'express';
import { InfluencerPostController } from '../../controllers/influencer/influencer-post.controller';
import { InfluencerPostsController } from '../../controllers/influencer-posts/influencer-posts.controller';
import { ManualMetricsController } from '../../controllers/influencer-posts/manual-metrics.controller';
import { authenticateToken } from '../../middleware/auth';
import multer from 'multer';

const router = Router();
const influencerPostController = new InfluencerPostController();
const influencerPostsController = new InfluencerPostsController();
const manualMetricsController = new ManualMetricsController();

// Configurar multer para uploads de imágenes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Rutas CRUD básicas
router.post('/', authenticateToken, influencerPostController.createInfluencerPost.bind(influencerPostController));
router.get('/:id', authenticateToken, influencerPostController.getInfluencerPostById.bind(influencerPostController));
router.patch('/:id', authenticateToken, influencerPostController.updateInfluencerPost.bind(influencerPostController));
router.delete('/:id', authenticateToken, influencerPostController.deleteInfluencerPost.bind(influencerPostController));

// Rutas con métricas automáticas (nuevas funcionalidades)
router.post('/with-metrics', authenticateToken, influencerPostsController.createPost.bind(influencerPostsController));
router.get('/list', authenticateToken, influencerPostsController.getPosts.bind(influencerPostsController));

// Rutas de scraping automático
router.get('/:id/comments', authenticateToken, influencerPostController.getPostComments.bind(influencerPostController));
router.post('/:id/rescrape', authenticateToken, influencerPostController.rescrapPost.bind(influencerPostController));
router.get('/scraping/stats', authenticateToken, influencerPostController.getScrapingStats.bind(influencerPostController));

// Rutas de consulta específicas
router.get('/campaign/:campaignId', authenticateToken, influencerPostController.getInfluencerPostsByCampaign.bind(influencerPostController));
router.get('/influencer/:influencerId', authenticateToken, influencerPostController.getInfluencerPostsByInfluencer.bind(influencerPostController));
router.get('/campaign/:campaignId/influencer/:influencerId', authenticateToken, influencerPostController.getInfluencerPostsByCampaignAndInfluencer.bind(influencerPostController));

// Rutas de filtros y métricas
router.get('/platform/:platform', authenticateToken, influencerPostController.getInfluencerPostsByPlatform.bind(influencerPostController));
router.get('/date-range', authenticateToken, influencerPostController.getInfluencerPostsByDateRange.bind(influencerPostController));
router.get('/campaign/:campaignId/metrics', authenticateToken, influencerPostController.getInfluencerPostsWithMetrics.bind(influencerPostController));

// Rutas de métricas automáticas CreatorDB (nuevas funcionalidades)
router.get('/:postId/metrics', authenticateToken, influencerPostsController.getPostWithMetrics.bind(influencerPostsController));
router.post('/:postId/refresh-metrics', authenticateToken, influencerPostsController.refreshPostMetrics.bind(influencerPostsController));

// Ruta para obtener todas las métricas de evolución de una campaña
router.get('/campaign/:campaignId/all-metrics', authenticateToken, influencerPostsController.getAllMetricsForCampaign.bind(influencerPostsController));

// Ruta para guardar métricas manuales (historias de Instagram)
router.post('/:postId/manual-metrics', authenticateToken, manualMetricsController.saveManualMetrics.bind(manualMetricsController));

// Ruta para subir screenshots (historias de Instagram)
router.post('/:postId/screenshot', authenticateToken, upload.single('screenshot'), manualMetricsController.uploadScreenshot.bind(manualMetricsController));

// Ruta para subir imágenes personalizadas de posts
router.post('/upload-image', authenticateToken, upload.single('image'), manualMetricsController.uploadPostImage.bind(manualMetricsController));

// Ruta para sincronizar métricas a influencer_posts (una sola vez)
router.post('/sync-metrics', authenticateToken, influencerPostsController.syncAllMetricsToInfluencerPosts.bind(influencerPostsController));

export default router; 
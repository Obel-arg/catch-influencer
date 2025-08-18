import { Router } from 'express';
import CreatorDBController from '../../controllers/creator/creator.controller';

const router = Router();

// ==============================================
// 🆕 RUTAS GENERALES
// ==============================================

// Ruta genérica para GET a CreatorDB
router.get('/', CreatorDBController.proxyGet);

// Estado de la API y créditos
router.get('/api-status', CreatorDBController.getApiStatus);

// Enviar creadores para que sean agregados a la base de datos
router.post('/submit-creators', CreatorDBController.submitCreators);

// ==============================================
// 🆕 RUTAS PARA SUBMIT CREATORS CON HISTORIAL
// ==============================================

// Enviar un nuevo creador y guardar en historial
router.post('/submit-creators-with-history', CreatorDBController.submitCreatorWithHistory);

// Obtener historial de pedidos de creadores
router.get('/submit-creators-history', CreatorDBController.getSubmitHistory);

// Extraer plataforma e ID de una URL
router.post('/extract-platform-id', CreatorDBController.extractPlatformAndId);

// Verificar si un ID existe en CreatorDB
router.post('/check-id-exists', CreatorDBController.checkIdExists);

// Obtener métricas de posts
router.get('/post/by-id', CreatorDBController.getPostById);
router.get('/post/by-link', CreatorDBController.getPostByLink);

// ==============================================
// YOUTUBE ROUTES
// ==============================================

router.get('/youtube/basic', CreatorDBController.youtubeBasic);
router.get('/youtube/historical', CreatorDBController.youtubeHistorical);
router.get('/youtube/recent', CreatorDBController.youtubeRecent);
router.get('/youtube/topic', CreatorDBController.youtubeTopic);

// ==============================================
// INSTAGRAM ROUTES
// ==============================================

// CORREGIDO: Ahora usa el controlador en lugar de función inline
router.get('/instagram/basic', CreatorDBController.instagramBasic);
router.get('/instagram/historical', CreatorDBController.instagramHistorical);
router.get('/instagram/recent', CreatorDBController.instagramRecent);

// ==============================================
// TIKTOK ROUTES
// ==============================================

// CORREGIDO: Ahora usa el controlador en lugar de función inline
router.get('/tiktok/basic', CreatorDBController.tiktokBasic);
router.get('/tiktok/historical', CreatorDBController.tiktokHistorical);
router.get('/tiktok/recent', CreatorDBController.tiktokRecent);

// ==============================================
// THREADS ROUTES - NUEVAS
// ==============================================

router.get('/threads/basic', CreatorDBController.threadsBasic);
router.get('/threads/historical', CreatorDBController.threadsHistorical);

// ==============================================
// FACEBOOK ROUTES - NUEVAS
// ==============================================

router.get('/facebook/basic', CreatorDBController.facebookBasic);
router.get('/facebook/historical', CreatorDBController.facebookHistorical);

// ==============================================
// TOPIC & BRAND ROUTES
// ==============================================

router.get('/topic/table', CreatorDBController.getTopicTable);
router.get('/topic/report', CreatorDBController.topicReport);
router.get('/brand/table', CreatorDBController.getBrandTable);
router.get('/brand/report', CreatorDBController.brandReport);
router.post('/niches/related', CreatorDBController.getRelatedNiches);

// ==============================================
// SEARCH ROUTES - NUEVAS
// ==============================================

router.get('/search/instagram', CreatorDBController.searchInstagramInfluencer);
router.get('/search/tiktok', CreatorDBController.searchTikTokInfluencer);
router.get('/search/youtube', CreatorDBController.searchYouTubeInfluencer);

// ==============================================
// EXPLORER ROUTES
// ==============================================

// Búsqueda avanzada para el explorador
router.get('/explorer/search', CreatorDBController.searchInfluencers);

// 🔍 BÚSQUEDA INTELIGENTE
router.post('/explorer/smart-search', CreatorDBController.smartSearch);

// 🔧 FALLBACK: Obtener influencers específicos por IDs
router.post('/explorer/fallback-search', CreatorDBController.getInfluencersByIds);

// Analytics del sistema de caché
router.get('/explorer/cache/analytics', CreatorDBController.getCacheAnalytics);
router.get('/explorer/cache/popular-searches', CreatorDBController.getPopularSearches);

// Endpoint para consultar el estado del cache de una búsqueda
router.get('/explorer/cache/check', CreatorDBController.getCacheCheck);

export default router; 
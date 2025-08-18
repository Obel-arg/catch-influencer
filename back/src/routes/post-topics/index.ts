import { Router } from 'express';
import { PostTopicsController } from '../../controllers/post-topics';
import { authenticateToken } from '../../middleware/auth';
import { 
  analyzeTopicsIntelligently, 
  getIntelligentModelInfo,
  getTopicNicheCategories,
  getCategoriesByType,
  searchCategories
} from '../../controllers/post-topics.controller';

const router = Router();
const postTopicsController = new PostTopicsController();

// Todas las rutas requieren autenticación excepto las de categorías
// router.use(authenticateToken);

// GET /api/post-topics/:postId - Obtener temas de un post
router.get('/:postId', postTopicsController.getPostTopics.bind(postTopicsController));

// POST /api/post-topics/:postId/analyze - Analizar y extraer temas de comentarios
router.post('/:postId/analyze', postTopicsController.analyzePostTopics.bind(postTopicsController));

// GET /api/post-topics/:postId/stats - Obtener estadísticas de temas de un post
router.get('/:postId/stats', postTopicsController.getPostTopicsStats.bind(postTopicsController));

// DELETE /api/post-topics/:postId - Eliminar todos los temas de un post
router.delete('/:postId', postTopicsController.deletePostTopics.bind(postTopicsController));

// GET /api/post-topics/model/info - Obtener información del modelo de IA
router.get('/model/info', postTopicsController.getModelInfo.bind(postTopicsController));

// Rutas para análisis inteligente de temas
router.post('/:postId/analyze-intelligent', analyzeTopicsIntelligently);
router.get('/model/intelligent-info', getIntelligentModelInfo);

// GET /api/post-topics/:postId/keywords - Obtener palabras clave de un post
router.get('/:postId/keywords', postTopicsController.getPostKeyTopics.bind(postTopicsController));

// ==============================================
// RUTAS DE CATEGORÍAS DE NICHOS Y TOPICS
// ==============================================

// GET /api/post-topics/categories - Obtener nichos y topics como categorías
router.get('/categories', getTopicNicheCategories);

// GET /api/post-topics/categories/grouped - Obtener categorías agrupadas por tipo
router.get('/categories/grouped', getCategoriesByType);

// GET /api/post-topics/categories/search - Buscar categorías
router.get('/categories/search', searchCategories);

export default router; 
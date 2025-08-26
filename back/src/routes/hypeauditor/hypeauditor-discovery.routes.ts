import { Router } from 'express';
import { HypeAuditorDiscoveryController } from '../../controllers/hypeauditor/hypeauditor-discovery.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @route POST /api/hypeauditor/discovery/search
 * @desc Búsqueda de discovery usando filtros del Explorer
 * @access Private
 */
router.post('/search', HypeAuditorDiscoveryController.searchDiscovery);

/**
 * @route POST /api/hypeauditor/discovery/search-sandbox
 * @desc Búsqueda de discovery en modo sandbox (para testing)
 * @access Private
 */
router.post('/search-sandbox', HypeAuditorDiscoveryController.searchDiscoverySandbox);

/**
 * @route POST /api/hypeauditor/discovery/search-direct
 * @desc Búsqueda directa usando parámetros de HypeAuditor (para casos avanzados)
 * @access Private
 */
router.post('/search-direct', HypeAuditorDiscoveryController.searchDirect);

/**
 * @route GET /api/hypeauditor/discovery/taxonomy
 * @desc Obtener taxonomía de categorías
 * @access Private
 */
router.get('/taxonomy', HypeAuditorDiscoveryController.getTaxonomy);

/**
 * @route GET /api/hypeauditor/discovery/search-keywords-posts
 * @desc Buscar posts por keywords
 * @access Private
 */
router.get('/search-keywords-posts', HypeAuditorDiscoveryController.searchKeywordsPosts);

/**
 * @route POST /api/hypeauditor/discovery/smart-search
 * @desc Búsqueda inteligente (combinación de búsqueda por texto y filtros)
 * @access Private
 */
router.post('/smart-search', HypeAuditorDiscoveryController.smartSearch);

/**
 * @route GET /api/hypeauditor/discovery/health
 * @desc Obtener información de salud del servicio
 * @access Private
 */
router.get('/health', HypeAuditorDiscoveryController.healthCheck);

/**
 * @route GET /api/hypeauditor/discovery/usage-stats
 * @desc Obtener estadísticas de uso
 * @access Private
 */
router.get('/usage-stats', HypeAuditorDiscoveryController.getUsageStats);

export default router;

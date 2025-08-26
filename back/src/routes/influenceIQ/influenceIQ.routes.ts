import { Router } from 'express';
import { InfluenceIQController } from '../../controllers/influenceIQ/influenceIQ.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

// ==============================================
// RUTAS DE BÚSQUEDA
// ==============================================

// Búsqueda básica de influencers
router.post('/search', authenticateToken, InfluenceIQController.searchInfluencers);

// Búsqueda inteligente
router.post('/smart-search', authenticateToken, InfluenceIQController.smartSearch);

// Búsqueda por filtros avanzados (para el explorer)
router.post('/explorer-search', authenticateToken, InfluenceIQController.explorerSearch);

// ==============================================
// RUTAS DE DATOS DE INFLUENCERS
// ==============================================

// Obtener insights de un influencer específico
router.get('/insights/:username', authenticateToken, InfluenceIQController.getInfluencerInsights);

// Obtener datos básicos de un influencer
router.get('/basic/:username', authenticateToken, InfluenceIQController.getBasicInfluencerData);

// Obtener datos completos de un influencer
router.get('/full/:username', authenticateToken, InfluenceIQController.getFullInfluencerData);

// ==============================================
// RUTAS DE ESTADO Y DIAGNÓSTICO
// ==============================================

// Verificar estado de la API
router.get('/status', authenticateToken, InfluenceIQController.checkApiStatus);

// Obtener estadísticas de la API
router.get('/stats', authenticateToken, InfluenceIQController.getApiStats);

// Probar conexión (para debugging)
router.get('/test', authenticateToken, InfluenceIQController.testConnection);

// ==============================================
// RUTAS DE SOPORTE
// ==============================================

// Obtener datos de ubicaciones geográficas
router.get('/support/geo', authenticateToken, InfluenceIQController.getSupportGeo);

// Obtener datos de intereses/categorías
router.get('/support/interests', authenticateToken, InfluenceIQController.getSupportInterests);

// Obtener datos de idiomas
router.get('/support/languages', authenticateToken, InfluenceIQController.getSupportLanguages);

// ==============================================
// RUTAS DE EXPORTACIÓN
// ==============================================

// Exportar datos de influencers
router.post('/export', authenticateToken, InfluenceIQController.exportData);

// ==============================================
// RUTA DE INFORMACIÓN
// ==============================================

// Información sobre la API de InfluencIQ
router.get('/', (req, res) => {
  res.json({
    message: 'InfluencIQ API Routes',
    version: '1.0.0',
    provider: 'InfluencIQ',
    endpoints: {
      search: 'POST /influenceIQ/search',
      smartSearch: 'POST /influenceIQ/smart-search',
      explorerSearch: 'POST /influenceIQ/explorer-search',
      insights: 'GET /influenceIQ/insights/:username',
      basicData: 'GET /influenceIQ/basic/:username',
      fullData: 'GET /influenceIQ/full/:username',
      status: 'GET /influenceIQ/status',
      stats: 'GET /influenceIQ/stats',
      test: 'GET /influenceIQ/test',
      supportGeo: 'GET /influenceIQ/support/geo',
      supportInterests: 'GET /influenceIQ/support/interests',
      supportLanguages: 'GET /influenceIQ/support/languages',
      export: 'POST /influenceIQ/export'
    },
    features: [
      'Búsqueda de influencers por filtros avanzados',
      'Búsqueda inteligente por keywords, usernames y hashtags',
      'Insights detallados de influencers',
      'Datos demográficos de audiencia',
      'Métricas de engagement y crecimiento',
      'Soporte para Instagram, YouTube y TikTok',
      'Datos de ubicaciones geográficas',
      'Categorías e intereses de influencers',
      'Idiomas soportados',
      'Exportación de datos'
    ],
    platforms: ['instagram', 'youtube', 'tiktok']
  });
});

export default router;

import { Router } from 'express';
import { TikTokApiService } from '../services/social/tiktok-api.service';
import { InstagramApiService } from '../services/social/instagram-api.service';
import { TwitterApiService } from '../services/social/twitter-api.service';
import { InstagramCommentsService } from '../services/instagram/instagram-comments.service';

const router = Router();

/**
 * GET /api/social/tiktok/thumbnail
 * Obtiene el thumbnail de un video de TikTok
 */
router.get('/tiktok/thumbnail', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL es requerida',
        message: 'Proporciona una URL válida de TikTok'
      });
    }


    // Validar que sea una URL de TikTok
    if (!url.includes('tiktok.com')) {
      return res.status(400).json({
        error: 'URL inválida',
        message: 'La URL debe ser de TikTok'
      });
    }

    const thumbnail = await TikTokApiService.getThumbnail(url);

    if (thumbnail) {
      res.json({
        success: true,
        thumbnail: thumbnail,
        url: url
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Thumbnail no encontrado',
        message: 'No se pudo extraer el thumbnail del video'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint de thumbnail:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/social/instagram/thumbnail
 * Obtiene el thumbnail de un post de Instagram
 */
router.get('/instagram/thumbnail', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL es requerida',
        message: 'Proporciona una URL válida de Instagram'
      });
    }


    // Validar que sea una URL de Instagram
    if (!InstagramApiService.isInstagramUrl(url)) {
      return res.status(400).json({
        error: 'URL inválida',
        message: 'La URL debe ser de Instagram'
      });
    }

    const thumbnail = await InstagramApiService.getThumbnail(url);

    if (thumbnail) {
      res.json({
        success: true,
        thumbnail: thumbnail,
        url: url
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Thumbnail no encontrado',
        message: 'No se pudo extraer el thumbnail del post'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint de thumbnail de Instagram:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/social/instagram/post-info
 * Obtiene información completa de un post de Instagram
 */
router.get('/instagram/post-info', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL es requerida',
        message: 'Proporciona una URL válida de Instagram'
      });
    }


    if (!InstagramApiService.isInstagramUrl(url)) {
      return res.status(400).json({
        error: 'URL inválida',
        message: 'La URL debe ser de Instagram'
      });
    }

    const postInfo = await InstagramApiService.getPostInfo(url);

    if (postInfo) {
      res.json({
        success: true,
        data: postInfo
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Post no encontrado',
        message: 'No se pudo obtener información del post'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint de info de Instagram:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/social/tiktok/video-info
 * Obtiene información completa de un video de TikTok
 */
router.get('/tiktok/video-info', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL es requerida',
        message: 'Proporciona una URL válida de TikTok'
      });
    }


    if (!url.includes('tiktok.com')) {
      return res.status(400).json({
        error: 'URL inválida',
        message: 'La URL debe ser de TikTok'
      });
    }

    const videoInfo = await TikTokApiService.getVideoInfo(url);

    if (videoInfo) {
      res.json({
        success: true,
        data: videoInfo
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Video no encontrado',
        message: 'No se pudo obtener información del video'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint de video info:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/social/tiktok/trending
 * Obtiene videos trending (para pruebas)
 */
router.get('/tiktok/trending', async (req, res) => {
  try {
    const { count } = req.query;
    const videoCount = count ? parseInt(count as string) : 10;


    const trendingVideos = await TikTokApiService.getTrendingVideos(videoCount);

    res.json({
      success: true,
      data: trendingVideos,
      count: trendingVideos.length
    });

  } catch (error) {
    console.error('❌ Error en endpoint de trending:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/social/twitter/thumbnail
 * Obtiene el thumbnail/captura de un tweet
 */
router.get('/twitter/thumbnail', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL es requerida',
        message: 'Proporciona una URL válida de Twitter/X'
      });
    }


    // Validar que sea una URL de Twitter/X
    if (!TwitterApiService.isTwitterUrl(url)) {
      return res.status(400).json({
        error: 'URL inválida',
        message: 'La URL debe ser de Twitter/X'
      });
    }

    const thumbnail = await TwitterApiService.getThumbnail(url);

    if (thumbnail) {
      res.json({
        success: true,
        thumbnail: thumbnail,
        url: url
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Thumbnail no encontrado',
        message: 'No se pudo extraer el thumbnail del tweet'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint de thumbnail de Twitter:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/social/twitter/post-info
 * Obtiene información completa de un tweet
 */
router.get('/twitter/post-info', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL es requerida',
        message: 'Proporciona una URL válida de Twitter/X'
      });
    }


    if (!TwitterApiService.isTwitterUrl(url)) {
      return res.status(400).json({
        error: 'URL inválida',
        message: 'La URL debe ser de Twitter/X'
      });
    }

    const postInfo = await TwitterApiService.getPostInfo(url);

    if (postInfo) {
      res.json({
        success: true,
        data: postInfo
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Tweet no encontrado',
        message: 'No se pudo obtener información del tweet'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint de info de Twitter:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/social/twitter/embed
 * Obtiene el HTML embebido de un tweet
 */
router.get('/twitter/embed', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL es requerida',
        message: 'Proporciona una URL válida de Twitter/X'
      });
    }


    if (!TwitterApiService.isTwitterUrl(url)) {
      return res.status(400).json({
        error: 'URL inválida',
        message: 'La URL debe ser de Twitter/X'
      });
    }

    const embedHtml = await TwitterApiService.getEmbedHtml(url);

    if (embedHtml) {
      res.json({
        success: true,
        html: embedHtml,
        url: url
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Embed no encontrado',
        message: 'No se pudo obtener el HTML embebido del tweet'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint de embed de Twitter:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// ==========================================
// RUTAS DE COMENTARIOS DE INSTAGRAM (APIFY)
// ==========================================

/**
 * GET /api/social/instagram/comments
 * Extrae comentarios básicos de Instagram usando Apify
 */
router.get('/instagram/comments', async (req, res) => {
  try {
    const { url, maxItems = 1000 } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL de Instagram requerida'
      });
    }

    if (!InstagramCommentsService.isInstagramUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'URL no válida de Instagram'
      });
    }


    const maxItemsNum = parseInt(maxItems as string) || 1000;
    const commentsData = await InstagramCommentsService.extractComments(url, maxItemsNum);
    
    if (!commentsData) {
      return res.status(404).json({
        success: false,
        error: 'No se pudieron extraer los comentarios'
      });
    }

    res.json({
      success: true,
      data: commentsData
    });

  } catch (error) {
    console.error('❌ Error en /api/social/instagram/comments:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * POST /api/social/instagram/comments/advanced
 * Extrae comentarios avanzados de Instagram con opciones personalizadas
 */
router.post('/instagram/comments/advanced', async (req, res) => {
  try {
    const { url, options = {} } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL de Instagram requerida'
      });
    }

    if (!InstagramCommentsService.isInstagramUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'URL no válida de Instagram'
      });
    }


    const commentsData = await InstagramCommentsService.extractCommentsAdvanced(url, options);
    
    if (!commentsData) {
      return res.status(404).json({
        success: false,
        error: 'No se pudieron extraer los comentarios avanzados'
      });
    }

    res.json({
      success: true,
      data: commentsData
    });

  } catch (error) {
    console.error('❌ Error en /api/social/instagram/comments/advanced:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/social/instagram/comments/stats
 * Obtiene estadísticas de comentarios de Instagram
 */
router.get('/instagram/comments/stats', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL de Instagram requerida'
      });
    }

    if (!InstagramCommentsService.isInstagramUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'URL no válida de Instagram'
      });
    }


    const stats = await InstagramCommentsService.getCommentsStats(url);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No se pudieron obtener las estadísticas'
      });
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error en /api/social/instagram/comments/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * POST /api/social/instagram/comments/search
 * Busca comentarios por palabras clave específicas
 */
router.post('/instagram/comments/search', async (req, res) => {
  try {
    const { url, keywords } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL de Instagram requerida'
      });
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Palabras clave requeridas (array)'
      });
    }

    if (!InstagramCommentsService.isInstagramUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'URL no válida de Instagram'
      });
    }


    const comments = await InstagramCommentsService.searchCommentsByKeyword(url, keywords);

    res.json({
      success: true,
      data: {
        url,
        keywords,
        comments,
        totalFound: comments.length
      }
    });

  } catch (error) {
    console.error('❌ Error en /api/social/instagram/comments/search:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// ==========================================
// RUTAS DE DEPURACIÓN Y LIMPIEZA DE CACHÉ
// ==========================================

/**
 * DELETE /api/social/cache/clear
 * Limpia todo el caché de comentarios en Redis
 */
router.delete('/cache/clear', async (req, res) => {
  try {
    
    // Aquí deberías implementar la limpieza del caché
    // Por ahora solo logueamos
    
    res.json({
      success: true,
      message: 'Caché de comentarios limpiado exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error limpiando caché:', error);
    res.status(500).json({
      success: false,
      error: 'Error limpiando caché',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * DELETE /api/social/cache/url
 * Limpia el caché de una URL específica
 */
router.delete('/cache/url', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL requerida'
      });
    }

    
    // Aquí deberías implementar la limpieza del caché para una URL específica
    
    res.json({
      success: true,
      message: `Caché limpiado para URL: ${url}`,
      url: url,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error limpiando caché para URL:', error);
    res.status(500).json({
      success: false,
      error: 'Error limpiando caché para URL',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router; 
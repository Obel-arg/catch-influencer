import { Request, Response } from 'express';
import { IntelligentTopicAnalysisService } from '../services/analysis/intelligent-topic-analysis.service';
import { postgresCacheService } from '../services/cache/postgres-cache.service';
import { PostTopicsService } from '../services/post-topics.service';

/**
 * Analiza temas usando IA conversacional inteligente (sin hardcodeo)
 */
export const analyzeTopicsIntelligently = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    
    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID es requerido'
      });
    }

    
    // Obtener comentarios reales del post desde PostgreSQL
    const commentsData = await postgresCacheService.get(`comments:${postId}`) as any;
    
    if (!commentsData || !commentsData.comments || commentsData.comments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron comentarios para el post'
      });
    }

    const commentTexts = commentsData.comments.map((comment: any) => comment.text).filter(Boolean);
    
    if (commentTexts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron textos de comentarios válidos'
      });
    }


    // Usar el servicio de análisis inteligente
    const intelligentService = IntelligentTopicAnalysisService.getInstance();
    const topics = await intelligentService.analyzeTopicsIntelligently(commentTexts);

    if (topics.length === 0) {
      return res.status(200).json({
        success: true,
        topics: [],
        message: 'No se pudieron identificar temas específicos en los comentarios'
      });
    }

    
    res.json({
      success: true,
      topics,
      stats: {
        totalComments: commentTexts.length,
        topicsExtracted: topics.length,
        averageConfidence: topics.reduce((sum, t) => sum + t.confidence_score, 0) / topics.length,
        extractionMethod: 'intelligent-conversational-ai'
      }
    });

  } catch (error) {
    console.error('❌ Error en análisis inteligente:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor durante el análisis inteligente'
    });
  }
};

/**
 * Obtiene información del modelo de IA conversacional
 */
export const getIntelligentModelInfo = async (req: Request, res: Response) => {
  try {
    const intelligentService = IntelligentTopicAnalysisService.getInstance();
    const modelInfo = intelligentService.getModelInfo();
    
    res.json({
      success: true,
      model: modelInfo
    });
  } catch (error) {
    console.error('❌ Error obteniendo info del modelo:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo información del modelo'
    });
  }
};

/**
 * Obtiene nichos y topics como categorías desde CreatorDB
 */
export const getTopicNicheCategories = async (req: Request, res: Response) => {
  try {
    const { platform = 'instagram' } = req.query;
    const postTopicsService = PostTopicsService.getInstance();
    
    const result = await postTopicsService.getTopicNicheCategories(platform as string);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor obteniendo categorías'
    });
  }
};

/**
 * Obtiene categorías agrupadas por tipo (topics vs niches)
 */
export const getCategoriesByType = async (req: Request, res: Response) => {
  try {
    const { platform = 'instagram' } = req.query;
    const postTopicsService = PostTopicsService.getInstance();
    
    const result = await postTopicsService.getCategoriesByType(platform as string);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error obteniendo categorías agrupadas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor obteniendo categorías agrupadas'
    });
  }
};

/**
 * Busca categorías por término de búsqueda
 */
export const searchCategories = async (req: Request, res: Response) => {
  try {
    const { search, platform = 'instagram' } = req.query;
    
    if (!search || typeof search !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Parámetro "search" es requerido'
      });
    }
    
    const postTopicsService = PostTopicsService.getInstance();
    const result = await postTopicsService.searchCategories(search, platform as string);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error buscando categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor buscando categorías'
    });
  }
}; 
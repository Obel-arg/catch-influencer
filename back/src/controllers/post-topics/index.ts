import { Request, Response } from 'express';
import { postTopicsService } from '../../services/post-topics.service';
import { IntelligentTopicResult } from '../../services/analysis/intelligent-topic-analysis.service';

interface PostTopic {
  topic_label: string;
  topic_description: string;
  keywords: string[];
  relevance_score: number;
  confidence_score: number;
  comment_count: number;
  sentiment_distribution: any;
  language_detected: string;
}

export class PostTopicsController {
  private postTopicsService = postTopicsService;

  /**
   * Obtiene todos los temas de un post
   */
  async getPostTopics(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      
      if (!postId) {
        return res.status(400).json({ error: 'Post ID es requerido' });
      }

      const topics = await this.postTopicsService.getPostTopics(postId);
      
      res.json({
        success: true,
        data: topics,
        count: topics.length
      });

    } catch (error) {
      console.error('Error obteniendo temas de post:', error);
      res.status(500).json({ 
        error: 'Error al obtener temas del post',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Analiza y extrae temas de los comentarios de un post
   */
  async analyzePostTopics(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { comments } = req.body;

      if (!postId) {
        return res.status(400).json({ error: 'Post ID es requerido' });
      }

      if (!comments || !Array.isArray(comments)) {
        return res.status(400).json({ error: 'Comments array es requerido' });
      }


      const result = await this.postTopicsService.analyzeAndSavePostTopics(postId, comments);

      res.json({
        success: true,
        data: result,
        message: `Análisis completado: ${result.summary.totalTopics} temas extraídos`
      });

    } catch (error) {
      console.error('Error analizando temas de post:', error);
      res.status(500).json({ 
        error: 'Error al analizar temas del post',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene estadísticas de los temas de un post
   */
  async getPostTopicsStats(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      
      if (!postId) {
        return res.status(400).json({ error: 'Post ID es requerido' });
      }

      const topics = await this.postTopicsService.getPostTopics(postId);
      
      if (topics.length === 0) {
        return res.json({
          success: true,
          data: {
            totalTopics: 0,
            highConfidenceTopics: 0,
            averageRelevance: 0,
            averageConfidence: 0,
            topKeywords: [],
            languagesDetected: [],
            message: 'No hay temas analizados para este post'
          }
        });
      }

      // Calcular estadísticas
      const highConfidenceTopics = topics.filter((t: IntelligentTopicResult) => t.confidence_score > 0.6).length;
      const averageRelevance = topics.reduce((sum: number, t: IntelligentTopicResult) => sum + t.relevance_score, 0) / topics.length;
      const averageConfidence = topics.reduce((sum: number, t: IntelligentTopicResult) => sum + t.confidence_score, 0) / topics.length;

      // Extraer top keywords
      const allKeywords: { [key: string]: number } = {};
      topics.forEach((topic: IntelligentTopicResult) => {
        topic.keywords.forEach((keyword: string) => {
          allKeywords[keyword] = (allKeywords[keyword] || 0) + topic.relevance_score;
        });
      });

      const topKeywords = Object.entries(allKeywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([keyword]) => keyword);

      // Idiomas detectados únicos
      const languagesDetected = [...new Set(topics.map((t: IntelligentTopicResult) => t.language_detected).filter((lang): lang is string => Boolean(lang)))];

      res.json({
        success: true,
        data: {
          totalTopics: topics.length,
          highConfidenceTopics,
          averageRelevance: Math.round(averageRelevance * 1000) / 1000,
          averageConfidence: Math.round(averageConfidence * 1000) / 1000,
          topKeywords,
          languagesDetected,
          topics: topics.map((topic: IntelligentTopicResult) => ({
            label: topic.topic_label,
            description: topic.topic_description,
            keywords: topic.keywords,
            relevance: Math.round(topic.relevance_score * 1000) / 1000,
            confidence: Math.round(topic.confidence_score * 1000) / 1000,
            commentCount: topic.comment_count,
            sentiments: topic.sentiment_distribution
          }))
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de temas:', error);
      res.status(500).json({ 
        error: 'Error al obtener estadísticas de temas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Elimina todos los temas de un post
   */
  async deletePostTopics(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      
      if (!postId) {
        return res.status(400).json({ error: 'Post ID es requerido' });
      }

      await this.postTopicsService.deletePostTopics(postId);

      res.json({
        success: true,
        message: 'Temas del post eliminados correctamente'
      });

    } catch (error) {
      console.error('Error eliminando temas de post:', error);
      res.status(500).json({ 
        error: 'Error al eliminar temas del post',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene información del modelo de IA usado
   */
  async getModelInfo(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          isLoaded: true,
          modelName: 'distilgpt2 / GPT-2 (fallback)',
          description: 'Modelo de lenguaje conversacional para análisis inteligente de temas sin hardcodeo.',
          capabilities: [
            'Análisis conversacional de contenido',
            'Extracción de temas contextualmente relevantes',
            'Comprensión de referencias culturales y sarcasmo',
            'Generación de títulos únicos y descriptivos',
            'Análisis de sentimiento contextual',
            'Compatible con Vercel serverless'
          ]
        }
      });

    } catch (error) {
      console.error('Error obteniendo información del modelo:', error);
      res.status(500).json({ 
        error: 'Error al obtener información del modelo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Devuelve solo los temas clave (keywords) del post más relevante
   */
  async getPostKeyTopics(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      if (!postId) {
        return res.status(400).json({ error: 'Post ID es requerido' });
      }
      const topics = await this.postTopicsService.getPostTopics(postId);
      if (!topics || topics.length === 0) {
        return res.json({ keywords: [] });
      }
      // Tomar el de mayor relevance_score
      const mainTopic = topics.sort((a, b) => b.relevance_score - a.relevance_score)[0];
      res.json({ keywords: mainTopic.keywords || [] });
    } catch (error) {
      console.error('Error obteniendo keywords de post:', error);
      res.status(500).json({ error: 'Error al obtener keywords del post' });
    }
  }
} 
import { Request, Response } from 'express';
import { PostMetricsService } from '../../services/post-metrics/post-metrics.service';
import supabase from '../../config/supabase';
import multer from 'multer';
import { BlobStorageService } from '../../services/blob-storage.service';

export class ManualMetricsController {
  private postMetricsService = new PostMetricsService();

  /**
   * Guardar métricas manuales para una historia de Instagram
   */
  async saveManualMetrics(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { likes, comments, views, impressions, alcance } = req.body;

      // Support both new field names (views, impressions) and legacy field (alcance)
      const viewsCount = views || alcance;
      const impressionsCount = impressions || alcance;

      if (!postId || (likes === undefined && comments === undefined && viewsCount === undefined && impressionsCount === undefined)) {
        return res.status(400).json({
          success: false,
          message: 'Post ID y al menos una métrica son requeridos'
        });
      }

      // Obtener información del post para validación
      const { data: post, error: postError } = await supabase
        .from('influencer_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        return res.status(404).json({
          success: false,
          message: 'Post no encontrado'
        });
      }

      // Validar que sea una historia de Instagram (check content_type first, fallback to URL pattern)
      const isInstagramStory = post.platform.toLowerCase() === 'instagram' &&
                               (post.content_type === 'story' || /instagram\.com\/stories\//i.test(post.post_url));

      if (!isInstagramStory) {
        return res.status(400).json({
          success: false,
          message: 'Solo se permiten métricas manuales para historias de Instagram'
        });
      }

      // Calcular engagement rate básico (en formato decimal 0-1, no porcentaje)
      const totalEngagement = (parseInt(likes) || 0) + (parseInt(comments) || 0);
      const reach = Math.max(parseInt(impressionsCount) || 0, parseInt(viewsCount) || 0, 1); // Use the higher value, minimum 1
      const engagementRate = Math.min(totalEngagement / reach, 1); // Máximo 1 (100%)

      // Crear el objeto de métricas
      const metricsData = {
        post_id: postId,
        platform: 'instagram' as const,
        content_id: this.extractStoryId(post.post_url),
        post_url: post.post_url,
        title: `Historia de ${post.influencers?.name || 'Instagram'}`,
        likes_count: parseInt(likes) || 0,
        comments_count: parseInt(comments) || 0,
        views_count: parseInt(viewsCount) || 0,
        engagement_rate: engagementRate,
        platform_data: {
          manual: true,
          impressions: parseInt(impressionsCount) || 0,
          storyId: this.extractStoryId(post.post_url),
          influencer: post.influencers?.name,
          savedAt: new Date().toISOString()
        },
        quota_used: 0, // Sin costo para métricas manuales
        api_timestamp: Date.now(),
        api_success: true,
        api_error: undefined,
        raw_response: {
          manual_metrics: {
            likes,
            comments,
            views: viewsCount,
            impressions: impressionsCount,
            alcance, // Keep for backwards compatibility
            saved_at: new Date().toISOString()
          }
        }
      };

      // Guardar en la base de datos
      const savedMetrics = await this.postMetricsService.createUserPostMetrics(metricsData);

      // Also update the influencer_posts table with the metrics
      await supabase
        .from('influencer_posts')
        .update({
          likes_count: parseInt(likes) || 0,
          comments_count: parseInt(comments) || 0,
          views_count: parseInt(viewsCount) || 0,
          impressions_count: parseInt(impressionsCount) || 0,
          updated_at: new Date()
        })
        .eq('id', postId);

      return res.json({
        success: true,
        message: 'Métricas guardadas exitosamente',
        data: savedMetrics
      });

    } catch (error) {
      console.error('❌ [MANUAL-METRICS] Error guardando métricas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Subir screenshot para una historia de Instagram
   */
  async uploadScreenshot(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const file = req.file;

    

      if (!postId) {
        return res.status(400).json({
          success: false,
          message: 'Post ID es requerido'
        });
      }

      if (!file) {
       
        return res.status(400).json({
          success: false,
          message: 'Archivo es requerido'
        });
      }

      // Obtener información del post para validación
      const { data: post, error: postError } = await supabase
        .from('influencer_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        return res.status(404).json({
          success: false,
          message: 'Post no encontrado'
        });
      }

      // Validar que sea una historia de Instagram (check content_type first, fallback to URL pattern)
      const isInstagramStory = post.platform.toLowerCase() === 'instagram' &&
                               (post.content_type === 'story' || /instagram\.com\/stories\//i.test(post.post_url));

      if (!isInstagramStory) {
        return res.status(400).json({
          success: false,
          message: 'Solo se permiten screenshots para historias de Instagram'
        });
      }

      // Subir imagen a blob storage
      const fileName = `stories/${postId}/screenshot_${Date.now()}.${file.originalname.split('.').pop()}`;
      const screenshotUrl = await BlobStorageService.uploadImageFromBuffer(
        file.buffer,
        file.mimetype,
        fileName
      );

     

      // Actualizar o crear métricas con la URL del screenshot
      const { data: existingMetrics } = await supabase
        .from('post_metrics')
        .select('*')
        .eq('post_id', postId)
        .single();

      const uploadedAt = new Date().toISOString();

      if (existingMetrics) {
        // Actualizar métricas existentes
        const currentRawResponse = existingMetrics.raw_response || {};
        const updatedRawResponse = {
          ...currentRawResponse,
          screenshot_url: screenshotUrl,
          screenshot_uploaded_at: uploadedAt
        };

        await supabase
          .from('post_metrics')
          .update({ raw_response: updatedRawResponse })
          .eq('post_id', postId);
      } else {
        // Crear nuevas métricas con screenshot
        const metricsData = {
          post_id: postId,
          platform: 'instagram' as const,
          content_id: this.extractStoryId(post.post_url),
          post_url: post.post_url,
          title: `Historia de ${post.influencers?.name || 'Instagram'}`,
          likes_count: 0,
          comments_count: 0,
          views_count: 0,
          engagement_rate: 0,
          platform_data: {
            manual: true,
            storyId: this.extractStoryId(post.post_url),
            influencer: post.influencers?.name,
            savedAt: uploadedAt
          },
          quota_used: 0,
          api_timestamp: Date.now(),
          api_success: true,
          api_error: undefined,
          raw_response: {
            screenshot_url: screenshotUrl,
            screenshot_uploaded_at: uploadedAt
          }
        };

        await this.postMetricsService.createUserPostMetrics(metricsData);
      }

     

      return res.json({
        success: true,
        message: 'Screenshot guardado exitosamente',
        data: {
          screenshotUrl,
          uploadedAt
        }
      });

    } catch (error) {
      console.error('❌ [MANUAL-METRICS] Error subiendo screenshot:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Sube una imagen personalizada para posts
   */
  async uploadPostImage(req: Request, res: Response) {
    try {
      
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo'
        });
      }

      // Generar nombre único para la imagen
      const fileName = `posts/custom_images/image_${Date.now()}.${file.originalname.split('.').pop()}`;
      
      // Subir imagen a blob storage
      const imageUrl = await BlobStorageService.uploadImageFromBuffer(
        file.buffer,
        file.mimetype,
        fileName
      );

      

      res.json({
        success: true,
        data: {
          imageUrl,
          uploadedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ [MANUAL-METRICS] Error subiendo imagen personalizada:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Extraer ID de la historia de la URL
   */
  private extractStoryId(url: string): string {
    const match = url.match(/instagram\.com\/stories\/[^\/]+\/([0-9]+)/i);
    return match ? match[1] : 'manual-story';
  }
}
import { Request, Response } from 'express';
import { campaignInsightsService } from '../../services/analysis/campaign-insights.service';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';

const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || ''
);

/**
 * Genera insights estratégicos para una campaña específica
 */
export const generateCampaignInsights = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID es requerido'
      });
    }

    // Obtener la campaña real desde la base de datos
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaña no encontrada'
      });
    }

    // Obtener los posts de la campaña
    const { data: posts, error: postsError } = await supabase
      .from('influencer_posts')
      .select('*')
      .eq('campaign_id', campaignId)
      .is('deleted_at', null);

    if (postsError) {
      console.error('Error obteniendo posts:', postsError);
      return res.status(500).json({
        success: false,
        error: 'Error obteniendo posts de la campaña'
      });
    }

    // Obtener posts con métricas usando la misma estructura que el frontend
    let postsWithMetrics = [];
    if (posts && posts.length > 0) {
      const postIds = posts.map(post => post.id);
      
      // Obtener métricas usando la misma query que el frontend
      const { data: allMetrics, error: metricsError } = await supabase
        .from('post_metrics')
        .select('*')
        .in('post_id', postIds)
        .order('created_at', { ascending: false });

      if (metricsError) {
        console.error('Error obteniendo métricas:', metricsError);
        postsWithMetrics = posts; // Usar posts sin métricas
      } else {
        // Agrupar métricas por post_id y tomar la más reciente
        const metricsByPost: Record<string, any> = {};
        allMetrics?.forEach(metric => {
          if (!metricsByPost[metric.post_id] || 
              new Date(metric.created_at) > new Date(metricsByPost[metric.post_id].created_at)) {
            metricsByPost[metric.post_id] = metric;
          }
        });

        // Combinar posts con sus métricas usando la misma estructura que el frontend
        postsWithMetrics = posts.map(post => {
          const postMetrics = metricsByPost[post.id];
          if (postMetrics && postMetrics.raw_response) {
            try {
              
              
              // Parsear el raw_response si es un string JSON
              const rawData = typeof postMetrics.raw_response === 'string' 
                ? JSON.parse(postMetrics.raw_response) 
                : postMetrics.raw_response;
              
              
              
              return {
                ...post,
                post_metrics: { 
                  raw_response: { 
                    data: rawData.data,
                    manual_metrics: rawData.manual_metrics  // ✅ INCLUIR manual_metrics también
                  } 
                }
              };
            } catch (e) {
              console.error('Error parsing raw_response for post:', post.id, e);
              return {
                ...post,
                post_metrics: null
              };
            }
          }
          return {
            ...post,
            post_metrics: null
          };
        });
      }
    }

    // Enriquecer la campaña con los posts y métricas
    const enrichedCampaign = {
      ...campaign,
      posts: postsWithMetrics
    };

    const insights = await campaignInsightsService.generateCampaignInsights(enrichedCampaign);

    res.json({
      success: true,
      data: insights,
      message: 'Insights generados exitosamente'
    });

  } catch (error) {
    console.error('❌ Error generando insights de campaña:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor durante la generación de insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtiene información del modelo de insights
 */
export const getInsightsModelInfo = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      model: {
        name: 'Campaign Insights AI',
        version: '1.0.0',
        capabilities: [
          'Análisis estratégico de campañas',
          'Insights de audiencia',
          'Recomendaciones de contenido',
          'Oportunidades de optimización',
          'Análisis de rendimiento'
        ],
        status: 'Activo'
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo info del modelo:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo información del modelo'
    });
  }
};
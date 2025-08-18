import { supabase } from '@/lib/supabase';

export interface SentimentAnalysisData {
  id: string;
  post_id: string;
  platform: 'youtube' | 'tiktok' | 'twitter' | 'instagram';
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_comments: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  analyzed_at: string;
  created_at: string;
  updated_at: string;
}

export class SentimentAnalysisService {
  
  /**
   * 🚀 OPTIMIZACIÓN: Obtiene análisis de sentimientos para múltiples posts en una sola petición
   */
  static async getSentimentAnalysisByPostIds(postIds: string[]): Promise<Record<string, SentimentAnalysisData>> {
    try {
      if (postIds.length === 0) return {};
      
      // Dividir en chunks para evitar límites de SQL
      const chunks = [];
      const chunkSize = 50; // Máximo 50 posts por petición
      for (let i = 0; i < postIds.length; i += chunkSize) {
        chunks.push(postIds.slice(i, i + chunkSize));
      }
      
      const results: Record<string, SentimentAnalysisData> = {};
      
      // Ejecutar chunks en paralelo
      await Promise.all(chunks.map(async (chunk) => {
        const { data, error } = await supabase
          .from('sentiment_analysis')
          .select('*')
          .in('post_id', chunk);

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error obteniendo análisis de sentimientos batch:', error);
          return;
        }

        if (data) {
          data.forEach(analysis => {
            results[analysis.post_id] = analysis;
          });
        }
      }));

      return results;
    } catch (error) {
      console.error('❌ Error en servicio de análisis de sentimientos batch:', error);
      return {};
    }
  }

  /**
   * Obtiene el análisis de sentimientos de un post por su ID
   */
  static async getSentimentAnalysisByPostId(postId: string): Promise<SentimentAnalysisData | null> {
    try {
      
      
      const { data, error } = await supabase
        .from('sentiment_analysis')
        .select('*')
        .eq('post_id', postId)
        .single();

   

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Error obteniendo análisis de sentimientos:', error);
        throw error;
      }

      if (error && error.code === 'PGRST116') {
       
        // Hacer una consulta adicional para ver todos los post_ids en la tabla
        const { data: allRecords, error: allError } = await supabase
          .from('sentiment_analysis')
          .select('post_id')
          .limit(10);
        
        if (allError) {
          console.error('❌ Error obteniendo todos los registros:', allError);
        } else {
        }
      }

      if (data) {
      }

      return data || null;
    } catch (error) {
      console.error('❌ Error en servicio de análisis de sentimientos:', error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas de sentimientos por plataforma
   */
  static async getSentimentStatsByPlatform(platform: 'youtube' | 'tiktok' | 'twitter' | 'instagram') {
    try {
      const { data, error } = await supabase
        .from('sentiment_analysis')
        .select('positive_count, negative_count, neutral_count, total_comments')
        .eq('platform', platform);

      if (error) {
        console.error('❌ Error obteniendo estadísticas de sentimientos:', error);
        throw error;
      }

      // Calcular totales
      const totals = data.reduce(
        (acc, curr) => ({
          positive: acc.positive + curr.positive_count,
          negative: acc.negative + curr.negative_count,
          neutral: acc.neutral + curr.neutral_count,
          total: acc.total + curr.total_comments
        }),
        { positive: 0, negative: 0, neutral: 0, total: 0 }
      );

      return {
        platform,
        posts_analyzed: data.length,
        ...totals,
        positive_percentage: totals.total > 0 ? (totals.positive / totals.total) * 100 : 0,
        negative_percentage: totals.total > 0 ? (totals.negative / totals.total) * 100 : 0,
        neutral_percentage: totals.total > 0 ? (totals.neutral / totals.total) * 100 : 0
      };
    } catch (error) {
      console.error('❌ Error en estadísticas de sentimientos:', error);
      return null;
    }
  }
} 
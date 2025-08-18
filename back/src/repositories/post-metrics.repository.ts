import supabase from '../config/supabase';
import { PostMetrics } from '../models/post-metrics/post-metrics.model';
import { PostMetrics as OptimizedPostMetrics, PostMetricsCreateDTO } from '../models/post-metrics/optimized-post-metrics.model';

export class PostMetricsRepository {
  /**
   * Crear nuevas métricas de post
   */
  async createPostMetrics(metrics: Omit<PostMetrics, 'id' | 'created_at' | 'updated_at'>): Promise<PostMetrics> {
    const { data, error } = await supabase
      .from('post_metrics')
      .insert([{
        ...metrics,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando métricas:', error);
      throw error;
    }

    return data;
  }

  /**
   * Obtener métricas de un post específico
   */
  async getPostMetricsByPostId(postId: string): Promise<PostMetrics[]> {
    const { data, error } = await supabase
      .from('post_metrics')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo métricas:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Actualizar métricas existentes
   */
  async updatePostMetrics(id: string, metrics: Partial<PostMetrics>): Promise<PostMetrics> {
    const { data, error } = await supabase
      .from('post_metrics')
      .update({
        ...metrics,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando métricas:', error);
      throw error;
    }

    return data;
  }

  /**
   * Eliminar métricas de un post
   */
  async deletePostMetrics(postId: string): Promise<void> {
    const { error } = await supabase
      .from('post_metrics')
      .delete()
      .eq('post_id', postId);

    if (error) {
      console.error('❌ Error eliminando métricas:', error);
      throw error;
    }
  }

  /**
   * Obtener métricas más recientes de un post
   */
  async getLatestPostMetrics(postId: string): Promise<PostMetrics | null> {
    const { data, error } = await supabase
      .from('post_metrics')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      console.error('❌ Error obteniendo métricas más recientes:', error);
      throw error;
    }

    return data;
  }

  /**
   * Crear métricas optimizadas usando la nueva estructura
   */
  async createOptimizedPostMetrics(metrics: PostMetricsCreateDTO): Promise<OptimizedPostMetrics> {
    const { data, error } = await supabase
      .from('post_metrics')
      .insert([metrics])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando métricas optimizadas:', error);
      throw error;
    }

    return data;
  }

  /**
   * Actualizar o crear análisis de comentarios en la columna JSONB
   */
  async updateCommentsAnalysis(
    postId: string, 
    commentsAnalysis: {
      comments: any[];
      sentiment_summary: any;
      topics: any[];
      metadata: any;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('post_metrics')
      .update({
        comments_analysis: commentsAnalysis,
        updated_at: new Date()
      })
      .eq('post_id', postId);

    if (error) {
      console.error('❌ Error actualizando análisis de comentarios:', error);
      throw error;
    }
  }

  /**
   * Obtener análisis de comentarios de un post
   */
  async getCommentsAnalysis(postId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('post_metrics')
      .select('comments_analysis')
      .eq('post_id', postId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      console.error('❌ Error obteniendo análisis de comentarios:', error);
      throw error;
    }

    return data?.comments_analysis || null;
  }

  /**
   * Buscar posts con análisis de comentarios
   */
  async findPostsWithCommentsAnalysis(): Promise<{ post_id: string; comments_analysis: any }[]> {
    const { data, error } = await supabase
      .from('post_metrics')
      .select('post_id, comments_analysis')
      .not('comments_analysis', 'is', null);

    if (error) {
      console.error('❌ Error buscando posts con análisis de comentarios:', error);
      throw error;
    }

    return data || [];
  }
} 
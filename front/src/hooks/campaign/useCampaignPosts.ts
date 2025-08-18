import { useState, useEffect } from 'react';
import { influencerPostService, InfluencerPost } from '@/lib/services/influencer-posts';
import { handleHookError } from '@/utils/httpErrorHandler';
import { CacheInvalidators } from '@/lib/http/cacheManager';

export const useCampaignPosts = (campaignId: string) => {
  const [posts, setPosts] = useState<InfluencerPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (!campaignId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Intentar obtener posts con métricas, si falla usar método básico
      let data: InfluencerPost[];
      try {
        data = await influencerPostService.getPostsByCampaignWithMetrics(campaignId);
      } catch (metricsError) {
        // Usar la función utility para manejar errores en el fallback
        if (handleHookError(metricsError, setError, 'Error al cargar posts con métricas')) {
          return; // Error ignorado (cancelación)
        }
        
        data = await influencerPostService.getPostsByCampaign(campaignId);
      }
      
      setPosts(data);
    } catch (err) {
      // Usar la función utility para manejar errores
      handleHookError(err, setError, 'Error al cargar los posts de la campaña');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [campaignId]);

  const refetch = () => {
    return fetchPosts();
  };

  const deletePost = async (postId: string) => {
    try {
      // Encontrar el post para obtener influencer_id antes de eliminarlo
      const postToDelete = posts.find(post => post.id === postId);
      
      await influencerPostService.deletePost(postId);
      
      // Actualizar el estado local removiendo el post eliminado
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // Invalidar cache relacionado
      if (postToDelete) {
        CacheInvalidators.onPostUpdate(campaignId, postToDelete.influencer_id);
      }
      
      return true;
    } catch (err) {
      // Usar la función utility para manejar errores
      if (handleHookError(err, setError, 'Error al eliminar el post')) {
        return false; // Error ignorado (cancelación)
      }
      
      throw new Error('Error al eliminar el post');
    }
  };

  // Estadísticas calculadas con métricas reales si están disponibles
  const stats = {
    total: posts.length,
    byPlatform: posts.reduce((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalLikes: posts.reduce((sum, post) => {
      const likes = post.post_metrics?.likes_count || post.likes_count || 0;
      return sum + likes;
    }, 0),
    totalComments: posts.reduce((sum, post) => {
      const comments = post.post_metrics?.comments_count || post.comments_count || 0;
      return sum + comments;
    }, 0),
    totalViews: posts.reduce((sum, post) => {
      const views = post.post_metrics?.views_count || 0;
      return sum + views;
    }, 0),
    averageEngagement: posts.length > 0 
      ? posts.reduce((sum, post) => {
          const likes = post.post_metrics?.likes_count || post.likes_count || 0;
          const comments = post.post_metrics?.comments_count || post.comments_count || 0;
          const engagement = likes + comments;
          return sum + engagement;
        }, 0) / posts.length 
      : 0,
    byRating: posts.reduce((acc, post) => {
      if (post.performance_rating) {
        acc[post.performance_rating] = (acc[post.performance_rating] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    posts,
    loading,
    error,
    refetch,
    deletePost,
    stats
  };
}; 
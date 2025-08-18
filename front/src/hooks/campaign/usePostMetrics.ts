import { useState, useCallback } from 'react';
import { InfluencerPostService } from '@/lib/services/influencer-posts';
import { CreateInfluencerPostDto } from '@/lib/services/influencer-posts';

export const usePostMetrics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const influencerPostService = InfluencerPostService.getInstance();

  const createPostWithMetrics = useCallback(async (postData: CreateInfluencerPostDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await influencerPostService.createPostWithMetrics(postData);
      
      // Mostrar notificación de éxito
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Post creado', {
            body: result.message,
            icon: '/favicon.ico'
          });
        }
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el post';
      setError(errorMessage);
      console.error('Error creating post with metrics:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [influencerPostService]);

  const getPostWithMetrics = useCallback(async (postId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await influencerPostService.getPostWithMetrics(postId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener métricas del post';
      setError(errorMessage);
      console.error('Error getting post metrics:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [influencerPostService]);

  const refreshPostMetrics = useCallback(async (postId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await influencerPostService.refreshPostMetrics(postId);
      
      // Mostrar notificación de éxito
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Métricas actualizadas', {
            body: result.message,
            icon: '/favicon.ico'
          });
        }
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar métricas';
      setError(errorMessage);
      console.error('Error refreshing post metrics:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [influencerPostService]);

  return {
    isLoading,
    error,
    createPostWithMetrics,
    getPostWithMetrics,
    refreshPostMetrics
  };
}; 
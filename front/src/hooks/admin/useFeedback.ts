import { useState, useEffect, useCallback } from 'react';

interface Feedback {
  id: string;
  user_id: string;
  message: string;
  status: 'pending' | 'resolved';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
  user_profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface FeedbackStats {
  total_pending: number;
  total_resolved: number;
}

export function useFeedback() {
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Cargar todos los feedbacks
  const loadFeedback = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/feedback/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al cargar feedbacks');

      const data = await response.json();
      setAllFeedback(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar feedbacks');
    }
  }, []);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/feedback/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al cargar estadísticas');

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    }
  }, []);

  // Cargar todos los datos
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadFeedback(), loadStats()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [loadFeedback, loadStats]);

  // Resolver feedback
  const resolveFeedback = useCallback(async (feedbackId: string) => {
    setUpdating(true);
    setError(null);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });

      if (!response.ok) throw new Error('Error al resolver feedback');

      await loadAll();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resolver feedback');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [loadAll]);

  // Eliminar feedback
  const deleteFeedback = useCallback(async (feedbackId: string) => {
    setDeleting(feedbackId);
    setError(null);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar feedback');

      await loadAll();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar feedback');
      return false;
    } finally {
      setDeleting(null);
    }
  }, [loadAll]);

  // Cargar datos iniciales
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadFeedback();
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadFeedback, loadStats]);

  return {
    // Estado
    allFeedback,
    stats,
    loading,
    error,
    updating,
    deleting,

    // Acciones
    loadAll,
    loadFeedback,
    loadStats,
    resolveFeedback,
    deleteFeedback,

    // Utilidades
    clearError: () => setError(null),
  };
}

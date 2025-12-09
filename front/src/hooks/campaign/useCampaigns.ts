import { useState, useCallback, useRef, useEffect } from 'react';
import { campaignService } from '@/lib/services/campaign';
import { Campaign, CampaignFilters } from '@/types/campaign';
import { CreateCampaignDto } from '@/types/campaign';
import { handleHookError } from '@/utils/httpErrorHandler';

// 🚀 CACHE INTELIGENTE: Implementación avanzada con stale-while-revalidate
interface CampaignCache {
  data: Campaign[];
  timestamp: number;
  loading: boolean;
  error?: string;
  promise?: Promise<Campaign[]>;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 minutos (aumentado de 5)
const STALE_TTL = 10 * 60 * 1000; // 10 minutos para considerar "stale"

class CampaignCacheManager {
  private cache: CampaignCache | null = null;
  private backgroundRevalidating = false;

  // 🚀 OPTIMIZACIÓN: Stale-while-revalidate pattern
  async get(userId: string, filters?: CampaignFilters, forceRefresh = false): Promise<Campaign[]> {

    // Si hay un request en progreso y no es force refresh, retornar la promesa existente
    if (this.cache?.promise && !forceRefresh) {
      return await this.cache.promise;
    }

    const now = Date.now();
    const hasCache = this.cache && this.cache.data && this.cache.data.length > 0;
    
    if (!forceRefresh && hasCache && this.cache) {
      const age = now - this.cache.timestamp;
      const isExpired = age > CACHE_TTL;
      const isStale = age > STALE_TTL;

      // Cache hit: datos frescos
      if (!isStale) {
        return this.cache.data;
      }

      // Stale-while-revalidate: retornar datos antiguos y actualizar en background
      if (!isExpired && !this.backgroundRevalidating) {
        this.backgroundRevalidating = true;
        
        // Actualizar en background sin esperar
        this.fetchFresh(userId, filters)
          .then(freshData => {
            this.cache = {
              data: freshData,
              timestamp: Date.now(),
              loading: false
            };
          })
          .catch(error => {
            console.warn('⚠️ [CampaignCache] Background revalidation failed:', error);
          })
          .finally(() => {
            this.backgroundRevalidating = false;
          });

        return this.cache.data;
      }

      // Cache expired: necesitamos datos frescos
      if (isExpired) {
      }
    }

    // No cache o force refresh: fetch nuevo
    return await this.fetchFresh(userId, filters);
  }

  private async fetchFresh(userId: string, filters?: CampaignFilters): Promise<Campaign[]> {
    
    try {
      // Crear promise para evitar requests duplicados
      const promise = campaignService.getCampaignsWithMetrics(filters);
      
      if (this.cache) {
        this.cache.promise = promise;
        this.cache.loading = true;
        this.cache.error = undefined;
      } else {
        this.cache = {
          data: [],
          timestamp: 0,
          loading: true,
          promise
        };
      }

      const freshData = await promise;
      
      // Actualizar cache con datos frescos
      this.cache = {
        data: freshData,
        timestamp: Date.now(),
        loading: false
      };

     
      return freshData;

    } catch (error) {
      console.error('❌ [CampaignCache] Error in fetchFresh:', error);
      if (this.cache) {
        this.cache.loading = false;
        this.cache.error = error instanceof Error ? error.message : 'Unknown error';
        this.cache.promise = undefined;
      }
      throw error;
    }
  }

  // 🚀 OPTIMIZACIÓN: Invalidación selectiva
  invalidate(campaignId?: string) {
    if (campaignId) {
      // Invalidación parcial: solo marcar como stale para triggerar background refresh
      if (this.cache) {
        this.cache.timestamp = Date.now() - STALE_TTL - 1000; // Forzar stale
       
      }
    } else {
      // Invalidación completa
      this.cache = null;
      this.backgroundRevalidating = false;
     
    }
  }

  // 🚀 OPTIMIZACIÓN: Pre-warming del cache
  async warmup(userId: string, filters?: CampaignFilters) {
    if (!this.cache) {
     
      try {
        await this.get(userId, filters);
      } catch (error) {
        console.warn('⚠️ [CampaignCache] Cache warmup failed:', error);
      }
    }
  }

  // 🚀 NEW: Update a specific campaign in the cache
  updateCampaignInCache(campaignId: string, updates: Partial<Campaign>) {
    if (this.cache && this.cache.data) {
      this.cache.data = this.cache.data.map(campaign =>
        campaign.id === campaignId ? { ...campaign, ...updates } : campaign
      );
      console.log('🌟 [CampaignCache] Updated campaign in cache:', campaignId, updates);
    }
  }

  // Debug info
  getStats() {
    return {
      hasCache: !!this.cache,
      dataCount: this.cache?.data?.length || 0,
      age: this.cache ? Date.now() - this.cache.timestamp : 0,
      loading: this.cache?.loading || false,
      backgroundRevalidating: this.backgroundRevalidating,
      error: this.cache?.error
    };
  }
}

// Instancia global del cache manager
const campaignCache = new CampaignCacheManager();

// 🚀 Exponer para debugging en desarrollo
if (typeof window !== 'undefined') {
  (window as any).debugCampaignCache = () => {
    const stats = campaignCache.getStats();
    console.table(stats);
    return stats;
  };
  (window as any).invalidateCampaignCache = (campaignId?: string) => {
    campaignCache.invalidate(campaignId);
  };
}

export const useCampaigns = () => {
  const [loading, setLoading] = useState(true); // Arranca en true para mostrar loader desde el inicio
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Flag para prevenir peticiones duplicadas simultáneas
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const getCampaigns = useCallback(async (filters?: CampaignFilters): Promise<Campaign[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.getCampaigns(filters);
      setCampaigns(data);
      return data;
    } catch (err) {
      // Usar la función utility para manejar errores
      if (handleHookError(err, setError, 'Error al obtener campañas')) {
        return []; // Error ignorado (cancelación)
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚀 OPTIMIZACIÓN CRÍTICA: getCampaignsWithMetrics con cache inteligente
  const getCampaignsWithMetrics = useCallback(async (filters?: CampaignFilters, forceRefresh = false): Promise<any[]> => {
    // Prevenir peticiones duplicadas simultáneas
    if (isLoadingRef.current && !forceRefresh) {
      return campaigns;
    }

    try {
      isLoadingRef.current = true;
      // 🚀 OPTIMIZACIÓN: Solo mostrar loading si no hay datos en cache
      const shouldShowLoading = !hasLoadedRef.current || forceRefresh;
      if (shouldShowLoading) {
        setLoading(true);
      }
      
      setError(null);
      
      // 🚀 CACHE INTELIGENTE: Usar cache manager avanzado
      const data = await campaignCache.get('current-user', filters, forceRefresh);
      
      // Actualizar el estado con los datos recibidos
      setCampaigns(data || []);
      hasLoadedRef.current = true;
     
      return data || [];

    } catch (err) {
      console.error('❌ [useCampaigns] Error fetching campaigns:', err);
      
      // Usar la función utility para manejar errores
      const wasIgnored = handleHookError(err, setError, 'Error al obtener campañas con métricas');
      if (wasIgnored) {
        // Error de cancelación ignorado - mantener estado actual
        return campaigns;
      }
      // Error real - mantener datos existentes si los hay
      return campaigns.length > 0 ? campaigns : [];
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [campaigns]);

  const getCampaignById = useCallback(async (id: string): Promise<Campaign | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.getCampaignById(id);
      return data;
    } catch (err) {
      // Usar la función utility para manejar errores
      handleHookError(err, setError, 'Error al obtener campaña');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚀 OPTIMIZACIÓN: createCampaign con invalidación inteligente
  const createCampaign = useCallback(async (campaign: Partial<Campaign>): Promise<Campaign | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.createCampaign(campaign as CreateCampaignDto);
      
      // 🚀 OPTIMIZACIÓN: Invalidar cache después de crear
      if (data) {
        campaignCache.invalidate();
        
        // Disparar evento para notificar a otros componentes
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent("campaign-cache-invalidated"));
        }
      }
      
      return data;
    } catch (err) {
      // Usar la función utility para manejar errores
      handleHookError(err, setError, 'Error al crear campaña');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, campaign: Partial<Campaign>): Promise<Campaign | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Convertir las fechas string a Date para cumplir con UpdateCampaignDto
      const updateData: any = { ...campaign };
      if (updateData.start_date && typeof updateData.start_date === 'string') {
        updateData.start_date = new Date(updateData.start_date);
      }
      if (updateData.end_date && typeof updateData.end_date === 'string') {
        updateData.end_date = new Date(updateData.end_date);
      }
      
      const data = await campaignService.updateCampaign(id, updateData);
      
      // 🚀 OPTIMIZACIÓN: Invalidación selectiva después de actualizar
      if (data) {
        campaignCache.invalidate(id);
        
        // Disparar evento para notificar a otros componentes
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent("campaign-cache-invalidated"));
        }
      }
      
      return data;
    } catch (err) {
      // Usar la función utility para manejar errores
      handleHookError(err, setError, 'Error al actualizar campaña');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCampaign = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await campaignService.deleteCampaign(id);
      
      // 🚀 OPTIMIZACIÓN: Invalidar cache después de eliminar
      campaignCache.invalidate();
      
      // Disparar evento para notificar a otros componentes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent("campaign-cache-invalidated"));
      }
      
      return true;
    } catch (err) {
      // Usar la función utility para manejar errores
      if (handleHookError(err, setError, 'Error al eliminar campaña')) {
        return false; // Error ignorado (cancelación)
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addInfluencerToCampaign = useCallback(async (campaignId: string, influencerId: string, assignedBudget: number = 0): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await campaignService.addInfluencerToCampaign(campaignId, influencerId, assignedBudget);
      
      // 🚀 OPTIMIZACIÓN: Invalidación selectiva después de agregar influencer
      campaignCache.invalidate(campaignId);
     
      
      return true;
    } catch (err) {
      // Usar la función utility para manejar errores
      if (handleHookError(err, setError, 'Error al agregar influencer')) {
        return false; // Error ignorado (cancelación)
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeInfluencerFromCampaign = useCallback(async (campaignId: string, influencerId: string): Promise<boolean> => {
    

    try {
      setLoading(true);
      setError(null);
      
      await campaignService.removeInfluencerFromCampaign(campaignId, influencerId);
      
      
      // 🚀 OPTIMIZACIÓN: Invalidación selectiva después de remover influencer
      campaignCache.invalidate(campaignId);
      
        
      
      return true;
    } catch (err) {
      
      // Usar la función utility para manejar errores
      if (handleHookError(err, setError, 'Error al remover influencer')) {
        
        return false; // Error ignorado (cancelación)
      }
      
      return false;
    } finally {
      setLoading(false);
      
    }
  }, []);

  // 🚀 OPTIMISTA: Crear campaña y actualizar estado local antes del refetch
  const createCampaignOptimistic = useCallback(async (campaign: Partial<Campaign>): Promise<Campaign | null> => {
    try {
      setLoading(true);
      setError(null);
      // 1. Crear en backend
      const data = await campaignService.createCampaign(campaign as CreateCampaignDto);
      // 2. Actualización optimista: agregar al estado local
      if (data) {
        setCampaigns(prev => [data, ...prev]);
        campaignCache.invalidate();
      }
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al crear campaña');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚀 OPTIMISTA: Editar campaña y actualizar estado local antes del refetch
  const updateCampaignOptimistic = useCallback(async (id: string, campaign: Partial<Campaign>): Promise<Campaign | null> => {
    try {
      setLoading(true);
      setError(null);
      // Corregir tipos: convertir fechas string a Date
      const updateData: any = { ...campaign };
      if (updateData.start_date && typeof updateData.start_date === 'string') {
        updateData.start_date = new Date(updateData.start_date);
      }
      if (updateData.end_date && typeof updateData.end_date === 'string') {
        updateData.end_date = new Date(updateData.end_date);
      }
      const data = await campaignService.updateCampaign(id, updateData);
      if (data) {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...campaign } : c));
        campaignCache.invalidate(id);
      }
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al actualizar campaña');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚀 OPTIMISTA: Eliminar campaña y actualizar estado local antes del refetch
  const deleteCampaignOptimistic = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await campaignService.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      campaignCache.invalidate();
      
      // Disparar evento para notificar a otros componentes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent("campaign-cache-invalidated"));
      }
      
      return true;
    } catch (err) {
      if (handleHookError(err, setError, 'Error al eliminar campaña')) {
        return false;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ⭐ TOGGLE FAVORITE: Optimistic update for instant UI feedback
  const toggleCampaignFavorite = useCallback(async (
    campaignId: string,
    currentlyFavorited: boolean
  ): Promise<boolean> => {
    console.log('🌟 [toggleCampaignFavorite] Starting...', { campaignId, currentlyFavorited });

    const newFavoritedValue = !currentlyFavorited;

    try {
      // 1. Optimistic update: Update local state immediately
      setCampaigns(prev => {
        console.log('🌟 [toggleCampaignFavorite] Current campaigns count:', prev.length);
        const updated = prev.map(c =>
          c.id === campaignId ? { ...c, is_favorited: newFavoritedValue } : c
        );
        console.log('🌟 [toggleCampaignFavorite] Updated campaign:', updated.find(c => c.id === campaignId));
        return updated;
      });

      // 2. Update the cache with the new value to prevent it from being overwritten
      campaignCache.updateCampaignInCache(campaignId, { is_favorited: newFavoritedValue });

      // 3. Send request to backend
      console.log('🌟 [toggleCampaignFavorite] Sending to backend...');
      await campaignService.toggleFavorite(campaignId, currentlyFavorited);
      console.log('🌟 [toggleCampaignFavorite] Backend update successful');

      return true;
    } catch (err) {
      console.error('❌ [useCampaigns] Error toggling favorite:', err);

      // Rollback optimistic update on error (both state and cache)
      setCampaigns(prev => prev.map(c =>
        c.id === campaignId ? { ...c, is_favorited: currentlyFavorited } : c
      ));
      campaignCache.updateCampaignInCache(campaignId, { is_favorited: currentlyFavorited });

      handleHookError(err, setError, 'Error al actualizar favorito');
      return false;
    }
  }, []);

  // 🚀 LISTENER PARA INVALIDACIÓN DE CACHE
  useEffect(() => {
    const handleCacheInvalidation = () => {

      getCampaignsWithMetrics(undefined, true); // Force refresh
    };

    // Agregar listener para invalidación de cache
    if (typeof window !== 'undefined') {
      window.addEventListener('campaign-cache-invalidated', handleCacheInvalidation);
      
      return () => {
        window.removeEventListener('campaign-cache-invalidated', handleCacheInvalidation);
      };
    }
  }, [getCampaignsWithMetrics]);

  return {
    loading,
    error,
    campaigns,
    getCampaigns,
    getCampaignsWithMetrics,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    addInfluencerToCampaign,
    removeInfluencerFromCampaign,
    toggleCampaignFavorite, // ⭐ NEW
    // 🚀 OPTIMISTAS
    createCampaignOptimistic,
    updateCampaignOptimistic,
    deleteCampaignOptimistic
  };
}; 
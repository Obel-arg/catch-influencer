import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Campaign } from '@/types/campaign';
import { campaignService } from '@/lib/services/campaign';
import { influencerPostService } from '@/lib/services/influencer-posts';
import { handleHttpError } from '@/utils/httpErrorHandler';

interface CampaignInfluencer {
  id: string;
  influencers: {
    id: string;
    name: string;
    followers_count: number;
    avatar: string;
    average_engagement_rate: number;
    status: string;
    platform_info: any;
  } | null;
}

interface CampaignPost {
  id: string;
  influencer_id: string;
  campaign_id: string;
  platform: string;
  post_date?: string;
  post_metrics?: {
    likes_count?: number;
    comments_count?: number;
    views_count?: number;
    engagement_rate?: number;
    raw_response?: any;
  };
}

interface CampaignContextData {
  // Datos básicos
  campaign: Campaign | null;
  influencers: CampaignInfluencer[];
  posts: CampaignPost[];
  
  // Estados de carga
  loading: boolean;
  influencersLoading: boolean;
  postsLoading: boolean;
  
  // Errores
  error: string | null;
  
  // Funciones
  refetch: () => void;
  updateInfluencers: (influencers: CampaignInfluencer[]) => void;
  
  // Datos derivados
  postsCountByInfluencer: Record<string, number>;
  platformsByInfluencer: Record<string, string[]>;
  totalPosts: number;
  totalInfluencers: number;
}

const CampaignContext = createContext<CampaignContextData | undefined>(undefined);

export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaignContext must be used within a CampaignProvider');
  }
  return context;
};

// Hook opcional que no falla si está fuera del provider
export const useOptionalCampaignContext = () => {
  const context = useContext(CampaignContext);
  return context; // Retorna null si no hay provider
};

// 🚀 OPTIMIZACIÓN CRÍTICA: Cache global simple para campañas
const campaignCache = new Map<string, {
  campaign: Campaign;
  timestamp: number;
  ttl: number;
}>();

// 🚀 OPTIMIZACIÓN: Función para obtener campaña desde cache o lista
const getCampaignFromCacheOrList = (campaignId: string): Campaign | null => {
  // 🚀 SSR SAFETY: Verificar que estamos en el cliente
  if (typeof window === 'undefined') {
    return null;
  }

  // 1. Verificar cache directo
  const cached = campaignCache.get(campaignId);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.campaign;
  }

  // 2. Buscar en localStorage (cache de lista de campañas)
  try {
    const campaignsCache = localStorage.getItem('campaigns-cache');
    if (campaignsCache) {
      const parsedCache = JSON.parse(campaignsCache);
      if (parsedCache.data && Array.isArray(parsedCache.data)) {
        const foundCampaign = parsedCache.data.find((c: Campaign) => c.id === campaignId);
        if (foundCampaign) {
          // Actualizar cache local
          campaignCache.set(campaignId, {
            campaign: foundCampaign,
            timestamp: Date.now(),
            ttl: 5 * 60 * 1000 // 5 minutos
          });
          return foundCampaign;
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ [CampaignProvider] Error reading campaigns cache:', error);
  }

  return null;
};

interface CampaignProviderProps {
  children: React.ReactNode;
  campaignId: string;
}

export const CampaignProvider = ({ children, campaignId }: CampaignProviderProps) => {
  // 🚀 OPTIMIZACIÓN CRÍTICA: Inicializar SOLO en el cliente para evitar SSR issues
  const [campaign, setCampaign] = useState<Campaign | null>(() => {
    // 🚀 SSR SAFETY: Solo intentar cache en el cliente
    if (typeof window === 'undefined') {
      return null;
    }
    
    return getCampaignFromCacheOrList(campaignId);
  });
  
  const [influencers, setInfluencers] = useState<CampaignInfluencer[]>([]);
  const [posts, setPosts] = useState<CampaignPost[]>([]);
  
  // 🚀 OPTIMIZACIÓN CRÍTICA: NUNCA bloquear navegación inicial
  const [loading] = useState(false); // Siempre false para navegación instantánea
  const [influencersLoading, setInfluencersLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // 🚀 OPTIMIZACIÓN: Función para cargar campaña SOLO si no está en cache
  const loadCampaign = useCallback(async () => {
    if (!campaignId) return;
    
    // Si ya tenemos la campaña Y tiene goals, no cargar de nuevo
    if (campaign && campaign.goals) {
      return;
    }
    
    // 🚀 SSR SAFETY: Solo cargar en el cliente
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      
      const campaignData = await campaignService.getCampaignById(campaignId);
      setCampaign(campaignData);
      
      // Actualizar cache
      campaignCache.set(campaignId, {
        campaign: campaignData,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000
      });
      
    } catch (err) {
      const isErrorIgnored = handleHttpError(err, 'Error loading campaign');
      if (!isErrorIgnored) {
        setError('Error al cargar la campaña');
        console.error('❌ [CampaignProvider] Campaign load failed:', err);
      }
    }
  }, [campaignId, campaign]);

  // 🚀 OPTIMIZACIÓN: Función para cargar influencers COMPLETAMENTE ASYNC
  const loadInfluencers = useCallback(async () => {
    if (!campaignId || typeof window === 'undefined') return;
    
    try {
      setInfluencersLoading(true);
      
      const influencersData = await campaignService.getCampaignInfluencers(campaignId);
      setInfluencers(influencersData);
      
    } catch (err) {
      if (!handleHttpError(err, 'Error loading influencers')) {
        console.error('❌ [CampaignProvider] Influencers load failed:', err);
      }
    } finally {
      setInfluencersLoading(false);
    }
  }, [campaignId]);

  // 🚀 OPTIMIZACIÓN: Función para cargar posts COMPLETAMENTE ASYNC
  const loadPosts = useCallback(async () => {
    if (!campaignId || typeof window === 'undefined') return;
    
    try {
      setPostsLoading(true);
      
      const postsData = await influencerPostService.getPostsByCampaignWithMetrics(campaignId);
      setPosts(postsData);
      
    } catch (err) {
      if (!handleHttpError(err, 'Error loading posts')) {
        console.error('❌ [CampaignProvider] Posts load failed:', err);
      }
    } finally {
      setPostsLoading(false);
    }
  }, [campaignId]);

  // 🚀 OPTIMIZACIÓN: Función para refrescar todos los datos
  const refetch = useCallback(() => {
    
    // Limpiar cache para forzar recarga
    campaignCache.delete(campaignId);
    setCampaign(null);
    
    return Promise.all([
      loadCampaign(),
      loadInfluencers(),
      loadPosts()
    ]).catch(error => {
      console.error('❌ [CampaignProvider] Error refetching campaign data:', error);
    });
  }, [campaignId, loadCampaign, loadInfluencers, loadPosts]);

  // 🚀 OPTIMIZACIÓN CRÍTICA: Carga ULTRA-RÁPIDA en paralelo
  useEffect(() => {
    if (!campaignId || typeof window === 'undefined') return;
    
    // 🎯 CARGA INSTANTÁNEA: Todo en paralelo desde el primer momento
    const loadAllDataInParallel = async () => {
      try {
        
        // 🚀 CRÍTICO: Ejecutar TODOS los requests simultaneamente
        
        const promises = [];
        
        // 🚀 VERIFICACIÓN DE CACHE GLOBAL: Antes de hacer peticiones
        const globalCampaignCache = (window as any).campaignCache || new Map();
        const globalInfluencersCache = (window as any).campaignInfluencersCache || new Map();
        const globalPostsCache = (window as any).campaignPostsCache || new Map();
        
        const now = Date.now();
        const CACHE_VALID_TIME = 5 * 60 * 1000; // 5 minutos para considerar válido (aumentado de 3)
        
        // Promise 1: Campaña básica (verificar cache primero)
        if (!campaign) {
          const cachedCampaign = globalCampaignCache.get(campaignId);
          if (cachedCampaign && (now - cachedCampaign.timestamp) < CACHE_VALID_TIME) {
            setCampaign(cachedCampaign.campaign);
          } else {
            promises.push(
              campaignService.getCampaignById(campaignId)
                .then(campaignData => {
                  setCampaign(campaignData);
                  
                  // Actualizar cache inmediatamente
                  campaignCache.set(campaignId, {
                    campaign: campaignData,
                    timestamp: Date.now(),
                    ttl: 5 * 60 * 1000
                  });
                  
                  // Actualizar cache global también
                  globalCampaignCache.set(campaignId, {
                    campaign: campaignData,
                    timestamp: Date.now(),
                    ttl: 5 * 60 * 1000
                  });
                  
                  return { type: 'campaign', data: campaignData };
                })
                .catch(err => {
                  console.error('❌ [Parallel] Campaign load failed:', err);
                  if (!handleHttpError(err, 'Error loading campaign')) {
                    setError('Error al cargar la campaña');
                  }
                  return { type: 'campaign', error: err };
                })
            );
          }
        }
        
        // Promise 2: Influencers (verificar cache primero)
        const cachedInfluencers = globalInfluencersCache.get(campaignId);
        if (cachedInfluencers && (now - cachedInfluencers.timestamp) < CACHE_VALID_TIME) {
          setInfluencers(cachedInfluencers.data);
        } else {
          setInfluencersLoading(true);
          promises.push(
            campaignService.getCampaignInfluencers(campaignId)
              .then(influencersData => {
                setInfluencers(influencersData);
                
                // Actualizar cache global
                globalInfluencersCache.set(campaignId, {
                  data: influencersData,
                  timestamp: Date.now(),
                  ttl: 5 * 60 * 1000
                });
                
                return { type: 'influencers', data: influencersData };
              })
              .catch(err => {
                console.error('❌ [Parallel] Influencers load failed:', err);
                handleHttpError(err, 'Error loading influencers');
                return { type: 'influencers', error: err };
              })
              .finally(() => setInfluencersLoading(false))
          );
        }
        
        // Promise 3: Posts (verificar cache primero)
        const cachedPosts = globalPostsCache.get(campaignId);
        if (cachedPosts && (now - cachedPosts.timestamp) < CACHE_VALID_TIME) {
          setPosts(cachedPosts.data);
        } else {
          setPostsLoading(true);
          promises.push(
            influencerPostService.getPostsByCampaignWithMetrics(campaignId)
              .then(postsData => {
                setPosts(postsData);
                
                // Actualizar cache global
                globalPostsCache.set(campaignId, {
                  data: postsData,
                  timestamp: Date.now(),
                  ttl: 5 * 60 * 1000
                });
                
                return { type: 'posts', data: postsData };
              })
              .catch(err => {
                console.error('❌ [Parallel] Posts load failed:', err);
                handleHttpError(err, 'Error loading posts');
                return { type: 'posts', error: err };
              })
              .finally(() => setPostsLoading(false))
          );
        }
        
        // 🚀 SOLO EJECUTAR PROMESAS SI HAY ALGO QUE CARGAR
        if (promises.length > 0) {
          // 🚀 EJECUCIÓN PARALELA: Todos los requests al mismo tiempo
          const results = await Promise.allSettled(promises);

          // 🚀 ANÁLISIS DE RESULTADOS
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              // Resultado procesado correctamente
            } else {
              console.error(`❌ [Parallel] Request ${index + 1} failed:`, result.reason);
            }
          });
        }
        
      } catch (error) {
        console.error('❌ [CampaignProvider] Parallel loading failed:', error);
        setError('Error al cargar datos de la campaña');
      }
    };

    // 🚀 EJECUTAR INMEDIATAMENTE: Sin delays, máxima velocidad
    loadAllDataInParallel();
  }, [campaignId, campaign]); // Incluir campaign para evitar warning

  // Calcular datos derivados
  const postsCountByInfluencer = React.useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(post => {
      counts[post.influencer_id] = (counts[post.influencer_id] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const platformsByInfluencer = React.useMemo(() => {
    const result: Record<string, string[]> = {};

    const normalizePlatformName = (platform: string): string => {
      const lower = platform.toLowerCase();
      if (lower === 'x') return 'twitter';
      if (lower === 'youtube shorts' || lower === 'shorts' || lower === 'ytshorts') return 'youtube';
      return lower;
    };

    const addPlatform = (influencerId: string, platform?: string) => {
      if (!platform) return;
      const normalized = normalizePlatformName(platform);
      if (!result[influencerId]) result[influencerId] = [];
      if (!result[influencerId].includes(normalized)) {
        result[influencerId].push(normalized);
      }
    };

    // 1) Agregar todas las plataformas declaradas en el perfil del influencer
    influencers.forEach((ci) => {
      const inf = ci.influencers;
      if (!inf) return;
      const id = inf.id;
      if (!id) return;

      // main_social_platform (string)
      if (inf.main_social_platform) addPlatform(id, inf.main_social_platform);

      // social_platforms (array u objeto)
      const sp: any = (inf as any).social_platforms;
      if (Array.isArray(sp)) {
        sp.forEach((p: any) => addPlatform(id, typeof p === 'string' ? p : p?.platform));
      } else if (sp && typeof sp === 'object') {
        Object.keys(sp).forEach((key) => addPlatform(id, key));
      }

      // platform_info (objeto con claves por plataforma)
      const pi: any = (inf as any).platform_info;
      if (pi && typeof pi === 'object') {
        Object.keys(pi).forEach((key) => {
          if (pi[key]) addPlatform(id, key);
        });
      }
    });

    // 2) Unir con las plataformas detectadas por posts en la campaña
    posts.forEach((post) => {
      addPlatform(post.influencer_id, post.platform);
    });

    return result;
  }, [influencers, posts]);

  const contextValue: CampaignContextData = {
    campaign,
    influencers,
    posts,
    loading,
    influencersLoading,
    postsLoading,
    error,
    refetch,
    updateInfluencers: setInfluencers, // Agregar la función de actualización
    postsCountByInfluencer,
    platformsByInfluencer,
    totalPosts: posts.length,
    totalInfluencers: influencers.length,
  };

  return (
    <CampaignContext.Provider value={contextValue}>
      {children}
    </CampaignContext.Provider>
  );
}; 
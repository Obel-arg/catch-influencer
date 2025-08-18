import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Instagram,
  Youtube,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart2,
  Users,
  Star,
  Info,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Campaign } from "@/types/campaign";
import { useState, useMemo, useEffect, useRef } from "react";
import { useCampaignPlatforms } from "@/hooks/campaign/useCampaignPlatforms";
import { useCampaignContext } from "@/contexts/CampaignContext";
import { PlatformSkeleton } from "./PlatformSkeleton";
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar";

// Función para calcular el performance score (copiada de CampaignStatsSection.tsx)
const calculatePerformanceScore = (influencer: any): number => {
  if (!influencer) return 0;

  const followers = influencer.followers_count || 0;
  const engagement = influencer.average_engagement_rate || 0;

  // Cálculo simple de performance basado en engagement y seguidores
  let score = 0;

  // Engagement score (0-50 points)
  if (engagement > 0.08) score += 50;
  else if (engagement > 0.05) score += 40;
  else if (engagement > 0.03) score += 30;
  else if (engagement > 0.01) score += 20;
  else score += 10;

  // Followers score (0-30 points)
  if (followers > 1000000) score += 30;
  else if (followers > 500000) score += 25;
  else if (followers > 100000) score += 20;
  else if (followers > 50000) score += 15;
  else score += 10;

  // Status bonus (0-20 points)
  if (influencer.status === "active") score += 20;
  else if (influencer.status === "verified") score += 15;
  else if (influencer.status === "pending") score += 10;

  return Math.min(score, 100);
};

// Función para obtener el username principal del influencer (copiada de CampaignStatsSection.tsx)
const getPrimaryUsername = (platformInfo: any): string => {
  if (!platformInfo || typeof platformInfo !== "object") {
    return "";
  }

  try {
    // Priorizar Instagram, luego TikTok, luego YouTube
    const platforms = ["instagram", "tiktok", "youtube"];

    for (const platform of platforms) {
      let username = null;

      if (platformInfo.youtube) {
        switch (platform) {
          case "instagram":
            username = platformInfo.youtube.instagramId;
            break;
          case "tiktok":
            username = platformInfo.youtube.tiktokId;
            break;
          case "youtube":
            username = platformInfo.youtube.displayId;
            break;
        }
      }

      if (username) {
        return username.startsWith("@") ? username : `@${username}`;
      }
    }

    // Fallback: buscar directamente en la raíz
    for (const platform of platforms) {
      const username =
        platformInfo[`${platform}Id`] || platformInfo[`${platform}_id`];
      if (username) {
        return username.startsWith("@") ? username : `@${username}`;
      }
    }

    return "";
  } catch (error) {
    console.error("Error getting primary username:", error);
    return "";
  }
};

// Función para calcular alcance aproximado para Instagram (misma lógica que posts y ListView)
const calculateApproximateReach = (likes: number | string, comments: number | string): number => {
  const likesNum = typeof likes === 'string' ? parseInt(likes) || 0 : likes || 0;
  const commentsNum = typeof comments === 'string' ? parseInt(comments) || 0 : comments || 0;
  
  // Si no hay likes ni comentarios, usar un valor base fijo
  if (likesNum === 0 && commentsNum === 0) {
    return 35; // Valor fijo para posts sin engagement
  }
  
  // Calcular engagement rate aproximado (likes + comentarios)
  const totalEngagement = likesNum + commentsNum;
  
  // Para Instagram, el alcance típicamente es 10-50x el engagement
  // Usar una fórmula determinística basada en el engagement
  // Factor base: 20x el engagement
  let reachMultiplier = 20;
  
  // Ajustar el multiplicador basado en el nivel de engagement para simular realismo
  if (totalEngagement > 1000) {
    reachMultiplier = 25; // Posts con mucho engagement tienen mayor alcance
  } else if (totalEngagement > 500) {
    reachMultiplier = 22; // Posts con engagement medio-alto
  } else if (totalEngagement > 100) {
    reachMultiplier = 21; // Posts con engagement medio
  } else if (totalEngagement > 50) {
    reachMultiplier = 19; // Posts con engagement bajo-medio
  } else if (totalEngagement > 10) {
    reachMultiplier = 18; // Posts con engagement bajo
  } else {
    reachMultiplier = 25; // Posts con muy poco engagement
  }
  
  const approximateReach = totalEngagement * reachMultiplier;
  
  // Asegurar un mínimo razonable (5x el engagement)
  return Math.max(approximateReach, totalEngagement * 5);
};

// Calcular métricas totales por influencer
const calculateInfluencerMetrics = (influencerId: string, posts: any[]) => {
  const influencerPosts = posts.filter((post: any) => post.influencer_id === influencerId);
  
  let totalLikes = 0;
  let totalReach = 0;
  let totalEngagement = 0;
  let postsWithMetrics = 0;

  influencerPosts.forEach((post: any) => {
    if (post.post_metrics) {
      const metrics = post.post_metrics;
      
      // Likes
      if (metrics.likes_count) {
        totalLikes += metrics.likes_count;
      }
      
      // Alcance con cálculo aproximado para Instagram
      let postReach = 0;
      if (metrics.views_count && metrics.views_count > 0) {
        // Si hay views_count real y no es 0, usarlo
        postReach = metrics.views_count;
      } else if (post.platform?.toLowerCase() === 'instagram') {
        // Para Instagram sin views_count, calcular alcance aproximado
        const approximateReach = calculateApproximateReach(
          metrics.likes_count || 0, 
          metrics.comments_count || 0
        );
        postReach = approximateReach;
        
        console.log('🔍 [DASHBOARD APPROXIMATE REACH] Calculated for Instagram:', {
          influencerId,
          postId: post.id,
          likes: metrics.likes_count,
          comments: metrics.comments_count,
          approximateReach: approximateReach
        });
      } else if (metrics.raw_response?.data?.basicInstagramPost?.videoPlayCount) {
        // Fallback: usar videoPlayCount si está disponible
        postReach = metrics.raw_response.data.basicInstagramPost.videoPlayCount;
      }
      
      totalReach += postReach;
      
      // Engagement rate promedio
      if (metrics.engagement_rate) {
        console.log('🔍 [DASHBOARD ENGAGEMENT] Post engagement rate:', {
          influencerId,
          postId: post.id,
          engagement_rate: metrics.engagement_rate,
          engagement_percent: metrics.engagement_rate * 100,
          type: typeof metrics.engagement_rate
        });
        
        // Los engagement rates están en formato decimal (0.1006 = 10.06%)
        // Necesito convertirlos a porcentaje antes de sumar
        const engagementPercent = metrics.engagement_rate * 100;
        totalEngagement += engagementPercent;
        postsWithMetrics++;
      }
    }
  });

  const averageEngagement = postsWithMetrics > 0 ? totalEngagement / postsWithMetrics : 0;
  
  console.log('🔍 [DASHBOARD ENGAGEMENT CALC] Final calculation:', {
    influencerId,
    totalEngagement,
    postsWithMetrics,
    averageEngagement,
    posts: influencerPosts.map(p => ({
      id: p.id,
      engagement_rate: p.post_metrics?.engagement_rate
    }))
  });

  return {
    totalLikes,
    totalReach,
    averageEngagement
  };
};

  
// Componente personalizado para el ícono de TikTok
const TikTokIcon = ({ className }: { className?: string }) => (
  <img src="/icons/tiktok.svg" alt="TikTok icon" className={className} />
);

// Componente personalizado para el ícono de Twitter/X
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 50 50"
    className={className}
    fill="currentColor"
  >
    <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
  </svg>
);

interface CampaignPlatformsSectionProps {
  campaign: Campaign;
}

// ✅ SINCRONIZADO: Función para analizar el tipo de contenido igual que PostImage.tsx
const analyzeContentType = (post: any): string => {
  // Usar la misma lógica que PostImage.tsx getContentTypeLabel()
  const platform = (post.platform || '').toLowerCase();
  const url = post.post_url || '';
  
  if (!platform) return "Desconocido";
  
  if (platform === 'youtube') {
    return url.includes('/shorts/') ? 'Short' : 'Video';
  }
  
  if (platform === 'tiktok') {
    return 'Video';
  }
  
  if (platform === 'twitter') {
    return 'Post';
  }
  
  if (platform === 'instagram') {
    if (url.includes('/stories/')) return 'Story';
    return url.includes('/reel/') ? 'Reel' : 'Post';
  }
  
  return "Desconocido";
};

// ✅ NUEVO: Función para contar tipos de contenido por plataforma
const getContentTypesByPlatform = (posts: any[], platformName: string) => {
  if (!posts || posts.length === 0) {
    return {};
  }

  // Normalizar nombre de plataforma para comparación
  const normalizePlatformName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower === 'x / twitter' || lower === 'x' || lower === 'twitter') return 'twitter';
    return lower;
  };

  const normalizedPlatformName = normalizePlatformName(platformName);
  
  // Filtrar posts de la plataforma específica
  const platformPosts = posts.filter(post => {
    const postPlatform = (post.platform || '').toLowerCase();
    return postPlatform === normalizedPlatformName;
  });

  // Contar tipos de contenido
  const contentTypeCounts: Record<string, number> = {};
  
  platformPosts.forEach(post => {
    const contentType = analyzeContentType(post);
    contentTypeCounts[contentType] = (contentTypeCounts[contentType] || 0) + 1;
  });

  return contentTypeCounts;
};

// Función para calcular engagement promedio por tipo de contenido
const calculateAverageEngagement = (
  posts: any[],
  contentType: string
): number => {
  const contentTypePosts = posts.filter(
    (post) => analyzeContentType(post) === contentType
  );

  if (contentTypePosts.length === 0) return 0;

  const totalEngagement = contentTypePosts.reduce((sum, post) => {
    const rawData = post.post_metrics?.raw_response?.data;
    if (!rawData) return sum;

    const platform = post.platform.toLowerCase();
    let engagement = 0;

    try {
      if (platform === "instagram" && rawData.basicInstagramPost) {
        engagement = rawData.basicInstagramPost.engageRate || 0;
      } else if (platform === "tiktok" && rawData.basicTikTokVideo) {
        engagement = rawData.basicTikTokVideo.engageRate || 0;
      } else if (platform === "youtube" && rawData.basicYoutubePost) {
        engagement = rawData.basicYoutubePost.engageRate || 0;
      } else if (
        (platform === "twitter" || platform === "x") &&
        rawData.basicTwitterPost
      ) {
        engagement = rawData.basicTwitterPost.engageRate || 0;
      }
    } catch (error) {
      console.error("Error calculating engagement:", error);
    }

    return sum + engagement;
  }, 0);

  return totalEngagement / contentTypePosts.length;
};

export const CampaignPlatformsSection = ({
  campaign,
}: CampaignPlatformsSectionProps) => {
  const { platforms, loading } = useCampaignPlatforms(campaign.id);
  const { posts, influencers, postsCountByInfluencer } = useCampaignContext();
  
  // Estado para filtros de Top Influencers
  const [topInfluencersFilter, setTopInfluencersFilter] = useState<'score' | 'er' | 'reach' | 'likes'>('score');
  
  // Estado para desplegable de orden
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Estado para orden múltiple
  const [orderCriteria, setOrderCriteria] = useState<('er' | 'reach' | 'likes')[]>([]);
  
  // Ref para el desplegable
  const orderDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar desplegable cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orderDropdownRef.current && !orderDropdownRef.current.contains(event.target as Node)) {
        setIsOrderModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para manejar orden único
  const handleOrderCriteriaChange = (criterion: 'er' | 'reach' | 'likes') => {
    setOrderCriteria((prev: ('er' | 'reach' | 'likes')[]) => {
      if (prev.includes(criterion)) {
        // Si ya está seleccionado, deseleccionarlo
        return [];
      } else {
        // Si no está seleccionado, reemplazar el anterior (solo un criterio)
        return [criterion];
      }
    });
  };

      // Calcular top influencers incluyendo todos los influencers de la campaña
  const getTopInfluencers = (
    influencers: any[],
    postsCountByInfluencer: Record<string, number>,
    posts: any[],
    sortBy: 'score' | 'er' | 'reach' | 'likes' = 'score'
  ) => {
    if (!influencers || influencers.length === 0) return [];

    const allInfluencers = influencers
      .filter((ci) => ci.influencers) // Filtrar solo los que tienen datos de influencer
      .map((campaignInfluencer) => {
        const influencer = campaignInfluencer.influencers;
        const score = calculatePerformanceScore(influencer);
        const postsCount = postsCountByInfluencer[influencer?.id || ""] || 0;
        const username = getPrimaryUsername(influencer?.platform_info);
        
        // Calcular métricas totales del influencer
        const metrics = calculateInfluencerMetrics(influencer?.id || "", posts);

        return {
          ...campaignInfluencer,
          influencer,
          score,
          posts: postsCount,
          username,
          metrics,
        };
      })
      .sort((a, b) => {
        // PRIORIDAD 1: Si hay criterios de orden múltiple configurados, usarlos SIEMPRE
        if (orderCriteria.length > 0) {
          for (const criterion of orderCriteria) {
            let comparison = 0;
            
            switch (criterion) {
              case 'er':
                comparison = (b.metrics?.averageEngagement || 0) - (a.metrics?.averageEngagement || 0);
                break;
              case 'reach':
                comparison = (b.metrics?.totalReach || 0) - (a.metrics?.totalReach || 0);
                break;
              case 'likes':
                comparison = (b.metrics?.totalLikes || 0) - (a.metrics?.totalLikes || 0);
                break;
            }
            
            if (comparison !== 0) {
              return comparison;
            }
          }
          // Si todos los criterios son iguales, ordenar por posts
          return b.posts - a.posts;
        }
        
        // PRIORIDAD 2: Si no hay criterios múltiples, usar ordenamiento simple
        if (sortBy === 'score') {
          // Ordenar por performance score (descendente)
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          // Si tienen el mismo score, ordenar por cantidad de posts
          return b.posts - a.posts;
        }
        
        // Ordenamiento por otros criterios simples
        switch (sortBy) {
          case 'er':
            // Ordenar por Engagement Rate (descendente)
            if (b.metrics?.averageEngagement !== a.metrics?.averageEngagement) {
              return (b.metrics?.averageEngagement || 0) - (a.metrics?.averageEngagement || 0);
            }
            break;
          case 'reach':
            // Ordenar por Reach (descendente)
            if (b.metrics?.totalReach !== a.metrics?.totalReach) {
              return (b.metrics?.totalReach || 0) - (a.metrics?.totalReach || 0);
            }
            break;
          case 'likes':
            // Ordenar por Likes (descendente)
            if (b.metrics?.totalLikes !== a.metrics?.totalLikes) {
              return (b.metrics?.totalLikes || 0) - (a.metrics?.totalLikes || 0);
            }
            break;
        }
        // Si tienen el mismo valor, ordenar por posts
        return b.posts - a.posts;
      });

    // Si hay criterios de orden múltiple, mostrar todos los influencers ordenados
    // Si es score, mostrar todos ordenados por performance score
    // Si es un filtro simple (no orden múltiple), mostrar solo Top 3
    if (orderCriteria.length > 0) {
      return allInfluencers; // Mostrar todos ordenados por criterios múltiples
    } else if (sortBy === 'score') {
      return allInfluencers; // Mostrar todos ordenados por score
    } else {
      // Para filtros simples, mostrar solo Top 3
      return allInfluencers.slice(0, 3);
    }
  };

  // Calcular top influencers
  const topInfluencers = useMemo(() => {
    console.log('🔍 [DASHBOARD] Posts data for engagement calculation:', posts.map(p => ({
      id: p.id,
      influencer_id: p.influencer_id,
      platform: p.platform,
      engagement_rate: p.post_metrics?.engagement_rate,
      raw_response: !!p.post_metrics?.raw_response
    })));
    
    console.log('🔍 [DASHBOARD] Ordenamiento configurado:', {
      topInfluencersFilter,
      orderCriteria,
      hasMultipleCriteria: orderCriteria.length > 0
    });
    
    return getTopInfluencers(influencers, postsCountByInfluencer, posts, topInfluencersFilter);
  }, [influencers, postsCountByInfluencer, posts, topInfluencersFilter, orderCriteria]);

  // Analizar tipos de contenido reales desde los posts
  const contentPerformance = useMemo(() => {
    if (!posts || posts.length === 0) {
      return [];
    }

    // Contar posts por tipo de contenido
    const contentTypeCounts: Record<string, number> = {};
    const contentTypeEngagement: Record<string, number> = {};

    posts.forEach((post) => {
      const contentType = analyzeContentType(post);
      contentTypeCounts[contentType] =
        (contentTypeCounts[contentType] || 0) + 1;
    });

    // Calcular engagement promedio por tipo
    Object.keys(contentTypeCounts).forEach((contentType) => {
      contentTypeEngagement[contentType] = calculateAverageEngagement(
        posts,
        contentType
      );
    });

    // Convertir a formato para el gráfico
    return Object.keys(contentTypeCounts)
      .map((contentType) => ({
        type: contentType,
        count: contentTypeCounts[contentType],
        engagement: contentTypeEngagement[contentType],
      }))
      .sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente
  }, [posts]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Instagram":
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case "TikTok":
        return <TikTokIcon className="h-4 w-4 text-black" />;
      case "YouTube":
        return <Youtube className="h-4 w-4 text-red-600" />;
      case "X / Twitter":
        return <TwitterIcon className="h-4 w-4 text-black" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  // Función para formatear números grandes
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Show skeleton while loading
  if (loading) {
    return <PlatformSkeleton />;
  }

  // Always show platforms section, even with 0 values
  // The platforms array will always contain all platforms now

  // Calculate max reach for progress bar scaling
  const maxReach = Math.max(...platforms.map((p) => p.reach), 1); // Use 1 as minimum to avoid division by zero

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-6">
        <Card className="overflow-hidden border-gray-200 border bg-white shadow-sm">
          <div className="bg-blue-600 text-white pb-2 pt-3 px-4 rounded-t-lg">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <h3 className="text-sm font-semibold">
                Rendimiento por Plataforma
              </h3>
            </div>
          </div>

          <div className="p-3.5">
            <div className="space-y-3.5">
              {platforms.map((platform) => (
                <div key={platform.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(platform.name)}
                      <span className="text-sm font-medium">
                        {platform.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {(() => {
                        const contentTypes = getContentTypesByPlatform(posts, platform.name);
                        const hasContent = Object.keys(contentTypes).length > 0;
                        
                        if (!hasContent) {
                          return (
                            <Badge className="bg-sky-100 text-sky-700 border-0 text-xs px-3 py-1 rounded-full">
                              {platform.posts} posts
                            </Badge>
                          );
                        }
                        
                        return Object.entries(contentTypes)
                          .sort(([,a], [,b]) => b - a) // Ordenar por cantidad descendente
                          .map(([type, count]) => {
                            // Manejar plurales específicos con primera letra en mayúscula
                            const getPlural = (type: string, count: number): string => {
                              const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
                              
                              if (count === 1) {
                                return capitalize(type.toLowerCase());
                              }
                              
                              // Plurales especiales
                              switch (type.toLowerCase()) {
                                case 'story':
                                  return 'Stories';
                                case 'short':
                                  return 'Shorts';
                                case 'video':
                                  return 'Videos';
                                case 'post':
                                  return 'Posts';
                                case 'reel':
                                  return 'Reels';
                                default:
                                  return capitalize(`${type.toLowerCase()}s`);
                              }
                            };
                            
                            return (
                              <Badge 
                                key={type} 
                                className="bg-sky-100 text-sky-700 border-0 text-xs px-2 py-1 rounded-full"
                              >
                                {count} {getPlural(type, count)}
                              </Badge>
                            );
                          });
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Alcance</div>
                      <div className="font-medium">
                        {formatNumber(platform.reach)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Engagement</div>
                      <div className="font-medium">
                        {platform.engagement.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Likes</div>
                      <div className="font-medium">
                        {formatNumber(platform.likes)}
                      </div>
                    </div>
                  </div>

                  <div className="h-2"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="col-span-6">
        <Card
          className="overflow-hidden border-gray-200 border bg-white shadow-sm"
          style={{
            height: "435px !important",
            minHeight: "435px",
            maxHeight: "435px",
          }}
        >
          <div className="bg-purple-600 text-white pb-2 pt-3 px-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Top Influencers</h3>
                </div>
                
                {/* Botón de Orden con desplegable */}
                <div className="flex items-center gap-2">
                  <div className="relative" ref={orderDropdownRef}>
                    <button
                      onClick={() => setIsOrderModalOpen(!isOrderModalOpen)}
                      className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 text-white rounded transition-colors flex items-center gap-1"
                    >
                      Orden
                      <svg 
                        className={`w-3 h-3 transition-transform ${isOrderModalOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Desplegable de checkboxes */}
                    {isOrderModalOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48 z-10">
                        <div className="text-xs font-medium text-gray-700 mb-2">
                          Criterios de orden:
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500 mb-2">
                            Selecciona un criterio de orden:
                          </div>
                          
                          <button
                            onClick={() => handleOrderCriteriaChange('er')}
                            className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                              orderCriteria.includes('er')
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-xs text-gray-600">Engagement Rate (ER)</span>

                          </button>
                          
                          <button
                            onClick={() => handleOrderCriteriaChange('reach')}
                            className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                              orderCriteria.includes('reach')
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-xs text-gray-600">Reach</span>

                          </button>
                          
                          <button
                            onClick={() => handleOrderCriteriaChange('likes')}
                            className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                              orderCriteria.includes('likes')
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-xs text-gray-600">Likes</span>

                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Botón Restablecer - Solo aparece si hay filtros/orden aplicado */}
                  {(orderCriteria.length > 0 || topInfluencersFilter !== 'score') && (
                    <button
                      onClick={() => {
                        setTopInfluencersFilter('score');
                        setOrderCriteria([]);
                      }}
                      className="px-3 py-1 text-xs text-white/80 hover:text-white border border-white/30 hover:border-white/50 rounded transition-colors"
                    >
                      Restablecer
                    </button>
                  )}
                </div>
              </div>
              
              <TooltipProvider delayDuration={0}>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button className="text-white/80 hover:text-white transition-colors">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="max-w-xs bg-white text-gray-900 border border-gray-200 shadow-lg"
                  >
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        Puntaje de Performance
                      </p>
                      <div className="text-sm space-y-1 text-gray-700">
                        <p>
                          <strong>Engagement (0-50 pts):</strong>
                        </p>
                        <ul className="ml-2 space-y-1">
                          <li>• +8%: 50 pts</li>
                          <li>• +5%: 40 pts</li>
                          <li>• +3%: 30 pts</li>
                          <li>• +1%: 20 pts</li>
                          <li>• &lt;1%: 10 pts</li>
                        </ul>
                        <p>
                          <strong>Seguidores (0-30 pts):</strong>
                        </p>
                        <ul className="ml-2 space-y-1">
                          <li>• +1M: 30 pts</li>
                          <li>• +500K: 25 pts</li>
                          <li>• +100K: 20 pts</li>
                          <li>• +50K: 15 pts</li>
                          <li>• &lt;50K: 10 pts</li>
                        </ul>
                        <p>
                          <strong>Estado (0-20 pts):</strong>
                        </p>
                        <ul className="ml-2 space-y-1">
                          <li>• Activo: 20 pts</li>
                          <li>• Verificado: 15 pts</li>
                          <li>• Pendiente: 10 pts</li>
                        </ul>
                      </div>
                    </div>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="p-3.5 flex-1 flex flex-col overflow-hidden">
            {topInfluencers.length > 0 ? (
              <div
                className="space-y-4 overflow-y-auto pr-2 flex-1"
                style={{ maxHeight: "calc(435px - 80px)" }}
              >
                {topInfluencers.map((item, index) => {
                  const influencer = item.influencer;
                  const score = item.score;
                  const posts = item.posts;
                  const username = item.username;
                  const rankColors = [
                    "from-purple-400 to-pink-400",
                    "from-pink-400 to-red-400",
                    "from-orange-400 to-yellow-400",
                    "from-yellow-400 to-green-400",
                    "from-green-400 to-blue-400",
                  ];

                  return (
                    <div
                      key={influencer?.id || index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 bg-gradient-to-br ${
                            rankColors[index] || "from-gray-400 to-gray-500"
                          } rounded-full flex items-center justify-center text-white text-sm font-bold`}
                        >
                          {index + 1}
                        </div>
                        {/* Estrella con score entre ranking y avatar */}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{score}</span>
                        </div>
                        <LazyInfluencerAvatar
                          influencer={{
                            name: influencer?.name || "Influencer",
                            avatar: influencer?.avatar || "",
                          }}
                          className="h-10 w-10 border-4 border-white shadow-lg"
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {influencer?.name || "Nombre no disponible"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {username || ""}
                          </div>
                          <div className="text-xs text-gray-400">
                            {influencer?.followers_count
                              ? formatNumber(influencer.followers_count)
                              : "0"}{" "}
                            seguidores • {posts > 0 ? `${posts} posts` : "Sin posts"}
                            {/* Métricas adicionales en la misma línea */}
                            {item.metrics && (item.metrics.totalLikes > 0 || item.metrics.totalReach > 0) && (
                              <>
                                {" • "}
                                <span className="text-gray-400">ER: {item.metrics.averageEngagement.toFixed(1)}%</span>
                                {" • "}
                                <span className="text-gray-400">Reach: {formatNumber(item.metrics.totalReach)}</span>
                                {" • "}
                                <span className="text-gray-400">Likes: {formatNumber(item.metrics.totalLikes)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                No hay influencers disponibles.
              </div>
            )}
          </div>
        </Card>
      </div>
      

      

    </div>
  );
};

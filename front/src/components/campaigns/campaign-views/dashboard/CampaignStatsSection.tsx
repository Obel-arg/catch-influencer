import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  TrendingUp,
  Calendar,
  Star,
  Search,
  PieChart as PieChartIcon,
  Heart,
  MessageCircle,
  Eye,
  ExternalLink,
  Clock,
  Award,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Campaign } from "@/types/campaign";
import { useCampaignContext } from "@/contexts/CampaignContext";
import { useState, useEffect, useMemo } from "react";
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar";
import {
  extractEngagementRateFromRawResponse,
  extractMetricsFromRawResponse,
  getPlatformIcon,
  formatNumber as formatNumberUtils,
  extractPostTitle,
  getImageUrl,
} from "../posts/components/PostUtils";

interface CampaignStatsSectionProps {
  campaign: Campaign;
}

// Función para calcular el performance score (copiada de CampaignInfluencers.tsx)
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

// Función para obtener el username principal del influencer
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

    return "";
  } catch (error) {
    console.error("Error getting primary username:", error);
    return "";
  }
};

// ✅ SINCRONIZADO: Función para analizar el tipo de contenido igual que PostImage.tsx
const analyzeContentType = (post: any): string => {
  // Usar la misma lógica que PostImage.tsx getContentTypeLabel()
  const platform = (post.platform || '').toLowerCase();
  const url = post.post_url || '';
  

  
  if (!platform) return "Desconocido";
  
  if (platform === 'youtube') {
    const type = url.includes('/shorts/') ? 'Short' : 'Video';
    
    return type;
  }
  
  if (platform === 'tiktok') {
    
    return 'Video';
  }
  
  if (platform === 'twitter') {
    
    return 'Post';
  }
  
  if (platform === 'instagram') {
    let type = 'Post'; // default
    if (url.includes('/stories/')) {
      type = 'Story';
    } else if (url.includes('/reel/')) {
      type = 'Reel';
    }

    return type;
  }
  
  return "Desconocido";
};

export const CampaignStatsSection = ({
  campaign,
}: CampaignStatsSectionProps) => {
  const {
    influencers,
    posts: allPosts,
    influencersLoading: loading,
    postsLoading,
    error,
    postsCountByInfluencer,
  } = useCampaignContext();

  const [platformStats, setPlatformStats] = useState<{
    mostEffectivePlatform: { platform: string; avgEngagement: number } | null;
    mostUsedContentType: { type: string; count: number } | null;
    totalPosts: number;
  }>({
    mostEffectivePlatform: null,
    mostUsedContentType: null,
    totalPosts: 0,
  });

  const [showAllInfluencers, setShowAllInfluencers] = useState(false);
  const [mostRelevantPostImage, setMostRelevantPostImage] = useState<
    string | null
  >(null);

  // Encontrar el post más relevante (mayor engagement)
  const mostRelevantPost = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return null;

    let maxEngagement = 0;
    let mostRelevant: any = null;

    allPosts.forEach((post) => {
      // Los posts del contexto deberían tener la estructura completa de InfluencerPost
      const engagement = extractEngagementRateFromRawResponse(post as any);
      if (engagement > maxEngagement) {
        maxEngagement = engagement;
        mostRelevant = post;
      }
    });

    return mostRelevant;
  }, [allPosts]);

  // Cargar imagen del post más relevante
  useEffect(() => {
    const loadPostImage = async () => {
      if (!mostRelevantPost) {
        setMostRelevantPostImage(null);
        return;
      }

      try {
        const imageUrl = await getImageUrl(mostRelevantPost as any);
        setMostRelevantPostImage(imageUrl);
      } catch (error) {
        console.error("Error loading post image:", error);
        setMostRelevantPostImage((mostRelevantPost as any).image_url || null);
      }
    };

    loadPostImage();
  }, [mostRelevantPost]);

  // Analizar tipos de contenido reales desde los posts
  const contentPerformance = useMemo(() => {
    if (!allPosts || allPosts.length === 0) {
      
      return [];
    }

    

    // Contar posts por tipo de contenido
    const contentTypeCounts: Record<string, number> = {};

    allPosts.forEach((post) => {
      const contentType = analyzeContentType(post);
      contentTypeCounts[contentType] =
        (contentTypeCounts[contentType] || 0) + 1;
    });

    

    // Convertir a formato para el gráfico
    const result = Object.keys(contentTypeCounts)
      .map((contentType) => ({
        type: contentType,
        count: contentTypeCounts[contentType],
      }))
      .sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente

    
    return result;
  }, [allPosts]);

  // Calcular estadísticas de plataformas cuando cambien los posts
  useEffect(() => {
    if (allPosts.length === 0) {
      setPlatformStats({
        mostEffectivePlatform: null,
        mostUsedContentType: null,
        totalPosts: 0,
      });
      return;
    }

    // Agrupar posts por plataforma y calcular engagement promedio usando la misma lógica que CampaignPlatformsSection
    const platformData: Record<string, { engagement: number; posts: number }> =
      {
        youtube: { engagement: 0, posts: 0 },
        tiktok: { engagement: 0, posts: 0 },
        instagram: { engagement: 0, posts: 0 },
        twitter: { engagement: 0, posts: 0 }, // Added Twitter
      };

    // Usar exactamente la misma lógica que CampaignPlatformsSection para tipos de contenido
    const contentTypeCounts: Record<string, number> = {};

    allPosts.forEach((post) => {
      const platform = post.platform?.toLowerCase();
      if (!platform || !platformData[platform]) return;

      // Contar posts por plataforma
      platformData[platform].posts++;

      // ✅ ACTUALIZADO: Incluir métricas manuales de Instagram Stories
      let engagement = 0;
      
      // Verificar primero si es una Instagram Story con métricas manuales
      if (platform === "instagram" && post.post_metrics?.raw_response?.manual_metrics) {
        const manualData = post.post_metrics.raw_response.manual_metrics;
        const likes = parseInt(manualData.likes) || 0;
        const comments = parseInt(manualData.comments) || 0;
        const alcance = parseInt(manualData.alcance) || 0;
        
        // Calcular engagement rate para stories
        const totalEngagement = likes + comments;
        engagement = alcance > 0 ? (totalEngagement / alcance) : 0;
        
          
      }
      // Extraer engagement rate usando la lógica original para otros tipos de posts
      else if (post.post_metrics?.raw_response?.data) {
        const rawData = post.post_metrics.raw_response.data;

        if (platform === "youtube" && rawData.basicYoutubePost) {
          engagement = rawData.basicYoutubePost.engageRate || 0;
        } else if (platform === "tiktok" && rawData.basicTikTokVideo) {
          engagement = rawData.basicTikTokVideo.engageRate || 0;
        } else if (platform === "instagram" && rawData.basicInstagramPost) {
          engagement = rawData.basicInstagramPost.engageRate || 0;
        } else if (platform === "twitter" && rawData.basicTwitterPost) {
          // Added Twitter
          engagement = rawData.basicTwitterPost.engageRate || 0;
        }
      }

      // Sumar engagement rate (ya viene en decimal)
      platformData[platform].engagement += engagement;

      // Estadísticas de tipo de contenido usando exactamente la misma lógica que CampaignPlatformsSection
      const contentType = analyzeContentType(post);
      contentTypeCounts[contentType] =
        (contentTypeCounts[contentType] || 0) + 1;
    });

    // Calcular engagement promedio por plataforma usando la misma lógica que CampaignPlatformsSection
    let mostEffectivePlatform = null;
    let highestAvgEngagement = 0;

    Object.entries(platformData).forEach(([platform, data]) => {
      if (data.posts > 0) {
        // Calcular engagement promedio: sumar todos los rates, multiplicar por 100, dividir por posts
        const avgEngagement = (data.engagement * 100) / data.posts;

        if (avgEngagement > highestAvgEngagement) {
          highestAvgEngagement = avgEngagement;
          mostEffectivePlatform = {
            platform: platform.charAt(0).toUpperCase() + platform.slice(1),
            avgEngagement,
          };
        }
      }
    });

    // Encontrar el tipo de contenido más usado usando exactamente la misma lógica que CampaignPlatformsSection
    const contentTypesArray = Object.keys(contentTypeCounts)
      .map((contentType) => ({
        type: contentType,
        count: contentTypeCounts[contentType],
      }))
      .sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente

    const mostUsedContentType =
      contentTypesArray.length > 0 ? contentTypesArray[0] : null;

    setPlatformStats({
      mostEffectivePlatform,
      mostUsedContentType,
      totalPosts: allPosts.length,
    });
  }, [allPosts]);

  // Calcular top influencers basado en cantidad de posts
  const getTopInfluencers = () => {
    if (!influencers || influencers.length === 0) return [];

    const influencersWithPosts = influencers
      .filter((ci) => ci.influencers) // Filtrar solo los que tienen datos de influencer
      .map((campaignInfluencer) => {
        const influencer = campaignInfluencer.influencers;
        const score = calculatePerformanceScore(influencer);
        const posts = postsCountByInfluencer[influencer?.id || ""] || 0;
        const username = getPrimaryUsername(influencer?.platform_info);

        return {
          ...campaignInfluencer,
          influencer,
          score,
          posts,
          username,
        };
      })
      .filter((item) => item.posts > 0) // Solo influencers con posts
      .sort((a, b) => {
        // Ordenar primero por cantidad de posts (descendente)
        if (b.posts !== a.posts) {
          return b.posts - a.posts;
        }
        // Si tienen la misma cantidad de posts, ordenar por score
        return b.score - a.score;
      });

    return influencersWithPosts;
  };

  // Función para obtener el icono y color de la plataforma
  const getPlatformBadge = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "instagram":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-500 text-white">
            Instagram
          </span>
        );
      case "tiktok":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
            TikTok
          </span>
        );
      case "youtube":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
            YouTube
          </span>
        );
      case "twitter":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
            Twitter
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-white">
            {platform || "N/A"}
          </span>
        );
    }
  };

  const topInfluencers = getTopInfluencers();

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* Estadísticas Rápidas */}
        <div className="col-span-4">
          <Card
            className="overflow-hidden border-gray-200 border bg-white shadow-sm"
            style={{
              height: "230px !important",
              minHeight: "230px",
              maxHeight: "230px",
            }}
          >
            <div className="bg-blue-600 text-white pb-2 pt-3 px-4 rounded-t-lg mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Estadísticas Rápidas</h3>
              </div>
            </div>
            <CardContent className="space-y-3 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Posts totales</span>
                <span className="font-semibold text-sm">
                  {platformStats.totalPosts}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">
                  Influencers activos
                </span>
                <span className="font-semibold text-sm">
                  {influencers.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">
                  Plataforma más efectiva
                </span>
                {platformStats.mostEffectivePlatform ? (
                  <div className="flex items-center gap-2">
                    {getPlatformBadge(
                      platformStats.mostEffectivePlatform.platform
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Badge className="bg-gray-300 text-gray-600 text-sm">
                      Sin datos
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">
                  Tipo de contenido destacado
                </span>
                {platformStats.mostUsedContentType ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">
                      {platformStats.mostUsedContentType.type}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Sin datos</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Post más Relevante */}
        <div className="col-span-4">
          <Card
            className="overflow-hidden border-gray-200 border bg-white shadow-sm"
            style={{
              height: "230px !important",
              minHeight: "230px",
              maxHeight: "230px",
            }}
          >
            <div className="bg-blue-600 text-white pb-2 pt-3 px-4 rounded-t-lg mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Post más Relevante</h3>
              </div>
            </div>
            <CardContent className="p-3.5">
              {mostRelevantPost ? (
                <div className="space-y-1.5">
                  {/* Header con plataforma y engagement */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(
                        (mostRelevantPost as any).platform || ""
                      )}
                      <span className="text-sm font-medium capitalize">
                        {(mostRelevantPost as any).platform || "Desconocido"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2 py-1">
                        {(
                          extractEngagementRateFromRawResponse(
                            mostRelevantPost as any
                          ) * 100
                        ).toFixed(1)}
                        % engagement
                      </Badge>
                    </div>
                  </div>

                  {/* Contenido principal: miniatura + información */}
                  <div className="flex gap-2">
                    {/* Miniatura cuadrada del post */}
                    <div className="flex-shrink-0">
                      {mostRelevantPostImage ? (
                        <img
                          src={mostRelevantPostImage}
                          alt="Post thumbnail"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            Sin imagen
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Información del post */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Título del post */}
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Título del Post
                        </div>
                        <div className="text-xs font-medium text-gray-900 line-clamp-2">
                          {extractPostTitle(mostRelevantPost as any) ||
                            (mostRelevantPost as any).caption ||
                            "Sin título disponible"}
                        </div>
                      </div>

                      {/* Fecha del post */}
                      {(mostRelevantPost as any).post_date && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(
                              (mostRelevantPost as any).post_date
                            ).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}

                      {/* Métricas del post */}
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="text-center p-1">
                          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                            <Heart className="h-3 w-3" />
                          </div>
                          <div className="font-medium">
                            {formatNumberUtils(
                              extractMetricsFromRawResponse(
                                mostRelevantPost as any
                              ).likes
                            )}
                          </div>
                        </div>
                        <div className="text-center p-1">
                          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                            <MessageCircle className="h-3 w-3" />
                          </div>
                          <div className="font-medium">
                            {formatNumberUtils(
                              extractMetricsFromRawResponse(
                                mostRelevantPost as any
                              ).comments
                            )}
                          </div>
                        </div>
                        <div className="text-center p-1">
                          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                            <Eye className="h-3 w-3" />
                          </div>
                          <div className="font-medium">
                            {formatNumberUtils(
                              extractMetricsFromRawResponse(
                                mostRelevantPost as any
                              ).views
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Performance rating */}
                      {(mostRelevantPost as any).performance_rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">
                            Performance:
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs px-2 py-0.5 ${
                              (mostRelevantPost as any).performance_rating ===
                              "Alto"
                                ? "border-green-200 text-green-700 bg-green-50"
                                : (mostRelevantPost as any)
                                    .performance_rating === "Medio"
                                ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                                : "border-red-200 text-red-700 bg-red-50"
                            }`}
                          >
                            {(mostRelevantPost as any).performance_rating}
                          </Badge>
                        </div>
                      )}

                      {/* Link al post */}
                      {(mostRelevantPost as any).post_url ? (
                        <button
                          className="w-full text-xs h-5 px-2 py-0.5 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                          onClick={() =>
                            window.open(
                              (mostRelevantPost as any).post_url,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver Post
                        </button>
                      ) : (
                        <button
                          className="w-full text-xs h-5 px-2 py-0.5 border border-gray-300 rounded bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-1"
                          disabled
                        >
                          <ExternalLink className="h-3 w-3" />
                          URL no disponible
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  No hay posts disponibles.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Types Chart */}
        <div className="col-span-4">
          <Card
            className="overflow-hidden border-gray-200 border bg-white shadow-sm"
            style={{
              height: "230px !important",
              minHeight: "230px",
              maxHeight: "230px",
            }}
          >
            <div className="bg-purple-600 text-white pb-2 pt-3 px-4 rounded-t-lg mb-2">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Tipos de Contenido</h3>
              </div>
            </div>
            <CardContent className="p-3.5">
              {contentPerformance.length > 0 ? (
                <div className="flex items-start h-full pt-4">
                  <div className="flex-1 h-[120px] pr-2 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contentPerformance}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={45}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="type"
                        >
                          {contentPerformance.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(${index * 60}, 70%, 60%)`}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => {
                            return [`${value} posts`, props.payload.type];
                          }}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderColor: "#e5e7eb",
                            borderRadius: "0.375rem",
                            boxShadow:
                              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1 space-y-1 pl-2 pt-8">
                    {contentPerformance.map((content, index) => (
                      <div
                        key={content.type}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                          }}
                        ></div>
                        <div className="text-xs">
                          <span className="font-medium">{content.type}</span>
                          <span className="text-gray-500 ml-1">
                            ({content.count})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  No hay datos de contenido disponibles.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showAllInfluencers} onOpenChange={setShowAllInfluencers}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5" />
              Todos los Influencers
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {influencers.map((item) => {
              const influencer = item.influencers;
              const score = calculatePerformanceScore(influencer);
              const posts = postsCountByInfluencer[influencer?.id || ""] || 0;
              const username = getPrimaryUsername(influencer?.platform_info);

              return (
                <div
                  key={influencer?.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <LazyInfluencerAvatar
                      influencer={{
                        name: influencer?.name || "Influencer",
                        avatar: influencer?.avatar || "",
                      }}
                      className="h-20 w-20 border-4 border-white shadow-lg"
                    />
                    <div>
                      <div className="font-medium">
                        {influencer?.name || "Nombre no disponible"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {username || "Sin username"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {influencer?.followers_count
                          ? formatNumberUtils(influencer.followers_count)
                          : "0"}{" "}
                        seguidores • {posts} posts
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

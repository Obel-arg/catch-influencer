import React, { useState, useMemo } from "react";
import { ExtendedInfluencerData } from "@/lib/services/influencer";
import { formatNumber, formatCleanNumber } from "@/utils/format";

// 🎯 FUNCIÓN PARA FORMATEAR PORCENTAJES
const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "0%";

  const percentage = value * 100;
  const rounded = Math.round(percentage * 100) / 100;

  // Si es un entero, mostrarlo sin decimales
  if (Number.isInteger(rounded)) {
    return `${rounded}%`;
  }

  // Si tiene decimales, mostrar máximo 2
  return `${rounded.toFixed(2)}%`;
};

// 🎯 FUNCIÓN PARA OBTENER DATOS DE INSTAGRAM
function getInstagramData(platform_info: any) {
  return (
    platform_info?.instagram?.basicInstagram ||
    platform_info?.instagram?.basicinstagram ||
    platform_info?.instagram ||
    platform_info?.basicInstagram ||
    platform_info?.basicinstagram
  );
}

// 🎯 FUNCIÓN PARA OBTENER DATOS DE TIKTOK
function getTiktokData(platform_info: any) {
  return (
    platform_info?.tiktok?.basicTikTok ||
    platform_info?.tiktok?.basicTiktok ||
    platform_info?.tiktok ||
    platform_info?.basicTikTok ||
    platform_info?.basicTiktok
  );
}

interface InfluencerExtendedMetricsProps {
  influencerId: string;
  influencer: any;
  extendedData?: ExtendedInfluencerData | null;
  extendedLoading?: boolean;
  summary?: {
    hasExtendedData: boolean;
    completenessScore: number;
    lastSync: string | null;
    platformsWithData: string[];
    needsSync: boolean;
    totalApiCalls: number;
    estimatedCost: number;
  } | null;
}

export default function InfluencerExtendedMetrics({
  influencerId,
  influencer,
  extendedData: propExtendedData,
  extendedLoading = false,
  summary,
}: InfluencerExtendedMetricsProps) {
  const [showEmails, setShowEmails] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  // Usar los datos extendidos que ya se pasan como props desde el Dashboard
  const realExtendedData = propExtendedData;

  // 🎯 NUEVA LÓGICA: Determinar plataformas disponibles y ordenarlas por followers
  const availablePlatforms = useMemo(() => {
    if (!influencer) return [];

    const platformsWithFollowers = [];

    // Determinar si tenemos datos extendidos
    const hasExtendedData =
      summary?.hasExtendedData || realExtendedData?.youtube_basic || false;

    // 🎯 DEBUG: Log de datos disponibles
    console.log("🔍 [DEBUG] Datos del influencer:", {
      hasExtendedData,
      youtube_basic: realExtendedData?.youtube_basic,
      instagram_basic: realExtendedData?.instagram_basic,
      tiktok_basic: realExtendedData?.tiktok_basic,
      platform_info: influencer.platform_info,
    });

    // YouTube - usar la misma lógica que en youtubeData
    const basicYt =
      influencer.platform_info?.youtube?.basicYoutube ||
      influencer.platform_info?.youtube ||
      null;

    const youtubeFollowers =
      hasExtendedData && realExtendedData?.youtube_basic
        ? realExtendedData.youtube_basic.data?.basicYoutube?.subscribers || 0
        : basicYt?.subscribers || 0;

    console.log("🔍 [DEBUG] YouTube:", {
      youtubeFollowers,
      basicYt,
      recentVideos: basicYt?.recentVideos?.length,
    });

    if (
      youtubeFollowers > 0 ||
      (basicYt?.recentVideos?.length > 0 && basicYt?.recentVideos?.length > 0)
    ) {
      platformsWithFollowers.push({
        platform: "youtube",
        followers: youtubeFollowers,
      });
    }

    // Instagram - usar la misma lógica que en instagramData
    const basicIg =
      influencer.platform_info?.instagram?.basicInstagram ||
      influencer.platform_info?.instagram?.basicinstagram ||
      influencer.platform_info?.instagram ||
      influencer.platform_info?.basicInstagram ||
      influencer.platform_info?.basicinstagram ||
      null;

    const instagramFollowers =
      hasExtendedData && realExtendedData?.instagram_basic
        ? realExtendedData.instagram_basic.data?.basicInstagram?.followers || 0
        : basicIg?.followers || basicIg?.followersCount || 0;

    console.log("🔍 [DEBUG] Instagram:", {
      instagramFollowers,
      basicIg,
      recentPosts: basicIg?.recentPosts?.length,
    });

    if (
      instagramFollowers > 0 ||
      (basicIg?.recentPosts?.length > 0 && basicIg?.recentPosts?.length > 0)
    ) {
      platformsWithFollowers.push({
        platform: "instagram",
        followers: instagramFollowers,
      });
    }

    // TikTok - usar la misma lógica que en tiktokData
    const basicTk =
      influencer.platform_info?.tiktok?.basicTiktok ||
      influencer.platform_info?.tiktok?.basicTikTok ||
      influencer.platform_info?.tiktok ||
      influencer.platform_info?.basicTiktok ||
      influencer.platform_info?.basicTikTok ||
      null;

    const tiktokFollowers =
      hasExtendedData && realExtendedData?.tiktok_basic
        ? realExtendedData.tiktok_basic.data?.basicTikTok?.followers || 0
        : basicTk?.followers || basicTk?.followersCount || 0;

    console.log("🔍 [DEBUG] TikTok:", {
      tiktokFollowers,
      basicTk,
      recentVideos: basicTk?.recentVideos?.length,
    });

    if (
      tiktokFollowers > 0 ||
      (basicTk?.recentVideos?.length > 0 && basicTk?.recentVideos?.length > 0)
    ) {
      platformsWithFollowers.push({
        platform: "tiktok",
        followers: tiktokFollowers,
      });
    }

    // Ordenar por followers de mayor a menor
    platformsWithFollowers.sort((a, b) => b.followers - a.followers);

    // Extraer solo los nombres de las plataformas en el orden correcto
    const result = platformsWithFollowers.map((p) => p.platform);
    
    console.log("🔍 [DEBUG] Plataformas disponibles:", result);
    
    return result;
  }, [influencer, realExtendedData, summary]);

  // 🎯 NUEVA LÓGICA: Determinar cuál es la plataforma principal
  const mainPlatform = useMemo(() => {
    if (availablePlatforms.length === 0) return null;

    // Obtener followers de cada plataforma disponible
    const platformFollowers = {
      youtube:
        influencer.platform_info?.youtube?.basicYoutube?.subscribers ||
        influencer.platform_info?.youtube?.subscribers ||
        realExtendedData?.youtube_basic?.data?.basicYoutube?.subscribers ||
        0,
      instagram:
        getInstagramData(influencer.platform_info)?.followers ||
        getInstagramData(influencer.platform_info)?.followersCount ||
        realExtendedData?.instagram_basic?.data?.basicInstagram?.followers ||
        0,
      tiktok:
        getTiktokData(influencer.platform_info)?.followers ||
        getTiktokData(influencer.platform_info)?.followersCount ||
        realExtendedData?.tiktok_basic?.data?.basicTikTok?.followers ||
        0,
    };

    // Encontrar la plataforma con más followers
    let maxFollowers = 0;
    let mainPlatform = null;

    availablePlatforms.forEach((platform) => {
      const followers =
        platformFollowers[platform as keyof typeof platformFollowers] || 0;
      if (followers > maxFollowers) {
        maxFollowers = followers;
        mainPlatform = platform;
      }
    });

    return mainPlatform;
  }, [availablePlatforms, influencer, realExtendedData]);

  if (extendedLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Cargando métricas...</span>
        </div>
      </div>
    );
  }

  // Determinar si tenemos datos extendidos
  const hasExtendedData =
    summary?.hasExtendedData || realExtendedData?.youtube_basic || false;

  // Usar datos extendidos si están disponibles, sino usar datos básicos del influencer
  const youtubeData =
    hasExtendedData && realExtendedData?.youtube_basic
      ? {
          followers:
            realExtendedData.youtube_basic.data?.basicYoutube?.subscribers || 0,
          avg_views:
            realExtendedData.youtube_basic.data?.basicYoutube?.avgViews1Y || 0,
          avg_likes:
            realExtendedData.youtube_basic.data?.basicYoutube?.avgLikes1Y || 0,
          engagement_rate:
            realExtendedData.youtube_basic.data?.basicYoutube?.engageRate1Y ||
            0,
          growth_rate:
            realExtendedData.youtube_basic.data?.basicYoutube
              ?.gRateSubscribers || 0,
          avg_comments:
            realExtendedData.youtube_basic.data?.basicYoutube?.avgComments1Y ||
            0,
          total_videos: realExtendedData.youtube_basic.data?.basicYoutube?.totalVideos || 0,
          last_post_date: realExtendedData.youtube_basic.data?.basicYoutube
            ?.lastUploadTime
            ? new Date(
                realExtendedData.youtube_basic.data.basicYoutube.lastUploadTime
              ).toLocaleDateString("es-ES")
            : null,
        }
      : {
          // Usar los datos reales del influencer
          followers: influencer.followers_count || 0,
          avg_views: influencer.platform_info?.youtube?.basicYoutube?.avgViews1Y || 
                    influencer.platform_info?.youtube?.avgViews1Y || 0,
          avg_likes: influencer.platform_info?.youtube?.basicYoutube?.avgLikes1Y || 
                    influencer.platform_info?.youtube?.avgLikes1Y || 0,
          engagement_rate: influencer.average_engagement_rate || 0,
          growth_rate: influencer.platform_info?.youtube?.basicYoutube?.gRateSubscribers || 
                       influencer.platform_info?.youtube?.gRateSubscribers || 0,
          avg_comments: influencer.platform_info?.youtube?.basicYoutube?.avgComments1Y || 
                        influencer.platform_info?.youtube?.avgComments1Y || 0,
          total_videos: influencer.platform_info?.youtube?.basicYoutube?.totalVideos || 0,
          last_post_date: influencer.platform_info?.youtube?.basicYoutube?.lastUploadTime || 
                          influencer.platform_info?.youtube?.lastUploadTime
            ? new Date(
                influencer.platform_info?.youtube?.basicYoutube?.lastUploadTime || 
                influencer.platform_info?.youtube?.lastUploadTime
              ).toLocaleDateString("es-ES")
            : null,
        };

  // Helper para extraer datos de Instagram
  const basicIg =
    influencer.platform_info?.instagram?.basicInstagram ||
    influencer.platform_info?.instagram?.basicinstagram ||
    influencer.platform_info?.instagram ||
    influencer.platform_info?.basicInstagram ||
    influencer.platform_info?.basicinstagram ||
    null;
  // Helper para extraer datos de TikTok
  const basicTk =
    influencer.platform_info?.tiktok?.basicTiktok ||
    influencer.platform_info?.tiktok?.basicTikTok ||
    influencer.platform_info?.tiktok ||
    influencer.platform_info?.basicTiktok ||
    influencer.platform_info?.basicTikTok ||
    null;

  // Datos de Instagram - usar datos extendidos si están disponibles
  const instagramData =
    hasExtendedData && realExtendedData?.instagram_basic
      ? {
          followers:
            realExtendedData.instagram_basic.data?.basicInstagram?.followers ||
            0,
          engagement_rate:
            realExtendedData.instagram_basic.data?.basicInstagram?.engageRate ||
            0,
          avg_likes:
            realExtendedData.instagram_basic.data?.basicInstagram?.avgLikes ||
            0,
          avg_comments:
            realExtendedData.instagram_basic.data?.basicInstagram
              ?.avgComments || 0,
          total_posts:
            realExtendedData.instagram_basic.data?.basicInstagram?.posts || 0,
          growth_rate:
            realExtendedData.instagram_basic.data?.basicInstagram
              ?.gRateFollowers || 0,
          last_post_date: realExtendedData.instagram_basic.data?.basicInstagram
            ?.lastUploadTime
            ? new Date(
                realExtendedData.instagram_basic.data.basicInstagram.lastUploadTime
              ).toLocaleDateString("es-ES")
            : null,
        }
      : {
          followers: basicIg?.followers || basicIg?.followersCount || 0,
          engagement_rate: basicIg?.engageRate || basicIg?.engagementRate || 0,
          avg_likes: basicIg?.avgLikes || 0,
          avg_comments: basicIg?.avgComments || 0,
          total_posts: basicIg?.posts || basicIg?.postsCount || 0,
          growth_rate: basicIg?.gRateFollowers || 0,
          last_post_date:
            basicIg?.lastUploadTime || basicIg?.recentPosts?.[0]?.updateDate
              ? new Date(
                  basicIg.lastUploadTime || basicIg.recentPosts[0].updateDate
                ).toLocaleDateString("es-ES")
              : null,
        };

  // Datos de TikTok - usar datos extendidos si están disponibles
  const tiktokData =
    hasExtendedData && realExtendedData?.tiktok_basic
      ? {
          followers:
            realExtendedData.tiktok_basic.data?.basicTikTok?.followers || 0,
          avg_views:
            realExtendedData.tiktok_basic.data?.basicTikTok?.avgPlays ||
            realExtendedData.tiktok_basic.data?.basicTikTok?.avgViews ||
            0,
          avg_likes:
            realExtendedData.tiktok_basic.data?.basicTikTok?.avgHearts ||
            realExtendedData.tiktok_basic.data?.basicTikTok?.avgLikes ||
            0,
          avg_comments:
            realExtendedData.tiktok_basic.data?.basicTikTok?.avgComments || 0,
          engagement_rate:
            realExtendedData.tiktok_basic.data?.basicTikTok?.engageRate || 0,
          growth_rate:
            realExtendedData.tiktok_basic.data?.basicTikTok?.gRateFollowers ||
            0,
          last_post_date: realExtendedData.tiktok_basic.data?.basicTikTok
            ?.lastUploadTime
            ? new Date(
                realExtendedData.tiktok_basic.data.basicTikTok.lastUploadTime
              ).toLocaleDateString("es-ES")
            : null,
        }
      : {
          followers: basicTk?.followers || basicTk?.followersCount || 0,
          avg_views: basicTk?.avgPlays || basicTk?.avgViews || 0,
          avg_likes: basicTk?.avgHearts || basicTk?.avgLikes || 0,
          avg_comments: basicTk?.avgComments || 0,
          engagement_rate: basicTk?.engageRate || basicTk?.engagementRate || 0,
          growth_rate: basicTk?.gRateFollowers || 0,
          last_post_date:
            basicTk?.lastUploadTime || basicTk?.recentVideos?.[0]?.uploadDate
              ? new Date(
                  basicTk.lastUploadTime || basicTk.recentVideos[0].uploadDate
                ).toLocaleDateString("es-ES")
              : null,
        };

  const contactInfo = hasExtendedData
    ? propExtendedData?.contact_info
    : {
        emails: influencer.platform_info?.youtube?.emails || [],
        website: influencer.platform_info?.youtube?.website || null,
      };

  const performanceMetrics = hasExtendedData
    ? propExtendedData?.performance_metrics
    : {
        creator_score: 90,
        overall_engagement_rate:
          (youtubeData?.engagement_rate +
            instagramData?.engagement_rate +
            tiktokData?.engagement_rate) /
          3,
        total_views: youtubeData?.avg_views * 30 || 0,
        total_interactions:
          (youtubeData?.avg_likes +
            instagramData?.avg_likes +
            tiktokData?.avg_likes) *
            30 || 0,
      };

  const growthTrends = hasExtendedData ? propExtendedData?.growth_trends : null;

  // 🎯 NUEVA LÓGICA: Mostrar solo plataformas disponibles
  if (availablePlatforms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No hay métricas disponibles
        </h3>
        <p className="text-gray-500">
          Este influencer no tiene métricas de plataformas sociales
          configuradas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform statistics */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          Platform statistics
        </h2>
        <div
          className={`grid grid-cols-1 ${
            availablePlatforms.length === 1
              ? "md:grid-cols-1"
              : availablePlatforms.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-3"
          } gap-6`}
        >
          {availablePlatforms.map((platform) => {
            if (platform === "youtube") {
              return (
                <div
                  key="youtube"
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        YouTube subscribers
                      </span>
                    </div>
                    {mainPlatform === "youtube" && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                        Main platform
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatNumber(youtubeData?.followers || 0)}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                        Active
                      </span>
                    </div>
                    <span className="text-green-600 text-sm font-medium ml-auto">
                      ↗ {formatPercentage(youtubeData?.growth_rate)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total videos</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(youtubeData?.total_videos || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Average views</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(youtubeData?.avg_views || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Engagement rate</span>
                      <span className="font-medium text-gray-900">
                        {formatPercentage(youtubeData?.engagement_rate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Average likes / Comments
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(youtubeData?.avg_likes || 0)} /{" "}
                        {Math.round(youtubeData?.avg_comments || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Latest content</span>
                      <span className="font-medium text-gray-900">
                        {youtubeData?.last_post_date || "No disponible"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            if (platform === "instagram") {
              return (
                <div
                  key="instagram"
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        Instagram followers
                      </span>
                    </div>
                    {mainPlatform === "instagram" && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                        Main platform
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatNumber(instagramData?.followers || 0)}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                        Active
                      </span>
                    </div>
                    <span className="text-green-600 text-sm font-medium ml-auto">
                      ↗ {formatPercentage(instagramData?.growth_rate)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Engagement rate</span>
                      <span className="font-medium text-gray-900">
                        {formatPercentage(instagramData?.engagement_rate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Average likes</span>
                      <span className="font-medium text-gray-900">
                        {formatCleanNumber(instagramData?.avg_likes || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Average comments</span>
                      <span className="font-medium text-gray-900">
                        {formatCleanNumber(instagramData?.avg_comments || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total posts</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(instagramData?.total_posts || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Latest content</span>
                      <span className="font-medium text-gray-900">
                        {instagramData?.last_post_date || "No disponible"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            if (platform === "tiktok") {
              return (
                <div
                  key="tiktok"
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        TikTok followers
                      </span>
                    </div>
                    {mainPlatform === "tiktok" && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                        Main platform
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatNumber(tiktokData?.followers || 0)}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                        Active
                      </span>
                    </div>
                    <span className="text-green-600 text-sm font-medium ml-auto">
                      ↗ {formatPercentage(tiktokData?.growth_rate)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Average plays</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(tiktokData?.avg_views || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Average hearts</span>
                      <span className="font-medium text-gray-900">
                        {formatCleanNumber(tiktokData?.avg_likes || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Average comments</span>
                      <span className="font-medium text-gray-900">
                        {formatCleanNumber(tiktokData?.avg_comments || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Engagement rate</span>
                      <span className="font-medium text-gray-900">
                        {formatPercentage(tiktokData?.engagement_rate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Latest content</span>
                      <span className="font-medium text-gray-900">
                        {tiktokData?.last_post_date || "2025-07-02"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}

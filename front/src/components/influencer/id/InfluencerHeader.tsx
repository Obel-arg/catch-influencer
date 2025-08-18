import Image from "next/image";
import { formatNumber } from "@/utils/format";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar";

// 🎯 FUNCIÓN PARA FORMATEAR PORCENTAJES
const formatPercentage = (value: number): string => {
  const percentage = value * 100;
  const rounded = Math.round(percentage * 100) / 100;

  // Si es un entero, mostrarlo sin decimales
  if (Number.isInteger(rounded)) {
    return `${rounded}%`;
  }

  // Si tiene decimales, mostrar máximo 2
  return `${rounded.toFixed(2)}%`;
};

interface InfluencerHeaderProps {
  influencer: any;
  showLinks: boolean;
  setShowLinks: (show: boolean) => void;
  extendedData?: any;
  summary?: {
    hasExtendedData: boolean;
    completenessScore: number;
    lastSync: string | null;
    platformsWithData: string[];
    needsSync: boolean;
    totalApiCalls: number;
    estimatedCost: number;
  } | null;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export default function InfluencerHeader({
  influencer,
  showLinks,
  setShowLinks,
  extendedData,
  summary,
  onRefreshData,
  isRefreshing = false,
}: InfluencerHeaderProps) {
  // Calcular métricas usando datos extendidos si están disponibles
  const hasExtendedData =
    summary?.hasExtendedData || extendedData?.youtube_basic || false;

  // Helpers para extraer datos de plataformas básicas cuando no hay extendedData
  const basicIg =
    influencer.platform_info?.instagram?.basicInstagram ||
    influencer.platform_info?.instagram?.basicinstagram ||
    influencer.platform_info?.instagram ||
    influencer.platform_info?.basicInstagram ||
    influencer.platform_info?.basicinstagram ||
    null;
  const basicTk =
    influencer.platform_info?.tiktok?.basicTiktok ||
    influencer.platform_info?.tiktok?.basicTikTok ||
    influencer.platform_info?.tiktok ||
    influencer.platform_info?.basicTiktok ||
    influencer.platform_info?.basicTikTok ||
    null;

  // Calcular total de followers
  const youtubeFollowers =
    hasExtendedData && extendedData?.youtube_basic
      ? extendedData.youtube_basic.data?.basicYoutube?.subscribers || 0
      : influencer.platform_info?.youtube?.subscribers ||
        influencer.followers_count ||
        0;

  const instagramFollowers =
    hasExtendedData && extendedData?.instagram_basic
      ? extendedData.instagram_basic.data?.basicInstagram?.followers || 0
      : basicIg?.followers || basicIg?.followersCount || 0;

  const tiktokFollowers =
    hasExtendedData && extendedData?.tiktok_basic
      ? extendedData.tiktok_basic.data?.basicTikTok?.followers || 0
      : basicTk?.followers || basicTk?.followersCount || 0;

  const totalFollowers =
    youtubeFollowers + instagramFollowers + tiktokFollowers;

  // Calcular engagement rate promedio (ponderado simple)
  const youtubeEngagement =
    hasExtendedData && extendedData?.youtube_basic
      ? extendedData.youtube_basic.data?.basicYoutube?.engageRate1Y || 0
      : influencer.platform_info?.youtube?.engageRate1Y ||
        influencer.average_engagement_rate ||
        0;

  const instagramEngagement =
    hasExtendedData && extendedData?.instagram_basic
      ? extendedData.instagram_basic.data?.basicInstagram?.engageRate || 0
      : basicIg?.engageRate || basicIg?.engagementRate || 0;

  const tiktokEngagement =
    hasExtendedData && extendedData?.tiktok_basic
      ? extendedData.tiktok_basic.data?.basicTikTok?.engageRate || 0
      : basicTk?.engageRate || basicTk?.engagementRate || 0;

  const avgEngagement =
    (youtubeEngagement + instagramEngagement + tiktokEngagement) / 3;

  // Calcular crecimiento promedio de seguidores
  const youtubeGrowth =
    hasExtendedData && extendedData?.youtube_basic
      ? extendedData.youtube_basic.data?.basicYoutube?.gRateSubscribers || 0
      : influencer.platform_info?.youtube?.gRateSubscribers || 0;

  const instagramGrowth =
    hasExtendedData && extendedData?.instagram_basic
      ? extendedData.instagram_basic.data?.basicInstagram?.gRateFollowers || 0
      : basicIg?.gRateFollowers || 0;

  const tiktokGrowth =
    hasExtendedData && extendedData?.tiktok_basic
      ? extendedData.tiktok_basic.data?.basicTikTok?.gRateFollowers || 0
      : basicTk?.gRateFollowers || 0;

  const avgGrowth = (youtubeGrowth + instagramGrowth + tiktokGrowth) / 3;

  // Links desde datos extendidos
  const links =
    hasExtendedData && extendedData?.youtube_basic?.data?.basicYoutube?.links
      ? extendedData.youtube_basic.data.basicYoutube.links
      : influencer.platform_info?.youtube?.links || [];

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200">
      <div className="p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative">
              <LazyInfluencerAvatar
                influencer={{
                  name: influencer.name,
                  avatar:
                    influencer.avatar ||
                    influencer.platform_info?.youtube?.avatar,
                }}
                className="w-20 h-20"
              />
            </div>
          </div>

          {/* Información principal */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {influencer.name}
                  </h1>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(influencer.categories) &&
                  influencer.categories.length > 0
                    ? influencer.categories.map((cat: string) => (
                        <span
                          key={cat}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {cat}
                        </span>
                      ))
                    : Array.isArray(influencer.content_niches) &&
                      influencer.content_niches.length > 0
                    ? influencer.content_niches.map((niche: string) => (
                        <span
                          key={niche}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                        >
                          {niche}
                        </span>
                      ))
                    : null}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-blue-500"></span>
                    <span>{influencer.location || "Argentina"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🌐</span>
                    <span>Spanish</span>
                  </div>
                </div>
              </div>

              {/* Métricas principales al lado del nombre */}
              <div className="flex gap-10 ml-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-7 h-7 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatNumber(totalFollowers)}
                  </div>
                  <div className="text-sm text-gray-500">Total followers</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-7 h-7 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPercentage(avgGrowth)}
                  </div>
                  <div className="text-sm text-gray-500">Followers growth</div>
                  <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-7 h-7 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPercentage(avgEngagement)}
                  </div>
                  <div className="text-sm text-gray-500">Engagement rate</div>
                  <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
                </div>

                {/* Botón de actualizar datos */}
                {onRefreshData && (
                  <div className="flex items-center">
                    <Button
                      onClick={onRefreshData}
                      disabled={isRefreshing}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          isRefreshing ? "animate-spin" : ""
                        }`}
                      />
                      {isRefreshing ? "Actualizando..." : "Actualizar datos"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Bio personal */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Personal description (bio)
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {basicIg?.description ||
                      influencer.platform_info?.instagram?.description ||
                      influencer.bio ||
                      "No description available"}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      influencer.main_social_platform === "instagram"
                        ? "bg-purple-100 text-purple-600"
                        : influencer.main_social_platform === "youtube"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {influencer.main_social_platform
                      ? influencer.main_social_platform
                          .charAt(0)
                          .toUpperCase() +
                        influencer.main_social_platform.slice(1)
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de links mencionados */}
            <div className="flex flex-wrap gap-4 items-center relative">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg border border-orange-200 hover:bg-orange-100 transition"
                onClick={() => setShowLinks(!showLinks)}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Mentioned links
              </button>

              {showLinks && (
                <div
                  id="links-popover"
                  className="absolute z-50 mt-2 bg-white rounded-xl shadow-xl p-4 flex flex-col gap-3 left-0 top-full min-w-[280px] border border-gray-100"
                >
                  {links.length > 0 ? (
                    links.map((link: any) => (
                      <div key={link.url} className="group">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                        >
                          <div className="flex-1">
                            <div className="text-gray-900 font-medium text-sm">
                              {link.title || "Link"}
                            </div>
                            <div className="text-gray-500 text-xs mt-1 truncate">
                              {link.url}
                            </div>
                          </div>
                          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </div>
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm text-center py-4">
                      No additional links available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

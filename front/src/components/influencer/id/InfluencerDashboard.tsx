"use client";
import { useEffect, useState, useMemo } from "react";
import { influencerService } from "@/lib/services/influencer";
import { useRouter, useSearchParams } from "next/navigation";
import InfluencerExtendedMetrics from "./InfluencerExtendedMetrics";
import InfluencerHeader from "./InfluencerHeader";
import { InfluencerInstagramGallery } from "./InfluencerInstagramGallery";
import { InfluencerYouTubeGallery } from "./InfluencerYouTubeGallery";
import { InfluencerTikTokGallery } from "./InfluencerTikTokGallery";
import InfluencerAudience from "./InfluencerAudience";
import { useInfluencerExtended } from "@/hooks/influencer/useInfluencerExtended";
import { useInfluencers } from "@/hooks/influencer/useInfluencers";
import { Skeleton } from "@/components/ui/skeleton";

interface InfluencerDashboardProps {
  id: string;
}

const iconMap: Record<string, string> = {
  youtube: "/icons/youtube.svg",
  instagram: "/icons/instagram.svg",
  tiktok: "/icons/tiktok.svg",
};

// Función para obtener datos de Instagram
function getInstagramData(platform_info: any) {
  return (
    platform_info?.instagram?.basicInstagram ||
    platform_info?.instagram?.basicinstagram ||
    platform_info?.instagram ||
    platform_info?.basicInstagram ||
    platform_info?.basicinstagram
  );
}

// Función para obtener datos de TikTok
function getTiktokData(platform_info: any) {
  return (
    platform_info?.tiktok?.basicTikTok ||
    platform_info?.tiktok?.basicTiktok ||
    platform_info?.tiktok ||
    platform_info?.basicTikTok ||
    platform_info?.basicTiktok
  );
}

// 🎯 SKELETON MEJORADO DEL DASHBOARD DEL INFLUENCER
const InfluencerDashboardSkeleton = () => (
  <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white">
    {/* Botón de volver skeleton */}
    <div className="w-full py-1 px-4 md:px-12 lg:px-16 xl:px-20">
      <Skeleton className="h-10 w-40 rounded-lg" />
    </div>

    <div className="w-full py-8 px-4 md:px-12 lg:px-16 xl:px-20">
      {/* Header skeleton - Card principal */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          {/* Lado izquierdo - Avatar y info */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />

            {/* Información del influencer */}
            <div className="space-y-4">
              {/* Nombre y verificación */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>

              {/* Categoría */}
              <Skeleton className="h-6 w-20 rounded-full" />

              {/* Ubicación e idioma */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-8 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>

              {/* Descripción */}
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-4 w-80" />

              {/* Botón de links mencionados */}
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>

          {/* Lado derecho - Métricas principales */}
          <div className="flex flex-col items-end gap-4">
            {/* Métricas en columnas */}
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
              ))}
            </div>

            {/* Botón de actualizar */}
            <Skeleton className="h-9 w-32 rounded-lg" />

            {/* Botón de YouTube */}
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mt-8">
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Contenido de tabs skeleton - Cards de plataformas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              {/* Header de la plataforma */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Métricas de la plataforma */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>

              {/* Último contenido */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function InfluencerDashboard({ id }: InfluencerDashboardProps) {
  const [influencer, setInfluencer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  	const [tab, setTab] = useState<"metrics" | "content" | "audience">("metrics");
  const [showLinks, setShowLinks] = useState(false);
  const [contentTab, setContentTab] = useState<
    "youtube" | "instagram" | "tiktok" | "twitter"
  >("youtube");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // 🎯 NUEVO: Contador de reintentos
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🎯 Lógica de redirect: determinar URL de vuelta
  const getBackUrl = () => {
    const redirect = searchParams.get("redirect");
    const brandId = searchParams.get("brandId");
    const campaignId = searchParams.get("campaignId"); // 🎯 NUEVO: Obtener ID de campaña
    const tab = searchParams.get("tab");

    if (redirect === "brands" && brandId) {
      return `/brands/${brandId}${tab ? `?tab=${tab}` : ""}`;
    }

    // 🎯 NUEVA LÓGICA: Redirigir a campaña si viene de una campaña
    if (redirect === "campaign" && campaignId) {
      return `/campaigns/${campaignId}${tab ? `?tab=${tab}` : ""}`;
    }

    return "/influencers";
  };

  const getBackLabel = () => {
    const redirect = searchParams.get("redirect");

    if (redirect === "brands") {
      return "Volver a marca";
    }

    // 🎯 NUEVA LÓGICA: Mostrar "Volver a la campaña" si viene de una campaña
    if (redirect === "campaign") {
      return "Volver a la campaña";
    }

    return "Volver a influencers";
  };

  // 🎯 NUEVA LÓGICA: Determinar plataformas disponibles
  const availablePlatforms = useMemo(() => {
    if (!influencer) return [];

    const platforms = [];

    // YouTube - verificar si hay videos
    if (influencer.platform_info?.youtube?.recentVideos?.length > 0) {
      platforms.push("youtube");
    }

    // Instagram - verificar si hay posts
    const instagramData = getInstagramData(influencer.platform_info);
    if (instagramData?.recentPosts?.length > 0) {
      platforms.push("instagram");
    }

    // TikTok - verificar si hay videos
    const tiktokData = getTiktokData(influencer.platform_info);
    if (tiktokData?.recentVideos?.length > 0) {
      platforms.push("tiktok");
    }

    // Twitter (si existe)
    if (influencer.platform_info?.twitter?.recentPosts?.length > 0) {
      platforms.push("twitter");
    }

    return platforms;
  }, [influencer]);

  // 🎯 NUEVA LÓGICA: Establecer tab inicial basado en plataformas disponibles
  useEffect(() => {
    if (
      availablePlatforms.length > 0 &&
      !availablePlatforms.includes(contentTab)
    ) {
      setContentTab(
        availablePlatforms[0] as "youtube" | "instagram" | "tiktok" | "twitter"
      );
    }
  }, [availablePlatforms, contentTab]);

  // Hook para obtener datos extendidos (centralizado) - solo cuando tenemos el influencer
  const {
    extendedData,
    loading: extendedLoading,
    summary,
  } = useInfluencerExtended(influencer?.creator_id || null, id);

  // Hook para actualizar datos del influencer
  const { refreshInfluencerData } = useInfluencers();

  useEffect(() => {
    setLoading(true);
    setError(null);

    influencerService
      .getInfluencerById(id)
      .then((data) => {
        // 🎯 NUEVO: Verificar que los datos son válidos
        if (!data || !data.id) {
          throw new Error("Datos del influencer inválidos");
        }

        setInfluencer(data);
        setRetryCount(0); // Resetear contador de reintentos
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "❌ [InfluencerDashboard] Error cargando influencer:",
          error
        );

        // 🎯 NUEVO: Retry mechanism para casos específicos
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 1000 * (retryCount + 1)); // Delay incremental
        } else {
          setError("No se pudo cargar el influencer");
          setLoading(false);
        }
      });
  }, [id, searchParams, retryCount]); // 🎯 NUEVO: Agregar retryCount como dependencia

  // Cierra el popover de links al hacer click fuera
  useEffect(() => {
    if (!showLinks) return;
    const handler = (e: MouseEvent) => {
      const pop = document.getElementById("links-popover");
      if (pop && !pop.contains(e.target as Node)) setShowLinks(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLinks]);

  // 🎯 FUNCIÓN PARA ACTUALIZAR DATOS DEL INFLUENCER
  const handleRefreshData = async () => {
    if (!influencer) return;

    try {
      setIsRefreshing(true);
      const updatedInfluencer = await refreshInfluencerData(influencer.id);
      if (updatedInfluencer) {
        setInfluencer(updatedInfluencer);
      }
    } catch (error) {
      console.error("Error refreshing influencer data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 🎯 NUEVO: Mostrar skeleton hasta que tanto los datos básicos como los extendidos estén cargados
  if (loading || extendedLoading) {
    return <InfluencerDashboardSkeleton />;
  }

  if (error || !influencer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">
            {error || "No se pudo cargar el influencer"}
          </p>
          <button
            onClick={() => router.push(getBackUrl())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {getBackLabel()}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="w-full py-1 px-4 md:px-12 lg:px-16 xl:px-20">
        <button
          onClick={() => router.push(getBackUrl())}
          className="mb-0.5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {getBackLabel()}
        </button>
      </div>

      {influencer && (
        <div className="w-full py-8 px-4 md:px-12 lg:px-16 xl:px-20">
          {/* Header del influencer con métricas principales */}
          <InfluencerHeader
            influencer={influencer}
            showLinks={showLinks}
            setShowLinks={setShowLinks}
            extendedData={extendedData}
            summary={summary}
            onRefreshData={handleRefreshData}
            isRefreshing={isRefreshing}
          />

          {/* Tabs de métricas y contenido */}
          <div className="mt-8 w-full">
            <div className="flex gap-4 border-b mb-4">
              <button
                className={`pb-2 px-4 font-medium border-b-2 transition-colors ${
                  tab === "metrics"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-blue-700"
                }`}
                onClick={() => setTab("metrics")}
              >
                Métricas
              </button>
              <button
                className={`pb-2 px-4 font-medium border-b-2 transition-colors ${
                  tab === "content"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-blue-700"
                }`}
                onClick={() => setTab("content")}
              >
                Contenido
              </button>
              <button
                className={`pb-2 px-4 font-medium border-b-2 transition-colors ${
                  tab === "audience"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-blue-700"
                }`}
                onClick={() => setTab("audience")}
              >
                Audiencia
              </button>
            </div>

            {tab === "metrics" && (
              <InfluencerExtendedMetrics
                influencerId={id}
                influencer={influencer}
                extendedData={extendedData}
                extendedLoading={extendedLoading}
                summary={summary}
              />
            )}

            {tab === "content" && (
              <div className="mt-4 pb-0 min-h-[500px]">
                {/* 🎯 NUEVA LÓGICA: Mostrar solo plataformas disponibles */}
                {availablePlatforms.length === 0 ? (
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
                      No hay contenido disponible
                    </h3>
                    <p className="text-gray-500">
                      Este influencer no tiene contenido de plataformas sociales
                      configurado.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Tabs de plataformas */}
                    <div className="flex gap-4 border-b mb-4">
                      {availablePlatforms.map((platform) => (
                        <button
                          key={platform}
                          className={`pb-2 px-4 font-medium border-b-2 transition-colors ${
                            contentTab === platform
                              ? platform === "youtube"
                                ? "border-red-500 text-red-600"
                                : platform === "instagram"
                                ? "border-pink-500 text-pink-600"
                                : platform === "tiktok"
                                ? "border-black text-black"
                                : "border-blue-400 text-blue-400"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                          onClick={() =>
                            setContentTab(
                              platform as
                                | "youtube"
                                | "instagram"
                                | "tiktok"
                                | "twitter"
                            )
                          }
                        >
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* 🎯 CONTENEDOR CON ALTURA FIJA PARA EVITAR SALTOS */}
                    <div className="relative min-h-[400px]">
                      {/* 🎯 NUEVA GALERÍA DE YOUTUBE */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          contentTab === "youtube"
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        <InfluencerYouTubeGallery influencer={influencer} />
                      </div>

                      {/* 🎯 NUEVA GALERÍA DE INSTAGRAM */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          contentTab === "instagram"
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        <InfluencerInstagramGallery influencer={influencer} />
                      </div>

                      {/* 🎯 NUEVA GALERÍA DE TIKTOK */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          contentTab === "tiktok"
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        <InfluencerTikTokGallery influencer={influencer} />
                      </div>

                      {/* Contenido de Twitter */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          contentTab === "twitter"
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Aquí deberías mapear los posts de Twitter si los tienes en los datos */}
                          <div className="col-span-full text-center text-gray-400 py-8">
                            No hay posts de Twitter disponibles.
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "audience" && (
              <InfluencerAudience influencer={influencer} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

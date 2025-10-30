"use client";
import { useEffect, useState, useMemo } from "react";
import { hypeAuditorDiscoveryService } from "@/lib/services/hypeauditor-discovery.service";
import { useRouter, useSearchParams } from "next/navigation";
import HypeAuditorHeader from "./HypeAuditorHeader";
import HypeAuditorMetrics from "./HypeAuditorMetrics";
import HypeAuditorAudienceDemographics from "./HypeAuditorAudienceDemographics";
import { Skeleton } from "@/components/ui/skeleton";

interface InfluencerDashboardProps {
  id: string;
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
  const [creatorData, setCreatorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"metrics" | "audience" | "networks">("metrics");
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🎯 Lógica de redirect: determinar URL de vuelta
  const getBackUrl = () => {
    const redirect = searchParams.get("redirect");
    const brandId = searchParams.get("brandId");
    const campaignId = searchParams.get("campaignId");
    const tabParam = searchParams.get("tab");

    if (redirect === "brands" && brandId) {
      return `/brands/${brandId}${tabParam ? `?tab=${tabParam}` : ""}`;
    }

    if (redirect === "campaign" && campaignId) {
      return `/campaigns/${campaignId}${tabParam ? `?tab=${tabParam}` : ""}`;
    }

    return "/influencers";
  };

  const getBackLabel = () => {
    const redirect = searchParams.get("redirect");

    if (redirect === "brands") {
      return "Volver a marca";
    }

    if (redirect === "campaign") {
      return "Volver a la campaña";
    }

    return "Volver a influencers";
  };

  // 🎯 Cargar datos del creador desde HypeAuditor
  useEffect(() => {
    setLoading(true);
    setError(null);

    hypeAuditorDiscoveryService
      .getCreatorReport(id)
      .then((data) => {
        if (!data || !data.username) {
          throw new Error("Datos del creador inválidos");
        }

        setCreatorData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "❌ [InfluencerDashboard] Error cargando datos de HypeAuditor:",
          err
        );
        setError("No se pudo cargar los datos del creador");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <InfluencerDashboardSkeleton />;
  }

  if (error || !creatorData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">
            {error || "No se pudo cargar los datos del creador"}
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
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white">
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

      <div className="w-full py-8 px-4 md:px-12 lg:px-16 xl:px-20">
        {/* Header HypeAuditor */}
        <HypeAuditorHeader data={creatorData} />

        {/* Tabs */}
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
                tab === "audience"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-blue-700"
              }`}
              onClick={() => setTab("audience")}
            >
              Audiencia
            </button>
            <button
              className={`pb-2 px-4 font-medium border-b-2 transition-colors ${
                tab === "networks"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-blue-700"
              }`}
              onClick={() => setTab("networks")}
            >
              Redes Sociales
            </button>
          </div>

          {tab === "metrics" && (
            <HypeAuditorMetrics data={creatorData} />
          )}

          {tab === "audience" && (
            <HypeAuditorAudienceDemographics data={creatorData} />
          )}

          {tab === "networks" && (
            <div className="mt-4 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creatorData.social_networks?.map((network: any, idx: number) => {
                  // Platform color mapping
                  const getPlatformColor = (platform: string) => {
                    const platformLower = platform?.toLowerCase() || '';
                    switch (platformLower) {
                      case 'youtube':
                        return 'bg-red-100 text-red-700';
                      case 'instagram':
                        return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700';
                      case 'twitter':
                      case 'x':
                        return 'bg-sky-100 text-sky-700';
                      case 'tiktok':
                        return 'bg-gray-900 text-white';
                      case 'twitch':
                        return 'bg-purple-100 text-purple-700';
                      case 'facebook':
                        return 'bg-blue-100 text-blue-700';
                      default:
                        return 'bg-gray-100 text-gray-700';
                    }
                  };

                  // Platform name mapping
                  const getPlatformName = (platform: string) => {
                    const platformLower = platform?.toLowerCase() || '';
                    const nameMap: Record<string, string> = {
                      'youtube': 'YouTube',
                      'instagram': 'Instagram',
                      'twitter': 'Twitter',
                      'x': 'X',
                      'tiktok': 'TikTok',
                      'twitch': 'Twitch',
                      'facebook': 'Facebook',
                    };
                    return nameMap[platformLower] || platform;
                  };

                  return (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {network.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            @{network.username}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getPlatformColor(network.platform)}`}>
                          {getPlatformName(network.platform)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Seguidores:</span>
                          <span className="font-semibold text-gray-900">
                            {(network.subscribers_count || 0).toLocaleString()}
                          </span>
                        </div>
                        {network.er > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">ER:</span>
                            <span className="font-semibold text-gray-900">
                              {network.er.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

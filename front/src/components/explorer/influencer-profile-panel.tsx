'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Loader2, Info, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NumberDisplay } from '@/components/ui/NumberDisplay';
import { toast } from 'sonner';
import { exportInfluencerSquadPDF } from '@/utils/influencer-pdf-export';
import { InfluencerSquadPDFTemplate } from '@/components/explorer/pdf-templates/InfluencerSquadPDFTemplate';
import {
  getInstagramThumbnailValidated,
  getOptimizedAvatarUrl,
} from '@/utils/instagram';
import {
  getTikTokThumbnailValidated,
  getTikTokDefaultThumbnail,
  getSafeAvatarUrlForModal,
} from '@/utils/tiktok';
import { CountryFlag } from '@/components/ui/country-flag';
import { influencerService } from '@/lib/services/influencer';
import { AudienceDemographics } from '@/types/audience';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface InfluencerProfilePanelProps {
  influencer: any;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  audienceCache?: {
    [influencerId: string]: {
      data: any;
      timestamp: number;
    };
  };
  onAudienceFetched?: (id: string, data: any) => void;
  searchContext?: {
    location?: string;
    audienceGeo?: {
      countries: Array<{ id: string; prc: number }>;
      cities: Array<{ id: number; prc: number }>;
    };
  };
}

// 🎯 Helper para usar iconos desde /public/icons
const getPlatformIcon = (platform: string, className = 'h-5 w-5') => {
  let iconSrc = '';
  switch (platform) {
    case 'Instagram':
      iconSrc = '/icons/instagram.svg';
      break;
    case 'TikTok':
      iconSrc = '/icons/tiktok.svg';
      break;
    case 'YouTube':
      iconSrc = '/icons/youtube.svg';
      break;
    case 'Facebook':
      iconSrc = '/icons/facebook.svg';
      break;
    case 'Threads':
      iconSrc = '/icons/threads.svg';
      break;
    default:
      return null;
  }
  return <img src={iconSrc} alt={`${platform} icon`} className={className} />;
};

// Función para formatear números
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// ✨ FUNCIÓN PARA PROCESAR AVATARES - ACTUALIZADA para usar nueva función optimizada
const getProcessedAvatar = (avatarUrl: string, influencerName: string) => {
  return getSafeAvatarUrlForModal(avatarUrl, influencerName);
};

// 🎯 SKELETON DEL PANEL DE INFLUENCER
const InfluencerProfileSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="flex-1 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center space-y-2">
          <div className="h-8 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
        </div>
      ))}
    </div>

    {/* Tabs Skeleton */}
    <div className="flex gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-8 bg-gray-200 rounded w-20 animate-pulse"
        ></div>
      ))}
    </div>

    {/* Content Skeleton */}
    <div className="space-y-4">
      <div className="text-sm font-semibold text-gray-700">Posts recientes</div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 rounded-md animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  </div>
);

// 🎯 COMPONENTE DE IMAGEN CON LOADER Y BOTÓN DE RELOAD
const ImageWithLoader = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount((prev) => prev + 1);
    // Forzar recarga de la imagen agregando un timestamp
    const newSrc = `${src}?retry=${retryCount + 1}&t=${Date.now()}`;
    setCurrentSrc(newSrc);
  };

  // Actualizar src cuando cambie la prop
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  return (
    <div className={`relative aspect-square ${className}`}>
      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-md border border-gray-200">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <div className="text-xs text-gray-400">Cargando...</div>
          </div>
        </div>
      )}

      {/* Imagen */}
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover rounded-md transition-all duration-300 ${
          isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Fallback para errores con botón de reload */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-md border border-gray-200">
          <div className="text-center text-gray-500">
            <div className="text-xs font-medium mb-2">Imagen no disponible</div>
            <button
              onClick={handleRetry}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎯 COMPONENTE DE AVATAR CON LOADER Y BOTÓN DE RELOAD
const AvatarWithLoader = ({
  src,
  alt,
  fallback,
  className,
}: {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount((prev) => prev + 1);
    const newSrc = `${src}?retry=${retryCount + 1}&t=${Date.now()}`;
    setCurrentSrc(newSrc);
  };

  // Actualizar src cuando cambie la prop
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-full border border-gray-200">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}

      {/* Avatar */}
      <Avatar className={className}>
        <AvatarImage
          src={currentSrc}
          alt={alt}
          className={`transition-all duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>

      {/* Botón de reload para errores */}
      {hasError && (
        <button
          onClick={handleRetry}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-sm"
          title="Reintentar carga de imagen"
        >
          ↻
        </button>
      )}
    </div>
  );
};

export function InfluencerProfilePanel({
  influencer,
  isOpen,
  onClose,
  isLoading = false,
  audienceCache,
  onAudienceFetched,
  searchContext,
}: InfluencerProfilePanelProps) {
  // 🎯 FUNCIÓN PARA DETECTAR SI TIENE DATOS EXTENDIDOS
  const hasExtendedData = useMemo(() => {
    if (!influencer) return false;

    // Verificar si tiene metadatos de fuente de datos
    if (influencer._metadata?.hasExtendedData) return true;

    // Verificar si tiene datos detallados de plataformas
    const platformInfo = influencer.platformInfo || {};

    // Buscar datos extendidos en cualquier plataforma
    const hasYouTubeExtended =
      platformInfo.youtube &&
      (platformInfo.youtube.recentVideos?.length > 0 ||
        platformInfo.youtube.subscribers > 0 ||
        platformInfo.youtube.views > 0);

    const hasInstagramExtended =
      platformInfo.instagram &&
      (platformInfo.instagram.basicInstagram?.followers > 0 ||
        platformInfo.instagram.recentPosts?.length > 0 ||
        platformInfo.instagram.basicInstagram?.engageRate > 0);

    const hasTikTokExtended =
      platformInfo.tiktok &&
      (platformInfo.tiktok.basicTikTok?.followers > 0 ||
        platformInfo.tiktok.recentVideos?.length > 0 ||
        platformInfo.tiktok.basicTikTok?.engageRate > 0);

    const hasFacebookExtended =
      platformInfo.facebook &&
      (platformInfo.facebook.basicFacebook?.followers > 0 ||
        platformInfo.facebook.recentPosts?.length > 0 ||
        platformInfo.facebook.basicFacebook?.engageRate > 0);

    const hasThreadsExtended =
      platformInfo.threads &&
      (platformInfo.threads.basicThreads?.followers > 0 ||
        platformInfo.threads.recentPosts?.length > 0 ||
        platformInfo.threads.basicThreads?.gRateThreadsTabAvgLikes > 0);

    return (
      hasYouTubeExtended ||
      hasInstagramExtended ||
      hasTikTokExtended ||
      hasFacebookExtended ||
      hasThreadsExtended
    );
  }, [influencer]);

  // Nueva función para obtener los datos correctos de la plataforma
  const getPlatformData = (platform: string) => {
    const pdata = influencer.platformInfo[platform.toLowerCase()];
    if (!pdata) return null;
    if (platform === 'Instagram' && pdata.basicInstagram)
      return pdata.basicInstagram;
    if (platform === 'TikTok' && pdata.basicTikTok) return pdata.basicTikTok;
    if (platform === 'Facebook' && pdata.basicFacebook)
      return pdata.basicFacebook;
    if (platform === 'Threads' && pdata.basicThreads) return pdata.basicThreads;
    return pdata;
  };

  // ✨ ESTADO PARA AVATAR PROCESADO
  const [processedAvatar, setProcessedAvatar] = useState<string>('');

  // ✨ ESTADO PARA AUDIENCIA SINTÉTICA
  const [audienceData, setAudienceData] = useState<AudienceDemographics | null>(
    null,
  );
  const [loadingAudience, setLoadingAudience] = useState(false);

  const availablePlatforms = useMemo(() => {
    const platforms: string[] = [];

    if (!influencer) {
      return platforms;
    }

    // Verificar cada plataforma en platformInfo - más robusto
    const platformInfo = influencer.platformInfo;

    // YouTube
    if (
      platformInfo.youtube &&
      (platformInfo.youtube.subscribers > 0 ||
        platformInfo.youtube.recentVideos?.length > 0 ||
        platformInfo.youtube.views > 0 ||
        Object.keys(platformInfo.youtube).length > 0)
    ) {
      platforms.push('YouTube');
    }

    // Instagram
    if (
      platformInfo.instagram &&
      (platformInfo.instagram.basicInstagram?.followers > 0 ||
        platformInfo.instagram.recentPosts?.length > 0 ||
        platformInfo.instagram.basicInstagram?.engageRate > 0 ||
        Object.keys(platformInfo.instagram).length > 0)
    ) {
      platforms.push('Instagram');
    }

    // TikTok
    if (
      platformInfo.tiktok &&
      (platformInfo.tiktok.basicTikTok?.followers > 0 ||
        platformInfo.tiktok.recentVideos?.length > 0 ||
        platformInfo.tiktok.basicTikTok?.engageRate > 0 ||
        Object.keys(platformInfo.tiktok).length > 0)
    ) {
      platforms.push('TikTok');
    }

    // Facebook
    if (
      platformInfo.facebook &&
      (platformInfo.facebook.basicFacebook?.followers > 0 ||
        platformInfo.facebook.recentPosts?.length > 0 ||
        platformInfo.facebook.basicFacebook?.engageRate > 0 ||
        Object.keys(platformInfo.facebook).length > 0)
    ) {
      platforms.push('Facebook');
    }

    // Threads
    if (
      platformInfo.threads &&
      (platformInfo.threads.basicThreads?.followers > 0 ||
        platformInfo.threads.recentPosts?.length > 0 ||
        platformInfo.threads.basicThreads?.gRateThreadsTabAvgLikes > 0 ||
        Object.keys(platformInfo.threads).length > 0)
    ) {
      platforms.push('Threads');
    }

    return platforms;
  }, [influencer]);

  const [activePlatform, setActivePlatform] = useState(
    influencer.platform || 'YouTube',
  );

  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const requestedThumbnails = useRef<Record<string, boolean>>({});
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // 📄 Export to PDF handler
  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      await exportInfluencerSquadPDF(influencer.name);
      toast.success('PDF exportado exitosamente');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error al exportar el PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Función asíncrona para obtener y cachear thumbnails
  const fetchAndCacheThumbnail = async (
    key: string,
    platform: string,
    post: any,
  ) => {
    if (requestedThumbnails.current[key]) return;
    requestedThumbnails.current[key] = true;
    let url = '';
    if (platform === 'Instagram') {
      url = `https://www.instagram.com/p/${post.shortcode}`;
      const thumb = await getInstagramThumbnailValidated(url);
      setThumbnails((prev) => ({ ...prev, [key]: thumb }));
    } else if (platform === 'TikTok') {
      // Construir la URL del video de TikTok
      const tiktokId =
        platformData?.tiktokId || influencer?.platformInfo?.tiktok?.tiktokId;
      const videoId = post.videoId;
      if (tiktokId && videoId) {
        const tiktokUrl = `https://www.tiktok.com/@${tiktokId}/video/${videoId}`;
        const thumb = await getTikTokThumbnailValidated(tiktokUrl);
        setThumbnails((prev) => ({ ...prev, [key]: thumb }));
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActivePlatform(
        influencer.platform || availablePlatforms[0] || 'YouTube',
      );
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, influencer, availablePlatforms]);

  // ✨ PROCESAR AVATAR CUANDO CAMBIE EL INFLUENCER
  useEffect(() => {
    if (influencer) {
      const originalAvatar = influencer.avatar || influencer.image || '';
      const influencerName = influencer.name || 'Influencer';
      const processed = getProcessedAvatar(originalAvatar, influencerName);
      setProcessedAvatar(processed);
    }
  }, [influencer]);

  // ✨ CARGAR AUDIENCIA SINTÉTICA CUANDO SE ABRA EL MODAL
  useEffect(() => {
    const loadSyntheticAudience = async () => {
      if (!isOpen || !influencer?.id) {
        // Clear audience data when panel closes or no influencer
        setAudienceData(null);
        return;
      }

      // Check client-side cache first (5 minute TTL)
      const cached = audienceCache?.[influencer.id];
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        console.log(`✅ Client cache hit for influencer ${influencer.id}`);
        setAudienceData(cached.data);
        setLoadingAudience(false);
        return;
      }

      // If not in cache or expired, fetch from API
      setLoadingAudience(true);
      // Clear old data while loading to prevent showing wrong data
      setAudienceData(null);

      try {
        // Extract the correct Instagram username from platformInfo
        console.log(
          '[InfluencerProfilePanel] Extracting Instagram username for influencer:',
          influencer,
        );
        const instagramUsername =
          influencer.platformInfo?.instagram?.username ||
          influencer.creatorId ||
          influencer.id;

        console.log(
          '[InfluencerProfilePanel] Using Instagram username:',
          instagramUsername,
          '(from platformInfo.instagram.username)',
        );

        // Prepare influencer data for the API call
        const influencerData = {
          username: instagramUsername,
          follower_count: influencer.followersCount || 50000,
          platform: influencer.mainSocialPlatform || 'instagram',
          niche: influencer.categories?.[0] || undefined,
          location: influencer.location || influencer.country || undefined,
          // Pass search context for better AI inference
          search_context: searchContext,
        };

        const response = await influencerService.getSyntheticAudience(
          influencer.id,
          influencerData,
        );
        if (response.success && response.audience) {
          setAudienceData(response.audience);
          // Update cache
          if (onAudienceFetched) {
            onAudienceFetched(influencer.id, response.audience);
          }
        }
      } catch (error) {
        console.error('Error loading synthetic audience:', error);
        setAudienceData(null);
      } finally {
        setLoadingAudience(false);
      }
    };

    loadSyntheticAudience();
  }, [isOpen, influencer?.id, influencer?.name]);

  const platformData = useMemo(() => {
    if (!influencer?.platformInfo) return null;
    return getPlatformData(activePlatform);
  }, [activePlatform, influencer]);

  const aggregatedData = useMemo(() => {
    // 🎯 MEJORADO: Manejar tanto datos básicos como extendidos
    if (!influencer) return { totalFollowers: 0 };

    // 🚀 USAR LA NUEVA FUNCIÓN getPlatformData QUE MANEJA AMBAS ESTRUCTURAS
    let totalFollowers = 0;

    // Obtener plataformas disponibles (ya maneja tanto platformInfo como socialPlatforms)
    availablePlatforms.forEach((platform) => {
      const pdata = getPlatformData(platform);

      if (!pdata) {
        return;
      }

      // Usar la misma lógica para ambas estructuras
      const followers = pdata.followers || pdata.subscribers || 0;

      totalFollowers += followers;
    });

    return { totalFollowers };
  }, [influencer, availablePlatforms]);

  useEffect(() => {
    if (isOpen && influencer?.platformInfo) {
      // Preload thumbnails para todos los posts de Instagram y TikTok
      ['Instagram', 'TikTok'].forEach((platform) => {
        const pdata = getPlatformData(platform);
        if (!pdata) return;
        const posts = pdata.recentPosts || pdata.recentVideos || [];
        posts.forEach((post: any) => {
          let key =
            platform === 'Instagram'
              ? post.shortcode
              : post.videoId || post.tiktokId || post.id || post.url;
          if (key && !thumbnails[key]) {
            fetchAndCacheThumbnail(key, platform, post);
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, influencer]);

  useEffect(() => {
    if (activePlatform === 'TikTok') {
    }
  }, [activePlatform, platformData]);

  // Los datos de la plataforma activa deben calcularse después de la comprobación de `mounted` y `platformData`

  // Icon helper definido arriba

  const getPostImageUrl = (post: any, platform: string) => {
    if (platform === 'YouTube') {
      return `https://img.youtube.com/vi/${post.videoId}/hqdefault.jpg`;
    }
    if (platform === 'Instagram') {
      const key = post.shortcode;
      if (thumbnails[key]) return thumbnails[key];
      fetchAndCacheThumbnail(key, platform, post);
      return '/placeholder.svg';
    }
    if (platform === 'TikTok') {
      const key = post.videoId || post.tiktokId || post.id || post.url;
      if (thumbnails[key]) return thumbnails[key];
      fetchAndCacheThumbnail(key, platform, post);
      return getTikTokDefaultThumbnail();
    }
    return post.photoURL || post.cover || '/placeholder.svg';
  };

  const getPostUrl = (post: any, platform: string) => {
    switch (platform) {
      case 'Instagram':
        return `https://www.instagram.com/p/${post.shortcode}`;
      case 'YouTube':
        return `https://www.youtube.com/watch?v=${post.videoId}`;
      case 'TikTok':
        return `https://www.tiktok.com/@${platformData.tiktokId}/video/${post.videoId}`;
      default:
        return '#';
    }
  };

  console.log(influencer);

  return (
    <>
      {/* Hidden PDF Template for Export */}
      {isOpen && influencer && (
        <div className="fixed -left-[9999px] top-0" aria-hidden="true">
          <InfluencerSquadPDFTemplate
            influencer={influencer}
            audienceData={audienceData}
          />
        </div>
      )}

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full md:w-[550px] lg:w-[650px] bg-white shadow-xl z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 border-b bg-white">
          <h2 className="text-lg font-semibold">Detalles del Influencer</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExportingPDF || isLoading}
              className="h-8 gap-1.5"
            >
              {isExportingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="text-xs">
                {isExportingPDF ? 'Exportando...' : 'Exportar PDF'}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 pt-4 space-y-4" data-influencer-export>
          {/* 🎯 LÓGICA CONDICIONAL DE RENDERIZADO */}
          {isLoading ? (
            // ⏳ SKELETON MIENTRAS CARGA
            <InfluencerProfileSkeleton />
          ) : (
            <>
              <Card className="border rounded-md overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  <AvatarWithLoader
                    src={
                      processedAvatar || influencer.avatar || influencer.image
                    }
                    alt={influencer.name || 'Influencer'}
                    fallback={influencer.name?.charAt(0) || 'I'}
                    className="h-16 w-16"
                  />
                  <div>
                    <h1 className="text-xl font-bold">{influencer.name}</h1>
                    <div className="text-sm text-gray-500">
                      {influencer.location || influencer.country} •{' '}
                      <NumberDisplay
                        value={influencer?.followersCount}
                        format="short"
                      />{' '}
                      Seguidores Totales
                    </div>
                    {/* 🎯 MOSTRAR FUENTE DE DATOS SI ESTÁ DISPONIBLE */}
                    {influencer._metadata?.source && (
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        📊{' '}
                        {influencer._metadata.source === 'local-database'
                          ? 'Base de Datos'
                          : 'API Externa'}
                        {influencer._metadata.completenessScore &&
                          ` • ${influencer._metadata.completenessScore}% completo`}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
              {/* Redes sociales (desde platformInfo.socialNetworks) */}
              {Array.isArray(influencer?.platformInfo?.socialNetworks) &&
                influencer.platformInfo.socialNetworks.length > 0 && (
                  <Card className="border rounded-md overflow-hidden">
                    <div className="p-4 space-y-3">
                      <div className="text-sm font-semibold text-gray-700">
                        Redes sociales
                      </div>
                      <div className="flex flex-col gap-3">
                        {influencer.platformInfo.socialNetworks.map(
                          (sn: any, idx: number) => {
                            const platformKey = String(
                              sn.platform || '',
                            ).toLowerCase();
                            const platformLabel =
                              platformKey === 'instagram'
                                ? 'Instagram'
                                : platformKey === 'youtube'
                                ? 'YouTube'
                                : platformKey === 'tiktok'
                                ? 'TikTok'
                                : platformKey === 'facebook'
                                ? 'Facebook'
                                : platformKey === 'threads'
                                ? 'Threads'
                                : sn.platform || '';
                            const followers = Number(
                              sn.followers || sn.followersCount || 0,
                            );
                            const engagement =
                              typeof sn.engagement === 'number'
                                ? sn.engagement
                                : null; // ya viene en %
                            const state = String(sn.state || '').toUpperCase();

                            const stateClasses =
                              state === 'READY'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : state === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : state === 'ERROR'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200';

                            return (
                              <div
                                key={`${platformKey}-${idx}`}
                                className="rounded-lg border border-gray-200 p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {getPlatformIcon(platformLabel, 'h-4 w-4')}
                                    <span className="text-sm font-medium text-gray-800 truncate">
                                      {platformLabel}
                                    </span>
                                  </div>
                                  {state && (
                                    <span
                                      className={`text-[11px] px-2 py-0.5 rounded border ${stateClasses}`}
                                    >
                                      {state}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 space-y-1">
                                  {sn.username && (
                                    <div className="text-sm text-gray-900 truncate">
                                      @{sn.username}
                                    </div>
                                  )}
                                  {sn.title && (
                                    <div className="text-xs text-gray-500 truncate">
                                      {sn.title}
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 flex items-center gap-4 text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-gray-500">
                                      {platformLabel === 'YouTube'
                                        ? 'Suscriptores'
                                        : 'Seguidores'}
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                      {formatNumber(followers)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-gray-500">ER</span>
                                    <span className="font-semibold text-gray-900">
                                      {engagement !== null
                                        ? `${engagement.toFixed(2)}%`
                                        : '—'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </Card>
                )}

              {/* ✨ SECCIÓN DE AUDIENCIA SINTÉTICA */}
              <Card className="border rounded-md overflow-hidden">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Audiencia</h3>
                    <Badge variant="secondary" className="text-xs">
                      Datos Estimados
                    </Badge>
                  </div>

                  {/* Info banner */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Estos datos son estimaciones basadas en perfiles similares
                      de influencers
                    </p>
                  </div>

                  {loadingAudience ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-gray-500">
                          Cargando estadísticas...
                        </p>
                      </div>
                    </div>
                  ) : audienceData ? (
                    <div className="space-y-6">
                      {/* Age Distribution */}
                      {audienceData.age &&
                        Object.keys(audienceData.age).length > 0 && (
                          <div>
                            <h4 className="text-md font-medium mb-3">
                              Distribución por Edad
                            </h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart
                                data={Object.entries(audienceData.age).map(
                                  ([age, value]) => ({
                                    name: age,
                                    value: parseFloat(value.toFixed(1)),
                                  }),
                                )}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Bar dataKey="value" fill="#3b82f6" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                      {/* Gender Distribution */}
                      {audienceData.gender &&
                        audienceData.gender.male !== undefined &&
                        audienceData.gender.female !== undefined && (
                          <div>
                            <h4 className="text-md font-medium mb-3">
                              Distribución por Género
                            </h4>
                            <div className="flex flex-col items-center gap-2">
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={[
                                      {
                                        name: 'Masculino',
                                        value: parseFloat(
                                          audienceData.gender.male.toFixed(1),
                                        ),
                                      },
                                      {
                                        name: 'Femenino',
                                        value: parseFloat(
                                          audienceData.gender.female.toFixed(1),
                                        ),
                                      },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) =>
                                      `${name}: ${value}%`
                                    }
                                    outerRadius={70}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#ec4899" />
                                  </Pie>
                                  <Tooltip formatter={(value) => `${value}%`} />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div>
                                  <span className="text-gray-700">
                                    Masculino:{' '}
                                    {audienceData.gender.male.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-[#ec4899] rounded-full"></div>
                                  <span className="text-gray-700">
                                    Femenino:{' '}
                                    {audienceData.gender.female.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Geographic Distribution */}
                      {audienceData.geography &&
                        audienceData.geography.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium mb-3">
                              Distribución Geográfica
                            </h4>
                            <ResponsiveContainer
                              width="100%"
                              height={Math.max(
                                250,
                                audienceData.geography.length * 30,
                              )}
                            >
                              <BarChart
                                data={audienceData.geography}
                                layout="vertical"
                                margin={{ left: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis
                                  dataKey="country"
                                  type="category"
                                  width={120}
                                  tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                  formatter={(value) =>
                                    `${Number(value).toFixed(1)}%`
                                  }
                                />
                                <Bar dataKey="percentage" fill="#10b981" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hay datos de audiencia disponibles
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}

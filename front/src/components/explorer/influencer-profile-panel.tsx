"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getInstagramThumbnailValidated, getOptimizedAvatarUrl } from "@/utils/instagram";
import { getTikTokThumbnailValidated, getTikTokDefaultThumbnail, getSafeAvatarUrlForModal } from "@/utils/tiktok";

interface InfluencerProfilePanelProps {
  influencer: any;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

// 🎯 Helper para usar iconos desde /public/icons
const getPlatformIcon = (platform: string, className = "h-5 w-5") => {
  let iconSrc = "";
  switch (platform) {
    case "Instagram":
      iconSrc = "/icons/instagram.svg";
      break;
    case "TikTok":
      iconSrc = "/icons/tiktok.svg";
      break;
    case "YouTube":
      iconSrc = "/icons/youtube.svg";
      break;
    case "Facebook":
      iconSrc = "/icons/facebook.svg";
      break;
    case "Threads":
      iconSrc = "/icons/threads.svg";
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
        <div key={i} className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
      ))}
    </div>

    {/* Content Skeleton */}
    <div className="space-y-4">
      <div className="text-sm font-semibold text-gray-700">Posts recientes</div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
        ))}
      </div>
    </div>
  </div>
);

// 🎯 COMPONENTE PARA MOSTRAR CUANDO NO HAY DATOS EXTENDIDOS
const NoExtendedDataMessage = ({ influencer }: { influencer: any }) => (
  <div className="text-center py-12 space-y-4">
    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900">Datos Limitados Disponibles</h3>
      <p className="text-sm text-gray-600 max-w-md mx-auto">
        Solo tenemos información básica de este influencer. Los datos detallados no están disponibles en este momento.
      </p>
    </div>
    
    {/* Mostrar datos básicos disponibles */}
    <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
      {influencer.name && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 font-medium">Nombre</div>
          <div className="text-sm font-semibold">{influencer.name}</div>
        </div>
      )}
      {influencer.country && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-500 font-medium">País</div>
          <div className="text-sm font-semibold">{influencer.country}</div>
        </div>
      )}
      {influencer.contentNiches?.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg col-span-2">
          <div className="text-xs text-gray-500 font-medium">Categorías</div>
          <div className="text-sm font-semibold">{influencer.contentNiches.join(', ')}</div>
        </div>
      )}
    </div>
    
    <div className="mt-6 text-xs text-gray-400">
      Para obtener datos completos, intenta sincronizar este influencer o contacta al soporte.
    </div>
  </div>
);

// 🎯 COMPONENTE DE IMAGEN CON LOADER Y BOTÓN DE RELOAD
const ImageWithLoader = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
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
    setRetryCount(prev => prev + 1);
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
const AvatarWithLoader = ({ src, alt, fallback, className }: { src: string; alt: string; fallback: string; className?: string }) => {
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
    setRetryCount(prev => prev + 1);
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
}: InfluencerProfilePanelProps) {
  
  // 🎯 FUNCIÓN PARA DETECTAR SI TIENE DATOS EXTENDIDOS
  const hasExtendedData = useMemo(() => {
    if (!influencer) return false;
    
    // Verificar si tiene metadatos de fuente de datos
    if (influencer._metadata?.hasExtendedData) return true;
    
    // Verificar si tiene datos detallados de plataformas
    const platformInfo = influencer.platformInfo || {};
    
    // Buscar datos extendidos en cualquier plataforma
    const hasYouTubeExtended = platformInfo.youtube && (
      platformInfo.youtube.recentVideos?.length > 0 ||
      platformInfo.youtube.subscribers > 0 ||
      platformInfo.youtube.views > 0
    );
    
    const hasInstagramExtended = platformInfo.instagram && (
      platformInfo.instagram.basicInstagram?.followers > 0 ||
      platformInfo.instagram.recentPosts?.length > 0 ||
      platformInfo.instagram.basicInstagram?.engageRate > 0
    );
    
    const hasTikTokExtended = platformInfo.tiktok && (
      platformInfo.tiktok.basicTikTok?.followers > 0 ||
      platformInfo.tiktok.recentVideos?.length > 0 ||
      platformInfo.tiktok.basicTikTok?.engageRate > 0
    );

    const hasFacebookExtended = platformInfo.facebook && (
      platformInfo.facebook.basicFacebook?.followers > 0 ||
      platformInfo.facebook.recentPosts?.length > 0 ||
      platformInfo.facebook.basicFacebook?.engageRate > 0
    );

    const hasThreadsExtended = platformInfo.threads && (
      platformInfo.threads.basicThreads?.followers > 0 ||
      platformInfo.threads.recentPosts?.length > 0 ||
      platformInfo.threads.basicThreads?.gRateThreadsTabAvgLikes > 0
    );
    
    return hasYouTubeExtended || hasInstagramExtended || hasTikTokExtended || hasFacebookExtended || hasThreadsExtended;
  }, [influencer]);

  // Nueva función para obtener los datos correctos de la plataforma
  const getPlatformData = (platform: string) => {
    const pdata = influencer.platformInfo[platform.toLowerCase()];
    if (!pdata) return null;
    if (platform === "Instagram" && pdata.basicInstagram) return pdata.basicInstagram;
    if (platform === "TikTok" && pdata.basicTikTok) return pdata.basicTikTok;
    if (platform === "Facebook" && pdata.basicFacebook) return pdata.basicFacebook;
    if (platform === "Threads" && pdata.basicThreads) return pdata.basicThreads;
    return pdata;
  };

  const [mounted, setMounted] = useState(false)
  
  // ✨ ESTADO PARA AVATAR PROCESADO
  const [processedAvatar, setProcessedAvatar] = useState<string>('');
  
  const availablePlatforms = useMemo(() => {
    const platforms = [];
    
    if (!influencer?.platformInfo) {
      console.log("🔍 No platformInfo found");
      return platforms;
    }
    
    // Verificar cada plataforma en platformInfo - más robusto
    const platformInfo = influencer.platformInfo;
    
    // YouTube
    if (platformInfo.youtube && (
      platformInfo.youtube.subscribers > 0 ||
      platformInfo.youtube.recentVideos?.length > 0 ||
      platformInfo.youtube.views > 0 ||
      Object.keys(platformInfo.youtube).length > 0
    )) {
      platforms.push("YouTube");
    }
    
    // Instagram
    if (platformInfo.instagram && (
      platformInfo.instagram.basicInstagram?.followers > 0 ||
      platformInfo.instagram.recentPosts?.length > 0 ||
      platformInfo.instagram.basicInstagram?.engageRate > 0 ||
      Object.keys(platformInfo.instagram).length > 0
    )) {
      platforms.push("Instagram");
    }
    
    // TikTok
    if (platformInfo.tiktok && (
      platformInfo.tiktok.basicTikTok?.followers > 0 ||
      platformInfo.tiktok.recentVideos?.length > 0 ||
      platformInfo.tiktok.basicTikTok?.engageRate > 0 ||
      Object.keys(platformInfo.tiktok).length > 0
    )) {
      platforms.push("TikTok");
    }
    
    // Facebook
    if (platformInfo.facebook && (
      platformInfo.facebook.basicFacebook?.followers > 0 ||
      platformInfo.facebook.recentPosts?.length > 0 ||
      platformInfo.facebook.basicFacebook?.engageRate > 0 ||
      Object.keys(platformInfo.facebook).length > 0
    )) {
      platforms.push("Facebook");
    }
    
    // Threads
    if (platformInfo.threads && (
      platformInfo.threads.basicThreads?.followers > 0 ||
      platformInfo.threads.recentPosts?.length > 0 ||
      platformInfo.threads.basicThreads?.gRateThreadsTabAvgLikes > 0 ||
      Object.keys(platformInfo.threads).length > 0
    )) {
      platforms.push("Threads");
    }
    
    // 🎯 DEBUG: Agregar console.log para ver qué plataformas se detectan
    console.log("🔍 Detected platforms:", platforms);
    console.log("🔍 PlatformInfo keys:", Object.keys(platformInfo));
    console.log("🔍 Full platformInfo:", platformInfo);
    
    return platforms;
  }, [influencer]);

  const [activePlatform, setActivePlatform] = useState(influencer.platform || 'YouTube');

  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const requestedThumbnails = useRef<Record<string, boolean>>({});

  // Función asíncrona para obtener y cachear thumbnails
  const fetchAndCacheThumbnail = async (key: string, platform: string, post: any) => {
    if (requestedThumbnails.current[key]) return;
    requestedThumbnails.current[key] = true;
    let url = "";
    if (platform === "Instagram") {
      url = `https://www.instagram.com/p/${post.shortcode}`;
      const thumb = await getInstagramThumbnailValidated(url);
      setThumbnails(prev => ({ ...prev, [key]: thumb }));
    } else if (platform === "TikTok") {
      // Construir la URL del video de TikTok
      const tiktokId = platformData?.tiktokId || influencer?.platformInfo?.tiktok?.tiktokId;
      const videoId = post.videoId;
      if (tiktokId && videoId) {
        const tiktokUrl = `https://www.tiktok.com/@${tiktokId}/video/${videoId}`;
        const thumb = await getTikTokThumbnailValidated(tiktokUrl);
        setThumbnails(prev => ({ ...prev, [key]: thumb }));
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setActivePlatform(influencer.platform || availablePlatforms[0] || 'YouTube');
    }
    return () => {
      document.body.style.overflow = "";
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
  
  const platformData = useMemo(() => {
    if (!influencer?.platformInfo) return null;
    return getPlatformData(activePlatform);
  }, [activePlatform, influencer]);

  const aggregatedData = useMemo(() => {
    // 🎯 MEJORADO: Manejar tanto datos básicos como extendidos
    if (!influencer) return { totalFollowers: 0 };
    
    // Si tiene platformInfo extendido, usar esos datos
    if (influencer.platformInfo) {
      let totalFollowers = 0;
      
      // 🎯 USAR EXACTAMENTE LA MISMA LÓGICA QUE LAS MÉTRICAS POR PLATAFORMA
      // Obtener las plataformas disponibles usando availablePlatforms
      const platforms = [];
      if (influencer?.platformInfo?.youtube) platforms.push("YouTube");
      if (influencer?.platformInfo?.instagram) platforms.push("Instagram");
      if (influencer?.platformInfo?.tiktok) platforms.push("TikTok");
      if (influencer?.platformInfo?.facebook) platforms.push("Facebook");
      if (influencer?.platformInfo?.threads) platforms.push("Threads");
      
      console.log("🔢 Calculating total followers for platforms:", platforms);
      
      platforms.forEach(platform => {
        // Usar exactamente la misma función getPlatformData que usan las métricas
        const pdata = getPlatformData(platform);
        
        if (!pdata) {
          console.log(`❌ No data for ${platform}`);
          return;
        }
        
        // Usar exactamente la misma lógica que las métricas por plataforma
        const followers = pdata.followers || pdata.subscribers || 0;
        
        console.log(`📊 ${platform}: ${followers} followers (from ${pdata.followers || 0} followers, ${pdata.subscribers || 0} subscribers)`);
        
        totalFollowers += followers;
      });
      
      console.log(`🎯 Total followers calculated: ${totalFollowers}`);
      return { totalFollowers };
    }
    
    // 🎯 FALLBACK: Si solo tiene datos básicos del Explorer
    if (influencer.socialPlatforms?.length > 0) {
      const totalFollowers = influencer.socialPlatforms.reduce((acc: number, social: any) => {
        return acc + (social.followers || 0);
      }, 0);
      return { totalFollowers };
    }
    
    // 🎯 ÚLTIMO FALLBACK: Datos mínimos
    return { totalFollowers: 0 };
  }, [influencer]);

  useEffect(() => {
    if (isOpen && influencer?.platformInfo) {
      // Preload thumbnails para todos los posts de Instagram y TikTok
      ["Instagram", "TikTok"].forEach(platform => {
        const pdata = getPlatformData(platform);
        if (!pdata) return;
        const posts = (pdata.recentPosts || pdata.recentVideos || []);
        posts.forEach((post: any) => {
          let key = platform === "Instagram" ? post.shortcode : post.videoId || post.tiktokId || post.id || post.url;
          if (key && !thumbnails[key]) {
            fetchAndCacheThumbnail(key, platform, post);
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, influencer]);

  useEffect(() => {
    if (activePlatform === "TikTok") {
    }
  }, [activePlatform, platformData]);

  if (!mounted) return null;

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
      return "/placeholder.svg";
    }
    if (platform === 'TikTok') {
      const key = post.videoId || post.tiktokId || post.id || post.url;
      if (thumbnails[key]) return thumbnails[key];
      fetchAndCacheThumbnail(key, platform, post);
      return getTikTokDefaultThumbnail();
    }
    return post.photoURL || post.cover || "/placeholder.svg";
  }

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
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[550px] lg:w-[650px] bg-white shadow-xl z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-lg font-semibold">Detalles del Influencer</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* 🎯 LÓGICA CONDICIONAL DE RENDERIZADO */}
          {isLoading ? (
            // ⏳ SKELETON MIENTRAS CARGA
            <InfluencerProfileSkeleton />
          ) : !hasExtendedData ? (
            // ❓ SIN DATOS EXTENDIDOS - MOSTRAR MENSAJE CON DATOS BÁSICOS
            <NoExtendedDataMessage influencer={influencer} />
          ) : (
            // ✅ CON DATOS EXTENDIDOS - MOSTRAR PANEL COMPLETO
            <>
              <Card className="border rounded-md overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  <AvatarWithLoader 
                    src={processedAvatar || influencer.avatar || influencer.image}
                    alt={influencer.name || 'Influencer'}
                    fallback={influencer.name?.charAt(0) || 'I'}
                    className="h-16 w-16"
                  />
                  <div>
                    <h1 className="text-xl font-bold">{influencer.name}</h1>
                    <div className="text-sm text-gray-500">
                      {influencer.location} • {formatNumber(aggregatedData.totalFollowers)} Seguidores Totales
                    </div>
                    {/* 🎯 MOSTRAR FUENTE DE DATOS SI ESTÁ DISPONIBLE */}
                    {influencer._metadata?.source && (
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        📊 {influencer._metadata.source === 'local-database' ? 'Base de Datos' : 'API Externa'}
                        {influencer._metadata.completenessScore && 
                          ` • ${influencer._metadata.completenessScore}% completo`
                        }
                      </div>
                    )}
                  </div>
                </div>
              </Card>

          {/* Overview de métricas de todas las plataformas */}
          <Card className="border rounded-md overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="text-sm font-semibold text-gray-700">Métricas por plataforma</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availablePlatforms.map(platform => {
                  const pdata = getPlatformData(platform);
                  if (!pdata) return null;
                  const followers = pdata.followers || pdata.subscribers || 0;
                  const engagement = (pdata.engageRate || pdata.engageRate1Y || 0) * 100;
                  const isActive = activePlatform === platform;
                  const followersLabel = platform === 'YouTube' ? 'Suscriptores' : 'Seguidores';
                  return (
                    <button
                      type="button"
                      key={platform}
                      onClick={() => setActivePlatform(platform)}
                      className={`w-full h-32 rounded-lg border px-4 py-3 text-left transition-colors ${
                        isActive ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-full flex flex-col justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {getPlatformIcon(platform, 'h-5 w-5')}
                          <span className="text-sm font-medium text-gray-800 truncate">{platform}</span>
                        </div>
                        <div className="text-left">
                          <div className="text-2xl font-semibold text-gray-900 leading-none">{formatNumber(followers)}</div>
                          <div className="text-[12px] text-gray-500 mt-1">{followersLabel}</div>
                          <div className="text-xs font-medium text-gray-600 mt-2">ER {engagement.toFixed(2)}%</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <Tabs value={activePlatform} onValueChange={setActivePlatform} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availablePlatforms.length || 1}, 1fr)`}}>
              {availablePlatforms.map(platform => (
                <TabsTrigger
                  key={platform}
                  value={platform}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2"
                >
                  {getPlatformIcon(platform, "h-4 w-4")}
                  <span>{platform}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {platformData && (
            <Card className="border rounded-md overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="text-sm font-semibold text-gray-700">Posts recientes</div>
                <div className="grid grid-cols-4 gap-2">
                  {(platformData.recentPosts || platformData.recentVideos)?.slice(0, 4).map((post: any) => (
                    <a
                      key={post.videoId || post.shortcode}
                      href={getPostUrl(post, activePlatform)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:opacity-80 transition-opacity duration-200"
                    >
                      <ImageWithLoader
                        src={getPostImageUrl(post, activePlatform)}
                        alt={post.title || "Post thumbnail"}
                      />
                    </a>
                  ))}
                  {/* Mostrar placeholders si no hay suficientes posts */}
                  {(!platformData.recentPosts && !platformData.recentVideos || 
                    (platformData.recentPosts || platformData.recentVideos)?.length < 4) && 
                    Array.from({ length: 4 - ((platformData.recentPosts || platformData.recentVideos)?.length || 0) }).map((_, index) => (
                      <div key={`placeholder-${index}`} className="aspect-square bg-gray-50 rounded-md border border-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <div className="text-xs">Sin posts</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </Card>
          )}
            </>
          )}
        </div>
      </div>
    </>
  )
}


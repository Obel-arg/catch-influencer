"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRequestMonitoring } from "@/hooks/common/useRequestMonitoring";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookmarkIcon,
  ExternalLink,
  Filter,
  Instagram,
  Music,
  Search,
  X,
  Zap,
} from "lucide-react";
import { InfluencerProfilePanel } from "@/components/explorer/influencer-profile-panel";
import { useInfluencers } from "@/hooks/influencer/useInfluencers";
import { InfluencerExtendedService, influencerService } from "@/lib/services/influencer";
import { HypeAuditorDiscoveryFilters } from "@/lib/services/hypeauditor-discovery.service";
import HypeAuditorFilters from "./HypeAuditorFilters";
import { cn } from "@/lib/utils";
import { campaignService } from "@/lib/services/campaign";
import ExplorerAssignModal from "./ExplorerAssignModal";
import { useToast } from "@/hooks/common/useToast";
import {
  getSafeAvatarUrlForModal,
} from "@/utils/tiktok";
import { NumberDisplay } from "@/components/ui/NumberDisplay";

// 🎯 Imports para las mejoras
import { SkeletonInfluencerTable } from "./SkeletonInfluencerRow";
import { LazyInfluencerAvatar } from "./LazyInfluencerAvatar";

// Tipos locales para el adaptador extendido
interface ExplorerSocialPlatform {
  platform: string;
  username: string;
  followers: number;
  engagement?: number;
}
interface ExplorerInfluencer {
  creatorId: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  contentNiches?: string[];
  country?: string;
  socialPlatforms: ExplorerSocialPlatform[];
  platformInfo?: Record<string, any>;
  language?: string;
}

interface SocialPlatform {
  platform: string;
  username: string;
  followers: number;
  engagement: number;
}

export default function Explorer() {
  // Monitoreo de peticiones
  const { trackRequest, completeRequest, createRequestContext } =
    useRequestMonitoring("Explorer");

  // Toast notifications
  const { toast } = useToast();

  // 🚀 Hook de influencers para HypeAuditor
  const { searchHypeAuditorInfluencers, searchHypeAuditorSuggestion, loading: loadingHypeAuditor } =
    useInfluencers();

  // 🎯 Estado para manejar información de búsqueda
  const [searchInfo, setSearchInfo] = useState<{
    searchHash?: string;
    tokensUsed?: number;
    expiresAt?: string;
  }>({});

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [platform, setPlatform] = useState<string>("all");
  const [topics, setTopics] = useState<string[]>([]);

  const [location, setLocation] = useState<string>("all"); // ✅ Iniciar con "todos los países"
  const [minFollowers, setMinFollowers] = useState<number>(0);
  const [maxFollowers, setMaxFollowers] = useState<number>(100000000);
  const [minEngagement, setMinEngagement] = useState<number>(0);
  const [maxEngagement, setMaxEngagement] = useState<number>(100); // ✅ Iniciar con valor máximo correcto

  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<string>("followers");
  const [savedInfluencers, setSavedInfluencers] = useState<string[]>([]);

  // 🎯 NUEVOS ESTADOS PARA FILTROS DE HYPEAUDITOR DISCOVERY
  const [audienceGender, setAudienceGender] = useState<{
    gender: "male" | "female" | "any";
    percentage: number;
  }>({
    gender: "any",
    percentage: 50,
  });
  const [audienceAge, setAudienceAge] = useState<{
    groups: string[];
    prc: number;
  }>({
    groups: [],
    prc: 50,
  });
  const [audienceGeo, setAudienceGeo] = useState<{
    countries: Array<{ id: string; prc: number }>;
    cities: Array<{ id: number; prc: number }>;
  }>({
    countries: [],
    cities: [],
  });

  // 🎯 NUEVO: Estado para categorías del taxonomy de HypeAuditor
  const [taxonomyCategories, setTaxonomyCategories] = useState<{
    include: string[];
    exclude: string[];
  }>({
    include: [],
    exclude: [],
  });

  const [accountType, setAccountType] = useState<"brand" | "human" | "any">(
    "any"
  );
  const [verified, setVerified] = useState<boolean | null>(null);
  const [hasContacts, setHasContacts] = useState<boolean | null>(null);
  const [hasLaunchedAdvertising, setHasLaunchedAdvertising] = useState<
    boolean | null
  >(null);
  const [aqsRange, setAqsRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 100,
  });
  const [cqsRange, setCqsRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 100,
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Estado para paginado y filtros
  const [page, setPage] = useState(1);
  const [size] = useState(10); // 🎯 UI: 6 influencers por página (para mantener tamaño)
  const [totalResultsPerPage] = useState(20); // 🚀 HypeAuditor: 20 resultados por página

  // 🎯 MEJORA: Influencers con persistencia de datos previos
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [previousInfluencers, setPreviousInfluencers] = useState<any[]>([]); // Para evitar flash
  const [loadingInfluencers, setLoadingInfluencers] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Panel y cache
  const [fullInfluencerCache, setFullInfluencerCache] = useState<{
    [youtubeId: string]: any;
  }>({});
  const [loadingPanel, setLoadingPanel] = useState(false);

  // Nuevo: Estado para información de validación
  const [validationInfo, setValidationInfo] = useState<{
    applied: boolean;
    originalCount: number;
    filteredCount: number;
    reason: string;
  } | null>(null);

  // Nuevo: Modal para asignar a campaña
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false); // 🎯 NUEVO: Estado de carga de campañas
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<{
    successes: string[];
    alreadyAssigned: string[];
    failed: string[];
  } | null>(null);

  // Nuevo: modo selección
  const [selectMode, setSelectMode] = useState(false);

  // 🎯 Estados simplificados - solo lo esencial
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [hasEverSearched, setHasEverSearched] = useState(false);

  // 🚀 Estado del proveedor (solo HypeAuditor)
  const [provider] = useState<"hypeauditor">("hypeauditor");

  // ✨ NUEVO: Estado para manejar avatares procesados
  const [processedAvatars, setProcessedAvatars] = useState<{
    [key: string]: string;
  }>({});

  // 🧹 FUNCIÓN PARA LIMPIAR CACHE DE AVATARES (útil cuando cambia la lógica)
  const clearAvatarCache = useCallback(() => {
    setProcessedAvatars({});
  }, []);

  // ✨ FUNCIÓN INTELIGENTE PARA PROCESAR AVATARES - ACTUALIZADA para usar función segura
  const getSmartAvatar = useCallback(
    (influencer: any): string => {
      // Usar el campo correcto: avatar del backend, no image
      const originalAvatar = influencer.avatar || influencer.image || "";
      const influencerName = influencer.name || "";

      // Si ya está procesado, usar cache
      const cacheKey = `${influencer.creatorId}_${originalAvatar}`;
      if (processedAvatars[cacheKey]) {
        return processedAvatars[cacheKey];
      }

      // ✅ USAR FUNCIÓN SEGURA DE tiktok.ts (más robusta)
      const processedUrl = getSafeAvatarUrlForModal(
        originalAvatar,
        influencerName
      );

      // Guardar en cache
      setProcessedAvatars((prev) => ({
        ...prev,
        [cacheKey]: processedUrl,
      }));

      return processedUrl;
    },
    [processedAvatars]
  );

  // ✨ COMPONENTE SMART AVATAR QUE MANEJA AVATARES PROCESADOS - SIMPLIFICADO
  const SmartAvatar = ({ influencer }: { influencer: any }) => {
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // 🎯 DETERMINAR NOMBRE A MOSTRAR
    const displayName =
      influencer.name === "Sin nombre" || /\d/.test(influencer.name)
        ? influencer.creatorId
        : influencer.name;

    useEffect(() => {
      try {
        // Usar función síncrona
        const url = getSmartAvatar(influencer);
        setAvatarUrl(url);
        setLoading(false);
      } catch (error) {
        console.error("Error loading avatar:", error);
        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName?.charAt(0) || "U"
        )}&background=6366f1&color=fff&size=128`;
        setAvatarUrl(fallbackUrl);
        setLoading(false);
      }
    }, [
      influencer.creatorId,
      influencer.avatar,
      influencer.image,
      displayName,
    ]);

    return (
      <Avatar className="h-12 w-12 ring-2 ring-gray-100">
        {loading ? (
          <AvatarFallback>
            <div className="animate-pulse bg-gray-300 rounded-full w-full h-full flex items-center justify-center">
              <span className="text-xs">📸</span>
            </div>
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName?.charAt(0) || "U"}</AvatarFallback>
          </>
        )}
      </Avatar>
    );
  };

  // ✅ SOLO limpiar cache cuando cambie la plataforma (NO limpiar tabla automáticamente)
  useEffect(() => {
    // 🧹 LIMPIAR CACHE DE AVATARES CUANDO SE CAMBIE A INSTAGRAM
    if (platform === "Instagram") {
      clearAvatarCache();
    }
  }, [platform, clearAvatarCache]); // ✅ Solo escuchar cambios de plataforma, NO otros filtros

  // Función para formatear números - Evita problemas de hidratación
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    // Para números pequeños, usar formato consistente
    return num.toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Debounce para el search query - 500ms delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // 🗑️ ELIMINADAS: generateCacheKey y prefetchNextPage - ya no se necesitan

  // 🗑️ ELIMINADOS: pagesCached y cacheExpiresAt - cache ahora es automático en el backend

  // 🚀 NUEVA FUNCIÓN PARA BÚSQUEDA CON HYPEAUDITOR
  const handleHypeAuditorSearch = async () => {
    try {
      // Búsqueda iniciada

      let result;

      // 🎯 Si hay searchQuery, usar endpoint de sugerencias
      if (searchQuery.trim()) {
        const st = platform === "all" ? "instagram" : platform;
        result = await searchHypeAuditorSuggestion(searchQuery.trim(), st);
      } else {
        // 🎯 Sin searchQuery, usar endpoint de búsqueda regular con filtros
        const filters: HypeAuditorDiscoveryFilters = {
          platform: platform === "all" ? "instagram" : platform, // Por defecto Instagram
          page: 1,
        };

        if (minFollowers > 0) {
          filters.minFollowers = minFollowers;
        }
        if (maxFollowers < 100000000) {
          filters.maxFollowers = maxFollowers;
        }
        if (minEngagement > 0) {
          filters.minEngagement = minEngagement;
        }
        if (maxEngagement < 100) {
          filters.maxEngagement = maxEngagement;
        }

        // 🎯 NUEVOS FILTROS DE HYPEAUDITOR DISCOVERY
        if (location !== "all") {
          filters.location = location;
        }
        if (selectedCategories.length > 0) {
          // Map names -> IDs based on current platform taxonomy
          try {
            const { getCategoriesForPlatform } = await import(
              "@/constants/hypeauditor-categories"
            );
            const cats = getCategoriesForPlatform(platform);
            const nameToId = new Map(cats.map((c) => [c.name, c.id] as const));
            const ids = selectedCategories
              .map((name) => nameToId.get(name))
              .filter((id): id is string => !!id);
            if (ids.length > 0) {
              filters.selectedCategories = ids;
            }
          } catch (e) {
            filters.selectedCategories = selectedCategories; // fallback
          }
        }
        if (accountType !== "any") {
          filters.accountType = accountType;
        }
        if (verified !== null) {
          filters.verified = verified;
        }
        if (hasContacts !== null) {
          filters.hasContacts = hasContacts;
        }
        if (hasLaunchedAdvertising !== null) {
          filters.hasLaunchedAdvertising = hasLaunchedAdvertising;
        }
        if (aqsRange.min > 0 || aqsRange.max < 100) {
          filters.aqs = aqsRange;
        }
        if (cqsRange.min > 0 || cqsRange.max < 100) {
          filters.cqs = cqsRange;
        }

        // 🎯 FILTROS DE AUDIENCIA
        if (audienceGender.gender !== "any") {
          filters.audienceGender = audienceGender;
        }
        if (audienceAge.groups.length > 0) {
          filters.audienceAge = audienceAge;
        }
        if (
          audienceGeo.countries.length > 0 ||
          audienceGeo.cities.length > 0
        ) {
          filters.audienceGeo = audienceGeo;
        }

        // 🎯 FILTROS DE CATEGORÍAS DEL TAXONOMY
        if (
          taxonomyCategories.include.length > 0 ||
          taxonomyCategories.exclude.length > 0
        ) {
          filters.taxonomyCategories = taxonomyCategories;
        }

        // Realizar búsqueda con HypeAuditor
        result = await searchHypeAuditorInfluencers(filters);
      }

      if (result && result.success) {
        setInfluencers(result.items || []);
        setTotalCount(result.totalCount || 0);
      } else {
        setInfluencers([]);
        setTotalCount(0);
        // Sin resultados encontrados
      }
    } catch (error: any) {
      console.error("❌ [EXPLORER] Error en búsqueda HypeAuditor:", error);
      setInfluencers([]);
      setTotalCount(0);
      toast({
        title: "Error",
        description: "Error al buscar con HypeAuditor Discovery",
        variant: "destructive",
      });
    }
  };

  // 🎯 FUNCIÓN DE BÚSQUEDA CON HYPEAUDITOR
  const handleSearch = async () => {
    const searchStartTime = Date.now();

    setHasEverSearched(true);
    setLoadingInfluencers(true);
    setIsSearchActive(true);

    // Reiniciar paginación
    setPage(1);

    try {
      await handleHypeAuditorSearch();
    } catch (error: any) {
      console.error("❌ Error en búsqueda:", error);
      setInfluencers([]);
      setTotalCount(0);
      toast({
        title: "Error",
        description: "Error al buscar influencers",
        variant: "destructive",
      });
    } finally {
      const searchEndTime = Date.now();

      setLoadingInfluencers(false);
      setIsSearchActive(false);
    }
  };

  // 🎯 PAGINACIÓN INTERNA (solo HypeAuditor)
  const handlePageChange = async (newPage: number) => {
    // 🚀 PAGINACIÓN INTERNA: Solo cambiar página local
    setPage(newPage);
    setLoadingInfluencers(false);
    setIsSearchActive(false);
  };

  // 🎯 Sistema simplificado: Solo HypeAuditor
  // - Búsqueda directa con HypeAuditor Discovery
  // - Paginación interna con datos cargados
  // - Sin cache complejo ni múltiples proveedores

  const adaptedInfluencers = useMemo(() => {
    if (influencers.length === 0) {
      return [];
    }

    const adapted = influencers
      .map((inf, index) => {
        if (!inf) {
          return null;
        }

        const platformInfo = inf.platformInfo || {};
        const socialPlatforms = [];

        // 🎯 MEJORADO: Detectar y agregar TODAS las plataformas disponibles
        if (platformInfo.youtube && platformInfo.youtube !== null) {
          socialPlatforms.push({
            platform: "YouTube",
            username:
              platformInfo.youtube.youtubeName ||
              platformInfo.youtube.displayName ||
              "",
            followers: platformInfo.youtube.subscribers || 0,
            engagement:
              platformInfo.youtube.engageRate1Y ||
              platformInfo.youtube.engageRate ||
              0,
          });
        }

        if (platformInfo.instagram && platformInfo.instagram !== null) {
          const instagramData =
            platformInfo.instagram.basicInstagram || platformInfo.instagram;
          socialPlatforms.push({
            platform: "Instagram",
            username: instagramData.instagramId || instagramData.username || "",
            followers: instagramData.followers || 0,
            engagement: instagramData.engageRate || 0,
          });
        }

        if (platformInfo.tiktok && platformInfo.tiktok !== null) {
          const tiktokData =
            platformInfo.tiktok.basicTikTok || platformInfo.tiktok;
          socialPlatforms.push({
            platform: "TikTok",
            username: tiktokData.tiktokId || tiktokData.username || "",
            followers: tiktokData.followers || 0,
            engagement: tiktokData.engageRate || 0,
          });
        }

        if (platformInfo.facebook && platformInfo.facebook !== null) {
          const facebookData =
            platformInfo.facebook.basicFacebook || platformInfo.facebook;
          socialPlatforms.push({
            platform: "Facebook",
            username: facebookData.facebookId || facebookData.username || "",
            followers: facebookData.followers || 0,
            engagement: facebookData.engageRate || 0,
          });
        }

        if (platformInfo.threads && platformInfo.threads !== null) {
          const threadsData =
            platformInfo.threads.basicThreads || platformInfo.threads;
          socialPlatforms.push({
            platform: "Threads",
            username: threadsData.threadsId || threadsData.username || "",
            followers: threadsData.followers || 0,
            engagement:
              threadsData.gRateThreadsTabAvgLikes ||
              threadsData.engageRate ||
              0,
          });
        }

        // 🎯 NUEVO ORDEN: Instagram primero cuando se busca en "all" platforms
        const platformOrder =
          platform === "all"
            ? ["Instagram", "YouTube", "TikTok", "Facebook", "Threads"] // Instagram primero para "all"
            : ["YouTube", "Instagram", "TikTok", "Facebook", "Threads"]; // Orden original para búsquedas específicas

        socialPlatforms.sort((a, b) => {
          const indexA = platformOrder.indexOf(a.platform);
          const indexB = platformOrder.indexOf(b.platform);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        // ✨ CORREGIR MISMATCH: usar tanto avatar como image del backend
        const bestAvatar = inf.avatar || inf.image || "";

        // 🎯 NUEVA LÓGICA: Priorizar plataforma según contexto
        const mainPlatformData = (() => {
          // Si se está buscando en una plataforma específica, usar esos datos
          if (platform !== "all" && socialPlatforms.length > 0) {
            const specificPlatform = socialPlatforms.find(
              (p) => p.platform.toLowerCase() === platform.toLowerCase()
            );

            if (specificPlatform) {
              return specificPlatform;
            }
          }

          // 🎯 NUEVO: Para búsquedas "all", priorizar Instagram si está disponible
          if (platform === "all" && socialPlatforms.length > 0) {
            const instagramPlatform = socialPlatforms.find(
              (p) => p.platform === "Instagram"
            );
            if (instagramPlatform && instagramPlatform.followers > 0) {
              return instagramPlatform;
            }
          }

          // Fallback: usar la plataforma con más seguidores (comportamiento anterior)
          const fallbackPlatform =
            socialPlatforms.length > 0
              ? socialPlatforms.sort((a, b) => b.followers - a.followers)[0]
              : { platform: "Unknown", followers: 0, engagement: 0 };

          return fallbackPlatform;
        })();

        // 🎯 USAR FOLLOWER BREAKDOWN SI ESTÁ DISPONIBLE (datos del backend mejorado)
        const totalFollowers =
          inf.followerBreakdown?.total ||
          inf.followersCount ||
          mainPlatformData.followers;
        const averageEngagement =
          inf.averageEngagementRate || mainPlatformData.engagement;

        const adaptedInfluencer = {
          id: inf.creatorId,
          creatorId: inf.creatorId,
          name: inf.name,
          image: bestAvatar,
          avatar: bestAvatar, // Agregar ambos campos para compatibilidad
          verified: inf.isVerified || false,
          categories: inf.contentNiches || [],
          location: inf.country,
          language: inf.language,
          socialPlatforms,
          mainSocialPlatform:
            inf.mainSocialPlatform || mainPlatformData.platform, // Usar del backend si está disponible
          followersCount: totalFollowers, // 🎯 Usar follower breakdown total si está disponible
          averageEngagementRate: averageEngagement, // 🎯 Usar datos del backend
          platformInfo: inf.platformInfo || {},
          // 🎯 Metadatos adicionales para debugging
          searchMeta: inf.searchMeta || null,
          followerBreakdown: inf.followerBreakdown || null,
        };

        return adaptedInfluencer;
      })
      .filter((inf): inf is NonNullable<typeof inf> => !!inf);

    // 🎯 LOG ESTADÍSTICAS
    const multiPlatformInfluencers = adapted.filter(
      (inf) => inf.socialPlatforms.length > 1
    );
    const instagramPrimaryCount = adapted.filter(
      (inf) => inf.mainSocialPlatform === "Instagram"
    ).length;

    return adapted;
  }, [influencers, platform]);

  const filteredInfluencers = useMemo(() => {
    return adaptedInfluencers.filter((influencer) => {
      if (!influencer) return false;

      return true;
    });
  }, [adaptedInfluencers]);

  // El backend ya ordena los datos, no necesitamos ordenar en el frontend
  const limitedInfluencers = filteredInfluencers;

  // ✨ FUNCIÓN PARA DETECTAR TODAS LAS PLATAFORMAS DE UN INFLUENCER - CORREGIDA
  // Helper function to normalize platform names
  const normalizePlatformName = (platform: string): string => {
    const lowerPlatform = platform.toLowerCase();
    switch (lowerPlatform) {
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      case 'instagram':
        return 'Instagram';
      case 'facebook':
        return 'Facebook';
      case 'threads':
        return 'Threads';
      case 'twitter':
        return 'Twitter';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  const detectAvailablePlatforms = (influencer: any) => {
    if (!influencer) return [];

    const platforms: { name: string; followers: number }[] = [];
    const platformInfo = influencer.platformInfo || {};
    
    // 🎯 OPCIÓN 1: Usar platformInfo.socialNetworks (HypeAuditor format)
    if (platformInfo.socialNetworks && Array.isArray(platformInfo.socialNetworks)) {
      // Crear un Set para trackear plataformas únicas
      const seenPlatforms = new Set<string>();
      
      platformInfo.socialNetworks.forEach((network: any) => {
        const platformName = network.platform;
        
        // Solo agregar si no hemos visto esta plataforma antes
        if (platformName && !seenPlatforms.has(platformName.toLowerCase())) {
          seenPlatforms.add(platformName.toLowerCase());
          platforms.push({
            name: normalizePlatformName(platformName),
            followers: network.followers || 0,
          });
        }
      });
    }
    
    // 🎯 OPCIÓN 2: Usar socialPlatforms si socialNetworks no existe
    else if (influencer.socialPlatforms && Array.isArray(influencer.socialPlatforms)) {
      // Crear un Set para trackear plataformas únicas
      const seenPlatforms = new Set<string>();
      
      influencer.socialPlatforms.forEach((platform: any) => {
        const platformName = typeof platform === "string" ? platform : platform.platform;
        
        // Solo agregar si no hemos visto esta plataforma antes
        if (platformName && !seenPlatforms.has(platformName.toLowerCase())) {
          seenPlatforms.add(platformName.toLowerCase());
          const followers = typeof platform === "object" ? platform.followers || 0 : 0;
          platforms.push({
            name: normalizePlatformName(platformName),
            followers: followers,
          });
        }
      });
    }
    
    // 🎯 OPCIÓN 3: Fallback al formato anterior (platformInfo con claves directas)
    else {
      // Detectar YouTube
      if (platformInfo.youtube) {
        const ytData = platformInfo.youtube;
        const hasYouTubeId =
          ytData.youtubeName || ytData.displayId || ytData.channelId || ytData.id || ytData.youtubeId;
        if (hasYouTubeId) {
          const subscribers = ytData.subscribers || ytData.followers || 0;
          platforms.push({ name: "YouTube", followers: subscribers });
        }
      }

      // Detectar Instagram
      if (platformInfo.instagram) {
        let instagramData = platformInfo.instagram;
        if (instagramData.basicInstagram) {
          instagramData = instagramData.basicInstagram;
        }
        const hasInstagramId = instagramData.instagramId || instagramData.username || instagramData.id;
        if (hasInstagramId) {
          platforms.push({ name: "Instagram", followers: instagramData.followers || 0 });
        }
      }

      // Detectar TikTok
      if (platformInfo.tiktok) {
        let tiktokData = platformInfo.tiktok;
        if (tiktokData.basicTikTok) {
          tiktokData = tiktokData.basicTikTok;
        }
        const hasTikTokId = tiktokData.tiktokId || tiktokData.username || tiktokData.id;
        if (hasTikTokId) {
          platforms.push({ name: "TikTok", followers: tiktokData.followers || 0 });
        }
      }

      // Detectar Facebook
      if (platformInfo.facebook) {
        let facebookData = platformInfo.facebook;
        if (facebookData.basicFacebook) {
          facebookData = facebookData.basicFacebook;
        }
        const hasFacebookId = facebookData.facebookId || facebookData.username || facebookData.id;
        if (hasFacebookId) {
          platforms.push({ name: "Facebook", followers: facebookData.followers || 0 });
        }
      }

      // Detectar Threads
      if (platformInfo.threads) {
        let threadsData = platformInfo.threads;
        if (threadsData.basicThreads) {
          threadsData = threadsData.basicThreads;
        }
        const hasThreadsId = threadsData.threadsId || threadsData.username || threadsData.id;
        if (hasThreadsId) {
          platforms.push({ name: "Threads", followers: threadsData.followers || 0 });
        }
      }
    }

    // 🎯 ÚLTIMO FALLBACK: Detectar por avatar URL si aún no hay plataformas
    if (platforms.length === 0) {
      const avatar = influencer.avatar || "";
      if (avatar.includes("googleusercontent.com") || avatar.includes("ytimg.com") || avatar.includes("ggpht.com")) {
        platforms.push({ name: "YouTube", followers: influencer.followersCount || 0 });
      } else if (avatar.includes("fbcdn.net") || avatar.includes("cdninstagram.com") || avatar.includes("instagram")) {
        platforms.push({ name: "Instagram", followers: influencer.followersCount || 0 });
      } else if (avatar.includes("tiktokcdn.com") || avatar.includes("muscdn.com")) {
        platforms.push({ name: "TikTok", followers: influencer.followersCount || 0 });
      } else if (influencer.mainSocialPlatform) {
        // Usar plataforma principal como último recurso
        platforms.push({
          name: influencer.mainSocialPlatform.charAt(0).toUpperCase() + influencer.mainSocialPlatform.slice(1),
          followers: influencer.followersCount || 0,
        });
      }
    }

    // Ordenar por número de seguidores (principal primero)
    platforms.sort((a, b) => b.followers - a.followers);

    return platforms;
  };

  const getPlatformIcon = (platform: string) => {
    let iconSrc = "";
    let iconClass = "h-5 w-5";

    switch (platform) {
      case "Instagram":
        iconSrc = "/icons/instagram.svg";
        break;
      case "TikTok":
        iconSrc = "/icons/tiktok.svg";
        iconClass = "h-4 w-4";
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
    return <img src={iconSrc} alt={`${platform} icon`} className={iconClass} />;
  };

  const adaptFullInfluencerForPanel = (inf: any) => {
    if (!inf) return null;

    const platformInfo = inf.platformInfo || {};
    const socialPlatforms: ExplorerSocialPlatform[] = [];

    if (platformInfo.youtube && platformInfo.youtube !== null) {
      let username =
        platformInfo.youtube.displayId ||
        platformInfo.youtube.youtubeName ||
        "";
      if (username.startsWith("@")) {
        username = username.substring(1);
      }
      socialPlatforms.push({
        platform: "YouTube",
        username: username,
        followers: platformInfo.youtube.subscribers || 0,
        engagement: platformInfo.youtube.engageRate1Y || 0,
      });
    }

    if (platformInfo.instagram && platformInfo.instagram !== null) {
      const instagramData =
        platformInfo.instagram.basicInstagram || platformInfo.instagram;
      socialPlatforms.push({
        platform: "Instagram",
        username: instagramData.instagramId || instagramData.username || "",
        followers: instagramData.followers || 0,
        engagement: instagramData.engageRate || 0,
      });
    }

    if (platformInfo.tiktok && platformInfo.tiktok !== null) {
      const tiktokData = platformInfo.tiktok.basicTikTok || platformInfo.tiktok;
      socialPlatforms.push({
        platform: "TikTok",
        username: tiktokData.tiktokId || tiktokData.username || "",
        followers: tiktokData.followers || 0,
        engagement: tiktokData.engageRate || 0,
      });
    }

    if (platformInfo.facebook && platformInfo.facebook !== null) {
      const facebookData =
        platformInfo.facebook.basicFacebook || platformInfo.facebook;
      socialPlatforms.push({
        platform: "Facebook",
        username: facebookData.facebookId || facebookData.username || "",
        followers: facebookData.followers || 0,
        engagement: facebookData.engageRate || 0,
      });
    }

    if (platformInfo.threads && platformInfo.threads !== null) {
      const threadsData =
        platformInfo.threads.basicThreads || platformInfo.threads;
      socialPlatforms.push({
        platform: "Threads",
        username: threadsData.threadsId || threadsData.username || "",
        followers: threadsData.followers || 0,
        engagement:
          threadsData.gRateThreadsTabAvgLikes || threadsData.engageRate || 0,
      });
    }

    const mainPlatformInfo =
      [...socialPlatforms].sort((a, b) => b.followers - a.followers)[0] || null;

    if (!mainPlatformInfo) {
      return {
        id: inf.creatorId,
        name: inf.name || "Sin nombre",
        image: inf.avatar || "",
        verified: inf.isVerified || false,
        categories: inf.contentNiches || [],
        location: inf.country || "-",
        handle: "",
        platform: "",
        followersFormatted: "0",
        engagementFormatted: "0.00%",
      };
    }

    const followers = mainPlatformInfo.followers;
    const followersFormatted =
      followers >= 1000000
        ? `${(followers / 1000000).toFixed(1)}M`
        : followers >= 1000
        ? `${(followers / 1000).toFixed(1)}K`
        : `${followers}`;

    const engagement = mainPlatformInfo.engagement || 0;
    const engagementFormatted = `${(engagement * 100).toFixed(2)}%`;

    let bestAvatar = "";
    if (platformInfo.youtube?.avatar) {
      bestAvatar = platformInfo.youtube.avatar;
    } else if (platformInfo.instagram?.basicInstagram?.avatar) {
      bestAvatar = platformInfo.instagram.basicInstagram.avatar;
    } else if (platformInfo.instagram?.avatar) {
      bestAvatar = platformInfo.instagram.avatar;
    } else if (platformInfo.tiktok?.basicTikTok?.avatar) {
      bestAvatar = platformInfo.tiktok.basicTikTok.avatar;
    } else if (platformInfo.tiktok?.avatar) {
      bestAvatar = platformInfo.tiktok.avatar;
    }

    return {
      id: inf.creatorId,
      name: inf.name,
      image: bestAvatar || inf.avatar,
      verified: inf.isVerified,
      categories: inf.contentNiches?.length ? inf.contentNiches : [],
      location: inf.country,
      handle: mainPlatformInfo.username ? `@${mainPlatformInfo.username}` : "",
      platform: mainPlatformInfo.platform,
      followersFormatted,
      engagementFormatted,
      platformInfo: inf.platformInfo,
    };
  };

  const openInfluencerPanel = async (influencer: any) => {
    // 🎯 NUEVA LÓGICA: Extraer TODOS los IDs disponibles (incluyendo IDs adicionales)
    const allPlatformIds = extractAllPlatformIds(influencer);
    const { needs, hasData } = determineDataNeeds(influencer, allPlatformIds);

    // 🎯 CREAR CACHE KEY CON TODOS LOS IDs DISPONIBLES
    const allIds = [
      allPlatformIds.youtubeId,
      allPlatformIds.instagramId,
      allPlatformIds.tiktokId,
      allPlatformIds.facebookId,
      allPlatformIds.threadsId,
    ].filter(Boolean);
    const cacheKey = allIds.join("|") || influencer.creatorId;

    // 🎯 NUEVO: Determinar si necesitamos cargar datos adicionales
    const hasMultiplePlatforms = allIds.length > 1;
    const hasOnlyBasicData = !hasExtendedData(influencer);

    // 🎯 LÓGICA: Si solo tiene una plataforma y ya tiene datos básicos, no mostrar skeleton
    if (!hasMultiplePlatforms && !hasOnlyBasicData) {
      // Solo una plataforma con datos completos - mostrar directamente
      setSelectedInfluencer(influencer);
      setIsPanelOpen(true);
      setLoadingPanel(false);
      return;
    }

    // 🎯 CASO: Múltiples plataformas o datos básicos - mostrar skeleton mientras carga
    setSelectedInfluencer(influencer); // Datos básicos para mostrar nombre
    setIsPanelOpen(true);
    setLoadingPanel(true);

    if (!cacheKey) {
      // Sin IDs válidos, mostrar datos básicos disponibles
      setLoadingPanel(false);
      return;
    }

    try {
      // 🎯 PASO 1: Verificar cache en memoria primero
      if (fullInfluencerCache[cacheKey]) {
        const requestId = trackRequest(
          "/influencers/full/" + cacheKey,
          "GET",
          `openInfluencerPanel(${influencer.name}, memory-cached)`,
          {
            youtubeId: allPlatformIds.youtubeId,
            instagramId: allPlatformIds.instagramId,
            tiktokId: allPlatformIds.tiktokId,
          }
        );

        setSelectedInfluencer(
          adaptFullInfluencerForPanel(fullInfluencerCache[cacheKey])
        );
        setLoadingPanel(false);

        completeRequest(requestId, 200, fullInfluencerCache[cacheKey], true);
        return;
      }

      // 🎯 PASO 2: Intentar obtener de base de datos local (PRIORITARIO)
      // Buscar por youtubeId primero, que es el más común
      if (allPlatformIds.youtubeId) {
        try {
          // Importar dinámicamente el servicio extendido
          const { InfluencerExtendedService } = await import(
            "@/lib/services/influencer/influencer-extended.service"
          );

          const requestId = trackRequest(
            "/influencer/extended/read/" + allPlatformIds.youtubeId,
            "GET",
            `openInfluencerPanel(${influencer.name}, BD-local)`,
            { youtubeId: allPlatformIds.youtubeId, source: "local-db" }
          );

          const extendedData =
            await InfluencerExtendedService.readExistingExtendedData(
              allPlatformIds.youtubeId
            );

          if (
            extendedData &&
            extendedData.data &&
            Object.keys(extendedData.data).length > 0
          ) {
            // ✅ DATOS ENCONTRADOS EN BD LOCAL
            const adaptedData = adaptExtendedDataForPanel(
              extendedData.data,
              influencer
            );
            setFullInfluencerCache((prev) => ({
              ...prev,
              [cacheKey]: adaptedData,
            }));
            setSelectedInfluencer(adaptedData);
            setLoadingPanel(false);

            completeRequest(requestId, 200, extendedData, true);
            return;
          }

          completeRequest(
            requestId,
            204,
            { message: "No data in local DB" },
            true
          );
        } catch (dbError) {
          // BD local sin datos, fallback a API externa
        }
      }

      // 🎯 PASO 3: Fallback a API externa (solo si no hay datos en BD)
      // 🎯 NUEVO: Pasar TODOS los IDs disponibles para obtener datos de todas las plataformas
      const requestId = trackRequest(
        "/influencers/platforms/basic-data",
        "GET",
        `openInfluencerPanel(${influencer.name}, API-externa)`,
        {
          youtubeId: allPlatformIds.youtubeId,
          instagramId: allPlatformIds.instagramId,
          tiktokId: allPlatformIds.tiktokId,
          source: "external-api",
          allIds,
        }
      );

      const data = await influencerService.getBasicPlatformData({
        youtubeId: allPlatformIds.youtubeId || undefined,
        instagramId: allPlatformIds.instagramId || undefined,
        tiktokId: allPlatformIds.tiktokId || undefined,
      });

      if (data && Object.keys(data).length > 0) {
        // ✅ DATOS OBTENIDOS DE API EXTERNA
        setFullInfluencerCache((prev) => ({ ...prev, [cacheKey]: data }));
        setSelectedInfluencer(adaptBasicPlatformDataForPanel(data, influencer));
        completeRequest(requestId, 200, data, false);
      } else {
        // ❌ API EXTERNA SIN DATOS
        completeRequest(
          requestId,
          204,
          { message: "No data from external API" },
          false
        );
      }
    } catch (error) {
      console.error(`❌ Error obteniendo datos del influencer:`, error);
      // 🎯 IMPORTANTE: Mantener panel abierto incluso con error
      // Los datos básicos del influencer ya están en setSelectedInfluencer(influencer)
    } finally {
      setLoadingPanel(false);
    }
  };

  // 🎯 NUEVA FUNCIÓN: Adaptar datos extendidos de BD local para el panel
  const adaptExtendedDataForPanel = (
    extendedData: any,
    basicInfluencer: any
  ) => {
    // Combinar datos básicos del Explorer con datos extendidos de BD
    return {
      ...basicInfluencer,
      // Datos de YouTube si están disponibles
      ...(extendedData.youtube_basic && {
        platformInfo: {
          ...basicInfluencer.platformInfo,
          youtube: {
            ...basicInfluencer.platformInfo?.youtube,
            ...extendedData.youtube_basic,
            recentVideos: extendedData.youtube_history?.videos || [],
          },
        },
      }),
      // Datos de Instagram si están disponibles
      ...(extendedData.instagram_basic && {
        platformInfo: {
          ...basicInfluencer.platformInfo,
          instagram: {
            ...basicInfluencer.platformInfo?.instagram,
            basicInstagram: extendedData.instagram_basic,
            recentPosts: extendedData.instagram_history?.posts || [],
          },
        },
      }),
      // Datos de TikTok si están disponibles
      ...(extendedData.tiktok_basic && {
        platformInfo: {
          ...basicInfluencer.platformInfo,
          tiktok: {
            ...basicInfluencer.platformInfo?.tiktok,
            basicTikTok: extendedData.tiktok_basic,
            recentVideos: extendedData.tiktok_history?.videos || [],
          },
        },
      }),
      // Métricas de rendimiento si están disponibles
      ...(extendedData.performance_metrics && {
        performanceMetrics: extendedData.performance_metrics,
      }),
      // Información de contacto si está disponible
      ...(extendedData.contact_info && {
        contactInfo: extendedData.contact_info,
      }),
      // Metadatos de sincronización
      _metadata: {
        source: "local-database",
        lastSync: extendedData.updated_at,
        completenessScore: extendedData.data_completeness_score || 0,
        hasExtendedData: true,
      },
    };
  };

  const locations: string[] = Array.from(
    new Set(influencers.map((inf) => inf.location))
  );
  const categories: string[] = Array.from(
    new Set(influencers.map((inf) => inf.categories?.[0] || ""))
  );

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const data = await campaignService.getCampaigns();
      setCampaigns(data || []);
    } catch (e) {
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleToggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    if (selectMode) setSelectedInfluencers([]);
  };

  const handleContinueAssign = () => {
    setShowAssignModal(true);
    fetchCampaigns();
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedCampaign(null);
    setAssignError(null);
    setAssignSuccess(false);
    setAssignmentResult(null);
    setSelectMode(false);
    setSelectedInfluencers([]);
  };

  const handleSelectInfluencer = (id: string) => {
    setSelectedInfluencers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 🎯 NUEVA: Función para seleccionar/deseleccionar todos los influencers visibles
  const handleSelectAll = () => {
    const dataToShow = limitedInfluencers.slice((page - 1) * size, page * size);
    const visibleIds = dataToShow.map((inf) => inf.creatorId);
    const allSelected = visibleIds.every((id) =>
      selectedInfluencers.includes(id)
    );

    if (allSelected) {
      // Deseleccionar todos los visibles
      setSelectedInfluencers((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      // Seleccionar todos los visibles que no están seleccionados
      setSelectedInfluencers((prev) => {
        const newSelected = visibleIds.filter((id) => !prev.includes(id));
        return [...prev, ...newSelected];
      });
    }
  };

  // --- Assignment helpers ---
  const buildCreatePayload = (row: any) => {
    const socialPlatforms = Array.isArray(row?.socialPlatforms)
      ? Array.from(
          new Set(
            row.socialPlatforms.map((p: any) =>
              typeof p === "string" ? p : p.platform
            )
          )
        )
      : [];

    return {
      creator_id: row?.creatorId,
      name: row?.name || row?.creatorId,
      avatar: row?.avatar || row?.image || "",
      is_verified: !!(row?.verified ?? row?.isVerified),
      main_social_platform:
        row?.mainSocialPlatform ||
        (platform !== "all" ? platform : socialPlatforms[0] || "instagram"),
      followers_count: row?.followersCount || 0,
      average_engagement_rate: row?.averageEngagementRate || 0,
      language: row?.language ?? null,
      location: location && location !== "all" ? location : null,
      categories: row?.categories || [],
      content_niches: row?.contentNiches || row?.categories || [],
      social_platforms: socialPlatforms,
      platform_info: row?.platformInfo || {},
      metadata: {
        source: "explorer",
        searchMeta: { appliedFilters: { platform, location } },
      },
    };
  };

  // Keep previous implementation available for rollback
  const oldOnAssign = async (campaignIds: string[]) => {
    setAssigning(true);
    setAssignError(null);
    setAssignSuccess(false);

    try {
      const influencerDataMap = new Map<
        string,
        { localId: string; name: string }
      >();
      for (const influencerId of selectedInfluencers) {
        try {
          let localInfluencer = null as any;
          try {
            localInfluencer = await influencerService.getInfluencerById(
              influencerId
            );
          } catch (_) {}

          if (localInfluencer) {
            influencerDataMap.set(influencerId, {
              localId: localInfluencer.id,
              name: localInfluencer.name || influencerId,
            });
          } else {
            const selectedInfluencer = influencers.find(
              (inf) => inf.creatorId === influencerId
            );
            const youtubeId = selectedInfluencer?.platformInfo?.youtube
              ? influencerId
              : undefined;
            const instagramId =
              selectedInfluencer?.platformInfo?.instagram?.instagramId ||
              (selectedInfluencer && !youtubeId ? influencerId : undefined);
            const tiktokId = selectedInfluencer?.platformInfo?.tiktok?.tiktokId;
            const fullData = await influencerService.getFullInfluencerData({
              youtubeId,
              instagramId,
              tiktokId,
            });
            const newLocalInfluencer = await saveIfNotExists(fullData);
            if (newLocalInfluencer?.id) {
              influencerDataMap.set(influencerId, {
                localId: newLocalInfluencer.id,
                name: fullData?.youtubeName || fullData?.name || influencerId,
              });
            }
          }
        } catch (err) {
          console.error(`Error procesando influencer ${influencerId}:`, err);
        }
      }

      const validLocalIds = Array.from(influencerDataMap.values()).map(
        (data) => data.localId
      );
      let totalSuccesses: string[] = [];
      let totalAlreadyAssigned: string[] = [];
      let totalFailed: string[] = [];

      for (const campaignId of campaignIds) {
        try {
          const assignmentCheck =
            await campaignService.checkInfluencerAssignments(
              campaignId,
              validLocalIds
            );
          const alreadyAssignedNames = assignmentCheck.alreadyAssigned.map(
            (localId: string) => {
              const entry = Array.from(influencerDataMap.entries()).find(
                ([_, data]) => data.localId === localId
              );
              return entry ? entry[1].name : localId;
            }
          );

          const toAssignIds = assignmentCheck.notAssigned as string[];
          const campaignSuccesses: string[] = [];
          const campaignFailed: string[] = [];

          for (const localId of toAssignIds) {
            try {
              await campaignService.addInfluencerToCampaign(
                campaignId,
                localId,
                0
              );
              const entry = Array.from(influencerDataMap.entries()).find(
                ([_, data]) => data.localId === localId
              );
              const influencerName = entry ? entry[1].name : localId;
              campaignSuccesses.push(influencerName);
            } catch (err: any) {
              const entry = Array.from(influencerDataMap.entries()).find(
                ([_, data]) => data.localId === localId
              );
              const influencerName = entry ? entry[1].name : localId;
              campaignFailed.push(influencerName);
            }
          }

          totalSuccesses = [...totalSuccesses, ...campaignSuccesses];
          totalAlreadyAssigned = [
            ...totalAlreadyAssigned,
            ...alreadyAssignedNames,
          ];
          totalFailed = [...totalFailed, ...campaignFailed];
        } catch (campaignError: any) {
          console.error(
            `Error procesando campaña ${campaignId}:`,
            campaignError
          );
          const allInfluencerNames = Array.from(influencerDataMap.values()).map(
            (data) => data.name
          );
          totalFailed = [...totalFailed, ...allInfluencerNames];
        }
      }

      const parts: string[] = [];
      if (totalSuccesses.length)
        parts.push(`${totalSuccesses.length} asignación(es) correcta(s)`);
      if (totalAlreadyAssigned.length)
        parts.push(
          `${
            [...new Set(totalAlreadyAssigned)].length
          } influencer(s) ya estaban asignados en alguna campaña`
        );
      if (totalFailed.length)
        parts.push(`${[...new Set(totalFailed)].length} con error`);

      if (totalSuccesses.length || totalAlreadyAssigned.length) {
        setAssignSuccess(true);
        setAssignmentResult({
          successes: [...new Set(totalSuccesses)],
          alreadyAssigned: [...new Set(totalAlreadyAssigned)],
          failed: [...new Set(totalFailed)],
        });
        const campaignText =
          campaignIds.length === 1
            ? "campaña"
            : `${campaignIds.length} campañas`;
        toast({
          title: `Asignación a ${campaignText} completada`,
          description: parts.join(". "),
          variant:
            totalFailed.length > totalSuccesses.length
              ? "destructive"
              : "default",
          status: "info",
        });
      } else {
        setAssignError(
          `No se pudo asignar ninguno de los influencers a las ${campaignIds.length} campañas seleccionadas.`
        );
      }
    } catch (error: any) {
      console.error("Error en proceso de asignación:", error);
      setAssignError(error.message || "Error verificando asignaciones.");
    }

    setAssigning(false);
  };

  const onAssign = async (campaignIds: string[]) => {
    setAssigning(true);
    setAssignError(null);
    setAssignSuccess(false);

    try {
      const influencerDataMap = new Map<
        string,
        { localId: string; name: string }
      >();

      for (const influencerId of selectedInfluencers) {
        try {
          // 1) Try local first
          try {
            const local = await influencerService.getInfluencerById(
              influencerId
            );
            if (local && local.id) {
              influencerDataMap.set(influencerId, {
                localId: local.id,
                name: local.name || influencerId,
              });
              continue;
            }
          } catch (_) {}

          // 2) Create from Explorer data using backend /influencers/new
          const row =
            adaptedInfluencers.find((inf) => inf.creatorId === influencerId) ||
            null;
          const payload = buildCreatePayload(
            row || { creatorId: influencerId, name: influencerId }
          );
          const created = await influencerService.createInfluencer(payload);
          if (created?.duplicate && created?.existingInfluencer?.id) {
            influencerDataMap.set(influencerId, {
              localId: created.existingInfluencer.id,
              name: created.existingInfluencer.name || influencerId,
            });
          } else if (created?.success && created?.influencer?.id) {
            influencerDataMap.set(influencerId, {
              localId: created.influencer.id,
              name: created.influencer.name || influencerId,
            });
          } else {
            throw new Error(
              created?.message || "No se pudo crear el influencer"
            );
          }

          // We need to call the extended InfluencerExtendedService to get the extended data
          const extendedData = await InfluencerExtendedService.getExtendedData({
            youtubeId: influencerId,
          });
          if (extendedData.success) {
            console.log(extendedData);
          } else {
            throw new Error(extendedData.message || "No se pudo obtener los datos extendidos");
          }
        } catch (err) {
          console.error(
            `Error creando/leyendo influencer ${influencerId}:`,
            err
          );
        }   
      }

      const validLocalIds = Array.from(influencerDataMap.values()).map(
        (d) => d.localId
      );
      let totalSuccesses: string[] = [];
      let totalAlreadyAssigned: string[] = [];
      let totalFailed: string[] = [];

      for (const campaignId of campaignIds) {
        try {
          const assignmentCheck =
            await campaignService.checkInfluencerAssignments(
              campaignId,
              validLocalIds
            );
          const alreadyAssignedNames = assignmentCheck.alreadyAssigned.map(
            (localId: string) => {
              const entry = Array.from(influencerDataMap.entries()).find(
                ([_, data]) => data.localId === localId
              );
              return entry ? entry[1].name : localId;
            }
          );

          const toAssignIds: string[] = assignmentCheck.notAssigned || [];
          const campaignSuccesses: string[] = [];
          const campaignFailed: string[] = [];

          for (const localId of toAssignIds) {
            try {
              await campaignService.addInfluencerToCampaign(
                campaignId,
                localId,
                0
              );
              const entry = Array.from(influencerDataMap.entries()).find(
                ([_, data]) => data.localId === localId
              );
              const influencerName = entry ? entry[1].name : localId;
              campaignSuccesses.push(influencerName);
            } catch (err: any) {
              const entry = Array.from(influencerDataMap.entries()).find(
                ([_, data]) => data.localId === localId
              );
              const influencerName = entry ? entry[1].name : localId;
              campaignFailed.push(influencerName);
            }
          }

          totalSuccesses = [...totalSuccesses, ...campaignSuccesses];
          totalAlreadyAssigned = [
            ...totalAlreadyAssigned,
            ...alreadyAssignedNames,
          ];
          totalFailed = [...totalFailed, ...campaignFailed];
        } catch (campaignError: any) {
          console.error(
            `Error procesando campaña ${campaignId}:`,
            campaignError
          );
          const allInfluencerNames = Array.from(influencerDataMap.values()).map(
            (data) => data.name
          );
          totalFailed = [...totalFailed, ...allInfluencerNames];
        }
      }

      const parts: string[] = [];
      if (totalSuccesses.length)
        parts.push(`${totalSuccesses.length} asignación(es) correcta(s)`);
      if (totalAlreadyAssigned.length)
        parts.push(
          `${
            [...new Set(totalAlreadyAssigned)].length
          } influencer(s) ya estaban asignados en alguna campaña`
        );
      if (totalFailed.length)
        parts.push(`${[...new Set(totalFailed)].length} con error`);

      if (totalSuccesses.length || totalAlreadyAssigned.length) {
        setAssignSuccess(true);
        setAssignmentResult({
          successes: [...new Set(totalSuccesses)],
          alreadyAssigned: [...new Set(totalAlreadyAssigned)],
          failed: [...new Set(totalFailed)],
        });
        const campaignText =
          campaignIds.length === 1
            ? "campaña"
            : `${campaignIds.length} campañas`;
        toast({
          title: `Asignación a ${campaignText} completada`,
          description: parts.join(". "),
          variant:
            totalFailed.length > totalSuccesses.length
              ? "destructive"
              : "default",
          status: "info",
        });
      } else {
        setAssignError(
          `No se pudo asignar ninguno de los influencers a las ${campaignIds.length} campañas seleccionadas.`
        );
      }
    } catch (error: any) {
      console.error("Error en proceso de asignación:", error);
      setAssignError(error.message || "Error verificando asignaciones.");
    }

    setAssigning(false);
  };

  // 🎯 NUEVA: Función para manejar click en fila del influencer
  const handleRowClick = (influencerId: string, event: React.MouseEvent) => {
    // Evitar selección si se hace click en botones o checkboxes
    const target = event.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('input[type="checkbox"]') ||
      target.closest("label")
    ) {
      return;
    }

    if (selectMode) {
      handleSelectInfluencer(influencerId);
    }
  };

  async function saveIfNotExists(fullData: any) {
    try {
      const existing = await influencerService.getInfluencerById(
        fullData.creatorId
      );
      if (existing) return existing;
    } catch (e) {
      return await influencerService.createInfluencer(fullData);
    }
  }

  // ✨ Función para mapear códigos de idioma a nombres completos en español
  const getLanguageName = (languageCode: string | undefined): string => {
    if (!languageCode || languageCode === "N/A") return "-";

    const languageMap: Record<string, string> = {
      spa: "Español",
      eng: "Inglés",
      en: "Inglés",
      es: "Español",
      por: "Portugués",
      pt: "Portugués",
      fra: "Francés",
      fr: "Francés",
      ita: "Italiano",
      it: "Italiano",
      deu: "Alemán",
      de: "Alemán",
      jpn: "Japonés",
      ja: "Japonés",
      kor: "Coreano",
      ko: "Coreano",
      zho: "Chino",
      zh: "Chino",
      rus: "Ruso",
      ru: "Ruso",
      ara: "Árabe",
      ar: "Árabe",
      hin: "Hindi",
      hi: "Hindi",
      nld: "Holandés",
      nl: "Holandés",
      swe: "Sueco",
      sv: "Sueco",
      nor: "Noruego",
      no: "Noruego",
      dan: "Danés",
      da: "Danés",
      fin: "Finlandés",
      fi: "Finlandés",
      pol: "Polaco",
      pl: "Polaco",
      tur: "Turco",
      tr: "Turco",
      ind: "Indonesio",
      id: "Indonesio",
      tha: "Tailandés",
      th: "Tailandés",
      vie: "Vietnamita",
      vi: "Vietnamita",
      ukr: "Ucraniano",
      uk: "Ucraniano",
      ron: "Rumano",
      ro: "Rumano",
      hun: "Húngaro",
      hu: "Húngaro",
      cze: "Checo",
      cs: "Checo",
      slk: "Eslovaco",
      sk: "Eslovaco",
      hrv: "Croata",
      hr: "Croata",
      srp: "Serbio",
      sr: "Serbio",
      bul: "Búlgaro",
      bg: "Búlgaro",
      cat: "Catalán",
      ca: "Catalán",
      eus: "Euskera",
      eu: "Euskera",
      glg: "Gallego",
      gl: "Gallego",
    };

    // Buscar por código exacto o en minúsculas
    const normalizedCode = languageCode.toLowerCase();
    return (
      languageMap[normalizedCode] ||
      languageMap[languageCode] ||
      languageCode.toUpperCase()
    );
  };

  const adaptBasicPlatformDataForPanel = (
    data: any,
    originalInfluencer: any
  ) => {
    if (!data || !data.platformInfo) return null;

    const platformInfo = data.platformInfo;
    const socialPlatforms: ExplorerSocialPlatform[] = [];

    // 🎯 NUEVO: Procesar datos de YouTube
    if (platformInfo.youtube && platformInfo.youtube !== null) {
      const youtubeData =
        platformInfo.youtube.basicYoutube || platformInfo.youtube;
      let username =
        youtubeData.displayId ||
        youtubeData.youtubeName ||
        youtubeData.channelTitle ||
        "";
      if (username.startsWith("@")) {
        username = username.substring(1);
      }
      socialPlatforms.push({
        platform: "YouTube",
        username: username,
        followers: youtubeData.subscribers || youtubeData.followers || 0,
        engagement: youtubeData.engageRate1Y || youtubeData.engageRate || 0,
      });
    }

    // 🎯 NUEVO: Procesar datos de Instagram
    if (platformInfo.instagram && platformInfo.instagram !== null) {
      const instagramData =
        platformInfo.instagram.basicInstagram || platformInfo.instagram;
      socialPlatforms.push({
        platform: "Instagram",
        username: instagramData.instagramId || instagramData.username || "",
        followers: instagramData.followers || instagramData.subscribers || 0,
        engagement: instagramData.engageRate || instagramData.engagement || 0,
      });
    }

    // 🎯 NUEVO: Procesar datos de TikTok
    if (platformInfo.tiktok && platformInfo.tiktok !== null) {
      const tiktokData = platformInfo.tiktok.basicTikTok || platformInfo.tiktok;
      socialPlatforms.push({
        platform: "TikTok",
        username: tiktokData.tiktokId || tiktokData.username || "",
        followers: tiktokData.followers || tiktokData.subscribers || 0,
        engagement: tiktokData.engageRate || tiktokData.engagement || 0,
      });
    }

    const mainPlatformInfo =
      [...socialPlatforms].sort((a, b) => b.followers - a.followers)[0] || null;

    if (!mainPlatformInfo) {
      return {
        id: originalInfluencer.creatorId,
        name: originalInfluencer.name || "Sin nombre",
        image: originalInfluencer.avatar || "",
        verified: originalInfluencer.isVerified || false,
        categories: originalInfluencer.contentNiches || [],
        location: originalInfluencer.country || "-",
        handle: "",
        platform: "",
        followersFormatted: "0",
        engagementFormatted: "0.00%",
        platformInfo: platformInfo,
      };
    }

    const followers = mainPlatformInfo.followers;
    const followersFormatted =
      followers >= 1000000
        ? `${(followers / 1000000).toFixed(1)}M`
        : followers >= 1000
        ? `${(followers / 1000).toFixed(1)}K`
        : `${followers}`;

    const engagement = mainPlatformInfo.engagement || 0;
    const engagementFormatted = `${(engagement * 100).toFixed(2)}%`;

    // 🎯 NUEVO: Obtener el mejor avatar disponible
    let bestAvatar = originalInfluencer.avatar || "";
    if (platformInfo.youtube?.avatar) {
      bestAvatar = platformInfo.youtube.avatar;
    } else if (platformInfo.instagram?.basicInstagram?.avatar) {
      bestAvatar = platformInfo.instagram.basicInstagram.avatar;
    } else if (platformInfo.instagram?.avatar) {
      bestAvatar = platformInfo.instagram.avatar;
    } else if (platformInfo.tiktok?.basicTikTok?.avatar) {
      bestAvatar = platformInfo.tiktok.basicTikTok.avatar;
    } else if (platformInfo.tiktok?.avatar) {
      bestAvatar = platformInfo.tiktok.avatar;
    }

    return {
      id: originalInfluencer.creatorId,
      name: originalInfluencer.name || "Sin nombre",
      image: bestAvatar,
      verified: originalInfluencer.isVerified || false,
      categories: originalInfluencer.contentNiches || [],
      location: originalInfluencer.country || "-",
      handle: mainPlatformInfo.username ? `@${mainPlatformInfo.username}` : "",
      platform: mainPlatformInfo.platform,
      followersFormatted,
      engagementFormatted,
      platformInfo: platformInfo,
    };
  };

  // 🎯 NUEVA FUNCIÓN: Extraer todos los IDs de plataformas disponibles
  const extractAllPlatformIds = (influencer: any) => {
    const platformIds = {
      youtubeId: null as string | null,
      instagramId: null as string | null,
      tiktokId: null as string | null,
      facebookId: null as string | null,
      threadsId: null as string | null,
    };

    if (!influencer?.platformInfo) {
      return platformIds;
    }

    const platformInfo = influencer.platformInfo;

    // 🎯 EXTRAER IDs DE YOUTUBE (puede contener IDs de otras plataformas)
    if (platformInfo.youtube) {
      const youtubeData = platformInfo.youtube;

      // ID de YouTube
      platformIds.youtubeId =
        youtubeData.displayId || youtubeData.id || youtubeData.youtubeId;

      // 🎯 IDs ADICIONALES que pueden venir en la respuesta de YouTube
      platformIds.instagramId =
        youtubeData.instagramId || platformIds.instagramId;
      platformIds.tiktokId = youtubeData.tiktokId || platformIds.tiktokId;
      platformIds.facebookId = youtubeData.facebookId || platformIds.facebookId;
      platformIds.threadsId = youtubeData.threadsId || platformIds.threadsId;
    }

    // 🎯 EXTRAER IDs DE INSTAGRAM
    if (platformInfo.instagram) {
      const instagramData = platformInfo.instagram;
      const basicInstagram = instagramData.basicInstagram || instagramData;

      platformIds.instagramId =
        basicInstagram.instagramId ||
        basicInstagram.id ||
        basicInstagram.username ||
        platformIds.instagramId;

      // 🎯 IDs ADICIONALES que pueden venir en la respuesta de Instagram
      platformIds.youtubeId =
        basicInstagram.youtubeId ||
        basicInstagram.youtubeChannelId ||
        platformIds.youtubeId;
      platformIds.tiktokId =
        basicInstagram.tiktokId ||
        basicInstagram.tiktokUsername ||
        platformIds.tiktokId;
      platformIds.facebookId =
        basicInstagram.facebookId ||
        basicInstagram.facebookPageId ||
        platformIds.facebookId;
      platformIds.threadsId =
        basicInstagram.threadsId ||
        basicInstagram.threadsUsername ||
        platformIds.threadsId;
    }

    // 🎯 EXTRAER IDs DE TIKTOK
    if (platformInfo.tiktok) {
      const tiktokData = platformInfo.tiktok;
      const basicTikTok = tiktokData.basicTikTok || tiktokData;

      platformIds.tiktokId =
        basicTikTok.tiktokId ||
        basicTikTok.id ||
        basicTikTok.username ||
        platformIds.tiktokId;

      // 🎯 IDs ADICIONALES que pueden venir en la respuesta de TikTok
      platformIds.youtubeId =
        basicTikTok.youtubeId ||
        basicTikTok.youtubeChannelId ||
        platformIds.youtubeId;
      platformIds.instagramId =
        basicTikTok.instagramId ||
        basicTikTok.instagramUsername ||
        platformIds.instagramId;
      platformIds.facebookId =
        basicTikTok.facebookId ||
        basicTikTok.facebookPageId ||
        platformIds.facebookId;
      platformIds.threadsId =
        basicTikTok.threadsId ||
        basicTikTok.threadsUsername ||
        platformIds.threadsId;
    }

    // 🎯 EXTRAER IDs DE FACEBOOK
    if (platformInfo.facebook) {
      const facebookData = platformInfo.facebook;
      const basicFacebook = facebookData.basicFacebook || facebookData;

      platformIds.facebookId =
        basicFacebook.facebookId ||
        basicFacebook.id ||
        basicFacebook.username ||
        platformIds.facebookId;

      // 🎯 IDs ADICIONALES que pueden venir en la respuesta de Facebook
      platformIds.youtubeId =
        basicFacebook.youtubeId ||
        basicFacebook.youtubeChannelId ||
        platformIds.youtubeId;
      platformIds.instagramId =
        basicFacebook.instagramId ||
        basicFacebook.instagramUsername ||
        platformIds.instagramId;
      platformIds.tiktokId =
        basicFacebook.tiktokId ||
        basicFacebook.tiktokUsername ||
        platformIds.tiktokId;
      platformIds.threadsId =
        basicFacebook.threadsId ||
        basicFacebook.threadsUsername ||
        platformIds.threadsId;
    }

    // 🎯 EXTRAER IDs DE THREADS
    if (platformInfo.threads) {
      const threadsData = platformInfo.threads;
      const basicThreads = threadsData.basicThreads || threadsData;

      platformIds.threadsId =
        basicThreads.threadsId ||
        basicThreads.id ||
        basicThreads.username ||
        platformIds.threadsId;

      // 🎯 IDs ADICIONALES que pueden venir en la respuesta de Threads
      platformIds.youtubeId =
        basicThreads.youtubeId ||
        basicThreads.youtubeChannelId ||
        platformIds.youtubeId;
      platformIds.instagramId =
        basicThreads.instagramId ||
        basicThreads.instagramUsername ||
        platformIds.instagramId;
      platformIds.tiktokId =
        basicThreads.tiktokId ||
        basicThreads.tiktokUsername ||
        platformIds.tiktokId;
      platformIds.facebookId =
        basicThreads.facebookId ||
        basicThreads.facebookPageId ||
        platformIds.facebookId;
    }

    return platformIds;
  };

  // 🎯 NUEVA FUNCIÓN: Verificar si el influencer tiene datos extendidos
  const hasExtendedData = (influencer: any) => {
    if (!influencer?.platformInfo) return false;

    const platformInfo = influencer.platformInfo;

    // Verificar si tiene datos detallados de cualquier plataforma
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

    return hasYouTubeExtended || hasInstagramExtended || hasTikTokExtended;
  };

  // 🎯 NUEVA FUNCIÓN: Determinar qué datos ya tenemos vs qué necesitamos obtener
  const determineDataNeeds = (influencer: any, platformIds: any) => {
    const needs = {
      youtube: false,
      instagram: false,
      tiktok: false,
      facebook: false,
      threads: false,
    };

    const hasData = {
      youtube: false,
      instagram: false,
      tiktok: false,
      facebook: false,
      threads: false,
    };

    const platformInfo = influencer.platformInfo || {};

    // 🎯 VERIFICAR QUÉ DATOS YA TENEMOS
    if (
      platformInfo.youtube &&
      (platformInfo.youtube.subscribers > 0 ||
        platformInfo.youtube.recentVideos?.length > 0 ||
        platformInfo.youtube.views > 0)
    ) {
      hasData.youtube = true;
    }

    if (
      platformInfo.instagram &&
      (platformInfo.instagram.basicInstagram?.followers > 0 ||
        platformInfo.instagram.recentPosts?.length > 0 ||
        platformInfo.instagram.basicInstagram?.engageRate > 0)
    ) {
      hasData.instagram = true;
    }

    if (
      platformInfo.tiktok &&
      (platformInfo.tiktok.basicTikTok?.followers > 0 ||
        platformInfo.tiktok.recentVideos?.length > 0 ||
        platformInfo.tiktok.basicTikTok?.engageRate > 0)
    ) {
      hasData.tiktok = true;
    }

    if (
      platformInfo.facebook &&
      (platformInfo.facebook.basicFacebook?.followers > 0 ||
        platformInfo.facebook.recentPosts?.length > 0 ||
        platformInfo.facebook.basicFacebook?.engageRate > 0)
    ) {
      hasData.facebook = true;
    }

    if (
      platformInfo.threads &&
      (platformInfo.threads.basicThreads?.followers > 0 ||
        platformInfo.threads.recentPosts?.length > 0 ||
        platformInfo.threads.basicThreads?.gRateThreadsTabAvgLikes > 0)
    ) {
      hasData.threads = true;
    }

    // 🎯 DETERMINAR QUÉ NECESITAMOS OBTENER
    needs.youtube = platformIds.youtubeId && !hasData.youtube;
    needs.instagram = platformIds.instagramId && !hasData.instagram;
    needs.tiktok = platformIds.tiktokId && !hasData.tiktok;
    needs.facebook = platformIds.facebookId && !hasData.facebook;
    needs.threads = platformIds.threadsId && !hasData.threads;

    return { needs, hasData };
  };

  return (
    <div className="flex px-4 gap-4 ">
      {/* Panel de filtros (izquierda) */}
      {showFilters && (
        <div className="w-[360px] flex-shrink-0 order-2">
          <HypeAuditorFilters
            platform={platform}
            setPlatform={setPlatform}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            location={location}
            setLocation={setLocation}
            minFollowers={minFollowers}
            setMinFollowers={setMinFollowers}
            maxFollowers={maxFollowers}
            setMaxFollowers={setMaxFollowers}
            minEngagement={minEngagement}
            setMinEngagement={setMinEngagement}
            maxEngagement={maxEngagement}
            setMaxEngagement={setMaxEngagement}
            accountType={accountType === "any" ? "all" : accountType}
            setAccountType={(val: string) =>
              setAccountType(val === "all" ? "any" : (val as "brand" | "human"))
            }
            verified={verified || false}
            setVerified={setVerified}
            hasContacts={hasContacts || false}
            setHasContacts={setHasContacts}
            aqs={aqsRange}
            setAqs={setAqsRange}
            cqs={cqsRange}
            setCqs={setCqsRange}
            searchContent={[]}
            setSearchContent={() => {}}
            searchDescription={[]}
            setSearchDescription={() => {}}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedGrowthRate={{ min: 0, max: 100, period: "month" }}
            setSelectedGrowthRate={() => {}}
            audienceGeo={audienceGeo}
            setAudienceGeo={setAudienceGeo}
            audienceAge={audienceAge}
            setAudienceAge={setAudienceAge}
            onSearch={handleSearch}
            isLoading={loadingInfluencers}
          />
        </div>
      )}

      {/* Panel de debug del skeleton desactivado */}

      {/* Contenido principal (derecha) */}
      <div className="flex-1 order-1">
        <div
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          style={{ scrollBehavior: "auto" }}
        >
          {/* 🎯 HEADER MEJORADO - CONSISTENTE CON INFLUENCER TABLE */}
          <div className="px-6 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                </Button>
                <h2 className="text-lg font-semibold text-gray-900">
                  Resultados de búsqueda
                </h2>
                <div className="flex items-center gap-3">
                  {/* 🎯 INDICADOR DE BÚSQUEDA */}
                  {searchInfo.tokensUsed && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-blue-700">
                        HypeAuditor
                      </span>
                      <span className="text-xs text-blue-600">
                        ({searchInfo.tokensUsed} tokens)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!selectMode ? (
                  <button
                    onClick={handleToggleSelectMode}
                    disabled={
                      !hasEverSearched ||
                      (!loadingInfluencers && limitedInfluencers.length === 0)
                    }
                    className={
                      "font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 flex items-center gap-2 text-sm" +
                      (!hasEverSearched ||
                      (!loadingInfluencers && limitedInfluencers.length === 0)
                        ? " bg-gray-300 text-gray-500 cursor-not-allowed"
                        : " bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-md")
                    }
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Asignar a campaña
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleSelectMode}
                      className="bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 text-sm"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancelar
                    </button>
                    <button
                      onClick={handleContinueAssign}
                      disabled={selectedInfluencers.length === 0}
                      className={
                        "bg-gradient-to-r from-green-600 to-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 flex items-center gap-2 text-sm" +
                        (selectedInfluencers.length === 0
                          ? " opacity-50 cursor-not-allowed from-gray-400 to-gray-500"
                          : " hover:from-green-700 hover:to-green-800 hover:shadow-md")
                      }
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
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Continuar ({selectedInfluencers.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de resultados */}
          <div className="overflow-x-auto bg-white relative h-screen min-h-[550px]">
            {/* 🎯 SKELETON OVERLAY - Aparece ENCIMA cuando está cargando - ARREGLADO para mayor visibilidad */}
            {loadingInfluencers && (
              <div className="absolute inset-0 bg-white z-[100] border border-gray-200 rounded-lg min-h-[550px] flex flex-col">
                {/* Header visible siempre */}
                <div className="flex-shrink-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        {selectMode && (
                          <th className="py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"></th>
                        )}
                        <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Creator
                        </th>
                        <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plataformas
                        </th>

                        <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seguidores
                        </th>
                        <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Engagement
                        </th>
                        <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Skeleton rows que ocupan todo el espacio restante */}
                <div className="flex-1 min-h-[480px]">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      <SkeletonInfluencerTable
                        selectMode={selectMode}
                        rows={6}
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  {selectMode && (
                    <th className="py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      <label className="relative flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={(() => {
                            const dataToShow = limitedInfluencers.slice(
                              (page - 1) * size,
                              page * size
                            );
                            const visibleIds = dataToShow.map(
                              (inf) => inf.creatorId
                            );
                            return (
                              visibleIds.length > 0 &&
                              visibleIds.every((id) =>
                                selectedInfluencers.includes(id)
                              )
                            );
                          })()}
                          onChange={handleSelectAll}
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${(() => {
                            const dataToShow = limitedInfluencers.slice(
                              (page - 1) * size,
                              page * size
                            );
                            const visibleIds = dataToShow.map(
                              (inf) => inf.creatorId
                            );
                            const allSelected =
                              visibleIds.length > 0 &&
                              visibleIds.every((id) =>
                                selectedInfluencers.includes(id)
                              );
                            return allSelected
                              ? "bg-blue-600 border-blue-600 shadow-md"
                              : "bg-white border-gray-300 hover:border-blue-400";
                          })()}`}
                        >
                          {(() => {
                            const dataToShow = limitedInfluencers.slice(
                              (page - 1) * size,
                              page * size
                            );
                            const visibleIds = dataToShow.map(
                              (inf) => inf.creatorId
                            );
                            const allSelected =
                              visibleIds.length > 0 &&
                              visibleIds.every((id) =>
                                selectedInfluencers.includes(id)
                              );
                            return (
                              allSelected && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )
                            );
                          })()}
                        </div>
                      </label>
                    </th>
                  )}
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plataformas
                  </th>

                  <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seguidores
                  </th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* 🎯 CAMBIO: Control simplificado de qué mostrar */}
                {(() => {
                  // 🎯 PRIORIDAD ABSOLUTA: Si está cargando, no mostrar nada (skeleton se encarga)
                  if (loadingInfluencers) {
                    return null; // El skeleton overlay se encarga
                  }

                  // 🎯 MENSAJE INICIAL - Solo mostrar si NUNCA se ha buscado
                  if (!hasEverSearched) {
                    return (
                      <tr>
                        <td colSpan={selectMode ? 8 : 7} className="p-0">
                          <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-6">
                                <Search className="h-8 w-8 text-blue-600" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Búsqueda de Influencers
                              </h3>
                              <p className="text-gray-500 max-w-md mx-auto">
                                Utiliza los filtros de la izquierda y haz clic
                                en "Buscar" para encontrar influencers que se
                                adapten a tu campaña.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // 🎯 CAMBIO: Una vez que se haya buscado, siempre mostrar datos o mensaje de "no encontrados"
                  const dataToShow = limitedInfluencers.slice(
                    (page - 1) * size,
                    page * size
                  ); // Paginación interna

                  return (
                    <>
                      {/* 🎯 DATOS REALES SIEMPRE VISIBLES */}
                      {dataToShow.map((influencer, index) => {
                        if (!influencer) return null;
                        // ✨ CLAVE ÚNICA que evita duplicados usando ID + índice + nombre normalizado
                        const uniqueKey = `${
                          influencer.id
                        }_${index}_${influencer.name
                          ?.replace(/\s+/g, "")
                          .toLowerCase()}`;

                        // Verificar selección
                        const isSelected = selectedInfluencers.includes(
                          influencer.creatorId
                        );

                        // Clases CSS para la fila
                        const baseClasses =
                          "hover:bg-gray-50 transition-colors duration-150";
                        const cursorClass = selectMode ? "cursor-pointer" : "";
                        const selectedClasses =
                          selectMode && isSelected
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : "";
                        const finalClassName =
                          `${baseClasses} ${cursorClass} ${selectedClasses}`.trim();

                        return (
                          <tr
                            key={uniqueKey}
                            className={finalClassName}
                            onClick={(e) =>
                              handleRowClick(influencer.creatorId, e)
                            }
                          >
                            {selectMode && (
                              <td className="py-4 px-3 text-center">
                                <label className="relative flex items-center justify-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isSelected}
                                    onChange={() =>
                                      handleSelectInfluencer(
                                        influencer.creatorId
                                      )
                                    }
                                  />
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                      isSelected
                                        ? "bg-blue-600 border-blue-600 shadow-md"
                                        : "bg-white border-gray-300 hover:border-blue-400"
                                    }`}
                                  >
                                    {isSelected && (
                                      <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </label>
                              </td>
                            )}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <LazyInfluencerAvatar influencer={influencer} />
                                <div>
                                  <div className="font-medium text-gray-900 flex items-center gap-2">
                                    <span>
                                      {influencer.name === "Sin nombre" ||
                                      /\d/.test(influencer.name)
                                        ? influencer.creatorId
                                        : influencer.name}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-2">
                                    {influencer.verified && (
                                      <Badge
                                        variant="secondary"
                                        className="ml-1"
                                      >
                                        <svg
                                          className="h-3 w-3"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        Verificado
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex justify-center gap-3">
                                {/* Mostrar TODAS las plataformas donde tiene cuenta */}
                                {(() => {
                                  const platforms =
                                    detectAvailablePlatforms(influencer);

                                  return platforms.length > 0 ? (
                                    platforms.map((platform) => (
                                      <span
                                        key={platform.name}
                                        className="inline-flex"
                                        title={`${
                                          platform.name
                                        }: ${platform.followers.toLocaleString(
                                          "es-ES"
                                        )} seguidores`}
                                        suppressHydrationWarning
                                      >
                                        {getPlatformIcon(platform.name)}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 text-xs">
                                      -
                                    </span>
                                  );
                                })()}
                              </div>
                            </td>

                            <td className="py-4 px-6 text-center">
                              <span className="font-medium">
                                <NumberDisplay
                                  value={influencer.followersCount}
                                  format="short"
                                />
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="font-medium" suppressHydrationWarning>
                                {influencer.averageEngagementRate > 0
                                  ? `${(
                                      influencer.averageEngagementRate * 100
                                    ).toFixed(1)}%`
                                  : "-"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-50"
                                  onClick={() =>
                                    openInfluencerPanel(influencer)
                                  }
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  );
                })()}
              </tbody>
            </table>

            {/* 🎯 CAMBIO: Mensaje de "No se encontraron" cuando se ha buscado pero no hay resultados */}
            {!loadingInfluencers &&
              hasEverSearched &&
              limitedInfluencers.length === 0 && (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {page > 1
                      ? "No hay más resultados"
                      : "No se encontraron influencers"}
                  </h3>
                  <p className="text-gray-500">
                    {page > 1
                      ? `Has llegado al final de los resultados. Total: ${totalCount} influencers.`
                      : "Intenta ajustar los filtros para ver más resultados."}
                  </p>
                  {page > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => handlePageChange(1)}
                    >
                      Volver a la primera página
                    </Button>
                  )}
                </div>
              )}
          </div>

          {/* 🎯 PAGINACIÓN MEJORADA - Solo mostrar cuando se ha buscado */}
          {hasEverSearched && (
            <div className="px-6 py-4 border-t bg-white">
              <div className="flex justify-center items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 shadow-sm"
                  disabled={page === 1 || loadingInfluencers}
                  onClick={() => handlePageChange(page - 1)}
                >
                  ←
                </Button>
                <span className="text-sm font-medium text-gray-700">
                  {loadingInfluencers
                    ? `Cargando página ${page}...`
                    : `Página ${page} de ${Math.ceil(
                        limitedInfluencers.length / size
                      )}`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 shadow-sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={
                    loadingInfluencers ||
                    page * size >= limitedInfluencers.length
                  }
                >
                  →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel de perfil */}
      {selectedInfluencer && (
        <InfluencerProfilePanel
          influencer={selectedInfluencer}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          isLoading={loadingPanel}
        />
      )}

      {/* Modal de asignación */}
      <ExplorerAssignModal
        open={showAssignModal}
        onClose={handleCloseAssignModal}
        influencers={selectedInfluencers}
        influencersData={adaptedInfluencers.filter((inf) =>
          selectedInfluencers.includes(inf.creatorId)
        )}
        campaigns={campaigns}
        loadingCampaigns={loadingCampaigns} // 🎯 NUEVA PROP: Estado de carga de campañas
        isAssigning={assigning}
        assignError={assignError}
        assignSuccess={assignSuccess}
        assignmentResult={assignmentResult}
        onAssign={onAssign}
      />
    </div>
  );
}

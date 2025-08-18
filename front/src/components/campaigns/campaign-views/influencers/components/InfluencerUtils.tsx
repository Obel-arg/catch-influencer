import {
  Users,
  Instagram,
  Youtube,
  Twitter,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Componente personalizado para el ícono de TikTok
export const TikTokIcon = ({ className }: { className?: string }) => (
  <img src="/icons/tiktok.svg" alt="TikTok icon" className={className} />
);

// Función para obtener el icono de plataforma más pequeño
export const getSmallPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-3 w-3 text-pink-500" />;
    case "youtube":
      return <Youtube className="h-3 w-3 text-red-500" />;
    case "twitter":
      return <Twitter className="h-3 w-3 text-blue-500" />;
    case "tiktok":
      return <TikTokIcon className="h-3 w-3 text-black" />;
    default:
      return <Users className="h-3 w-3 text-gray-500" />;
  }
};

// Función para obtener el ID del influencer en la plataforma específica
export const getPlatformInfluencerId = (
  platformInfo: any,
  platform: string
): string | null => {
  if (!platformInfo || typeof platformInfo !== "object") {
    return null;
  }

  const platformLower = platform.toLowerCase();

  try {
    // Normalizar posibles ubicaciones/cap keys
    const yt = platformInfo.youtube || platformInfo.basicYoutube || {};
    const igBasic =
      platformInfo.instagram?.basicInstagram ||
      platformInfo.instagram?.basicinstagram ||
      platformInfo.basicInstagram ||
      platformInfo.basicinstagram ||
      platformInfo.instagram ||
      {};
    const tkBasic =
      platformInfo.tiktok?.basicTiktok ||
      platformInfo.tiktok?.basicTikTok ||
      platformInfo.basicTiktok ||
      platformInfo.basicTikTok ||
      platformInfo.tiktok ||
      {};

    let result: string | null = null;

    switch (platformLower) {
      case "tiktok": {
        // Preferido: tiktok.basicTiktok.tiktokId
        result = tkBasic?.tiktokId || yt?.tiktokId || platformInfo.tiktokId || null;
        break;
      }
      case "instagram": {
        // Preferido: instagram.basicInstagram.instagramId
        result = igBasic?.instagramId || yt?.instagramId || platformInfo.instagramId || null;
        break;
      }
      case "youtube": {
        // Preferido: youtube.displayId
        result = yt?.displayId || platformInfo.displayId || platformInfo.youtube?.displayId || platformInfo.youtube?.basicYoutube?.displayId || null;
        break;
      }
      case "twitter": {
        result = null; // no implementado
        break;
      }
      default:
        result = null;
    }

    return result;
  } catch (error) {
    console.error("Error parsing platform info:", error);
    return null;
  }
};

// Función para obtener todos los usernames de todas las plataformas
export const getAllPlatformUsernames = (
  platformInfo: any
): { platform: string; username: string; icon: JSX.Element }[] => {
  if (!platformInfo || typeof platformInfo !== "object") {
    return [];
  }

  const platforms = ["instagram", "youtube", "tiktok", "twitter"];
  const usernames: { platform: string; username: string; icon: JSX.Element }[] =
    [];

  platforms.forEach((platform) => {
    const username = getPlatformInfluencerId(platformInfo, platform);
    if (username) {
      usernames.push({
        platform,
        username: username.startsWith("@") ? username : `@${username}`,
        icon: getSmallPlatformIcon(platform),
      });
    }
  });

  return usernames;
};

// Función para obtener usernames solo de las plataformas activas (con posts)
export const getActivePlatformUsernames = (
  platformInfo: any,
  activePlatformsList: string[]
): { platform: string; username: string; icon: JSX.Element }[] => {
  if (
    !platformInfo ||
    typeof platformInfo !== "object" ||
    !activePlatformsList ||
    activePlatformsList.length === 0
  ) {
    return [];
  }

  const usernames: { platform: string; username: string; icon: JSX.Element }[] =
    [];

  activePlatformsList.forEach((platform) => {
    const platformLower = platform.toLowerCase();
    const username = getPlatformInfluencerId(platformInfo, platformLower);
    if (username) {
      usernames.push({
        platform: platformLower,
        username: username.startsWith("@") ? username : `@${username}`,
        icon: getSmallPlatformIcon(platformLower),
      });
    }
  });

  return usernames;
};

// Función para construir la URL del perfil en cada plataforma
export const getPlatformProfileUrl = (
  platform: string,
  username: string
): string => {
  // Limpiar el username (quitar @ si existe)
  const cleanUsername = username.replace("@", "");

  switch (platform.toLowerCase()) {
    case "instagram":
      return `https://www.instagram.com/${cleanUsername}`;
    case "tiktok":
      return `https://www.tiktok.com/@${cleanUsername}`;
    case "youtube":
      return `https://www.youtube.com/@${cleanUsername}`;
    case "twitter":
      return `https://twitter.com/${cleanUsername}`;
    default:
      return "#";
  }
};

// Función para formatear números grandes
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Función para formatear presupuesto
export const formatBudget = (
  amount: number | undefined | null,
  currency: string = "USD"
): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "N/A";
  }
  const symbol = currency === "USD" ? "$" : "€";
  return `${symbol}${amount.toLocaleString()}`;
};

// Función para formatear el estado del influencer
export const formatInfluencerStatus = (status: string): string => {
  if (!status) return "Desconocido";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Función para obtener el badge de estado del influencer
export const getInfluencerStatusBadge = (status: string) => {
  const formattedStatus = formatInfluencerStatus(status);

  switch (status?.toLowerCase()) {
    case "active":
      return (
        <Badge
          className="bg-green-500 text-white border-green-500"
          style={{
            backgroundColor: "#10b981",
            color: "white",
            borderColor: "#10b981",
          }}
        >
          {formattedStatus}
        </Badge>
      );
    case "inactive":
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          <Clock className="h-3 w-3 mr-1" />
          {formattedStatus}
        </Badge>
      );
    case "verified":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {formattedStatus}
        </Badge>
      );
    case "suspended":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          {formattedStatus}
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          {formattedStatus}
        </Badge>
      );
    default:
      return <Badge variant="outline">{formattedStatus}</Badge>;
  }
};

// Función para calcular el performance score basado en métricas
export const calculatePerformanceScore = (influencer: any): number => {
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

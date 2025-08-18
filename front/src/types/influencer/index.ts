// ==============================================
// TIPOS PRINCIPALES DE INFLUENCER
// ==============================================

export type PlatformType = 'youtube' | 'instagram' | 'tiktok' | 'threads' | 'facebook' | 'twitter';

// Información específica de cada plataforma
export interface PlatformData {
  id: string;
  name?: string;
  username?: string;
  followers?: number;
  subscribers?: number;
  engageRate?: number;
  engageRate1Y?: number;
  avatar?: string;
  isVerified?: boolean;
  country?: string;
  lang?: string;
  hashtags?: string[];
  needsFetch?: boolean; // Para indicar si necesita ser cargado
  [key: string]: any; // Para datos adicionales específicos de la plataforma
}

// Información consolidada de todas las plataformas
export interface PlatformInfo {
  youtube?: PlatformData | null;
  instagram?: PlatformData | null;
  tiktok?: PlatformData | null;
  threads?: PlatformData | null;
  facebook?: PlatformData | null;
  twitter?: PlatformData | null;
}

// Desglose de seguidores por plataforma
export interface FollowerBreakdown {
  total: number;
  youtube: number;
  instagram: number;
  tiktok: number;
  threads?: number;
  facebook?: number;
  twitter?: number;
}

// ==============================================
// INTERFAZ PRINCIPAL DE INFLUENCER (MODERNA)
// ==============================================

export interface Influencer {
  // Identificación
  creatorId: string;
  id?: string; // Para compatibilidad con sistemas legacy
  
  // Información básica
  name: string;
  avatar: string;
  image?: string; // Para compatibilidad
  isVerified: boolean;
  verified?: boolean; // Para compatibilidad
  
  // Contenido y audiencia
  contentNiches: string[];
  categories?: string[]; // Para compatibilidad
  country: string;
  location?: string; // Para compatibilidad
  language: string;
  bio?: string;
  
  // Métricas principales
  followersCount: number;
  averageEngagementRate: number;
  mainSocialPlatform: string;
  
  // Información de plataformas
  platformInfo: PlatformInfo;
  followerBreakdown: FollowerBreakdown;
  
  // Metadatos del sistema
  organizationId?: string;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: string;
  updatedAt?: string;
  created_at?: string; // Para compatibilidad con snake_case
  updated_at?: string; // Para compatibilidad con snake_case
  
  // Propiedades legacy para compatibilidad
  email?: string;
  phone?: string;
  socialMedia?: SocialMedia[];
  followersFormatted?: string;
  engagementFormatted?: string;
}

// ==============================================
// TIPOS LEGACY PARA COMPATIBILIDAD
// ==============================================

export interface SocialMedia {
  platform: 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'TWITTER' | 'FACEBOOK' | 'THREADS';
  username: string;
  followers: number;
  engagement: number;
}

export interface InfluencerMetrics {
  id: string;
  influencerId: string;
  totalEngagement: number;
  averageEngagement: number;
  totalReach: number;
  averageReach: number;
  totalPosts: number;
  createdAt: string;
  updatedAt: string;
}

// ==============================================
// DTOS PARA OPERACIONES CRUD
// ==============================================

export interface CreateInfluencerDto {
  name: string;
  email: string;
  phone?: string;
  socialMedia: {
    platform: 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'TWITTER' | 'FACEBOOK' | 'THREADS';
    username: string;
    followers: number;
    engagement: number;
  }[];
  categories: string[];
  bio?: string;
  location?: string;
}

export interface UpdateInfluencerDto extends Partial<CreateInfluencerDto> {}

// ==============================================
// TIPOS DE RESPUESTA DE LA API
// ==============================================

export interface InfluencerSearchResult {
  items: Influencer[];
  count: number;
  page: number;
  size: number;
  cached?: boolean;
  cacheInfo?: {
    hit: boolean;
    tokensUsed: number;
    searchHash: string;
    expiresAt: string;
  };
  validation?: {
    applied: boolean;
    originalCount: number;
    filteredCount: number;
    reason: string;
  };
}

export interface SmartSearchResult extends InfluencerSearchResult {
  query: string;
  platform: string;
  searchType: 'username' | 'name' | 'hashtag' | 'keyword';
  searchSummary: {
    youtube: number;
    instagram: number;
    tiktok: number;
  };
  executionTime: number;
  metadata?: {
    userId?: string;
    userEmail?: string;
    timestamp: string;
    searchTips: {
      examples: string[];
      supportedPlatforms: string[];
    };
  };
}

// ==============================================
// FILTROS DE BÚSQUEDA
// ==============================================

export interface SearchFilters {
  platform?: string;
  country?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  maxEngagement?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
  query?: string;
  username?: string;
  [key: string]: any;
}

// ==============================================
// UTILIDADES DE TIPO
// ==============================================

// Helper para extraer datos de una plataforma específica
export type PlatformSpecificData<T extends PlatformType> = 
  T extends 'youtube' ? PlatformData & { subscribers: number; engageRate1Y?: number } :
  T extends 'instagram' ? PlatformData & { followers: number; engageRate: number } :
  T extends 'tiktok' ? PlatformData & { followers: number; engageRate: number } :
  T extends 'threads' ? PlatformData & { followers: number; gRateThreadsTabAvgLikes?: number } :
  T extends 'facebook' ? PlatformData & { followers: number; engageRate: number } :
  PlatformData;

// Helper para verificar si un influencer tiene una plataforma específica
export function hasPlatform<T extends PlatformType>(
  influencer: Influencer, 
  platform: T
): influencer is Influencer & { platformInfo: Record<T, NonNullable<PlatformData>> } {
  return influencer.platformInfo[platform] !== null && influencer.platformInfo[platform] !== undefined;
}

// Helper para obtener el dato de una plataforma específica
export function getPlatformData<T extends PlatformType>(
  influencer: Influencer, 
  platform: T
): PlatformSpecificData<T> | null {
  return influencer.platformInfo[platform] as PlatformSpecificData<T> | null;
}

// Helper para formatear números de seguidores
export function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Helper para formatear engagement rate
export function formatEngagement(rate: number): string {
  const percentage = rate * 100; // Convertir decimal a porcentaje
  return `${percentage.toFixed(2)}%`;
} 
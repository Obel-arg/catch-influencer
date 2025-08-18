// ==============================================
// IMPORTS PARA USO INTERNO
// ==============================================

import type { SocialMedia } from './influencer/index';

// ==============================================
// RE-EXPORTS DESDE EL ARCHIVO PRINCIPAL
// ==============================================
// Este archivo mantiene compatibilidad con imports legacy
// Los tipos principales están en ./influencer/index.ts

export {
  type Influencer,
  type SocialMedia,
  type PlatformType,
  type PlatformData,
  type PlatformInfo,
  type FollowerBreakdown,
  type InfluencerMetrics,
  type CreateInfluencerDto,
  type UpdateInfluencerDto,
  type InfluencerSearchResult,
  type SmartSearchResult,
  type SearchFilters,
  type PlatformSpecificData,
  hasPlatform,
  getPlatformData,
  formatFollowers,
  formatEngagement
} from './influencer/index';

// ==============================================
// TIPOS ESPECÍFICOS LEGACY (DEPRECADOS)
// ==============================================
// Estos tipos se mantienen solo para compatibilidad hacia atrás
// Se recomienda usar los tipos del archivo principal

/**
 * @deprecated Usar el tipo Influencer del archivo principal
 */
export interface LegacyInfluencer {
  id: string;
  name: string;
  email?: string;
  location?: string;
  categories?: string[];
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  metadata?: any;
  creator_id?: string;
  main_social_platform?: string;
  followers_count?: number;
  average_engagement_rate?: number;
  content_niches?: string[];
  social_platforms?: string[];
  platform_info?: any;
  avatar?: string;
  is_verified?: boolean;
  language?: string;
  bio?: string;
  organizationId?: string;
  
  // Propiedades legacy para compatibilidad
  image?: string;
  verified?: boolean;
  followersFormatted?: string;
  engagementFormatted?: string;
  socialMedia?: SocialMedia[];
  createdAt?: string;
  updatedAt?: string;
} 
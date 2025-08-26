import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración para la API de InfluencIQ
 * Base URL: https://influenciq.com/api
 */
export const influenceIQConfig = {
  apiKey: 'api_df3a5ed06d4949418add37945927d450',
  baseUrl: 'https://influenciq.com/api',
  maxResultsPerPage: 100,
  defaultPlatform: 'instagram' as const
};

// ==============================================
// INTERFACES PARA FILTROS DE BÚSQUEDA
// ==============================================

export interface InfluenceIQFollowersFilter {
  left_number: number;
  right_number: number;
}

export interface InfluenceIQEngagementRateFilter {
  value: number; // decimal (e.g., 0.02 = 2%)
}

export interface InfluenceIQAgeFilter {
  left_number: number;
  right_number: number;
}

export interface InfluenceIQAudienceAgeRangeFilter {
  left_number: number;
  right_number: number;
  weight?: number;
  operator?: 'lt' | 'lte' | 'gt' | 'gte';
}

export interface InfluenceIQGenderFilter {
  code: 'MALE' | 'FEMALE';
}

export interface InfluenceIQAudienceGenderFilter {
  code: 'MALE' | 'FEMALE';
  weight: number; // percentage (0.01 = 1%, 0.05 = 5%)
}

export interface InfluenceIQLanguageFilter {
  code: string; // ISO-639-1 code
}

export interface InfluenceIQAudienceLanguageFilter {
  code: string;
  weight: number;
}

export interface InfluenceIQGeoFilter {
  id: number; // Geo ID
}

export interface InfluenceIQAudienceGeoFilter {
  id: number;
  weight: number;
}

export interface InfluenceIQBrandCategoryFilter {
  id: number;
}

export interface InfluenceIQAudienceBrandCategoryFilter {
  id: number;
  weight: number;
}

export interface InfluenceIQContactFilter {
  type: 'email' | 'phone' | 'whatsapp' | 'bbm' | 'facebook' | 'instagram' | 
        'itunes' | 'kakao' | 'kik' | 'lineid' | 'linktree' | 'pinterest' | 
        'sarahah' | 'sayat' | 'skype' | 'snapchat' | 'telegram' | 'tiktok' | 
        'tumblr' | 'twitchtv' | 'twitter' | 'viber' | 'vk' | 'wechat' | 
        'weibo' | 'youtube';
}

export interface InfluenceIQRelevanceFilter {
  value: string; // username to find similar influencers
}

export interface InfluenceIQAudienceRelevanceFilter {
  value: string; // username to find similar audiences
}

// ==============================================
// FILTROS ESPECÍFICOS DE INSTAGRAM
// ==============================================

export interface InfluenceIQReelsPlaysFilter {
  left_number: number;
  right_number: number;
}

export interface InfluenceIQFollowersGrowthFilter {
  interval: 'i1month' | 'i2months' | 'i3months' | 'i6months' | 'i1year';
  value: number; // growth percentage
  operator: 'gte' | 'lte' | 'gt' | 'lt' | 'eq';
}

// ==============================================
// FILTROS ESPECÍFICOS DE YOUTUBE
// ==============================================

export interface InfluenceIQViewsFilter {
  left_number: number;
  right_number: number;
}

export interface InfluenceIQSemanticFilter {
  query: string;
}

// ==============================================
// FILTROS ESPECÍFICOS DE TIKTOK
// ==============================================

// Usa la misma interfaz que YouTube para views

// ==============================================
// INTERFACES PARA PAGINACIÓN Y ORDENAMIENTO
// ==============================================

export interface InfluenceIQPaging {
  limit: number;
  skip: number;
}

export interface InfluenceIQSorting {
  field: string;
  direction: 'asc' | 'desc';
}

// ==============================================
// INTERFAZ PRINCIPAL DE FILTROS
// ==============================================

export interface InfluenceIQSearchFilters {
  // Filtros generales (todas las plataformas)
  followers?: InfluenceIQFollowersFilter;
  engagement_rate?: InfluenceIQEngagementRateFilter;
  age?: InfluenceIQAgeFilter;
  audience_age_range?: InfluenceIQAudienceAgeRangeFilter;
  gender?: InfluenceIQGenderFilter;
  audience_gender?: InfluenceIQAudienceGenderFilter;
  lang?: InfluenceIQLanguageFilter;
  audience_lang?: InfluenceIQAudienceLanguageFilter;
  geo?: InfluenceIQGeoFilter[];
  audience_geo?: InfluenceIQAudienceGeoFilter[];
  brand_category?: number[];
  audience_brand_category?: InfluenceIQAudienceBrandCategoryFilter[];
  keywords?: string[];
  with_contact?: InfluenceIQContactFilter[];
  relevance?: InfluenceIQRelevanceFilter;
  audience_relevance?: InfluenceIQAudienceRelevanceFilter;
  
  // Filtros específicos de Instagram
  reels_plays?: InfluenceIQReelsPlaysFilter;
  text?: string[];
  last_posted?: number;
  audience_credibility?: number;
  followers_growth?: InfluenceIQFollowersGrowthFilter;
  
  // Filtros específicos de YouTube
  views?: InfluenceIQViewsFilter;
  semantic?: InfluenceIQSemanticFilter;
  is_official_artist?: boolean;
  
  // Filtros específicos de TikTok
  // views?: InfluenceIQViewsFilter; // Mismo que YouTube
}

// ==============================================
// INTERFAS PARA EL BODY DE LA PETICIÓN
// ==============================================

export interface InfluenceIQSearchRequest {
  filter: InfluenceIQSearchFilters;
  paging: InfluenceIQPaging;
  sort?: InfluenceIQSorting;
  currentOwnerId?: string;
}

// ==============================================
// INTERFACES PARA RESPUESTAS
// ==============================================

export interface InfluenceIQUserProfile {
  user_id: string;
  username: string;
  url: string;
  picture: string;
  fullname: string;
  is_verified: boolean;
  account_type: number;
  followers: number;
  engagements: number;
  engagement_rate: number;
  hidden_like_posts_rate?: number;
  avg_reels_plays?: number;
}

export interface InfluenceIQAccount {
  user_profile: InfluenceIQUserProfile;
  audience_source: string;
}

export interface InfluenceIQAudienceCredibility {
  audience_credibility: number;
  credibility_class: string;
}

export interface InfluenceIQAudienceAge {
  code: string;
  weight: number;
}

export interface InfluenceIQAudienceGender {
  code: 'MALE' | 'FEMALE';
  weight: number;
}

export interface InfluenceIQAudienceGenderPerAge {
  code: string;
  male: number;
  female: number;
}

export interface InfluenceIQAudienceLanguage {
  code: string;
  name: string;
  weight: number;
}

export interface InfluenceIQAudienceCountry {
  id: number;
  name: string;
  code: string;
  weight: number;
}

export interface InfluenceIQAudienceGeo {
  countries: InfluenceIQAudienceCountry[];
}

export interface InfluenceIQAudienceData {
  audience_ages?: InfluenceIQAudienceAge[];
  audience_genders?: InfluenceIQAudienceGender[];
  audience_genders_per_age?: InfluenceIQAudienceGenderPerAge[];
  audience_credibility?: InfluenceIQAudienceCredibility;
}

export interface InfluenceIQMatch {
  user_profile?: Partial<InfluenceIQUserProfile>;
  audience_likers?: {
    data: InfluenceIQAudienceData;
  };
}

export interface InfluenceIQSearchResult {
  account: InfluenceIQAccount;
  match: InfluenceIQMatch;
  audience_languages?: InfluenceIQAudienceLanguage[];
  audience_geo?: InfluenceIQAudienceGeo;
}

export interface InfluenceIQSearchResponse {
  success: boolean;
  total: number;
  accounts: InfluenceIQSearchResult[];
  id?: string;
  id2?: string;
  provider?: string;
  data?: InfluenceIQSearchResult[]; // Para compatibilidad con la interfaz anterior
  page?: number;
  limit?: number;
}

// ==============================================
// INTERFACES PARA INSIGHTS DE INFLUENCER
// ==============================================

export interface InfluenceIQInsightRequest {
  username: string;
  platform?: 'instagram' | 'youtube' | 'tiktok';
}

export interface InfluenceIQInsightResponse {
  success: boolean;
  data: {
    profile: InfluenceIQUserProfile;
    audience: InfluenceIQAudienceData;
    demographics: {
      ages: InfluenceIQAudienceAge[];
      genders: InfluenceIQAudienceGender[];
      languages: InfluenceIQAudienceLanguage[];
      countries: InfluenceIQAudienceCountry[];
    };
    metrics: {
      engagement_rate: number;
      followers_growth: number;
      avg_views?: number;
      avg_reels_plays?: number;
    };
  };
}

// ==============================================
// CONSTANTES Y ENUMS
// ==============================================

export const INFLUENCEIQ_PLATFORMS = {
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok'
} as const;

export const INFLUENCEIQ_GENDERS = {
  MALE: 'MALE',
  FEMALE: 'FEMALE'
} as const;

export const INFLUENCEIQ_GROWTH_INTERVALS = {
  ONE_MONTH: 'i1month',
  TWO_MONTHS: 'i2months',
  THREE_MONTHS: 'i3months',
  SIX_MONTHS: 'i6months',
  ONE_YEAR: 'i1year'
} as const;

export const INFLUENCEIQ_OPERATORS = {
  GREATER_THAN_EQUAL: 'gte',
  LESS_THAN_EQUAL: 'lte',
  GREATER_THAN: 'gt',
  LESS_THAN: 'lt',
  EQUAL: 'eq'
} as const;

export const INFLUENCEIQ_SORT_DIRECTIONS = {
  ASCENDING: 'asc',
  DESCENDING: 'desc'
} as const;

// ==============================================
// FUNCIONES HELPER
// ==============================================

export const createInfluenceIQHeaders = (apiKey: string) => ({
  'influencer-api-key': apiKey,
  'Content-Type': 'application/json'
});

export const validateInfluenceIQConfig = () => {
  if (!influenceIQConfig.apiKey) {
    throw new Error('INFLUENCEIQ_API_KEY no está configurado en las variables de entorno');
  }
  return true;
};

export default influenceIQConfig;


  
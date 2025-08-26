import { httpApiClient } from '@/lib/http';

// Interfaces para HypeAuditor Discovery
export interface HypeAuditorDiscoveryFilters {
  platform?: string;
  searchQuery?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  maxEngagement?: number;
  page?: number;
  // Filtros adicionales que podemos agregar después
  location?: string;
  selectedCategories?: string[];
  accountType?: 'brand' | 'human' | 'any';
  verified?: boolean;
  hasContacts?: boolean;
  hasLaunchedAdvertising?: boolean;
  searchContent?: string[];
  searchDescription?: string[];
  aqs?: { min: number; max: number };
  cqs?: { min: number; max: number };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Filtros de audiencia
  audienceGender?: { gender: 'male' | 'female' | 'any'; percentage: number };
  audienceAge?: { minAge: number; maxAge: number; percentage: number };
  audienceGeo?: { countries: { [key: string]: number }; cities: { [key: string]: number } };
}

export interface HypeAuditorDiscoveryResult {
  basic: {
    username: string;
    title: string;
    avatar_url: string;
    id?: string;
  };
  metrics: {
    er?: { value: number };
    subscribers_count: { value: number };
    real_subscribers_count?: { value: number };
    likes_count?: { value: number };
    views_avg?: { value: number };
    comments_avg?: { value: number };
    shares_avg?: { value: number };
  };
  features: {
    social_networks?: Array<{
      type: string;
      title: string;
      social_id: string;
      username: string;
      avatar_url: string;
      subscribers_count: number;
      er: number;
      state: string;
    }>;
    aqs?: {
      data: {
        mark: string;
      };
    };
    cqs?: {
      data: {
        mark: string;
      };
    };
  };
}

export interface HypeAuditorDiscoveryResponse {
  success: boolean;
  data: {
    result: {
      search_results: HypeAuditorDiscoveryResult[];
      current_page: number;
      total_pages: number;
      queries_left: number;
    };
  };
  provider: string;
  metadata: {
    searchTime: number;
    filtersApplied: string[];
    cacheHit: boolean;
    mode: string;
  };
}

export interface HypeAuditorHealthResponse {
  success: boolean;
  status: string;
  provider: string;
  responseTime: number;
  queriesLeft: number;
  testResults: number;
  timestamp: string;
}

export interface HypeAuditorUsageStatsResponse {
  success: boolean;
  provider: string;
  queriesLeft: number;
  totalPages: number;
  currentPage: number;
  resultsPerPage: number;
  timestamp: string;
}

class HypeAuditorDiscoveryService {
  private readonly baseUrl = '/hypeauditor/discovery';

  /**
   * Realiza una búsqueda de discovery usando HypeAuditor
   */
            async searchDiscovery(filters: HypeAuditorDiscoveryFilters): Promise<HypeAuditorDiscoveryResponse> {
            try {
              const response = await httpApiClient.post<HypeAuditorDiscoveryResponse>(`${this.baseUrl}/search-sandbox`, filters);
              return response.data;
            } catch (error) {
              console.error('❌ [HYPEAUDITOR DISCOVERY SERVICE] Error en búsqueda:', error);
              throw error;
            }
          }

            /**
           * Verifica la salud del servicio HypeAuditor
           */
          async healthCheck(): Promise<HypeAuditorHealthResponse> {
            try {
              const response = await httpApiClient.get<HypeAuditorHealthResponse>(`${this.baseUrl}/health`);
              return response.data;
            } catch (error) {
              console.error('❌ [HYPEAUDITOR DISCOVERY SERVICE] Error en health check:', error);
              throw error;
            }
          }

            /**
           * Obtiene estadísticas de uso
           */
          async getUsageStats(): Promise<HypeAuditorUsageStatsResponse> {
            try {
              const response = await httpApiClient.get<HypeAuditorUsageStatsResponse>(`${this.baseUrl}/usage-stats`);
              return response.data;
            } catch (error) {
              console.error('❌ [HYPEAUDITOR DISCOVERY SERVICE] Error obteniendo estadísticas:', error);
              throw error;
            }
          }

  /**
   * Transforma los resultados de HypeAuditor al formato del Explorer
   */
  transformToExplorerFormat(hypeAuditorResponse: HypeAuditorDiscoveryResponse) {
    const results = hypeAuditorResponse.data.result.search_results;
    
    return {
      success: hypeAuditorResponse.success,
      items: results.map(item => ({
        // IDs básicos
        id: item.basic.username,
        creatorId: item.basic.username,
        name: item.basic.title || item.basic.username,
        avatar: item.basic.avatar_url,
        isVerified: false,
        contentNiches: [],
        country: undefined,
        location: undefined,
        language: undefined,
        
        // ✅ CAMPOS QUE LEE DIRECTAMENTE LA TABLA
        followersCount: item.metrics.subscribers_count?.value || 0, // ✅ 50,924,589
        averageEngagementRate: (item.metrics.er?.value || 0) / 100, // ✅ 1.56% → 0.0156
        mainSocialPlatform: 'instagram',
        categories: [],
        
        // Estructura completa para compatibilidad
        socialPlatforms: [{
          platform: item.features.social_networks?.[0]?.type || 'instagram',
          username: item.basic.username,
          followers: item.metrics.subscribers_count?.value || 0,
          engagement: item.metrics.er?.value || 0
        }],
        platformInfo: {
          socialId: item.features.social_networks?.[0]?.social_id,
          state: item.features.social_networks?.[0]?.state,
          aqs: item.features.aqs?.data?.mark,
          cqs: item.features.cqs?.data?.mark
        },
        metrics: {
          engagementRate: item.metrics.er?.value || 0,
          realFollowers: item.metrics.real_subscribers_count?.value,
          likesCount: item.metrics.likes_count?.value,
          viewsAvg: item.metrics.views_avg?.value,
          commentsAvg: item.metrics.comments_avg?.value,
          sharesAvg: item.metrics.shares_avg?.value,
          aqs: item.features.aqs?.data?.mark,
          cqs: item.features.cqs?.data?.mark
        }
      })),
      totalCount: hypeAuditorResponse.data.result.total_pages * 20, // 20 items por página
      currentPage: hypeAuditorResponse.data.result.current_page,
      totalPages: hypeAuditorResponse.data.result.total_pages,
      queriesLeft: hypeAuditorResponse.data.result.queries_left,
      provider: hypeAuditorResponse.provider,
      metadata: {
        searchTime: hypeAuditorResponse.metadata.searchTime,
        filtersApplied: hypeAuditorResponse.metadata.filtersApplied,
        cacheHit: hypeAuditorResponse.metadata.cacheHit,
        mode: hypeAuditorResponse.metadata.mode
      }
    };
  }
}

export const hypeAuditorDiscoveryService = new HypeAuditorDiscoveryService();

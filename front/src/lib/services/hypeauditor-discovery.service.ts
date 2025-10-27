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
  // Categorías del taxonomy de HypeAuditor
  taxonomyCategories?: {
    include: string[];
    exclude: string[];
  };
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

export interface HypeAuditorTaxonomyCategory {
  id: string;
  name: string;
  parent_id?: string | null;
  level: number;
  children?: HypeAuditorTaxonomyCategory[];
}

export interface HypeAuditorTaxonomyResponse {
  success: boolean;
  data: {
    categories: HypeAuditorTaxonomyCategory[];
    total: number;
  };
  provider: string;
}

class HypeAuditorDiscoveryService {
  private readonly baseUrl = '/hypeauditor/discovery';

  /**
   * Realiza una búsqueda de discovery usando HypeAuditor
   */
  async searchDiscovery(filters: HypeAuditorDiscoveryFilters): Promise<HypeAuditorDiscoveryResponse> {
    try {
      const response = await httpApiClient.post<HypeAuditorDiscoveryResponse>(`${this.baseUrl}/search`, filters);
      return response.data;
    } catch (error) {
      console.error('Error en búsqueda HypeAuditor:', error);
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
      console.error('Error en health check HypeAuditor:', error);
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
   * Obtiene el taxonomy de categorías de HypeAuditor
   */
  async getTaxonomy(): Promise<HypeAuditorTaxonomyResponse> {
    try {
      const response = await httpApiClient.get<HypeAuditorTaxonomyResponse>(`${this.baseUrl}/taxonomy`);
      return response.data;
    } catch (error) {
      console.error('❌ [HYPEAUDITOR DISCOVERY SERVICE] Error obteniendo taxonomy:', error);
      throw error;
    }
  }

  /**
   * Transforma los resultados de HypeAuditor al formato del Explorer
   */
  transformToExplorerFormat(hypeAuditorResponse: HypeAuditorDiscoveryResponse) {
    // La respuesta viene directamente con items en el nivel superior
    const results = hypeAuditorResponse.items || [];
    
    return {
      success: hypeAuditorResponse.success,
      items: results, // Los items ya vienen transformados desde el backend
      totalCount: hypeAuditorResponse.totalCount || 0,
      currentPage: hypeAuditorResponse.currentPage || 1,
      totalPages: hypeAuditorResponse.totalPages || 1,
      queriesLeft: hypeAuditorResponse.queriesLeft || 0,
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
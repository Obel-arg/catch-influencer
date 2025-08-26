import { httpApiClient } from '@/lib/http';

export interface InfluenceIQSearchFilters {
  followers?: {
    left_number: number;
    right_number: number;
  };
  engagement_rate?: {
    value: number;
  };
  keywords?: string[];
  with_contact?: Array<{
    type: string;
  }>;
  age?: {
    left_number: number;
    right_number: number;
  };
  gender?: {
    code: 'MALE' | 'FEMALE';
  };
  geo?: number[];
  audience_geo?: Array<{
    id: number;
    weight: number;
  }>;
  brand_category?: number[];
  audience_brand_category?: Array<{
    id: number;
    weight: number;
  }>;
  semantic?: {
    query: string;
  };
}

export interface InfluenceIQSearchRequest {
  filter: InfluenceIQSearchFilters;
  paging: {
    limit: number;
    skip: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

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

export interface InfluenceIQSearchResult {
  account: InfluenceIQAccount;
  match: any;
  audience_languages?: any[];
  audience_geo?: any;
}

export interface InfluenceIQSearchResponse {
  success: boolean;
  total: number;
  accounts: InfluenceIQSearchResult[];
  id?: string;
  id2?: string;
  provider?: string;
  data?: InfluenceIQSearchResult[];
  page?: number;
  limit?: number;
}

export class InfluenceIQService {
  private static instance: InfluenceIQService;

  private constructor() {}

  public static getInstance(): InfluenceIQService {
    if (!InfluenceIQService.instance) {
      InfluenceIQService.instance = new InfluenceIQService();
    }
    return InfluenceIQService.instance;
  }

  /**
   * Búsqueda de influencers usando InfluenceIQ
   */
  async searchInfluencers(
    filters: InfluenceIQSearchFilters,
    platform: string = 'instagram',
    page: number = 1,
    limit: number = 10
  ): Promise<InfluenceIQSearchResponse> {
    try {
      const requestBody: InfluenceIQSearchRequest = {
        filter: filters,
        paging: {
          limit,
          skip: (page - 1) * limit
        }
      };

                const response = await httpApiClient.post(
            `/influenceIQ/search?platform=${platform}`,
            requestBody
          );

      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error en búsqueda:', error);
      throw new Error(`Error en búsqueda de InfluenceIQ: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Búsqueda inteligente usando búsqueda semántica
   */
  async smartSearch(query: string, platform: string = 'instagram'): Promise<InfluenceIQSearchResponse> {
    try {
      const filters: InfluenceIQSearchFilters = {
        semantic: {
          query
        }
      };

      return await this.searchInfluencers(filters, platform, 1, 10);
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error en búsqueda inteligente:', error);
      throw error;
    }
  }

  /**
   * Búsqueda exploradora con filtros avanzados
   */
  async explorerSearch(filters: Record<string, any>): Promise<InfluenceIQSearchResponse> {
    try {
      const {
        platform = 'instagram',
        page = 1,
        limit = 10,
        sort,
        ...searchFilters
      } = filters;

      const requestBody: InfluenceIQSearchRequest = {
        filter: searchFilters as InfluenceIQSearchFilters,
        paging: {
          limit,
          skip: (page - 1) * limit
        }
      };

      if (sort) {
        requestBody.sort = {
          field: sort.field,
          direction: sort.direction
        };
      }

      const response = await httpApiClient.post(
        `/influenceIQ/explorer-search?platform=${platform}`,
        requestBody
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error en búsqueda exploradora:', error);
      throw new Error(`Error en búsqueda exploradora: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verificar estado de la API
   */
  async checkApiStatus(): Promise<any> {
    try {
      const response = await httpApiClient.get('/influenceIQ/status');
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error verificando estado:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de la API
   */
  async getApiStats(): Promise<any> {
    try {
      const response = await httpApiClient.get('/influenceIQ/stats');
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Probar conexión con la API
   */
  async testConnection(): Promise<any> {
    try {
      const response = await httpApiClient.get('/influenceIQ/test');
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error en prueba de conexión:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const influenceIQService = InfluenceIQService.getInstance();

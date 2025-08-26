import axios, { AxiosResponse } from 'axios';
import { 
  influenceIQConfig, 
  validateInfluenceIQConfig,
  createInfluenceIQHeaders,
  InfluenceIQSearchRequest,
  InfluenceIQSearchResponse,
  InfluenceIQSearchFilters,
  InfluenceIQInsightRequest,
  InfluenceIQInsightResponse,
  INFLUENCEIQ_PLATFORMS,
  INFLUENCEIQ_GENDERS,
  INFLUENCEIQ_GROWTH_INTERVALS,
  INFLUENCEIQ_OPERATORS,
  INFLUENCEIQ_SORT_DIRECTIONS
} from '../../config/influenceIQ';

/**
 * Servicio para interactuar con la API de InfluenceIQ
 */
export class InfluenceIQService {
  private static instance: InfluenceIQService;
  private readonly baseUrl = 'https://influenciq.com/api';

  private constructor() {
    validateInfluenceIQConfig();
  }

  public static getInstance(): InfluenceIQService {
    if (!InfluenceIQService.instance) {
      InfluenceIQService.instance = new InfluenceIQService();
    }
    return InfluenceIQService.instance;
  }

  /**
   * Búsqueda de influencers usando InfluenceIQ API
   */
  async searchInfluencers(
    filters: InfluenceIQSearchFilters,
    platform: string = 'instagram',
    page: number = 1,
    limit: number = 10
  ): Promise<InfluenceIQSearchResponse> {
    try {
      console.log(`🔍 [INFLUENCEIQ SERVICE] Búsqueda - plataforma: ${platform}, página: ${page}`);

      const requestBody: InfluenceIQSearchRequest = {
        filter: filters,
        paging: {
          limit,
          skip: (page - 1) * limit
        }
      };

      const response: AxiosResponse<InfluenceIQSearchResponse> = await axios.post(
        `${this.baseUrl}/search?platform=${platform}`,
        requestBody,
        {
          headers: createInfluenceIQHeaders(influenceIQConfig.apiKey)
        }
      );

      console.log(`✅ [INFLUENCEIQ SERVICE] Búsqueda exitosa - ${response.data.accounts?.length || 0} resultados`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error en búsqueda:', error.response?.data || error.message);
      throw new Error(`Error en búsqueda de InfluenceIQ: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Búsqueda inteligente usando búsqueda semántica
   */
  async smartSearch(query: string, platform: string = 'instagram'): Promise<InfluenceIQSearchResponse> {
    try {
      console.log(`🧠 [INFLUENCEIQ SERVICE] Búsqueda inteligente - query: "${query}"`);

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
      console.log(`🔍 [INFLUENCEIQ SERVICE] Búsqueda exploradora iniciada`);

      const {
        platform = 'instagram',
        page = 1,
        limit = 10,
        sort,
        ...searchFilters
      } = filters;

      // Transformar filtros al formato de InfluenceIQ
      const influenceIQFilters: InfluenceIQSearchFilters = this.transformFiltersToInfluenceIQ(searchFilters);

      const requestBody: InfluenceIQSearchRequest = {
        filter: influenceIQFilters,
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

      const response: AxiosResponse<InfluenceIQSearchResponse> = await axios.post(
        `${this.baseUrl}/search?platform=${platform}`,
        requestBody,
        {
          headers: createInfluenceIQHeaders(influenceIQConfig.apiKey)
        }
      );

      console.log(`✅ [INFLUENCEIQ SERVICE] Búsqueda exploradora exitosa - ${response.data.accounts?.length || 0} resultados`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error en búsqueda exploradora:', error.response?.data || error.message);
      throw new Error(`Error en búsqueda exploradora: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtener insights de un influencer específico
   */
  async getInfluencerInsights(
    username: string,
    platform: string = 'instagram'
  ): Promise<InfluenceIQInsightResponse> {
    try {
      console.log(`📊 [INFLUENCEIQ SERVICE] Obteniendo insights para @${username}`);

      const response: AxiosResponse<InfluenceIQInsightResponse> = await axios.get(
        `${this.baseUrl}/insights/${username}?platform=${platform}`,
        {
          headers: createInfluenceIQHeaders(influenceIQConfig.apiKey)
        }
      );

      console.log(`✅ [INFLUENCEIQ SERVICE] Insights obtenidos para @${username}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error obteniendo insights:', error.response?.data || error.message);
      throw new Error(`Error obteniendo insights: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtener datos básicos de un influencer
   */
  async getBasicInfluencerData(
    username: string,
    platform: string = 'instagram'
  ): Promise<any> {
    try {
      console.log(`📋 [INFLUENCEIQ SERVICE] Obteniendo datos básicos para @${username}`);

      const response: AxiosResponse<any> = await axios.get(
        `${this.baseUrl}/basic/${username}?platform=${platform}`,
        {
          headers: createInfluenceIQHeaders(influenceIQConfig.apiKey)
        }
      );

      console.log(`✅ [INFLUENCEIQ SERVICE] Datos básicos obtenidos para @${username}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error obteniendo datos básicos:', error.response?.data || error.message);
      throw new Error(`Error obteniendo datos básicos: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtener datos completos de un influencer
   */
  async getFullInfluencerData(
    username: string,
    platform: string = 'instagram'
  ): Promise<any> {
    try {
      console.log(`📊 [INFLUENCEIQ SERVICE] Obteniendo datos completos para @${username}`);

      const response: AxiosResponse<any> = await axios.get(
        `${this.baseUrl}/full/${username}?platform=${platform}`,
        {
          headers: createInfluenceIQHeaders(influenceIQConfig.apiKey)
        }
      );

      console.log(`✅ [INFLUENCEIQ SERVICE] Datos completos obtenidos para @${username}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error obteniendo datos completos:', error.response?.data || error.message);
      throw new Error(`Error obteniendo datos completos: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verificar el estado de la API
   */
  async checkApiStatus(): Promise<any> {
    try {
      console.log(`🔍 [INFLUENCEIQ SERVICE] Verificando estado de la API`);

      const response: AxiosResponse<any> = await axios.get(
        `${this.baseUrl}/status`,
        {
          headers: createInfluenceIQHeaders(influenceIQConfig.apiKey)
        }
      );

      console.log(`✅ [INFLUENCEIQ SERVICE] Estado de API verificado`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error verificando estado:', error.response?.data || error.message);
      throw new Error(`Error verificando estado: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Obtener estadísticas de la API
   */
  async getApiStats(): Promise<any> {
    try {
      console.log(`📊 [INFLUENCEIQ SERVICE] Obteniendo estadísticas`);

      const response: AxiosResponse<any> = await axios.get(
        `${this.baseUrl}/stats`,
        {
          headers: createInfluenceIQHeaders(influenceIQConfig.apiKey)
        }
      );

      console.log(`✅ [INFLUENCEIQ SERVICE] Estadísticas obtenidas`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error obteniendo estadísticas:', error.response?.data || error.message);
      throw new Error(`Error obteniendo estadísticas: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Transformar filtros genéricos al formato de InfluenceIQ
   */
  private transformFiltersToInfluenceIQ(filters: Record<string, any>): InfluenceIQSearchFilters {
    const influenceIQFilters: InfluenceIQSearchFilters = {};

    // Filtros de seguidores
    if (filters.minFollowers || filters.maxFollowers) {
      influenceIQFilters.followers = {
        left_number: filters.minFollowers || 0,
        right_number: filters.maxFollowers || 999999999
      };
    }

    // Filtros de engagement rate
    if (filters.minEngagement || filters.maxEngagement) {
      influenceIQFilters.engagement_rate = {
        value: filters.minEngagement || 0
      };
    }

    // Filtros de edad
    if (filters.minAge || filters.maxAge) {
      influenceIQFilters.age = {
        left_number: filters.minAge || 0,
        right_number: filters.maxAge || 100
      };
    }

    // Filtros de género
    if (filters.gender) {
      influenceIQFilters.gender = {
        code: filters.gender.toUpperCase()
      };
    }

    // Filtros de ubicación geográfica
    if (filters.location) {
      influenceIQFilters.geo = [
        {
          id: filters.location
        }
      ];
    }

    // Filtros de categorías/intereses
    if (filters.categories && Array.isArray(filters.categories)) {
      influenceIQFilters.brand_category = filters.categories;
    }

    // Filtros de palabras clave
    if (filters.keywords && Array.isArray(filters.keywords)) {
      influenceIQFilters.keywords = filters.keywords;
    }

    // Filtros de contacto
    if (filters.withContact && Array.isArray(filters.withContact)) {
      influenceIQFilters.with_contact = filters.withContact.map((contact: string) => ({
        type: contact as 'email' | 'phone' | 'whatsapp' | 'bbm' | 'facebook' | 'instagram' | 
              'itunes' | 'kakao' | 'kik' | 'lineid' | 'linktree' | 'pinterest' | 
              'sarahah' | 'sayat' | 'skype' | 'snapchat' | 'telegram' | 'tiktok' | 
              'tumblr' | 'twitchtv' | 'twitter' | 'viber' | 'vk' | 'wechat' | 
              'weibo' | 'youtube'
      }));
    }

    // Filtros específicos de Instagram
    if (filters.platform === 'instagram') {
      if (filters.reelsPlays) {
        influenceIQFilters.reels_plays = {
          left_number: filters.reelsPlays.min || 0,
          right_number: filters.reelsPlays.max || 999999999
        };
      }

      if (filters.lastPosted) {
        influenceIQFilters.last_posted = filters.lastPosted;
      }

      if (filters.audienceCredibility) {
        influenceIQFilters.audience_credibility = filters.audienceCredibility;
      }

      if (filters.followersGrowth) {
        influenceIQFilters.followers_growth = {
          interval: filters.followersGrowth.interval || 'i1month',
          value: filters.followersGrowth.value || 0,
          operator: filters.followersGrowth.operator || 'gte'
        };
      }
    }

    // Filtros específicos de YouTube
    if (filters.platform === 'youtube') {
      if (filters.views) {
        influenceIQFilters.views = {
          left_number: filters.views.min || 0,
          right_number: filters.views.max || 999999999
        };
      }

      if (filters.semanticQuery) {
        influenceIQFilters.semantic = {
          query: filters.semanticQuery
        };
      }

      if (filters.isOfficialArtist !== undefined) {
        influenceIQFilters.is_official_artist = filters.isOfficialArtist;
      }
    }

    // Filtros específicos de TikTok
    if (filters.platform === 'tiktok') {
      if (filters.views) {
        influenceIQFilters.views = {
          left_number: filters.views.min || 0,
          right_number: filters.views.max || 999999999
        };
      }
    }

    return influenceIQFilters;
  }

  /**
   * Obtener datos de soporte (geo, intereses, idiomas)
   */
  async getSupportData(type: 'geo' | 'interests' | 'languages'): Promise<any> {
    try {
      console.log(`🔧 [INFLUENCEIQ SERVICE] Obteniendo datos de soporte: ${type}`);

      const response: AxiosResponse<any> = await axios.get(
        `${this.baseUrl}/support/${type}`,
        {
          headers: createInfluenceIQHeaders(influenceIQConfig.apiKey)
        }
      );

      console.log(`✅ [INFLUENCEIQ SERVICE] Datos de soporte obtenidos: ${type}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error obteniendo datos de soporte:', error.response?.data || error.message);
      throw new Error(`Error obteniendo datos de soporte: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Exportar datos de influencers
   */
  async exportData(filters: InfluenceIQSearchFilters, platform: string = 'instagram'): Promise<any> {
    try {
      console.log(`📤 [INFLUENCEIQ SERVICE] Exportando datos - plataforma: ${platform}`);

      const response: AxiosResponse<any> = await axios.post(
        `${this.baseUrl}/export?platform=${platform}`,
        { filter: filters },
        {
          headers: createInfluenceIQHeaders(influenceIQConfig.apiKey)
        }
      );

      console.log(`✅ [INFLUENCEIQ SERVICE] Datos exportados exitosamente`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [INFLUENCEIQ SERVICE] Error exportando datos:', error.response?.data || error.message);
      throw new Error(`Error exportando datos: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Exportar instancia singleton
export const influenceIQService = InfluenceIQService.getInstance();

import { httpApiClient } from '@/lib/http';
import { AxiosHeaders } from 'axios';
import { withContext } from '@/lib/http/httpInterceptor';

export interface SearchFilters {
  platform?: string;
  category?: string;
  location?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  maxEngagement?: number;
  query?: string;
  sortBy?: string;
}

export interface SearchResult {
  items: any[];
  page: number;
  size: number;
  count: number;
  cached: boolean;
  cacheInfo?: {
    hit: boolean;
    tokensUsed?: number;
    searchHash?: string;
    expiresAt?: string;
    pagesAvailable?: number;
  };
}

export interface CachedSearchInfo {
  id: string;
  searchHash: string;
  totalResults: number;
  pagesCached: number;
  tokensUsed: number;
  expiresAt: string;
  isValid: boolean;
}

export class ExplorerCacheService {
  private static instance: ExplorerCacheService;
  private readonly baseUrl = '/creator/explorer';

  private constructor() {}

  public static getInstance(): ExplorerCacheService {
    if (!ExplorerCacheService.instance) {
      ExplorerCacheService.instance = new ExplorerCacheService();
    }
    return ExplorerCacheService.instance;
  }

  /**
   * Buscar influencers con sistema de cache inteligente
   * Prioriza cache de BD sobre peticiones a CreatorDB
   */
  public async searchInfluencersWithCache(filters: SearchFilters & { page: number; size: number }): Promise<SearchResult> {
    try {
      const response = await httpApiClient.get(`${this.baseUrl}/search`, {
        params: filters,
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
          ...withContext('ExplorerCacheService', `searchWithCache(page: ${filters.page})`).headers
        }),
      });

      const result = response.data;
      
      // El backend ya maneja el cache automáticamente
      return {
        items: result.items || [],
        page: filters.page,
        size: filters.size,
        count: result.count || 0,
        cached: result.cached || false,
        cacheInfo: result.cacheInfo ? {
          hit: result.cached,
          tokensUsed: result.cacheInfo?.tokensUsed,
          searchHash: result.cacheInfo?.searchHash,
          expiresAt: result.cacheInfo?.expiresAt,
          pagesAvailable: result.cacheInfo?.pagesAvailable
        } : undefined
      };
    } catch (error) {
      console.error('Error en búsqueda con cache:', error);
      throw error;
    }
  }

  /**
   * Verificar si existe cache para una búsqueda específica
   */
  public async checkCacheAvailability(filters: SearchFilters): Promise<CachedSearchInfo | null> {
    try {
      const response = await httpApiClient.get(`${this.baseUrl}/cache/check`, {
        params: filters,
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
          ...withContext('ExplorerCacheService', 'checkCacheAvailability').headers
        }),
      });
      return response.data.cached ? response.data.cacheInfo : null;
    } catch (error) {
      console.error('Error verificando disponibilidad de cache:', error);
      return null;
    }
  }

  /**
   * Precargar páginas siguientes en background
   */
  public async prefetchPages(filters: SearchFilters, currentPage: number, pagesToPrefetch: number = 2): Promise<void> {
    try {
      const cacheInfo = await this.checkCacheAvailability(filters);
      
      if (!cacheInfo) {
        return;
      }

      // Determinar qué páginas necesitamos precargar
      const pagesToLoad: number[] = [];
      for (let i = 1; i <= pagesToPrefetch; i++) {
        const nextPage = currentPage + i;
        if (nextPage <= Math.ceil(cacheInfo.totalResults / 6) && nextPage > cacheInfo.pagesCached) {
          pagesToLoad.push(nextPage);
        }
      }

      // Precargar páginas en paralelo (sin await para que sea en background)
      pagesToLoad.forEach(page => {
        this.searchInfluencersWithCache({
          ...filters,
          page,
          size: 6
        }).catch(error => {
          console.warn(`Error precargando página ${page}:`, error);
        });
      });

      if (pagesToLoad.length > 0) {
      }
    } catch (error) {
      console.warn('Error en prefetch de páginas:', error);
    }
  }

  /**
   * Obtener estadísticas del cache
   */
  public async getCacheStats(): Promise<{
    totalSearches: number;
    totalPagesStored: number;
    totalTokensUsed: number;
    estimatedCostSaved: number;
  }> {
    try {
      const response = await httpApiClient.get(`${this.baseUrl}/cache/stats`, {
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
          ...withContext('ExplorerCacheService', 'getCacheStats').headers
        }),
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de cache:', error);
      return {
        totalSearches: 0,
        totalPagesStored: 0,
        totalTokensUsed: 0,
        estimatedCostSaved: 0
      };
    }
  }

  /**
   * Limpiar cache expirado (llamada administrativa)
   */
  public async cleanExpiredCache(): Promise<{ deletedSearches: number; deletedPages: number }> {
    try {
      const response = await httpApiClient.delete(`${this.baseUrl}/cache/expired`, {
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
          ...withContext('ExplorerCacheService', 'cleanExpiredCache').headers
        }),
      });

      return response.data;
    } catch (error) {
      console.error('Error limpiando cache expirado:', error);
      return { deletedSearches: 0, deletedPages: 0 };
    }
  }

  /**
   * Obtener búsquedas populares
   */
  public async getPopularSearches(limit: number = 10): Promise<any[]> {
    try {
      const response = await httpApiClient.get(`${this.baseUrl}/cache/popular-searches`, {
        params: { limit },
        headers: new AxiosHeaders({
          'Content-Type': 'application/json',
          ...withContext('ExplorerCacheService', 'getPopularSearches').headers
        }),
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error obteniendo búsquedas populares:', error);
      return [];
    }
  }
}

export const explorerCacheService = ExplorerCacheService.getInstance(); 
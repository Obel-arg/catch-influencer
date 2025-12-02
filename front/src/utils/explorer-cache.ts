// 🎯 Sistema de Cache Híbrido para Explorer
// Combina memoria + localStorage para reducir créditos CreatorDB test

interface CacheEntry {
  data: any;
  timestamp: number;
  filters: any;
  expiresAt: number;
}

interface SearchResult {
  items: any[];
  count: number;
  page: number;
  size: number;
  cached?: boolean;
}

const CACHE_PREFIX = 'explorer_cache_';
const CACHE_TTL = 14 * 24 * 60 * 60 * 1000; // 14 días en milisegundos

export class ExplorerCacheUtils {
  
  /**
   * Genera una clave única para la combinación de filtros
   */
  static generateCacheKey(filters: any): string {
    // Crear objeto ordenado para clave consistente
    const orderedFilters = Object.keys(filters)
      .sort()
      .reduce((result: any, key) => {
        result[key] = filters[key];
        return result;
      }, {});
    
    const filterString = JSON.stringify(orderedFilters);
    return `${CACHE_PREFIX}${btoa(filterString).replace(/[/+=]/g, '_')}`;
  }

  /**
   * Guardar búsqueda en localStorage
   */
  static saveCacheEntry(filters: any, searchResult: SearchResult): void {
    try {
      const cacheKey = this.generateCacheKey(filters);
      const cacheEntry: CacheEntry = {
        data: searchResult,
        timestamp: Date.now(),
        filters,
        expiresAt: Date.now() + CACHE_TTL
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      
      // Limpiar entradas expiradas para mantener localStorage limpio
      this.cleanExpiredEntries();
      

      
    } catch (error) {
      console.warn('⚠️ [CACHE] Error guardando en localStorage:', error);
    }
  }

  /**
   * Obtener búsqueda desde localStorage
   */
  static getCacheEntry(filters: any): SearchResult | null {
    try {
      const cacheKey = this.generateCacheKey(filters);
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const cacheEntry: CacheEntry = JSON.parse(cachedData);
      
      // Verificar si no ha expirado
      if (Date.now() > cacheEntry.expiresAt) {
        
        localStorage.removeItem(cacheKey);
        return null;
      }

      

      return {
        ...cacheEntry.data,
        cached: true
      };
      
    } catch (error) {
      console.warn('⚠️ [CACHE] Error leyendo desde localStorage:', error);
      return null;
    }
  }

  /**
   * Verificar si existe cache válido
   */
  static hasCacheEntry(filters: any): boolean {
    const entry = this.getCacheEntry(filters);
    return entry !== null;
  }

  /**
   * Limpiar entradas expiradas
   */
  static cleanExpiredEntries(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(CACHE_PREFIX)) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const entry: CacheEntry = JSON.parse(data);
              
              if (Date.now() > entry.expiresAt) {
                keysToRemove.push(key);
              }
            }
          } catch (e) {
            // Si no se puede parsear, también eliminar
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      if (keysToRemove.length > 0) {
      }
      
    } catch (error) {
      console.warn('⚠️ [CACHE] Error limpiando entradas expiradas:', error);
    }
  }

  /**
   * Obtener estadísticas del cache
   */
  static getCacheStats(): {
    totalEntries: number;
    totalSize: string;
    oldestEntry: string;
    newestEntry: string;
  } {
    let totalEntries = 0;
    let totalSize = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(CACHE_PREFIX)) {
          const data = localStorage.getItem(key);
          if (data) {
            totalEntries++;
            totalSize += data.length;
            
            try {
              const entry: CacheEntry = JSON.parse(data);
              oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
              newestTimestamp = Math.max(newestTimestamp, entry.timestamp);
            } catch (e) {
              // Ignorar entradas corruptas
            }
          }
        }
      }
      
      return {
        totalEntries,
        totalSize: (totalSize / 1024).toFixed(2) + ' KB',
        oldestEntry: totalEntries > 0 ? new Date(oldestTimestamp).toLocaleString() : 'N/A',
        newestEntry: totalEntries > 0 ? new Date(newestTimestamp).toLocaleString() : 'N/A'
      };
      
    } catch (error) {
      return {
        totalEntries: 0,
        totalSize: '0 KB',
        oldestEntry: 'Error',
        newestEntry: 'Error'
      };
    }
  }

  /**
   * Limpiar todo el cache
   */
  static clearAllCache(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      
      
    } catch (error) {
      console.warn('⚠️ [CACHE] Error limpiando cache:', error);
    }
  }

  /**
   * Buscar búsquedas compatibles cuando no hay match exacto
   * Una búsqueda es compatible si es igual o más amplia que la solicitada
   */
  static findCompatibleCacheEntry(requestedFilters: any): SearchResult | null {
    try {
      const compatibleEntries: { entry: CacheEntry; score: number }[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(CACHE_PREFIX)) {
          try {
            const data = localStorage.getItem(key);
            if (!data) continue;
            
            const cacheEntry: CacheEntry = JSON.parse(data);
            
            // Verificar si no ha expirado
            if (Date.now() > cacheEntry.expiresAt) {
              continue;
            }
            
            // Verificar compatibilidad
            const compatibility = this.checkFilterCompatibility(requestedFilters, cacheEntry.filters);
            if (compatibility.isCompatible) {
              compatibleEntries.push({
                entry: cacheEntry,
                score: compatibility.score
              });
            }
            
          } catch (e) {
            // Ignorar entradas corruptas
          }
        }
      }
      
      // Ordenar por mejor score (más específico primero)
      compatibleEntries.sort((a, b) => b.score - a.score);
      
      if (compatibleEntries.length > 0) {
        const bestMatch = compatibleEntries[0];
        
        return {
          ...bestMatch.entry.data,
          cached: true,
          compatibleMatch: true
        };
      }
      
      return null;
      
    } catch (error) {
      console.warn('⚠️ [CACHE] Error buscando entradas compatibles:', error);
      return null;
    }
  }
  
  /**
   * Verificar si una búsqueda en cache es compatible con los filtros solicitados
   */
  static checkFilterCompatibility(requested: any, cached: any): { isCompatible: boolean; score: number } {
    let score = 0;
    let isCompatible = true;
    
    // Verificar campos obligatorios que deben coincidir exactamente
    const exactMatchFields = ['country', 'platform'];
    for (const field of exactMatchFields) {
      if (requested[field] && cached[field]) {
        if (requested[field] === cached[field]) {
          score += 10; // Bonus por match exacto
        } else {
          isCompatible = false;
          break;
        }
      } else if (requested[field] && !cached[field]) {
        // El solicitado tiene filtro pero el cache no - no compatible
        isCompatible = false;
        break;
      } else if (!requested[field] && cached[field]) {
        // El cache es más específico - puede ser útil
        score += 5;
      }
    }
    
    if (!isCompatible) {
      return { isCompatible: false, score: 0 };
    }
    
    // Verificar rangos numéricos (followers, engagement)
    const rangeFields = [
      { field: 'minFollowers', type: 'min' },
      { field: 'maxFollowers', type: 'max' },
      { field: 'minEngagement', type: 'min' },
      { field: 'maxEngagement', type: 'max' }
    ];
    
    for (const { field, type } of rangeFields) {
      if (requested[field] && cached[field]) {
        const reqValue = parseInt(requested[field]);
        const cachedValue = parseInt(cached[field]);
        
        if (type === 'min') {
          // Para mínimos: el cache debe tener un mínimo igual o menor
          if (cachedValue <= reqValue) {
            score += 3;
          } else {
            // Cache es más restrictivo - no compatible
            isCompatible = false;
            break;
          }
        } else {
          // Para máximos: el cache debe tener un máximo igual o mayor
          if (cachedValue >= reqValue) {
            score += 3;
          } else {
            // Cache es más restrictivo - no compatible
            isCompatible = false;
            break;
          }
        }
      } else if (requested[field] && !cached[field]) {
        // Solicitado tiene límite pero cache no - cache es más amplio (bueno)
        score += 2;
      } else if (!requested[field] && cached[field]) {
        // Cache tiene límite pero solicitado no - cache es más específico
        score += 1;
      }
    }
    
    return { isCompatible, score };
  }

  /**
   * Obtener búsqueda desde cache con fallback a búsquedas compatibles
   */
  static getCacheEntryWithFallback(filters: any): SearchResult | null {
    // Primero intentar match exacto
    const exactMatch = this.getCacheEntry(filters);
    if (exactMatch) {
      return exactMatch;
    }
    
    // Si no hay match exacto, buscar compatibles
    return this.findCompatibleCacheEntry(filters);
  }
}

// 🎯 Hook para usar cache híbrido en componentes
export const useExplorerCache = () => {
  const saveToCache = (filters: any, result: SearchResult) => {
    ExplorerCacheUtils.saveCacheEntry(filters, result);
  };

  const getFromCache = (filters: any): SearchResult | null => {
    return ExplorerCacheUtils.getCacheEntry(filters);
  };

  // 🎯 NUEVO: Búsqueda inteligente con fallback a compatibles
  const getFromCacheWithFallback = (filters: any): SearchResult | null => {
    return ExplorerCacheUtils.getCacheEntryWithFallback(filters);
  };

  const hasCache = (filters: any): boolean => {
    return ExplorerCacheUtils.hasCacheEntry(filters);
  };

  const clearCache = () => {
    ExplorerCacheUtils.clearAllCache();
  };

  const getStats = () => {
    return ExplorerCacheUtils.getCacheStats();
  };

  return {
    saveToCache,
    getFromCache,
    getFromCacheWithFallback, // 🎯 NUEVO
    hasCache,
    clearCache,
    getStats
  };
};
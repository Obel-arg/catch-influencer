import supabase from '../../config/supabase';
import CreatorDBService from './creator.service';

interface CacheCheckResult {
  cache_id?: string;
  search_hash?: string;
  expires_at?: string;
  pages_cached?: number;
  tokens_saved?: number;
}

interface SearchFilters {
  platform?: string;
  country?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  maxEngagement?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}

interface SearchResult {
  items: any[];
  page: number;
  size: number;
  count: number;
  hasNextPage?: boolean;
  cached: boolean;
  cacheInfo?: {
    hit: boolean;
    tokensUsed: number;
    searchHash: string;
    expiresAt: string;
  };
}

// Utilidad para normalizar filtros - OPTIMIZADA
function normalizeFilters(filters: Record<string, any>): Record<string, any> {
  console.log(`🔍 [NORMALIZE] Filtros originales:`, JSON.stringify(filters, null, 2));
  const normalized: Record<string, any> = {};
  
 
  Object.entries(filters).forEach(([key, value]) => {
    // Mapear parámetros del frontend a los esperados por el backend
    let newKey = key;
    if (key === 'location') newKey = 'country';
    if (key === 'mainCategory') newKey = 'category'; // ✅ NUEVO: Mapear mainCategory a category
    
   
    
    // ✅ MEJORADO: Preservar tipos de datos y filtrar valores inválidos más inteligentemente
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 'all'
    ) {
     
      return;
    }

    // ✅ OPTIMIZACIÓN: Convertir valores numéricos según el campo
    let normalizedValue = value;
    
    if (['minFollowers', 'maxFollowers'].includes(newKey)) {
      // Convertir a entero para campos de followers
      normalizedValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
      if (isNaN(normalizedValue) || normalizedValue <= 0) {
       
        return;
      }
    } else if (['minEngagement', 'maxEngagement'].includes(newKey)) {
      // Convertir a float para campos de engagement
      normalizedValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      if (isNaN(normalizedValue) || normalizedValue < 0) {
       
        return;
      }
    } else if (['page', 'size'].includes(newKey)) {
      // Convertir a entero para paginación
      normalizedValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
      if (isNaN(normalizedValue) || normalizedValue <= 0) {
       
        return;
      }
    } else if (['minGRateFollowers', 'maxGRateFollowers'].includes(newKey)) {
      // Convertir a float para campos de growth rate followers
      normalizedValue = typeof value === 'string' ? parseFloat(value) : Number(value);
      console.log(`🔍 [NORMALIZE] ${newKey}: ${value} → ${normalizedValue} (${typeof normalizedValue})`);
      if (isNaN(normalizedValue) || normalizedValue < 0) {
        console.log(`🔍 [NORMALIZE] ${newKey}: valor inválido, omitiendo`);
        return;
      }
    }
    
    normalized[newKey] = normalizedValue;
    console.log(`🔍 [NORMALIZE] Agregando ${newKey}: ${normalizedValue} (${typeof normalizedValue})`);
   
  });
  
 
  
  // Ordenar claves para consistencia de hash - OPTIMIZADO
  const sortedKeys = Object.keys(normalized).sort();
  const sortedNormalized: Record<string, any> = {};
  
  sortedKeys.forEach(key => {
    sortedNormalized[key] = normalized[key];
  });
  
  console.log(`🔍 [NORMALIZE] Filtros normalizados:`, JSON.stringify(sortedNormalized, null, 2));
  return sortedNormalized;
}

export class ExplorerCacheService {
  
  /**
   * Buscar influencers con sistema de caché inteligente
   */
  static async searchInfluencersWithCache(
    filters: SearchFilters,
    userId?: string,
    userEmail?: string
  ): Promise<SearchResult> {
    
    const startTime = Date.now();
    const { page = 1, size = 5, ...searchFilters } = filters;
    
    console.log(`🚀 [EXPLORER CACHE] Iniciando searchInfluencersWithCache - página ${page}`);
    
    try {
      // 1. Normalizar filtros antes de buscar en cache
      const normalizedFilters = normalizeFilters(searchFilters);
      
      // 1. Verificar si existe caché válido
      const checkCacheStartTime = Date.now();
      const cacheResult = await this.checkCache(normalizedFilters);
      const checkCacheEndTime = Date.now();
      console.log(`⏱️ [EXPLORER CACHE] checkCache completado en ${checkCacheEndTime - checkCacheStartTime}ms`);
      
      if (cacheResult && cacheResult.cache_id) {
        
        // Obtener resultados desde el caché
        const getCachedResultsStartTime = Date.now();
        const cachedResults = await this.getCachedResults(cacheResult.cache_id, page, size);
        const getCachedResultsEndTime = Date.now();
        console.log(`⏱️ [EXPLORER CACHE] getCachedResults completado en ${getCachedResultsEndTime - getCachedResultsStartTime}ms`);
        
        // Si no hay resultados para esta página específica, buscar en CreatorDB
        if (cachedResults.items.length === 0) {
          
          // 🎯 LOGGING DETALLADO PARA IDENTIFICAR CUELLO DE BOTELLA
          const creatorDBStartTime = Date.now();
          console.log(`🔍 [CACHE MISS] Iniciando búsqueda en CreatorDB para página ${page}`);
          
          // 🎯 NUEVA LÓGICA: CreatorDB ahora devuelve 25 IDs y procesa solo los 6 solicitados
          const newPageResult = await CreatorDBService.searchInfluencers({ ...normalizedFilters, page, size });
          
          const creatorDBEndTime = Date.now();
          console.log(`⏱️ [CACHE MISS] CreatorDB tardó ${creatorDBEndTime - creatorDBStartTime}ms`);
          const newPageCredits = this.estimateTokensUsed(newPageResult.items?.length || 0);
          
          // 🎯 NUEVA LÓGICA: Guardar resultados en caché solo si hay items
          if (newPageResult.items?.length > 0) {
            // 🎯 NUEVO: Usar el total real de IDs disponibles para determinar si hay más páginas
            const totalIdsAvailable = newPageResult.searchMeta?.totalIdsAvailable || newPageResult.count || 0;
            const hasNextPage = (page * size) < totalIdsAvailable;
            
            console.log(`📊 [CACHE SAVE] Guardando página ${page}: ${newPageResult.items.length} items, total IDs: ${totalIdsAvailable}, hasNextPage: ${hasNextPage}`);
            
            const saveCachedResultsStartTime = Date.now();
            await this.saveCachedResults(cacheResult.cache_id, page, size, newPageResult.items, hasNextPage, totalIdsAvailable);
            const saveCachedResultsEndTime = Date.now();
            console.log(`⏱️ [EXPLORER CACHE] saveCachedResults completado en ${saveCachedResultsEndTime - saveCachedResultsStartTime}ms`);
            
            // ✨ PREFETCH DINÁMICO: Precargar siguiente página si hay más IDs disponibles
            if (hasNextPage) {
              const nextPageNumber = page + 1;
              console.log(`🚀 [PREFETCH] Precargando página ${nextPageNumber} (hay ${totalIdsAvailable - (page * size)} IDs más disponibles)`);
              
              this.prefetchNextPage(normalizedFilters, cacheResult.cache_id, nextPageNumber, size).catch(error => {
                console.error(`⚠️ [PREFETCH] Error precargando página ${nextPageNumber}:`, error.message);
              });
            }
          }
          
          return {
            ...newPageResult,
            cached: false, // Esta página no estaba cacheada
            cacheInfo: {
              hit: false,
              tokensUsed: newPageCredits,
              searchHash: cacheResult.search_hash!,
              expiresAt: cacheResult.expires_at!
            }
          };
        }
        
        // Página encontrada en caché
        const cacheHitResult = {
          ...cachedResults,
          cached: true,
          cacheInfo: {
            hit: true,
            tokensUsed: 0, // No créditos usados en cache hit
            searchHash: cacheResult.search_hash!,
            expiresAt: cacheResult.expires_at!
          }
        };
        
        // ✨ PREFETCH INTELIGENTE DESDE CACHE - Verificar si necesitamos precargar páginas siguientes
        if (cachedResults.hasNextPage) {
          const nextPageNumber = page + 1;
          console.log(`📊 [PREFETCH CHECK CACHE] Verificando precarga desde cache: página actual=${page}, siguiente=${nextPageNumber}`);
          
          // Verificar si la siguiente página ya está en caché
          const nextPageCachedStartTime = Date.now();
          const nextPageCached = await this.getCachedResults(cacheResult.cache_id, nextPageNumber, size);
          const nextPageCachedEndTime = Date.now();
          console.log(`⏱️ [EXPLORER CACHE] getCachedResults (nextPage) completado en ${nextPageCachedEndTime - nextPageCachedStartTime}ms`);
          
          if (nextPageCached.items.length === 0) {
            // Solo precargar si la siguiente página no está en caché
            console.log(`🚀 [PREFETCH DESDE CACHE] Iniciando prefetch de página ${nextPageNumber} para búsqueda cacheada`);
            this.prefetchNextPage(normalizedFilters, cacheResult.cache_id, nextPageNumber, size).catch(error => {
              console.error(`⚠️ [PREFETCH CACHE] Error precargando página ${nextPageNumber}:`, error.message);
            });
          } else {
            console.log(`✅ [PREFETCH CACHE] Página ${nextPageNumber} ya está en caché, verificando página ${nextPageNumber + 1}`);
            
            // Si la siguiente página ya existe, verificar si hay UNA MÁS ALLÁ que precargar
            const pageAfterNext = nextPageNumber + 1;
            const pageAfterNextCachedStartTime = Date.now();
            const pageAfterNextCached = await this.getCachedResults(cacheResult.cache_id, pageAfterNext, size);
            const pageAfterNextCachedEndTime = Date.now();
            console.log(`⏱️ [EXPLORER CACHE] getCachedResults (pageAfterNext) completado en ${pageAfterNextCachedEndTime - pageAfterNextCachedStartTime}ms`);
            
            if (pageAfterNextCached.items.length === 0) {
              // Verificar si realmente hay más páginas disponibles consultando la base
              const { data: searchInfo } = await supabase
                .from('explorer_searches')
                .select('total_results, pages_cached')
                .eq('id', cacheResult.cache_id)
                .single();
              
              if (searchInfo) {
                const estimatedTotalPages = Math.ceil(searchInfo.total_results / size);
                
                if (pageAfterNext <= estimatedTotalPages) {
                  console.log(`🚀 [PREFETCH ADELANTADO] Precargando página ${pageAfterNext} (páginas estimadas: ${estimatedTotalPages})`);
                  this.prefetchNextPage(normalizedFilters, cacheResult.cache_id, pageAfterNext, size).catch(error => {
                    console.error(`⚠️ [PREFETCH ADELANTADO] Error precargando página ${pageAfterNext}:`, error.message);
                  });
                } else {
                  console.log(`ℹ️ [PREFETCH] No hay más páginas por precargar. Página solicitada: ${pageAfterNext}, Total estimado: ${estimatedTotalPages}`);
                }
              }
            } else {
              console.log(`✅ [PREFETCH] Páginas ${nextPageNumber} y ${pageAfterNext} ya están en caché`);
            }
          }
        } else {
          console.log(`ℹ️ [PREFETCH CACHE] No hay páginas siguientes disponibles desde cache para página ${page}`);
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`✅ [EXPLORER CACHE] searchInfluencersWithCache (CACHE HIT) completado en ${totalTime}ms`);
        return cacheHitResult;
      }
      
      // 🎯 LOGGING DETALLADO PARA CACHE MISS COMPLETO
      const creatorDBStartTime = Date.now();
      console.log(`🔍 [CACHE MISS COMPLETO] Iniciando búsqueda nueva en CreatorDB para página ${page}`);
      
      // 🎯 NUEVA LÓGICA: CreatorDB ahora devuelve 25 IDs y procesa solo los 6 solicitados
      const creatorDBResult = await CreatorDBService.searchInfluencers({ ...normalizedFilters, page, size });
      
      const creatorDBEndTime = Date.now();
      console.log(`⏱️ [CACHE MISS COMPLETO] CreatorDB tardó ${creatorDBEndTime - creatorDBStartTime}ms`);
      const creditsUsed = this.estimateTokensUsed(creatorDBResult.items?.length || 0);
      
      // 3. Guardar en caché la nueva búsqueda - ASÍNCRONO
      const saveSearchToCacheStartTime = Date.now();
      const searchId = await this.saveSearchToCache({
        searchFilters: normalizedFilters,
        totalResults: creatorDBResult.count || 0,
        tokensUsed: creditsUsed,
        userId,
        userEmail
      });
      const saveSearchToCacheEndTime = Date.now();
      console.log(`⏱️ [EXPLORER CACHE] saveSearchToCache completado en ${saveSearchToCacheEndTime - saveSearchToCacheStartTime}ms`);
      
      // 4. Guardar resultados paginados - ASÍNCRONO
      if (searchId && creatorDBResult.items?.length > 0) {
        // 🎯 NUEVA LÓGICA: Usar el total real de IDs disponibles
        const totalIdsAvailable = creatorDBResult.searchMeta?.totalIdsAvailable || creatorDBResult.count || 0;
        const hasNextPage = (page * size) < totalIdsAvailable;
        
        console.log(`📊 [CACHE SAVE] Guardando página ${page}: ${creatorDBResult.items.length} items, total IDs: ${totalIdsAvailable}, hasNextPage: ${hasNextPage}`);
        
        // 🚀 GUARDADO ASÍNCRONO: No esperar a que se guarde para mostrar resultados
        this.saveCachedResults(searchId, page, size, creatorDBResult.items, hasNextPage, totalIdsAvailable).then(() => {
          const saveCachedResultsEndTime = Date.now();
          console.log(`⏱️ [EXPLORER CACHE] saveCachedResults (nueva búsqueda) completado en ${saveCachedResultsEndTime - saveSearchToCacheStartTime}ms`);
        }).catch(error => {
          console.error(`❌ [EXPLORER CACHE] Error guardando cachedResults:`, error);
        });
        
        console.log(`📊 [PREFETCH CHECK] Evaluando prefetch: página=${page}, size=${size}, total=${totalIdsAvailable}, hasNextPage=${hasNextPage}`);
        
        // ✨ NUEVO: PREFETCH DINÁMICO - Siempre precargar la siguiente página si hay más resultados
        if (hasNextPage) {
          const nextPageNumber = page + 1;
          console.log(`🚀 [PREFETCH AUTOMÁTICO] Iniciando prefetch de página ${nextPageNumber} para búsqueda nueva`);
          console.log(`🔍 [PREFETCH] Datos: searchId=${searchId}, nextPage=${nextPageNumber}, size=${size}, hasNextPage=${hasNextPage}`);
          
          // Hacer prefetch en background sin bloquear la respuesta
          this.prefetchNextPage(normalizedFilters, searchId, nextPageNumber, size).catch(error => {
            console.error(`⚠️ [PREFETCH] Error precargando página ${nextPageNumber}:`, error.message);
          });
        } else {
          console.log(`ℹ️ [PREFETCH] No hay páginas siguientes para precargar. Total resultados: ${totalIdsAvailable}, página actual: ${page}, tamaño: ${size}`);
        }
      }
      
      const generateSearchHashStartTime = Date.now();
      const searchHash = await this.generateSearchHash(normalizedFilters);
      const generateSearchHashEndTime = Date.now();
      console.log(`⏱️ [EXPLORER CACHE] generateSearchHash completado en ${generateSearchHashEndTime - generateSearchHashStartTime}ms`);
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ [EXPLORER CACHE] searchInfluencersWithCache (CACHE MISS) completado en ${totalTime}ms`);
      
      return {
        ...creatorDBResult,
        cached: false,
        cacheInfo: {
          hit: false,
          tokensUsed: creditsUsed,
          searchHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      
    } catch (error) {
      console.error('❌ Error in searchInfluencersWithCache:', error);
      
      // Fallback: si falla el caché, usar búsqueda directa
      const fallbackResult = await CreatorDBService.searchInfluencers(filters);
      const fallbackCredits = this.estimateTokensUsed(fallbackResult.items?.length || 0);
      return {
        ...fallbackResult,
        cached: false,
        cacheInfo: {
          hit: false,
          tokensUsed: fallbackCredits,
          searchHash: '',
          expiresAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * ✨ PREFETCH DINÁMICO: Precargar cualquier página siguiente en background
   */
  private static async prefetchNextPage(
    filters: SearchFilters, 
    searchId: string, 
    nextPage: number, 
    pageSize: number
  ): Promise<void> {
    try {
      const prefetchStartTime = Date.now();
      console.log(`🔄 [PREFETCH] Iniciando precarga de página ${nextPage} en background...`);
      
      // Pequeño delay para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`🔍 [PREFETCH] Buscando página ${nextPage} en CreatorDB...`);
      
      // Buscar la siguiente página en CreatorDB
      const prefetchCreatorDBStartTime = Date.now();
      const nextPageResult = await CreatorDBService.searchInfluencers({ 
        ...filters, 
        page: nextPage, 
        size: pageSize 
      });
      const prefetchCreatorDBEndTime = Date.now();
      console.log(`⏱️ [PREFETCH] CreatorDB.searchInfluencers completado en ${prefetchCreatorDBEndTime - prefetchCreatorDBStartTime}ms`);
      
      if (nextPageResult.items?.length > 0) {
        const hasNextPage = (nextPage * pageSize) < (nextPageResult.count || 0);
        
        console.log(`✅ [PREFETCH] Página ${nextPage} obtenida: ${nextPageResult.items.length} influencers`);
        
                 // Guardar en caché
         const prefetchSaveStartTime = Date.now();
         await this.saveCachedResults(
           searchId, 
           nextPage, 
           pageSize, 
           nextPageResult.items, 
           hasNextPage, 
           nextPageResult.count || 0
         );
         const prefetchSaveEndTime = Date.now();
         console.log(`⏱️ [PREFETCH] saveCachedResults completado en ${prefetchSaveEndTime - prefetchSaveStartTime}ms`);
         
         const prefetchTotalTime = Date.now() - prefetchStartTime;
         console.log(`✅ [PREFETCH] prefetchNextPage completado en ${prefetchTotalTime}ms`);
      } else {
        console.warn(`⚠️ [PREFETCH] Página ${nextPage} no devolvió resultados`);
      }
      
    } catch (error) {
      console.error(`❌ [PREFETCH] Error en prefetch de página ${nextPage}:`, error);
      throw error;
    }
  }
  
  /**
   * Método público para verificar si existe caché válido para los filtros dados
   */
  static async checkCacheStatus(filters: SearchFilters): Promise<CacheCheckResult | null> {
    return this.checkCache(filters);
  }

  /**
   * Verificar si existe caché válido para los filtros dados
   */
  private static async checkCache(filters: SearchFilters): Promise<CacheCheckResult | null> {
    try {
      // Normalizar filtros antes de buscar en cache
      const normalizedFilters = normalizeFilters(filters);
      const { data, error } = await supabase
        .rpc('check_search_cache', { search_filters: normalizedFilters });
      
      if (error) {
        console.error('Error checking cache:', error);
        return null;
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error in checkCache:', error);
      return null;
    }
  }
  
  /**
   * Obtener resultados cacheados para una página específica
   */
  private static async getCachedResults(searchId: string, page: number, size: number): Promise<SearchResult> {
    try {
      const { data, error } = await supabase
        .from('explorer_search_results')
        .select('influencers_data, total_results_in_page, has_next_page')
        .eq('search_id', searchId)
        .eq('page_number', page)
        .single();
      
      if (error || !data) {
        return { items: [], page, size, count: 0, cached: true };
      }
      
      // Los datos están guardados como JSONB en influencers_data
      const items = Array.isArray(data.influencers_data) ? data.influencers_data : [];
      
      // Obtener información total de la búsqueda original
      const { data: searchData } = await supabase
        .from('explorer_searches')
        .select('total_results')
        .eq('id', searchId)
        .single();
      
      const totalResults = searchData?.total_results || 0;
      
      return {
        items,
        page,
        size, 
        count: totalResults, // Usar el total original de CreatorDB
        hasNextPage: data.has_next_page || false,
        cached: true
      };
      
    } catch (error) {
      console.error('Error getting cached results:', error);
      return { items: [], page, size, count: 0, cached: true };
    }
  }
  
  /**
   * Guardar nueva búsqueda en caché
   */
  private static async saveSearchToCache(params: {
    searchFilters: SearchFilters;
    totalResults: number;
    tokensUsed: number;
    userId?: string;
    userEmail?: string;
  }): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .rpc('save_search_cache', {
          search_filters: params.searchFilters,
          total_results: params.totalResults,
          tokens_used: params.tokensUsed,
          api_calls: 1,
          estimated_cost: params.tokensUsed * 0.001, // Estimación de costo por crédito
          user_id: params.userId || null,
          user_email: params.userEmail || null
        });
      
      if (error) {
        console.error('Error saving search to cache:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in saveSearchToCache:', error);
      return null;
    }
  }
  
  /**
   * Guardar resultados paginados en caché (con UPSERT para evitar duplicados)
   */
  private static async saveCachedResults(
    searchId: string, 
    page: number, 
    size: number, 
    items: any[],
    hasNextPage?: boolean,
    totalCount?: number
  ): Promise<void> {
    try {
      // Extraer solo los IDs de los influencers 
      const influencerIds = items.map(item => item.creatorId).filter(Boolean);
      
      // Calcular has_next_page correctamente
      const calculatedHasNextPage = hasNextPage !== undefined 
        ? hasNextPage 
        : totalCount ? (page * size) < totalCount : items.length === size;
      
      // Usar UPSERT para evitar errores de clave duplicada
      const { error } = await supabase
        .from('explorer_search_results')
        .upsert({
          search_id: searchId,
          page_number: page,
          page_size: size,
          influencer_ids: influencerIds,
          influencers_data: items, // Guardar data completa como JSONB
          total_results_in_page: items.length,
          has_next_page: calculatedHasNextPage,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'search_id,page_number'
        });
      
      if (error) {
        console.error('Error saving cached results:', error);
      } else {
        
        // Actualizar contador de páginas cacheadas
        await supabase.rpc('increment_pages_cached', { 
          search_uuid: searchId 
        });
      }
      
    } catch (error) {
      console.error('Error in saveCachedResults:', error);
    }
  }
  
  /**
   * Generar hash único para filtros de búsqueda
   */
  private static async generateSearchHash(filters: SearchFilters): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('generate_search_hash', { filters });
      
      if (error) {
        console.error('Error generating search hash:', error);
        return 'error_hash';
      }
      
      return data || 'error_hash';
    } catch (error) {
      console.error('Error in generateSearchHash:', error);
      return 'error_hash';
    }
  }
  
  /**
   * Estimar créditos usados basado en número de influencers (según documentación CreatorDB)
   */
  private static estimateTokensUsed(influencerCount: number): number {
    // Costos REALES según documentación CreatorDB:
    // - youtubeAdvancedSearch: 1 crédito (búsqueda inicial)
    // - youtubeBasic: 2 créditos por influencer
    // - instagramBasic: 2 créditos por influencer (estimado)
    // - tiktokBasic: 2 créditos por influencer (estimado)
    
    const initialSearchCredits = 1; // youtubeAdvancedSearch
    const creditsPerInfluencer = 6; // YouTube (2) + Instagram (2) + TikTok (2)
    
    return initialSearchCredits + (influencerCount * creditsPerInfluencer);
  }
  
  /**
   * Obtener estadísticas del caché
   */
  static async getCacheAnalytics(daysBack: number = 30) {
    try {
      const { data, error } = await supabase
        .rpc('get_cache_analytics', { days_back: daysBack });
      
      if (error) {
        console.error('Error getting cache analytics:', error);
        return null;
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error in getCacheAnalytics:', error);
      return null;
    }
  }
  
  /**
   * Obtener búsquedas populares
   */
  static async getPopularSearches(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('explorer_searches')
        .select(`
          search_filters,
          tokens_used,
          created_at,
          last_accessed_at
        `)
        .order('last_accessed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error getting popular searches:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getPopularSearches:', error);
      return [];
    }
  }
}

export default ExplorerCacheService; 
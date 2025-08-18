// Sistema de cache avanzado para optimizar performance del Explorer
// Implementa TTL, invalidación inteligente y políticas específicas por endpoint

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en miliseconds
  hits: number;
  key: string;
  tags: string[]; // Para invalidación por tags
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableCompression: boolean;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    invalidations: 0,
    evictions: 0
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutos por defecto
      maxSize: 1000,
      enableCompression: false,
      ...config
    };

    // Cleanup periódico cada 2 minutos
    setInterval(() => this.cleanup(), 2 * 60 * 1000);
  }

  // Generar key de cache basada en URL y parámetros
  private generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${btoa(paramString)}`;
  }

  // 🚀 OPTIMIZACIÓN: TTL específico por tipo de endpoint más agresivo para datos estáticos
  private getTTLForEndpoint(url: string): number {
    if (url.includes('/creator/explorer/search')) {
      return 8 * 60 * 1000; // 8 minutos para búsquedas
    }
    if (url.includes('/influencers/full/')) {
      return 30 * 60 * 1000; // 🚀 30 minutos para perfiles completos (datos estáticos)
    }
    if (url.includes('/sentiment_analysis') || url.includes('/sentiment-analysis')) {
      return 15 * 60 * 1000; // 🚀 15 minutos para análisis de sentimientos (datos que no cambian frecuentemente)
    }
    if (url.includes('/post-topics') && url.includes('/keywords')) {
      return 20 * 60 * 1000; // 🚀 20 minutos para keywords (datos estáticos)
    }
    if (url.includes('/campaigns')) {
      // 🚀 TTL más agresivo para campañas con métricas pre-calculadas
      if (url.includes('/my-campaigns-with-metrics')) {
        return 10 * 60 * 1000; // 🚀 10 minutos para campaigns with metrics (datos más estables)
      }
      return 5 * 60 * 1000; // 🚀 5 minutos para campañas normales
    }
    if (url.includes('/influencer-posts/campaign/') && url.includes('/metrics')) {
      return 3 * 60 * 1000; // 🚀 3 minutos para métricas de posts (más tiempo para evitar spam)
    }
    if (url.includes('/influencer-posts/')) {
      return 8 * 60 * 1000; // 🚀 8 minutos para posts de influencers
    }
    if (url.includes('/campaign-influencers/campaign/')) {
      return 6 * 60 * 1000; // 🚀 6 minutos para influencers de campaña
    }
    return this.config.defaultTTL;
  }

  // Tags para invalidación inteligente
  private getTagsForEndpoint(url: string, params?: Record<string, any>): string[] {
    const tags: string[] = [];
    
    if (url.includes('/creator/explorer/search')) {
      tags.push('search');
      if (params?.platform) tags.push(`platform:${params.platform}`);
      if (params?.country) tags.push(`country:${params.country}`);
    }
    
    if (url.includes('/influencers/')) {
      tags.push('influencers');
    }
    
    if (url.includes('/campaigns')) {
      tags.push('campaigns');
    }
    
    if (url.includes('/influencer-posts/')) {
      tags.push('influencer-posts');
      // Extraer campaignId de la URL para invalidación específica por campaña
      const campaignMatch = url.match(/\/campaign\/([^\/]+)/);
      if (campaignMatch) {
        tags.push(`campaign:${campaignMatch[1]}`);
      }
      // Extraer influencerId de la URL para invalidación específica por influencer
      const influencerMatch = url.match(/\/influencer\/([^\/]+)/);
      if (influencerMatch) {
        tags.push(`influencer:${influencerMatch[1]}`);
      }
    }
    
    if (url.includes('/campaign-influencers/campaign/')) {
      tags.push('campaign-influencers');
      // Extraer campaignId de la URL para invalidación específica por campaña
      const campaignMatch = url.match(/\/campaign\/([^\/]+)/);
      if (campaignMatch) {
        tags.push(`campaign:${campaignMatch[1]}`);
      }
    }
    
    return tags;
  }

  // Obtener datos del cache
  public get<T>(url: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Verificar TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Incrementar hits y actualizar estadísticas
    entry.hits++;
    this.stats.hits++;
    
    return entry.data as T;
  }

  // Guardar datos en cache
  public set<T>(url: string, data: T, params?: Record<string, any>, customTTL?: number): void {
    const key = this.generateKey(url, params);
    const ttl = customTTL || this.getTTLForEndpoint(url);
    const tags = this.getTagsForEndpoint(url, params);
    
    // Si estamos al límite, eliminar entradas menos usadas
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      key,
      tags
    };
    
    this.cache.set(key, entry);
  }

  // Invalidar cache por tags
  public invalidateByTags(tags: string[]): void {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    this.stats.invalidations += invalidated;
  }

  // Invalidar cache específico
  public invalidate(url: string, params?: Record<string, any>): void {
    const key = this.generateKey(url, params);
    if (this.cache.delete(key)) {
      this.stats.invalidations++;
    }
  }

  // Limpiar cache expirado
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
    }
  }

  // Evitar entradas menos usadas cuando el cache está lleno
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastHits = Infinity;
    
    for (const [key, entry] of this.cache) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      this.stats.evictions++;
    }
  }

  // Obtener estadísticas del cache
  public getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;
    
    return {
      ...this.stats,
      hitRate: parseFloat(hitRate.toFixed(2)),
      cacheSize: this.cache.size,
      maxSize: this.config.maxSize
    };
  }

  // Limpiar todo el cache
  public clear(): void {
    this.cache.clear();
  }

  // Prefetch inteligente basado en patrones de uso
  public prefetch(url: string, params?: Record<string, any>): void {
    // Solo prefetch si no está en cache
    if (!this.get(url, params)) {
      // El prefetch actual se implementará en el httpInterceptor
    }
  }
}

// Instancia global del cache manager
export const cacheManager = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  maxSize: 500, // 500 entradas máximo
  enableCompression: false
});

// Utilidades para invalidación específica
export const CacheInvalidators = {
  // Invalidar búsquedas cuando cambian filtros críticos
  onFiltersChange: (oldFilters: any, newFilters: any) => {
    const criticalFields = ['platform', 'country', 'category'];
    const hasChanges = criticalFields.some(field => oldFilters[field] !== newFilters[field]);
    
    if (hasChanges) {
      cacheManager.invalidateByTags(['search']);
    }
  },

  // Invalidar perfil cuando se actualiza
  onInfluencerUpdate: (influencerId: string) => {
    cacheManager.invalidateByTags(['influencers', `influencer:${influencerId}`]);
  },

  // Invalidar campañas cuando se modifica
  onCampaignUpdate: (campaignId?: string) => {
    if (campaignId) {
      cacheManager.invalidateByTags(['campaigns', `campaign:${campaignId}`]);
    } else {
    cacheManager.invalidateByTags(['campaigns']);
    }
  },

  // Invalidar posts cuando se crean/actualizan/eliminan
  onPostUpdate: (campaignId?: string, influencerId?: string) => {
    const tags = ['influencer-posts'];
    if (campaignId) tags.push(`campaign:${campaignId}`);
    if (influencerId) tags.push(`influencer:${influencerId}`);
    cacheManager.invalidateByTags(tags);
  },

  // Invalidar influencers de campaña cuando se modifica
  onCampaignInfluencersUpdate: (campaignId: string) => {
    cacheManager.invalidateByTags(['campaign-influencers', `campaign:${campaignId}`]);
  },

  // Invalidar métricas cuando se actualizan
  onMetricsUpdate: (campaignId?: string, influencerId?: string) => {
    const tags = ['influencer-posts'];
    if (campaignId) tags.push(`campaign:${campaignId}`);
    if (influencerId) tags.push(`influencer:${influencerId}`);
    cacheManager.invalidateByTags(tags);
  }
};

// Función para debug del cache desde la consola del navegador
export const getCacheDebugInfo = () => {
  const stats = cacheManager.getStats();
  const cacheEntries: Array<{
    key: string;
    tags: string[];
    hits: number;
    ttl: number;
    age: number;
    expired: boolean;
  }> = [];
  
  for (const [key, entry] of (cacheManager as any).cache.entries()) {
    cacheEntries.push({
      key,
      tags: entry.tags,
      hits: entry.hits,
      ttl: entry.ttl,
      age: Date.now() - entry.timestamp,
      expired: Date.now() - entry.timestamp > entry.ttl
    });
  }
  
  return {
    stats,
    entries: cacheEntries,
    influencerPostsEntries: cacheEntries.filter(e => e.tags.includes('influencer-posts')),
    campaignEntries: cacheEntries.filter(e => e.tags.includes('campaigns')),
    totalSize: cacheEntries.length
  };
};

// Función global para debug desde consola del navegador
if (typeof window !== 'undefined') {
  (window as any).getCacheDebugInfo = getCacheDebugInfo;
  (window as any).cacheManager = cacheManager;
  (window as any).CacheInvalidators = CacheInvalidators;
} 
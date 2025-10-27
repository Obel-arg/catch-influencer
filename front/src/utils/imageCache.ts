// 🎯 SISTEMA DE CACHE CENTRALIZADO PARA IMÁGENES
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

interface CacheEntry {
  url: string;
  timestamp: number;
  processedUrl: string;
}

abstract class BaseImageCache {
  protected cache: Map<string, CacheEntry> = new Map();
  protected cacheKey: string;

  constructor(cacheKey: string) {
    this.cacheKey = cacheKey;
    this.loadFromStorage();
  }

  protected loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.cacheKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Limpiar entradas expiradas
        Object.entries(data).forEach(([key, entry]: [string, any]) => {
          if (now - entry.timestamp < CACHE_EXPIRY) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.error(`Error loading ${this.cacheKey} from storage:`, error);
    }
  }

  protected saveToStorage() {
    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem(this.cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${this.cacheKey} to storage:`, error);
    }
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_EXPIRY) {
      return entry.processedUrl;
    }
    return null;
  }

  set(key: string, processedUrl: string) {
    const entry: CacheEntry = {
      url: key,
      timestamp: Date.now(),
      processedUrl
    };
    this.cache.set(key, entry);
    this.saveToStorage();
  }

  clear() {
    this.cache.clear();
    localStorage.removeItem(this.cacheKey);
  }

  // Método para obtener estadísticas del cache
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      cacheKey: this.cacheKey
    };
  }
}

// 🎯 CACHE PARA INSTAGRAM
class InstagramImageCache extends BaseImageCache {
  private static instance: InstagramImageCache;

  static getInstance(): InstagramImageCache {
    if (!InstagramImageCache.instance) {
      InstagramImageCache.instance = new InstagramImageCache();
    }
    return InstagramImageCache.instance;
  }

  private constructor() {
    super('instagram_images_cache');
  }
}

// 🎯 CACHE PARA TIKTOK
class TikTokImageCache extends BaseImageCache {
  private static instance: TikTokImageCache;

  static getInstance(): TikTokImageCache {
    if (!TikTokImageCache.instance) {
      TikTokImageCache.instance = new TikTokImageCache();
    }
    return TikTokImageCache.instance;
  }

  private constructor() {
    super('tiktok_images_cache');
  }
}

// 🎯 CACHE PARA YOUTUBE
class YouTubeImageCache extends BaseImageCache {
  private static instance: YouTubeImageCache;

  static getInstance(): YouTubeImageCache {
    if (!YouTubeImageCache.instance) {
      YouTubeImageCache.instance = new YouTubeImageCache();
    }
    return YouTubeImageCache.instance;
  }

  private constructor() {
    super('youtube_images_cache');
  }
}

// 🎯 FUNCIONES DE UTILIDAD PARA GESTIONAR EL CACHE
export const ImageCacheManager = {
  // Obtener instancias de cache
  getInstagramCache: () => InstagramImageCache.getInstance(),
  getTikTokCache: () => TikTokImageCache.getInstance(),
  getYouTubeCache: () => YouTubeImageCache.getInstance(),

  // Limpiar todos los caches
  clearAllCaches: () => {
    InstagramImageCache.getInstance().clear();
    TikTokImageCache.getInstance().clear();
    YouTubeImageCache.getInstance().clear();
    
  },

  // Obtener estadísticas de todos los caches
  getAllCacheStats: () => {
    return {
      instagram: InstagramImageCache.getInstance().getStats(),
      tiktok: TikTokImageCache.getInstance().getStats(),
      youtube: YouTubeImageCache.getInstance().getStats()
    };
  },

  // Limpiar caches expirados automáticamente
  cleanupExpiredCaches: () => {
    const now = Date.now();
    const caches = [
      InstagramImageCache.getInstance(),
      TikTokImageCache.getInstance(),
      YouTubeImageCache.getInstance()
    ];

    caches.forEach(cache => {
      const stats = cache.getStats();   
      
    });
  }
};

// 🎯 EXPORTAR LAS CLASES PARA USO DIRECTO
export { InstagramImageCache, TikTokImageCache, YouTubeImageCache }; 
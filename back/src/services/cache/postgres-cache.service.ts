import supabase from '../../config/supabase';

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export class PostgresCacheService {
  private static instance: PostgresCacheService;

  private constructor() {}

  public static getInstance(): PostgresCacheService {
    if (!PostgresCacheService.instance) {
      PostgresCacheService.instance = new PostgresCacheService();
    }
    return PostgresCacheService.instance;
  }

  /**
   * Set a value in cache with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      
      const { error } = await supabase
        .from('cache_entries')
        .upsert({
          key,
          value: JSON.stringify(value),
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('❌ [POSTGRES-CACHE] Error setting cache:', error);
        throw error;
      }

    } catch (error) {
      console.error('❌ [POSTGRES-CACHE] Failed to set cache:', error);
      throw error;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from('cache_entries')
        .select('*')
        .eq('key', key)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null;
        }
        console.error('❌ [POSTGRES-CACHE] Error getting cache:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return JSON.parse(data.value);
    } catch (error) {
      console.error('❌ [POSTGRES-CACHE] Failed to get cache:', error);
      return null;
    }
  }

  /**
   * Delete a cache entry
   */
  async del(key: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cache_entries')
        .delete()
        .eq('key', key);

      if (error) {
        console.error('❌ [POSTGRES-CACHE] Error deleting cache:', error);
        throw error;
      }

    } catch (error) {
      console.error('❌ [POSTGRES-CACHE] Failed to delete cache:', error);
      throw error;
    }
  }

  /**
   * Delete multiple cache entries by pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const sqlPattern = pattern
        .replace(/\*/g, '%')
        .replace(/\?/g, '_');

      const { data, error } = await supabase
        .from('cache_entries')
        .select('key')
        .like('key', sqlPattern);

      if (error) {
        console.error('❌ [POSTGRES-CACHE] Error finding cache keys:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      const keys = data.map(entry => entry.key);
      
      const { error: deleteError } = await supabase
        .from('cache_entries')
        .delete()
        .in('key', keys);

      if (deleteError) {
        console.error('❌ [POSTGRES-CACHE] Error deleting cache keys:', deleteError);
        throw deleteError;
      }

      return keys.length;
    } catch (error) {
      console.error('❌ [POSTGRES-CACHE] Failed to delete cache pattern:', error);
      throw error;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const sqlPattern = pattern
        .replace(/\*/g, '%')
        .replace(/\?/g, '_');

      const { data, error } = await supabase
        .from('cache_entries')
        .select('key')
        .like('key', sqlPattern)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        console.error('❌ [POSTGRES-CACHE] Error getting cache keys:', error);
        throw error;
      }

      return data?.map(entry => entry.key) || [];
    } catch (error) {
      console.error('❌ [POSTGRES-CACHE] Failed to get cache keys:', error);
      return [];
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('cache_entries')
        .select('key')
        .eq('key', key)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return false;
        }
        console.error('❌ [POSTGRES-CACHE] Error checking cache existence:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('❌ [POSTGRES-CACHE] Failed to check cache existence:', error);
      return false;
    }
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      
      const { data, error } = await supabase
        .from('cache_entries')
        .update({
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return false;
        }
        console.error('❌ [POSTGRES-CACHE] Error setting expiration:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('❌ [POSTGRES-CACHE] Failed to set expiration:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    activeEntries: number;
    totalSize: number;
  }> {
    try {
      // Get total entries
      const { count: totalEntries } = await supabase
        .from('cache_entries')
        .select('*', { count: 'exact', head: true });

      // Get expired entries
      const { count: expiredEntries } = await supabase
        .from('cache_entries')
        .select('*', { count: 'exact', head: true })
        .lt('expires_at', new Date().toISOString());

      // Get active entries
      const { count: activeEntries } = await supabase
        .from('cache_entries')
        .select('*', { count: 'exact', head: true })
        .gt('expires_at', new Date().toISOString());

      // Get total size (approximate)
      const { data: sizeData } = await supabase
        .from('cache_entries')
        .select('value')
        .gt('expires_at', new Date().toISOString());

      const totalSize = sizeData?.reduce((acc, entry) => {
        return acc + (entry.value ? JSON.stringify(entry.value).length : 0);
      }, 0) || 0;

      return {
        totalEntries: totalEntries || 0,
        expiredEntries: expiredEntries || 0,
        activeEntries: activeEntries || 0,
        totalSize
      };
    } catch (error) {
      console.error('❌ [POSTGRES-CACHE] Failed to get stats:', error);
      return {
        totalEntries: 0,
        expiredEntries: 0,
        activeEntries: 0,
        totalSize: 0
      };
    }
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('cache_entries')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('key');

      if (error) {
        console.error('❌ [POSTGRES-CACHE] Error cleaning up expired entries:', error);
        throw error;
      }

      const deletedCount = data?.length || 0;
      return deletedCount;
    } catch (error) {
      console.error('❌ [POSTGRES-CACHE] Failed to cleanup:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const postgresCacheService = PostgresCacheService.getInstance(); 
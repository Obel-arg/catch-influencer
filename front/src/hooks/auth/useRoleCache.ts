import { useState, useEffect, useCallback } from 'react';
import { UserRole } from '@/types/users';

export interface CachedRoleData {
  role: UserRole;
  organizationId: string;
  organizationName: string;
  permissions: string[];
  cachedAt: string;
  expiresAt: string;
}

const ROLE_CACHE_KEY = 'userRoleCache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

export const useRoleCache = () => {
  const [cachedRole, setCachedRole] = useState<CachedRoleData | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar rol desde caché al inicializar
  useEffect(() => {
    loadRoleFromCache();
  }, []);

  const loadRoleFromCache = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const cached = localStorage.getItem(ROLE_CACHE_KEY);
      if (!cached) {
        setLoading(false);
        return;
      }

      const roleData: CachedRoleData = JSON.parse(cached);
      
      // Verificar si el caché ha expirado
      if (new Date() > new Date(roleData.expiresAt)) {  
        localStorage.removeItem(ROLE_CACHE_KEY);
        setCachedRole(null);
        setLoading(false);
        return;
      }

      
      setCachedRole(roleData);
    } catch (error) {
      console.error('❌ Error cargando rol desde caché:', error);
      localStorage.removeItem(ROLE_CACHE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRoleToCache = useCallback((roleData: Omit<CachedRoleData, 'cachedAt' | 'expiresAt'>) => {
    if (typeof window === 'undefined') return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION);

    const cacheData: CachedRoleData = {
      ...roleData,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    try {
      localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(cacheData));
      setCachedRole(cacheData);
      
    } catch (error) {
      console.error('❌ Error guardando rol en caché:', error);
    }
  }, []);

  const clearRoleCache = useCallback(() => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(ROLE_CACHE_KEY);
    setCachedRole(null);
      
  }, []);

  const refreshRoleCache = useCallback(() => {
    clearRoleCache();
    loadRoleFromCache();
  }, [clearRoleCache, loadRoleFromCache]);

  const isRoleCached = useCallback(() => {
    return cachedRole !== null && new Date() < new Date(cachedRole.expiresAt);
  }, [cachedRole]);

  const getCachedRole = useCallback((): UserRole | null => {
    if (!isRoleCached()) return null;
    return cachedRole?.role || null;
  }, [cachedRole, isRoleCached]);

  const isMember = useCallback(() => {
    const role = getCachedRole();
    return role === 'member';
  }, [getCachedRole]);

  const isAdmin = useCallback(() => {
    const role = getCachedRole();
    return role === 'admin';
  }, [getCachedRole]);

  const isOwner = useCallback(() => {
    const role = getCachedRole();
    return role === 'owner';
  }, [getCachedRole]);

  const isViewer = useCallback(() => {
    const role = getCachedRole();
    return role === 'viewer';
  }, [getCachedRole]);

  const hasAccess = useCallback(() => {
    const role = getCachedRole();
    return role !== null && role !== 'member';
  }, [getCachedRole]);

  return {
    cachedRole,
    loading,
    isRoleCached,
    getCachedRole,
    saveRoleToCache,
    clearRoleCache,
    refreshRoleCache,
    isMember,
    isAdmin,
    isOwner,
    isViewer,
    hasAccess,
  };
}; 
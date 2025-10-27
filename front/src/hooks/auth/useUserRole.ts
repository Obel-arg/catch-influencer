import { useState, useEffect } from 'react';
import { authService } from '@/lib/services/auth';
import { useRoleCache } from './useRoleCache';

export interface UserRoleData {
  role: 'owner' | 'admin' | 'member' | 'viewer';
  organizationId: string;
  organizationName: string;
}

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar el caché de roles
  const {
    cachedRole,
    loading: cacheLoading,
    isRoleCached,
    getCachedRole,
    saveRoleToCache,
    clearRoleCache,
    isMember: cacheIsMember,
    isAdmin: cacheIsAdmin,
    isOwner: cacheIsOwner,
    isViewer: cacheIsViewer,
    hasAccess: cacheHasAccess,
  } = useRoleCache();

  const fetchUserRole = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.getCurrentUser();
      let user, organizations;
      
      if ('user' in response && 'organizations' in response) {
        user = response.user;
        organizations = response.organizations;
      } else {
        user = response;
        organizations = [];
      }

      if (!user || !organizations || organizations.length === 0) {
        setUserRole(null);
        clearRoleCache();
        return;
      }

      // Verificar si el usuario es EXCLUSIVAMENTE member en todas sus organizaciones
      const isOnlyMember = organizations.every((org: any) => org.member?.role === 'member');
      
      // Si es EXCLUSIVAMENTE member, usar el rol member
      // Si no, usar el rol más alto que tenga (owner > admin > viewer > member)
      let highestRole: 'owner' | 'admin' | 'member' | 'viewer' = 'member';
      let primaryOrg = organizations[0];
      
      // Función helper para obtener el rol más alto
      const getRolePriority = (role: string): number => {
        switch (role) {
          case 'owner': return 4;
          case 'admin': return 3;
          case 'viewer': return 2;
          case 'member': return 1;
          default: return 0;
        }
      };
      
      for (const org of organizations) {
        const role = org.member?.role;
        if (role && getRolePriority(role) > getRolePriority(highestRole)) {
          highestRole = role as 'owner' | 'admin' | 'member' | 'viewer';
          primaryOrg = org;
        }
      }
      
      // Si es EXCLUSIVAMENTE member, usar member, sino usar el rol más alto
      const finalRole: 'owner' | 'admin' | 'member' | 'viewer' = isOnlyMember ? 'member' : highestRole;
      
      const roleData = {
        role: finalRole,
        organizationId: primaryOrg.id,
        organizationName: primaryOrg.name
      };
      
      setUserRole(roleData);
      
      // Guardar en caché
      saveRoleToCache({
        role: finalRole,
        organizationId: primaryOrg.id,
        organizationName: primaryOrg.name,
        permissions: [], // Por ahora vacío, se puede expandir después
      });
      
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener el rol del usuario');
      setUserRole(null);
      clearRoleCache();
    } finally {
      setLoading(false);
    }
  };

  // Cargar rol desde caché primero, luego del backend si es necesario
  useEffect(() => {
    const initializeRole = async () => {
      // Si hay caché válido, usarlo
      if (isRoleCached() && cachedRole) {
          
        setUserRole({
          role: cachedRole.role,
          organizationId: cachedRole.organizationId,
          organizationName: cachedRole.organizationName,
        });
        setLoading(false);
        return;
      }

      // Si no hay caché o expiró, obtener del backend
      
      await fetchUserRole();
    };

    if (!cacheLoading) {
      initializeRole();
    }
  }, [cacheLoading, isRoleCached, cachedRole]);

  // Métodos que usan caché primero, luego fallback al estado local
  const isMember = () => {
    if (isRoleCached()) return cacheIsMember();
    if (!userRole) return false;
    return userRole.role === 'member';
  };
  
  const isAdmin = () => {
    if (isRoleCached()) return cacheIsAdmin();
    if (!userRole) return false;
    return userRole.role === 'admin';
  };
  
  const isOwner = () => {
    if (isRoleCached()) return cacheIsOwner();
    if (!userRole) return false;
    return userRole.role === 'owner';
  };
  
  const isViewer = () => {
    if (isRoleCached()) return cacheIsViewer();
    if (!userRole) return false;
    return userRole.role === 'viewer';
  };
  
  const hasAccess = () => {
    if (isRoleCached()) return cacheHasAccess();
    if (!userRole) return false;
    return userRole.role !== 'member';
  };

  return {
    userRole,
    loading: loading || cacheLoading,
    error,
    isMember,
    isAdmin,
    isOwner,
    isViewer,
    hasAccess,
    refetch: fetchUserRole,
    clearCache: clearRoleCache,
  };
}; 
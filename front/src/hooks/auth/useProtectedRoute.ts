import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleCache } from './useRoleCache';
import { UserRole } from '@/types/users';

interface UseProtectedRouteOptions {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  requireRole?: boolean;
}

export const useProtectedRoute = (options: UseProtectedRouteOptions = {}) => {
  const {
    allowedRoles = [],
    redirectTo = '/explorer',
    requireRole = true,
  } = options;

  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    cachedRole,
    loading: roleLoading,
    isRoleCached,
    getCachedRole,
    isMember,
    isAdmin,
    isOwner,
    isViewer,
  } = useRoleCache();

  useEffect(() => {
    const checkAuthorization = () => {
      // Si aún está cargando el rol, esperar
      if (roleLoading) {
        return;
      }

      // Si no se requiere rol, permitir acceso
      if (!requireRole) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Si no hay caché de rol, no autorizar
      if (!isRoleCached()) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      const userRole = getCachedRole();
      
      // Si no hay rol, no autorizar
      if (!userRole) {  
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Si no se especificaron roles permitidos, permitir acceso
      if (allowedRoles.length === 0) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Verificar si el rol del usuario está en la lista de roles permitidos
      const hasPermission = allowedRoles.includes(userRole);
      


      setIsAuthorized(hasPermission);
      setIsLoading(false);
    };

    checkAuthorization();
  }, [roleLoading, isRoleCached, getCachedRole, allowedRoles, requireRole]);

  // Redirigir si no está autorizado
  useEffect(() => {
    if (isAuthorized === false && !isLoading) {
        
      router.push(redirectTo);
    }
  }, [isAuthorized, isLoading, router, redirectTo]);

  return {
    isAuthorized,
    isLoading: isLoading || roleLoading,
    userRole: getCachedRole(),
    isMember: isMember(),
    isAdmin: isAdmin(),
    isOwner: isOwner(),
    isViewer: isViewer(),
    hasAccess: isAuthorized === true,
  };
};

// Hooks específicos para casos de uso comunes
export const useAdminRoute = (redirectTo = '/explorer') => {
  return useProtectedRoute({
    allowedRoles: ['admin', 'owner'],
    redirectTo,
  });
};

export const useOwnerRoute = (redirectTo = '/explorer') => {
  return useProtectedRoute({
    allowedRoles: ['owner'],
    redirectTo,
  });
};

export const useNonMemberRoute = (redirectTo = '/explorer') => {
  return useProtectedRoute({
    allowedRoles: ['admin', 'owner', 'viewer'],
    redirectTo,
  });
};

export const useAnyRoleRoute = () => {
  return useProtectedRoute({
    requireRole: false,
  });
}; 
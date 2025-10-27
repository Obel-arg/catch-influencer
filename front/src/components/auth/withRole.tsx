"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleCache } from '@/hooks/auth/useRoleCache';
import { UserRole } from '@/types/users';
import { Shield, AlertTriangle } from 'lucide-react';

interface WithRoleProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

// Componente de acceso denegado
const AccessDenied = ({ redirectTo }: { redirectTo: string }) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push(redirectTo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, redirectTo]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-full bg-red-100">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-3">
          Acceso Denegado
        </h1>
        
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta página. Solo los administradores pueden gestionar usuarios.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
          <AlertTriangle className="h-4 w-4" />
          <span>Redirigiendo en {countdown} segundos...</span>
        </div>
        
        <button
          onClick={() => router.push(redirectTo)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir a Explorer
        </button>
      </div>
    </div>
  );
};

export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { allowedRoles = [], redirectTo = '/explorer', fallback }: WithRoleProps = {}
) {
  return function WithRoleComponent(props: P) {
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
    }, [roleLoading, isRoleCached, getCachedRole, allowedRoles]);

    // Mostrar loading mientras se verifica
    if (isLoading || isAuthorized === null) {
      if (fallback) {
        return <>{fallback}</>;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Verificando permisos...</p>
          </div>
        </div>
      );
    }

    // Si no está autorizado, mostrar componente de acceso denegado
    if (!isAuthorized) {
      return <AccessDenied redirectTo={redirectTo} />;
    }

    // Si está autorizado, renderizar el componente
    return <WrappedComponent {...props} />;
  };
}

// HOCs específicos para roles comunes
export const withAdminOnly = <P extends object>(Component: React.ComponentType<P>) =>
  withRole(Component, { allowedRoles: ['admin', 'owner'] });

export const withOwnerOnly = <P extends object>(Component: React.ComponentType<P>) =>
  withRole(Component, { allowedRoles: ['owner'] });

export const withNonMemberOnly = <P extends object>(Component: React.ComponentType<P>) =>
  withRole(Component, { allowedRoles: ['admin', 'owner', 'viewer'] });

export const withAnyRole = <P extends object>(Component: React.ComponentType<P>) =>
  withRole(Component, { allowedRoles: [] }); 
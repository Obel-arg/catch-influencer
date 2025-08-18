"use client";

import { useRoleCache } from '@/hooks/auth/useRoleCache';
import { useProtectedRoute } from '@/hooks/auth/useProtectedRoute';
import { UserRole } from '@/types/users';

interface RoleBasedComponentProps {
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleBasedComponent({ 
  allowedRoles = [], 
  fallback,
  children 
}: RoleBasedComponentProps) {
  const { isAuthorized, isLoading, userRole } = useProtectedRoute({
    allowedRoles,
    requireRole: allowedRoles.length > 0,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

// Componentes específicos para casos de uso comunes
export function AdminOnlyComponent({ children, fallback }: Omit<RoleBasedComponentProps, 'allowedRoles'>) {
  return (
    <RoleBasedComponent allowedRoles={['admin', 'owner']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

export function OwnerOnlyComponent({ children, fallback }: Omit<RoleBasedComponentProps, 'allowedRoles'>) {
  return (
    <RoleBasedComponent allowedRoles={['owner']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

export function NonMemberComponent({ children, fallback }: Omit<RoleBasedComponentProps, 'allowedRoles'>) {
  return (
    <RoleBasedComponent allowedRoles={['admin', 'owner', 'viewer']} fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

// Hook para usar en componentes funcionales
export function useRoleBasedRender(allowedRoles: UserRole[] = []) {
  const { isAuthorized, isLoading, userRole } = useProtectedRoute({
    allowedRoles,
    requireRole: allowedRoles.length > 0,
  });

  return {
    shouldRender: isAuthorized,
    isLoading,
    userRole,
  };
} 
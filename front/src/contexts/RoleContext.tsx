"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useRoleCache } from '@/hooks/auth/useRoleCache';
import { UserRole } from '@/types/users';

interface RoleContextType {
  // Estado del caché
  cachedRole: any;
  loading: boolean;
  isRoleCached: () => boolean;
  getCachedRole: () => UserRole | null;
  
  // Métodos de verificación de roles
  isMember: () => boolean;
  isAdmin: () => boolean;
  isOwner: () => boolean;
  isViewer: () => boolean;
  hasAccess: () => boolean;
  
  // Métodos de gestión del caché
  saveRoleToCache: (roleData: any) => void;
  clearRoleCache: () => void;
  refreshRoleCache: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const roleCache = useRoleCache();

  const value: RoleContextType = {
    ...roleCache,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}; 
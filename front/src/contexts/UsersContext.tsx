"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { usersService } from "@/lib/services/users";
import { useToast } from "@/hooks/common/useToast";
import { OrganizationMember, UserRole, InviteUserData, UpdateUserRoleData } from "@/types/users";
import { handleHookError } from "@/utils/httpErrorHandler";

interface UsersContextType {
  // Estado
  loading: boolean;
  error: string | null;
  members: OrganizationMember[];
  isInitialized: boolean;

  // Funciones
  getMembers: (organizationId: string, force?: boolean) => Promise<OrganizationMember[]>;
  inviteUser: (userData: InviteUserData) => Promise<void>;
  updateUserRole: (userData: UpdateUserRoleData) => Promise<void>;
  updateUserName: (userId: string, fullName: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
  resetMembers: () => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

interface UsersProviderProps {
  children: ReactNode;
}

// 🎯 CACHE CON LOCALSTORAGE
const USERS_CACHE_KEY = 'users-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const getUsersFromCache = (organizationId: string): OrganizationMember[] | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(USERS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.organizationId === organizationId && 
          Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed.members;
      }
    }
  } catch (error) {
    console.warn('⚠️ [UsersContext] Error reading users cache:', error);
  }
  
  return null;
};

const setUsersCache = (organizationId: string, members: OrganizationMember[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData = {
      organizationId,
      members,
      timestamp: Date.now()
    };
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('⚠️ [UsersContext] Error setting users cache:', error);
  }
};

const clearUsersCache = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(USERS_CACHE_KEY);
  } catch (error) {
    console.warn('⚠️ [UsersContext] Error clearing users cache:', error);
  }
};

export const UsersProvider: React.FC<UsersProviderProps> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);
  const { showToast } = useToast();

  const getMembers = useCallback(
    async (organizationId: string, force: boolean = false) => {
      // Si ya está inicializado y no es forzado, retornar los datos actuales
      if (isInitialized && !force && members.length > 0 && currentOrganizationId === organizationId) {
        return members;
      }

      // Intentar obtener del cache si no es forzado
      if (!force) {
        const cachedMembers = getUsersFromCache(organizationId);
        if (cachedMembers) {
          setMembers(cachedMembers);
          setIsInitialized(true);
          setCurrentOrganizationId(organizationId);
          return cachedMembers;
        }
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await usersService.getOrganizationMembers(organizationId);
        const items = response.members || [];
        
        setMembers(items);
        setIsInitialized(true);
        setCurrentOrganizationId(organizationId);
        
        // Guardar en cache
        setUsersCache(organizationId, items);
        
        return items;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al obtener usuarios";
        setError(errorMessage);
        showToast({
          title: "Error",
          description: errorMessage,
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [showToast, isInitialized, members, currentOrganizationId]
  );

  const inviteUser = useCallback(
    async (userData: InviteUserData) => {
      if (!currentOrganizationId) {
        throw new Error("No hay organización seleccionada");
      }

      try {
        setLoading(true);
        await usersService.inviteUser(currentOrganizationId, userData);
        
        showToast({
          title: "Éxito",
          description: `Invitación enviada a ${userData.email}`,
          variant: "default",
        });
        
        // Limpiar cache y recargar
        clearUsersCache();
        await getMembers(currentOrganizationId, true);
      } catch (err) {
        handleHookError(err, setError, "Error al invitar usuario");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrganizationId, getMembers, showToast]
  );

  const updateUserRole = useCallback(
    async (userData: UpdateUserRoleData) => {
      if (!currentOrganizationId) {
        throw new Error("No hay organización seleccionada");
      }

      try {
        setLoading(true);
        await usersService.updateUserRole(currentOrganizationId, userData);
        
        showToast({
          title: "Éxito",
          description: "Rol actualizado correctamente",
          variant: "default",
        });
        
        // Limpiar cache y recargar
        clearUsersCache();
        await getMembers(currentOrganizationId, true);
      } catch (err) {
        handleHookError(err, setError, "Error al actualizar rol");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrganizationId, getMembers, showToast]
  );

  const updateUserName = useCallback(
    async (userId: string, fullName: string) => {
      if (!currentOrganizationId) {
        throw new Error("No hay organización seleccionada");
      }

      try {
        setLoading(true);
        await usersService.updateUserName(currentOrganizationId, userId, fullName);
        
        showToast({
          title: "Éxito",
          description: "Nombre actualizado correctamente",
          variant: "default",
        });
        
        // Limpiar cache y recargar
        clearUsersCache();
        await getMembers(currentOrganizationId, true);
      } catch (err) {
        handleHookError(err, setError, "Error al actualizar nombre");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrganizationId, getMembers, showToast]
  );

  const removeUser = useCallback(
    async (userId: string) => {
      if (!currentOrganizationId) {
        throw new Error("No hay organización seleccionada");
      }

      
      try {
        setLoading(true);
        await usersService.removeUser(currentOrganizationId, userId);
        
        
        showToast({
          title: "Éxito",
          description: "Usuario eliminado completamente de la organización",
          variant: "default",
        });
        
        // Limpiar cache y recargar
        clearUsersCache();
        await getMembers(currentOrganizationId, true);
      } catch (err) {
        console.error('❌ UsersContext - Error eliminando usuario:', err);
        handleHookError(err, setError, "Error al eliminar usuario");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrganizationId, getMembers, showToast]
  );

  const refreshMembers = useCallback(async () => {
    if (currentOrganizationId) {
      clearUsersCache();
      await getMembers(currentOrganizationId, true);
    }
  }, [currentOrganizationId, getMembers]);

  const resetMembers = useCallback(() => {
    setMembers([]);
    setIsInitialized(false);
    setError(null);
    setCurrentOrganizationId(null);
    clearUsersCache();
  }, []);

  const value: UsersContextType = {
    loading,
    error,
    members,
    isInitialized,
    getMembers,
    inviteUser,
    updateUserRole,
    updateUserName,
    removeUser,
    refreshMembers,
    resetMembers,
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error(
      "useUsersContext must be used within a UsersProvider"
    );
  }
  return context;
}; 
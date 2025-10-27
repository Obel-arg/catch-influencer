"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRoleCache } from "@/hooks/auth/useRoleCache";

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  organization_id?: string;
  organization_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { saveRoleToCache } = useRoleCache();

  useEffect(() => {
    // Initialize auth state from localStorage (solo una vez)
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");



    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        setUser(parsedUser);
        
        // Sincronizar caché de roles si el usuario tiene rol
        if (parsedUser.role) {
          try {
            saveRoleToCache({
              role: parsedUser.role as any,
              organizationId: parsedUser.organization_id || '',
              organizationName: parsedUser.organization_name || '',
              permissions: []
            });
            
          } catch (error) {
            console.warn('Error sincronizando caché de roles al cargar:', error);
          }
        }
      } catch (error) {
        console.error("❌ AuthContext - Error parsing user data:", error);
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
      }
    } else {
    }

    setIsLoading(false);
    setIsInitialized(true);
    
  }, []); // Dependencias vacías para ejecutar solo una vez

  const login = (token: string, userData: User) => {
    
    
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    
    // Sincronizar caché de roles si el usuario tiene rol
    if (userData.role) {
      try {
        saveRoleToCache({
          role: userData.role as any,
          organizationId: userData.organization_id || '',
          organizationName: userData.organization_name || '',
          permissions: []
        });
        
      } catch (error) {
        console.warn('Error sincronizando caché de roles:', error);
      }
    }
    

  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRoleCache");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isInitialized,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

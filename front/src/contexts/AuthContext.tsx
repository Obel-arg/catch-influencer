"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
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

  useEffect(() => {
    // Initialize auth state from localStorage (solo una vez)
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    console.log("🔍 AuthContext - Inicializando estado:", {
      hasToken: !!token,
      hasUserData: !!userData
    });

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("✅ AuthContext - Usuario cargado desde localStorage:", {
          userId: parsedUser.id,
          userEmail: parsedUser.email
        });
        setUser(parsedUser);
      } catch (error) {
        console.error("❌ AuthContext - Error parsing user data:", error);
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
      }
    } else {
      console.log("ℹ️ AuthContext - No hay datos de usuario en localStorage");
    }

    setIsLoading(false);
    setIsInitialized(true);
    console.log("✅ AuthContext - Inicialización completada");
  }, []); // Dependencias vacías para ejecutar solo una vez

  const login = (token: string, userData: User) => {
    console.log("🔄 AuthContext - Login llamado:", {
      hasToken: !!token,
      userId: userData.id,
      userEmail: userData.email
    });
    
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    
    console.log("✅ AuthContext - Login completado");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
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

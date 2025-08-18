import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import { User } from "@/types/auth";
import { useUserStorage } from "./useUserStorage";

export interface UserData extends User {
  id?: string;
  avatar_url: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  city: string;
  last_login: string;
  authProvider: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  full_name?: string;
  organizations?: any[];
}

export interface FormData {
  full_name: string;
  position: string;
  phone: string;
  company: string;
  city: string;
  address?: string;
  avatar_url: string;
  bio: string;
  email: string;
}

export interface UserStats {
  campaignsCreated: number;
  influencersManaged: number;
  lastActivity: string;
  teamMembers: number;
  loginCount: number;
}

export function useAccount() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { userData: storedUserData, saveUserDataToStorage, updateUserDataInStorage } = useUserStorage();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    position: "",
    phone: "",
    company: "",
    city: "",
    address: "",
    avatar_url: "",
    bio: "",
    email: ""
  });
  
  const [userStats, setUserStats] = useState<UserStats>({
    campaignsCreated: 0,
    influencersManaged: 0,
    lastActivity: "",
    teamMembers: 0,
    loginCount: 0
  });
  
  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Primero intentar cargar desde el servidor
      try {
        const response = await authService.getCurrentUser();
        let user, organizations;
        if ('user' in response && 'organizations' in response) {
          user = response.user;
          organizations = response.organizations;
        } else {
          user = response;
          organizations = [];
        }
        
        if (!user) {
          // Si no hay usuario del servidor, intentar usar datos del localStorage
          if (storedUserData) {
            const userData: UserData = {
              ...storedUserData,
              avatar_url: storedUserData.avatar_url || "",
              phone: storedUserData.phone || "",
              company: storedUserData.company || "",
              position: storedUserData.position || "",
              address: storedUserData.address || "",
              city: storedUserData.city || "",
              last_login: new Date().toLocaleString('es-ES'),
              authProvider: "email",
              isEmailVerified: true,
              twoFactorEnabled: false,
              full_name: storedUserData.full_name || undefined,
              organizations: []
            };
            setUserData(userData);
            setFormData({
              full_name: userData.full_name || "",
              position: userData.position || "",
              phone: userData.phone || "",
              company: userData.company || "",
              city: userData.city || "",
              address: userData.address || "",
              avatar_url: userData.avatar_url || "",
              bio: "",
              email: userData.email
            });
            generateUserStats(userData.id || 'fallback');
            return;
          } else {
            router.push("/login");
            return;
          }
        }
        
        const userData: UserData = {
          ...user,
          avatar_url: user.avatar_url || "",
          phone: user.phone || "",
          company: user.company || "",
          position: user.position || "",
          address: user.address || "",
          city: user.city || "",
          last_login: new Date().toLocaleString('es-ES'),
          authProvider: "email",
          isEmailVerified: true,
          twoFactorEnabled: false,
          full_name: user.full_name || undefined,
          organizations: organizations || []
        };
        
        // Actualizar localStorage con los datos frescos del servidor
        saveUserDataToStorage({
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          avatar_url: userData.avatar_url,
          phone: userData.phone,
          company: userData.company,
          position: userData.position,
          address: userData.address,
          city: userData.city,
        });
        
        setUserData(userData);
        setFormData({
          full_name: userData.full_name || "",
          position: userData.position || "",
          phone: userData.phone || "",
          company: userData.company || "",
          city: userData.city || "",
          address: userData.address || "",
          avatar_url: userData.avatar_url || "",
          bio: (userData as any).bio || "",
          email: userData.email
        });
        generateUserStats(userData.id || 'unknown');
        
      } catch (serverError) {
        console.warn("Error al cargar datos del servidor, usando localStorage como fallback:", serverError);
        
        // Si falla el servidor, usar datos del localStorage
        if (storedUserData) {
          const userData: UserData = {
            ...storedUserData,
            avatar_url: storedUserData.avatar_url || "",
            phone: storedUserData.phone || "",
            company: storedUserData.company || "",
            position: storedUserData.position || "",
            address: storedUserData.address || "",
            city: storedUserData.city || "",
            last_login: new Date().toLocaleString('es-ES'),
            authProvider: "email",
            isEmailVerified: true,
            twoFactorEnabled: false,
            full_name: storedUserData.full_name || undefined,
            organizations: []
          };
          setUserData(userData);
          setFormData({
            full_name: userData.full_name || "",
            position: userData.position || "",
            phone: userData.phone || "",
            company: userData.company || "",
            city: userData.city || "",
            address: userData.address || "",
            avatar_url: userData.avatar_url || "",
            bio: "",
            email: userData.email
          });
          generateUserStats(userData.id || 'fallback');
        } else {
          throw serverError; // Si no hay datos en localStorage, propagar el error
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      // Si no hay datos en localStorage y falla el servidor, redirigir al login
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateUserStats = (userId: string) => {
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const loginCount = (hash % 50) + 10;
    const lastLoginDate = new Date();
    lastLoginDate.setDate(lastLoginDate.getDate() - (hash % 5));
    
    setUserStats({
      campaignsCreated: (hash % 15) + 3,
      influencersManaged: (hash % 80) + 20,
      lastActivity: lastLoginDate.toLocaleDateString('es-ES'),
      teamMembers: (hash % 5) + 1,
      loginCount: loginCount
    });
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleProfileUpdate = async () => {
    try {
      setIsUpdating(true);
      await authService.updateUser(formData);
      
      // Actualizar estado local
      const updatedUserData = userData ? { ...userData, ...formData } : null;
      setUserData(updatedUserData);
      
      // Actualizar localStorage con los nuevos datos
      updateUserDataInStorage({
        full_name: formData.full_name,
        email: formData.email,
        avatar_url: formData.avatar_url,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        address: formData.address,
        city: formData.city,
      });
      
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isLoading,
    isUpdating,
    activeTab,
    setActiveTab,
    userData,
    formData,
    userStats,
    handleInputChange,
    handleProfileUpdate
  };
} 
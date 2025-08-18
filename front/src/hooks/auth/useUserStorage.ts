import { useState, useEffect, useCallback } from 'react';

export interface UserStorageData {
  email: string;
  name: string;
  full_name?: string;
  avatar_url?: string;
  id?: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
}

const USER_STORAGE_KEY = 'userStorageData';

// Función para verificar si estamos en el cliente
const isClient = typeof window !== 'undefined';

export const useUserStorage = () => {
  const [userData, setUserData] = useState<UserStorageData | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar datos del localStorage al inicializar (solo en el cliente)
  useEffect(() => {
    if (isClient) {
      loadUserDataFromStorage();
      setIsHydrated(true);
    }
  }, []);

  const loadUserDataFromStorage = useCallback(() => {
    if (!isClient) return null;
    
    try {
      const storedData = localStorage.getItem(USER_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario desde localStorage:', error);
    }
    return null;
  }, []);

  const saveUserDataToStorage = useCallback((data: Partial<UserStorageData>) => {
    if (!isClient) return null;
    
    try {
      // Obtener datos existentes
      const currentData = loadUserDataFromStorage() || {};
      
      // Combinar con nuevos datos
      const updatedData = {
        ...currentData,
        ...data,
        // Asegurar que siempre tengamos al menos email y full_name
        email: data.email || currentData.email || '',
        full_name: data.full_name || currentData.full_name || '',
      };

      // Guardar en localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedData));
      setUserData(updatedData);
      
      return updatedData;
    } catch (error) {
      console.error('Error al guardar datos del usuario en localStorage:', error);
      return null;
    }
  }, [loadUserDataFromStorage]);

  const updateUserDataInStorage = useCallback((updates: Partial<UserStorageData>) => {
    return saveUserDataToStorage(updates);
  }, [saveUserDataToStorage]);

  const clearUserDataFromStorage = useCallback(() => {
    if (!isClient) return;
    
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUserData(null);
      
      // Emitir evento para que otros componentes se actualicen
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userDataUpdated'));
      }
    } catch (error) {
      console.error('Error al limpiar datos del usuario del localStorage:', error);
    }
  }, []);

  const getUserEmail = useCallback(() => {
    if (!isClient) return '';
    return userData?.email || localStorage.getItem('userEmail') || '';
  }, [userData]);

  const getUserName = useCallback(() => {
    if (!isClient) return '';
    return userData?.full_name || localStorage.getItem('userName') || '';
  }, [userData]);

  const getUserAvatar = useCallback(() => {
    return userData?.avatar_url || '';
  }, [userData]);

  const getInitials = useCallback((name?: string, email?: string) => {
    const displayName = name || getUserName();
    const displayEmail = email || getUserEmail();
    
    if (displayName && displayName.trim() !== '') {
      const words = displayName.trim().split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return words[0][0].toUpperCase();
    }
    
    if (displayEmail && displayEmail.trim() !== '') {
      return displayEmail.charAt(0).toUpperCase();
    }
    
    return 'U';
  }, [getUserName, getUserEmail]);

  return {
    userData,
    isHydrated,
    saveUserDataToStorage,
    updateUserDataInStorage,
    clearUserDataFromStorage,
    loadUserDataFromStorage,
    getUserEmail,
    getUserName,
    getUserAvatar,
    getInitials,
  };
}; 
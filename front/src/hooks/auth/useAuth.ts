import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth';
import { LoginCredentials, RegisterData, User } from '@/types/auth';
import { useToast } from "../common/useToast";
import { useUserStorage } from './useUserStorage';
import { useRoleCache } from './useRoleCache';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveUserDataToStorage, clearUserDataFromStorage } = useUserStorage();
  const { saveRoleToCache } = useRoleCache();

  const login = useCallback(async (credentials: LoginCredentials): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.login(credentials);
      setUser(data.user);
      
      console.log('🔐 Login exitoso, guardando tokens...', { token: data.token?.substring(0, 20) + '...' });
      
      // Guardar tokens en localStorage (solo en el cliente)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userEmail', data.user.email);
        
        // Verificar que se guardaron correctamente
        const savedToken = localStorage.getItem('token');
        console.log('✅ Token guardado en localStorage:', savedToken ? 'SÍ' : 'NO');
      }
      
      // Guardar datos básicos del usuario inmediatamente
      saveUserDataToStorage({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        avatar_url: data.user.avatar_url,
        phone: data.user.phone,
        company: data.user.company,
        position: data.user.position,
        address: data.user.address,
        city: data.user.city,
      });
      
      // Mantener compatibilidad con localStorage existente usando datos básicos
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('userName', data.user.full_name || '');
      }

      // Obtener y guardar el rol del usuario en caché inmediatamente
      try {
        console.log('🔄 Obteniendo rol del usuario para caché...');
        const userResponse = await authService.getCurrentUser();
        let organizations = [];
        
        if ('organizations' in userResponse) {
          organizations = userResponse.organizations;
        }

        if (organizations && organizations.length > 0) {
          // Calcular el rol del usuario
          const isOnlyMember = organizations.every((org: any) => org.member?.role === 'member');
          
          let highestRole: 'owner' | 'admin' | 'member' | 'viewer' = 'member';
          let primaryOrg = organizations[0];
          
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
              highestRole = role as 'admin' | 'member' | 'viewer';
              primaryOrg = org;
            }
          }
          
          const finalRole: 'admin' | 'member' | 'viewer' = isOnlyMember ? 'member' : highestRole;
          
          // Guardar rol en caché
          saveRoleToCache({
            role: finalRole,
            organizationId: primaryOrg.id,
            organizationName: primaryOrg.name,
            permissions: [], // Por ahora vacío
          });
          
          console.log('✅ Rol guardado en caché:', finalRole);
        }
      } catch (roleError) {
        console.warn('⚠️ No se pudo obtener el rol del usuario para caché:', roleError);
        // No fallar el login si no se puede obtener el rol
      }
      
      console.log('🚀 Redirigiendo a /explorer...');
      
      // Redirigir inmediatamente sin hacer llamada adicional a /me
      router.push('/explorer');
      
      toast({
        title: "Éxito",
        description: "Inicio de sesión exitoso",
        variant: "default"
      });
      return data.user;
    } catch (err) {
      console.error('❌ Error en login:', err);
      
      // Manejar errores específicos para mostrar mensajes más amigables
      let message = "Error al iniciar sesión";
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as any;
        if (axiosError.response?.status === 401) {
          message = "Usuario o contraseña incorrectos";
        } else if (axiosError.response?.status === 403) {
          message = "Debes verificar tu correo electrónico antes de iniciar sesión.";
        } else if (axiosError.response?.data?.message) {
          // Usar mensaje del backend si es amigable
          message = axiosError.response.data.message;
        }
      } else if (err instanceof Error) {
        // Para otros tipos de errores, usar el mensaje del error
        message = err.message;
      }
      
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router, toast, saveUserDataToStorage, saveRoleToCache]);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.register(data);
      toast({
        title: "Éxito",
        description: "Registro exitoso. Por favor, verifica tu correo electrónico.",
        variant: "default"
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al registrar usuario";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
      
      // Limpiar todos los datos del localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userData');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRoleCache'); // Limpiar caché de roles
      }
      
      // Limpiar datos del nuevo sistema de almacenamiento
      clearUserDataFromStorage();
      
      router.push('/login');
      toast({
        title: "Éxito",
        description: "Sesión cerrada correctamente",
        variant: "default"
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cerrar sesión";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router, toast, clearUserDataFromStorage]);

  const getCurrentUser = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.getCurrentUser();
      setUser(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener usuario actual";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const verifyTwoFactor = useCallback(async (code: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.verifyTwoFactor(code);
      setUser(data.user);
      toast({
        title: "Éxito",
        description: "Verificación exitosa",
        variant: "default"
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al verificar código";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.requestPasswordReset(email);
      toast({
        title: "Éxito",
        description: "Se ha enviado un correo con las instrucciones para restablecer tu contraseña",
        variant: "default"
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al solicitar restablecimiento de contraseña";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const verifyResetToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const isValid = await authService.verifyResetToken(token);
      return isValid;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al verificar token";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(token, newPassword);
      toast({
        title: "Éxito",
        description: "Contraseña restablecida correctamente",
        variant: "default"
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al restablecer contraseña";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Esto redirigirá al usuario a Google
      await authService.loginWithGoogle();
      // No necesitamos hacer más aquí porque el usuario será redirigido
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al inicializar autenticación con Google";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      setLoading(false);
      throw err;
    }
  }, [toast]);

  const handleGoogleCallback = useCallback(async (token: string, refreshToken: string): Promise<{ user: any; token: string; refreshToken: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authService.handleGoogleCallback(token, refreshToken);
      
      setUser(data.user);
      
      // Guardar tokens en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userEmail', data.user.email);
        
        // Verificar que se guardaron correctamente
        const savedToken = localStorage.getItem('token');
        const savedRefreshToken = localStorage.getItem('refreshToken');
        console.log('✅ Tokens guardados en localStorage:', {
          token: !!savedToken,
          refreshToken: !!savedRefreshToken
        });
      }
      
      // Guardar datos básicos del usuario
      saveUserDataToStorage({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        avatar_url: data.user.avatar_url,
        phone: data.user.phone,
        company: data.user.company,
        position: data.user.position,
        address: data.user.address,
        city: data.user.city,
      });
      
      // Mantener compatibilidad con localStorage existente
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('userName', data.user.full_name || '');
      }

      // Obtener y guardar el rol del usuario en caché para Google OAuth también
      try {
        console.log('🔄 Obteniendo rol del usuario para caché (Google OAuth)...');
        const userResponse = await authService.getCurrentUser();
        let organizations = [];
        
        if ('organizations' in userResponse) {
          organizations = userResponse.organizations;
        }

        if (organizations && organizations.length > 0) {
          // Calcular el rol del usuario
          const isOnlyMember = organizations.every((org: any) => org.member?.role === 'member');
          
          let highestRole: 'admin' | 'member' | 'viewer' = 'member';
          let primaryOrg = organizations[0];
          
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
              highestRole = role as 'admin' | 'member' | 'viewer';
              primaryOrg = org;
            }
          }
          
          const finalRole: 'admin' | 'member' | 'viewer' = isOnlyMember ? 'member' : highestRole;
          
          // Guardar rol en caché
          saveRoleToCache({
            role: finalRole,
            organizationId: primaryOrg.id,
            organizationName: primaryOrg.name,
            permissions: [], // Por ahora vacío
          });
          
          console.log('✅ Rol guardado en caché (Google OAuth):', finalRole);
        }
      } catch (roleError) {
        console.warn('⚠️ No se pudo obtener el rol del usuario para caché (Google OAuth):', roleError);
        // No fallar el login si no se puede obtener el rol
      }
      
      console.log('✅ Google callback procesado exitosamente:', {
        userId: data.user.id,
        userEmail: data.user.email
      });
      
      // Retornar los datos para que el callback page pueda actualizar el contexto
      return data;
    } catch (err) {
      console.error("❌ Error in useAuth.handleGoogleCallback:", err);
      const message = err instanceof Error ? err.message : "Error al procesar autenticación con Google";
      setError(message);
      // NO mostrar toast aquí - se muestra en el callback page para evitar duplicados
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveUserDataToStorage, saveRoleToCache]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    verifyTwoFactor,
    requestPasswordReset,
    verifyResetToken,
    resetPassword,
    loginWithGoogle,
    handleGoogleCallback
  };
}; 
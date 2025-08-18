import { httpAuthClient } from '@/lib/http';
import { AuthResponse, LoginCredentials, RegisterData, RefreshTokenResponse, User } from '@/types/auth';
import { AxiosHeaders } from 'axios';
import { api } from '../api';

export class AuthService {
  private static instance: AuthService;
  private readonly baseUrl = '';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await httpAuthClient.post<AuthResponse>(`${this.baseUrl}/login`, credentials, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  public async register(data: RegisterData): Promise<AuthResponse> {
    const response = await httpAuthClient.post<AuthResponse>(`${this.baseUrl}/register`, data, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  public async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await httpAuthClient.post<RefreshTokenResponse>(`${this.baseUrl}/refresh`, { refreshToken });
    return response.data;
  }

  public async logout(): Promise<void> {
    await httpAuthClient.post(`${this.baseUrl}/logout`, null, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  public async getCurrentUser(): Promise<any> {
    const response = await httpAuthClient.get<any>(`${this.baseUrl}/me`);
    return response.data;
  }

  public async verifyTwoFactor(code: string): Promise<AuthResponse> {
    const response = await httpAuthClient.post<AuthResponse>(`${this.baseUrl}/verify-2fa`, { code }, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  public async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/request-password-reset', { email });
  }

  public async verifyResetToken(token: string): Promise<boolean> {
    try {
      await api.get(`/auth/verify-reset-token/${token}`);
      return true;
    } catch {
      return false;
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  }

  /**
   * Obtiene la URL de autenticación de Google
   */
  public async getGoogleAuthUrl(): Promise<string> {
    const response = await httpAuthClient.get<{ authUrl: string }>(`${this.baseUrl}/google/url`);
    return response.data.authUrl;
  }

  /**
   * Inicia el proceso de autenticación con Google
   * Redirige al usuario a Google para autenticación
   */
  public async loginWithGoogle(): Promise<void> {
    try {
      // Obtener el dominio actual para pasarlo al backend
      const currentOrigin = window.location.origin;
      
      // Determinar la URL base según el entorno
      const baseURL = "http://localhost:5000/api/auth";
      
      // Llamar directamente al endpoint de Google Auth del backend
      // Esto permitirá que el backend detecte el dominio de origen
      const authUrl = `${baseURL}/google`;
      
      // Redirigir al usuario a Google
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error iniciando autenticación con Google:', error);
      throw new Error('Error al inicializar autenticación con Google');
    }
  }

  /**
   * Procesa el callback de Google OAuth cuando el usuario regresa del flujo de autenticación
   */
  public async handleGoogleCallback(token: string, refreshToken: string): Promise<AuthResponse> {
    try {
      // Intentar obtener información del usuario usando el token
      try {
        const userResponse = await httpAuthClient.get<any>(`${this.baseUrl}/me`, {
          headers: new AxiosHeaders({
            'Authorization': `Bearer ${token}`
          })
        });

        return {
          user: userResponse.data.user,
          token,
          refreshToken
        };
      } catch (meError) {
        console.warn('Error calling /me endpoint, decoding token instead:', meError);
        
        // Si falla /me, intentar decodificar el token para obtener info básica
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          return {
            user: {
              id: payload.id,
              email: payload.email,
              full_name: payload.full_name,
              avatar_url: payload.avatar_url,
              role: payload.role
            },
            token,
            refreshToken
          };
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          throw new Error('Error al procesar tokens de autenticación');
        }
      }
    } catch (error) {
      console.error('Error procesando callback de Google:', error);
      throw new Error('Error al procesar autenticación con Google');
    }
  }

  public async updateUser(data: Partial<User>): Promise<any> {
    const response = await httpAuthClient.put('/users/profile', data, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }
}

export const authService = AuthService.getInstance(); 
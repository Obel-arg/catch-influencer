import { OAuth2Client } from 'google-auth-library';
import config from '../../config/environment';
import { UserService } from '../user';
import { generateToken } from './index';
import supabase, { supabaseAdmin } from '../../config/supabase';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  verified_email: boolean;
}

export class GoogleOAuthService {
  private static instance: GoogleOAuthService;
  private oAuth2Client: OAuth2Client;
  private userService: UserService;

  private constructor(userService?: UserService) {
    this.oAuth2Client = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
    this.userService = userService || new UserService();
  }

  public static getInstance(userService?: UserService): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService(userService);
    }
    return GoogleOAuthService.instance;
  }

  /**
   * Genera la URL de autorización de Google
   */
  public getAuthUrl(state?: string): string {
    const scopes = [
      'openid',
      'email',
      'profile'
    ];

    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      state: state, // Pasar el state parameter si se proporciona
    });

    return authUrl;
  }

  /**
   * Maneja el callback de Google OAuth y procesa el código de autorización
   */
  public async handleCallback(code: string): Promise<{ user: any; token: string; refreshToken: string }> {
    try { 

      // Intercambiar el código por tokens
     
      const { tokens } = await this.oAuth2Client.getToken(code);
      this.oAuth2Client.setCredentials(tokens);

     

      // Obtener información del usuario desde Google
     
      const userInfo = await this.getUserInfo(tokens.access_token!);

     

      // Buscar usuario en nuestra base de datos (user_profiles)
     
      let user = await this.userService.getUserByEmail(userInfo.email);

      if (!user) {
       
        
        // Verificar si el usuario existe en Supabase Auth pero no en user_profiles
        const authUser = await this.userService.getUserFromAuthByEmail(userInfo.email);
        
        if (authUser) {
         
          // Eliminar usuario completamente de todas las tablas
          try {
            await this.deleteUserCompletely(authUser.id, userInfo.email);
          } catch (deleteError) {
           
          }
        }
        
        // Lanzar error de acceso denegado
        throw new Error('ACCESS_DENIED: Usuario no autorizado. Solo usuarios invitados pueden acceder al sistema.');
      } else {
       
        // Usuario existe, actualizar información si es necesario
        await this.userService.updateUser(user.id, {
          avatar_url: userInfo.picture,
          full_name: userInfo.name,
        });
        
        // Actualizar metadatos del usuario existente para indicar que usa Google OAuth
        if (supabaseAdmin) {
          try {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              user.id,
              {
                app_metadata: {
                  provider: 'google',
                  providers: ['google']
                },
                user_metadata: {
                  avatar_url: userInfo.picture,
                  full_name: userInfo.name,
                  provider: 'google'
                }
              }
            );

            if (updateError) {
              
            } else {
             
            }
          } catch (updateError) {
           
          }
        }
        
        // Obtener usuario actualizado
        const updatedUser = await this.userService.getUserById(user.id);
        if (!updatedUser) {
          throw new Error('Error al obtener usuario actualizado');
        }
        user = updatedUser;
       
      }

      // Verificar que el usuario existe antes de generar tokens
      if (!user) {
        throw new Error('Usuario no encontrado después del proceso de autenticación');
      }

     

      // Generar tokens JWT
      const token = generateToken(user);
      const refreshToken = generateToken(user, '7d');

     

      const result = {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          role: user.role
        },
        token,
        refreshToken
      };

     
      return result;

    } catch (error) {
     
      
      // Proporcionar mensajes de error más específicos
      if (error instanceof Error) {
        if (error.message.includes('email_exists') || error.message.includes('already been registered')) {
         
          throw new Error('Error de consistencia de datos en autenticación');
        }
        throw new Error(`Error al procesar autenticación con Google: ${error.message}`);
      }
      
      throw new Error('Error al procesar autenticación con Google');
    }
  }

  /**
   * Obtiene información del usuario desde Google
   */
  private async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener información del usuario de Google');
      }

      const userInfo = await response.json() as GoogleUserInfo;
      return userInfo;
    } catch (error) {
     
      throw error;
    }
  }

  /**
   * Genera una contraseña aleatoria para usuarios de Google OAuth
   */
  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
  }

  /**
   * Elimina completamente un usuario de todas las tablas relacionadas
   */
  private async deleteUserCompletely(userId: string, email: string) {
   
    
    try {
      // 1. Eliminar de organization_members
      const { error: orgError } = await supabase
        .from('organization_members')
        .delete()
        .eq('user_id', userId);
      
      if (orgError) {
       
      } else {
       
      }

      // 2. Eliminar de user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);
      
      if (profileError) {
       
      } else {
       
      }

      // 3. Eliminar de Supabase Auth (si supabaseAdmin está disponible)
      if (supabaseAdmin) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId);

        } catch (authError) {
         
        }
      } else {
       
      }

      
    } catch (error) {
     
      throw error;
    }
  }
} 
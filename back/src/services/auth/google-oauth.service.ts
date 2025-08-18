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
      console.log('=== GoogleOAuthService.handleCallback Started ===');
      console.log('Authorization code received:', code.substring(0, 20) + '...');

      // Intercambiar el código por tokens
      console.log('Exchanging code for tokens...');
      const { tokens } = await this.oAuth2Client.getToken(code);
      this.oAuth2Client.setCredentials(tokens);

      console.log('Tokens received from Google:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        accessTokenPrefix: tokens.access_token?.substring(0, 20) + '...',
        expiryDate: tokens.expiry_date
      });

      // Obtener información del usuario desde Google
      console.log('Getting user info from Google...');
      const userInfo = await this.getUserInfo(tokens.access_token!);

      console.log('User info from Google:', {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        verified: userInfo.verified_email
      });

      // Buscar usuario en nuestra base de datos (user_profiles)
      console.log('Searching for existing user in user_profiles...');
      let user = await this.userService.getUserByEmail(userInfo.email);

      if (!user) {
        console.log('User not found in user_profiles, checking Supabase Auth...');
        
        // Verificar si el usuario existe en Supabase Auth pero no en user_profiles
        const authUser = await this.userService.getUserFromAuthByEmail(userInfo.email);
        
        if (authUser) {
          console.log('User exists in Supabase Auth but not in user_profiles, creating profile...');
          // Usuario existe en Auth pero no en profiles - crear solo el profile
          const userData = {
            email: userInfo.email,
            full_name: userInfo.name,
            avatar_url: userInfo.picture,
            password: '', // No se usa para usuarios OAuth
            role: 'user' as const
          };

          user = await this.userService.createUserProfileForExistingAuth(authUser.id, userData);
          console.log('✅ User profile created for existing auth user:', {
            id: user.id,
            email: user.email
          });

          // Actualizar metadatos del usuario en Supabase Auth para OAuth
          if (supabaseAdmin) {
            try {
              await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
                app_metadata: {
                  provider: 'google',
                  providers: ['google']
                },
                user_metadata: {
                  avatar_url: userInfo.picture,
                  full_name: userInfo.name,
                  provider: 'google'
                }
              });
              console.log('✅ Auth user metadata updated for OAuth');
            } catch (updateError) {
              console.warn('Error updating auth user metadata:', updateError);
            }
          }
        } else {
          console.log('User not found anywhere, creating new OAuth user...');
          // Usuario no existe en ningún lado - crear usuario OAuth completo
          const newUserData = {
            email: userInfo.email,
            full_name: userInfo.name,
            avatar_url: userInfo.picture,
            password: this.generateRandomPassword(), // Password temporal, no se usará
            phone: '',
            company: '',
            position: '',
            address: '',
            city: '',
            role: 'user' as const,
            googleId: userInfo.id // ID de Google para crear la identidad OAuth correctamente
          };

          console.log('Creating user with data:', {
            email: newUserData.email,
            full_name: newUserData.full_name,
            googleId: newUserData.googleId
          });

          user = await this.userService.createGoogleOAuthUser(newUserData);
          console.log('✅ New user created successfully:', {
            id: user.id,
            email: user.email
          });
        }
      } else {
        console.log('Existing user found, updating information...');
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
              console.warn('Error updating existing user metadata:', updateError);
            } else {
              console.log('✅ User metadata updated successfully');
            }
          } catch (updateError) {
            console.warn('Error updating user metadata:', updateError);
          }
        }
        
        // Obtener usuario actualizado
        const updatedUser = await this.userService.getUserById(user.id);
        if (!updatedUser) {
          throw new Error('Error al obtener usuario actualizado');
        }
        user = updatedUser;
        console.log('✅ Existing user updated successfully');
      }

      // Verificar que el usuario existe antes de generar tokens
      if (!user) {
        throw new Error('Usuario no encontrado después del proceso de autenticación');
      }

      console.log('Generating JWT tokens for user:', {
        id: user.id,
        email: user.email
      });

      // Generar tokens JWT
      const token = generateToken(user);
      const refreshToken = generateToken(user, '7d');

      console.log('✅ JWT tokens generated successfully:', {
        tokenLength: token.length,
        refreshTokenLength: refreshToken.length
      });

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

      console.log('✅ GoogleOAuthService.handleCallback completed successfully');
      return result;

    } catch (error) {
      console.error('❌ Error en Google OAuth callback:', error);
      
      // Proporcionar mensajes de error más específicos
      if (error instanceof Error) {
        if (error.message.includes('email_exists') || error.message.includes('already been registered')) {
          console.error('Inconsistencia detectada: usuario existe en Supabase Auth pero no en user_profiles');
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
      console.error('Error obteniendo información del usuario de Google:', error);
      throw error;
    }
  }

  /**
   * Genera una contraseña aleatoria para usuarios de Google OAuth
   */
  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
  }
} 
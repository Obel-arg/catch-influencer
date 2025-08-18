import { Request, Response } from 'express';
import { UserService } from '../../services/user';
import { UserCreateDTO, UserLoginDTO } from '../../models/user/user.model';
import { generateToken, verifyToken } from '../../services/auth';
import { GoogleOAuthService } from '../../services/auth/google-oauth.service';
import supabase from '../../config/supabase';
import { config } from '../../config/environment';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(req: Request, res: Response) {
    try {
      const userData: UserCreateDTO = req.body;
      const user = await this.userService.createUser(userData);
      
      // Generar token JWT
      const token = generateToken(user);
      
      // Generar refresh token (por simplicidad, usaremos el mismo token pero con mayor duración)
      const refreshToken = generateToken(user, '7d');

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          name: user.name,
          avatar_url: user.avatar_url,
          role: user.role
        },
        token,
        refreshToken
      });
    } catch (error) {
      console.error('Error en registro:', error);
      if (error instanceof Error) {
        res.status(error.message.includes('espera') ? 429 : 500).json({ 
          error: error.message 
        });
      } else {
        res.status(500).json({ error: 'Error en el registro' });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password }: UserLoginDTO = req.body;
      // Autenticar con Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (authError) throw authError;
      // Obtener datos del usuario
      const userProfile = await this.userService.getUserById(authData.user.id);
      if (!userProfile) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      // Construir objeto user con el id de Supabase Auth
      const user = {
        ...userProfile,
        id: authData.user.id // id correcto para el token y frontend
      };
      // Generar token JWT
      const token = generateToken(user);
      
      // Generar refresh token (por simplicidad, usaremos el mismo token pero con mayor duración)
      const refreshToken = generateToken(user, '7d');
     
      res.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          name: user.name,
          avatar_url: user.avatar_url,
          role: user.role
        },
        token,
        refreshToken
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token requerido' });
      }

      // Verificar el refresh token
      const decoded = verifyToken(refreshToken);
      
      // Obtener datos actualizados del usuario
      const user = await this.userService.getUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Generar nuevo token de acceso
      const newToken = generateToken(user);
      
      // Opcionalmente generar un nuevo refresh token
      const newRefreshToken = generateToken(user, '7d');

      res.json({
        token: newToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      console.error('Error en refresh token:', error);
      res.status(401).json({ error: 'Refresh token inválido' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ error: 'Error al cerrar sesión' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      res.json({ message: 'Instrucciones de recuperación enviadas' });
    } catch (error) {
      console.error('Error en reset password:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      // Obtener datos del usuario
      const user = await this.userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      // Obtener settings adicionales
      let settings = null;
      try {
        settings = await this.userService.getUserSettings(userId);
      } catch (e) {
        settings = null;
      }
      // Obtener organizaciones y membresías
      const orgMemberships = await this.userService.getUserOrganizations(userId);
      const organizations = orgMemberships.map((m: any) => ({
        id: m.organizations.id,
        organization_id: m.organizations.id,
        name: m.organizations.name,
        logo_url: m.organizations.logo_url,
        status: m.organizations.status,
        user_id: userId,
        member: {
          id: m.id,
          role: m.role,
          created_at: m.created_at,
          updated_at: m.updated_at
        }
      }));
      res.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          name: user.name,
          avatar_url: user.avatar_url,
          role: user.role,
          phone: settings?.phone || '',
          company: settings?.company || '',
          position: settings?.position || '',
          address: settings?.address || '',
          city: settings?.city || ''
        },
        organizations
      });
    } catch (error) {
      console.error('Error en /me:', error);
      res.status(500).json({ error: 'Error al obtener datos del usuario' });
    }
  }

  /**
   * Inicia el flujo de autenticación con Google
   */
  async googleAuth(req: Request, res: Response) {
    try {
      // Detectar el dominio de origen
      const originDomain = this.getOriginDomain(req);
      
      const googleOAuthService = GoogleOAuthService.getInstance(this.userService);
      
      // Pasar el dominio de origen en el parámetro state
      const state = encodeURIComponent(JSON.stringify({ origin: originDomain }));
      const authUrl = googleOAuthService.getAuthUrl(state);
      
      console.log('🔐 Google OAuth iniciado desde:', originDomain);
      
      // Redirigir al usuario a Google para autenticación
      res.redirect(authUrl);
    } catch (error) {
      console.error('Error iniciando Google OAuth:', error);
      res.status(500).json({ error: 'Error al inicializar autenticación con Google' });
    }
  }

  /**
   * Maneja el callback de Google OAuth
   */
  async googleCallback(req: Request, res: Response) {
    try {
      
      const { code, error: oauthError, state } = req.query;

      if (oauthError) {
        console.error('OAuth error from Google:', oauthError);
        // Detectar el dominio de origen desde el state o referer
        const originDomain = this.getOriginDomain(req);
        const errorUrl = `${originDomain}/auth/login?error=oauth_error&details=${oauthError}`;
        return res.redirect(errorUrl);
      }

      if (!code || typeof code !== 'string') {
        console.error('No authorization code provided');
        return res.status(400).json({ error: 'Código de autorización requerido' });
      }

      const googleOAuthService = GoogleOAuthService.getInstance(this.userService);
      
      const result = await googleOAuthService.handleCallback(code);

      // Detectar el dominio de origen para redirigir correctamente
      const originDomain = this.getOriginDomain(req);
      const redirectUrl = `${originDomain}/auth/callback?token=${encodeURIComponent(result.token)}&refreshToken=${encodeURIComponent(result.refreshToken)}`;
      
      console.log('🔄 Google OAuth callback - Redirigiendo a:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Error en Google OAuth callback:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
      
      // Detectar el dominio de origen para redirigir correctamente
      const originDomain = this.getOriginDomain(req);
      const errorMessage = error instanceof Error ? error.message : 'unknown_error';
      const errorUrl = `${originDomain}/auth/login?error=google_auth_failed&details=${encodeURIComponent(errorMessage)}`;
      
      res.redirect(errorUrl);
    }
  }

  /**
   * Detecta el dominio de origen de la petición
   */
  private getOriginDomain(req: Request): string {
    // Intentar obtener el dominio desde el state parameter (si se pasó)
    const state = req.query.state;
    if (state && typeof state === 'string') {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        if (stateData.origin) {
          return stateData.origin;
        }
      } catch (e) {
        console.log('No se pudo parsear el state parameter');
      }
    }

    // Intentar obtener desde el referer header
    const referer = req.headers.referer;
    if (referer) {
      try {
        const url = new URL(referer);
        // Verificar que el dominio esté en la lista de CORS permitidos
        if (config.corsOrigins.includes(url.origin)) {
          return url.origin;
        }
      } catch (e) {
        console.log('No se pudo parsear el referer header');
      }
    }

    // Fallback al dominio por defecto
    return config.urls.frontend;
  }

  /**
   * Endpoint alternativo para autenticación con Google que devuelve JSON
   * Útil para llamadas AJAX desde el frontend
   */
  async googleAuthJson(req: Request, res: Response) {
    try {
      const googleOAuthService = GoogleOAuthService.getInstance(this.userService);
      const authUrl = googleOAuthService.getAuthUrl();
      
      res.json({ authUrl });
    } catch (error) {
      console.error('Error obteniendo URL de Google OAuth:', error);
      res.status(500).json({ error: 'Error al generar URL de autenticación' });
    }
  }

  /**
   * Endpoint de debug para verificar el estado del usuario en Supabase
   */
  async debugUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID requerido' });
      }

      // Obtener usuario de Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) {
        return res.status(404).json({ error: 'Usuario no encontrado en Supabase Auth', details: authError });
      }

      // Obtener usuario de nuestra base de datos
      const dbUser = await this.userService.getUserById(userId);

      res.json({
        supabaseAuth: {
          id: authUser.user?.id,
          email: authUser.user?.email,
          confirmed_at: authUser.user?.confirmed_at,
          app_metadata: authUser.user?.app_metadata,
          user_metadata: authUser.user?.user_metadata,
          identities: authUser.user?.identities?.map(i => ({
            provider: i.provider,
            id: i.id
          }))
        },
        database: dbUser ? {
          id: dbUser.id,
          email: dbUser.email,
          full_name: dbUser.full_name,
          avatar_url: dbUser.avatar_url,
          role: dbUser.role
        } : null
      });
    } catch (error) {
      console.error('Error en debug user:', error);
      res.status(500).json({ error: 'Error al obtener información del usuario' });
    }
  }

  /**
   * Endpoint simple para probar autenticación
   */
  async testAuth(req: Request, res: Response) {
    try {
      const user = req.user as any; // El token decodificado puede tener una estructura diferente

      res.json({
        message: 'Autenticación exitosa',
        user: {
          id: user?.id,
          email: user?.email,
          full_name: user?.full_name,
          name: user?.name,
          avatar_url: user?.avatar_url,
          role: user?.role
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en test auth:', error);
      res.status(500).json({ error: 'Error al procesar test de autenticación' });
    }
  }

  /**
   * Endpoint para verificar configuración de Google OAuth
   */
  async debugConfig(req: Request, res: Response) {
    try {
      res.json({
        google: {
          hasClientId: !!config.google.clientId,
          hasClientSecret: !!config.google.clientSecret,
          redirectUri: config.google.redirectUri,
          clientIdPrefix: config.google.clientId ? config.google.clientId.substring(0, 20) + '...' : 'NO_CLIENT_ID'
        },
        supabase: {
          hasUrl: !!config.supabase.url,
          hasAnonKey: !!config.supabase.anonKey,
          hasServiceKey: !!config.supabase.serviceKey,
          urlPrefix: config.supabase.url ? config.supabase.url.substring(0, 30) + '...' : 'NO_URL'
        },
        jwt: {
          hasSecret: !!config.jwtSecret,
          expiresIn: config.jwtExpiresIn
        },
        environment: config.nodeEnv,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en debug config:', error);
      res.status(500).json({ error: 'Error al obtener configuración' });
    }
  }

  /**
   * Endpoint para verificar inconsistencias entre Supabase Auth y user_profiles
   */
  async debugUserConsistency(req: Request, res: Response) {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email requerido como query parameter' });
      }

      // Buscar en user_profiles
      const profileUser = await this.userService.getUserByEmail(email);
      
      // Buscar en Supabase Auth
      const authUser = await this.userService.getUserFromAuthByEmail(email);

      res.json({
        email,
        consistency: {
          inUserProfiles: !!profileUser,
          inSupabaseAuth: !!authUser,
          isConsistent: (!!profileUser) === (!!authUser)
        },
        userProfiles: profileUser ? {
          id: profileUser.id,
          email: profileUser.email,
          full_name: profileUser.full_name,
          role: profileUser.role
        } : null,
        supabaseAuth: authUser ? {
          id: authUser.id,
          email: authUser.email,
          confirmed_at: authUser.confirmed_at,
          app_metadata: authUser.app_metadata,
          identities: authUser.identities?.map((i: any) => ({
            provider: i.provider,
            id: i.id
          }))
        } : null,
        recommendation: 
          !profileUser && authUser ? 'Crear profile para usuario existente en Auth' :
          profileUser && !authUser ? 'Inconsistencia crítica: usuario en profiles pero no en Auth' :
          !profileUser && !authUser ? 'Usuario no existe en ningún lado' :
          'Usuario consistente en ambos sistemas',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en debug user consistency:', error);
      res.status(500).json({ error: 'Error al verificar consistencia del usuario' });
    }
  }
} 
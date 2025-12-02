import { Request, Response } from 'express';
import { UserService } from '../../services/user';
import { UserCreateDTO, UserLoginDTO } from '../../models/user/user.model';
import { generateToken, generateRefreshToken, verifyToken } from '../../services/auth';
import { GoogleOAuthService } from '../../services/auth/google-oauth.service';
import supabase, { supabaseAdmin } from '../../config/supabase';
import { config } from '../../config/environment';
import { UserBrandService } from '../../services/user/user-brand.service';

export class AuthController {
  private userService: UserService;
  private userBrandService: UserBrandService;

  constructor() {
    this.userService = new UserService();
    this.userBrandService = new UserBrandService();
  }

  async register(req: Request, res: Response) {
    try {
      const userData: UserCreateDTO = req.body;
      const user = await this.userService.createUser(userData);
      
      // Generar token JWT
      const token = generateToken(user);
      
      // Generar refresh token específico
      const refreshToken = generateRefreshToken(user);

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
      
      // Generar refresh token específico
      const refreshToken = generateRefreshToken(user);
     
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
      
      // 🔐 MEJORA: Validar que sea un refresh token válido
      if (decoded.type !== 'refresh') {
        return res.status(401).json({ error: 'Token no es un refresh token válido' });
      }
      
      // Obtener datos actualizados del usuario
      const user = await this.userService.getUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Generar nuevo token de acceso
      const newToken = generateToken(user);
      
      // Generar nuevo refresh token
      const newRefreshToken = generateRefreshToken(user);

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
      
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Error en Google OAuth callback:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
      
      // Detectar el dominio de origen para redirigir correctamente
      const originDomain = this.getOriginDomain(req);
      
      // Manejar específicamente el error de acceso denegado
      if (error instanceof Error && error.message.includes('ACCESS_DENIED')) {
       
        const errorUrl = `${originDomain}/auth/login?error=access_denied&message=${encodeURIComponent('Solo usuarios invitados pueden acceder al sistema.')}`;
        return res.redirect(errorUrl);
      }
      
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
       
      }
    }

    // Intentar obtener desde el origin header
    const origin = req.headers.origin;
    if (origin && config.corsOrigins.includes(origin)) {
     
      return origin;
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
   * Endpoint para verificar si un usuario está autorizado (existe en user_profiles)
   */
  async checkUserAuthorization(req: Request, res: Response) {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email requerido como query parameter' });
      }

      // Verificar si el usuario existe en user_profiles
      const user = await this.userService.getUserByEmail(email);
      
      if (!user) {
        return res.status(403).json({ 
          authorized: false, 
          message: 'Usuario no autorizado. Solo usuarios invitados pueden acceder al sistema.' 
        });
      }

      res.json({ 
        authorized: true, 
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error verificando autorización de usuario:', error);
      res.status(500).json({ error: 'Error al verificar autorización' });
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
   * Endpoint para eliminar completamente un usuario de todas las tablas
   */
  async deleteUserCompletely(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email requerido' });
      }

     
      // 1. Buscar en user_profiles
      const profileUser = await this.userService.getUserByEmail(email);
      
      // 2. Buscar en Supabase Auth
      const authUser = await this.userService.getUserFromAuthByEmail(email);

      if (!profileUser && !authUser) {
        return res.status(404).json({ 
          message: 'Usuario no encontrado en ninguna tabla',
          email 
        });
      }

      // 3. Eliminar de organization_members si existe
      if (profileUser || authUser) {
        const userId = profileUser?.id || authUser?.id;
        
        if (userId) {
          const { error: orgError } = await supabase
            .from('organization_members')
            .delete()
            .eq('user_id', userId);
          
          if (orgError) {
            console.warn('Error eliminando de organization_members:', orgError);
          } else {
           
          }
        }
      }

      // 4. Eliminar de user_profiles si existe
      if (profileUser) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', profileUser.id);
        
        if (profileError) {
          console.warn('Error eliminando de user_profiles:', profileError);
        } else {
         
        }
      }

      // 5. Eliminar de Supabase Auth si existe
      if (authUser && supabaseAdmin) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUser.id);
         
        } catch (authError) {
          console.warn('Error eliminando de Supabase Auth:', authError);
        }
      }

      res.json({ 
        message: 'Usuario eliminado completamente',
        email,
        deletedFrom: {
          userProfiles: !!profileUser,
          supabaseAuth: !!authUser
        }
      });
    } catch (error) {
      console.error('Error eliminando usuario completamente:', error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
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

  /**
   * Endpoint para solicitar reset de contraseña
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email requerido' });
      }

      // Verificar que el usuario existe
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        // Por seguridad, no revelar si el email existe o no
        return res.status(200).json({ 
          message: 'Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña' 
        });
      }

      // Generar token de reset (válido por 1 hora)
      const resetToken = generateToken({ email, type: 'password_reset' } as any, '1h');
      
      // En un entorno real, aquí enviarías el email
      // Por ahora, solo logueamos el token
     

      res.status(200).json({ 
        message: 'Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña' 
      });
    } catch (error) {
      console.error('Error en forgot password:', error);
      res.status(500).json({ error: 'Error al procesar solicitud de reset de contraseña' });
    }
  }

  /**
   * Endpoint para verificar token de reset
   */
  async verifyResetToken(req: Request, res: Response) {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ error: 'Token requerido' });
      }

      // Verificar el token
      const decoded = verifyToken(token);
      
      if (!decoded || decoded.type !== 'password_reset') {
        return res.status(400).json({ error: 'Token inválido o expirado' });
      }

      res.status(200).json({ valid: true });
    } catch (error) {
      console.error('Error en verify reset token:', error);
      res.status(400).json({ error: 'Token inválido o expirado' });
    }
  }

  /**
   * Endpoint para resetear contraseña
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
      }

      // Verificar el token
      const decoded = verifyToken(token);
      
      if (!decoded || decoded.type !== 'password_reset') {
        return res.status(400).json({ error: 'Token inválido o expirado' });
      }

      // Actualizar contraseña en Supabase
      const { error } = await supabase.auth.admin.updateUserById(
        decoded.id || decoded.email,
        { password: newPassword }
      );

      if (error) {
        console.error('Error actualizando contraseña en Supabase:', error);
        return res.status(500).json({ error: 'Error al actualizar contraseña' });
      }

      res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('Error en reset password:', error);
      res.status(500).json({ error: 'Error al resetear contraseña' });
    }
  }

  /**
   * Maneja las redirecciones de invitación de Supabase
   * Redirige al frontend con los tokens correctos
   */
  async handleInviteRedirect(req: Request, res: Response) {
    try {
      const { token, type, error, error_description } = req.query;

      // Si hay error, redirigir al login con el error
      if (error) {
        const frontendUrl = config.urls.frontend;
        const errorUrl = `${frontendUrl}/auth/login?error=invite_error&details=${encodeURIComponent(String(error_description || error))}`;
        return res.redirect(errorUrl);
      }

      // Si no hay token, error
      if (!token || typeof token !== 'string') {
        const frontendUrl = config.urls.frontend;
        const errorUrl = `${frontendUrl}/auth/login?error=no_token`;
        return res.redirect(errorUrl);
      }

      // Verificar que supabaseAdmin esté disponible
      if (!supabaseAdmin) {
        const frontendUrl = config.urls.frontend;
        const errorUrl = `${frontendUrl}/auth/login?error=admin_not_configured`;
        return res.redirect(errorUrl);
      }

      // Obtener el usuario directamente usando el token
      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(token);

      if (userError || !user) {
        console.error('❌ Error obteniendo usuario:', userError);
        const frontendUrl = config.urls.frontend;
        const errorUrl = `${frontendUrl}/auth/login?error=invalid_token`;
        return res.redirect(errorUrl);
      }

      // Verificar que el usuario existe en user_profiles
      let userProfile = await this.userService.getUserByEmail(user.email!);

      // Si el usuario no existe en user_profiles, crearlo
      if (!userProfile) {
        console.log('📝 Creando perfil de usuario para:', user.email);
        try {
          // Extraer datos del user_metadata si están disponibles
          const metadata = user.user_metadata || {};
          const fullName = metadata.full_name || user.email?.split('@')[0] || 'Usuario';
          const avatarUrl = metadata.avatar_url || null;

          // Crear el perfil del usuario
          userProfile = await this.userService.createUserProfileForExistingAuth(user.id, {
            email: user.email!,
            full_name: fullName,
            avatar_url: avatarUrl,
            password: '', // No es necesario para usuarios invitados
            role: 'member'
          });
          console.log('✅ Perfil de usuario creado:', userProfile.id);
        } catch (profileError) {
          console.error('❌ Error creando perfil de usuario:', profileError);
          const frontendUrl = config.urls.frontend;
          const errorUrl = `${frontendUrl}/auth/login?error=profile_creation_failed`;
          return res.redirect(errorUrl);
        }
      }

      // Obtener la organización ID del user_metadata si está disponible
      const orgId = user.user_metadata?.organization_id;
      if (orgId) {
        try {
          // Intentar agregar el usuario a la organización si se especificó
          const role = user.user_metadata?.role || 'member';
          const { error: memberError } = await supabase
            .from('organization_members')
            .insert([{
              organization_id: orgId,
              user_id: user.id,
              role,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);

          if (memberError && !memberError.message.includes('duplicate key')) {
            console.warn('⚠️ Error agregando usuario a organización:', memberError);
          } else if (!memberError) {
            console.log('✅ Usuario agregado a la organización:', orgId);
          }

          // Asignar marcas si están especificadas en el metadata y el rol no es admin
          const brandIds = user.user_metadata?.brand_ids;
          if (role !== 'admin' && brandIds && Array.isArray(brandIds) && brandIds.length > 0) {
            try {
              await this.userBrandService.assignUserToBrands(
                user.id,
                brandIds,
                orgId
              );
              console.log(`✅ Marcas asignadas al usuario: ${brandIds.length} marcas`);
            } catch (brandError) {
              console.warn('⚠️ Error asignando marcas al usuario:', brandError);
              // No lanzamos error aquí, continuamos con el login
            }
          }
        } catch (error) {
          console.warn('⚠️ Error procesando agregar usuario a organización:', error);
          // No lanzamos error aquí, continuamos con el login
        }
      }

      // Crear sesión temporal para el usuario
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email!,
        options: {
          redirectTo: `${config.urls.frontend}/auth/invite-callback`
        }
      });

      if (sessionError) {
        console.error('❌ Error generando sesión:', sessionError);
        const frontendUrl = config.urls.frontend;
        const errorUrl = `${frontendUrl}/auth/login?error=session_error`;
        return res.redirect(errorUrl);
      }

      // Extraer tokens de la URL generada
      const url = new URL(sessionData.properties.action_link);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');

      if (!accessToken || !refreshToken) {
        console.error('❌ No se pudieron extraer tokens de la sesión');
        const frontendUrl = config.urls.frontend;
        const errorUrl = `${frontendUrl}/auth/login?error=token_extraction_error`;
        return res.redirect(errorUrl);
      }

      // Redirigir al frontend con los tokens
      const frontendUrl = config.urls.frontend;
      const redirectUrl = `${frontendUrl}/auth/invite-callback?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}&type=invite`;

      res.redirect(redirectUrl);

    } catch (error) {
      console.error('❌ Error procesando redirección de invitación:', error);
      const frontendUrl = config.urls.frontend;
      const errorUrl = `${frontendUrl}/auth/login?error=invite_processing_error`;
      res.redirect(errorUrl);
    }
  }
} 
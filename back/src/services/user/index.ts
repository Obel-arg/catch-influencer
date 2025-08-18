import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { User, UserCreateDTO, UserUpdateDTO, UserPreferences, UserSettings } from '../../models/user/user.model';

const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || ''
);

// Cliente admin para operaciones que requieren permisos especiales
const supabaseAdmin = createClient(
  config.supabase.url || '',
  config.supabase.serviceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export class UserService {
  async createUser(data: UserCreateDTO): Promise<User> {
    try {
      // 1. Crear el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // 2. Insertar en user_profiles
      const { data: user, error } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  /**
   * Crea un usuario específicamente para Google OAuth sin enviar correo de confirmación
   * El email ya está verificado por Google
   */
  async createGoogleOAuthUser(data: UserCreateDTO & { googleId: string }): Promise<User> {
    try {
      // 1. Crear el usuario en Supabase Auth usando admin client
      // SIN password para que sea reconocido como OAuth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        email_confirm: true, // El email ya está verificado por Google
        user_metadata: {
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          provider: 'google',
          sub: data.googleId
        },
        app_metadata: {
          provider: 'google',
          providers: ['google']
        }
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // 2. Actualizar metadatos del usuario para indicar que es OAuth
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        {
          app_metadata: {
            provider: 'google',
            providers: ['google']
          }
        }
      );

      if (updateError) {
        console.warn('Error updating user metadata:', updateError);
        // No lanzamos error porque el usuario ya fue creado
      }

      // 3. Insertar en user_profiles (sin columna 'name' que no existe)
      const { data: user, error } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          role: data.role || 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Mapear user_id a id para coincidir con el modelo User
      return {
        ...user,
        id: user.user_id
      };
    } catch (error) {
      console.error('Error creando usuario de Google OAuth:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) return null;
    
    // Mapear user_id a id para coincidir con el modelo User
    return {
      ...data,
      id: data.user_id
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) return null;
    
    // Mapear user_id a id para coincidir con el modelo User
    return {
      ...data,
      id: data.user_id
    };
  }

  /**
   * Busca usuario por email en Supabase Auth (no en user_profiles)
   */
  async getUserFromAuthByEmail(email: string): Promise<any | null> {
    if (!supabaseAdmin) {
      return null;
    }

    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        console.error('Error listing users from Supabase Auth:', error);
        return null;
      }

      const user = data.users.find(u => u.email === email);
      return user || null;
    } catch (error) {
      console.error('Error searching user in Supabase Auth:', error);
      return null;
    }
  }

  /**
   * Crea solo el registro en user_profiles para un usuario que ya existe en Supabase Auth
   */
  async createUserProfileForExistingAuth(authUserId: string, userData: UserCreateDTO): Promise<User> {
    try {

      // Insertar en user_profiles (sin columna 'name' que no existe)
      const { data: user, error } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authUserId,
          email: userData.email,
          full_name: userData.full_name,
          avatar_url: userData.avatar_url,
          role: userData.role || 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Mapear user_id a id para coincidir con el modelo User
      return {
        ...user,
        id: user.user_id
      };
    } catch (error) {
      console.error('Error creating user profile for existing auth:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async updateUser(id: string, data: UserUpdateDTO): Promise<User> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: user, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', id)
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select()
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('account_settings')
      .select()
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    // Intentar update primero
    const { data, error, count } = await supabase
      .from('account_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    // Si no hay filas afectadas, hacer insert
    if ((error && error.code === 'PGRST116') || !data) {
      const { data: inserted, error: insertError } = await supabase
        .from('account_settings')
        .insert([
          {
            ...settings,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      if (insertError) throw insertError;
      return inserted;
    }
    if (error) throw error;
    return data;
  }

  async getUserOrganizations(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        organizations (
          id,
          name,
          logo_url,
          status
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async getUserTeams(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        teams (
          id,
          name,
          organization_id
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }
} 
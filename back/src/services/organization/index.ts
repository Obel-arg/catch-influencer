import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { supabaseAdmin } from '../../config/supabase';
import { Organization, OrganizationCreateDTO, OrganizationUpdateDTO } from '../../models/organization/organization.model';
import { User } from '../../models/user/user.model';

const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || ''
);

export class OrganizationService {
  async createOrganization(data: any, userId: string): Promise<Organization> {
    const organizationData: any = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      onboarding_completed: false
    };
    if (data.website) {
      organizationData.website_url = data.website;
      delete organizationData.website;
    }
    if (data.logo) {
      organizationData.logo_url = data.logo;
      delete organizationData.logo;
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .insert([organizationData])
      .select()
      .single();

    if (error) throw error;

    // Agregar al usuario como miembro admin
    const memberError = await this.addMemberToOrganization(organization.id, userId, 'admin').catch(e => e);
    if (memberError) throw memberError;

    return organization;
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getOrganizationsByUserId(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select()
      .eq('created_by', userId);

    if (error) throw error;
    return data || [];
  }

  async updateOrganization(id: string, data: OrganizationUpdateDTO): Promise<Organization> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: organization, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return organization;
  }

  async deleteOrganization(id: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .update({ 
        status: 'deleted',
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async getOrganizationMembers(
    organizationId: string, 
    options: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
    } = {}
  ): Promise<{ members: any[], total: number, totalPages: number }> {
    const { page = 1, limit = 5, search, role } = options;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .rpc('get_organization_members_with_profiles', {
        org_id: organizationId
      });

    // Obtener todos los datos primero para calcular el total
    const { data: allData, error } = await query;
    if (error) throw error;
    
    let filteredData = allData || [];

    // Aplicar filtros si están presentes
    if (search) {
      filteredData = filteredData.filter((member: any) => {
        const searchLower = search.toLowerCase();
        return (
          member.user_profiles?.full_name?.toLowerCase().includes(searchLower) ||
          member.user_profiles?.email?.toLowerCase().includes(searchLower) ||
          member.role?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    if (role && role !== 'all') {
      filteredData = filteredData.filter((member: any) => member.role === role);
    }

    // Calcular totales
    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    
    // Aplicar paginado - obtener la página actual + una extra
    const startIndex = offset;
    const endIndex = offset + (limit * 2); // Obtener 2 páginas
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      members: paginatedData,
      total,
      totalPages
    };
  }

  async addMemberToOrganization(organizationId: string, userId: string, role: string): Promise<void> {
    // Verificar si ya existe
    const { data: existing, error: selectError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) {
      console.error('Error verificando miembro existente:', selectError);
      throw selectError;
    }
    
    if (existing) {
      return; // Ya existe, no insertar
    }

    const { error } = await supabase
      .from('organization_members')
      .insert([{
        organization_id: organizationId,
        user_id: userId,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error insertando miembro:', error);
      throw error;
    }
    
  }

  async removeMemberFromOrganization(organizationId: string, userId: string): Promise<void> {
    console.log('🗑️ Iniciando eliminación en cascada para usuario:', userId);
    
    try {
      // 1. Eliminar de organization_members
      const { error: orgError } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (orgError) {
        console.error('❌ Error eliminando de organization_members:', orgError);
        throw orgError;
      }
      console.log('✅ Usuario eliminado de organization_members');

      // 2. Eliminar de campaign_members (si existe)
      const { error: campaignError } = await supabase
        .from('campaign_members')
        .delete()
        .eq('user_id', userId);

      if (campaignError) {
        console.warn('⚠️ Error eliminando de campaign_members:', campaignError);
      } else {
        console.log('✅ Usuario eliminado de campaign_members');
      }

      // 3. Eliminar de team_members (si existe)
      const { error: teamError } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', userId);

      if (teamError) {
        console.warn('⚠️ Error eliminando de team_members:', teamError);
      } else {
        console.log('✅ Usuario eliminado de team_members');
      }

      // 4. Eliminar de user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) {
        console.error('❌ Error eliminando de user_profiles:', profileError);
        throw profileError;
      }
      console.log('✅ Usuario eliminado de user_profiles');

      // 5. Eliminar de auth.users (usando Supabase Admin)
      try {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) {
          console.error('❌ Error eliminando de auth.users:', authError);
          throw authError;
        }
        console.log('✅ Usuario eliminado de auth.users');
      } catch (authError) {
        console.error('❌ Error crítico eliminando de auth.users:', authError);
        throw authError;
      }

      console.log('🎉 Eliminación en cascada completada exitosamente');
    } catch (error) {
      console.error('❌ Error en eliminación en cascada:', error);
      throw error;
    }
  }

  async updateMemberRole(organizationId: string, userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('organization_members')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async updateMemberName(organizationId: string, userId: string, fullName: string): Promise<void> {
    // Verificar que el usuario pertenece a la organización
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      throw new Error('Usuario no encontrado en la organización');
    }

    // Actualizar el nombre en user_profiles
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        full_name: fullName,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Verificar si un usuario es admin de la organización
  async isUserAdmin(organizationId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single();

    if (error) return false;
    return data?.role === 'admin';
  }

  // Invitar usuario por email usando Supabase Auth
  async inviteUser(organizationId: string, email: string, fullName: string, role: string, invitedBy: string): Promise<any> {
    // Verificar que quien invita sea admin
    const isAdmin = await this.isUserAdmin(organizationId, invitedBy);
    if (!isAdmin) {
      throw new Error('Solo los administradores pueden invitar usuarios');
    }

    if (!supabaseAdmin) {
      throw new Error('Configuración de Supabase Admin no disponible');
    }

    // Primero, verificar si el usuario ya existe en Supabase Auth
    const { data: existingUser, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error al buscar usuarios existentes:', userError);
      throw new Error('Error al verificar usuarios existentes');
    }

    const userExists = existingUser.users.find(user => user.email === email);
    
    if (userExists) {
      // El usuario ya existe, agregarlo directamente a la organización
      console.log('Usuario existente encontrado, agregando a organización:', {
        userId: userExists.id,
        organizationId,
        role
      });
      
      try {
        await this.addMemberToOrganization(organizationId, userExists.id, role);
        console.log('Usuario agregado exitosamente a la organización');
        return {
          message: 'Usuario agregado exitosamente a la organización',
          user_id: userExists.id,
          action: 'added_to_organization'
        };
      } catch (addError: any) {
        console.error('Error agregando usuario existente a organización:', addError);
        if (addError.message.includes('duplicate key') || addError.message.includes('already exists')) {
          throw new Error('Este usuario ya pertenece a la organización');
        }
        throw new Error('Error al agregar usuario a la organización');
      }
    }

    // Obtener información de la organización y del usuario que invita
    const [organizationData, inviterData] = await Promise.all([
      supabase.from('organizations').select('name').eq('id', organizationId).single(),
      supabase.from('user_profiles').select('full_name').eq('id', invitedBy).single()
    ]);

    const organizationName = organizationData?.data?.name || 'Organización';
    const inviterName = inviterData?.data?.full_name || 'Usuario';

    // El usuario no existe, enviar invitación

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        organization_id: organizationId,
        organization_name: organizationName,
        role: role,
        invited_by: invitedBy,
        inviter_name: inviterName,
        full_name: fullName
      },
      redirectTo: `${config.urls.frontend}/auth/invite-callback`
    });

    if (error) {
      console.error('Error detallado de Supabase:', error);
      
      // Manejar errores específicos de Supabase Auth
      if (error.message.includes('already registered') || 
          error.message.includes('already exists') ||
          error.message.includes('duplicate key') ||
          error.message.includes('users_email_partial_key')) {
        throw new Error('Este email ya está registrado. El usuario ya tiene una cuenta en la plataforma.');
      }
      
      if (error.message.includes('Database error')) {
        throw new Error('Error en la base de datos. Por favor intenta de nuevo en unos minutos.');
      }
      
      throw new Error(`Error al enviar invitación: ${error.message}`);
    }

    return {
      message: 'Invitación enviada exitosamente',
      invitation: data,
      action: 'invitation_sent'
    };
  }
} 
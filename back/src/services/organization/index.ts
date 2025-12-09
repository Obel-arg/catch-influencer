import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { supabaseAdmin } from '../../config/supabase';
import { Organization, OrganizationCreateDTO, OrganizationUpdateDTO } from '../../models/organization/organization.model';
import { User } from '../../models/user/user.model';
import { UserBrandService } from '../user/user-brand.service';

const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || ''
);

export class OrganizationService {
  private userBrandService: UserBrandService;

  constructor() {
    this.userBrandService = new UserBrandService();
  }

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

    // Aplicar paginado - obtener solo la página solicitada
    const startIndex = offset;
    const endIndex = offset + limit;
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

      throw error;
    }
    
  }

  async removeMemberFromOrganization(organizationId: string, userId: string): Promise<void> {
    try {
      // Only remove from organization_members
      // Don't delete the user's profile or auth account
      const { error: orgError } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (orgError) {
        console.error('Error removing member from organization:', orgError);
        throw orgError;
      }

      console.log(`✅ User ${userId} removed from organization ${organizationId}`);
    } catch (error) {
      console.error('Error in removeMemberFromOrganization:', error);
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

  // Validar formato de email
  private validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    // Normalizar email: trim y lowercase
    const normalizedEmail = email.trim().toLowerCase();
    
    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return false;
    }
    
    // Validar longitud
    if (normalizedEmail.length > 254) {
      return false;
    }
    
    return true;
  }

  // Invitar usuario por email usando Supabase Auth
  async inviteUser(
    organizationId: string,
    email: string,
    fullName: string,
    role: string,
    invitedBy: string,
    brandIds: string[] = []
  ): Promise<any> {
    // Validar y normalizar email
    if (!email || typeof email !== 'string') {
      throw new Error('El email es requerido y debe ser una cadena de texto');
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!this.validateEmail(normalizedEmail)) {
      throw new Error('El formato del email no es válido');
    }

    // Verificar que quien invita sea admin
    const isAdmin = await this.isUserAdmin(organizationId, invitedBy);
    if (!isAdmin) {
      throw new Error('Solo los administradores pueden invitar usuarios');
    }

    if (!supabaseAdmin) {
      throw new Error('Configuración de Supabase Admin no disponible');
    }

    // Validar que las marcas pertenecen a la organización (si no es admin)
    if (role !== 'admin' && brandIds.length > 0) {
      const brandValidations = await Promise.all(
        brandIds.map(brandId =>
          this.userBrandService.verifyBrandInOrganization(brandId, organizationId)
        )
      );

      if (brandValidations.some(valid => !valid)) {
        throw new Error('Una o más marcas no pertenecen a la organización');
      }
    }

    // Primero, verificar si el usuario ya existe en Supabase Auth
    const { data: existingUser, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      throw new Error('Error al verificar usuarios existentes');
    }

    const userExists = existingUser.users.find(user => user.email === email);

    if (userExists) {
      // El usuario ya existe, agregarlo directamente a la organización

      try {
        await this.addMemberToOrganization(organizationId, userExists.id, role);

        // Asignar marcas para usuarios no-admin
        if (role !== 'admin' && brandIds.length > 0) {
          await this.userBrandService.assignUserToBrands(
            userExists.id,
            brandIds,
            organizationId
          );
        }

        return {
          message: 'Usuario agregado exitosamente a la organización',
          user_id: userExists.id,
          action: 'added_to_organization',
          brands_assigned: role !== 'admin' ? brandIds.length : 0
        };
      } catch (addError: any) {
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

    // El usuario no existe, enviar invitación con brandIds en metadata
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        organization_id: organizationId,
        organization_name: organizationName,
        role: role,
        invited_by: invitedBy,
        inviter_name: inviterName,
        full_name: fullName,
        brand_ids: brandIds // Include brand IDs for new user setup
      },
      redirectTo: `${config.urls.frontend}/auth/invite-callback`
    });

    if (error) {

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
      action: 'invitation_sent',
      brands_to_assign: role !== 'admin' ? brandIds.length : 0
    };
  }
} 
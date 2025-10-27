import { httpClient } from '../../http';
import { 
  OrganizationMember, 
  UserRole, 
  InviteUserData, 
  UpdateUserRoleData,
  GetMembersResponse,
  UserStats,
  UserActivityLog,
  UserListFilters
} from '@/types/users';

export class UsersService {
  private baseUrl = '/organizations';

  /**
   * Obtiene todos los miembros de una organización
   */
  async getOrganizationMembers(
    organizationId: string, 
    filters?: UserListFilters & { page?: number; limit?: number }
  ): Promise<{ members: OrganizationMember[], total: number, totalPages: number }> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.team && filters.team !== 'all') params.append('team', filters.team);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = `${this.baseUrl}/${organizationId}/members${queryString ? `?${queryString}` : ''}`;
      
      const response = await httpClient.get<{ members: any[], total: number, totalPages: number }>(url);
      
      // Transformar los datos del backend al formato esperado del frontend
      const members = response.data.members?.map((member: any) => ({
        id: member.user_profiles?.id || member.id,
        membership_id: member.id,
        user_id: member.user_id,
        organization_id: member.organization_id,
        org_role: member.role,
        permissions: member.permissions,
        joined_at: member.created_at,
        email: member.user_profiles?.email || '',
        full_name: member.user_profiles?.full_name || null,
        avatar_url: member.user_profiles?.avatar_url || null,
        profile_role: member.user_profiles?.role || null,
        position: member.user_profiles?.position || null,
        company: member.user_profiles?.company || null,
      })) || [];

      return {
        members,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1
      };
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      throw new Error('No se pudieron cargar los miembros de la organización');
    }
  }

  /**
   * Invita un nuevo usuario a la organización
   */
  async inviteUser(organizationId: string, userData: InviteUserData): Promise<void> {
    try {
      await httpClient.post(`${this.baseUrl}/${organizationId}/invite`, {
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role
      });
    } catch (error: any) {
      console.error('Error al invitar usuario:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Solo los administradores pueden invitar usuarios');
      } else if (error.response?.status === 409) {
        throw new Error('Este email ya pertenece a la organización');
      } else if (error.response?.status === 400) {
        throw new Error('Email, nombre completo y rol son requeridos');
      }
      
      throw new Error(error.response?.data?.error || 'No se pudo enviar la invitación');
    }
  }

  /**
   * Actualiza el rol de un usuario
   */
  async updateUserRole(
    organizationId: string, 
    userData: UpdateUserRoleData
  ): Promise<void> {
    try {
      await httpClient.put(
        `${this.baseUrl}/${organizationId}/members/${userData.userId}/role`,
        {
          role: userData.role,
          permissions: userData.permissions
        }
      );
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      throw new Error('No se pudo actualizar el rol del usuario');
    }
  }

  /**
   * Actualiza el nombre de un usuario
   */
  async updateUserName(organizationId: string, userId: string, fullName: string): Promise<void> {
    try {
      await httpClient.put(`${this.baseUrl}/${organizationId}/members/${userId}/name`, {
        full_name: fullName
      });
    } catch (error: any) {
      console.error('Error al actualizar nombre:', error);
      
      if (error.response?.status === 400) {
        throw new Error('El nombre es requerido y debe tener al menos 2 caracteres');
      } else if (error.response?.status === 401) {
        throw new Error('No tienes permisos para actualizar este usuario');
      } else if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado en la organización');
      }
      
      throw new Error(error.response?.data?.error || 'No se pudo actualizar el nombre del usuario');
    }
  }

  /**
   * Elimina un usuario de la organización
   */
  async removeUser(organizationId: string, userId: string): Promise<void> {
    
    try {
      await httpClient.delete(`${this.baseUrl}/${organizationId}/members/${userId}`);
      
    } catch (error) {
      console.error('❌ UsersService - Error al eliminar usuario:', error);
      throw new Error('No se pudo eliminar el usuario de la organización');
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUserStats(organizationId: string): Promise<UserStats> {
    try {
      const members = await this.getOrganizationMembers(organizationId);
      
      const stats: UserStats = {
        total_members: members.length,
        active_members: members.length, // Todos están activos por ahora
        pending_invitations: 0, // Por implementar
        admins: members.filter(m => m.org_role === 'admin').length,
        members: members.filter(m => m.org_role === 'member').length,
        viewers: members.filter(m => m.org_role === 'viewer').length,
      };

      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error('No se pudieron cargar las estadísticas');
    }
  }

  /**
   * Obtiene el historial de actividad de un usuario
   */
  async getUserActivity(userId: string): Promise<UserActivityLog[]> {
    try {
      // Por ahora retornamos datos mock, luego implementar con endpoint real
      return [
        {
          id: '1',
          user_id: userId,
          action: 'login',
          description: 'Inició sesión en la plataforma',
          metadata: { ip: '192.168.1.1' },
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: userId,
          action: 'campaign.view',
          description: 'Vio la campaña "Campaña de Verano"',
          metadata: { campaign_id: 'campaign-123' },
          created_at: new Date(Date.now() - 3600000).toISOString(),
        }
      ];
    } catch (error) {
      console.error('Error al obtener actividad:', error);
      throw new Error('No se pudo cargar el historial de actividad');
    }
  }

  /**
   * Actualiza usuarios en lote
   */
  async bulkUpdateUsers(
    organizationId: string,
    userIds: string[],
    updates: { role?: UserRole; status?: 'active' | 'inactive' }
  ): Promise<void> {
    try {
      await Promise.all(
        userIds.map(userId => {
          if (updates.role) {
            return this.updateUserRole(organizationId, {
              userId,
              role: updates.role
            });
          }
          return Promise.resolve();
        })
      );
    } catch (error) {
      console.error('Error en actualización masiva:', error);
      throw new Error('No se pudieron actualizar todos los usuarios');
    }
  }

  /**
   * Busca usuarios por email o nombre
   */
  async searchUsers(query: string): Promise<OrganizationMember[]> {
    try {
      // Implementar cuando tengamos endpoint de búsqueda
      // Por ahora retornamos array vacío
      return [];
    } catch (error) {
      console.error('Error en búsqueda:', error);
      throw new Error('Error al buscar usuarios');
    }
  }
}

export const usersService = new UsersService(); 
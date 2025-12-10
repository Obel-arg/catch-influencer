import { Request, Response } from 'express';
import { OrganizationService } from '../../services/organization';
import { OrganizationCreateDTO, OrganizationUpdateDTO } from '../../models/organization/organization.model';

export class OrganizationController {
  private organizationService: OrganizationService;

  constructor() {
    this.organizationService = new OrganizationService();
  }

  async createOrganization(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const organizationData: OrganizationCreateDTO = req.body;
      const organization = await this.organizationService.createOrganization(organizationData, userId);

      // Agregar al usuario como miembro con rol de admin
      await this.organizationService.addMemberToOrganization(organization.id, userId, 'admin');

      res.status(201).json({ organization });
    } catch (error) {
      console.error('Error al crear organización:', error);
      res.status(500).json({ error: 'Error al crear organización' });
    }
  }

  async getOrganizationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organization = await this.organizationService.getOrganizationById(id);

      if (!organization) {
        return res.status(404).json({ error: 'Organización no encontrada' });
      }

      res.json({ organization });
    } catch (error) {
      console.error('Error al obtener organización:', error);
      res.status(500).json({ error: 'Error al obtener organización' });
    }
  }

  async getOrganizations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const organizations = await this.organizationService.getOrganizationsByUserId(userId);
      res.json({ organizations });
    } catch (error) {
      console.error('Error al obtener organizaciones:', error);
      res.status(500).json({ error: 'Error al obtener organizaciones' });
    }
  }

  async updateOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: OrganizationUpdateDTO = req.body;
      const organization = await this.organizationService.updateOrganization(id, updateData);

      res.json({ organization });
    } catch (error) {
      console.error('Error al actualizar organización:', error);
      res.status(500).json({ error: 'Error al actualizar organización' });
    }
  }

  async deleteOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.organizationService.deleteOrganization(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar organización:', error);
      res.status(500).json({ error: 'Error al eliminar organización' });
    }
  }

  async getOrganizationMembers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string;
      const role = req.query.role as string;
      
      const result = await this.organizationService.getOrganizationMembers(id, {
        page,
        limit,
        search,
        role
      });
      
      res.json({ 
        members: result.members,
        total: result.total,
        totalPages: result.totalPages
      });
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      res.status(500).json({ error: 'Error al obtener miembros' });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId, role } = req.body;
      await this.organizationService.addMemberToOrganization(id, userId, role);
      res.status(201).json({ message: 'Miembro agregado exitosamente' });
    } catch (error) {
      console.error('Error al agregar miembro:', error);
      res.status(500).json({ error: 'Error al agregar miembro' });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const { id, userId } = req.params;
      await this.organizationService.removeMemberFromOrganization(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      res.status(500).json({ error: 'Error al eliminar miembro' });
    }
  }

  async updateMemberRole(req: Request, res: Response) {
    try {
      const { id, userId } = req.params;
      const { role } = req.body;
      await this.organizationService.updateMemberRole(id, userId, role);
      res.json({
        message: 'Rol actualizado exitosamente',
        requiresTokenRefresh: true // Signal to frontend to refresh token
      });
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      res.status(500).json({ error: 'Error al actualizar rol' });
    }
  }

  async updateMemberName(req: Request, res: Response) {
    try {
      const { id, userId } = req.params;
      const { full_name } = req.body;
      
      if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
        return res.status(400).json({ error: 'El nombre es requerido y debe tener al menos 2 caracteres' });
      }

      await this.organizationService.updateMemberName(id, userId, full_name.trim());
      res.json({ message: 'Nombre actualizado exitosamente' });
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      res.status(500).json({ error: 'Error al actualizar nombre' });
    }
  }

  async inviteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, full_name, role, brand_ids } = req.body;
      const invitedBy = req.user?.id;

      if (!invitedBy) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      if (!email || !full_name || !role) {
        return res.status(400).json({ error: 'Email, nombre completo y rol son requeridos' });
      }

      const validRoles = ['admin', 'member', 'viewer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      // Brand selection is optional for all roles
      // No validation required - users can be invited without brands

      const result = await this.organizationService.inviteUser(
        id,
        email,
        full_name,
        role,
        invitedBy,
        brand_ids || []
      );

      res.status(201).json({
        message: result.message,
        data: result
      });
    } catch (error: any) {
      console.error('Error al invitar usuario:', error);

      // Manejar errores específicos
      if (error.message === 'Solo los administradores pueden invitar usuarios') {
        return res.status(403).json({ error: error.message });
      }

      if (error.message === 'Este email ya pertenece a la organización' ||
          error.message === 'Este usuario ya pertenece a la organización') {
        return res.status(409).json({ error: error.message });
      }

      if (error.message.includes('ya está registrado') ||
          error.message.includes('already registered') ||
          error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }

      res.status(500).json({ error: 'Error al enviar invitación' });
    }
  }
} 
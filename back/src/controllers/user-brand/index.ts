import { Request, Response } from 'express';
import { UserBrandService } from '../../services/user/user-brand.service';
import { OrganizationService } from '../../services/organization';
import supabase from '../../config/supabase';

export class UserBrandController {
  private userBrandService: UserBrandService;
  private organizationService: OrganizationService;

  constructor() {
    this.userBrandService = new UserBrandService();
    this.organizationService = new OrganizationService();
  }

  /**
   * Get brands for a specific user (admin only)
   * GET /api/organizations/:organizationId/users/:userId/brands
   */
  async getUserBrands(req: Request, res: Response) {
    try {
      const { organizationId, userId } = req.params;
      const requesterId = req.user?.id;

      if (!requesterId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verify requester is admin
      const isAdmin = await this.organizationService.isUserAdmin(organizationId, requesterId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Solo los administradores pueden ver las marcas de otros usuarios' });
      }

      const brands = await this.userBrandService.getUserBrandsWithDetails(userId, organizationId);

      res.json({
        userId,
        organizationId,
        brands: brands.map(ub => ub.brands)
      });
    } catch (error) {
      console.error('Error obteniendo marcas del usuario:', error);
      res.status(500).json({ error: 'Error al obtener marcas del usuario' });
    }
  }

  /**
   * Get current user's brands
   * GET /api/me/brands/:organizationId
   */
  async getMyBrands(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const brands = await this.userBrandService.getUserBrandsWithDetails(userId, organizationId);

      res.json({
        brands: brands.map(ub => ub.brands)
      });
    } catch (error) {
      console.error('Error obteniendo mis marcas:', error);
      res.status(500).json({ error: 'Error al obtener marcas' });
    }
  }

  /**
   * Update user's brand assignments (admin only)
   * PUT /api/organizations/:organizationId/users/:userId/brands
   */
  async updateUserBrands(req: Request, res: Response) {
    try {
      const { organizationId, userId } = req.params;
      const { brand_ids } = req.body;
      const requesterId = req.user?.id;

      if (!requesterId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verify requester is admin
      const isAdmin = await this.organizationService.isUserAdmin(organizationId, requesterId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Solo los administradores pueden actualizar marcas de usuarios' });
      }

      if (!Array.isArray(brand_ids)) {
        return res.status(400).json({ error: 'brand_ids debe ser un array' });
      }

      // Verify user's role
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single();

      // Admin users don't need brand assignments
      if (memberData?.role === 'admin' && brand_ids.length > 0) {
        return res.status(400).json({ error: 'Los administradores no necesitan asignación de marcas' });
      }

      // Non-admin users need at least one brand
      if (memberData?.role !== 'admin' && brand_ids.length === 0) {
        return res.status(400).json({ error: 'Los miembros y viewers deben tener al menos una marca asignada' });
      }

      // Validate brands belong to organization
      if (brand_ids.length > 0) {
        const brandValidations = await Promise.all(
          brand_ids.map((brandId: string) =>
            this.userBrandService.verifyBrandInOrganization(brandId, organizationId)
          )
        );

        if (brandValidations.some(valid => !valid)) {
          return res.status(400).json({ error: 'Una o más marcas no pertenecen a la organización' });
        }
      }

      await this.userBrandService.updateUserBrands(userId, brand_ids, organizationId);

      res.json({
        message: 'Marcas actualizadas exitosamente',
        userId,
        brandCount: brand_ids.length
      });
    } catch (error) {
      console.error('Error actualizando marcas del usuario:', error);
      res.status(500).json({ error: 'Error al actualizar marcas del usuario' });
    }
  }

  /**
   * Assign brands to user (admin only)
   * POST /api/organizations/:organizationId/users/:userId/brands
   */
  async assignBrandsToUser(req: Request, res: Response) {
    try {
      const { organizationId, userId } = req.params;
      const { brand_ids } = req.body;
      const requesterId = req.user?.id;

      if (!requesterId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verify requester is admin
      const isAdmin = await this.organizationService.isUserAdmin(organizationId, requesterId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Solo los administradores pueden asignar marcas' });
      }

      if (!Array.isArray(brand_ids) || brand_ids.length === 0) {
        return res.status(400).json({ error: 'brand_ids debe ser un array no vacío' });
      }

      // Validate brands belong to organization
      const brandValidations = await Promise.all(
        brand_ids.map((brandId: string) =>
          this.userBrandService.verifyBrandInOrganization(brandId, organizationId)
        )
      );

      if (brandValidations.some(valid => !valid)) {
        return res.status(400).json({ error: 'Una o más marcas no pertenecen a la organización' });
      }

      await this.userBrandService.assignUserToBrands(userId, brand_ids, organizationId);

      res.status(201).json({
        message: 'Marcas asignadas exitosamente',
        userId,
        brandCount: brand_ids.length
      });
    } catch (error) {
      console.error('Error asignando marcas al usuario:', error);
      res.status(500).json({ error: 'Error al asignar marcas al usuario' });
    }
  }

  /**
   * Get all users for a brand (admin only)
   * GET /api/organizations/:organizationId/brands/:brandId/users
   */
  async getBrandUsers(req: Request, res: Response) {
    try {
      const { organizationId, brandId } = req.params;
      const requesterId = req.user?.id;

      if (!requesterId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verify requester is admin
      const isAdmin = await this.organizationService.isUserAdmin(organizationId, requesterId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Solo los administradores pueden ver usuarios de una marca' });
      }

      // Verify brand belongs to organization
      const belongsToOrg = await this.userBrandService.verifyBrandInOrganization(brandId, organizationId);
      if (!belongsToOrg) {
        return res.status(400).json({ error: 'La marca no pertenece a la organización' });
      }

      const userIds = await this.userBrandService.getBrandUsers(brandId);

      res.json({
        brandId,
        userCount: userIds.length,
        userIds
      });
    } catch (error) {
      console.error('Error obteniendo usuarios de la marca:', error);
      res.status(500).json({ error: 'Error al obtener usuarios de la marca' });
    }
  }
}

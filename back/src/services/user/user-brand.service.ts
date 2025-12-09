import supabase from '../../config/supabase';
import { UserBrand, UserBrandCreateDTO } from '../../models/user/user-brand.model';

export class UserBrandService {
  /**
   * Assign user to a single brand
   */
  async assignUserToBrand(userId: string, brandId: string, organizationId: string): Promise<UserBrand> {
    const { data, error } = await supabase
      .from('user_brands')
      .insert({
        user_id: userId,
        brand_id: brandId,
        organization_id: organizationId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Assign user to multiple brands (bulk operation)
   */
  async assignUserToBrands(userId: string, brandIds: string[], organizationId: string): Promise<UserBrand[]> {
    const inserts = brandIds.map(brandId => ({
      user_id: userId,
      brand_id: brandId,
      organization_id: organizationId
    }));

    const { data, error } = await supabase
      .from('user_brands')
      .insert(inserts)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Replace all brand assignments for a user
   */
  async updateUserBrands(userId: string, brandIds: string[], organizationId: string): Promise<UserBrand[]> {
    // Delete existing assignments for this user in this organization
    await supabase
      .from('user_brands')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    // Insert new assignments
    if (brandIds.length === 0) return [];

    return this.assignUserToBrands(userId, brandIds, organizationId);
  }

  /**
   * Remove user from a brand
   */
  async removeUserFromBrand(userId: string, brandId: string): Promise<void> {
    const { error } = await supabase
      .from('user_brands')
      .delete()
      .eq('user_id', userId)
      .eq('brand_id', brandId);

    if (error) throw error;
  }

  /**
   * Get brand IDs for a user (for filtering campaigns)
   */
  async getUserBrandIds(userId: string, organizationId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_brands')
      .select('brand_id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data?.map(ub => ub.brand_id) || [];
  }

  /**
   * Get brands with details for a user
   */
  async getUserBrandsWithDetails(userId: string, organizationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_brands')
      .select(`
        *,
        brands:brand_id (
          id,
          name,
          logo_url,
          industry,
          status
        )
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get users for a brand
   */
  async getBrandUsers(brandId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_brands')
      .select('user_id')
      .eq('brand_id', brandId);

    if (error) throw error;
    return data?.map(ub => ub.user_id) || [];
  }

  /**
   * Verify brand belongs to organization
   * Since brands table doesn't have organization_id directly,
   * we verify that the brand exists and is active.
   * Brands are shared resources that can be assigned to multiple organizations via user_brands
   */
  async verifyBrandInOrganization(brandId: string, organizationId: string): Promise<boolean> {
    try {
      // Verify the brand exists and is active (not deleted)
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .select('id, status, deleted_at')
        .eq('id', brandId)
        .single();

      if (brandError) {
        console.error(`[verifyBrandInOrganization] Error checking brand ${brandId}:`, brandError);
        return false;
      }

      if (!brand) {
        console.error(`[verifyBrandInOrganization] Brand ${brandId} not found`);
        return false;
      }

      // Check if brand is deleted
      if (brand.status === 'deleted' || brand.deleted_at) {
        console.error(`[verifyBrandInOrganization] Brand ${brandId} is deleted`);
        return false;
      }

      // Brand exists and is active - allow assignment
      // Since brands don't have organization_id, they are shared resources
      // that can be assigned to any organization through user_brands
      return true;
    } catch (error) {
      console.error(`[verifyBrandInOrganization] Unexpected error:`, error);
      return false;
    }
  }
}

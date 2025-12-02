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
   */
  async verifyBrandInOrganization(brandId: string, organizationId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('brands')
      .select('id')
      .eq('id', brandId)
      .eq('organization_id', organizationId)
      .single();

    return !error && !!data;
  }
}

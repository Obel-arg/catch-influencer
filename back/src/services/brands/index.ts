import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { 
  Brand, 
  BrandCreateDTO, 
  BrandUpdateDTO, 
  BrandCampaign,
  BrandCampaignCreateDTO,
  BrandCampaignUpdateDTO,
  BrandFilters,
  BrandStats
} from '../../models/brands/brand.model';

const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || ''
);

export class BrandService {
  /**
   * Crear una nueva marca
   */
  async createBrand(data: BrandCreateDTO): Promise<Brand> {
    const brandData: any = {
      ...data,
      status: 'active',
      total_campaigns: 0,
      total_influencers: 0,
      total_budget: 0,
      currency: data.currency || 'USD',
      social_media: data.social_media || {},
      settings: data.settings || {},
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: brand, error } = await supabase
      .from('brands')
      .insert([brandData])
      .select()
      .single();

    if (error) throw error;
    return brand;
  }

  /**
   * Obtener marca por ID
   */
  async getBrandById(id: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('brands')
      .select()
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  /**
   * Obtener todas las marcas con filtros
   */
  async getBrands(filters: BrandFilters = {}): Promise<{ brands: Brand[], total: number }> {
    try {
      let query = supabase
        .from('brands')
        .select('*', { count: 'exact' })
        .neq('status', 'deleted')  // Volver al método original que funcionaba
        .is('deleted_at', null)    // Filtrar registros donde deleted_at sea null
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,industry.ilike.%${filters.search}%`);
      }

      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }

      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      if (filters.size) {
        query = query.eq('size', filters.size);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Paginación
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('🔍 [getBrands] Error en consulta:', error);
        throw error;
      }
      
      return { brands: data || [], total: count || 0 };
    } catch (error) {
      console.error('🔍 [getBrands] Error general:', error);
      throw error;
    }
  }

  /**
   * Actualizar marca
   */
  async updateBrand(id: string, data: BrandUpdateDTO): Promise<Brand> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: brand, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return brand;
  }

  /**
   * Eliminar marca (soft delete)
   */
  async deleteBrand(id: string): Promise<void> {
   
    
    try {
      const { error } = await supabase
        .from('brands')
        .update({ 
          status: 'deleted',  // Cambiado de 'inactive' a 'deleted'
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      console.log('🗑️ [BackendService] Supabase update ejecutado');   
      console.log('🗑️ [BackendService] Error de Supabase:', error);

      if (error) {
        console.error('🗑️ [BackendService] Error detallado de Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('🗑️ [BackendService] Marca marcada como eliminada exitosamente');
    } catch (error) {
      console.error('🗑️ [BackendService] Error general:', error);
      throw error;
    }
  }

  /**
   * Obtener campañas de una marca
   */
  async getBrandCampaigns(brandId: string): Promise<BrandCampaign[]> {
    const { data, error } = await supabase
      .from('brands_campaigns')
      .select(`
        *,
        campaigns (
          id,
          name,
          description,
          start_date,
          end_date,
          status,
          budget,
          currency
        )
      `)
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Asociar marca con campaña
   */
  async associateBrandWithCampaign(data: BrandCampaignCreateDTO): Promise<BrandCampaign> {
    const campaignData: any = {
      ...data,
      role: data.role || 'sponsor',
      currency: data.currency || 'USD',
      status: 'active',
      actual_reach: 0,
      actual_engagement: 0,
      settings: data.settings || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: brandCampaign, error } = await supabase
      .from('brands_campaigns')
      .insert([campaignData])
      .select()
      .single();

    if (error) throw error;

    // Actualizar contadores de la marca
    await this.updateBrandCounters(data.brand_id);

    return brandCampaign;
  }

  /**
   * Actualizar relación marca-campaña
   */
  async updateBrandCampaign(id: string, data: BrandCampaignUpdateDTO): Promise<BrandCampaign> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: brandCampaign, error } = await supabase
      .from('brands_campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return brandCampaign;
  }

  /**
   * Desasociar marca de campaña
   */
  async dissociateBrandFromCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('brands_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Obtener estadísticas de una marca
   */
  async getBrandStats(brandId: string): Promise<BrandStats> {
    // Obtener campañas activas y completadas
    const { data: campaigns, error: campaignsError } = await supabase
      .from('brands_campaigns')
      .select(`
        *,
        campaigns (
          id,
          name,
          status,
          start_date,
          end_date
        )
      `)
      .eq('brand_id', brandId);

    if (campaignsError) throw campaignsError;

    const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
    const completedCampaigns = campaigns?.filter(c => c.status === 'completed').length || 0;
    
    const totalReach = campaigns?.reduce((sum, c) => sum + (c.actual_reach || 0), 0) || 0;
    const totalEngagement = campaigns?.reduce((sum, c) => sum + (c.actual_engagement || 0), 0) || 0;

    // Calcular ROI promedio (simplificado)
    const totalBudget = campaigns?.reduce((sum, c) => sum + (c.budget_allocated || 0), 0) || 0;
    const averageRoi = totalBudget > 0 ? (totalEngagement / totalBudget) * 100 : 0;

    // Top 5 campañas con mejor rendimiento
    const topPerformingCampaigns = campaigns
      ?.sort((a, b) => (b.actual_engagement || 0) - (a.actual_engagement || 0))
      .slice(0, 5) || [];

    return {
      total_reach: totalReach,
      total_engagement: totalEngagement,
      active_campaigns: activeCampaigns,
      completed_campaigns: completedCampaigns,
      average_roi: averageRoi,
      top_performing_campaigns: topPerformingCampaigns
    };
  }

  /**
   * Actualizar contadores de la marca
   */
  private async updateBrandCounters(brandId: string): Promise<void> {
    // Contar campañas activas
    const { count: campaignsCount, error: campaignsError } = await supabase
      .from('brands_campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .neq('status', 'cancelled');

    if (campaignsError) throw campaignsError;

    // Calcular presupuesto total
    const { data: budgetData, error: budgetError } = await supabase
      .from('brands_campaigns')
      .select('budget_allocated')
      .eq('brand_id', brandId)
      .neq('status', 'cancelled');

    if (budgetError) throw budgetError;

    const totalBudget = budgetData?.reduce((sum, item) => sum + (item.budget_allocated || 0), 0) || 0;

    // Actualizar marca
    await this.updateBrand(brandId, {
      total_campaigns: campaignsCount || 0,
      total_budget: totalBudget
    });
  }

  /**
   * Buscar marcas por nombre
   */
  async searchBrands(query: string, limit = 10): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select()
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('status', 'active')
      .limit(limit)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener marcas por industria
   */
  async getBrandsByIndustry(industry: string): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select()
      .eq('industry', industry)
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener marcas por país
   */
  async getBrandsByCountry(country: string): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select()
      .eq('country', country)
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener marcas por tamaño
   */
  async getBrandsBySize(size: string): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select()
      .eq('size', size)
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener marcas por estado
   */
  async getBrandsByStatus(status: string): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select()
      .eq('status', status)
      .is('deleted_at', null)
      .order('name');

    if (error) throw error;
    return data || [];
  }
} 
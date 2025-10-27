import { api } from '../api';
import { 
  Brand, 
  CreateBrandDto, 
  UpdateBrandDto, 
  BrandFilters, 
  BrandCampaign, 
  CreateBrandCampaignDto, 
  UpdateBrandCampaignDto, 
  BrandStats, 
  BrandAnalytics 
} from '@/types/brands';

export const brandService = {
  // Operaciones CRUD principales
  
  /**
   * Obtener todas las marcas con filtros opcionales
   */
  async getBrands(filters?: BrandFilters): Promise<Brand[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.country) params.append('country', filters.country);
    if (filters?.size) params.append('size', filters.size);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/brands?${params.toString()}`);
    return response.data.brands || [];
  },

  /**
   * Obtener una marca por ID
   */
  async getBrandById(id: string): Promise<Brand> {
    const response = await api.get(`/brands/${id}`);
    return response.data.brand;
  },

  /**
   * Crear una nueva marca
   */
  async createBrand(brand: CreateBrandDto): Promise<Brand> {
    const response = await api.post('/brands', brand);
    return response.data.brand;
  },

  /**
   * Actualizar una marca existente
   */
  async updateBrand(id: string, brand: UpdateBrandDto): Promise<Brand> {
    const response = await api.put(`/brands/${id}`, brand);
    return response.data.brand;
  },

  /**
   * Eliminar una marca
   */
  async deleteBrand(id: string): Promise<void> {
    
    try {
      const response = await api.delete(`/brands/${id}`);
    } catch (error) {
      console.error('🗑️ [Service] Error en DELETE request:', error);
      console.error('🗑️ [Service] Error response:', (error as any)?.response);
      console.error('🗑️ [Service] Error status:', (error as any)?.response?.status);
      console.error('🗑️ [Service] Error data:', (error as any)?.response?.data);
      throw error;
    }
  },

  /**
   * Buscar marcas por término de búsqueda
   */
  async searchBrands(query: string): Promise<Brand[]> {
    const response = await api.get(`/brands/search?q=${encodeURIComponent(query)}`);
    return response.data.brands || [];
  },

  /**
   * Obtener estadísticas de las marcas
   */
  async getBrandStats(): Promise<BrandStats> {
    const response = await api.get('/brands/stats');
    return response.data.stats || {};
  },

  /**
   * Obtener analytics de una marca específica
   */
  async getBrandAnalytics(id: string): Promise<BrandAnalytics> {
    const response = await api.get(`/brands/${id}/analytics`);
    return response.data.analytics || {};
  },

  // Operaciones específicas por filtros

  /**
   * Obtener todas las industrias disponibles
   */
  async getIndustries(): Promise<string[]> {
    const response = await api.get('/brands/industries');
    return response.data.industries || [];
  },

  /**
   * Obtener todos los países disponibles
   */
  async getCountries(): Promise<string[]> {
    const response = await api.get('/brands/countries');
    return response.data.countries || [];
  },

  /**
   * Obtener marcas por industria
   */
  async getBrandsByIndustry(industry: string): Promise<Brand[]> {
    const response = await api.get(`/brands/industry/${encodeURIComponent(industry)}`);
    return response.data.brands || [];
  },

  /**
   * Obtener marcas por país
   */
  async getBrandsByCountry(country: string): Promise<Brand[]> {
    const response = await api.get(`/brands/country/${encodeURIComponent(country)}`);
    return response.data.brands || [];
  },

  /**
   * Obtener marcas por tamaño
   */
  async getBrandsBySize(size: string): Promise<Brand[]> {
    const response = await api.get(`/brands/size/${size}`);
    return response.data.brands || [];
  },

  /**
   * Obtener marcas por estado
   */
  async getBrandsByStatus(status: string): Promise<Brand[]> {
    const response = await api.get(`/brands/status/${status}`);
    return response.data.brands || [];
  },

  /**
   * Cambiar el estado de una marca
   */
  async changeBrandStatus(id: string, status: string): Promise<Brand> {
    const response = await api.patch(`/brands/${id}/status`, { status });
    return response.data.brand;
  },

  // Operaciones de campañas de marca

  /**
   * Obtener campañas de una marca
   */
  async getBrandCampaigns(brandId: string): Promise<BrandCampaign[]> {
    const response = await api.get(`/brands/${brandId}/campaigns`);
    return response.data.campaigns || [];
  },

  /**
   * Crear una campaña para una marca
   */
  async createBrandCampaign(brandId: string, campaign: CreateBrandCampaignDto): Promise<BrandCampaign> {
    const response = await api.post(`/brands/${brandId}/campaigns`, campaign);
    return response.data.brandCampaign;
  },

  /**
   * Actualizar una campaña de marca
   */
  async updateBrandCampaign(brandId: string, campaignId: string, campaign: UpdateBrandCampaignDto): Promise<BrandCampaign> {
    const response = await api.put(`/brands/${brandId}/campaigns/${campaignId}`, campaign);
    return response.data.brandCampaign;
  },

  /**
   * Actualizar una relación marca-campaña por su ID de relación
   */
  async updateBrandCampaignById(relationId: string, campaign: UpdateBrandCampaignDto): Promise<BrandCampaign> {
    const response = await api.put(`/brands/campaigns/${relationId}`, campaign);
    return response.data.brandCampaign;
  },

  /**
   * Eliminar una campaña de marca
   */
  async deleteBrandCampaign(brandId: string, campaignId: string): Promise<void> {
    await api.delete(`/brands/campaigns/${campaignId}`);
  },

  /**
   * Obtener una campaña específica de una marca
   */
  async getBrandCampaignById(brandId: string, campaignId: string): Promise<BrandCampaign> {
    const response = await api.get(`/brands/${brandId}/campaigns/${campaignId}`);
    return response.data.brandCampaign;
  },

  // Operaciones de exportación

  /**
   * Exportar marcas a CSV
   */
  async exportBrands(filters?: BrandFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.country) params.append('country', filters.country);
    if (filters?.size) params.append('size', filters.size);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/brands/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  },

  /**
   * Exportar campañas de una marca a CSV
   */
  async exportBrandCampaigns(brandId: string): Promise<Blob> {
    const response = await api.get(`/brands/${brandId}/campaigns/export`, {
      responseType: 'blob'
    });
    
    return response.data;
  },

  /**
   * Obtener campañas disponibles para asignar (sin marca asignada)
   */
  async getAvailableCampaigns(): Promise<any[]> {
    const response = await api.get('/campaigns/available-for-brands');
    return response.data || [];
  },

  /**
   * Asignar una campaña existente a una marca
   */
  async assignCampaignToBrand(brandId: string, campaignId: string, data: any = {}): Promise<any> {
    const response = await api.post('/brands/campaigns', {
      brand_id: brandId,
      campaign_id: campaignId,
      ...data
    });
    return response.data.brandCampaign;
  },

  /**
   * Subir logo de marca usando el proxy de imágenes
   */
  async uploadBrandLogo(logoUrl: string, brandName: string, brandId?: string): Promise<string> {
    try {
      const response = await api.post('/proxy/image/upload-brand-logo', {
        url: logoUrl,
        brandName: brandName,
        brandId: brandId
      });
      
      if (response.data.success) {
        return response.data.logoUrl;
      } else {
        throw new Error(response.data.error || 'Error al subir logo');
      }
    } catch (error) {
      console.error('Error al subir logo de marca:', error);
      throw error;
    }
  },

  /**
   * Obtener URL del proxy para cualquier imagen externa
   */
  getProxiedImageUrl(externalUrl: string): string {
    if (!externalUrl) return '';
    
    // Si ya es una URL del backend, devolverla tal como está
    if (externalUrl.includes('localhost:5000')) {
      return externalUrl;
    }
    
    // Convertir URL externa a URL del proxy
    const baseUrl = "http://localhost:5000/api";
    const encodedUrl = encodeURIComponent(externalUrl);
    return `${baseUrl}/proxy/image?url=${encodedUrl}`;
  },

  /**
   * Procesar logo URL antes de guardar una marca
   */
  async processLogoUrl(logoUrl: string, brandName: string, brandId?: string): Promise<string> {
    if (!logoUrl) return '';
    
    // Si ya es una URL del backend, devolverla tal como está
    if (logoUrl.includes('localhost:5000')) {
      return logoUrl;
    }
    
    // Si es una URL externa, subirla usando el proxy
    try {
      return await this.uploadBrandLogo(logoUrl, brandName, brandId);
    } catch (error) {
      console.warn('Error al procesar logo, usando URL original:', error);
      return logoUrl; // Fallback a la URL original
    }
  }
}; 
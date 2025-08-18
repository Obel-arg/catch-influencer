import { Request, Response } from 'express';
import { BrandService } from '../../services/brands';
import { BrandCreateDTO, BrandUpdateDTO, BrandCampaignCreateDTO, BrandCampaignUpdateDTO, BrandFilters } from '../../models/brands/brand.model';

export class BrandController {
  private brandService: BrandService;

  constructor() {
    this.brandService = new BrandService();
  }

  /**
   * Crear una nueva marca
   */
  async createBrand(req: Request, res: Response) {
    try {
      const brandData: BrandCreateDTO = req.body;

      // Validación básica
      if (!brandData.name) {
        return res.status(400).json({ error: 'El nombre de la marca es requerido' });
      }

      const brand = await this.brandService.createBrand(brandData);
      res.status(201).json({ 
        message: 'Marca creada exitosamente',
        brand 
      });
    } catch (error) {
      console.error('Error al crear marca:', error);
      res.status(500).json({ error: 'Error al crear marca' });
    }
  }

  /**
   * Obtener marca por ID
   */
  async getBrandById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const brand = await this.brandService.getBrandById(id);

      if (!brand) {
        return res.status(404).json({ error: 'Marca no encontrada' });
      }

      res.json({ brand });
    } catch (error) {
      console.error('Error al obtener marca:', error);
      res.status(500).json({ error: 'Error al obtener marca' });
    }
  }

  /**
   * Obtener todas las marcas con filtros opcionales
   */
  async getBrands(req: Request, res: Response) {
    try {
      const filters: BrandFilters = {
        search: req.query.search as string,
        industry: req.query.industry as string,
        country: req.query.country as string,
        size: req.query.size as string,
        status: req.query.status as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const result = await this.brandService.getBrands(filters);
      
      res.json({
        brands: result.brands,
        total: result.total,
        page: Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1,
        totalPages: Math.ceil(result.total / (filters.limit || 20))
      });
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      res.status(500).json({ error: 'Error al obtener marcas' });
    }
  }

  /**
   * Actualizar marca
   */
  async updateBrand(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: BrandUpdateDTO = req.body;

      const brand = await this.brandService.updateBrand(id, updateData);
      
      res.json({ 
        message: 'Marca actualizada exitosamente',
        brand 
      });
    } catch (error) {
      console.error('Error al actualizar marca:', error);
      res.status(500).json({ error: 'Error al actualizar marca' });
    }
  }

  /**
   * Eliminar marca (soft delete)
   */
  async deleteBrand(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log('🗑️ [Controller] DELETE request recibido para marca:', id);
      console.log('🗑️ [Controller] User ID:', req.user?.id);
      console.log('🗑️ [Controller] Headers:', req.headers.authorization ? 'Token presente' : 'Sin token');
      
      await this.brandService.deleteBrand(id);
      console.log('🗑️ [Controller] Marca eliminada exitosamente');
      
      res.status(204).json({ message: 'Marca eliminada exitosamente' });
    } catch (error) {
      console.error('🗑️ [Controller] Error al eliminar marca:', error);
      console.error('🗑️ [Controller] Error stack:', error instanceof Error ? error.stack : 'No stack');
      res.status(500).json({ error: 'Error al eliminar marca' });
    }
  }

  /**
   * Obtener campañas de una marca
   */
  async getBrandCampaigns(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const campaigns = await this.brandService.getBrandCampaigns(id);
      
      res.json({ campaigns });
    } catch (error) {
      console.error('Error al obtener campañas de la marca:', error);
      res.status(500).json({ error: 'Error al obtener campañas' });
    }
  }

  /**
   * Asociar marca con campaña
   */
  async associateBrandWithCampaign(req: Request, res: Response) {
    try {
      const campaignData: BrandCampaignCreateDTO = req.body;

      // Validación básica
      if (!campaignData.brand_id || !campaignData.campaign_id) {
        return res.status(400).json({ 
          error: 'brand_id y campaign_id son requeridos' 
        });
      }

      const brandCampaign = await this.brandService.associateBrandWithCampaign(campaignData);
      
      res.status(201).json({ 
        message: 'Marca asociada a campaña exitosamente',
        brandCampaign 
      });
    } catch (error) {
      console.error('Error al asociar marca con campaña:', error);
      res.status(500).json({ error: 'Error al asociar marca con campaña' });
    }
  }

  /**
   * Actualizar relación marca-campaña
   */
  async updateBrandCampaign(req: Request, res: Response) {
    try {
      const { brandCampaignId } = req.params;
      const updateData: BrandCampaignUpdateDTO = req.body;

      const brandCampaign = await this.brandService.updateBrandCampaign(brandCampaignId, updateData);
      
      res.json({ 
        message: 'Relación marca-campaña actualizada exitosamente',
        brandCampaign 
      });
    } catch (error) {
      console.error('Error al actualizar relación marca-campaña:', error);
      res.status(500).json({ error: 'Error al actualizar relación marca-campaña' });
    }
  }

  /**
   * Desasociar marca de campaña
   */
  async dissociateBrandFromCampaign(req: Request, res: Response) {
    try {
      const { brandCampaignId } = req.params;
      await this.brandService.dissociateBrandFromCampaign(brandCampaignId);
      
      res.status(204).json({ message: 'Marca desasociada de campaña exitosamente' });
    } catch (error) {
      console.error('Error al desasociar marca de campaña:', error);
      res.status(500).json({ error: 'Error al desasociar marca de campaña' });
    }
  }

  /**
   * Obtener estadísticas de una marca
   */
  async getBrandStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await this.brandService.getBrandStats(id);
      
      res.json({ stats });
    } catch (error) {
      console.error('Error al obtener estadísticas de la marca:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }

  /**
   * Buscar marcas por nombre
   */
  async searchBrands(req: Request, res: Response) {
    try {
      const { q: query } = req.query; // Cambiado de 'query' a 'q' para coincidir con el frontend
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query de búsqueda es requerido' });
      }

      const brands = await this.brandService.searchBrands(query, limit);
      
      res.json({ brands }); // Devuelve { brands } para consistencia
    } catch (error) {
      console.error('Error al buscar marcas:', error);
      res.status(500).json({ error: 'Error al buscar marcas' });
    }
  }

  /**
   * Obtener marcas por industria
   */
  async getBrandsByIndustry(req: Request, res: Response) {
    try {
      const { industry } = req.params;
      const brands = await this.brandService.getBrandsByIndustry(industry);
      
      res.json({ brands }); // Devuelve { brands } para consistencia
    } catch (error) {
      console.error('Error al obtener marcas por industria:', error);
      res.status(500).json({ error: 'Error al obtener marcas por industria' });
    }
  }

  /**
   * Obtener marcas por país
   */
  async getBrandsByCountry(req: Request, res: Response) {
    try {
      const { country } = req.params;
      const brands = await this.brandService.getBrandsByCountry(country);
      
      res.json({ brands });
    } catch (error) {
      console.error('Error al obtener marcas por país:', error);
      res.status(500).json({ error: 'Error al obtener marcas por país' });
    }
  }

  /**
   * Obtener marcas por tamaño
   */
  async getBrandsBySize(req: Request, res: Response) {
    try {
      const { size } = req.params;
      const brands = await this.brandService.getBrandsBySize(size);
      
      res.json({ brands });
    } catch (error) {
      console.error('Error al obtener marcas por tamaño:', error);
      res.status(500).json({ error: 'Error al obtener marcas por tamaño' });
    }
  }

  /**
   * Obtener marcas por estado
   */
  async getBrandsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const brands = await this.brandService.getBrandsByStatus(status);
      
      res.json({ brands });
    } catch (error) {
      console.error('Error al obtener marcas por estado:', error);
      res.status(500).json({ error: 'Error al obtener marcas por estado' });
    }
  }

  /**
   * Cambiar estado de una marca
   */
  async changeBrandStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status es requerido' });
      }

      const brand = await this.brandService.updateBrand(id, { status });
      
      res.json({ 
        message: 'Estado de marca actualizado exitosamente',
        brand 
      });
    } catch (error) {
      console.error('Error al cambiar estado de marca:', error);
      res.status(500).json({ error: 'Error al cambiar estado de marca' });
    }
  }

  /**
   * Obtener lista de industrias disponibles
   */
  async getIndustries(req: Request, res: Response) {
    try {
      // Lista estática de industrias comunes, podrías obtenerla de la base de datos
      const industries = [
        'Technology',
        'Fashion',
        'Beauty',
        'Sports',
        'Food & Beverage',
        'Travel',
        'Education',
        'Health',
        'Finance',
        'Entertainment',
        'Automotive',
        'Real Estate',
        'Retail',
        'Services',
        'Other'
      ];

      res.json({ industries }); // Devuelve { industries } para consistencia
    } catch (error) {
      console.error('Error al obtener industrias:', error);
      res.status(500).json({ error: 'Error al obtener industrias' });
    }
  }

  /**
   * Obtener lista de países disponibles
   */
  async getCountries(req: Request, res: Response) {
    try {
      // Lista estática de países comunes, podrías obtenerla de la base de datos
      const countries = [
        'Argentina',
        'Brazil',
        'Chile',
        'Colombia',
        'Mexico',
        'Peru',
        'Uruguay',
        'Paraguay',
        'Bolivia',
        'Ecuador',
        'Venezuela',
        'Spain',
        'United States',
        'Canada',
        'Other'
      ];

      res.json({ countries }); // Devuelve { countries } para consistencia
    } catch (error) {
      console.error('Error al obtener países:', error);
      res.status(500).json({ error: 'Error al obtener países' });
    }
  }
} 
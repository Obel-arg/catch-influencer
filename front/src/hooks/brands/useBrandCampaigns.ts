import { useState, useCallback } from 'react';
import { brandService } from '@/lib/services/brands';
import { BrandCampaign, CreateBrandCampaignDto, UpdateBrandCampaignDto } from '@/types/brands';
import { handleHookError } from '@/utils/httpErrorHandler';

export const useBrandCampaigns = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);

  const getBrandCampaigns = useCallback(async (brandId: string): Promise<BrandCampaign[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getBrandCampaigns(brandId);
      setCampaigns(data || []);
      return data || [];
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener campañas de marca');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getBrandCampaignById = useCallback(async (brandId: string, campaignId: string): Promise<BrandCampaign | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getBrandCampaignById(brandId, campaignId);
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener campaña de marca');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBrandCampaign = useCallback(async (brandId: string, campaign: CreateBrandCampaignDto): Promise<BrandCampaign | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.createBrandCampaign(brandId, campaign);
      
      // Actualizar el estado local agregando la nueva campaña
      setCampaigns(prev => [...prev, data]);
      
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al crear campaña de marca');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBrandCampaign = useCallback(async (brandId: string, campaignId: string, campaign: UpdateBrandCampaignDto): Promise<BrandCampaign | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.updateBrandCampaign(brandId, campaignId, campaign);
      
      // Actualizar el estado local
      setCampaigns(prev => prev.map(c => c.id === campaignId ? data : c));
      
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al actualizar campaña de marca');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBrandCampaign = useCallback(async (brandId: string, campaignId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await brandService.deleteBrandCampaign(brandId, campaignId);
      
      // Actualizar el estado local eliminando la campaña
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      
      return true;
    } catch (err) {
      if (handleHookError(err, setError, 'Error al eliminar campaña de marca')) {
        return false;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportBrandCampaigns = useCallback(async (brandId: string): Promise<Blob | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.exportBrandCampaigns(brandId);
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al exportar campañas de marca');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    campaigns,
    getBrandCampaigns,
    getBrandCampaignById,
    createBrandCampaign,
    updateBrandCampaign,
    deleteBrandCampaign,
    exportBrandCampaigns
  };
}; 
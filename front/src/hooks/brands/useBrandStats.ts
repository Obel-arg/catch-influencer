import { useState, useCallback } from 'react';
import { brandService } from '@/lib/services/brands';
import { BrandStats, BrandAnalytics } from '@/types/brands';
import { handleHookError } from '@/utils/httpErrorHandler';

export const useBrandStats = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [analytics, setAnalytics] = useState<BrandAnalytics | null>(null);

  const getBrandStats = useCallback(async (): Promise<BrandStats | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getBrandStats();
      setStats(data);
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener estadísticas de marcas');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBrandAnalytics = useCallback(async (brandId: string): Promise<BrandAnalytics | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getBrandAnalytics(brandId);
      setAnalytics(data);
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener analytics de marca');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getIndustries = useCallback(async (): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getIndustries();
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener industrias');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getCountries = useCallback(async (): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getCountries();
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener países');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async (): Promise<void> => {
    await getBrandStats();
  }, [getBrandStats]);

  const refreshAnalytics = useCallback(async (brandId: string): Promise<void> => {
    await getBrandAnalytics(brandId);
  }, [getBrandAnalytics]);

  return {
    loading,
    error,
    stats,
    analytics,
    getBrandStats,
    getBrandAnalytics,
    getIndustries,
    getCountries,
    refreshStats,
    refreshAnalytics
  };
}; 
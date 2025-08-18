import { useState, useEffect, useCallback } from 'react';
import { useBrands } from './useBrands';
import { Brand } from '@/types/brands';

export const useBrandDetail = (brandId: string) => {
  const { getBrandById, loading, error } = useBrands();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchBrand = useCallback(async () => {
    if (!brandId) return;
    
    try {
      setIsLoading(true);
      setDetailError(null);
      
      const brandData = await getBrandById(brandId);
      setBrand(brandData);
    } catch (err) {
      setDetailError('Error al cargar los detalles de la marca');
      console.error('Error fetching brand detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [brandId, getBrandById]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  return {
    brand,
    loading: isLoading || loading,
    error: detailError || error,
    refetch: fetchBrand
  };
}; 
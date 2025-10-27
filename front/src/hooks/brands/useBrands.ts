import { useState, useCallback, useRef, useEffect } from 'react';
import { brandService } from '@/lib/services/brands';
import { Brand, BrandFilters, CreateBrandDto, UpdateBrandDto } from '@/types/brands';
import { handleHookError } from '@/utils/httpErrorHandler';

// Cache global que persiste entre instancias del hook
let globalBrandsCache: Brand[] = [];
let globalHasLoaded = false;
let globalIsLoading = false;

export const useBrands = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>(globalBrandsCache);
  
  // Flag para prevenir peticiones duplicadas simultáneas
  const isLoadingRef = useRef(globalIsLoading);
  const hasLoadedRef = useRef(globalHasLoaded);
  
  // Ref para acceder al estado actual de brands sin causar dependencias circulares
  const brandsRef = useRef<Brand[]>(globalBrandsCache);
  
  // Mantener brandsRef sincronizado con brands
  useEffect(() => {
    brandsRef.current = brands;
    globalBrandsCache = brands;
  }, [brands]);

  const getBrands = useCallback(async (filters?: BrandFilters, forceRefresh = false): Promise<Brand[]> => {
    // Prevenir peticiones duplicadas simultáneas
    if (isLoadingRef.current && !forceRefresh) {
      return brandsRef.current;
    }

    // Si ya se cargó y no es un refresh forzado, retornar datos existentes sin mostrar loading
    if (hasLoadedRef.current && brandsRef.current.length > 0 && !forceRefresh) {
      return brandsRef.current;
    }

    // Solo mostrar loading si realmente necesitamos hacer una petición
    isLoadingRef.current = true;
    globalIsLoading = true;
    setLoading(true);
    setError(null);

    try {
      const data = await brandService.getBrands(filters);
      
      const result = data || [];
      setBrands(result);
      brandsRef.current = result;
      hasLoadedRef.current = true;
      globalHasLoaded = true;
      
      return result;
    } catch (err) {
      const wasIgnored = handleHookError(err, setError, 'Error al obtener marcas');
      if (wasIgnored) {
        return brandsRef.current;
      }
      return brandsRef.current.length > 0 ? brandsRef.current : [];
    } finally {
      isLoadingRef.current = false;
      globalIsLoading = false;
      setLoading(false);
    }
  }, []);

  const getBrandById = useCallback(async (id: string): Promise<Brand | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getBrandById(id);
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener marca');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBrand = useCallback(async (brand: CreateBrandDto): Promise<Brand | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.createBrand(brand);
      
      // Actualizar el estado local agregando la nueva marca
      const newBrands = [...brandsRef.current, data];
      setBrands(newBrands);
      brandsRef.current = newBrands;
      globalBrandsCache = newBrands;
      
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al crear marca');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBrand = useCallback(async (id: string, brand: UpdateBrandDto): Promise<Brand | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.updateBrand(id, brand);
      
      // Actualizar el estado local
      const updatedBrands = brandsRef.current.map(b => b.id === id ? data : b);
      setBrands(updatedBrands);
      brandsRef.current = updatedBrands;
      globalBrandsCache = updatedBrands;
      
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al actualizar marca');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBrand = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null); 
      
      await brandService.deleteBrand(id);
      
      
      // Actualizar el estado local eliminando la marca
      const filteredBrands = brandsRef.current.filter(b => b.id !== id);
      setBrands(filteredBrands);
      brandsRef.current = filteredBrands;
      globalBrandsCache = filteredBrands;
      
        
      return true;
    } catch (err) { 
      
      if (err && typeof err === 'object') {
        
      }
      
      if (handleHookError(err, setError, 'Error al eliminar marca')) {
        return false;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchBrands = useCallback(async (query: string): Promise<Brand[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.searchBrands(query);
      
      // Actualizar el estado local con los resultados de búsqueda
      const result = data || [];
      setBrands(result);
      brandsRef.current = result;
      globalBrandsCache = result;
      
      return result;
    } catch (err) {
      handleHookError(err, setError, 'Error al buscar marcas');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const changeBrandStatus = useCallback(async (id: string, status: string): Promise<Brand | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.changeBrandStatus(id, status);
      
      // Actualizar el estado local
      const updatedBrands = brandsRef.current.map(b => b.id === id ? data : b);
      setBrands(updatedBrands);
      brandsRef.current = updatedBrands;
      globalBrandsCache = updatedBrands;
      
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al cambiar estado de marca');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBrandsByIndustry = useCallback(async (industry: string): Promise<Brand[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getBrandsByIndustry(industry);
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener marcas por industria');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getBrandsByCountry = useCallback(async (country: string): Promise<Brand[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getBrandsByCountry(country);
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener marcas por país');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getBrandsBySize = useCallback(async (size: string): Promise<Brand[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getBrandsBySize(size);
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener marcas por tamaño');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getBrandsByStatus = useCallback(async (status: string): Promise<Brand[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.getBrandsByStatus(status);
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener marcas por estado');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const exportBrands = useCallback(async (filters?: BrandFilters): Promise<Blob | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandService.exportBrands(filters);
      return data;
    } catch (err) {
      handleHookError(err, setError, 'Error al exportar marcas');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBrands = useCallback(async (filters?: BrandFilters): Promise<void> => {
    await getBrands(filters, true);
  }, [getBrands]);

  return {
    loading,
    error,
    brands,
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    searchBrands,
    changeBrandStatus,
    getBrandsByIndustry,
    getBrandsByCountry,
    getBrandsBySize,
    getBrandsByStatus,
    exportBrands,
    refreshBrands
  };
}; 
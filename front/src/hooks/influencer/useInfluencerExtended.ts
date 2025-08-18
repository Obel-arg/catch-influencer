import { useState, useEffect, useCallback } from 'react';
import { InfluencerExtendedService, ExtendedInfluencerData, ExtendedDataStatus } from '@/lib/services/influencer';
import { handleHookError } from '@/utils/httpErrorHandler';

export interface UseInfluencerExtendedReturn {
  // Estados
  extendedData: ExtendedInfluencerData | null;
  status: ExtendedDataStatus | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  
  // Resumen
  summary: {
    hasExtendedData: boolean;
    completenessScore: number;
    lastSync: string | null;
    platformsWithData: string[];
    needsSync: boolean;
    totalApiCalls: number;
    estimatedCost: number;
  } | null;
  
  // Funciones
  syncExtendedData: (platforms?: ('youtube' | 'instagram' | 'tiktok')[]) => Promise<void>;
  refreshStatus: () => Promise<void>;
  forceSync: () => Promise<void>;
  loadDetailedStatus: () => Promise<void>;
}

export const useInfluencerExtended = (creatorId: string | null, influencerId?: string): UseInfluencerExtendedReturn => {
  const [extendedData, setExtendedData] = useState<ExtendedInfluencerData | null>(null);
  const [status, setStatus] = useState<ExtendedDataStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Función para generar summary desde datos extendidos existentes
  const generateSummaryFromExtendedData = useCallback((data: ExtendedInfluencerData) => {
    const platformsWithData = [];
    if (data.youtube_basic) platformsWithData.push('YouTube');
    if (data.instagram_basic) platformsWithData.push('Instagram'); 
    if (data.tiktok_basic) platformsWithData.push('TikTok');

    return {
      hasExtendedData: true,
      completenessScore: (data.data_completeness_score || 0) * 100, // Convertir a porcentaje
      lastSync: data.updated_at || null,
      platformsWithData,
      needsSync: data.sync_status !== 'completed',
      totalApiCalls: data.total_api_calls || 0,
      estimatedCost: data.estimated_cost || 0
    };
  }, []);

  // Función para cargar datos extendidos existentes (sin hacer peticiones nuevas)
  const loadExistingData = useCallback(async () => {
    if (!creatorId) return;
    
    try {
      setError(null);
      

      
      // Solo leer datos existentes - NO hacer peticiones duplicadas
      const response = await InfluencerExtendedService.readExistingExtendedData(creatorId);
      
      if (response.success && response.data) {
        setExtendedData(response.data);
        
        // Generar summary desde los datos extendidos - NO hacer petición separada
        const generatedSummary = generateSummaryFromExtendedData(response.data);
        setSummary(generatedSummary);
        

      } else {
        // No hay datos extendidos
        setSummary({
          hasExtendedData: false,
          completenessScore: 0,
          lastSync: null,
          platformsWithData: [],
          needsSync: true,
          totalApiCalls: 0,
          estimatedCost: 0
        });
      }
      
    } catch (err) {
      // Si no hay datos extendidos, no es un error crítico

      setSummary({
        hasExtendedData: false,
        completenessScore: 0,
        lastSync: null,
        platformsWithData: [],
        needsSync: true,
        totalApiCalls: 0,
        estimatedCost: 0
      });
    }
  }, [creatorId, generateSummaryFromExtendedData]);

  // Función para obtener el estado de datos extendidos (solo cuando sea necesario)
  const refreshStatus = useCallback(async () => {
    if (!influencerId) return;
    
    try {
      setError(null);
      
      const [statusResponse, summaryData] = await Promise.all([
        InfluencerExtendedService.getExtendedDataStatus(influencerId),
        InfluencerExtendedService.getExtendedDataSummary(influencerId)
      ]);
      
      setStatus(statusResponse.data);
      setSummary(summaryData);
      
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener estado de datos extendidos');
    }
      }, [influencerId]);

  // Función para sincronizar datos extendidos (HACE peticiones nuevas a APIs)
  const syncExtendedData = useCallback(async (platforms?: ('youtube' | 'instagram' | 'tiktok')[]) => {
    if (!influencerId) return;
    
    try {
      setSyncing(true);
      setError(null);
      

      
      // HACER peticiones nuevas a APIs externas
      const response = await InfluencerExtendedService.syncExtendedDataByInfluencerId(influencerId);
      
      if (response.success) {
        setExtendedData(response.data);
        
        // Generar summary desde los datos sincronizados - NO hacer petición separada
        const generatedSummary = generateSummaryFromExtendedData(response.data);
        setSummary(generatedSummary);
        

      } else {
        throw new Error('Error en la sincronización');
      }
      
    } catch (err) {

      handleHookError(err, setError, 'Error al sincronizar datos extendidos');
    } finally {
      setSyncing(false);
    }
  }, [influencerId]);

  // Función para forzar re-sincronización
  const forceSync = useCallback(async () => {
    if (!influencerId) return;
    
    try {
      setSyncing(true);
      setError(null);
      

      
      // Re-sincronizar todas las plataformas
      const response = await InfluencerExtendedService.resyncExtendedData(influencerId, {
        platforms: ['youtube', 'instagram', 'tiktok']
      });
      
      if (response.success) {
        setExtendedData(response.data);
        
        // Generar summary desde los datos re-sincronizados - NO hacer petición separada
        const generatedSummary = generateSummaryFromExtendedData(response.data);
        setSummary(generatedSummary);
        

      } else {
        throw new Error('Error en la re-sincronización');
      }
      
    } catch (err) {

      handleHookError(err, setError, 'Error al re-sincronizar datos extendidos');
    } finally {
      setSyncing(false);
    }
  }, [influencerId]);

  // Cargar datos iniciales una sola vez
  useEffect(() => {
    if (!creatorId || hasLoadedInitialData) return;
    
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      
      try {

        
        // Solo cargar datos existentes - NO hacer peticiones de status redundantes
        await loadExistingData();
        
        if (isMounted) {
          setHasLoadedInitialData(true);
        }
        
      } catch (err) {

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadInitialData();
    
    // Cleanup para evitar actualizaciones de estado si el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, [creatorId, hasLoadedInitialData, loadExistingData]);

  // Reset cuando cambia el creator
  useEffect(() => {
    setHasLoadedInitialData(false);
    setExtendedData(null);
    setStatus(null);
    setSummary(null);
    setError(null);
    setLoading(true);
  }, [creatorId]);

  // Función para cargar estado detallado solo cuando sea necesario (ej: pestaña Datos Extendidos)
  const loadDetailedStatus = useCallback(async () => {
    if (!influencerId) return;
    
    try {

      await refreshStatus();
    } catch (err) {
      console.error('Error cargando estado detallado:', err);
    }
  }, [influencerId, refreshStatus]);

  return {
    extendedData,
    status,
    loading,
    syncing,
    error,
    summary,
    syncExtendedData,
    refreshStatus,
    forceSync,
    loadDetailedStatus
  };
};

// Hook simplificado para obtener solo el resumen
export const useInfluencerExtendedSummary = (influencerId: string) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!influencerId) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const summaryData = await InfluencerExtendedService.getExtendedDataSummary(influencerId);
        setSummary(summaryData);
        
      } catch (err) {
        handleHookError(err, setError, 'Error al obtener resumen de datos extendidos');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [influencerId]);

  return { summary, loading, error };
}; 
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { influencerService } from "@/lib/services/influencer";
import { creatorService } from "@/lib/services/creator";
import { hypeAuditorDiscoveryService, HypeAuditorDiscoveryFilters } from "@/lib/services/hypeauditor-discovery.service";
import { useToast } from "@/hooks/common/useToast";
import { Influencer } from "@/types/influencer";
import { PaginationParams } from "@/types/common";
import { handleHookError } from "@/utils/httpErrorHandler";

interface InfluencersContextType {
  // Estado
  loading: boolean;
  error: string | null;
  influencers: Influencer[];
  isInitialized: boolean;

  // Funciones
  getInfluencers: (
    params?: PaginationParams,
    force?: boolean
  ) => Promise<Influencer[]>;
  getInfluencerById: (id: string) => Promise<any>;
  createInfluencer: (influencerData: any) => Promise<any>;
  updateInfluencer: (id: string, influencer: any) => Promise<any>;
  deleteInfluencer: (id: string) => Promise<boolean>;
  refreshInfluencerData: (id: string) => Promise<any>;
  getInfluencerMetrics: (id: string) => Promise<any>;
  getInfluencerCampaigns: (id: string) => Promise<any[]>;
  searchCreatorDBInfluencers: (filters: Record<string, any>) => Promise<any>;
  searchHypeAuditorInfluencers: (filters: HypeAuditorDiscoveryFilters) => Promise<any>;
  resetInfluencers: () => void;
}

const InfluencersContext = createContext<InfluencersContextType | undefined>(
  undefined
);

interface InfluencersProviderProps {
  children: ReactNode;
}

export const InfluencersProvider: React.FC<InfluencersProviderProps> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { showToast } = useToast();

  const getInfluencers = useCallback(
    async (params?: PaginationParams, force: boolean = false) => {
      // Si ya está inicializado y no es forzado, retornar los datos actuales
      if (isInitialized && !force && influencers.length > 0) {
        return influencers;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await influencerService.getInfluencers(params);
        const items = Array.isArray(response) ? response : response.items;
        setInfluencers(items);
        setIsInitialized(true);
        return items;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al obtener influencers";
        setError(errorMessage);
        showToast({
          title: "Error",
          description: errorMessage,
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [showToast, isInitialized, influencers]
  );

  const getInfluencerById = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await influencerService.getInfluencerById(id);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al obtener influencer";
        setError(errorMessage);
        showToast({
          title: "Error",
          description: errorMessage,
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const createInfluencer = useCallback(
    async (influencerData: any) => {
      try {
        setLoading(true);
        const result = await influencerService.createInfluencer(influencerData);

        if (result.duplicate) {
          showToast({
            title: "Influencer ya existe",
            description: result.message,
            variant: "default",
          });

          return {
            success: false,
            duplicate: true,
            existingInfluencer: result.existingInfluencer,
          };
        }

        showToast({
          title: "Influencer creado",
          description: result.message,
          variant: "default",
        });

        // Actualizar la lista de influencers con forzado
        await getInfluencers(undefined, true);

        return {
          success: true,
          duplicate: false,
          influencer: result.influencer,
        };
      } catch (err) {
        handleHookError(err, setError, "Error al crear influencer");
        return {
          success: false,
          duplicate: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        };
      } finally {
        setLoading(false);
      }
    },
    [getInfluencers, showToast]
  );

  const updateInfluencer = useCallback(
    async (id: string, influencer: any) => {
      try {
        setLoading(true);
        setError(null);
        const data = await influencerService.updateInfluencer(id, influencer);
        setInfluencers((prev) =>
          prev.map((item) => (item.id === id ? data : item))
        );
        showToast({
          title: "Éxito",
          description: "Influencer actualizado correctamente",
          status: "success",
        });
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al actualizar influencer";
        setError(errorMessage);
        showToast({
          title: "Error",
          description: errorMessage,
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const deleteInfluencer = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await influencerService.deleteInfluencer(id);
        setInfluencers((prev) => prev.filter((item) => item.id !== id));
        showToast({
          title: "Éxito",
          description: "Influencer eliminado correctamente",
          status: "success",
        });
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al eliminar influencer";
        setError(errorMessage);
        showToast({
          title: "Error",
          description: errorMessage,
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const refreshInfluencerData = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        showToast({
          title: "Actualizando...",
          description: "Obteniendo datos actualizados de las plataformas",
          status: "info",
        });

        const result = await influencerService.refreshInfluencerData(id);

        if (result.success) {
          // Recargar toda la lista de influencers para mostrar datos actualizados
          await getInfluencers(undefined, true);

          showToast({
            title: "Éxito",
            description:
              "Datos del influencer actualizados correctamente. Tabla refrescada.",
            status: "success",
          });

          return result.data;
        } else {
          throw new Error(result.error || "Error al actualizar datos");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al actualizar datos del influencer";
        setError(errorMessage);
        showToast({
          title: "Error",
          description: errorMessage,
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast, getInfluencers]
  );

  const getInfluencerMetrics = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await influencerService.getInfluencerMetrics(id);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al obtener métricas del influencer";
        setError(errorMessage);
        showToast({
          title: "Error",
          description: errorMessage,
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const getInfluencerCampaigns = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        const data = await influencerService.getInfluencerCampaigns(id);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al obtener campañas del influencer";
        setError(errorMessage);
        showToast({
          title: "Error",
          description: errorMessage,
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const searchCreatorDBInfluencers = useCallback(
    async (filters: Record<string, any>) => {
      try {
        setLoading(true);
        setError(null);

        // Primero intentar búsqueda local
        try {
          const localData = await influencerService.searchLocal(filters);
          if (localData.items && localData.items.length > 0) {
            setInfluencers(localData.items);
            return localData;
          }
        } catch (localError) {
          console.warn(
            "⚠️ [CONTEXT] Error en búsqueda local, intentando CreatorDB:",
            localError
          );
        }

        // Si no hay resultados locales o hay error, usar CreatorDB
        const data = await creatorService.explorerSearch(filters);
        setInfluencers(data.items || data.results || []);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al buscar influencers";
        setError(errorMessage);
        showToast({
          title: "Error",
          description: errorMessage,
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const searchHypeAuditorInfluencers = useCallback(
    async (filters: HypeAuditorDiscoveryFilters) => {
      try {
        setLoading(true);
        setError(null);


        // Realizar búsqueda con HypeAuditor
        const hypeAuditorResponse = await hypeAuditorDiscoveryService.searchDiscovery(filters);
        
        // Transformar la respuesta al formato del Explorer
        const transformedData = hypeAuditorDiscoveryService.transformToExplorerFormat(hypeAuditorResponse);
        
        // Actualizar el estado con los resultados transformados
        setInfluencers(transformedData.items);
        
        

        return transformedData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al buscar influencers con HypeAuditor";
        setError(errorMessage);
        showToast({
          title: "Error",
          description: errorMessage,
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const resetInfluencers = useCallback(() => {
    setInfluencers([]);
    setIsInitialized(false);
    setError(null);
  }, []);

  const value: InfluencersContextType = {
    loading,
    error,
    influencers,
    isInitialized,
    getInfluencers,
    getInfluencerById,
    createInfluencer,
    updateInfluencer,
    deleteInfluencer,
    refreshInfluencerData,
    getInfluencerMetrics,
    getInfluencerCampaigns,
    searchCreatorDBInfluencers,
    searchHypeAuditorInfluencers,
    resetInfluencers,
  };

  return (
    <InfluencersContext.Provider value={value}>
      {children}
    </InfluencersContext.Provider>
  );
};

export const useInfluencersContext = () => {
  const context = useContext(InfluencersContext);
  if (context === undefined) {
    throw new Error(
      "useInfluencersContext must be used within an InfluencersProvider"
    );
  }
  return context;
};

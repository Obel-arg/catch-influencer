import { useState, useCallback } from "react";
import { engagementService } from "@/lib/services/engagement";
import { Engagement, EngagementSummary, EngagementFilters } from "@/types/engagement";
import { useToast } from "../common/useToast";

export const useEngagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const getEngagements = useCallback(async (filters?: EngagementFilters): Promise<Engagement[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await engagementService.getEngagements(filters);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener los engagements";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getEngagementById = useCallback(async (id: string): Promise<Engagement | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await engagementService.getEngagementById(id);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener el engagement";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getEngagementSummary = useCallback(async (filters?: EngagementFilters): Promise<EngagementSummary | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await engagementService.getEngagementSummary(filters);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener el resumen de engagement";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getEngagementByPlatform = useCallback(async (platform: string, filters?: EngagementFilters): Promise<Engagement[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await engagementService.getEngagementByPlatform(platform, filters);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener los engagements por plataforma";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getEngagementByType = useCallback(async (type: string, filters?: EngagementFilters): Promise<Engagement[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await engagementService.getEngagementByType(type, filters);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener los engagements por tipo";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createEngagement = useCallback(async (engagement: Omit<Engagement, "id" | "createdAt" | "updatedAt">): Promise<Engagement | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await engagementService.createEngagement(engagement);
      showToast({
        title: "Éxito",
        description: "Engagement creado correctamente",
        status: "success"
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear el engagement";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateEngagement = useCallback(async (id: string, engagement: Partial<Engagement>): Promise<Engagement | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await engagementService.updateEngagement(id, engagement);
      showToast({
        title: "Éxito",
        description: "Engagement actualizado correctamente",
        status: "success"
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar el engagement";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const deleteEngagement = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await engagementService.deleteEngagement(id);
      showToast({
        title: "Éxito",
        description: "Engagement eliminado correctamente",
        status: "success"
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar el engagement";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    loading,
    error,
    getEngagements,
    getEngagementById,
    getEngagementSummary,
    getEngagementByPlatform,
    getEngagementByType,
    createEngagement,
    updateEngagement,
    deleteEngagement
  };
}; 
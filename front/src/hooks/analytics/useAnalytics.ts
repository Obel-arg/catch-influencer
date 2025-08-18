import { useState, useCallback } from "react";
import { analyticsService } from "@/lib/services/analytics";
import { Analytics, AnalyticsSummary, AnalyticsComparison, AnalyticsFilters } from "@/types/analytics";
import { useToast } from "../common/useToast";

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const getAnalytics = useCallback(async (filters: AnalyticsFilters): Promise<Analytics[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getAnalytics(filters);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener analytics";
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

  const getAnalyticsSummary = useCallback(async (filters: AnalyticsFilters): Promise<AnalyticsSummary | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getAnalyticsSummary(filters);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener resumen de analytics";
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

  const getAnalyticsComparison = useCallback(async (filters: AnalyticsFilters): Promise<AnalyticsComparison | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getAnalyticsComparison(filters);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener comparación de analytics";
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

  const getCampaignAnalytics = useCallback(async (campaignId: string, filters: AnalyticsFilters): Promise<Analytics | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getCampaignAnalytics(campaignId, filters);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener analytics de la campaña";
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

  const getInfluencerAnalytics = useCallback(async (influencerId: string, filters: AnalyticsFilters): Promise<Analytics | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getInfluencerAnalytics(influencerId, filters);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener analytics del influencer";
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

  return {
    loading,
    error,
    getAnalytics,
    getAnalyticsSummary,
    getAnalyticsComparison,
    getCampaignAnalytics,
    getInfluencerAnalytics
  };
}; 
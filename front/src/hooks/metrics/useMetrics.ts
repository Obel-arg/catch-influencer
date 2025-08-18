import { useState, useCallback } from "react";
import { metricsService } from "@/lib/services/metrics";
import { Metrics, MetricsSummary, MetricsComparison, CreateMetricsDto } from "@/types/metrics";
import { useToast } from "../common/useToast";

export const useMetrics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const { showToast } = useToast();

  const getMetrics = useCallback(async (type: string, referenceId: string, period: string): Promise<Metrics | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await metricsService.getMetrics(type, referenceId, period);
      setMetrics(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener métricas";
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

  const getMetricsSummary = useCallback(async (type: string, period: string): Promise<MetricsSummary | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await metricsService.getMetricsSummary(type, period);
      setSummary(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener resumen de métricas";
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

  const getMetricsComparison = useCallback(async (
    type: string,
    period: string,
    compareWith: string
  ): Promise<MetricsComparison | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await metricsService.getMetricsComparison(type, period, compareWith);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener comparación de métricas";
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

  const getMetricsByPlatform = useCallback(async (type: string, referenceId: string, platform: string, period: string): Promise<Metrics | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await metricsService.getMetricsByPlatform(type, referenceId, platform, period);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener métricas por plataforma";
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

  const getMetricsByMetric = useCallback(async (type: string, referenceId: string, metric: string, period: string): Promise<Metrics | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await metricsService.getMetricsByMetric(type, referenceId, metric, period);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener métricas por métrica";
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

  const createMetrics = useCallback(async (metrics: CreateMetricsDto): Promise<Metrics | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await metricsService.createMetrics(metrics);
      showToast({
        title: "Éxito",
        description: "Métricas creadas correctamente",
        status: "success"
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear métricas";
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

  const updateMetrics = useCallback(async (id: string, metrics: Partial<Metrics>): Promise<Metrics | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await metricsService.updateMetrics(id, metrics);
      showToast({
        title: "Éxito",
        description: "Métricas actualizadas correctamente",
        status: "success"
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar métricas";
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

  const deleteMetrics = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await metricsService.deleteMetrics(id);
      showToast({
        title: "Éxito",
        description: "Métricas eliminadas correctamente",
        status: "success"
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar métricas";
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
    metrics,
    summary,
    getMetrics,
    getMetricsSummary,
    getMetricsComparison,
    getMetricsByPlatform,
    getMetricsByMetric,
    createMetrics,
    updateMetrics,
    deleteMetrics
  };
}; 
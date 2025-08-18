import { useState, useEffect, useCallback } from 'react';
import { AlertApi, AlertConfig, Alert, AlertMetrics, AlertChannel } from '@/lib/services/alertApi';

export function useAlerts() {
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<AlertMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slackConfiguring, setSlackConfiguring] = useState(false);
  const [slackTesting, setSlackTesting] = useState(false);

  // Cargar configuración
  const loadConfig = useCallback(async () => {
    try {
      setError(null);
      const alertConfig = await AlertApi.getConfig();
      setConfig(alertConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading alert config');
    }
  }, []);

  // Cargar alertas activas
  const loadActiveAlerts = useCallback(async () => {
    try {
      setError(null);
      const alerts = await AlertApi.getActiveAlerts();
      setActiveAlerts(alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading active alerts');
    }
  }, []);

  // Cargar métricas
  const loadMetrics = useCallback(async () => {
    try {
      setError(null);
      const alertMetrics = await AlertApi.getMetrics();
      setMetrics(alertMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading alert metrics');
    }
  }, []);

  // Cargar todo
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadConfig(),
        loadActiveAlerts(),
        loadMetrics()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading alerts data');
    } finally {
      setLoading(false);
    }
  }, [loadConfig, loadActiveAlerts, loadMetrics]);

  // Configurar webhook de Slack
  const configureSlack = useCallback(async (webhookUrl: string) => {
    setSlackConfiguring(true);
    setError(null);
    try {
      await AlertApi.configureSlackWebhook(webhookUrl);
      await loadConfig(); // Recargar configuración
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error configuring Slack webhook');
      return false;
    } finally {
      setSlackConfiguring(false);
    }
  }, [loadConfig]);

  // Probar notificación de Slack
  const testSlack = useCallback(async () => {
    setSlackTesting(true);
    setError(null);
    try {
      await AlertApi.testSlackNotification();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error testing Slack notification');
      return false;
    } finally {
      setSlackTesting(false);
    }
  }, []);

  // Actualizar configuración
  const updateConfig = useCallback(async (updates: Partial<AlertConfig>) => {
    setError(null);
    try {
      await AlertApi.updateConfig(updates);
      await loadConfig(); // Recargar configuración
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating alert config');
      return false;
    }
  }, [loadConfig]);

  // Reconocer alerta
  const acknowledgeAlert = useCallback(async (alertId: string, acknowledgedBy: string) => {
    setError(null);
    try {
      await AlertApi.acknowledgeAlert(alertId, acknowledgedBy);
      await loadActiveAlerts(); // Recargar alertas activas
      await loadMetrics(); // Recargar métricas
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error acknowledging alert');
      return false;
    }
  }, [loadActiveAlerts, loadMetrics]);

  // Obtener canal de Slack
  const getSlackChannel = useCallback((): AlertChannel | null => {
    if (!config) return null;
    return config.alertChannels.find(channel => channel.type === 'slack') || null;
  }, [config]);

  // Verificar si Slack está configurado
  const isSlackConfigured = useCallback((): boolean => {
    const slackChannel = getSlackChannel();
    return slackChannel?.enabled && slackChannel?.config?.webhookUrl ? true : false;
  }, [getSlackChannel]);

  // Cargar datos iniciales
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadActiveAlerts();
      loadMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadActiveAlerts, loadMetrics]);

  return {
    // Estado
    config,
    activeAlerts,
    metrics,
    loading,
    error,
    slackConfiguring,
    slackTesting,

    // Acciones
    loadConfig,
    loadActiveAlerts,
    loadMetrics,
    loadAll,
    configureSlack,
    testSlack,
    updateConfig,
    acknowledgeAlert,

    // Utilidades
    getSlackChannel,
    isSlackConfigured,

    // Limpiar error
    clearError: () => setError(null),
  };
} 
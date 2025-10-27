import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WorkerMetrics {
  name: string;
  isHealthy: boolean;
  successRate: string;
  consecutiveFailures: number;
  circuitBreakerState: string;
  lastProcessedAt?: string;
  lastErrorAt?: string;
  uptime: number;
  metrics: {
    processed: number;
    failed: number;
    avgProcessingTime: number;
  };
}

interface SystemMetrics {
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  uptime: number;
  cpu: {
    user: number;
    system: number;
  };
  pid: number;
  nodeVersion: string;
  platform: string;
}

interface RealTimeMetrics {
  workers: Record<string, WorkerMetrics>;
  system: SystemMetrics;
  alerts: {
    active: any[];
    metrics: any;
  };
  queues: {
    dlq: any;
    fallbacks: any;
  };
  dependencies: {
    health: Record<string, any>;
    stats: any;
    criticalHealthy: boolean;
  };
  timestamp: string;
}

export function useRealTimeMetrics() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [workerDetails, setWorkerDetails] = useState<any>(null);

  // Conectar al WebSocket
  const connect = useCallback(() => {
    try {
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001', {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ [REAL_TIME] Connection error:', err);
        setError(`Error de conexión: ${err.message}`);
        setIsConnected(false);
      });

      newSocket.on('initial-state', (data: RealTimeMetrics) => {
        setMetrics(data);
      });

      newSocket.on('metrics-update', (data: RealTimeMetrics) => {
        setMetrics(data);
      });

      newSocket.on('worker-details', (data: any) => {
        setWorkerDetails(data);
      });

      setSocket(newSocket);
    } catch (err) {
      setError(`Error al conectar: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Desconectar
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Solicitar detalles de un worker
  const requestWorkerDetails = useCallback((workerName: string) => {
    if (socket && isConnected) {
      socket.emit('request-worker-details', workerName);
      setSelectedWorker(workerName);
    }
  }, [socket, isConnected]);

  // Solicitar estado de colas
  const requestQueueStatus = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('request-queue-status');
    }
  }, [socket, isConnected]);

  // Solicitar salud del sistema
  const requestSystemHealth = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('request-system-health');
    }
  }, [socket, isConnected]);

  // Conectar automáticamente al montar
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconectar automáticamente si se pierde la conexión
  useEffect(() => {
    if (!isConnected && !socket) {
      const timeout = setTimeout(() => {
        connect();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isConnected, socket, connect]);

  // Obtener métricas de un worker específico
  const getWorkerMetrics = useCallback((workerName: string) => {
    return metrics?.workers?.[workerName] || null;
  }, [metrics]);

  // Obtener estadísticas generales
  const getGeneralStats = useCallback(() => {
    if (!metrics?.workers) return null;

    const workers = Object.values(metrics.workers);
    const totalWorkers = workers.length;
    const healthyWorkers = workers.filter(w => w.isHealthy).length;
    const totalProcessed = workers.reduce((sum, w) => sum + w.metrics.processed, 0);
    const totalFailed = workers.reduce((sum, w) => sum + w.metrics.failed, 0);
    const avgSuccessRate = workers.reduce((sum, w) => sum + parseFloat(w.successRate), 0) / totalWorkers;

    return {
      totalWorkers,
      healthyWorkers,
      unhealthyWorkers: totalWorkers - healthyWorkers,
      totalProcessed,
      totalFailed,
      avgSuccessRate: avgSuccessRate.toFixed(2),
      healthPercentage: ((healthyWorkers / totalWorkers) * 100).toFixed(1)
    };
  }, [metrics]);

  // Obtener alertas por severidad
  const getAlertsBySeverity = useCallback(() => {
    if (!metrics?.alerts?.active) return {};

    const alerts = metrics.alerts.active;
    return alerts.reduce((acc: any, alert: any) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {});
  }, [metrics]);

  // Obtener uso de memoria en porcentaje
  const getMemoryUsagePercentage = useCallback(() => {
    if (!metrics?.system?.memory) return 0;
    
    const { heapUsed, heapTotal } = metrics.system.memory;
    return heapTotal > 0 ? (heapUsed / heapTotal) * 100 : 0;
  }, [metrics]);

  return {
    // Estado
    metrics,
    isConnected,
    error,
    selectedWorker,
    workerDetails,

    // Acciones
    connect,
    disconnect,
    requestWorkerDetails,
    requestQueueStatus,
    requestSystemHealth,

    // Utilidades
    getWorkerMetrics,
    getGeneralStats,
    getAlertsBySeverity,
    getMemoryUsagePercentage,

    // Helpers
    workers: metrics?.workers || {},
    system: metrics?.system,
    alerts: metrics?.alerts,
    queues: metrics?.queues,
    dependencies: metrics?.dependencies,
    timestamp: metrics?.timestamp
  };
} 
// Hook para monitoreo de peticiones en componentes
// Permite agregar contexto y obtener métricas en tiempo real

import { useState, useEffect, useRef, useCallback } from 'react';
import { requestMonitor, RequestMetrics, SessionMetrics } from '@/lib/http/requestMonitor';
import { withContext } from '@/lib/http/httpInterceptor';

export interface RequestMonitoringState {
  isLoading: boolean;
  activeRequests: number;
  totalRequests: number;
  errors: number;
  avgResponseTime: number;
  cacheHitRate: number;
  lastRequest?: RequestMetrics;
}

export const useRequestMonitoring = (componentName: string) => {
  const [state, setState] = useState<RequestMonitoringState>({
    isLoading: false,
    activeRequests: 0,
    totalRequests: 0,
    errors: 0,
    avgResponseTime: 0,
    cacheHitRate: 0
  });

  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const listenerRef = useRef<(() => void) | null>(null);

  // Actualizar estado cuando llegan nuevas métricas
  const updateState = useCallback(() => {
    const sessionMetrics = requestMonitor.getSessionMetrics();
    setMetrics(sessionMetrics);
    
    const componentRequests = sessionMetrics.requests.filter(r => r.component === componentName);
    const activeRequests = componentRequests.filter(r => r.duration === undefined).length;
    const completedRequests = componentRequests.filter(r => r.duration !== undefined);
    const errors = completedRequests.filter(r => r.error || (r.status && r.status >= 400)).length;
    
    setState({
      isLoading: activeRequests > 0,
      activeRequests,
      totalRequests: componentRequests.length,
      errors,
      avgResponseTime: completedRequests.length > 0 
        ? completedRequests.reduce((sum, r) => sum + (r.duration || 0), 0) / completedRequests.length 
        : 0,
      cacheHitRate: completedRequests.length > 0 
        ? (completedRequests.filter(r => r.fromCache).length / completedRequests.length) * 100 
        : 0,
      lastRequest: componentRequests[componentRequests.length - 1]
    });
  }, [componentName]);

  // Configurar listener al montar
  useEffect(() => {
    listenerRef.current = requestMonitor.addListener((requestMetrics) => {
      if (requestMetrics.component === componentName) {
        updateState();
      }
    });

    updateState(); // Estado inicial

    return () => {
      if (listenerRef.current) {
        listenerRef.current();
      }
    };
  }, [componentName, updateState]);

  // Helper para crear headers de contexto
  const createRequestContext = useCallback((userAction: string) => {
    return withContext(componentName, userAction);
  }, [componentName]);

  // Helper para trackear peticiones manuales (cache, etc)
  const trackRequest = useCallback((
    url: string, 
    method: string, 
    userAction: string,
    requestData?: any
  ) => {
    return requestMonitor.startRequest(url, method, componentName, userAction, requestData);
  }, [componentName]);

  const completeRequest = useCallback((
    requestId: string,
    status?: number,
    responseData?: any,
    fromCache: boolean = false,
    error?: string
  ) => {
    requestMonitor.endRequest(requestId, status, responseData, fromCache, error);
  }, []);

  return {
    // Estado actual del componente
    state,
    
    // Métricas completas de la sesión
    metrics,
    
    // Helpers para agregar contexto
    createRequestContext,
    
    // Helpers para tracking manual
    trackRequest,
    completeRequest,
    
    // Función para exportar métricas
    exportMetrics: () => requestMonitor.exportMetrics(),
    
    // Función para limpiar métricas
    clearMetrics: () => requestMonitor.clearMetrics()
  };
};

// Hook simplificado para solo obtener métricas globales
export const useGlobalRequestMetrics = () => {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const listenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(requestMonitor.getSessionMetrics());
    };

    listenerRef.current = requestMonitor.addListener(updateMetrics);
    updateMetrics(); // Estado inicial

    return () => {
      if (listenerRef.current) {
        listenerRef.current();
      }
    };
  }, []);

  return {
    metrics,
    exportMetrics: () => requestMonitor.exportMetrics(),
    clearMetrics: () => requestMonitor.clearMetrics()
  };
}; 
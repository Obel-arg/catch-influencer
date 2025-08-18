// Dashboard de debugging para monitoreo de peticiones en tiempo real
// Solo se muestra en desarrollo o cuando se activa manualmente

"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalRequestMetrics } from '@/hooks/common/useRequestMonitoring';
import { Download, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';

interface RequestDebugDashboardProps {
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export const RequestDebugDashboard = ({ 
  isVisible = false, 
  onToggleVisibility 
}: RequestDebugDashboardProps) => {
  const { metrics, exportMetrics, clearMetrics } = useGlobalRequestMetrics();
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-refresh cada 2 segundos
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      // El hook ya se actualiza automáticamente con listeners
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const handleExport = () => {
    const data = exportMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `request-metrics-${new Date().toISOString().slice(0, 16)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todas las métricas?')) {
      clearMetrics();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(0)}ms`;
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          size="sm"
        >
          📊 Debug ({metrics?.totalRequests || 0})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-gray-900 text-white border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="p-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">📊 Request Monitor</span>
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {metrics?.totalRequests || 0} requests
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setIsMinimized(true)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
            {onToggleVisibility && (
              <Button
                onClick={onToggleVisibility}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Métricas principales */}
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Tiempo promedio</div>
              <div className="font-mono text-green-400">
                {formatTime(metrics?.avgResponseTime || 0)}
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Cache hit rate</div>
              <div className="font-mono text-blue-400">
                {(metrics?.cacheHitRate || 0).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Datos transferidos</div>
              <div className="font-mono text-purple-400">
                {formatSize(metrics?.totalDataTransferred || 0)}
              </div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Errores</div>
              <div className="font-mono text-red-400">
                {metrics?.errors || 0}
              </div>
            </div>
          </div>

          {/* Últimas peticiones */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Últimas peticiones</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {metrics?.requests.slice(-5).reverse().map((req) => (
                <div key={req.id} className="text-xs bg-gray-800 p-2 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400">{req.method}</span>
                    <span className="font-mono text-green-400">
                      {req.duration ? formatTime(req.duration) : 'pending...'}
                    </span>
                  </div>
                  <div className="text-gray-300 truncate">
                    {req.url}
                  </div>
                  {req.component && (
                    <div className="text-gray-500">
                      {req.component} • {req.userAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown por componente */}
          {metrics && Object.keys(metrics.requests.reduce((acc, req) => {
            if (req.component) acc[req.component] = true;
            return acc;
          }, {} as Record<string, boolean>)).length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-2">Por componente</div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {Object.entries(
                  metrics.requests.reduce((acc, req) => {
                    if (!req.component || req.duration === undefined) return acc;
                    if (!acc[req.component]) {
                      acc[req.component] = { count: 0, totalTime: 0 };
                    }
                    acc[req.component].count++;
                    acc[req.component].totalTime += req.duration;
                    return acc;
                  }, {} as Record<string, { count: number; totalTime: number }>)
                ).map(([component, stats]) => (
                  <div key={component} className="text-xs bg-gray-800 p-1 rounded flex justify-between">
                    <span className="text-purple-400">{component}</span>
                    <span className="font-mono text-green-400">
                      {stats.count} • {formatTime(stats.totalTime / stats.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-7 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Download className="h-3 w-3 mr-1" />
              Exportar
            </Button>
            <Button
              onClick={handleClear}
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-7 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Hook para controlar la visibilidad del dashboard
export const useDebugDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo en desarrollo o si hay un flag en localStorage
    const shouldShow = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('debug-dashboard') === 'true';
    
    if (shouldShow) {
      // Atajo de teclado para mostrar/ocultar: Ctrl + Shift + D
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
          e.preventDefault();
          setIsVisible(prev => !prev);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  const toggleVisibility = () => setIsVisible(prev => !prev);

  return {
    isVisible,
    toggleVisibility,
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false)
  };
}; 
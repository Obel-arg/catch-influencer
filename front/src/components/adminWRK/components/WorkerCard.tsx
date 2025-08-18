"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Activity, 
  AlertTriangle, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { formatDateTimeArgentina } from '@/utils/dateUtils';
import { WorkerStatus } from '../types';

interface WorkerCardProps {
  worker: WorkerStatus;
  controllingWorker: string | null;
  onControlWorker: (workerName: string, action: 'start' | 'stop' | 'restart' | 'force-init') => void;
  onViewQueue: (workerName: string) => void;
  onViewCompleted: (workerName: string) => void;
  onViewFailed: (workerName: string) => void;
  onViewLogs: (workerName: string) => void;
}

export function WorkerCard({ 
  worker, 
  controllingWorker, 
  onControlWorker, 
  onViewQueue, 
  onViewCompleted, 
  onViewFailed, 
  onViewLogs 
}: WorkerCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'restarting':
        return <RotateCcw className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">Running</Badge>;
      case 'stopped':
        return <Badge className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5">Stopped</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 text-xs px-2 py-0.5">Error</Badge>;
      case 'restarting':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5">Restarting</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5">Unknown</Badge>;
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-lg truncate">{worker.name}</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon(worker.status)}
            {getStatusBadge(worker.status)}
            {worker.isInfiniteLoop && (
              <Badge className="bg-red-100 text-red-800 text-xs px-2 py-0.5">Infinite Loop</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-3 sm:p-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-gray-600">Procesados</p>
            <p className="font-semibold text-green-600">{worker.processed}</p>
          </div>
          <div>
            <p className="text-gray-600">Fallidos</p>
            <p className="font-semibold text-red-600">{worker.failed}</p>
          </div>
          <div>
            <p className="text-gray-600">Tasa de Éxito</p>
            <p className="font-semibold">{worker.successRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-gray-600">En Cola</p>
            <p className="font-semibold">{worker.queueSize}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-600 text-xs sm:text-sm">Última Actividad</p>
          <p className="text-xs sm:text-sm font-medium break-all">{worker.lastActivity}</p>
        </div>

        {worker.lastRestart && (
          <div>
            <p className="text-gray-600 text-xs sm:text-sm">Último Reinicio</p>
            <p className="text-xs sm:text-sm font-medium text-blue-600 break-all">{worker.lastRestart}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {worker.status === 'running' ? (
            <Button 
              onClick={() => onControlWorker(worker.name, 'stop')}
              variant="outline" 
              size="sm"
              className="flex-1 w-full sm:w-auto"
              disabled={controllingWorker === worker.name}
            >
              <Square className="h-4 w-4 mr-1" />
              {controllingWorker === worker.name ? 'Parando...' : 'Parar'}
            </Button>
          ) : (
            <Button 
              onClick={() => onControlWorker(worker.name, 'start')}
              variant="outline" 
              size="sm"
              className="flex-1 w-full sm:w-auto"
              disabled={controllingWorker === worker.name}
            >
              <Play className="h-4 w-4 mr-1" />
              {controllingWorker === worker.name ? 'Iniciando...' : 'Iniciar'}
            </Button>
          )}
          <Button 
            onClick={() => onControlWorker(worker.name, 'restart')}
            variant="outline" 
            size="sm"
            className="flex-1 w-full sm:w-auto"
            disabled={controllingWorker === worker.name}
          >
            <RotateCcw className={`h-4 w-4 mr-1 ${controllingWorker === worker.name ? 'animate-spin' : ''}`} />
            {controllingWorker === worker.name ? 'Reiniciando...' : 'Reiniciar'}
          </Button>
          <Button 
            onClick={() => onControlWorker(worker.name, 'force-init')}
            variant="outline" 
            size="sm"
            className="flex-1 w-full sm:w-auto text-blue-600 hover:text-blue-700 border-blue-300"
            disabled={controllingWorker === worker.name}
            title="Forzar inicialización del worker"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {controllingWorker === worker.name ? 'Inicializando...' : 'Force Init'}
          </Button>
        </div>

        {/* Queue and History Controls */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={() => onViewQueue(worker.name)}
            variant="outline"
            size="sm"
            className="flex-1 w-full sm:w-auto"
          >
            Ver Cola ({worker.queueSize})
          </Button>
          <Button
            onClick={() => onViewCompleted(worker.name)}
            variant="outline"
            size="sm"
            className="flex-1 w-full sm:w-auto"
          >
            Completados ({worker.processed})
          </Button>
          <Button
            onClick={() => onViewFailed(worker.name)}
            variant="outline"
            size="sm"
            className="flex-1 w-full sm:w-auto"
          >
            Fallidos ({worker.failed})
          </Button>
        </div>

        {/* Additional Controls */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={() => onViewLogs(worker.name)}
            variant="outline"
            size="sm"
            className="flex-1 w-full sm:w-auto"
          >
            📋 Logs en Tiempo Real
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
"use client"

import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut } from 'lucide-react';
import { 
  formatTimeOnlyArgentina, 
  formatDateOnlyArgentina 
} from '@/utils/dateUtils';

interface AdminHeaderProps {
  lastUpdate: Date | null;
  nextAutoUpdate: Date | null;
  controlMessage: { type: 'success' | 'error', message: string } | null;
  autoUpdateEnabled: boolean;
  refreshing: boolean;
  onToggleAutoUpdate: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export function AdminHeader({
  lastUpdate,
  nextAutoUpdate,
  controlMessage,
  autoUpdateEnabled,
  refreshing,
  onToggleAutoUpdate,
  onRefresh,
  onLogout
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-8 w-full">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">Panel de Administración</h1>
        <p className="text-gray-600 text-sm sm:text-base">Monitoreo y control de workers</p>
        {lastUpdate && (
          <p className="text-xs text-gray-500 mt-1">
            Última actualización: {formatTimeOnlyArgentina(lastUpdate)}
          </p>
        )}
        {nextAutoUpdate && (
          <p className="text-xs text-gray-500 mt-1">
            🔄 Próxima actualización automática: {formatDateOnlyArgentina(nextAutoUpdate)} a las {formatTimeOnlyArgentina(nextAutoUpdate)}
          </p>
        )}
        {controlMessage && (
          <div className={`mt-2 p-2 rounded text-xs sm:text-sm ${
            controlMessage.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {controlMessage.message}
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button 
          onClick={onToggleAutoUpdate} 
          variant={autoUpdateEnabled ? "default" : "outline"}
          size="sm"
          className="w-full sm:w-auto"
        >
          {autoUpdateEnabled ? '🔄 Auto ON' : '⏸️ Auto OFF'}
        </Button>
        <Button 
          onClick={onRefresh} 
          disabled={refreshing} 
          variant="outline"
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
        <Button 
          onClick={onLogout} 
          variant="outline"
          className="w-full sm:w-auto"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
} 
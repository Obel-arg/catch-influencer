import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Database, Clock, HardDrive } from "lucide-react";
import { useExplorerCache } from "@/utils/explorer-cache";
import { RobustFloatingPanel } from "@/components/ui/robust-modal";

export const CacheDebugPanel = () => {
  const { getStats, clearCache } = useExplorerCache();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const stats = getStats();

  const handleClearCache = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el cache?')) {
      clearCache();
      alert('Cache limpiado correctamente');
    }
  };

  if (!isExpanded) {
    return (
      <RobustFloatingPanel className="p-0">
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-blue-200 border-0 rounded-xl"
        >
          <Database className="h-4 w-4 mr-2" />
          Cache Debug
          <Badge variant="secondary" className="ml-2">
            {stats.totalEntries}
          </Badge>
        </Button>
      </RobustFloatingPanel>
    );
  }

  return (
    <RobustFloatingPanel className="w-80 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-600" />
          Cache Debug Panel
        </h3>
        <Button
          onClick={() => setIsExpanded(false)}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          ×
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <HardDrive className="h-3 w-3 text-gray-500" />
            <span>Entradas: <strong>{stats.totalEntries}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-3 w-3 text-gray-500" />
            <span>Tamaño: <strong>{stats.totalSize}</strong></span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Clock className="h-3 w-3 text-gray-500" />
            <span>Más antiguo: <strong>{stats.oldestEntry}</strong></span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Clock className="h-3 w-3 text-gray-500" />
            <span>Más reciente: <strong>{stats.newestEntry}</strong></span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <Button
            onClick={handleClearCache}
            variant="destructive"
            size="sm"
            className="w-full text-xs"
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Limpiar Cache
          </Button>
        </div>
      </div>
    </RobustFloatingPanel>
  );
}; 
import React from 'react';
import { ExtendedInfluencerData, ExtendedDataStatus } from '@/lib/services/influencer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Loader2, Database, RefreshCw, AlertCircle, CheckCircle, Clock, DollarSign, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface InfluencerExtendedDataProps {
  influencerId: string;
  className?: string;
  extendedData?: ExtendedInfluencerData | null;
  extendedLoading?: boolean;
  syncing?: boolean;
  extendedError?: string | null;
  summary?: {
    hasExtendedData: boolean;
    completenessScore: number;
    lastSync: string | null;
    platformsWithData: string[];
    needsSync: boolean;
    totalApiCalls: number;
    estimatedCost: number;
  } | null;
  syncExtendedData?: (platforms?: ('youtube' | 'instagram' | 'tiktok')[]) => Promise<void>;
  refreshStatus?: () => Promise<void>;
  forceSync?: () => Promise<void>;
  loadDetailedStatus?: () => Promise<void>;
}

const InfluencerExtendedData: React.FC<InfluencerExtendedDataProps> = ({ 
  influencerId, 
  className = '',
  extendedData,
  extendedLoading = false,
  syncing = false,
  extendedError,
  summary,
  syncExtendedData,
  refreshStatus,
  forceSync
}) => {

  // Renderizar estado de carga inicial
  if (extendedLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Datos Extendidos
          </CardTitle>
          <CardDescription>
            Información detallada y análisis avanzado
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Cargando estado de datos extendidos...</span>
        </CardContent>
      </Card>
    );
  }

  // Renderizar error
  if (extendedError) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Datos Extendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{extendedError}</AlertDescription>
          </Alert>
          <Button 
            onClick={refreshStatus} 
            variant="outline" 
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeVariant = (syncStatus: string) => {
    switch (syncStatus) {
      case 'completed':
        return 'default';
      case 'syncing':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Función para obtener el ícono del estado
  const getStatusIcon = (syncStatus: string) => {
    switch (syncStatus) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'syncing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  // Función para formatear fecha
  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <CardTitle>Datos Extendidos</CardTitle>
          </div>
          
          {summary?.hasExtendedData && (
            <Badge 
              variant={getStatusBadgeVariant(extendedData?.sync_status || 'not_found')}
              className="flex items-center gap-1"
            >
              {getStatusIcon(extendedData?.sync_status || 'not_found')}
              {extendedData?.sync_status === 'completed' && 'Sincronizado'}
              {extendedData?.sync_status === 'syncing' && 'Sincronizando'}
              {extendedData?.sync_status === 'error' && 'Error'}
              {extendedData?.sync_status === 'pending' && 'Pendiente'}
              {!extendedData?.sync_status && 'No encontrado'}
            </Badge>
          )}
        </div>
        
        <CardDescription>
          Información detallada y análisis avanzado del influencer
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estado de sincronización */}
        {summary?.hasExtendedData ? (
          <div className="space-y-4">
            {/* Barra de progreso de completitud */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completitud de datos</span>
                <span className="font-medium">{summary.completenessScore}%</span>
              </div>
              <Progress value={summary.completenessScore} className="h-2" />
            </div>

            {/* Información de plataformas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.platformsWithData.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Plataformas con datos
                </div>
                <div className="text-xs mt-1">
                  {summary.platformsWithData.join(', ') || 'Ninguna'}
                </div>
              </div>

              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {summary.totalApiCalls}
                </div>
                <div className="text-sm text-muted-foreground">
                  Llamadas API
                </div>
                <div className="text-xs mt-1 flex items-center justify-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ${summary.estimatedCost.toFixed(2)}
                </div>
              </div>

              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  <Activity className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Última sincronización
                </div>
                <div className="text-xs mt-1">
                  {formatLastSync(summary.lastSync)}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={() => syncExtendedData?.()}
                disabled={syncing || !syncExtendedData}
                variant={summary.needsSync ? 'default' : 'outline'}
                className="flex-1"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {summary.needsSync ? 'Sincronizar Ahora' : 'Actualizar Datos'}
                  </>
                )}
              </Button>

              <Button
                onClick={() => forceSync?.()}
                disabled={syncing || !forceSync}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Alerta si necesita sincronización */}
            {summary.needsSync && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Los datos extendidos necesitan ser actualizados. 
                  {summary.completenessScore < 50 && ' La completitud actual es baja.'}
                  {summary.lastSync && 
                    new Date(summary.lastSync) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && 
                    ' Los datos fueron sincronizados hace más de una semana.'
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          /* No hay datos extendidos */
          <div className="text-center py-8 space-y-4">
            <Database className="w-16 h-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                No hay datos extendidos disponibles
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Obtén información detallada del influencer incluyendo historial, 
                métricas avanzadas, información de contacto y análisis de crecimiento.
              </p>
            </div>
            
            <Button
              onClick={() => syncExtendedData?.()}
              disabled={syncing || !syncExtendedData}
              size="lg"
              className="mt-4"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Obteniendo datos...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Obtener Datos Extendidos
                </>
              )}
            </Button>
            
            <div className="text-xs text-muted-foreground mt-2">
              Esto puede tomar entre 10-30 segundos
            </div>
          </div>
        )}

        {/* Información de errores de sincronización */}
        {extendedData?.sync_errors && Object.keys(extendedData.sync_errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">
                Errores durante la sincronización:
              </div>
              <div className="space-y-1 text-sm">
                {Object.entries(extendedData.sync_errors || {}).map(([key, error]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-xs opacity-75">
                      {typeof error === 'string' ? error : 'Error desconocido'}
                    </span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default InfluencerExtendedData; 
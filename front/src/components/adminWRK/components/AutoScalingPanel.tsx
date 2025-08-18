import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  Pause, 
  Play, 
  Settings,
  Clock,
  Activity
} from 'lucide-react';
import { getAdminApiBaseUrl } from '@/lib/services/adminApi';

interface ScalingStatus {
  [workerName: string]: {
    activeCount: number;
    totalCount: number;
    state: 'normal' | 'scaling_up' | 'scaling_down' | 'paused';
    lastScale?: number;
    inCooldown: boolean;
  };
}

interface ScalingEvent {
  workerName: string;
  action: string;
  reason: string;
  timestamp: string;
  beforeCount: number;
  afterCount: number;
}

export function AutoScalingPanel() {
  const [scalingStatus, setScalingStatus] = useState<ScalingStatus>({});
  const [scalingHistory, setScalingHistory] = useState<ScalingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScalingStatus = async () => {
    try {
      const response = await fetch(`${getAdminApiBaseUrl()}/auto-scaling/status`);
      if (response.ok) {
        const data = await response.json();
        setScalingStatus(data.data || {});
      }
    } catch (error) {
      console.error('Error fetching scaling status:', error);
      setError('Error loading scaling status');
    }
  };

  const fetchScalingHistory = async () => {
    try {
      const response = await fetch(`${getAdminApiBaseUrl()}/auto-scaling/history`);
      if (response.ok) {
        const data = await response.json();
        setScalingHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching scaling history:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchScalingStatus(), fetchScalingHistory()]);
      setLoading(false);
    };

    loadData();
    
    // Refresh cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'scaling_up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'scaling_down':
        return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'scaling_up':
        return <Badge variant="default" className="bg-green-100 text-green-800">Escalando UP</Badge>;
      case 'scaling_down':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Escalando DOWN</Badge>;
      case 'paused':
        return <Badge variant="destructive">Pausado</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-AR');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Auto-Scaling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Auto-Scaling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado actual del auto-scaling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Estado del Auto-Scaling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(scalingStatus).map(([workerName, status]) => (
              <Card key={workerName} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize">{workerName}</h3>
                    {getStateIcon(status.state)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Workers Activos:</span>
                      <span className="font-medium">{status.activeCount}/{status.totalCount}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estado:</span>
                      {getStateBadge(status.state)}
                    </div>
                    
                    {status.inCooldown && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">En cooldown</span>
                      </div>
                    )}
                    
                    {status.lastScale && (
                      <div className="text-xs text-gray-500">
                        Último escalado: {formatTimestamp(new Date(status.lastScale).toISOString())}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historial de escalado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial de Escalado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {scalingHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay eventos de escalado recientes
                </div>
              ) : (
                scalingHistory.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {event.action === 'scale_up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {event.action === 'scale_down' && <TrendingDown className="h-4 w-4 text-orange-500" />}
                        {event.action === 'pause' && <Pause className="h-4 w-4 text-red-500" />}
                        <span className="font-medium capitalize">{event.workerName}</span>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {event.beforeCount} → {event.afterCount}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{event.reason}</div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 
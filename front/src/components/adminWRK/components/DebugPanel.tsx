"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bug, Play, Square, RotateCcw } from 'lucide-react';

interface DebugPanelProps {
  debugInfo: any;
}

export function DebugPanel({ debugInfo }: DebugPanelProps) {
  if (!debugInfo) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No debug information available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-3 w-3 text-green-500" />;
      case 'stopped':
        return <Square className="h-3 w-3 text-gray-500" />;
      case 'restarting':
        return <RotateCcw className="h-3 w-3 text-yellow-500" />;
      default:
        return <Square className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Active Workers */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Active Workers ({debugInfo.activeWorkers?.length || 0})</h4>
          {debugInfo.activeWorkers && debugInfo.activeWorkers.length > 0 ? (
            <div className="space-y-1">
              {debugInfo.activeWorkers.map((workerName: string) => (
                <div key={workerName} className="flex items-center gap-2 text-xs">
                  <Play className="h-3 w-3 text-green-500" />
                  <span className="font-medium">{workerName}</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs">No active workers</p>
          )}
        </div>

        {/* Stopped Workers */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Stopped Workers ({debugInfo.stoppedWorkers?.length || 0})</h4>
          {debugInfo.stoppedWorkers && debugInfo.stoppedWorkers.length > 0 ? (
            <div className="space-y-1">
              {debugInfo.stoppedWorkers.map((workerName: string) => (
                <div key={workerName} className="flex items-center gap-2 text-xs">
                  <Square className="h-3 w-3 text-gray-500" />
                  <span className="font-medium">{workerName}</span>
                  <Badge className="bg-gray-100 text-gray-800 text-xs">Stopped</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs">No stopped workers</p>
          )}
        </div>

        {/* Worker States */}
        {debugInfo.workerStates && debugInfo.workerStates.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Worker States</h4>
            <div className="space-y-1">
              {debugInfo.workerStates.map((worker: any) => (
                <div key={worker.name} className="flex items-center gap-2 text-xs">
                  {getStatusIcon(worker.status)}
                  <span className="font-medium">{worker.name}</span>
                  <Badge className={`text-xs ${
                    worker.status === 'running' ? 'bg-green-100 text-green-800' :
                    worker.status === 'stopped' ? 'bg-gray-100 text-gray-800' :
                    worker.status === 'restarting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {worker.status}
                  </Badge>
                  {worker.hasWorker && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">Has Worker</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
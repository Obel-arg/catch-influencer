"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Trash2, 
  ArrowUp,
  Pause,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { formatDateTimeArgentina } from '@/utils/dateUtils';
import { JobActionConfirm } from './JobActionConfirm';

interface QueueModalProps {
  workerName: string;
  queue: any[];
  queueStats: any;
  onClose: () => void;
  onControlJob: (workerName: string, jobId: string, action: 'pause' | 'resume' | 'remove' | 'retry' | 'promote' | 'force-terminate' | 'restart') => void;
  controllingJob: string | null;
}

export function QueueModal({ 
  workerName, 
  queue, 
  queueStats, 
  onClose, 
  onControlJob, 
  controllingJob 
}: QueueModalProps) {
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    jobId: string;
    jobName: string;
    action: 'remove' | 'retry' | 'promote' | 'force-terminate' | 'restart';
  }>({
    isOpen: false,
    jobId: '',
    jobName: '',
    action: 'remove'
  });

  const handleJobAction = (jobId: string, action: 'pause' | 'resume' | 'remove' | 'retry' | 'promote' | 'force-terminate' | 'restart', jobName: string) => {
    // Acciones que requieren confirmación
    if (['remove', 'retry', 'promote', 'force-terminate', 'restart'].includes(action)) {
      setConfirmAction({
        isOpen: true,
        jobId,
        jobName,
        action: action as 'remove' | 'retry' | 'promote' | 'force-terminate' | 'restart'
      });
    } else {
      // Acciones directas (pause, resume)
      onControlJob(workerName, jobId, action);
    }
  };

  const handleConfirmAction = () => {
    onControlJob(workerName, confirmAction.jobId, confirmAction.action);
    setConfirmAction({ ...confirmAction, isOpen: false });
  };

  const handleCancelAction = () => {
    setConfirmAction({ ...confirmAction, isOpen: false });
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-1 sm:p-0">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-full sm:max-w-6xl h-[98vh] sm:h-auto p-2 sm:p-6 relative flex flex-col max-h-[98vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header sticky en mobile */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between border-b border-gray-200 p-2 sm:p-0">
          <h2 className="text-base sm:text-xl font-bold truncate">Cola de jobs: {workerName}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl font-semibold p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Estadísticas de la cola */}
        {queueStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-2 sm:mb-6 p-2 sm:p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{queueStats.total}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{queueStats.waiting}</div>
              <div className="text-xs sm:text-sm text-gray-600">En Espera</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{queueStats.active}</div>
              <div className="text-xs sm:text-sm text-gray-600">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">{queueStats.failed}</div>
              <div className="text-xs sm:text-sm text-gray-600">Fallidos</div>
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto">
        {queue.length === 0 ? (
          <p className="text-gray-500 p-4">No hay jobs en cola.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 sm:px-3 py-2 text-left">ID</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Tipo</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Estado</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Prioridad</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Progreso</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Intentos</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Creado</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Duración Est.</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Acciones</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 sm:px-3 py-2 font-mono text-[10px] sm:text-xs break-all max-w-[60px] sm:max-w-[120px]">{job.id}</td>
                    <td className="px-2 sm:px-3 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-[10px] sm:text-xs">
                        {job.name}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      <span className={`px-2 py-1 rounded text-[10px] sm:text-xs ${
                        job.state === 'active' ? 'bg-green-100 text-green-800' :
                        job.state === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        job.state === 'delayed' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.state === 'active' ? '🔄 Ejecutando' :
                         job.state === 'waiting' ? '⏳ En Espera' :
                         job.state === 'delayed' ? '⏰ Retrasado' :
                         job.state}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      <span className={`px-2 py-1 rounded text-[10px] sm:text-xs ${
                        job.jobData?.priorityLevel === 'Alta' ? 'bg-red-100 text-red-800' :
                        job.jobData?.priorityLevel === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {job.jobData?.priorityLevel || 'Baja'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      {job.state === 'active' ? (
                        <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress || 0}%` }}
                          ></div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] sm:text-xs ${
                        job.attemptsMade > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.attemptsMade}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs">
                      {formatDateTimeArgentina(job.timestamp)}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-gray-600">
                      {job.jobData?.estimatedDuration}
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {/* Pause/Resume para jobs activos */}
                        {job.state === 'active' && (
                          <Button
                            onClick={() => handleJobAction(job.id, 'pause', job.name)}
                            variant="outline"
                            size="sm"
                            className="h-8 sm:h-6 px-3 sm:px-2 text-xs w-full sm:w-auto"
                            disabled={controllingJob === job.id}
                            title="Pausar job"
                          >
                            <Pause className="h-4 w-4 sm:h-3 sm:w-3" />
                          </Button>
                        )}
                        {/* Resume para jobs pausados */}
                        {job.state === 'paused' && (
                          <Button
                            onClick={() => handleJobAction(job.id, 'resume', job.name)}
                            variant="outline"
                            size="sm"
                            className="h-8 sm:h-6 px-3 sm:px-2 text-xs w-full sm:w-auto"
                            disabled={controllingJob === job.id}
                            title="Reanudar job"
                          >
                            <Play className="h-4 w-4 sm:h-3 sm:w-3" />
                          </Button>
                        )}
                        {/* Retry para jobs fallidos */}
                        {job.state === 'failed' && (
                          <Button
                            onClick={() => handleJobAction(job.id, 'retry', job.name)}
                            variant="outline"
                            size="sm"
                            className="h-8 sm:h-6 px-3 sm:px-2 text-xs w-full sm:w-auto"
                            disabled={controllingJob === job.id}
                            title="Reintentar job"
                          >
                            <RotateCcw className="h-4 w-4 sm:h-3 sm:w-3" />
                          </Button>
                        )}
                        {/* Promote para jobs en espera */}
                        {job.state === 'waiting' && (
                          <Button
                            onClick={() => handleJobAction(job.id, 'promote', job.name)}
                            variant="outline"
                            size="sm"
                            className="h-8 sm:h-6 px-3 sm:px-2 text-xs w-full sm:w-auto"
                            disabled={controllingJob === job.id}
                            title="Promover prioridad"
                          >
                            <ArrowUp className="h-4 w-4 sm:h-3 sm:w-3" />
                          </Button>
                        )}
                        {/* Restart para cualquier job (sin importar estado) */}
                        <Button
                          onClick={() => handleJobAction(job.id, 'restart', job.name)}
                          variant="outline"
                          size="sm"
                          className="h-8 sm:h-6 px-3 sm:px-2 text-xs w-full sm:w-auto text-blue-600 hover:text-blue-700 border-blue-300"
                          disabled={controllingJob === job.id}
                          title="Reiniciar job (resetear a pending desde cualquier estado)"
                        >
                          <RefreshCw className="h-4 w-4 sm:h-3 sm:w-3" />
                        </Button>
                        {/* Force Terminate para cualquier job */}
                        <Button
                          onClick={() => handleJobAction(job.id, 'force-terminate', job.name)}
                          variant="outline"
                          size="sm"
                          className="h-8 sm:h-6 px-3 sm:px-2 text-xs w-full sm:w-auto text-red-600 hover:text-red-700 border-red-300"
                          disabled={controllingJob === job.id}
                          title="Forzar terminación (sin importar estado)"
                        >
                          <AlertTriangle className="h-4 w-4 sm:h-3 sm:w-3" />
                        </Button>
                      </div>
                      {/* Indicador de carga */}
                      {controllingJob === job.id && (
                        <div className="mt-1 text-xs text-blue-600 animate-pulse">Procesando...</div>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      <details>
                        <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">Ver</summary>
                        <pre className="whitespace-pre-wrap text-[10px] sm:text-xs text-gray-700 bg-gray-50 p-1 sm:p-2 rounded border max-w-[120px] sm:max-w-xs max-h-16 sm:max-h-32 overflow-auto">
                          {JSON.stringify(job.jobData, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
        {/* Confirmación de acción destructiva */}
        <JobActionConfirm
          isOpen={confirmAction.isOpen}
          jobId={confirmAction.jobId}
          jobName={confirmAction.jobName}
          action={confirmAction.action}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
          isProcessing={controllingJob === confirmAction.jobId}
        />
      </div>
    </div>
  );
} 
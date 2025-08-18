"use client"

import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, RotateCcw, ArrowUp, RefreshCw } from 'lucide-react';

interface JobActionConfirmProps {
  isOpen: boolean;
  jobId: string;
  jobName: string;
  action: 'remove' | 'retry' | 'promote' | 'force-terminate' | 'restart';
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export function JobActionConfirm({ 
  isOpen, 
  jobId, 
  jobName, 
  action, 
  onConfirm, 
  onCancel, 
  isProcessing 
}: JobActionConfirmProps) {
  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'remove':
        return {
          title: 'Eliminar Job',
          message: '¿Estás seguro de que quieres eliminar este job? Esta acción no se puede deshacer.',
          icon: <Trash2 className="h-5 w-5 text-red-600" />,
          confirmText: 'Eliminar',
          confirmVariant: 'destructive' as const,
        };
      case 'retry':
        return {
          title: 'Reintentar Job',
          message: '¿Quieres reintentar este job fallido?',
          icon: <RotateCcw className="h-5 w-5 text-blue-600" />,
          confirmText: 'Reintentar',
          confirmVariant: 'default' as const,
        };
      case 'promote':
        return {
          title: 'Promover Prioridad',
          message: '¿Quieres promover la prioridad de este job?',
          icon: <ArrowUp className="h-5 w-5 text-green-600" />,
          confirmText: 'Promover',
          confirmVariant: 'default' as const,
        };
      case 'force-terminate':
        return {
          title: 'Forzar Terminación',
          message: '¿Estás seguro de que quieres forzar la terminación de este job? Esta acción terminará el job sin importar su estado actual (incluso si está siendo procesado).',
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
          confirmText: 'Forzar Terminación',
          confirmVariant: 'destructive' as const,
        };
      case 'restart':
        return {
          title: 'Reiniciar Job',
          message: '¿Quieres reiniciar este job? Esta acción reseteará el job a estado pendiente sin importar su estado actual (pending, processing, completed, failed) para que pueda ser procesado nuevamente desde el principio.',
          icon: <RefreshCw className="h-5 w-5 text-blue-600" />,
          confirmText: 'Reiniciar',
          confirmVariant: 'default' as const,
        };
      default:
        return {
          title: 'Confirmar Acción',
          message: '¿Estás seguro de que quieres realizar esta acción?',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          confirmText: 'Confirmar',
          confirmVariant: 'default' as const,
        };
    }
  };

  const config = getActionConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm sm:max-w-md p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          {config.icon}
          <h3 className="text-base sm:text-lg font-semibold">{config.title}</h3>
        </div>
        
        <div className="mb-4 sm:mb-6">
          <p className="text-gray-600 mb-2 text-sm sm:text-base">{config.message}</p>
          <div className="bg-gray-50 p-2 sm:p-3 rounded text-xs sm:text-sm">
            <p><strong>Job ID:</strong> {jobId}</p>
            <p><strong>Tipo:</strong> {jobName}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            variant={config.confirmVariant}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? 'Procesando...' : config.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
} 
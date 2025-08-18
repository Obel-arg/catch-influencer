"use client"

import { formatDateTimeArgentina } from '@/utils/dateUtils';

interface LogsModalProps {
  workerName: string;
  logs: any[];
  onClose: () => void;
}

export function LogsModal({ workerName, logs, onClose }: LogsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-1 sm:p-0">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-full sm:max-w-4xl h-[98vh] sm:h-auto p-2 sm:p-6 relative flex flex-col max-h-[98vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header sticky en mobile */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between border-b border-gray-200 p-2 sm:p-0">
          <h2 className="text-base sm:text-xl font-bold truncate">Logs en Tiempo Real: {workerName}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl font-semibold p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-1 sm:p-0">
        {logs.length === 0 ? (
          <p className="text-gray-500 p-4">No hay logs disponibles.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`p-2 sm:p-3 rounded-lg border-l-4 ${
                  log.level === 'error' ? 'bg-red-50 border-red-400' :
                  log.level === 'success' ? 'bg-green-50 border-green-400' :
                  log.level === 'warn' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs sm:text-sm ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'success' ? 'bg-green-100 text-green-800' :
                        log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {formatDateTimeArgentina(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-medium">{log.message}</p>
                    {log.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                          Ver datos adicionales
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs sm:text-sm overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
} 
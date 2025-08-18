"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { formatDateTimeArgentina } from '@/utils/dateUtils';
import { JobActionConfirm } from './JobActionConfirm';

interface JobsModalProps {
  title: string;
  jobs: any[];
  onClose: () => void;
  type: 'completed' | 'failed';
  onDeleteJob?: (jobId: string) => Promise<void>;
  deletingJob?: string | null;
}

export function JobsModal({ 
  title, 
  jobs, 
  onClose, 
  type, 
  onDeleteJob,
  deletingJob 
}: JobsModalProps) {
  const isCompleted = type === 'completed';
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    jobId: string;
    jobName: string;
  }>({
    isOpen: false,
    jobId: '',
    jobName: ''
  });

  const handleDeleteJob = (jobId: string, jobName: string) => {
    setConfirmDelete({
      isOpen: true,
      jobId,
      jobName
    });
  };

  const handleConfirmDelete = async () => {
    if (onDeleteJob) {
      await onDeleteJob(confirmDelete.jobId);
    }
    setConfirmDelete({ ...confirmDelete, isOpen: false });
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ ...confirmDelete, isOpen: false });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-1 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-lg shadow-lg w-full max-w-full sm:max-w-6xl h-[98vh] sm:h-auto flex flex-col max-h-[98vh] sm:max-h-[90vh]">
        {/* Header sticky en mobile */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between border-b border-gray-200 p-2 sm:p-6 flex-shrink-0">
          <h2 className="text-base sm:text-xl font-bold truncate max-w-[80vw]">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl font-semibold p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-hidden p-1 sm:p-6">
          {jobs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-base sm:text-lg">
                {isCompleted ? 'No hay jobs completados.' : 'No hay jobs fallidos.'}
              </p>
            </div>
          ) : (
            <div className="h-[60vh] sm:h-[60vh] overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full text-[10px] sm:text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700 bg-gray-50">ID</th>
                      <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700 bg-gray-50">Tipo</th>
                      {!isCompleted && <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700 bg-gray-50">Intentos</th>}
                      <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700 bg-gray-50">Creado</th>
                      <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700 bg-gray-50">Procesado</th>
                      {isCompleted ? (
                        <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700 bg-gray-50">Completado</th>
                      ) : (
                        <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700 bg-gray-50">Error</th>
                      )}
                      <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700 bg-gray-50">Data</th>
                      {!isCompleted && onDeleteJob && (
                        <th className="px-2 sm:px-3 py-2 text-left font-semibold text-gray-700 bg-gray-50">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job, index) => (
                      <tr key={job.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-2 sm:px-3 py-2 font-mono text-[10px] sm:text-xs break-all max-w-[60px] sm:max-w-[120px]">{job.id}</td>
                        <td className="px-2 sm:px-3 py-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800">
                            {job.name}
                          </span>
                        </td>
                        {!isCompleted && (
                          <td className={`px-2 sm:px-3 py-2`}>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                              job.attemptsMade <= 1 ? 'bg-green-100 text-green-800' :
                              job.attemptsMade <= 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {job.attemptsMade}
                            </span>
                          </td>
                        )}
                        <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">
                          {formatDateTimeArgentina(job.timestamp)}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">
                          {job.processedOn ? formatDateTimeArgentina(job.processedOn) : '-'}
                        </td>
                        {isCompleted ? (
                          <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-green-600 font-medium whitespace-nowrap">
                            {job.finishedOn ? formatDateTimeArgentina(job.finishedOn) : '-'}
                          </td>
                        ) : (
                          <td className="px-2 sm:px-3 py-2">
                            <div className="max-w-[80px] sm:max-w-xs">
                              <p className="text-red-600 text-[10px] sm:text-xs bg-red-50 p-1 sm:p-2 rounded border border-red-200">
                                {job.failedReason}
                              </p>
                            </div>
                          </td>
                        )}
                        <td className="px-2 sm:px-3 py-2">
                          <div className="max-w-[80px] sm:max-w-xs max-h-12 sm:max-h-20 overflow-auto">
                            <pre className="whitespace-pre-wrap text-[10px] sm:text-xs text-gray-700 bg-gray-50 p-1 sm:p-2 rounded border">
                              {JSON.stringify(job.data, null, 2)}
                            </pre>
                          </div>
                        </td>
                        {!isCompleted && onDeleteJob && (
                          <td className="px-2 sm:px-3 py-2">
                            <Button
                              onClick={() => handleDeleteJob(job.id, job.name)}
                              variant="outline"
                              size="sm"
                              className="h-8 sm:h-6 px-3 sm:px-2 text-xs w-full sm:w-auto text-red-600 hover:text-red-700 border-red-300"
                              disabled={deletingJob === job.id}
                              title="Eliminar job fallido definitivamente"
                            >
                              <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
                            </Button>
                            {deletingJob === job.id && (
                              <div className="mt-1 text-xs text-blue-600 animate-pulse">Eliminando...</div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        {/* Footer sticky en mobile */}
        <div className="sticky bottom-0 z-10 bg-gray-50 flex items-center justify-between p-2 sm:p-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs sm:text-sm text-gray-600">
            Total: <span className="font-semibold">{jobs.length}</span> jobs
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-base sm:text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de confirmación para eliminar job fallido */}
      {!isCompleted && onDeleteJob && (
        <JobActionConfirm
          isOpen={confirmDelete.isOpen}
          jobId={confirmDelete.jobId}
          jobName={confirmDelete.jobName}
          action="remove"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isProcessing={deletingJob === confirmDelete.jobId}
        />
      )}
    </div>
  );
} 
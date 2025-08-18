"use client"

import { AlertTriangle } from 'lucide-react';
import { AdminHeader } from './components/AdminHeader';
import { WorkerCard } from './components/WorkerCard';
import { QueueModal } from './components/QueueModal';
import { JobsModal } from './components/JobsModal';
import { LogsModal } from './components/LogsModal';
import { DebugPanel } from './components/DebugPanel';
import { AlertsPanel } from './components/AlertsPanel';
import { AutoScalingPanel } from './components/AutoScalingPanel';
import { useAdminPanel } from './hooks/useAdminPanel';
import { useRealTimeMetrics } from '../../hooks/admin/useRealTimeMetrics';
import { useState } from 'react';

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('workers');
  
  const {
    // State
    workers,
    loading,
    refreshing,
    queue,
    queueStats,
    showQueueModal,
    lastUpdate,
    completedJobs,
    failedJobs,
    showCompletedModal,
    showFailedModal,
    showLogsModal,
    workerLogs,
    controllingWorker,
    controllingJob,
    controlMessage,
    nextAutoUpdate,
    autoUpdateEnabled,
    deletingJob,
    debugInfo,
    
    // Actions
    controlWorker,
    controlJob,
    refreshStatus,
    fetchQueue,
    fetchCompletedJobs,
    fetchFailedJobs,
    fetchWorkerLogs,
    fetchDebugInfo,
    toggleAutoUpdate,
    deleteFailedJob,
    
    // Modal controls
    setShowQueueModal,
    setShowCompletedModal,
    setShowFailedModal,
    setShowLogsModal,
  } = useAdminPanel();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-2 sm:mb-8">
          <AdminHeader
            lastUpdate={lastUpdate}
            nextAutoUpdate={nextAutoUpdate}
            controlMessage={controlMessage}
            autoUpdateEnabled={autoUpdateEnabled}
            refreshing={refreshing}
            onToggleAutoUpdate={toggleAutoUpdate}
            onRefresh={refreshStatus}
            onLogout={onLogout}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('workers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'workers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Workers
              </button>
              <button
                onClick={() => setActiveTab('auto-scaling')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'auto-scaling'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Auto-Scaling
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'workers' && (
          <>
            {/* Debug Panel */}
            <div className="mb-6">
              <DebugPanel debugInfo={debugInfo} />
            </div>

            {/* Workers Grid */}
            <div className="grid grid-cols-1 gap-2 sm:gap-6 lg:grid-cols-3">
              {workers.map((worker) => (
                <div key={worker.name} className="w-full">
                  <WorkerCard
                    worker={worker}
                    controllingWorker={controllingWorker}
                    onControlWorker={controlWorker}
                    onViewQueue={fetchQueue}
                    onViewCompleted={fetchCompletedJobs}
                    onViewFailed={fetchFailedJobs}
                    onViewLogs={fetchWorkerLogs}
                  />
                </div>
              ))}
            </div>

            {workers.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">No se encontraron workers</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'auto-scaling' && (
          <AutoScalingPanel />
        )}
      </div>

      {/* Modals */}
      {showQueueModal && (
        <QueueModal
          workerName={showQueueModal}
          queue={queue}
          queueStats={queueStats}
          onClose={() => setShowQueueModal(null)}
          onControlJob={controlJob}
          controllingJob={controllingJob}
        />
      )}

      {showCompletedModal && (
        <JobsModal
          title={`Jobs Completados: ${showCompletedModal}`}
          jobs={completedJobs}
          onClose={() => setShowCompletedModal(null)}
          type="completed"
        />
      )}

      {showFailedModal && (
        <JobsModal
          title={`Jobs Fallidos: ${showFailedModal}`}
          jobs={failedJobs}
          onClose={() => setShowFailedModal(null)}
          type="failed"
          onDeleteJob={deleteFailedJob}
          deletingJob={deletingJob}
        />
      )}

      {showLogsModal && (
        <LogsModal
          workerName={showLogsModal}
          logs={workerLogs}
          onClose={() => setShowLogsModal(null)}
        />
      )}
    </div>
  );
} 
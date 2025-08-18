import { useState, useEffect } from 'react';
import { getAdminApiBaseUrl } from '@/lib/services/adminApi';
import { JobControlApi } from '@/lib/services/jobControlApi';
import { 
  getCurrentDateArgentina,
  getFutureDateArgentina
} from '@/utils/dateUtils';
import { WorkerStatus } from '../types';
import { useJobControl } from '@/hooks/admin/useJobControl';

export function useAdminPanel() {
  const [workers, setWorkers] = useState<WorkerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [showQueueModal, setShowQueueModal] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [failedJobs, setFailedJobs] = useState<any[]>([]);
  const [showCompletedModal, setShowCompletedModal] = useState<string | null>(null);
  const [showFailedModal, setShowFailedModal] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState<string | null>(null);
  const [workerLogs, setWorkerLogs] = useState<any[]>([]);
  const [controllingWorker, setControllingWorker] = useState<string | null>(null);
  const [nextAutoUpdate, setNextAutoUpdate] = useState<Date | null>(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [deletingJob, setDeletingJob] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Hook para control de jobs
  const { controllingJob, controlMessage, controlJob, clearMessage } = useJobControl();

  const fetchWorkerStatus = async () => {
    try {
      const response = await fetch(`${getAdminApiBaseUrl()}/workers/status`);
      if (response.ok) {
        const data = await response.json();
        setWorkers(data.workers || []);
        setLastUpdate(getCurrentDateArgentina());
      }
    } catch (error) {
      console.error('Error fetching worker status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch(`${getAdminApiBaseUrl()}/workers/debug`);
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching debug info:', error);
    }
  };

  const controlWorker = async (workerName: string, action: 'start' | 'stop' | 'restart' | 'force-init') => {
    try {
      setControllingWorker(workerName);
      clearMessage();
      
      const response = await fetch(`${getAdminApiBaseUrl()}/workers/${workerName}/${action}`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Si es restart, actualizar el estado inmediatamente para mostrar "restarting"
        if (action === 'restart') {
          setWorkers(prev => prev.map(worker => 
            worker.name === workerName 
              ? { ...worker, status: 'restarting' as const }
              : worker
          ));
        }
        
        // Refresh status after action
        setTimeout(() => {
          fetchWorkerStatus();
          fetchDebugInfo();
          setControllingWorker(null);
        }, 2000);
      } else {
        setControllingWorker(null);
      }
    } catch (error) {
      console.error(`Error ${action}ing worker ${workerName}:`, error);
      setControllingWorker(null);
    }
  };

  const refreshStatus = () => {
    setRefreshing(true);
    fetchWorkerStatus();
    
    // Actualizar la próxima actualización automática después de una actualización manual
    const newNextUpdate = getFutureDateArgentina(6);
    setNextAutoUpdate(newNextUpdate);
  };

  const fetchQueue = async (workerName: string) => {
    try {
      const res = await fetch(`${getAdminApiBaseUrl()}/workers/${workerName}/queue`);
      const data = await res.json();
      setQueue(data.queue || []);
      setQueueStats(data.queueStats || null);
      setShowQueueModal(workerName);
    } catch (error) {
      console.error('Error fetching queue:', error);
      setQueue([]);
      setQueueStats(null);
      setShowQueueModal(workerName);
    }
  };

  const fetchCompletedJobs = async (workerName: string) => {
    try {
      const res = await fetch(`${getAdminApiBaseUrl()}/workers/${workerName}/completed`);
      const data = await res.json();
      setCompletedJobs(data.jobs);
      setShowCompletedModal(workerName);
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
      setCompletedJobs([]);
      setShowCompletedModal(workerName);
    }
  };

  const fetchFailedJobs = async (workerName: string) => {
    try {
      const res = await fetch(`${getAdminApiBaseUrl()}/workers/${workerName}/failed`);
      const data = await res.json();
      setFailedJobs(data.jobs);
      setShowFailedModal(workerName);
    } catch (error) {
      console.error('Error fetching failed jobs:', error);
      setFailedJobs([]);
      setShowFailedModal(workerName);
    }
  };

  const fetchWorkerLogs = async (workerName: string) => {
    try {
      const res = await fetch(`${getAdminApiBaseUrl()}/workers/${workerName}/logs?limit=50`);
      const data = await res.json();
      setWorkerLogs(data.logs || []);
      setShowLogsModal(workerName);
    } catch (error) {
      console.error('Error fetching worker logs:', error);
      setWorkerLogs([]);
      setShowLogsModal(workerName);
    }
  };

  // Wrapper para controlJob que incluye refresh de la cola
  const controlJobWithRefresh = async (workerName: string, jobId: string, action: 'pause' | 'resume' | 'remove' | 'retry' | 'promote' | 'force-terminate' | 'restart') => {
    await controlJob(workerName, jobId, action);
    
    // Refresh queue after action
    setTimeout(() => {
      fetchQueue(workerName);
    }, 1000);
  };

  // Función para eliminar job fallido
  const deleteFailedJob = async (jobId: string) => {
    try {
      setDeletingJob(jobId);
      clearMessage();
      
      const response = await JobControlApi.deleteFailedJob(jobId);
      
      if (response.success) {
        // Actualizar la lista de jobs fallidos removiendo el eliminado
        setFailedJobs(prev => prev.filter(job => job.id !== jobId));
        
        // Mostrar mensaje de éxito
        clearMessage(); // Limpiar mensajes anteriores
      } else {
        // El mensaje de error se maneja en el hook useJobControl
      }
    } catch (error) {
      console.error(`Error deleting failed job ${jobId}:`, error);
      // El mensaje de error se maneja en el hook useJobControl
    } finally {
      setDeletingJob(null);
    }
  };

  const toggleAutoUpdate = () => {
    setAutoUpdateEnabled(!autoUpdateEnabled);
  };

  useEffect(() => {
    fetchWorkerStatus();
    fetchDebugInfo();
    
    if (autoUpdateEnabled) {
      // Establecer la próxima actualización automática (6 horas)
      const nextUpdate = getFutureDateArgentina(6);
      setNextAutoUpdate(nextUpdate);
      
      const interval = setInterval(() => {
        fetchWorkerStatus();
        fetchDebugInfo();
        // Actualizar la próxima actualización automática
        const newNextUpdate = getFutureDateArgentina(6);
        setNextAutoUpdate(newNextUpdate);
      }, 21600000); // Refresh every 6 hours
      
      return () => clearInterval(interval);
    } else {
      setNextAutoUpdate(null);
    }
  }, [autoUpdateEnabled]);

  return {
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
    controlJob: controlJobWithRefresh,
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
  };
} 
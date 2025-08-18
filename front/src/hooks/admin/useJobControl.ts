import { useState } from 'react';
import { JobControlApi, JobControlResponse } from '@/lib/services/jobControlApi';
import { JobAction } from '@/components/adminWRK/types';

interface UseJobControlReturn {
  controllingJob: string | null;
  controlMessage: { type: 'success' | 'error', message: string } | null;
  controlJob: (workerName: string, jobId: string, action: JobAction) => Promise<void>;
  clearMessage: () => void;
}

export function useJobControl(): UseJobControlReturn {
  const [controllingJob, setControllingJob] = useState<string | null>(null);
  const [controlMessage, setControlMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const controlJob = async (workerName: string, jobId: string, action: JobAction) => {
    try {
      setControllingJob(jobId);
      setControlMessage(null);

      let response: JobControlResponse;

      // Manejar acciones especiales que no requieren workerName
      if (action === 'force-terminate') {
        response = await JobControlApi.forceTerminateJob(jobId);
      } else if (action === 'restart') {
        response = await JobControlApi.restartJob(jobId);
      } else {
        response = await JobControlApi.controlJob(workerName, jobId, action);
      }

      if (response.success) {
        setControlMessage({
          type: 'success',
          message: response.message
        });
      } else {
        setControlMessage({
          type: 'error',
          message: response.message || `Failed to ${action} job ${jobId}`
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing job ${jobId}:`, error);
      setControlMessage({
        type: 'error',
        message: error instanceof Error ? error.message : `Error ${action}ing job ${jobId}`
      });
    } finally {
      setControllingJob(null);
    }
  };

  const clearMessage = () => {
    setControlMessage(null);
  };

  return {
    controllingJob,
    controlMessage,
    controlJob,
    clearMessage
  };
} 
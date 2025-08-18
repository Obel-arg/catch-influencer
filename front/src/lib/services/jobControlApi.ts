import { getAdminApiBaseUrl } from './adminApi';
import { JobAction } from '@/components/adminWRK/types';

export interface JobControlResponse {
  success: boolean;
  message: string;
  jobId: string;
  workerName: string;
  action: JobAction;
  timestamp: string;
  error?: string;
}

export class JobControlApi {
  private static get baseUrl() {
    return getAdminApiBaseUrl();
  }

  /**
   * Controla un job individual en una cola específica
   * @param workerName - Nombre del worker
   * @param jobId - ID del job
   * @param action - Acción a realizar
   * @returns Promise con la respuesta del servidor
   */
  static async controlJob(
    workerName: string, 
    jobId: string, 
    action: JobAction
  ): Promise<JobControlResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/workers/${workerName}/jobs/${jobId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} job ${jobId}`);
      }

      return data;
    } catch (error) {
      console.error(`Error ${action}ing job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Pausa un job activo
   */
  static async pauseJob(workerName: string, jobId: string): Promise<JobControlResponse> {
    return this.controlJob(workerName, jobId, 'pause');
  }

  /**
   * Reanuda un job pausado
   */
  static async resumeJob(workerName: string, jobId: string): Promise<JobControlResponse> {
    return this.controlJob(workerName, jobId, 'resume');
  }

  /**
   * Elimina un job de la cola
   */
  static async removeJob(workerName: string, jobId: string): Promise<JobControlResponse> {
    return this.controlJob(workerName, jobId, 'remove');
  }

  /**
   * Reintenta un job fallido
   */
  static async retryJob(workerName: string, jobId: string): Promise<JobControlResponse> {
    return this.controlJob(workerName, jobId, 'retry');
  }

  /**
   * Promueve la prioridad de un job en espera
   */
  static async promoteJob(workerName: string, jobId: string): Promise<JobControlResponse> {
    return this.controlJob(workerName, jobId, 'promote');
  }
  /**
   * Fuerza la terminación de un job sin importar su estado
   */
  static async forceTerminateJob(jobId: string): Promise<JobControlResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/jobs/${jobId}/force-terminate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to force terminate job ${jobId}`);
      }

      return {
        ...data,
        jobId,
        workerName: 'unknown',
        action: 'force-terminate' as JobAction,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error force terminating job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Reinicia un job específico
   */
  static async restartJob(jobId: string): Promise<JobControlResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/jobs/${jobId}/restart`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to restart job ${jobId}`);
      }

      return {
        ...data,
        jobId,
        workerName: 'unknown',
        action: 'restart' as JobAction,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error restarting job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un job fallido definitivamente
   */
  static async deleteFailedJob(jobId: string): Promise<JobControlResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/jobs/${jobId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to delete failed job ${jobId}`);
      }

      return {
        ...data,
        jobId,
        workerName: 'unknown',
        action: 'remove' as JobAction,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error deleting failed job ${jobId}:`, error);
      throw error;
    }
  }
} 
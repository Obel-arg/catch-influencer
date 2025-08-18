import { Request, Response } from 'express';
import { postgresQueueService } from '../../services/queues/postgres-queue.service';

export class JobControlController {
  
  // Obtener job por ID
  private async getJob(workerName: string, jobId: string): Promise<any | null> {
    try {
      const job = await postgresQueueService.getJobStatus(jobId);
      return job;
    } catch (error) {
      console.error(`Error getting job ${jobId} from ${workerName}:`, error);
      return null;
    }
  }

  // Pausar job (PostgreSQL queues don't support pausing, so we'll cancel instead)
  async pauseJob(req: Request, res: Response) {
    try {
      const { workerName, jobId } = req.params;
      
      const job = await this.getJob(workerName, jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: `Job ${jobId} not found in worker ${workerName}`
        });
      }

      // Verificar el estado actual del job
      const jobState = job.status;
      
      // Si el job está siendo procesado, no se puede pausar directamente
      if (jobState === 'processing') {
        return res.status(400).json({
          success: false,
          message: `Cannot pause job ${jobId} because it is currently being processed. Wait for it to complete or remove it.`,
          jobState: 'processing',
          suggestion: 'Try removing the job instead, or wait for it to complete'
        });
      }

      // Si el job ya está completado o fallido, no se puede pausar
      if (jobState === 'completed' || jobState === 'failed') {
        return res.status(400).json({
          success: false,
          message: `Cannot pause job ${jobId} because it is already ${jobState}`,
          jobState
        });
      }

      // Si el job está pendiente, cancelarlo (equivalente a pausar en PostgreSQL)
      if (jobState === 'pending') {
        try {
          await postgresQueueService.cancelJob(jobId);
          
          res.json({
            success: true,
            message: `Job ${jobId} paused (cancelled) successfully`,
            jobId,
            workerName,
            action: 'pause',
            timestamp: new Date().toISOString()
          });
        } catch (cancelError) {
          console.error(`Error cancelling job ${jobId}:`, cancelError);
          return res.status(500).json({
            success: false,
            message: 'Error pausing job',
            error: cancelError instanceof Error ? cancelError.message : 'Unknown error'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `Cannot pause job ${jobId} in current state: ${jobState}`,
          jobState,
          validStates: ['pending']
        });
      }

    } catch (error) {
      console.error(`Error pausing job ${req.params.jobId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error pausing job',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Reanudar job (PostgreSQL queues don't support resuming cancelled jobs)
  async resumeJob(req: Request, res: Response) {
    try {
      const { workerName, jobId } = req.params;
      
      const job = await this.getJob(workerName, jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: `Job ${jobId} not found in worker ${workerName}`
        });
      }

      // Verificar que el job esté fallido (cancelled)
      const jobState = job.status;
      if (jobState !== 'failed') {
        return res.status(400).json({
          success: false,
          message: `Cannot resume job ${jobId}. Job is not cancelled (current state: ${jobState})`
        });
      }

      // Para PostgreSQL, recrear el job con los mismos datos
      try {
        const jobData = JSON.parse(job.data);
        await postgresQueueService.send(workerName, jobData);
        
        res.json({
          success: true,
          message: `Job ${jobId} resumed successfully (recreated)`,
          jobId,
          workerName,
          action: 'resume',
          timestamp: new Date().toISOString()
        });
      } catch (recreateError) {
        console.error(`Error recreating job ${jobId}:`, recreateError);
        return res.status(500).json({
          success: false,
          message: 'Error resuming job',
          error: recreateError instanceof Error ? recreateError.message : 'Unknown error'
        });
      }

    } catch (error) {
      console.error(`Error resuming job ${req.params.jobId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error resuming job',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Eliminar job
  async removeJob(req: Request, res: Response) {
    try {
      const { workerName, jobId } = req.params;
      
      const job = await this.getJob(workerName, jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: `Job ${jobId} not found in worker ${workerName}`
        });
      }

      // Obtener el estado actual del job
      const jobState = job.status;
      
      // Si el job está siendo procesado, no se puede eliminar directamente
      if (jobState === 'processing') {
        return res.status(400).json({
          success: false,
          message: `Cannot remove job ${jobId} because it is currently being processed. Try again later.`,
          jobState: 'processing'
        });
      }

      // Eliminar el job completamente de la base de datos
      try {
        await postgresQueueService.deleteJob(jobId);
      } catch (deleteError) {
        console.error(`Error deleting job ${jobId}:`, deleteError);
        return res.status(500).json({
          success: false,
          message: `Job ${jobId} could not be removed.`,
          error: deleteError instanceof Error ? deleteError.message : 'Unknown error'
        });
      }

      res.json({
        success: true,
        message: `Job ${jobId} removed successfully`,
        jobId,
        workerName,
        action: 'remove',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`Error removing job ${req.params.jobId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error removing job',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Reintentar job fallido
  async retryJob(req: Request, res: Response) {
    try {
      const { workerName, jobId } = req.params;
      
      const job = await this.getJob(workerName, jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: `Job ${jobId} not found in worker ${workerName}`
        });
      }

      // Verificar que el job esté fallido
      const jobState = job.status;
      if (jobState !== 'failed') {
        return res.status(400).json({
          success: false,
          message: `Cannot retry job ${jobId}. Job is not failed (current state: ${jobState})`
        });
      }

      // Recrear el job con los mismos datos (equivalente a retry en PostgreSQL)
      try {
        const jobData = JSON.parse(job.data);
        await postgresQueueService.send(workerName, jobData);
        
        res.json({
          success: true,
          message: `Job ${jobId} retried successfully`,
          jobId,
          workerName,
          action: 'retry',
          timestamp: new Date().toISOString()
        });
      } catch (recreateError) {
        console.error(`Error recreating job ${jobId}:`, recreateError);
        return res.status(500).json({
          success: false,
          message: 'Error retrying job',
          error: recreateError instanceof Error ? recreateError.message : 'Unknown error'
        });
      }

    } catch (error) {
      console.error(`Error retrying job ${req.params.jobId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error retrying job',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Promover prioridad de job (PostgreSQL queues don't support priority promotion)
  async promoteJob(req: Request, res: Response) {
    try {
      const { workerName, jobId } = req.params;
      
      const job = await this.getJob(workerName, jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: `Job ${jobId} not found in worker ${workerName}`
        });
      }

      // Verificar que el job esté pendiente
      const jobState = job.status;
      if (jobState !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot promote job ${jobId}. Job is not pending (current state: ${jobState})`
        });
      }

      // PostgreSQL queues don't support priority promotion, so we'll recreate the job
      try {
        const jobData = JSON.parse(job.data);
        await postgresQueueService.cancelJob(jobId);
        await postgresQueueService.send(workerName, jobData);
        
        res.json({
          success: true,
          message: `Job ${jobId} promoted successfully (recreated)`,
          jobId,
          workerName,
          action: 'promote',
          timestamp: new Date().toISOString()
        });
      } catch (promoteError) {
        console.error(`Error promoting job ${jobId}:`, promoteError);
        return res.status(500).json({
          success: false,
          message: 'Error promoting job',
          error: promoteError instanceof Error ? promoteError.message : 'Unknown error'
        });
      }

    } catch (error) {
      console.error(`Error promoting job ${req.params.jobId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error promoting job',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener información detallada de un job
  async getJobInfo(req: Request, res: Response) {
    try {
      const { workerName, jobId } = req.params;
      
      const job = await this.getJob(workerName, jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: `Job ${jobId} not found in worker ${workerName}`
        });
      }

      // Obtener información detallada del job
      const jobState = job.status;
      const jobData = JSON.parse(job.data);
      const jobAttempts = job.attempts;
      const jobTimestamp = job.created_at;
      const jobProcessedOn = job.started_at;
      const jobFinishedOn = job.completed_at;
      const jobFailedReason = job.error;

      // Verificar si el job está siendo procesado actualmente
      const isCurrentlyProcessing = jobState === 'processing';
      
      // Obtener información de la cola
      const queueStats = await postgresQueueService.getQueueStats(workerName);

      res.json({
        success: true,
        job: {
          id: jobId,
          name: job.name,
          state: jobState,
          isCurrentlyProcessing,
          data: jobData,
          attempts: jobAttempts,
          timestamp: jobTimestamp,
          processedOn: jobProcessedOn,
          finishedOn: jobFinishedOn,
          failedReason: jobFailedReason,
          canBePaused: jobState === 'pending',
          canBeRemoved: jobState !== 'processing' || !isCurrentlyProcessing,
          canBeResumed: jobState === 'failed',
          canBeRetried: jobState === 'failed'
        },
        queue: {
          name: workerName,
          pending: queueStats.pending,
          processing: queueStats.processing,
          completed: queueStats.completed,
          failed: queueStats.failed,
          total: queueStats.total
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`Error getting job info for ${req.params.jobId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error getting job information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Controlador general para todas las acciones
  async controlJob(req: Request, res: Response) {
    try {
      const { workerName, jobId, action } = req.params;
      
      switch (action) {
        case 'pause':
          return this.pauseJob(req, res);
        case 'resume':
          return this.resumeJob(req, res);
        case 'remove':
          return this.removeJob(req, res);
        case 'retry':
          return this.retryJob(req, res);
        case 'promote':
          return this.promoteJob(req, res);
        case 'info':
          return this.getJobInfo(req, res);
        default:
          return res.status(400).json({
            success: false,
            message: `Invalid action: ${action}. Valid actions are: pause, resume, remove, retry, promote, info`
          });
      }
    } catch (error) {
      console.error(`Error in controlJob:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 
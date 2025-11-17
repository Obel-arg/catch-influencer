import supabase from '../../config/supabase';

export interface QueueJob<T = any> {
  id: string;
  name: string;
  data: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  max_attempts: number;
  created_at: Date;
  updated_at: Date;
  started_at?: Date;
  completed_at?: Date;
  error?: string;
}

export interface QueueOptions {
  maxAttempts?: number;
  retryDelay?: number;
  priority?: number;
}

export class PostgresQueueService {
  private static instance: PostgresQueueService;
  private isConnected = true; // Always connected since we use Supabase
  private static lastErrorLog: Map<string, number> = new Map();
  private static ERROR_LOG_THROTTLE_MS = 60000; // Log errors max once per minute

  private constructor() {}

  /**
   * Throttled error logger to reduce spam
   */
  private logThrottledError(key: string, errorMsg: string, details?: any): void {
    const now = Date.now();
    const lastLog = PostgresQueueService.lastErrorLog.get(key) || 0;

    if (now - lastLog > PostgresQueueService.ERROR_LOG_THROTTLE_MS) {
      console.error(errorMsg, details || '');
      PostgresQueueService.lastErrorLog.set(key, now);
    }
  }

  public static getInstance(): PostgresQueueService {
    if (!PostgresQueueService.instance) {
      PostgresQueueService.instance = new PostgresQueueService();
    }
    return PostgresQueueService.instance;
  }

  /**
   * Send a job to a queue
   */
  async send<T>(queueName: string, data: T, options: QueueOptions = {}): Promise<string> {
    try {
      // Validar datos antes de enviar
      if (!data || typeof data !== 'object') {
        throw new Error(`Invalid job data: data must be an object, got ${typeof data}`);
      }

      // Validar campos requeridos según el tipo de queue
      if (queueName === 'metrics' || queueName === 'comment-fetch') {
        const requiredFields = ['postId', 'postUrl', 'platform'];
        for (const field of requiredFields) {
          if (!(field in data)) {
            throw new Error(`Missing required field '${field}' for ${queueName} job`);
          }
        }
      }

      const jobId = crypto.randomUUID();
      
      const { error } = await supabase
        .from('queue_jobs')
        .insert({
          id: jobId,
          name: queueName,
          data: JSON.stringify(data),
          status: 'pending',
          attempts: 0,
          max_attempts: options.maxAttempts || 3,
          created_at: new Date(),
          updated_at: new Date()
        });

      if (error) {
        console.error(`❌ [POSTGRES-QUEUE] Error sending job to ${queueName}:`, error);
        throw error;
      }


      return jobId;
    } catch (error) {
      console.error(`❌ [POSTGRES-QUEUE] Failed to send job to ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Process jobs from a queue
   */
  async process<T>(
    queueName: string,
    handler: (job: { id: string; data: T }) => Promise<void>,
    options: { concurrency?: number } = {}
  ): Promise<void> {
    const concurrency = options.concurrency || 1;
    let isProcessing = true;
    let loopCount = 0;

    console.log(`🟢 [POSTGRES-QUEUE] Starting processor for queue: ${queueName}`);

    // Process jobs in a loop
    while (isProcessing) {
      try {
        loopCount++;

        // Log every 10 loops to show we're alive
        if (loopCount % 10 === 0) {
          console.log(`🟢 [POSTGRES-QUEUE] ${queueName} - Loop ${loopCount}, checking for jobs...`);
        }

        // Get next job
        const job = await this.getNextJob(queueName);

        if (!job) {
          // No jobs available, wait a bit
          if (loopCount % 10 === 0) {
            console.log(`🟡 [POSTGRES-QUEUE] ${queueName} - No jobs found, waiting...`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        console.log(`🟢 [POSTGRES-QUEUE] ${queueName} - Found job ${job.id}, processing...`);

        // Process the job
        await this.processJob(job, handler);

        console.log(`✅ [POSTGRES-QUEUE] ${queueName} - Job ${job.id} completed successfully`);

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ [POSTGRES-QUEUE] Error processing jobs from ${queueName}:`, error);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer on error
      }
    }
  }

  /**
   * Get next job from queue with atomic transaction to prevent race conditions
   */
  public async getNextJob(queueName: string): Promise<QueueJob | null> {
    try {
      // Temporalmente usar claimNextJob hasta que se ejecute el SQL
      return await this.claimNextJob(queueName);
      
      // TODO: Descomentar cuando se ejecute el SQL
      // const { data, error } = await supabase
      //   .rpc('get_next_job_atomic', {
      //     queue_name: queueName
      //   });

      // if (error) {
      //   if (error.code === 'PGRST116' || error.message?.includes('No jobs available')) {
      //     return null;
      //   }
      //   console.error('❌ [POSTGRES-QUEUE] Error getting next job:', error);
      //   throw error;
      // }

      // return data;
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to get next job:', error);
      return null;
    }
  }

  /**
   * Alternative method using direct SQL for atomic job claiming
   */
  public async claimNextJob(queueName: string): Promise<QueueJob | null> {
    try {
      // Verificar conectividad antes de intentar la operación
      if (!this.isQueueConnected()) {
        console.error('❌ [POSTGRES-QUEUE] No connected to database');
        return null;
      }

      // FIRST: Find a pending job
      const { data: pendingJobs, error: selectError } = await supabase
        .from('queue_jobs')
        .select('*')
        .eq('name', queueName)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1);

      if (selectError) {
        console.error(`❌ [POSTGRES-QUEUE] Error selecting job for ${queueName}:`, selectError);
        return null;
      }

      if (!pendingJobs || pendingJobs.length === 0) {
        // No pending jobs - this is normal
        return null;
      }

      const jobToClaim = pendingJobs[0];
      console.log(`🔵 [POSTGRES-QUEUE] Found pending job ${jobToClaim.id} for ${queueName}, attempting to claim...`);

      // SECOND: Try to claim it atomically
      const { data: claimedJob, error: updateError } = await supabase
        .from('queue_jobs')
        .update({
          status: 'processing',
          started_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', jobToClaim.id)
        .eq('status', 'pending') // Double-check it's still pending
        .select()
        .single();

      if (updateError) {
        if (updateError.code === 'PGRST116') {
          // Someone else claimed it - this is normal in concurrent processing
          console.log(`🟡 [POSTGRES-QUEUE] Job ${jobToClaim.id} was claimed by another worker`);
          return null;
        }

        console.error(`❌ [POSTGRES-QUEUE] Error claiming job ${jobToClaim.id}:`, updateError);
        return null;
      }

      if (!claimedJob) {
        console.log(`🟡 [POSTGRES-QUEUE] Job ${jobToClaim.id} could not be claimed (already taken)`);
        return null;
      }

      console.log(`✅ [POSTGRES-QUEUE] Successfully claimed job ${claimedJob.id} for ${queueName}`);
      return claimedJob;
    } catch (error) {
      // Manejar errores de red y conectividad
      if (error instanceof Error) {
        if (error.message.includes('fetch failed') || error.message.includes('network')) {
          this.logThrottledError(
            'network-error',
            '❌ [POSTGRES-QUEUE] Network error when claiming job. Check internet connection and Supabase configuration.',
            error.message
          );
          return null;
        }
      }
      
      console.error('❌ [POSTGRES-QUEUE] Failed to claim next job:', error);
      return null;
    }
  }

  /**
   * Process a single job
   */
  private async processJob<T>(
    job: QueueJob, 
    handler: (job: { id: string; data: T }) => Promise<void>
  ): Promise<void> {
    
    try {
      // Mark job as processing
      await this.updateJobStatus(job.id, 'processing', { started_at: new Date() });

      // Parse job data - handle both string and object cases
      let jobData: any;
      if (typeof job.data === 'string') {
        try {
          jobData = JSON.parse(job.data);
        } catch (parseError) {
          console.error(`❌ [POSTGRES-QUEUE] Failed to parse job data for job ${job.id}:`, parseError);
          throw new Error(`Invalid JSON in job data: ${parseError}`);
        }
      } else if (typeof job.data === 'object') {
        jobData = job.data;
      } else {
        throw new Error(`Invalid job data type: ${typeof job.data}`);
      }

      // Execute handler
      await handler({ id: job.id, data: jobData });

      // Mark job as completed
      await this.updateJobStatus(job.id, 'completed', { 
        completed_at: new Date(),
        attempts: job.attempts + 1
      });



    } catch (error) {
      console.error(`❌ [POSTGRES-QUEUE] Job ${job.id} failed:`, error);
      
      // Mark job as failed
      await this.updateJobStatus(job.id, 'failed', {
        attempts: job.attempts + 1,
        error: error instanceof Error ? error.message : String(error)
      });
      
      console.error(`❌ [POSTGRES-QUEUE] Job ${job.id} marked as failed`);
    }
  }

  /**
   * Update job status
   */
  private async updateJobStatus(
    jobId: string, 
    status: QueueJob['status'], 
    updates: Partial<QueueJob> = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('queue_jobs')
        .update({
          status,
          updated_at: new Date(),
          ...updates
        })
        .eq('id', jobId);

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error updating job status:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to update job status:', error);
      throw error;
    }
  }

  /**
   * Mark job as completed (public method for external use)
   */
  public async markJobCompleted(jobId: string): Promise<void> {
    await this.updateJobStatus(jobId, 'completed', { 
      completed_at: new Date()
    });
  }

  /**
   * Mark job as failed (public method for external use)
   */
  public async markJobFailed(jobId: string, error?: string): Promise<void> {
    await this.updateJobStatus(jobId, 'failed', {
      error: error || 'Unknown error'
    });
  }

  /**
   * Mark job as processing (public method for external use)
   */
  public async markJobProcessing(jobId: string): Promise<void> {
    await this.updateJobStatus(jobId, 'processing', { 
      started_at: new Date() 
    });
  }

  /**
   * Retry failed jobs automatically
   */
  public async retryFailedJobs(queueName?: string): Promise<number> {
    try {
      // Primero contar cuántos jobs necesitan retry
      let countQuery = supabase
        .from('queue_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
        .lt('attempts', 3); // max_attempts hardcoded for now

      if (queueName) {
        countQuery = countQuery.eq('name', queueName);
      }

      const { count: totalCount, error: countError } = await countQuery;

      if (countError) {
        console.error('❌ [POSTGRES-QUEUE] Error counting failed jobs:', countError);
        return 0;
      }

      if (!totalCount || totalCount === 0) {
        return 0;
      }

      // Luego actualizar los jobs
      let updateQuery = supabase
        .from('queue_jobs')
        .update({
          status: 'pending',
          updated_at: new Date(),
          error: null
        })
        .eq('status', 'failed')
        .lt('attempts', 3);

      if (queueName) {
        updateQuery = updateQuery.eq('name', queueName);
      }

      const { error: updateError } = await updateQuery;

      if (updateError) {
        console.error('❌ [POSTGRES-QUEUE] Error retrying failed jobs:', updateError);
        throw updateError;
      }

      return totalCount;
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to retry jobs:', error);
      return 0;
    }
  }

  /**
   * Get jobs that need retry (failed but haven't exceeded max attempts)
   */
  public async getJobsNeedingRetry(queueName?: string): Promise<QueueJob[]> {
    try {
      let query = supabase
        .from('queue_jobs')
        .select('*')
        .eq('status', 'failed')
        .lt('attempts', 3) // max_attempts hardcoded for now
        .order('updated_at', { ascending: true });

      if (queueName) {
        query = query.eq('name', queueName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error getting jobs needing retry:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to get jobs needing retry:', error);
      return [];
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<QueueJob | null> {
    try {
      const { data, error } = await supabase
        .from('queue_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null;
        }
        console.error('❌ [POSTGRES-QUEUE] Error getting job status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to get job status:', error);
      return null;
    }
  }

  /**
   * Get completed jobs
   */
  async getCompletedJobs(queueName: string, limit: number = 50): Promise<QueueJob[]> {
    try {
      const { data, error } = await supabase
        .from('queue_jobs')
        .select('*')
        .eq('name', queueName)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error getting completed jobs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to get completed jobs:', error);
      throw error;
    }
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(queueName: string, limit: number = 50): Promise<QueueJob[]> {
    try {
      const { data, error } = await supabase
        .from('queue_jobs')
        .select('*')
        .eq('name', queueName)
        .eq('status', 'failed')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error getting failed jobs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to get failed jobs:', error);
      throw error;
    }
  }

  /**
   * Get active jobs (pending + processing)
   */
  async getActiveJobs(queueName: string): Promise<QueueJob[]> {
    try {
      const { data, error } = await supabase
        .from('queue_jobs')
        .select('*')
        .eq('name', queueName)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error getting active jobs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to get active jobs:', error);
      throw error;
    }
  }

  /**
   * Cancel a job (mark as failed)
   */
  async cancelJob(jobId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('queue_jobs')
        .update({
          status: 'failed',
          updated_at: new Date(),
          error: 'Job cancelled'
        })
        .eq('id', jobId);

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error cancelling job:', error);
        throw error;
      }

    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to cancel job:', error);
      throw error;
    }
  }

  /**
   * Delete a job completely from the database
   */
  async deleteJob(jobId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('queue_jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error deleting job:', error);
        throw error;
      }

    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to delete job:', error);
      throw error;
    }
  }

  /**
   * Force terminate a job regardless of its current state
   */
  async forceTerminateJob(jobId: string): Promise<{ previousState: string; action: string }> {
    try {
      
      // Primero obtener el estado actual del job
      const currentJob = await this.getJobStatus(jobId);
      const previousState = currentJob?.status || 'unknown';
      
      let action = '';
      
      if (previousState === 'processing') {
        // Si está siendo procesado, marcarlo como fallido con razón de terminación forzada
        await this.updateJobStatus(jobId, 'failed', {
          attempts: (currentJob?.attempts || 0) + 1,
          error: 'Job terminated forcefully by admin',
          completed_at: new Date()
        });
        action = 'marked_as_failed';
      } else if (previousState === 'pending') {
        // Si está pendiente, marcarlo como fallido
        await this.updateJobStatus(jobId, 'failed', {
          error: 'Job terminated forcefully by admin before processing',
          completed_at: new Date()
        });
        action = 'marked_as_failed';
      } else if (previousState === 'completed') {
        // Si ya está completado, eliminarlo
        await this.deleteJob(jobId);
        action = 'deleted';
      } else if (previousState === 'failed') {
        // Si ya está fallido, eliminarlo
        await this.deleteJob(jobId);
        action = 'deleted';
      } else {
        // Estado desconocido, intentar eliminar
        await this.deleteJob(jobId);
        action = 'deleted';
      }
      
      return { previousState, action };
      
    } catch (error) {
      console.error(`❌ [POSTGRES-QUEUE] Error forzando terminación del job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Restart a job by resetting it to pending state
   * This will allow the job to be processed again from the beginning
   */
  async restartJob(jobId: string): Promise<{ previousState: string; action: string }> {
    try {
      // Primero obtener el estado actual del job
      const currentJob = await this.getJobStatus(jobId);
      if (!currentJob) {
        throw new Error(`Job ${jobId} not found`);
      }

      const previousState = currentJob.status;
      let action = '';

      // Permitir reiniciar jobs en cualquier estado
      if (previousState === 'pending' || previousState === 'processing') {
        // Resetear el job a estado pending para que pueda ser procesado nuevamente
        await this.updateJobStatus(jobId, 'pending', {
          attempts: 0, // Resetear intentos
          error: undefined, // Limpiar error anterior
          started_at: undefined, // Limpiar tiempo de inicio
          completed_at: undefined, // Limpiar tiempo de completado
          updated_at: new Date()
        });
        action = 'restarted_to_pending';
      } else if (previousState === 'failed') {
        // Si está fallido, resetearlo a pending
        await this.updateJobStatus(jobId, 'pending', {
          attempts: 0, // Resetear intentos
          error: undefined, // Limpiar error anterior
          started_at: undefined, // Limpiar tiempo de inicio
          completed_at: undefined, // Limpiar tiempo de completado
          updated_at: new Date()
        });
        action = 'restarted_from_failed';
      } else if (previousState === 'completed') {
        // Si está completado, resetearlo a pending (en lugar de recrearlo)
        await this.updateJobStatus(jobId, 'pending', {
          attempts: 0, // Resetear intentos
          error: undefined, // Limpiar error anterior
          started_at: undefined, // Limpiar tiempo de inicio
          completed_at: undefined, // Limpiar tiempo de completado
          updated_at: new Date()
        });
        action = 'restarted_from_completed';
      } else {
        // Para cualquier otro estado, intentar resetear a pending
        await this.updateJobStatus(jobId, 'pending', {
          attempts: 0, // Resetear intentos
          error: undefined, // Limpiar error anterior
          started_at: undefined, // Limpiar tiempo de inicio
          completed_at: undefined, // Limpiar tiempo de completado
          updated_at: new Date()
        });
        action = `restarted_from_${previousState}`;
      }
      
      return { previousState, action };
      
    } catch (error) {
      console.error(`❌ [POSTGRES-QUEUE] Error reiniciando job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName?: string): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    try {
      let query = supabase.from('queue_jobs').select('status');
      
      if (queueName) {
        query = query.eq('name', queueName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error getting queue stats:', error);
        throw error;
      }

      const stats = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: 0
      };

      data?.forEach(job => {
        const status = job.status as keyof typeof stats;
        if (status in stats) {
          stats[status]++;
        }
        stats.total++;
      });

      return stats;
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to get queue stats:', error);
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: 0
      };
    }
  }

  /**
   * Clear a queue
   */
  async clearQueue(queueName: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('queue_jobs')
        .delete()
        .eq('name', queueName)
        .select('id');

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error clearing queue:', error);
        throw error;
      }

      const deletedCount = data?.length || 0;
      return deletedCount;
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to clear queue:', error);
      throw error;
    }
  }

  /**
   * Get all queues
   */
  async getQueues(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('queue_jobs')
        .select('name')
        .order('name');

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error getting queues:', error);
        throw error;
      }

      const queues = [...new Set(data?.map(job => job.name) || [])];
      return queues;
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to get queues:', error);
      return [];
    }
  }

  /**
   * Check if the service is connected
   */
  isQueueConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Clean up stuck jobs that have been in processing state for too long
   */
  public async cleanupStuckJobs(queueName?: string, maxProcessingTimeMinutes: number = 10): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - maxProcessingTimeMinutes * 60 * 1000);
      
      let query = supabase
        .from('queue_jobs')
        .update({
          status: 'failed',
          updated_at: new Date(),
          error: `Job stuck in processing for more than ${maxProcessingTimeMinutes} minutes`
        })
        .eq('status', 'processing')
        .lt('started_at', cutoffTime.toISOString());

      if (queueName) {
        query = query.eq('name', queueName);
      }

      const { error } = await query;

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error cleaning up stuck jobs:', error);
        throw error;
      }

      // Count affected rows by checking before and after
      const beforeCount = await this.getStuckJobs(queueName, maxProcessingTimeMinutes);
      const cleanedCount = beforeCount.length;


      return cleanedCount;
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to cleanup stuck jobs:', error);
      return 0;
    }
  }

  /**
   * Get stuck jobs that have been in processing state for too long
   */
  public async getStuckJobs(queueName?: string, maxProcessingTimeMinutes: number = 10): Promise<QueueJob[]> {
    try {
      const cutoffTime = new Date(Date.now() - maxProcessingTimeMinutes * 60 * 1000);
      
      let query = supabase
        .from('queue_jobs')
        .select('*')
        .eq('status', 'processing')
        .lt('started_at', cutoffTime.toISOString())
        .order('started_at', { ascending: true });

      if (queueName) {
        query = query.eq('name', queueName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [POSTGRES-QUEUE] Error getting stuck jobs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ [POSTGRES-QUEUE] Failed to get stuck jobs:', error);
      return [];
    }
  }
}

// Export singleton instance
export const postgresQueueService = PostgresQueueService.getInstance(); 
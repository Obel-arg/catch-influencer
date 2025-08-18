import { postgresQueueService } from './postgres-queue.service';

/**
 * Función de utilidad para crear una nueva cola con la configuración por defecto.
 * @param name - El nombre de la cola.
 */
export function createQueue<T>(name: string): any {
  // Return a wrapper that mimics the BullMQ Queue interface
  return {
    name,
    async add(data: T, options: any = {}) {
      return await postgresQueueService.send(name, data, options);
    },
    async process(handler: (job: any) => Promise<void>, options: any = {}) {
      return await postgresQueueService.process(name, handler, options);
    },
    async getJob(jobId: string) {
      return await postgresQueueService.getJobStatus(jobId);
    },
    async remove(jobId: string) {
      return await postgresQueueService.deleteJob(jobId);
    },
    async clean(grace: number, status: string) {
      // This would need to be implemented in the PostgreSQL service
      console.warn('Queue clean method not implemented in PostgreSQL queue service');
    }
  };
} 
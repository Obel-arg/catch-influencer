// Placeholder para pg-boss-queue.service.ts
// Este archivo parece ser requerido por pg-boss-metrics.worker.ts

export const pgBossQueueService = {
  // Métodos básicos para evitar errores
  initialize: async () => {
    return true;
  },

  processQueue: async (queueName: string, processor: Function) => {
    return true;
  },

  sendJob: async (queueName: string, data: any, options: any) => {
    return `job-${Date.now()}`;
  },

  getQueueStats: async (queueName: string) => {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    };
  },

  stop: async () => {
    return true;
  },

  getMetrics: async () => {
    return {
      jobs: 0,
      completed: 0,
      failed: 0,
      delayed: 0
    };
  }
}; 
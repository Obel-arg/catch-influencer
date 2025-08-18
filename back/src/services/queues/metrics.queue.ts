import { createQueue } from './base.queue';

// --- Interfaz de Datos para el Trabajo ---
export interface IMetricsJob {
  postId: string; // ID interno del post
  postUrl: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  campaignId: string;
}

// --- Creación de la Cola ---
export const metricsQueue = createQueue<IMetricsJob>('metrics-extraction');

// --- Función para Añadir Trabajos ---
export const addMetricsJob = async (data: IMetricsJob) => {
  await metricsQueue.add('extract-metrics', data, { jobId: data.postId });
}; 
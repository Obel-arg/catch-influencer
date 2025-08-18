import { createQueue } from './base.queue';

// --- Interfaz de Datos para el Trabajo ---
export interface ICommentFetchJob {
  postId: string;
  postUrl: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
}

// --- Creación de la Cola ---
export const commentFetchQueue = createQueue<ICommentFetchJob>('comment-fetching');

// --- Función para Añadir Trabajos ---
export const addCommentFetchJob = async (data: ICommentFetchJob) => {
  await commentFetchQueue.add('fetch-comments', data, { jobId: data.postId });
}; 
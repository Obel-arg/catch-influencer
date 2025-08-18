import { createQueue } from './base.queue';

// --- Interfaz de un Comentario Individual ---
interface IComment {
  id: string;
  text: string;
}

// --- Interfaz de Datos para el Trabajo ---
// Este trabajo procesará un lote de comentarios, no un post entero.
export interface ISentimentJob {
  postId: string;
  comments: IComment[];
  isLastBatch: boolean; // Para saber si es el último lote de un post
}

// --- Creación de la Cola ---
export const sentimentQueue = createQueue<ISentimentJob>('sentiment-analysis');

// --- Función para Añadir Trabajos ---
export const addSentimentJob = async (data: ISentimentJob) => {
  // El jobId aquí puede ser más complejo para ser único por lote
  const jobId = `${data.postId}-${data.comments[0]?.id || 'batch'}`;
  await sentimentQueue.add('analyze-sentiment-batch', data, { jobId });
}; 
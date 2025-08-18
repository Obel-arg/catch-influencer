import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración para la API de YouTube.
 * Lee la clave de API desde las variables de entorno.
 */
export const youtubeConfig = {
  apiKey: process.env.YOUTUBE_API_KEY || '',
  baseUrl: 'https://www.googleapis.com/youtube/v3',
  maxComments: 15000 // Límite de comentarios a extraer (aumentado a 15,000)
};

export const sentimentConfig = {
  huggingFaceApiUrl: 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
  huggingFaceApiKey: process.env.HUGGINGFACE_API_KEY || '', // Se puede usar sin API key con límites
  batchSize: 100 // Procesar comentarios en lotes más grandes (aumentado a 100 para manejar 15K)
}; 
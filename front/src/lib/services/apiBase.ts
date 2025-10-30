/**
 * Obtiene la URL base de la API según el entorno
 * - En desarrollo SIEMPRE usa: http://localhost:5001/api
 * - En producción: https://catch-influencer-back.vercel.app/api
 * - Si existe NEXT_PUBLIC_API_URL y NO es desarrollo, la usa
 */
export const getApiBaseUrl = () => {
  // Detectar entorno basándose en NODE_ENV o window.location
  const isDevelopment = 
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));
  
  // En desarrollo SIEMPRE usar puerto 5001
  if (isDevelopment) {
    const url = 'http://localhost:5001/api';
    console.log('🔍 [API] Development mode - Using:', url);
    return url;
  }
  
  // En producción, usar variable de entorno si existe, sino usar la URL de producción
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('🔍 [API] Using NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  const url = 'https://catch-influencer-back.vercel.app/api';
  console.log('🔍 [API] Production mode - Using:', url);
  return url;
}; 
/**
 * Obtiene la URL base de la API
 */
export const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
}; 
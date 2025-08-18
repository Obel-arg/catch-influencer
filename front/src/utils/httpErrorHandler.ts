import axios from 'axios';

/**
 * Maneja errores HTTP ignorando las cancelaciones de requests duplicados
 * @param error - El error capturado en el catch
 * @param fallbackMessage - Mensaje de error por defecto si no es una cancelación
 * @returns true si el error fue ignorado (cancelación), false si es un error real
 */
export const handleHttpError = (error: any, fallbackMessage: string = 'Error en la petición'): boolean => {
  // Ignorar errores de cancelación (requests duplicados o cache)
  if (axios.isCancel(error)) {
    const message = error.message || '';
    if (message.includes('cache') || message.includes('reused') || message.includes('deduplication')) {
    } else {
    }
    return true; // Error ignorado
  }
  
  // Es un error real, loggearlo
  console.error('HTTP Error:', error);
  return false; // Error real que debe manejarse
};

/**
 * Wrapper para ejecutar peticiones HTTP con manejo automático de errores de cancelación
 * @param requestFn - Función que ejecuta la petición HTTP
 * @param fallbackMessage - Mensaje de error por defecto
 * @returns Resultado de la petición o null si fue cancelada
 */
export const executeHttpRequest = async <T>(
  requestFn: () => Promise<T>,
  fallbackMessage: string = 'Error en la petición'
): Promise<T | null> => {
  try {
    return await requestFn();
  } catch (error) {
    if (handleHttpError(error, fallbackMessage)) {
      return null; // Request cancelado
    }
    throw error; // Re-lanzar error real
  }
};

/**
 * Maneja errores en hooks con estado
 * @param error - El error capturado
 * @param setError - Función para establecer el error en el estado
 * @param fallbackMessage - Mensaje de error por defecto
 * @returns true si el error fue ignorado (cancelación), false si es un error real
 */
export const handleHookError = (
  error: any,
  setError: (error: string | null) => void,
  fallbackMessage: string = 'Error en la petición'
): boolean => {
  // Ignorar errores de cancelación (requests duplicados o cache)
  if (axios.isCancel(error)) {
    const message = error.message || '';
    if (message.includes('cache') || message.includes('reused') || message.includes('deduplication')) {
    } else {
    }
    return true; // Error ignorado
  }
  
  // Es un error real, establecer el error en el estado
  const message = error instanceof Error ? error.message : fallbackMessage;
  setError(message);
  console.error('HTTP Error:', error);
  return false; // Error real que fue manejado
}; 

/**
 * Sanitiza cualquier error para mostrar solo mensajes amigables al usuario.
 * Nunca devuelve mensajes técnicos ni del backend sin filtrar.
 * @param error - El error capturado
 * @param fallbackMessage - Mensaje genérico para el usuario
 * @returns string seguro para mostrar en la UI
 */
export function getUserFriendlyError(error: any, fallbackMessage: string = 'Ocurrió un error inesperado. Intenta de nuevo.') {
  // Si es un error de red
  if (error?.message?.includes('Network Error')) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }
  // Si es un error de permisos
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }
  // Si es un error de validación controlado
  if (typeof error?.response?.data?.message === 'string' && error?.response?.data?.message.length < 100) {
    // Solo mostrar mensajes cortos y controlados
    return error.response.data.message;
  }
  // Si es un error de timeout
  if (error?.code === 'ECONNABORTED' || error?.message?.toLowerCase().includes('timeout')) {
    return 'La solicitud tardó demasiado. Intenta de nuevo.';
  }
  // Fallback genérico
  return fallbackMessage;
} 
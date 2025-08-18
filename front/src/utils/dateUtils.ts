// Utilidades para manejar fechas en hora de Argentina (Buenos Aires)
export const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Formatea una fecha en hora de Argentina
 * @param date - Fecha a formatear
 * @param options - Opciones de formato
 * @returns Fecha formateada en hora de Argentina
 */
export function formatDateArgentina(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  return dateObj.toLocaleString('es-AR', {
    timeZone: ARGENTINA_TIMEZONE,
    ...options
  });
}

/**
 * Formatea solo la fecha en hora de Argentina
 * @param date - Fecha a formatear
 * @returns Fecha formateada en hora de Argentina
 */
export function formatDateOnlyArgentina(date: Date | string | number): string {
  return formatDateArgentina(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Formatea solo la hora en hora de Argentina
 * @param date - Fecha a formatear
 * @returns Hora formateada en hora de Argentina
 */
export function formatTimeOnlyArgentina(date: Date | string | number): string {
  return formatDateArgentina(date, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Formatea fecha y hora completa en hora de Argentina
 * @param date - Fecha a formatear
 * @returns Fecha y hora completa formateada en hora de Argentina
 */
export function formatDateTimeArgentina(date: Date | string | number): string {
  return formatDateArgentina(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Obtiene la fecha actual en hora de Argentina
 * @returns Fecha actual en hora de Argentina
 */
export function getCurrentDateArgentina(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: ARGENTINA_TIMEZONE }));
}

/**
 * Calcula una fecha futura en hora de Argentina
 * @param hours - Horas a agregar
 * @returns Fecha futura en hora de Argentina
 */
export function getFutureDateArgentina(hours: number): Date {
  const now = getCurrentDateArgentina();
  return new Date(now.getTime() + (hours * 60 * 60 * 1000));
} 
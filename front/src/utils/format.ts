/**
 * Formatea números grandes con sufijos (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num === 0) return '0';
  if (num < 1000) return num.toString();
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const tier = Math.log10(Math.abs(num)) / 3 | 0;
  
  if (tier === 0) return num.toString();
  
  const suffix = suffixes[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;
  
  return scaled.toFixed(scaled < 10 ? 1 : 0) + suffix;
}

/**
 * 🎯 FUNCIÓN PARA LIMPIAR NÚMEROS CON DEMASIADOS DECIMALES test 
 */
export function formatCleanNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'Sin datos';
  
  // Si es un número entero, mostrarlo como entero
  if (Number.isInteger(value)) {
    return value.toLocaleString('es-ES');
  }
  
  // Si tiene decimales, limitar a máximo 2 decimales
  const rounded = Math.round(value * 100) / 100;
  
  // Si después de redondear es un entero, mostrarlo sin decimales
  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString('es-ES');
  }
  
  // Si tiene decimales, mostrar máximo 2
  return rounded.toFixed(2).replace(/\.?0+$/, ''); // Eliminar ceros innecesarios al final
}

/**
 * Formatea porcentajes
 */
export function formatPercentage(num: number, decimals: number = 2): string {
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Formatea fechas de forma relativa
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Hoy';
  if (diffInDays === 1) return 'Ayer';
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
  
  return `Hace ${Math.floor(diffInDays / 365)} años`;
}

/**
 * Formatea dinero
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
} 
"use client";

interface NumberDisplayProps {
  value: number;
  className?: string;
  format?: 'short' | 'long';
}

/**
 * Componente que evita problemas de hidratación con números
 * al renderizar de forma consistente en servidor y cliente
 */
export function NumberDisplay({ value, className = '', format = 'short' }: NumberDisplayProps) {
  const formatNumber = (num: number) => {
    if (format === 'short') {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return String(num);
    }
    
    // Para formato largo o números pequeños, usar configuración regional consistente
    // Usar suppressHydrationWarning para permitir diferencias menores en formato
    return num.toLocaleString('es-ES', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  return (
    <span className={className} suppressHydrationWarning>
      {formatNumber(value)}
    </span>
  );
}

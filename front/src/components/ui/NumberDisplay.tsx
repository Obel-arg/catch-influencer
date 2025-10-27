"use client";

import { useState, useEffect } from 'react';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatNumber = (num: number) => {
    if (format === 'short') {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    }
    
    // Para formato largo o números pequeños, usar configuración regional consistente
    return num.toLocaleString('es-ES', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  };

  // Durante la hidratación, mostrar un placeholder consistente
  if (!mounted) {
    return <span className={className}>---</span>;
  }

  return <span className={className}>{formatNumber(value)}</span>;
}

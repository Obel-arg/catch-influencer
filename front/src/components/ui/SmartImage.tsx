import React, { useState, useEffect } from 'react';
import { Loader2, Image } from "lucide-react";
import { ImageProxyService } from "@/lib/services/image-proxy.service";

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  showLoadingSpinner?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * SmartImage - Componente que maneja automáticamente URLs temporales
 * 
 * Este componente:
 * - Detecta URLs temporales (TikTok, Instagram, etc.)
 * - Las convierte automáticamente a Data URLs permanentes
 * - Muestra estados de carga y error
 * - Es completamente reutilizable
 */
export const SmartImage: React.FC<SmartImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  fallback,
  showLoadingSpinner = true,
  onLoad,
  onError
}) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setDisplayUrl(null);
        setHasError(true);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        // Usar la función utilitaria para manejar URLs temporales automáticamente
        const finalUrl = await ImageProxyService.convertTemporaryUrl(src);
        setDisplayUrl(finalUrl);
        onLoad?.();
      } catch (err) {
        setHasError(true);
        console.error('Error loading image:', err);
        onError?.();
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [src, onLoad, onError]);

  if (isLoading && showLoadingSpinner) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (hasError || !displayUrl) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center">
          <Image className="h-4 w-4 text-gray-300 mx-auto mb-1" />
          <p className="text-xs text-gray-400">Sin imagen disponible</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={displayUrl}
      alt={alt}
      className={className}
      onError={() => {
        setHasError(true);
        onError?.();
      }}
      onLoad={() => {
        onLoad?.();
      }}
    />
  );
}; 
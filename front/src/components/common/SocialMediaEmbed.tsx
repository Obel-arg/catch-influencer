import React, { useState } from 'react';
import { TikTokEmbed, InstagramEmbed } from 'react-social-media-embed';
import { isInstagramUrl } from '@/utils/instagram';
import { isTikTokUrl } from '@/utils/tiktok';

interface SocialMediaEmbedProps {
  url: string;
  width?: number;
  height?: number;
  fallbackImage?: string;
  className?: string;
}

export const SocialMediaEmbed: React.FC<SocialMediaEmbedProps> = ({
  url,
  width = 325,
  height = 580,
  fallbackImage,
  className = ''
}) => {
  const [embedError, setEmbedError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleEmbedError = (error: any) => {
    console.error('Social media embed error:', error);
    setEmbedError(true);
    setIsLoading(false);
  };

  const handleEmbedLoad = () => {
    setIsLoading(false);
  };

  // Si hay error de embedding, mostrar imagen de fallback
  if (embedError && fallbackImage) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={fallbackImage}
          alt="Social media preview"
          className="w-full h-auto rounded-lg"
          style={{ maxWidth: width, maxHeight: height }}
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Vista previa
        </div>
      </div>
    );
  }

  // TikTok embed
  if (isTikTokUrl(url)) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div 
            className="flex items-center justify-center bg-gray-100 rounded-lg"
            style={{ width, height }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Cargando TikTok...</p>
            </div>
          </div>
        )}
        <TikTokEmbed
          url={url}
          width={width}
          height={height}
          onError={handleEmbedError}
          onLoad={handleEmbedLoad}
          embedPlaceholder={
            <div className="flex items-center justify-center bg-gray-100 rounded-lg h-full">
              <p className="text-gray-600">Cargando video de TikTok...</p>
            </div>
          }
        />
      </div>
    );
  }

  // Instagram embed
  if (isInstagramUrl(url)) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div 
            className="flex items-center justify-center bg-gray-100 rounded-lg"
            style={{ width: width, minHeight: 400 }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Cargando Instagram...</p>
            </div>
          </div>
        )}
        <InstagramEmbed
          url={url}
          width={width}
          captioned
          onError={handleEmbedError}
          onLoad={handleEmbedLoad}
          embedPlaceholder={
            <div className="flex items-center justify-center bg-gray-100 rounded-lg h-96">
              <p className="text-gray-600">Cargando post de Instagram...</p>
            </div>
          }
        />
      </div>
    );
  }

  // URL no soportada
  return (
    <div className={`bg-gray-100 rounded-lg p-4 ${className}`} style={{ width, minHeight: 200 }}>
      <div className="text-center">
        <p className="text-gray-600 mb-2">Plataforma no soportada para embedding</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Ver contenido original →
        </a>
      </div>
    </div>
  );
};

/**
 * Hook para determinar si usar embedding en lugar de miniatura
 */
export function useShouldEmbed(url: string, thumbnailUrl?: string): boolean {
  // Si no hay miniatura y es TikTok o Instagram, usar embedding
  return (!thumbnailUrl || thumbnailUrl.includes('placeholder')) && 
         (isTikTokUrl(url) || isInstagramUrl(url));
} 
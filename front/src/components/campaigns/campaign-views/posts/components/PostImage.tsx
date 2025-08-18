import { Image, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageProxyService } from "@/lib/services/image-proxy.service";
import { getImageUrl } from "./PostUtils";
import { useState, useEffect } from "react";

interface PostImageProps {
  imageUrl?: string;
  postUrl?: string;
  onDelete: () => void;
  postData?: any; // Mantener para compatibilidad
}

export const PostImage = ({ imageUrl, postUrl, onDelete, postData }: PostImageProps) => {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getContentTypeLabel = (): string | null => {
    const platform = (postData?.platform || '').toLowerCase();
    const url = postData?.post_url || '';
    if (!platform) return null;
    if (platform === 'youtube') {
      return url.includes('/shorts/') ? 'Short' : 'Video';
    }
    if (platform === 'tiktok') {
      return 'Video';
    }
    if (platform === 'twitter') {
      return 'Post';
    }
    if (platform === 'instagram') {
      if (url.includes('/stories/')) return 'Story';
      return url.includes('/reel/') ? 'Reel' : 'Post';
    }
    return null;
  };
  const contentTypeLabel = getContentTypeLabel();

  useEffect(() => {
    const loadImage = async () => {
      if (!imageUrl) {
        setDisplayUrl(null);
        setHasError(false);
        setIsLoading(false);
        return;
      }

      // Reset states
      setHasError(false);
      setIsLoading(true);

      try {
        // Si ya es una Data URL, usarla directamente
        if (imageUrl.startsWith('data:')) {
          setDisplayUrl(imageUrl);
          setIsLoading(false);
          return;
        }

        // Verificar si es una URL temporal expirada
        if (ImageProxyService.isTemporaryUrl(imageUrl)) {
          if (ImageProxyService.isUrlExpired(imageUrl)) {
            console.warn('⚠️ URL temporal expirada detectada, intentando regenerar...');
            
            // Intentar obtener la imagen a través del proxy como Data URL
            const dataUrl = await ImageProxyService.getImageAsDataUrl(imageUrl);
            if (dataUrl) {
              setDisplayUrl(dataUrl);
            } else {
              setHasError(true);
              console.error('❌ No se pudo regenerar URL expirada');
            }
          } else {
            // URL temporal válida, usar directamente
            setDisplayUrl(imageUrl);
          }
        } else {
          // Para URLs normales, usar directamente
          setDisplayUrl(imageUrl);
        }
      } catch (error) {
        setHasError(true);
        console.error('❌ Error cargando imagen:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imageUrl]); // Remover postData de las dependencias ya que no lo usamos más

  const handleImageClick = () => {
    if (postUrl) {
      window.open(postUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div 
        className="relative overflow-hidden bg-gray-50"
        style={{
          aspectRatio: '1 / 1',
          minHeight: '200px',
          maxHeight: '250px'
        }}
      >
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Cargando imagen...</p>
          </div>
        </div>
        {/* Botón de eliminar en esquina superior izquierda */}
        <div className="absolute top-2 left-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50/30 bg-transparent rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Eliminar post"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden bg-gray-50 ${postUrl ? 'cursor-pointer' : ''}`}
      style={{
        aspectRatio: '1 / 1',
        minHeight: '200px',
        maxHeight: '250px'
      }}
      onClick={handleImageClick}
    >
      {displayUrl && !hasError ? (
        <img 
          src={displayUrl} 
          alt="Post" 
          className="absolute inset-0 w-full h-full object-contain object-center z-0"
          style={{
            objectFit: 'contain',
            objectPosition: 'center',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          onError={(e) => {
            console.error('Error cargando imagen:', displayUrl);
            setHasError(true);
          }}
        />
      ) : null}
      
      {(!displayUrl || hasError) && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
          {hasError ? (
            <div className="text-center">
              <Image className="h-6 w-6 text-gray-300 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Sin imagen disponible</p>
            </div>
          ) : (
            <div className="text-center">
              <Image className="h-8 w-8 text-gray-300 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Sin imagen disponible</p>
            </div>
          )}
        </div>
      )}

      {/* Badge de tipo de contenido en esquina superior derecha */}
      {contentTypeLabel && (
        <div className="absolute top-2 right-2 z-[1] pointer-events-none flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {contentTypeLabel === 'Post' ? (
            <Image className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          <span>{contentTypeLabel}</span>
        </div>
      )}
      
      {/* Botón de eliminar en esquina superior izquierda */}
      <div className="absolute top-2 left-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50/30 bg-transparent rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Eliminar post"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  );
}; 
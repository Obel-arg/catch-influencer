import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getOptimizedAvatarUrl } from '@/utils/instagram';

interface LazyInfluencerAvatarProps {
  influencer: {
    name: string;
    avatar?: string;
    image?: string;
    creatorId?: string;
  };
  className?: string;
}

// 🎯 Generar avatar usando servicio confiable
const generateFallbackAvatar = (displayName: string) => {
  try {
    // Limpiar el nombre y obtener la primera letra
    const cleanName = (displayName || '').trim();
    const initial = cleanName.charAt(0).toUpperCase();
    
    // Si no hay initial válido, usar 'U'
    if (!initial || initial.length === 0) {
      return `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff&size=128&format=svg`;
    }
    
    // Verificar que es un carácter alfanumérico
    const safeInitial = /^[A-Za-z0-9]$/.test(initial) ? initial : 'U';
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeInitial)}&background=6366f1&color=fff&size=128&format=svg`;
  } catch (error) {
    console.warn('Error generando avatar fallback:', error);
    // Fallback del fallback - usar URL fija
    return `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff&size=128&format=svg`;
  }
};

export const LazyInfluencerAvatar = ({ 
  influencer, 
  className = "h-10 w-10 ring-1 ring-gray-100" 
}: LazyInfluencerAvatarProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const originalSrc = influencer.avatar || influencer.image || '';
  
  // 🎯 Generar initial de forma más robusta
  const getSafeInitial = (name: string) => {
    try {
      const cleanName = (name || '').trim();
      const initial = cleanName.charAt(0).toUpperCase();
      return /^[A-Za-z0-9]$/.test(initial) ? initial : 'U';
    } catch {
      return 'U';
    }
  };
  
  // 🎯 DETERMINAR NOMBRE A MOSTRAR
  const displayName = influencer.name === 'Sin nombre' || /\d/.test(influencer.name) ? influencer.creatorId : influencer.name;
  const fallbackInitial = getSafeInitial(displayName);

  useEffect(() => {
    // Si no hay imagen original, usar fallback inmediatamente
    if (!originalSrc) {
      setImageSrc(generateFallbackAvatar(displayName));
      setIsLoading(false);
      return;
    }

    // 🎯 Usar IntersectionObserver para lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Precargar 50px antes de que sea visible
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [originalSrc, displayName]);

  const loadImage = async () => {
    if (!originalSrc) return;

    try {
      setIsLoading(true);
      setHasError(false);

      // ✅ DETECTAR SI ES URL DE HYPEAUDITOR (Instagram directo)
      const isHypeAuditorUrl = originalSrc.includes('cdninstagram.com') || 
                               originalSrc.includes('scontent-') ||
                               originalSrc.startsWith('https://scontent');
      
      let processedUrl;
      if (isHypeAuditorUrl) {
        // Para HypeAuditor, usar URL directamente (ya está optimizada)
        processedUrl = originalSrc;
      } else {
        // Para otros casos, usar función de optimización
        processedUrl = getOptimizedAvatarUrl(originalSrc, influencer.name || '');
      }
            
      setImageSrc(processedUrl);
      setHasError(false);

    } catch (error) {
      console.error(`❌ [LAZY AVATAR] Error procesando avatar para ${displayName}:`, error);
      setHasError(true);
      setImageSrc(generateFallbackAvatar(displayName));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    console.warn(`⚠️ [LAZY AVATAR] Error cargando imagen para ${displayName}, usando fallback`);
    setHasError(true);
    setImageSrc(generateFallbackAvatar(displayName));
  };

  return (
    <div ref={imgRef}>
      <Avatar className={className}>
        {isLoading ? (
          <AvatarFallback className="bg-gray-200 animate-pulse">
            <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-500">📸</span>
            </div>
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage 
              src={imageSrc || generateFallbackAvatar(displayName)} 
              alt={displayName}
              onError={handleImageError}
            />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
              {fallbackInitial}
            </AvatarFallback>
          </>
        )}
      </Avatar>
    </div>
  );
}; 
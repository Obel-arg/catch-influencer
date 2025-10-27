import { 
  Instagram, 
  Youtube, 
  Share,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfluencerPost } from "@/lib/services/influencer-posts";
import { ImageProxyService } from "@/lib/services/image-proxy.service";

// Componente personalizado para el ícono de TikTok
export const TikTokIcon = ({ className }: { className?: string }) => (
  <img src="/icons/tiktok.svg" alt="TikTok icon" className={className} />
);

// Función para obtener el icono de plataforma
export const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <Instagram className="h-4 w-4 text-pink-500" />;
    case 'youtube':
      return <Youtube className="h-4 w-4 text-red-500" />;
    case 'twitter':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="h-4 w-4 text-black" fill="currentColor">
          <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
        </svg>
      );
    case 'tiktok':
      return <TikTokIcon className="h-4 w-4 text-black" />;
    default:
      return <Share className="h-4 w-4 text-gray-500" />;
  }
};

// Función para obtener el icono de plataforma más pequeño
export const getSmallPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <Instagram className="h-3 w-3 text-pink-500" />;
    case 'youtube':
      return <Youtube className="h-3 w-3 text-red-500" />;
    case 'twitter':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="h-3 w-3 text-black" fill="currentColor">
          <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
        </svg>
      );
    case 'tiktok':
      return <TikTokIcon className="h-3 w-3 text-black" />;
    default:
      return <Share className="h-3 w-3 text-gray-500" />;
  }
};

// Función para calcular alcance aproximado para Instagram (determinística)
const calculateApproximateReach = (likes: number | string, comments: number | string): number => {
  const likesNum = typeof likes === 'string' ? parseInt(likes) || 0 : likes || 0;
  const commentsNum = typeof comments === 'string' ? parseInt(comments) || 0 : comments || 0;
  
  // Si no hay likes ni comentarios, usar un valor base fijo
  if (likesNum === 0 && commentsNum === 0) {
    return 35; // Valor fijo para posts sin engagement
  }
  
  // Calcular engagement rate aproximado (likes + comentarios)
  const totalEngagement = likesNum + commentsNum;
  
  // Para Instagram, el alcance típicamente es 10-50x el engagement
  // Usar una fórmula determinística basada en el engagement
  // Factor base: 20x el engagement
  let reachMultiplier = 20;
  
  // Ajustar el multiplicador basado en el nivel de engagement para simular realismo
  if (totalEngagement > 1000) {
    reachMultiplier = 25; // Posts con mucho engagement tienen mayor alcance
  } else if (totalEngagement > 500) {
    reachMultiplier = 22; // Posts con engagement medio-alto
  } else if (totalEngagement > 100) {
    reachMultiplier = 21; // Posts con engagement medio
  } else if (totalEngagement > 50) {
    reachMultiplier = 19; // Posts con engagement bajo-medio
  } else if (totalEngagement > 10) {
    reachMultiplier = 18; // Posts con engagement bajo
  } else {
    reachMultiplier = 17; // Posts con muy poco engagement
  }
  
  const approximateReach = totalEngagement * reachMultiplier;
  
  // Asegurar un mínimo razonable (5x el engagement)
  return Math.max(approximateReach, totalEngagement * 5);
};

// Función para formatear números
export const formatNumber = (num: number | string, options?: { 
  isReach?: boolean; 
  platform?: string; 
  likes?: number | string; 
  comments?: number | string;
  postUrl?: string; // ✅ NUEVO: Para detectar historias
}) => {
  // ✅ NUEVO: Si es una historia de Instagram, no calcular alcance aproximado
  const isInstagramStory = options?.platform === 'instagram' && 
                           options?.postUrl && 
                           /instagram\.com\/stories\//i.test(options.postUrl);
  
  // Si es alcance de Instagram (pero NO historia) y no hay datos, calcular aproximado
  if (options?.isReach && options?.platform === 'instagram' && !isInstagramStory && (num === '...' || num === undefined || num === null)) {
    // ✅ NUEVO: Si tanto likes como comments son '...', mantener TBC (no calcular aproximado)
    const likesAreTBC = options.likes === '...' || options.likes === undefined || options.likes === null;
    const commentsAreTBC = options.comments === '...' || options.comments === undefined || options.comments === null;
    
    // Si ambas métricas están en estado TBC, no calcular alcance aproximado
    if (likesAreTBC && commentsAreTBC) {
      return '...';
    }
    
    const approximateReach = calculateApproximateReach(options.likes || 0, options.comments || 0);
    const numValue = approximateReach;
    
    if (numValue >= 1000000) {
      return (numValue / 1000000).toFixed(1) + 'M';
    }
    if (numValue >= 1000) {
      return (numValue / 1000).toFixed(1) + 'K';
    }
    return numValue.toString();
  }
  
  // Comportamiento normal para otros casos
  if (num === '...' || num === undefined || num === null) return '...';
  const numValue = typeof num === 'string' ? parseInt(num) : num;
  if (isNaN(numValue)) return '...';
  
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1) + 'M';
  }
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + 'K';
  }
  return numValue.toString();
};

// Función para obtener el ID del influencer en la plataforma específica
export const getPlatformInfluencerId = (platformInfo: any, platform: string, influencerName?: string): string | null => {
  if (!platformInfo || typeof platformInfo !== 'object') {
    return null;
  }
  
  const platformLower = platform.toLowerCase();
  
  try {
    let result = null;
    
    // Según el JSON que muestras, todos los IDs están en el objeto youtube
    if (platformInfo.youtube) {
      switch (platformLower) {
        case 'tiktok':
          result = platformInfo.youtube.tiktokId || null;
          break;
        case 'instagram':
          result = platformInfo.youtube.instagramId || null;
          break;
        case 'youtube':
          result = platformInfo.youtube.displayId || null;
          break;
        case 'twitter':
          // Por ahora no implementado
          result = null;
          break;
        default:
          result = null;
      }
    }
    
    // Fallback: buscar directamente en la raíz
    if (!result) {
      switch (platformLower) {
        case 'tiktok':
          result = platformInfo.tiktokId || platformInfo.tiktok?.tiktokId || null;
          break;
        case 'instagram':
          result = platformInfo.instagramId || platformInfo.instagram?.instagramId || null;
          break;
        case 'youtube':
          result = platformInfo.displayId || platformInfo.youtube?.displayId || null;
          break;
      }
    }

    // Búsqueda adicional para TikTok en diferentes estructuras
    if (!result && platformLower === 'tiktok') {
      // Buscar en diferentes estructuras posibles
      const possiblePaths = [
        platformInfo.tiktok?.username,
        platformInfo.tiktok?.displayId,
        platformInfo.tiktok?.id,
        platformInfo.username,
        platformInfo.displayId,
        platformInfo.id,
        platformInfo.tiktokId,
        platformInfo.tiktokName,
        platformInfo.tiktok?.tiktokName,
        platformInfo.tiktok?.basicTiktok?.username,
        platformInfo.tiktok?.basicTikTok?.username,
        platformInfo.tiktok?.basicTIKTOK?.username,
        platformInfo.basicTiktok?.username,
        platformInfo.basicTikTok?.username,
        platformInfo.basicTIKTOK?.username
      ];

      for (const path of possiblePaths) {
        if (path) {
          result = path;
          break;
        }
      }

      // Fallback final: usar el nombre del influencer si no hay TikTok ID
      if (!result && influencerName) {
        result = influencerName;
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ [DEBUG] Error parsing platform info:', error);
    return null;
  }
};

// Función para extraer el título/descripción según la plataforma
export const extractPostTitle = (post: InfluencerPost): string | null => {
  if (!post.post_metrics?.raw_response) return null;
  
  const rawResponse = post.post_metrics.raw_response;
  const platform = post.platform.toLowerCase();
  
  try {
    switch (platform) {
      case 'instagram':
        // Para Instagram, el título está directamente en el rawResponse
        return rawResponse.title || rawResponse.data?.basicInstagramPost?.title || null;
      case 'youtube':
        return rawResponse.data?.basicYoutubePost?.title || null;
      case 'tiktok':
        // Para TikTok podemos usar audioTitle o el título del video si existe
        return rawResponse.data?.basicTikTokVideo?.audioTitle || 
               rawResponse.data?.basicTikTokVideo?.title || null;
      case 'twitter':
        return rawResponse.data?.basicTwitterPost?.title || null;
      default:
        return null;
    }
  } catch (error) {
    console.error('Error parsing post title:', error);
    return null;
  }
};

// Función para extraer el engagement rate del raw_response según la plataforma
export const extractEngagementRateFromRawResponse = (post: InfluencerPost): number => {
  if (!post.post_metrics?.raw_response) {
    return 0;
  }

  const rawResponse = post.post_metrics.raw_response;
  const platform = post.platform.toLowerCase();

  try {
    if (platform === 'youtube' && rawResponse.data?.basicYoutubePost?.engageRate) {
      return rawResponse.data.basicYoutubePost.engageRate;
    }

    if (platform === 'tiktok' && rawResponse.data?.basicTikTokVideo?.engageRate) {
      return rawResponse.data.basicTikTokVideo.engageRate;
    }

    if (platform === 'instagram' && rawResponse.data?.basicInstagramPost?.engageRate) {
      return rawResponse.data.basicInstagramPost.engageRate;
    }

    // Fallback a post_metrics.engagement_rate si no está en raw_response
    return post.post_metrics?.engagement_rate || 0;
  } catch (error) {
    console.error('Error parsing engagement rate:', error);
    return post.post_metrics?.engagement_rate || 0;
  }
};

// Función para extraer métricas del raw_response según la plataforma
export const extractMetricsFromRawResponse = (post: InfluencerPost): {
  likes: number | string;
  comments: number | string;
  views: number | string;
  uploadDate: Date | null;
} => {
  if (!post.post_metrics?.raw_response) {
    return { likes: '...', comments: '...', views: '...', uploadDate: null };
  }

  const rawResponse = post.post_metrics.raw_response;
  const platform = post.platform.toLowerCase();

  try {
    // ✅ NUEVO: Verificar si son métricas manuales (para historias de Instagram)
    if (rawResponse.manual_metrics) {
      const manualData = rawResponse.manual_metrics;
      return {
        likes: manualData.likes || 0,
        comments: manualData.comments || 0,
        views: manualData.alcance || 0, // alcance = views para historias
        uploadDate: manualData.saved_at ? new Date(manualData.saved_at) : null
      };
    }
    if (platform === 'tiktok' && rawResponse.data?.basicTikTokVideo) {
      const tiktokData = rawResponse.data.basicTikTokVideo;
      return {
        likes: tiktokData.hearts || '...',
        comments: tiktokData.comments || '...',
        views: tiktokData.plays || '...',
        uploadDate: tiktokData.uploadDate ? new Date(tiktokData.uploadDate) : null
      };
    }

    if (platform === 'youtube' && rawResponse.data?.basicYoutubePost) {
      const youtubeData = rawResponse.data.basicYoutubePost;
      return {
        likes: youtubeData.likes || '...',
        comments: youtubeData.comments || '...',
        views: youtubeData.views || '...',
        uploadDate: youtubeData.uploadDate ? new Date(youtubeData.uploadDate) : null
      };
    }

    if (platform === 'instagram' && rawResponse.data?.basicInstagramPost) {
      const instagramData = rawResponse.data.basicInstagramPost;
      
      
      
      // Buscar alcance en múltiples campos posibles para Instagram
      let views = instagramData.videoViews || 
                  instagramData.views || 
                  instagramData.reach || 
                  instagramData.impressions || 
                  instagramData.viewsCount || 
                  '...';
      
        
      
      return {
        likes: instagramData.likes || '...',
        comments: instagramData.comments || '...',
        views: views,
        uploadDate: instagramData.updateDate ? new Date(instagramData.updateDate) : null
      };
    }

    if (platform === 'twitter' && rawResponse.data?.basicTwitterPost) {
      const twitterData = rawResponse.data.basicTwitterPost;
      return {
        likes: twitterData.likes || '...',
        comments: twitterData.replies || '...',
        views: twitterData.views || '...',
        uploadDate: twitterData.publishedAt ? new Date(twitterData.publishedAt) : null
      };
    }

    // Si la plataforma no es reconocida o no hay datos
    return { likes: '...', comments: '...', views: '...', uploadDate: null };
  } catch (error) {
    console.error('Error parsing raw_response:', error);
    return { likes: '...', comments: '...', views: '...', uploadDate: null };
  }
};

// Función para obtener el badge de sentimiento
export const getSentimentBadge = (rating?: string) => {
  if (!rating) return null;
  
  const sentiments = {
    excellent: { label: "Positivo", color: "bg-green-500 hover:bg-green-600 text-white" },
    good: { label: "Positivo", color: "bg-green-500 hover:bg-green-600 text-white" }, 
    average: { label: "Neutral", color: "bg-yellow-500 hover:bg-yellow-600 text-white" },
    poor: { label: "Negativo", color: "bg-red-500 hover:bg-red-600 text-white" }
  };

  const sentiment = sentiments[rating as keyof typeof sentiments] || { label: "Neutral", color: "bg-gray-500 hover:bg-gray-600 text-white" };

  return (
    <Button 
      size="sm" 
      className={`h-7 px-3 text-xs font-medium ${sentiment.color}`}
    >
      {sentiment.label}
    </Button>
  );
};

// Función para obtener el componente de sentimiento predominante
export const getSentimentComponent = (sentiment: 'Positivo' | 'Negativo' | 'Neutral') => {
  switch (sentiment) {
    case 'Positivo':
      return (
        <div className="flex items-center gap-1 text-xs">
          <ThumbsUp className="h-4 w-4 text-green-500" />
          <span className="text-green-600 font-medium">Positivo</span>
        </div>
      );
    case 'Negativo':
      return (
        <div className="flex items-center gap-1 text-xs">
          <ThumbsDown className="h-4 w-4 text-red-500" />
          <span className="text-red-600 font-medium">Negativo</span>
        </div>
      );
    case 'Neutral':
      return (
        <div className="flex items-center gap-1 text-xs">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-amber-600 font-medium">Neutral</span>
        </div>
      );
    default:
      return null;
  }
}; 

/**
 * Extrae la imagen cover del rawData de TikTok
 * @param postData - Datos del post que incluye post_metrics
 * @returns URL de la imagen o null si no se encuentra
 */
export const getTikTokImageFromRawData = (postData: any): string | null => {
  try {
    // Buscar en diferentes rutas posibles del rawData de TikTok
    const rawData = postData?.post_metrics?.raw_response?.data;
    
    if (rawData?.basicTikTokVideo) {
      const tiktokData = rawData.basicTikTokVideo;
      
      // Priorizar cover, luego dynamicCover, luego originCover
      const imageUrl = tiktokData.cover || tiktokData.dynamicCover || tiktokData.originCover;
      
      if (imageUrl) {
        return imageUrl;
      }
    }
    
    // Buscar en otras estructuras posibles
    if (rawData?.cover) {
      return rawData.cover;
    }
    
    if (rawData?.thumbnail) {
      return rawData.thumbnail;
    }
    
    // Buscar en la raíz del raw_response
    if (postData?.post_metrics?.raw_response?.cover) {
      return postData.post_metrics.raw_response.cover;
    }
    
    return null;
  } catch (error) {
    console.error('❌ [PostUtils] Error extrayendo imagen de TikTok rawData:', error);
    return null;
  }
};

/**
 * Extrae la primera imagen del rawData.images de Instagram
 * @param postData - Datos del post que incluye post_metrics
 * @returns URL de la imagen o null si no se encuentra
 */
export const getInstagramImageFromRawData = (postData: any): string | null => {
  try {
    if (postData?.post_metrics?.raw_response?.data?.basicInstagramPost?.rawData?.images?.length > 0) {
      const firstImage = postData.post_metrics.raw_response.data.basicInstagramPost.rawData.images[0];
      return firstImage;
    }
    return null;
  } catch (error) {
    console.error('❌ [PostUtils] Error extrayendo imagen de rawData:', error);
    return null;
  }
};

/**
 * Verifica si una URL es de blob storage
 * @param url - URL a verificar
 * @returns true si es una URL de blob
 */
const isBlobUrl = (url: string): boolean => {
  return Boolean(url && url.includes('blob.vercel-storage.com'));
};

/**
 * Obtiene la URL de imagen priorizando blob storage para todas las plataformas
 * @param post - Datos del post
 * @returns URL de la imagen a mostrar
 */
export const getImageUrl = async (post: any): Promise<string> => {

  if (post.platform?.toLowerCase() === 'instagram') {
    // Para Instagram, priorizar la imagen almacenada en blob storage
    if (post.image_url && isBlobUrl(post.image_url)) {
      return post.image_url;
    }
    
    // Si no hay imagen en blob, intentar obtener del rawData como fallback
    const rawDataImage = getInstagramImageFromRawData(post);
    if (rawDataImage) {
      try {
        // Convertir la imagen de Instagram a blob URL para almacenamiento permanente
        const blobUrl = await ImageProxyService.getImageAsBlobUrl(rawDataImage);
        if (blobUrl) {
          return blobUrl;
        }
      } catch (error) {
        console.error('❌ [getImageUrl] Error convirtiendo imagen de Instagram a blob:', error);
      }
    }
    
    // Fallback final: usar image_url si existe
    if (post.image_url) {
      return post.image_url;
    }
    
    return '';
  } else if (post.platform?.toLowerCase() === 'tiktok') {
    // Para TikTok, priorizar la imagen almacenada en blob storage
    if (post.image_url && isBlobUrl(post.image_url)) {
      return post.image_url;
    }
    
    // Si no hay imagen en blob, intentar obtener del rawData como fallback
    const rawDataImage = getTikTokImageFromRawData(post);
    if (rawDataImage) {
      try {
        // Convertir la imagen de TikTok a blob URL para almacenamiento permanente
        const blobUrl = await ImageProxyService.getImageAsBlobUrl(rawDataImage);
        if (blobUrl) {
          return blobUrl;
        }
      } catch (error) {
        console.error('❌ [getImageUrl] Error convirtiendo imagen de TikTok a blob:', error);
      }
    }
    
    // Fallback final: usar image_url si existe
    if (post.image_url) {
      return post.image_url;
    }
    
    return '';
  } else if (post.platform?.toLowerCase() === 'twitter') {
    // Para Twitter, priorizar la imagen almacenada en blob storage
    if (post.image_url && isBlobUrl(post.image_url)) {
      return post.image_url;
    }
    
    // Si no hay imagen en blob, intentar convertir image_url a blob storage
    if (post.image_url) {
      try {
        
        // Verificar si es una URL de ScreenshotOne
        if (post.image_url.includes('api.screenshotone.com')) {
          
          // Convertir la imagen de ScreenshotOne a blob URL para almacenamiento permanente
          const blobUrl = await ImageProxyService.getImageAsBlobUrl(post.image_url);
          if (blobUrl) {
            return blobUrl;
          }
        } else {
          // Para otras URLs, intentar convertir también
          const blobUrl = await ImageProxyService.getImageAsBlobUrl(post.image_url);
          if (blobUrl) {
            return blobUrl;
          }
        }
      } catch (error) {
        console.error('❌ [getImageUrl] Error convirtiendo imagen de Twitter a blob:', error);
      }
    }
    
    // Fallback final: usar image_url si existe
    if (post.image_url) {
      return post.image_url;
    }
    
    return '';
  } else {
    // Para otras plataformas, usar image_url directamente
    return post.image_url || '';
  }
}; 
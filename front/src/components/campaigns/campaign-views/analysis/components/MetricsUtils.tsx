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

// Función para formatear números de métricas de posts
export const formatMetricNumber = (num: number | string, options?: { 
  isReach?: boolean; 
  platform?: string; 
  likes?: number | string; 
  comments?: number | string;
  postUrl?: string;
}) => {
  // Si es alcance de Instagram y no hay datos, calcular aproximado
  if (options?.isReach && options?.platform === 'instagram' && (num === '...' || num === undefined || num === null)) {
    // Si tanto likes como comments son '...', mantener TBC (no calcular aproximado)
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
export const getPlatformInfluencerId = (platformInfo: any, platform: string): string | null => {
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
    
    return result;
  } catch (error) {
    console.error('Error parsing platform info:', error);
    return null;
  }
};

// Función para extraer métricas del raw_response según la plataforma
export const extractMetricsFromRawResponse = (postData: any): {
  likes: number | string;
  comments: number | string;
  views: number | string;
  uploadDate: Date | null;
} => {
  if (!postData?.post_metrics?.raw_response) {
    return { likes: '...', comments: '...', views: '...', uploadDate: null };
  }

  const rawResponse = postData.post_metrics.raw_response;
  const platform = postData.platform.toLowerCase();

  try {
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
      
      // Debug: mostrar qué campos están disponibles
      console.log('🔍 [METRICS-UTILS] Instagram data available:', {
        videoViews: instagramData.videoViews,
        views: instagramData.views,
        reach: instagramData.reach,
        impressions: instagramData.impressions,
        viewsCount: instagramData.viewsCount,
        rawData: instagramData
      });
      
      // Buscar alcance en múltiples campos posibles para Instagram
      let views = instagramData.videoViews || 
                  instagramData.views || 
                  instagramData.reach || 
                  instagramData.impressions || 
                  instagramData.viewsCount || 
                  '...';
      
      console.log('🔍 [METRICS-UTILS] Selected views value:', views);
      
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

    return { likes: '...', comments: '...', views: '...', uploadDate: null };
  } catch (error) {
    console.error('Error parsing raw_response:', error);
    return { likes: '...', comments: '...', views: '...', uploadDate: null };
  }
};

// Función para extraer el título/descripción según la plataforma
export const extractPostTitle = (postData: any): string | null => {
  if (!postData?.post_metrics?.raw_response) return null;
  
  const rawResponse = postData.post_metrics.raw_response;
  const platform = postData.platform.toLowerCase();
  
  try {
    switch (platform) {
      case 'instagram':
        return rawResponse.title || rawResponse.data?.basicInstagramPost?.title || null;
      case 'youtube':
        return rawResponse.data?.basicYoutubePost?.title || null;
      case 'tiktok':
        return rawResponse.data?.basicTikTokVideo?.audioTitle || 
               rawResponse.data?.basicTikTokVideo?.title || null;
      case 'twitter':
        return null;
      default:
        return null;
    }
  } catch (error) {
    console.error('Error parsing post title:', error);
    return null;
  }
}; 

// --- YouTube Category Normalization ---
const YOUTUBE_CATEGORY_MAP: Record<number, string> = {
  1: "Film & Animation",
  2: "Autos & Vehicles",
  10: "Music",
  15: "Pets & Animals",
  17: "Sports",
  18: "Short Movies",
  19: "Travel & Events",
  20: "Gaming",
  21: "Videoblogging",
  22: "People & Blogs",
  23: "Comedy",
  24: "Entertainment",
  25: "News & Politics",
  26: "Howto & Style",
  27: "Education",
  28: "Science & Technology",
  29: "Nonprofits & Activism",
};

export const normalizeYouTubeCategory = (category: string | number | null | undefined): string | null => {
  if (category === null || category === undefined) return null;
  // If it's already a non-numeric name, return as is
  if (typeof category === 'string') {
    const trimmed = category.trim();
    const asNumber = Number(trimmed);
    if (!Number.isNaN(asNumber) && trimmed !== '') {
      return YOUTUBE_CATEGORY_MAP[asNumber] || trimmed;
    }
    return trimmed;
  }
  if (typeof category === 'number') {
    return YOUTUBE_CATEGORY_MAP[category] || String(category);
  }
  return null;
};
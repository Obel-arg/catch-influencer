/**
 * Extrae el ID del video de una URL de YouTube
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Diferentes formatos de URLs de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/v\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Obtiene la URL de la miniatura de un video de YouTube
 */
export const getYouTubeThumbnail = (url: string, quality: 'maxres' | 'high' | 'medium' | 'default' = 'maxres'): string | null => {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) return null;
  
  const qualityMap = {
    maxres: 'maxresdefault.jpg',     // 1280x720
    high: 'hqdefault.jpg',           // 480x360
    medium: 'mqdefault.jpg',         // 320x180
    default: 'default.jpg'           // 120x90
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
};

/**
 * Verifica si una URL es de YouTube
 */
export const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  
  const youtubePatterns = [
    /(?:youtube\.com)/,
    /(?:youtu\.be)/,
    /(?:m\.youtube\.com)/,
    /(?:www\.youtube\.com)/
  ];
  
  return youtubePatterns.some(pattern => pattern.test(url));
};

/**
 * Obtiene información básica del video (solo lo que podemos extraer de la URL)
 */
export const getYouTubeVideoInfo = (url: string) => {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) return null;
  
  return {
    videoId,
    thumbnail: getYouTubeThumbnail(url),
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`
  };
}; 
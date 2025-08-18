/**
 * Utilidades para trabajar con URLs de TikTok
 */

/**
 * Verifica si una URL es de TikTok
 */
export function isTikTokUrl(url: string): boolean {
  if (!url) return false;
  
  const tiktokPatterns = [
    /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/i,
    /^https?:\/\/(www\.)?tiktok\.com\/@[^\/]+\/video\/\d+/i,
    /^https?:\/\/(www\.)?tiktok\.com\/t\/[a-zA-Z0-9]+/i,
    /^https?:\/\/vm\.tiktok\.com\/[a-zA-Z0-9]+/i
  ];
  
  return tiktokPatterns.some(pattern => pattern.test(url));
}

/**
 * Extrae el ID del video de TikTok de una URL
 */
export function getTikTokVideoId(url: string): string | null {
  if (!isTikTokUrl(url)) return null;
  
  // Patrón para URLs como: https://www.tiktok.com/@usuario/video/7509251387184647480
  const videoIdMatch = url.match(/\/video\/(\d+)/);
  if (videoIdMatch && videoIdMatch[1]) {
    return videoIdMatch[1];
  }
  
  // Patrón para URLs cortas como: https://www.tiktok.com/t/ZTRoaBC7H/
  const shortIdMatch = url.match(/\/t\/([a-zA-Z0-9]+)/);
  if (shortIdMatch && shortIdMatch[1]) {
    return shortIdMatch[1];
  }
  
  // Patrón para vm.tiktok.com
  const vmMatch = url.match(/vm\.tiktok\.com\/([a-zA-Z0-9]+)/);
  if (vmMatch && vmMatch[1]) {
    return vmMatch[1];
  }
  
  return null;
}

/**
 * Extrae el nombre de usuario de una URL de TikTok
 */
export function getTikTokUsername(url: string): string | null {
  if (!isTikTokUrl(url)) return null;
  
  const usernameMatch = url.match(/@([^\/]+)/);
  return usernameMatch ? usernameMatch[1] : null;
}

/**
 * Obtiene una imagen por defecto para TikTok
 */
export function getTikTokDefaultThumbnail(): string {
  // Usar la imagen base64 específica para TikTok
  return 'data:image/png;base64,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';
}

/**
 * Genera una URL de miniatura para un video de TikTok
 * Siempre retorna la imagen base64 específica
 */
export function getTikTokThumbnail(url: string): string | null {
  if (!isTikTokUrl(url)) return null;
  
  // Siempre retornar la imagen base64 específica para TikTok
  return getTikTokDefaultThumbnail();
}

/**
 * Genera una URL de miniatura usando un servicio de proxy/screenshot
 * Esta es una alternativa más confiable que funciona capturando la página
 */
export function getTikTokThumbnailViaScreenshot(url: string): string | null {
  if (!isTikTokUrl(url)) return null;
  
  // Usar un servicio de screenshot (ejemplo con screenshotapi.net)
  // Nota: Este servicio requiere API key en producción
  const screenshotUrl = `https://shot.screenshotapi.net/screenshot?token=demo&url=${encodeURIComponent(url)}&width=400&height=600&file_type=png&wait_for_event=load`;
  
  return screenshotUrl;
}

/**
 * Intenta obtener la miniatura de TikTok usando múltiples métodos
 * Siempre retorna la imagen base64 específica
 */
export function getTikTokThumbnailBest(url: string): string | null {
  if (!isTikTokUrl(url)) return null;
  
  // Siempre retornar la imagen base64 específica para TikTok
  return getTikTokDefaultThumbnail();
}

/**
 * Verifica si una URL de imagen es válida
 */
export async function isImageUrlValid(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && (contentType?.startsWith('image/') ?? false);
  } catch {
    return false;
  }
}

/**
 * Obtiene la mejor miniatura disponible para TikTok usando la API del backend
 */
export async function getTikTokThumbnailValidated(url: string): Promise<string> {
  if (!isTikTokUrl(url)) return getTikTokDefaultThumbnail();
  
  try {
   
    
    // Determinar la URL base del backend
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://influencerstracker-back.vercel.app' // URL de producción en Vercel
      : 'http://localhost:5000'; // URL local del backend (puerto correcto)
    
    // Llamar a la API del backend
    const response = await fetch(`${backendUrl}/api/social/tiktok/thumbnail?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Agregar timeout manual
      signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.thumbnail) {
      
      
      // Validar que la imagen sea accesible (opcional, puede ser lento)
      try {
        const isValid = await isImageUrlValid(data.thumbnail);
        if (isValid) {
          return data.thumbnail;
        } else {
          
          return data.thumbnail; // Usar de todas formas
        }
      } catch (validationError) {
        
        return data.thumbnail; // Usar de todas formas
      }
    } else {
      
    }
    
  } catch (error) {
    
  }
  
  // Fallback a imagen por defecto
  
  return getTikTokDefaultThumbnail();
}

/**
 * Obtiene información básica de un video de TikTok desde la URL
 */
export function getTikTokVideoInfo(url: string): {
  videoId: string | null;
  username: string | null;
  thumbnail: string | null;
  isValid: boolean;
} {
  const isValid = isTikTokUrl(url);
  
  if (!isValid) {
    return {
      videoId: null,
      username: null,
      thumbnail: null,
      isValid: false
    };
  }
  
  return {
    videoId: getTikTokVideoId(url),
    username: getTikTokUsername(url),
    thumbnail: getTikTokThumbnailBest(url),
    isValid: true
  };
}

/**
 * Normaliza una URL de TikTok al formato estándar
 */
export function normalizeTikTokUrl(url: string): string | null {
  if (!isTikTokUrl(url)) return null;
  
  const videoId = getTikTokVideoId(url);
  const username = getTikTokUsername(url);
  
  if (!videoId || !username) return url; // Retornar URL original si no se puede parsear
  
  // Formato normalizado
  return `https://www.tiktok.com/@${username}/video/${videoId}`;
}

/**
 * Extrae metadatos de TikTok usando oEmbed (si está disponible)
 */
export async function getTikTokMetadata(url: string): Promise<{
  title?: string;
  author?: string;
  thumbnail?: string;
  description?: string;
} | null> {
  if (!isTikTokUrl(url)) return null;
  
  try {
    // TikTok oEmbed endpoint
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) throw new Error('oEmbed not available');
    
    const data = await response.json();
    
    return {
      title: data.title || 'Video de TikTok',
      author: data.author_name || getTikTokUsername(url) || 'Usuario TikTok',
      thumbnail: data.thumbnail_url || getTikTokThumbnailBest(url) || undefined,
      description: data.title || ''
    };
  } catch (error) {

    
    // Fallback con información básica
    const thumbnailUrl = getTikTokThumbnailBest(url);
    return {
      title: 'Video de TikTok',
      author: getTikTokUsername(url) || 'Usuario TikTok',
      thumbnail: thumbnailUrl || undefined,
      description: `Video de TikTok de @${getTikTokUsername(url) || 'usuario'}`
    };
  }
}

/**
 * Obtiene información completa del video desde la API del backend
 */
export async function getTikTokVideoInfoFromAPI(url: string): Promise<{
  id: string;
  description: string;
  author: {
    username: string;
    nickname: string;
  };
  thumbnails: string[];
  videoUrl: string;
  stats: {
    playCount: number;
    shareCount: number;
    commentCount: number;
    diggCount: number;
  };
} | null> {
  if (!isTikTokUrl(url)) return null;
  
  try {
    
    
    // Determinar la URL base del backend
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://influencerstracker-back.vercel.app' // URL de producción en Vercel
      : 'http://localhost:5000'; // URL local del backend (puerto correcto)
    
    const response = await fetch(`${backendUrl}/api/social/tiktok/video-info?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      
      return result.data;
    }
    
    return null;
    
  } catch (error) {
    
    return null;
  }
}

/**
 * Obtiene videos trending desde la API del backend (para pruebas)
 */
export async function getTikTokTrendingVideos(count: number = 10): Promise<any[]> {
  try {
    
    
    // Determinar la URL base del backend
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://influencerstracker-back.vercel.app' // URL de producción en Vercel
      : 'http://localhost:5000'; // URL local del backend (puerto correcto)
    
    const response = await fetch(`${backendUrl}/api/social/tiktok/trending?count=${count}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      
      return result.data;
    }
    
    return [];
    
  } catch (error) {
    
    return [];
  }
}

/**
 * Función de debug para probar la nueva API
 */
export async function debugTikTokAPI(url: string) {
  
  
  // Probar thumbnail
  
  const thumbnail = await getTikTokThumbnailValidated(url);

  
  // Probar información completa
  
  const videoInfo = await getTikTokVideoInfoFromAPI(url);
  
  
  // Probar trending (solo algunos videos)
  
  const trending = await getTikTokTrendingVideos(3);
  
  
  const result = {
    url,
    thumbnail,
    videoInfo,
    trending,
    success: !!thumbnail && thumbnail !== getTikTokDefaultThumbnail()
  };
  
  
  return result;
}

// Función global para debug desde consola del navegador
if (typeof window !== 'undefined') {
  (window as any).debugTikTok = debugTikTokAPI;
  (window as any).testTikTokThumbnail = getTikTokThumbnailValidated;
} 

/**
 * Función segura para procesar avatares específicamente para el modal de influencer profile
 * Maneja URLs malformadas y errores de encoding de manera segura
 */
export function getSafeAvatarUrlForModal(avatarUrl: string, influencerName: string = ''): string {
  // Función auxiliar para crear un nombre seguro
  const getSafeName = (name: string): string => {
    try {
      // Limpiar el nombre de caracteres problemáticos
      const cleanName = name?.replace(/[^\w\s]/gi, '')?.trim() || 'U';
      const firstChar = cleanName.charAt(0).toUpperCase();
      // Solo codificar si es un carácter válido
      return encodeURIComponent(firstChar);
    } catch (error) {
      return 'U';
    }
  };

  // Si no hay URL, devolver avatar por defecto
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    const safeName = getSafeName(influencerName);
    return `https://ui-avatars.com/api/?name=${safeName}&background=6366f1&color=fff&size=128`;
  }

  try {
    // Validar que la URL sea válida antes de procesarla
    const url = new URL(avatarUrl);
    
    // Instagram: Necesita proxy
    if (url.hostname.includes('fbcdn.net') || url.hostname.includes('cdninstagram.com') || url.hostname.includes('instagram')) {
      const safeUrl = encodeURIComponent(avatarUrl);
      const safeName = getSafeName(influencerName);
      return `https://images.weserv.nl/?url=${safeUrl}&w=128&h=128&fit=cover&a=smart&output=webp&default=https://ui-avatars.com/api/?name=${safeName}&background=6366f1&color=fff&size=128`;
    }
    
    // YouTube, TikTok: Funcionan directamente
    if (url.hostname.includes('ytimg.com') || url.hostname.includes('ggpht.com') || url.hostname.includes('googleusercontent.com') ||
        url.hostname.includes('tiktokcdn.com') || url.hostname.includes('muscdn.com')) {
      return avatarUrl;
    }
    
    // Otros: Usar proxy por seguridad
    const safeUrl = encodeURIComponent(avatarUrl);
    const safeName = getSafeName(influencerName);
    return `https://images.weserv.nl/?url=${safeUrl}&w=128&h=128&fit=cover&a=smart&output=webp&default=https://ui-avatars.com/api/?name=${safeName}&background=6366f1&color=fff&size=128`;
    
  } catch (error) {
    // Si la URL es inválida, devolver avatar por defecto
    console.warn('❌ URL de avatar inválida:', avatarUrl, error);
    const safeName = getSafeName(influencerName);
    return `https://ui-avatars.com/api/?name=${safeName}&background=6366f1&color=fff&size=128`;
  }
} 
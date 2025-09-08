/**
 * Utilidades para trabajar con URLs de Instagram
 */

/**
 * Verifica si una URL es de Instagram
 */
export function isInstagramUrl(url: string): boolean {
  if (!url) return false;
  
  const instagramPatterns = [
    // URLs directas: https://www.instagram.com/p/POST_ID
    /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+/i,
    /^https?:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+/i,
    /^https?:\/\/(www\.)?instagram\.com\/tv\/[A-Za-z0-9_-]+/i,
    // Historias: https://www.instagram.com/stories/{username}/{story_id}/
    /^https?:\/\/(www\.)?instagram\.com\/stories\/[^\/]+\/[0-9]+\/?/i,
    
    // URLs con username: https://www.instagram.com/username/p/POST_ID
    /^https?:\/\/(www\.)?instagram\.com\/[^\/]+\/p\/[A-Za-z0-9_-]+/i,
    /^https?:\/\/(www\.)?instagram\.com\/[^\/]+\/reel\/[A-Za-z0-9_-]+/i,
    /^https?:\/\/(www\.)?instagram\.com\/[^\/]+\/tv\/[A-Za-z0-9_-]+/i
  ];
  
  return instagramPatterns.some(pattern => pattern.test(url));
}

/**
 * Extrae el shortcode de una URL de Instagram
 */
export function getInstagramShortcode(url: string): string | null {
  if (!isInstagramUrl(url)) return null;
  
  const patterns = [
    /\/p\/([A-Za-z0-9_-]+)/,
    /\/reel\/([A-Za-z0-9_-]+)/,
    /\/tv\/([A-Za-z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extrae el nombre de usuario de una URL de Instagram
 */
export function getInstagramUsername(url: string): string | null {
  if (!isInstagramUrl(url)) return null;
  
  // Método 1: URLs con username como https://www.instagram.com/vaustinl/p/B3cXIshHjlZ/
  const usernameWithPostMatch = url.match(/instagram\.com\/([^\/\?]+)\/(?:p|reel|tv)\//);
  if (usernameWithPostMatch && usernameWithPostMatch[1]) {
    const username = usernameWithPostMatch[1];
    return username;
  }
  
  // Método 2: URLs directas como https://www.instagram.com/p/B3cXIshHjlZ/ - no hay username
  if (url.match(/instagram\.com\/(?:p|reel|tv)\//)) {
    return null;
  }
  
  // Método 3: Fallback general para otros formatos
  const generalMatch = url.match(/instagram\.com\/([^\/\?]+)/);
  if (generalMatch && generalMatch[1] && !['p', 'reel', 'tv'].includes(generalMatch[1])) {
    const username = generalMatch[1];
    return username;
  }
  
  return null;
}

/**
 * Obtiene una imagen por defecto para Instagram
 */
export function getInstagramDefaultThumbnail(): string {
  // Usar una imagen simple de placeholder en lugar de base64
  return 'https://via.placeholder.com/300x300/FF6B9D/FFFFFF?text=Instagram';
}

/**
 * Nueva función específica para Instagram que maneja mejor los errores de CORS
 * Esta función es independiente de getInstagramThumbnailValidated
 */
export async function getInstagramImageWithFallback(url: string): Promise<string> {
  if (!isInstagramUrl(url)) return getInstagramDefaultThumbnail();
  
  try {
    // Determinar la URL base del backend
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://catch-influencer-back.vercel.app'
      : 'http://localhost:5001';
    
    // Llamar a la API del backend
    const response = await fetch(`${backendUrl}/api/social/instagram/thumbnail?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.thumbnail) {
        return data.thumbnail;
      }
    }
  } catch (error) {
    console.error('❌ Error con backend, intentando fallbacks:', error);
  }
  
  // Fallback 1: Intentar con proxy de imágenes (más confiable)
  try {
    const shortcode = getInstagramShortcode(url);
    if (shortcode) {
      // Usar múltiples servicios de proxy para mayor confiabilidad
      const proxyServices = [
        `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=300&h=300&fit=cover`,
        `https://cors-anywhere.herokuapp.com/${url}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      ];
      
      // Devolver el primer proxy (weserv es el más confiable)
      return proxyServices[0];
    }
  } catch (error) {
    console.error('❌ Error con proxy:', error);
  }
  
  // Fallback 2: Intentar diferentes tamaños de URL directa
  try {
    const shortcode = getInstagramShortcode(url);
    if (shortcode) {
      // Probar diferentes formatos de URL de Instagram
      const possibleUrls = [
        `https://www.instagram.com/p/${shortcode}/media/?size=l`,
        `https://www.instagram.com/p/${shortcode}/media/?size=m`,
        `https://www.instagram.com/p/${shortcode}/media/?size=t`,
        `https://www.instagram.com/p/${shortcode}/media/`
      ];
      
      // Devolver la primera opción (tamaño grande)
      return possibleUrls[0];
    }
  } catch (error) {
    console.error('❌ Error con URL directa:', error);
  }
  
  // Fallback final: imagen por defecto
  return getInstagramDefaultThumbnail();
}

/**
 * Obtiene la mejor miniatura disponible para Instagram usando la API del backend
 */
export async function getInstagramThumbnailValidated(url: string): Promise<string> {
  if (!isInstagramUrl(url)) return getInstagramDefaultThumbnail();
  
  try {
    // Determinar la URL base del backend
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://catch-influencer-back.vercel.app' // URL de producción en Vercel
      : 'http://localhost:5001'; // URL local del backend
    
    // Llamar a la API del backend
    const response = await fetch(`${backendUrl}/api/social/instagram/thumbnail?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Agregar timeout manual
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.thumbnail) {
      return data.thumbnail;
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo thumbnail de Instagram desde backend:', error);
  }
  
  // Fallback: intentar usar la URL directa de Instagram
  try {
    // Si la URL ya es una URL directa de imagen, usarla
    if (url.includes('cdninstagram.com') || url.includes('fbcdn.net')) {
      return url;
    }
    
    // Si es una URL de post, intentar construir la URL de imagen
    const shortcode = getInstagramShortcode(url);
    if (shortcode) {
      // Intentar diferentes formatos de URL de imagen
      const possibleUrls = [
        `https://www.instagram.com/p/${shortcode}/media/?size=l`,
        `https://www.instagram.com/p/${shortcode}/media/?size=m`,
        `https://www.instagram.com/p/${shortcode}/media/?size=t`
      ];
      
      // Por ahora, devolver la primera opción como fallback
      return possibleUrls[0];
    }
  } catch (fallbackError) {
    console.error('❌ Error en fallback de URL directa:', fallbackError);
  }
  
  // Último fallback: imagen por defecto
  return getInstagramDefaultThumbnail();
}

/**
 * Obtiene información completa del post desde la API del backend
 */
export async function getInstagramPostInfoFromAPI(url: string): Promise<{
  id: string;
  description: string;
  author: {
    username: string;
    fullName: string;
  };
  thumbnails: string[];
  postUrl: string;
  stats: {
    likes: number;
    comments: number;
  };
} | null> {
  if (!isInstagramUrl(url)) return null;
  
  try {
    
    
    // Determinar la URL base del backend
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://catch-influencer-back.vercel.app' // URL de producción en Vercel
      : 'http://localhost:5001'; // URL local del backend
    
    const response = await fetch(`${backendUrl}/api/social/instagram/post-info?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      
      return result.data;
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Error obteniendo información completa de Instagram:', error);
    return null;
  }
}

/**
 * Función de debug para probar la API de Instagram
 */
export async function debugInstagramAPI(url: string) {
  
  
  // Probar thumbnail
  
  const thumbnail = await getInstagramThumbnailValidated(url);
  
  
  // Probar información completa
  
  const postInfo = await getInstagramPostInfoFromAPI(url);
  
  
  const result = {
    url,
    thumbnail,
    postInfo,
    success: !!thumbnail && thumbnail !== getInstagramDefaultThumbnail()
  };
  
  
  return result;
}

// Función global para debug desde consola del navegador
if (typeof window !== 'undefined') {
  (window as any).debugInstagram = debugInstagramAPI;
  (window as any).testInstagramThumbnail = getInstagramThumbnailValidated;
  
  
} 

/**
 * Obtiene avatar de Instagram procesado para evitar errores 403
 */
export async function getInstagramAvatarValidated(avatarUrl: string): Promise<string> {
  if (!avatarUrl) return getInstagramDefaultThumbnail();
  
  // Verificar si es una URL de Instagram
  if (!avatarUrl.includes('fbcdn.net') && !avatarUrl.includes('cdninstagram.com') && !avatarUrl.includes('instagram')) {
    return avatarUrl; // No es de Instagram, devolver tal como está
  }
  
  try {
    
    // Opción 1: Usar weserv.nl como proxy (más rápido y confiable para avatars)
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}&w=128&h=128&fit=cover&a=smart&output=webp&q=85`;
    
    // Validar que el proxy funcione
    try {
      const response = await fetch(proxyUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
      });
      
      if (response.ok) {
        return proxyUrl;
      }
    } catch (proxyError) {
      console.warn('⚠️ [INSTAGRAM AVATAR] Proxy weserv falló, intentando backend...');
    }
    
    // Opción 2: Usar nuestro backend como fallback
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://catch-influencer-back.vercel.app'
      : 'http://localhost:5001';
    
    const response = await fetch(`${backendUrl}/api/social/instagram/avatar-proxy?url=${encodeURIComponent(avatarUrl)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.avatarUrl) {
        return data.avatarUrl;
      }
    }
    
  } catch (error) {
    console.error('❌ [INSTAGRAM AVATAR] Error procesando avatar:', error);
  }
  
  // Fallback: Usar weserv.nl sin validación
  const fallbackProxy = `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}&w=128&h=128&fit=cover&a=smart&output=webp&default=https://ui-avatars.com/api/?name=U&background=6366f1&color=fff&size=128`;
  return fallbackProxy;
}

/**
 * Función optimizada para procesar cualquier avatar según su origen
 */
export function getOptimizedAvatarUrl(avatarUrl: string, influencerName: string = ''): string {
  if (!avatarUrl) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(influencerName?.charAt(0) || 'U')}&background=6366f1&color=fff&size=128`;
  }

  // Instagram: Necesita proxy
  if (avatarUrl.includes('fbcdn.net') || avatarUrl.includes('cdninstagram.com') || avatarUrl.includes('instagram')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}&w=128&h=128&fit=cover&a=smart&output=webp&default=https://ui-avatars.com/api/?name=${encodeURIComponent(influencerName?.charAt(0) || 'U')}&background=6366f1&color=fff&size=128`;
  }
  
  // YouTube, TikTok: Funcionan directamente
  if (avatarUrl.includes('ytimg.com') || avatarUrl.includes('ggpht.com') || avatarUrl.includes('googleusercontent.com') ||
      avatarUrl.includes('tiktokcdn.com') || avatarUrl.includes('muscdn.com')) {
    return avatarUrl;
  }
  
  // Otros: Usar proxy por seguridad
  return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}&w=128&h=128&fit=cover&a=smart&output=webp&default=https://ui-avatars.com/api/?name=${encodeURIComponent(influencerName?.charAt(0) || 'U')}&background=6366f1&color=fff&size=128`;
} 

/**
 * Función agresiva que prueba múltiples estrategias en paralelo para cargar imágenes de Instagram
 */
export async function getInstagramImageAggressive(url: string): Promise<string> {
  if (!isInstagramUrl(url)) return getInstagramDefaultThumbnail();
  
  const shortcode = getInstagramShortcode(url);
  if (!shortcode) return getInstagramDefaultThumbnail();
  
  // Crear múltiples URLs para probar en paralelo
  const strategies = [
    // Estrategia 1: Backend API
    async () => {
      try {
        const backendUrl = process.env.NODE_ENV === 'production' 
          ? 'https://catch-influencer-back.vercel.app'
          : 'http://localhost:5001';
        
        const response = await fetch(`${backendUrl}/api/social/instagram/thumbnail?url=${encodeURIComponent(url)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.thumbnail) return data.thumbnail;
        }
      } catch (error) {
        // Silenciar error, continuar con siguiente estrategia
      }
      throw new Error('Backend failed');
    },
    
    // Estrategia 2: Proxy Weserv
    async () => {
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=300&h=300&fit=cover`;
      return proxyUrl;
    },
    
    // Estrategia 3: Proxy AllOrigins
    async () => {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      return proxyUrl;
    },
    
    // Estrategia 4: URL directa grande
    async () => {
      return `https://www.instagram.com/p/${shortcode}/media/?size=l`;
    },
    
    // Estrategia 5: URL directa mediana
    async () => {
      return `https://www.instagram.com/p/${shortcode}/media/?size=m`;
    }
  ];
  
  // Probar cada estrategia en paralelo y devolver la primera que funcione
  const promises = strategies.map(async (strategy, index) => {
    try {
      const result = await strategy();
      return { success: true, result, index };
    } catch (error) {
      return { success: false, error, index };
    }
  });
  
  try {
    const results = await Promise.allSettled(promises);
    
    // Buscar la primera estrategia exitosa
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        return result.value.result;
      }
    }
  } catch (error) {
    console.error('❌ Error en estrategias paralelas:', error);
  }
  
  // Si todas fallan, devolver imagen por defecto
  return getInstagramDefaultThumbnail();
} 
/**
 * Utilidades para Twitter/X
 */

/**
 * Verifica si una URL es de Twitter/X
 */
export function isTwitterUrl(url: string): boolean {
  const twitterPatterns = [
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i,
    /^https?:\/\/mobile\.twitter\.com\/.+/i,
  ];
  
  return twitterPatterns.some(pattern => pattern.test(url));
}

/**
 * Extrae el ID del tweet de una URL de Twitter/X
 */
export function getTwitterTweetId(url: string): string | null {
  const patterns = [
    /twitter\.com\/[^\/]+\/status\/(\d+)/,
    /x\.com\/[^\/]+\/status\/(\d+)/,
    /mobile\.twitter\.com\/[^\/]+\/status\/(\d+)/,
    /twitter\.com\/i\/web\/status\/(\d+)/,
    /x\.com\/i\/web\/status\/(\d+)/
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
 * Extrae el nombre de usuario de una URL de Twitter/X
 */
export function getTwitterUsername(url: string): string | null {
  const patterns = [
    /twitter\.com\/([^\/\?]+)/,
    /x\.com\/([^\/\?]+)/,
    /mobile\.twitter\.com\/([^\/\?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && !match[1].includes('status') && match[1] !== 'i') {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Obtiene la imagen por defecto para Twitter/X
 */
export function getTwitterDefaultThumbnail(): string {
  // Imagen base64 específica para Twitter/X (logo de X)
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4LjI0NCAyLjI1SDE1LjU1M0wxMi4zNDYgOS4yNUw4Ljg0NyAyLjI1SDEuMjFMMTAuMDM2IDEzLjA0TDEuMjEgMjEuNzVIMy45MDFMNS44NTcgMTMuNTFMMTAuMDM2IDIxLjc1SDE3LjY3M0w4Ljg0NyAxMC45NkwxOC4yNDQgMi4yNVoiIGZpbGw9IiMxREE5RjIiLz4KPC9zdmc+';
}

/**
 * Genera URL de thumbnail para Twitter/X
 */
export function getTwitterThumbnail(url: string): string {
  // Usar la imagen base64 específica para Twitter/X
  return getTwitterDefaultThumbnail();
}

/**
 * Obtiene la mejor miniatura/captura disponible para Twitter usando la API del backend
 */
export async function getTwitterThumbnailValidated(url: string): Promise<string> {
  if (!isTwitterTweetUrl(url)) return getTwitterDefaultThumbnail();
  
  try {
    // Determinar la URL base del backend
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://catch-influencer-back.vercel.app' // URL de producción en Vercel
      : 'http://localhost:5001'; // URL local del backend
    
    // Llamar a la API del backend
    const response = await fetch(`${backendUrl}/api/social/twitter/thumbnail?url=${encodeURIComponent(url)}`, {
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
      // Verificar que sea una URL válida de imagen
      if (data.thumbnail.startsWith('http') || data.thumbnail.startsWith('data:')) {
        return data.thumbnail;
      }
    }
    
  } catch (error) {
    // Error silencioso al obtener thumbnail de Twitter
  }
  
  // Fallback a imagen por defecto
  return getTwitterDefaultThumbnail();
}

/**
 * Valida si una URL de Twitter/X es de un tweet específico
 */
export function isTwitterTweetUrl(url: string): boolean {
  const tweetPatterns = [
    /twitter\.com\/[^\/]+\/status\/\d+/,
    /x\.com\/[^\/]+\/status\/\d+/,
    /mobile\.twitter\.com\/[^\/]+\/status\/\d+/
  ];
  
  return tweetPatterns.some(pattern => pattern.test(url));
}

/**
 * Formatea el nombre de usuario de Twitter
 */
export function formatTwitterUsername(username: string): string {
  if (!username) return '';
  
  // Remover @ si está presente
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
  
  return `@${cleanUsername}`;
}

/**
 * Genera una URL limpia de Twitter/X
 */
export function cleanTwitterUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remover parámetros de tracking
    const paramsToRemove = ['s', 't', 'ref_src', 'ref_url'];
    paramsToRemove.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}

/**
 * Extrae información básica de una URL de Twitter
 */
export function parseTwitterUrl(url: string): {
  platform: 'twitter';
  username: string | null;
  tweetId: string | null;
  isValid: boolean;
} {
  return {
    platform: 'twitter',
    username: getTwitterUsername(url),
    tweetId: getTwitterTweetId(url),
    isValid: isTwitterUrl(url)
  };
} 

/**
 * Función de debug para probar la API de Twitter
 */
export async function debugTwitterAPI(url: string) {
  // Probar thumbnail
  const thumbnail = await getTwitterThumbnailValidated(url);
  
  const result = {
    url,
    thumbnail,
    success: !!thumbnail && thumbnail !== getTwitterDefaultThumbnail()
  };
  
  return result;
}

// Función global para debug desde consola del navegador
if (typeof window !== 'undefined') {
  (window as any).debugTwitter = debugTwitterAPI;
  (window as any).testTwitterThumbnail = getTwitterThumbnailValidated;
} 
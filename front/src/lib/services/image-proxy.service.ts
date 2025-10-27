import { httpApiClient } from '@/lib/http';

// Obtener la URL base del API desde la configuración
const backendUrl = "http://localhost:5001";

export class ImageProxyService {
  /**
   * Genera una URL del proxy para una imagen externa
   * @param imageUrl URL original de la imagen
   * @returns URL del proxy
   */
  static getProxyUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    
    // Si la imagen ya es local o del dominio de la app, no usar proxy
    if (imageUrl.startsWith('/') || imageUrl.includes(window.location.hostname)) {
      return imageUrl;
    }

    // Construir URL del proxy usando la URL base del API backend
    const proxyUrl = new URL('/api/proxy/image', backendUrl);
    proxyUrl.searchParams.set('url', imageUrl);
    
    return proxyUrl.toString();
  }

  /**
   * Obtiene una imagen a través del proxy como Blob URL
   * @param imageUrl URL original de la imagen
   * @returns Promise con la Blob URL o null si falla
   */
  static async getImageAsBlobUrl(imageUrl: string): Promise<string | null> {
    if (!imageUrl) return null;
    
    try {
      const proxyUrl = this.getProxyUrl(imageUrl);
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        console.error('Error fetching image from proxy:', response.status, response.statusText);
        return null;
      }
      
      const result = await response.json();
      
      if (result.success && result.blobUrl) {
        return result.blobUrl;
      } else {
        console.error('Proxy returned error:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error getting image as blob URL:', error);
      return null;
    }
  }

  /**
   * Obtiene una imagen a través del proxy como Data URL (mantenido para compatibilidad)
   * @param imageUrl URL original de la imagen
   * @returns Promise con la Data URL o null si falla
   */
  static async getImageAsDataUrl(imageUrl: string): Promise<string | null> {
    if (!imageUrl) return null;
    
    try {
      const proxyUrl = this.getProxyUrl(imageUrl);
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        console.error('Error fetching image from proxy:', response.status, response.statusText);
        return null;
      }
      
      const result = await response.json();
      
      if (result.success && result.blobUrl) {
        // Ahora devolvemos la URL de Blob en lugar de Data URL
        return result.blobUrl;
      } else {
        console.error('Proxy returned error:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error getting image as data URL:', error);
      return null;
    }
  }

  /**
   * Verifica si una imagen es accesible sin proxy
   * @param imageUrl URL de la imagen
   * @returns Promise con información de accesibilidad
   */
  static async checkImageAccessibility(imageUrl: string): Promise<{
    accessible: boolean;
    status: number;
    error?: string;
    contentType?: string;
    contentLength?: string;
  }> {
    try {
      const response = await httpApiClient.get<{
        accessible: boolean;
        status: number;
        error?: string;
        contentType?: string;
        contentLength?: string;
      }>(`/proxy/image/info?url=${encodeURIComponent(imageUrl)}`);

      return response.data;
    } catch (error) {
      return {
        accessible: false,
        status: 0,
        error: 'Failed to check image accessibility'
      };
    }
  }

  /**
   * Obtiene una imagen a través del proxy (mantenido para compatibilidad)
   * @param imageUrl URL original de la imagen
   * @returns Promise con la respuesta de la imagen
   */
  static async getImage(imageUrl: string): Promise<Response> {
    const proxyUrl = this.getProxyUrl(imageUrl);
    return fetch(proxyUrl);
  }

  /**
   * Aplica automáticamente el proxy a una imagen si es necesario
   * Útil para componentes de imagen que necesitan manejar automáticamente los errores 403
   * @param imageUrl URL original de la imagen
   * @param fallbackUrl URL de respaldo si el proxy también falla
   * @returns URL optimizada (Data URL del proxy o original)
   */
  static smartImageUrl(imageUrl: string, fallbackUrl?: string): string {
    if (!imageUrl) return fallbackUrl || '';

    // Lista de dominios que típicamente requieren proxy
    const requiresProxy = [
      'fbcdn.net',
      'instagram.com',
      'facebook.com',
      'tiktokcdn.com',
      'tiktok.com',
      'ytimg.com',
      'ggpht.com'
    ];

    const shouldUseProxy = requiresProxy.some(domain => imageUrl.includes(domain));

    if (shouldUseProxy) {
      // Para imágenes que requieren proxy, devolvemos la URL original
      // y el componente debe usar getImageAsDataUrl() para obtener la Data URL
      return imageUrl;
    }

    return imageUrl;
  }

  /**
   * Hook personalizado para React que maneja automáticamente la conversión a Blob URL
   * @param imageUrl URL original de la imagen
   * @returns Objeto con { dataUrl, isLoading, error }
   */
  static async useImageProxy(imageUrl: string): Promise<{
    dataUrl: string | null;
    isLoading: boolean;
    error: string | null;
  }> {
    if (!imageUrl) {
      return { dataUrl: null, isLoading: false, error: null };
    }

    // Lista de dominios que típicamente requieren proxy
    const requiresProxy = [
      'fbcdn.net',
      'instagram.com',
      'facebook.com',
      'tiktokcdn.com',
      'tiktok.com',
      'ytimg.com',
      'ggpht.com'
    ];

    const shouldUseProxy = requiresProxy.some(domain => imageUrl.includes(domain));

    if (!shouldUseProxy) {
      return { dataUrl: imageUrl, isLoading: false, error: null };
    }

    try {
      const blobUrl = await this.getImageAsBlobUrl(imageUrl);
      return { 
        dataUrl: blobUrl, 
        isLoading: false, 
        error: blobUrl ? null : 'Failed to load image' 
      };
    } catch (error) {
      return { 
        dataUrl: null, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Detecta si una URL es temporal y podría expirar
   * @param imageUrl URL a verificar
   * @returns true si es una URL temporal
   */
  static isTemporaryUrl(imageUrl: string): boolean {
    if (!imageUrl) return false;
    
    // Si ya es una URL de Blob, no es temporal
    if (imageUrl.includes('blob.vercel-storage.com')) return false;
    
    return imageUrl.includes('x-expires=') || 
           imageUrl.includes('x-signature=') ||
           imageUrl.includes('&expires=') ||
           imageUrl.includes('fbcdn.net') ||
           imageUrl.includes('tiktokcdn.com') ||
           imageUrl.includes('cdninstagram.com');
  }

  /**
   * Verifica si una URL temporal ha expirado
   * @param imageUrl URL a verificar
   * @returns true si la URL ha expirado
   */
  static isUrlExpired(imageUrl: string): boolean {
    if (!this.isTemporaryUrl(imageUrl)) return false;
    
    try {
      const url = new URL(imageUrl);
      const expiresParam = url.searchParams.get('x-expires') || url.searchParams.get('expires');
      
      if (expiresParam) {
        const expirationTime = parseInt(expiresParam) * 1000; // Convertir a milisegundos
        const currentTime = Date.now();
        return currentTime > expirationTime;
      }
    } catch (error) {
      console.error('Error checking URL expiration:', error);
    }
    
    return false;
  }

  /**
   * Convierte una URL temporal a Blob URL permanente si es necesario
   * @param imageUrl URL original
   * @returns Blob URL permanente o URL original si no necesita conversión
   */
  static async convertTemporaryUrl(imageUrl: string): Promise<string> {
    if (!imageUrl) return '';
    
    // Si ya es una URL de Blob, devolverla tal como está
    if (imageUrl.includes('blob.vercel-storage.com')) return imageUrl;
    
    // Si ya es una Data URL, devolverla tal como está
    if (imageUrl.startsWith('data:')) return imageUrl;
    
    // Si no es una URL temporal, devolverla tal como está
    if (!this.isTemporaryUrl(imageUrl)) return imageUrl;
    
    try {
      const blobUrl = await this.getImageAsBlobUrl(imageUrl);
      
      if (blobUrl) {
        return blobUrl;
      } else {
        console.warn('⚠️ No se pudo convertir URL temporal, usando original');
        return imageUrl;
      }
    } catch (error) {
      console.error('❌ Error convirtiendo URL temporal:', error);
      return imageUrl;
    }
  }
}

// Hook personalizado para React (opcional)
// Nota: Para usar este hook, importar useState y useEffect de React en el componente 
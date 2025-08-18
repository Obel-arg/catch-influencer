import { put } from "@vercel/blob";
import axios from "axios";

export class BlobStorageService {
  private static readonly BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_9F6OBManbzdwczKP_qcZ65o3cvTffQsECA0DqZq5Q1QOoKF';

  /**
   * Sube una imagen desde una URL a Vercel Blob
   * @param imageUrl URL de la imagen a subir
   * @param fileName Nombre del archivo (opcional)
   * @returns URL del blob subido
   */
  static async uploadImageFromUrl(imageUrl: string, fileName?: string): Promise<string> {
    try {

      // Headers específicos para evitar errores 403 de redes sociales
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      };

      // Headers específicos para Instagram/Facebook
      if (imageUrl.includes('instagram.com') || imageUrl.includes('fbcdn.net') || imageUrl.includes('facebook.com')) {
        headers['Referer'] = 'https://www.instagram.com/';
        headers['Origin'] = 'https://www.instagram.com';
      }

      // Headers específicos para TikTok
      if (imageUrl.includes('tiktok.com') || imageUrl.includes('tiktokcdn.com')) {
        headers['Referer'] = 'https://www.tiktok.com/';
        headers['Origin'] = 'https://www.tiktok.com';
      }

      // Headers específicos para YouTube
      if (imageUrl.includes('youtube.com') || imageUrl.includes('ytimg.com') || imageUrl.includes('ggpht.com')) {
        headers['Referer'] = 'https://www.youtube.com/';
        headers['Origin'] = 'https://www.youtube.com';
      }

      // Headers específicos para ScreenshotOne
      if (imageUrl.includes('api.screenshotone.com')) {
        headers['Referer'] = 'https://screenshotone.com/';
        headers['Origin'] = 'https://screenshotone.com';
        // ScreenshotOne puede requerir headers adicionales para evitar rate limiting
        headers['Cache-Control'] = 'no-cache';
        headers['Pragma'] = 'no-cache';
      }

      // Descargar la imagen con headers específicos
      const response = await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'arraybuffer',
        headers: headers,
        timeout: 10000, // 10 segundos timeout
        maxRedirects: 5,
        validateStatus: (status) => status < 400 // Permitir redirects
      });

      // Detectar tipo de contenido
      const contentType = response.headers['content-type'] || 'image/jpeg';
      
      // Verificar que sea una imagen válida
      if (!contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }
      
      // Generar nombre único si no se proporciona
      const timestamp = Date.now();
      const extension = this.getExtensionFromContentType(contentType);
      const finalFileName = fileName || `image-${timestamp}.${extension}`;
      
      // Subir a Vercel Blob
      const blob = await put(`influencer-posts/${finalFileName}`, response.data, {
        access: 'public',
        contentType: contentType,
        token: this.BLOB_TOKEN
      });

      return blob.url;

    } catch (error) {
      console.error('❌ Error subiendo imagen a Blob:', error);
      throw new Error(`Error uploading image to blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sube una imagen desde un buffer a Vercel Blob
   * @param imageBuffer Buffer de la imagen
   * @param contentType Tipo de contenido (ej: image/jpeg)
   * @param fileName Nombre del archivo (opcional)
   * @returns URL del blob subido
   */
  static async uploadImageFromBuffer(imageBuffer: Buffer, contentType: string, fileName?: string): Promise<string> {
    try {

      // Generar nombre único si no se proporciona
      const timestamp = Date.now();
      const extension = this.getExtensionFromContentType(contentType);
      const finalFileName = fileName || `image-${timestamp}.${extension}`;
      
      // Subir a Vercel Blob
      const blob = await put(`influencer-posts/${finalFileName}`, imageBuffer, {
        access: 'public',
        contentType: contentType,
        token: this.BLOB_TOKEN
      });

      return blob.url;

    } catch (error) {
      console.error('❌ Error subiendo buffer a Blob:', error);
      throw new Error(`Error uploading buffer to blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtiene la extensión del archivo basada en el tipo de contenido
   */
  private static getExtensionFromContentType(contentType: string): string {
    const extensionMap: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/avif': 'avif'
    };

    return extensionMap[contentType.toLowerCase()] || 'jpg';
  }

  /**
   * Verifica si una URL es una URL de Blob de Vercel
   */
  static isBlobUrl(url: string): boolean {
    return url.includes('blob.vercel-storage.com');
  }
} 
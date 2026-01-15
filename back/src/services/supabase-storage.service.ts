import { supabaseAdmin } from '../config/supabase';
import axios from 'axios';

export class SupabaseStorageService {
  private static readonly BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'post-thumbnails';

  /**
   * Sube una imagen desde una URL a Supabase Storage
   * @param imageUrl URL de la imagen a subir
   * @param fileName Nombre del archivo (opcional)
   * @returns URL pública de la imagen subida
   */
  static async uploadImageFromUrl(imageUrl: string, fileName?: string): Promise<string> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client no está configurado');
      }

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

      // Headers específicos para TikTok
      if (imageUrl.includes('tiktok.com') || imageUrl.includes('tiktokcdn.com')) {
        headers['Referer'] = 'https://www.tiktok.com/';
        headers['Origin'] = 'https://www.tiktok.com';
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
      const finalFileName = fileName || `tiktok-thumbnail-${timestamp}.${extension}`;
      
      // Convertir ArrayBuffer a Buffer
      const imageBuffer = Buffer.from(response.data);

      // Subir a Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(this.BUCKET_NAME)
        .upload(finalFileName, imageBuffer, {
          contentType: contentType,
          upsert: false // No sobrescribir si existe
        });

      if (error) {
        throw new Error(`Error uploading to Supabase Storage: ${error.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = supabaseAdmin.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(finalFileName);

      if (!urlData?.publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen');
      }

      console.log(`✅ [SUPABASE-STORAGE] Imagen subida exitosamente: ${urlData.publicUrl}`);
      return urlData.publicUrl;

    } catch (error) {
      console.error('❌ [SUPABASE-STORAGE] Error subiendo imagen:', error);
      throw new Error(`Error uploading image to Supabase Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sube una imagen desde un buffer a Supabase Storage
   * @param imageBuffer Buffer de la imagen
   * @param contentType Tipo de contenido (ej: image/jpeg)
   * @param fileName Nombre del archivo (opcional)
   * @returns URL pública de la imagen subida
   */
  static async uploadImageFromBuffer(imageBuffer: Buffer, contentType: string, fileName?: string): Promise<string> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client no está configurado');
      }

      // Generar nombre único si no se proporciona
      const timestamp = Date.now();
      const extension = this.getExtensionFromContentType(contentType);
      const finalFileName = fileName || `image-${timestamp}.${extension}`;
      
      // Subir a Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(this.BUCKET_NAME)
        .upload(finalFileName, imageBuffer, {
          contentType: contentType,
          upsert: false
        });

      if (error) {
        throw new Error(`Error uploading to Supabase Storage: ${error.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = supabaseAdmin.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(finalFileName);

      if (!urlData?.publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen');
      }

      return urlData.publicUrl;

    } catch (error) {
      console.error('❌ [SUPABASE-STORAGE] Error subiendo buffer:', error);
      throw new Error(`Error uploading buffer to Supabase Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
   * Verifica si una URL es una URL de Supabase Storage
   */
  static isSupabaseStorageUrl(url: string): boolean {
    if (!url) return false;
    // Verificar si la URL contiene el dominio de Supabase Storage
    return url.includes('supabase.co') && url.includes('/storage/v1/object/public/');
  }
}

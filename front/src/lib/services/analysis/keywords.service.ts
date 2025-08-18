import { httpApiClient } from '@/lib/http';
import { AxiosHeaders } from "axios";

export interface PostKeywords {
  post_id: string;
  keywords: string[];
}

export class KeywordsService {
  
  /**
   * 🚀 OPTIMIZACIÓN: Obtiene keywords para múltiples posts en una sola petición
   */
  static async getKeywordsByPostIds(postIds: string[]): Promise<Record<string, string[]>> {
    try {
      if (postIds.length === 0) return {};
      
      // Dividir en chunks para evitar URLs muy largas
      const chunks = [];
      const chunkSize = 20; // Máximo 20 posts por petición para evitar URLs muy largas
      for (let i = 0; i < postIds.length; i += chunkSize) {
        chunks.push(postIds.slice(i, i + chunkSize));
      }
      
      const results: Record<string, string[]> = {};
      
      // Ejecutar chunks en paralelo
      await Promise.all(chunks.map(async (chunk) => {
        try {
          const response = await httpApiClient.get<Record<string, string[]>>('/post-topics/batch/keywords', {
            params: {
              post_ids: chunk.join(',')
            },
            headers: new AxiosHeaders({
              "Content-Type": "application/json"
            })
          });
          
          // Combinar resultados
          Object.assign(results, response.data);
        } catch (error) {
          console.error('❌ Error obteniendo keywords batch para chunk:', chunk, error);
          // Continuar con otros chunks aunque uno falle
        }
      }));

      return results;
    } catch (error) {
      console.error('❌ Error en servicio de keywords batch:', error);
      return {};
    }
  }

  /**
   * Obtiene keywords para un post individual (método original)
   */
  static async getKeywordsByPostId(postId: string): Promise<string[]> {
    try {
      const response = await httpApiClient.get<{ keywords: string[] }>(`/post-topics/${postId}/keywords`);
      return response.data.keywords || [];
    } catch (error) {
      console.error(`❌ Error obteniendo keywords para post ${postId}:`, error);
      return [];
    }
  }
} 
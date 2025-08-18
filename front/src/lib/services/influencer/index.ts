import { httpApiClient } from '@/lib/http';
import { Influencer } from '@/types/influencer';
import { AxiosHeaders } from "axios";
import { withContext } from '@/lib/http/httpInterceptor';

export class InfluencerService {
  private static instance: InfluencerService;
  private readonly baseUrl = '/influencers';

  private constructor() {}

  public static getInstance(): InfluencerService {
    if (!InfluencerService.instance) {
      InfluencerService.instance = new InfluencerService();
    }
    return InfluencerService.instance;
  }

  private getToken(): string {
    // Obtener el token del localStorage o de donde se almacene
    return localStorage.getItem('token') || '';
  }

  public async getInfluencers(params?: any): Promise<any> {
    const response = await httpApiClient.get<any>(this.baseUrl, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', 'getInfluencers').headers
      })
    });
    return response.data;
  }

  public async getInfluencerById(id: string): Promise<Influencer> {
    const response = await httpApiClient.get<Influencer>(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', `getInfluencerById(${id})`).headers
      })
    });
    return response.data;
  }

  public async createInfluencer(data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409 && result.duplicate) {
          // Es un duplicado, retornar información especial
          return {
            success: false,
            duplicate: true,
            existingInfluencer: result.existingInfluencer,
            message: result.message
          };
        }
        throw new Error(result.error || 'Error al crear influencer');
      }

      return {
        success: true,
        duplicate: false,
        influencer: result.influencer,
        message: result.message
      };

    } catch (error) {
      console.error('Error en createInfluencer:', error);
      throw error;
    }
  }

  public async updateInfluencer(id: string, data: any): Promise<Influencer> {
    const response = await httpApiClient.put<Influencer>(`${this.baseUrl}/${id}`, data, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', `updateInfluencer(${id})`).headers
      })
    });
    return response.data;
  }

  public async deleteInfluencer(id: string): Promise<void> {
    const response = await httpApiClient.delete<void>(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', `deleteInfluencer(${id})`).headers
      })
    });
    return response.data;
  }

  /**
   * Actualiza los datos de un influencer desde las APIs externas
   * POST /influencers/:id/refresh
   */
  public async refreshInfluencerData(id: string): Promise<any> {
    const response = await httpApiClient.post<any>(`${this.baseUrl}/${id}/refresh`, {}, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', `refreshInfluencerData(${id})`).headers
      })
    });
    return response.data;
  }

  public async getInfluencerMetrics(id: string): Promise<any> {
    const response = await httpApiClient.get<any>(`${this.baseUrl}/${id}/metrics`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', `getInfluencerMetrics(${id})`).headers
      })
    });
    return response.data;
  }

  public async getInfluencerCampaigns(id: string): Promise<any[]> {
    const response = await httpApiClient.get<any[]>(`${this.baseUrl}/${id}/campaigns`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', `getInfluencerCampaigns(${id})`).headers
      })
    });
    return response.data;
  }

  public async searchInfluencers(query: string, params?: any): Promise<any> {
    const response = await httpApiClient.get<any>(`${this.baseUrl}/search`, {
      params: { query, ...params },
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', `searchInfluencers(${query})`).headers
      })
    });
    return response.data;
  }

  /**
   * Obtiene datos básicos de las plataformas disponibles sin guardar en BD
   * Usado para mostrar datos en el panel del influencer
   */
  public async getBasicPlatformData(params: { youtubeId?: string, instagramId?: string, tiktokId?: string }): Promise<any> {
    const { youtubeId, instagramId, tiktokId } = params;
    
    if (!youtubeId && !instagramId && !tiktokId) {
      throw new Error('Al menos un ID de plataforma es requerido');
    }

    // Construir query string con todos los IDs disponibles
    const query: string[] = [];
    
    if (youtubeId) {
      query.push(`youtubeId=${encodeURIComponent(youtubeId)}`);
    }
    if (instagramId) {
      query.push(`instagramId=${encodeURIComponent(instagramId)}`);
    }
    if (tiktokId) {
      query.push(`tiktokId=${encodeURIComponent(tiktokId)}`);
    }
    
    const queryString = query.length > 0 ? `?${query.join('&')}` : '';
    
    const response = await httpApiClient.get<any>(`${this.baseUrl}/platforms/basic-data${queryString}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', `getBasicPlatformData(${query.join(', ')})`).headers
      })
    });
    return response.data;
  }

  /**
   * Obtiene la data unificada de un influencer a partir de youtubeId, instagramId o tiktokId.
   * 🔧 NUEVA VERSIÓN: Detecta automáticamente la plataforma y usa el endpoint mejorado.
   */
  public async getFullInfluencerData(params: { youtubeId?: string, instagramId?: string, tiktokId?: string }): Promise<any> {
    const { youtubeId, instagramId, tiktokId } = params;
    
    if (!youtubeId && !instagramId && !tiktokId) {
      throw new Error('Al menos un ID de plataforma es requerido');
    }

    // 🔧 NUEVA LÓGICA: Usar el primer ID disponible como path param
    const pathParam = youtubeId || instagramId || tiktokId || 'null';
    
    // Construir query string para especificar la plataforma si tenemos múltiples IDs
    const query: string[] = [];
    
    // Si tenemos múltiples IDs, especificar cual es cual
    if (youtubeId && (instagramId || tiktokId)) {
      query.push(`youtubeId=${encodeURIComponent(youtubeId)}`);
    }
    if (instagramId && (youtubeId || tiktokId)) {
      query.push(`instagramId=${encodeURIComponent(instagramId)}`);
    }
    if (tiktokId && (youtubeId || instagramId)) {
      query.push(`tiktokId=${encodeURIComponent(tiktokId)}`);
    }
    
    const queryString = query.length > 0 ? `?${query.join('&')}` : '';
    
    const response = await httpApiClient.get<any>(`${this.baseUrl}/full/${pathParam}${queryString}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', `getFullInfluencerData(${pathParam})`).headers
      })
    });
    return response.data;
  }

  public async searchLocal(params: {
    platform?: string;
    category?: string;
    location?: string;
    minFollowers?: number;
    maxFollowers?: number;
    minEngagement?: number;
    maxEngagement?: number;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<any> {
    const response = await httpApiClient.get<any>(`${this.baseUrl}/search/local`, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerService', `searchLocal(page: ${params.page || 1})`).headers
      })
    });
    return response.data;
  }
}

export const influencerService = InfluencerService.getInstance();

// Exportar el servicio extendido
export { InfluencerExtendedService } from './influencer-extended.service';
export type { ExtendedInfluencerData, ExtendedDataStatus, ExtendedSyncRequest, ExtendedSyncResponse, ExtendedStatusResponse } from './influencer-extended.service';
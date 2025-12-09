import { httpApiClient } from '../../http';
import { Campaign, CreateCampaignDto, UpdateCampaignDto, CampaignStatus, CampaignFilters } from '@/types/campaign';
import { PaginatedResponse } from '@/types/common';
import { AxiosHeaders } from "axios";
import { withContext } from '@/lib/http/httpInterceptor';

// 🚀 CACHE GLOBAL DE DEDUPLICACIÓN: Persistente a Fast Refresh
const globalPendingRequests = (() => {
  if (typeof window !== 'undefined') {
    if (!(window as any).__campaignServicePendingRequests) {
      (window as any).__campaignServicePendingRequests = new Map();
    }
    return (window as any).__campaignServicePendingRequests;
  }
  return new Map();
})();

export class CampaignService {
  private static instance: CampaignService;
  private baseUrl = '/campaigns';
  
  private constructor() {}

  public static getInstance(): CampaignService {
    if (!CampaignService.instance) {
      CampaignService.instance = new CampaignService();
    }
    return CampaignService.instance;
  }

  // 🚀 MÉTODO AUXILIAR: Deduplicación de peticiones
  private async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Si ya hay una petición en progreso para esta clave, esperarla
    if (globalPendingRequests.has(key)) {
      try {
        const existingPromise = globalPendingRequests.get(key)!;
        
        // 🚀 TIMEOUT: No esperar más de 10 segundos por petición existente
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Existing request timeout')), 10000)
        );
        
        const result = await Promise.race([existingPromise, timeoutPromise]);
        return result;
      } catch (error) {
        // Si la petición existente falló o timeout, removerla y continuar con nueva petición
        globalPendingRequests.delete(key);
      }
    }

    // Crear nueva petición
    const promise = requestFn();
    globalPendingRequests.set(key, promise);

    try {
      const result = await promise;
      globalPendingRequests.delete(key);
      return result;
    } catch (error) {
      globalPendingRequests.delete(key);
      throw error;
    }
  }

  public async getCampaigns(filters?: CampaignFilters): Promise<Campaign[]> {
    const cacheKey = `campaigns_${JSON.stringify(filters || {})}`;
    
    return this.deduplicateRequest(cacheKey, async () => {
      // Usar el endpoint que filtra por las organizaciones del usuario
      const response = await httpApiClient.get<Campaign[]>(`${this.baseUrl}/my-campaigns`, {
        params: filters,
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext('CampaignService', 'getCampaigns').headers
        })
      });
      return response.data;
    });
  }

  public async getCampaignsWithMetrics(filters?: CampaignFilters): Promise<any[]> {
    const cacheKey = `campaigns_metrics_${JSON.stringify(filters || {})}`;
    
    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await httpApiClient.get<any[]>(`${this.baseUrl}/my-campaigns-with-metrics`, {
          params: filters,
          headers: new AxiosHeaders({
            "Content-Type": "application/json",
            ...withContext('CampaignService', 'getCampaignsWithMetrics').headers
          })
        });

        // 🚀 OPTIMIZACIÓN: Validar que los datos incluyan las métricas pre-calculadas
        const campaigns = response.data;
        if (campaigns && campaigns.length > 0) {
          const sampleCampaign = campaigns[0];
          const hasMetrics = 'influencers_count' in sampleCampaign && 
                            'posts_count' in sampleCampaign && 
                            'avg_engagement_rate' in sampleCampaign;
          
        }

        return campaigns;
      } catch (error) {
        // Solo re-lanzar el error - el interceptor ya maneja cache y deduplicación
        throw error;
      }
    });
  }

  public async getCampaignById(id: string): Promise<Campaign> {
    const cacheKey = `campaign_${id}`;
    
    return this.deduplicateRequest(cacheKey, async () => {
      const response = await httpApiClient.get<Campaign>(`${this.baseUrl}/${id}`, {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext('CampaignService', `getCampaignById(${id})`).headers
        })
      });
      const campaign = response.data;
      // Parsear goals si es string o array de strings
      if (campaign && campaign.goals) {
        if (typeof campaign.goals === 'string') {
          try {
            campaign.goals = JSON.parse(campaign.goals);
          } catch {}
        } else if (Array.isArray(campaign.goals)) {
          campaign.goals = campaign.goals.map((g: any) => {
            if (typeof g === 'string') {
              try {
                return JSON.parse(g);
              } catch {
                return null;
              }
            }
            return g;
          }).filter(Boolean);
        }
      }
      return campaign;
    });
  }

  public async createCampaign(campaign: CreateCampaignDto): Promise<Campaign> {
    const response = await httpApiClient.post<Campaign>(this.baseUrl, campaign, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', 'createCampaign').headers
      })
    });
    return response.data;
  }

  public async updateCampaign(id: string, campaign: UpdateCampaignDto): Promise<Campaign> {
    const response = await httpApiClient.put<Campaign>(`${this.baseUrl}/${id}`, campaign, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', `updateCampaign(${id})`).headers
      })
    });
    return response.data;
  }

  public async deleteCampaign(id: string): Promise<void> {
    await httpApiClient.delete(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', `deleteCampaign(${id})`).headers
      })
    });
  }

  public async addInfluencerToCampaign(campaignId: string, influencerId: string, assignedBudget: number): Promise<any> {
    const response = await httpApiClient.post<any>(`/campaign-influencers/campaign/${campaignId}`, {
      influencerId,
      assignedBudget,
    }, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', `addInfluencerToCampaign(${campaignId}, ${influencerId})`).headers
      })
    });
    return response.data;
  }

  public async removeInfluencerFromCampaign(campaignId: string, influencerId: string): Promise<void> {
    

    const url = `${this.baseUrl}/${campaignId}/influencers/${influencerId}`;
    

    try {
      const response = await httpApiClient.delete(url, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', `removeInfluencerFromCampaign(${campaignId}, ${influencerId})`).headers
      })
    });

        

    } catch (error: any) {
      
      throw error;
    }
  }

  public async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    const response = await httpApiClient.patch<Campaign>(`${this.baseUrl}/${id}/status`, { status }, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', `updateCampaignStatus(${id}, ${status})`).headers
      })
    });
    return response.data;
  }

  public async getCampaignInfluencers(campaignId: string): Promise<any[]> {
    const cacheKey = `campaign_influencers_${campaignId}`;
    
    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await httpApiClient.get<any[]>(`/campaign-influencers/campaign/${campaignId}/details`, {
          headers: new AxiosHeaders({
            "Content-Type": "application/json",
            ...withContext('CampaignService', `getCampaignInfluencers(${campaignId})`).headers
          })
        });
        
        return response.data;
      } catch (error) {
        // Solo re-lanzar el error - el interceptor ya maneja cache y deduplicación
        throw error;
      }
    });
  }

  public async checkInfluencerAssignments(campaignId: string, influencerIds: string[]): Promise<{
    alreadyAssigned: string[];
    notAssigned: string[];
  }> {
    const response = await httpApiClient.post<{
      alreadyAssigned: string[];
      notAssigned: string[];
    }>(`/campaign-influencers/campaign/${campaignId}/check-assignments`, {
      influencerIds
    }, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', `checkInfluencerAssignments(${campaignId})`).headers
      })
    });
    return response.data;
  }

  // 🎯 MÉTODOS PARA ASIGNACIÓN DE USUARIOS A CAMPAÑAS
  public async assignUsersToCampaign(campaignId: string, userIds: string[]): Promise<void> {
    await httpApiClient.post(`${this.baseUrl}/${campaignId}/assign-users`, {
      userIds
    }, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', 'assignUsersToCampaign').headers
      })
    });
  }

  public async removeUsersFromCampaign(campaignId: string, userIds: string[]): Promise<void> {
    await httpApiClient.delete(`${this.baseUrl}/${campaignId}/remove-users`, {
      data: { userIds },
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', 'removeUsersFromCampaign').headers
      })
    });
  }

  public async getCampaignMembers(campaignId: string): Promise<any[]> {
    const response = await httpApiClient.get<any[]>(`${this.baseUrl}/${campaignId}/members`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', 'getCampaignMembers').headers
      })
    });
    return response.data;
  }

  public async getUserCampaigns(userId: string): Promise<any[]> {
    const response = await httpApiClient.get<any[]>(`${this.baseUrl}/user/${userId}/campaigns`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', 'getUserCampaigns').headers
      })
    });
    return response.data;
  }

  // ==========================================
  // CAMPAIGN FAVORITES METHODS
  // ==========================================

  public async toggleFavorite(campaignId: string, currentlyFavorited: boolean): Promise<void> {
    const method = currentlyFavorited ? 'delete' : 'post';

    await httpApiClient[method](`${this.baseUrl}/${campaignId}/favorite`, undefined, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', `toggleFavorite(${campaignId})`).headers
      })
    });
  }

  public async getFavorites(): Promise<string[]> {
    const response = await httpApiClient.get<string[]>(`${this.baseUrl}/favorites/list`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignService', 'getFavorites').headers
      })
    });
    return response.data;
  }
}

export const campaignService = CampaignService.getInstance(); 
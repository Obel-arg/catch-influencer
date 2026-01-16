import { httpApiClient } from '../../http';
import { AxiosHeaders } from "axios";
import { withContext } from '@/lib/http/httpInterceptor';

// 🚀 CACHE GLOBAL DE DEDUPLICACIÓN: Persistente a Fast Refresh
const globalPendingRequests = (() => {
  if (typeof window !== 'undefined') {
    if (!(window as any).__influencerPostServicePendingRequests) {
      (window as any).__influencerPostServicePendingRequests = new Map();
    }
    return (window as any).__influencerPostServicePendingRequests;
  }
  return new Map();
})();

export interface InfluencerPost {
  id: string;
  influencer_id: string;
  campaign_id: string;
  image_url?: string;
  caption?: string;
  post_date?: string;
  likes_count?: number;
  comments_count?: number;
  performance_rating?: string;
  platform: string;
  post_url: string;
  metrics?: any;
  created_at: string;
  updated_at: string;
  post_metrics?: {
    likes_count?: number;
    comments_count?: number;
    views_count?: number;
    engagement_rate?: number;
    raw_response?: any;
  };
  post_image_urls?: {
    id: string;
    post_id: string;
    image_url: string;
    storage_provider?: string;
    created_at: string;
    updated_at: string;
  };
  influencers?: {
    id: string;
    name: string;
    avatar?: string;
    platform_info?: any;
  };
  campaigns?: {
    id: string;
    name: string;
  };
}

export interface CreateInfluencerPostDto {
  influencer_id: string;
  campaign_id: string;
  post_url: string;
  image_url?: string;
  caption?: string;
  post_date?: Date;
  platform: string;
  performance_rating?: string;
  likes_count?: number;
  comments_count?: number;
  metrics?: any;
}

export class InfluencerPostService {
  private static instance: InfluencerPostService;
  private baseUrl = '/influencer-posts';

  private constructor() {}

  public static getInstance(): InfluencerPostService {
    if (!InfluencerPostService.instance) {
      InfluencerPostService.instance = new InfluencerPostService();
    }
    return InfluencerPostService.instance;
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

  public async createPost(data: CreateInfluencerPostDto): Promise<InfluencerPost> {
    const response = await httpApiClient.post<InfluencerPost>(this.baseUrl, data, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  public async createPostWithMetrics(data: CreateInfluencerPostDto): Promise<{
    post: InfluencerPost;
    message: string;
  }> {
    const response = await httpApiClient.post<{
      success: boolean;
      message: string;
      data: InfluencerPost;
    }>(`${this.baseUrl}/with-metrics`, data, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    
    return {
      post: response.data.data,
      message: response.data.message
    };
  }

  public async getPostWithMetrics(postId: string): Promise<{
    post: InfluencerPost;
    metrics: any;
  }> {
    const response = await httpApiClient.get<{
      success: boolean;
      data: {
        post: InfluencerPost;
        metrics: any;
      };
    }>(`${this.baseUrl}/${postId}/metrics`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    
    return response.data.data;
  }

  public async refreshPostMetrics(postId: string): Promise<any> {
    const response = await httpApiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`${this.baseUrl}/${postId}/refresh-metrics`, {}, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    
    return response.data;
  }

  public async getPostById(id: string): Promise<InfluencerPost> {
    const response = await httpApiClient.get<InfluencerPost>(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  public async getPostsByCampaign(campaignId: string): Promise<InfluencerPost[]> {
    const response = await httpApiClient.get<InfluencerPost[]>(`${this.baseUrl}/campaign/${campaignId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('InfluencerPostService', `getPostsByCampaign(${campaignId})`).headers
      })
    });
    return response.data;
  }

  public async getPostsByCampaignWithMetrics(campaignId: string): Promise<any[]> {
    const cacheKey = `posts_metrics_${campaignId}`;
    
    return this.deduplicateRequest(cacheKey, async () => {
      try {
        const response = await httpApiClient.get<any[]>(`${this.baseUrl}/campaign/${campaignId}/metrics`, {
          headers: new AxiosHeaders({
            "Content-Type": "application/json",
            ...withContext('InfluencerPostService', `getPostsByCampaignWithMetrics(${campaignId})`).headers
          })
        });
        
        return response.data;
      } catch (error) {
        throw error;
      }
    });
  }

  public async getPostsByInfluencer(influencerId: string): Promise<InfluencerPost[]> {
    const response = await httpApiClient.get<InfluencerPost[]>(`${this.baseUrl}/influencer/${influencerId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  public async getPostsByCampaignAndInfluencer(campaignId: string, influencerId: string): Promise<InfluencerPost[]> {
    const response = await httpApiClient.get<InfluencerPost[]>(`${this.baseUrl}/campaign/${campaignId}/influencer/${influencerId}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  public async updatePost(id: string, postData: Partial<CreateInfluencerPostDto>): Promise<InfluencerPost> {
    const response = await httpApiClient.patch<InfluencerPost>(`${this.baseUrl}/${id}`, postData, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  public async deletePost(id: string): Promise<void> {
    await httpApiClient.delete(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }
}

export const influencerPostService = InfluencerPostService.getInstance(); 
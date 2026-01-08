import { httpApiClient } from "@/lib/http";
import { Influencer } from "@/types/influencer";
import { AxiosHeaders } from "axios";
import { withContext } from "@/lib/http/httpInterceptor";

export class InfluencerService {
  private static instance: InfluencerService;
  private readonly baseUrl = "/influencers";

  private constructor() {}

  public static getInstance(): InfluencerService {
    if (!InfluencerService.instance) {
      InfluencerService.instance = new InfluencerService();
    }
    return InfluencerService.instance;
  }

  private getToken(): string {
    // Obtener el token del localStorage o de donde se almacene
    return localStorage.getItem("token") || "";
  }

  public async getInfluencers(params?: any): Promise<any> {
    const response = await httpApiClient.get<any>(this.baseUrl, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext("InfluencerService", "getInfluencers").headers,
      }),
    });
    return response.data;
  }

  public async getInfluencerById(id: string): Promise<Influencer> {
    const response = await httpApiClient.get<Influencer>(
      `${this.baseUrl}/${id}`,
      {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext("InfluencerService", `getInfluencerById(${id})`)
            .headers,
        }),
      }
    );
    console.log("Getting influencer by id", response.data);
    return response.data;
  }

  public async createInfluencer(data: any): Promise<any> {
    try {
      const response = await httpApiClient.post<any>(
        `${this.baseUrl}/new`,
        data,
        {
          headers: new AxiosHeaders({
            "Content-Type": "application/json",
            ...withContext("InfluencerService", "createInfluencer").headers,
          }),
        }
      );
      return response.data;
    } catch (error: any) {
      // Manejar duplicado proveniente del backend
      const status = error?.response?.status;
      const dataResp = error?.response?.data || {};
      if (
        status === 409 &&
        (dataResp.duplicate || dataResp.existingInfluencer)
      ) {
        return {
          success: false,
          duplicate: true,
          existingInfluencer: dataResp.existingInfluencer,
          message: dataResp.message || "Duplicated influencer",
        };
      }
      console.error("Error en createInfluencer:", error);
      throw error;
    }
  }

  public async updateInfluencer(id: string, data: any): Promise<Influencer> {
    const response = await httpApiClient.put<Influencer>(
      `${this.baseUrl}/${id}`,
      data,
      {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext("InfluencerService", `updateInfluencer(${id})`)
            .headers,
        }),
      }
    );
    return response.data;
  }

  public async deleteInfluencer(id: string): Promise<void> {
    const response = await httpApiClient.delete<void>(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext("InfluencerService", `deleteInfluencer(${id})`).headers,
      }),
    });
    return response.data;
  }

  /**
   * Actualiza los datos de un influencer desde las APIs externas
   * POST /influencers/:id/refresh
   */
  public async refreshInfluencerData(id: string): Promise<any> {
    const response = await httpApiClient.post<any>(
      `${this.baseUrl}/${id}/refresh`,
      {},
      {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext("InfluencerService", `refreshInfluencerData(${id})`)
            .headers,
        }),
      }
    );
    return response.data;
  }

  public async getInfluencerMetrics(id: string): Promise<any> {
    const response = await httpApiClient.get<any>(
      `${this.baseUrl}/${id}/metrics`,
      {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext("InfluencerService", `getInfluencerMetrics(${id})`)
            .headers,
        }),
      }
    );
    return response.data;
  }

  public async getInfluencerCampaigns(id: string): Promise<any[]> {
    const response = await httpApiClient.get<any[]>(
      `${this.baseUrl}/${id}/campaigns`,
      {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext("InfluencerService", `getInfluencerCampaigns(${id})`)
            .headers,
        }),
      }
    );
    return response.data;
  }

  public async searchInfluencers(query: string, params?: any): Promise<any> {
    const response = await httpApiClient.get<any>(`${this.baseUrl}/search`, {
      params: { query, ...params },
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext("InfluencerService", `searchInfluencers(${query})`)
          .headers,
      }),
    });
    return response.data;
  }

  /**
   * Obtiene datos básicos de las plataformas disponibles sin guardar en BD
   * Usado para mostrar datos en el panel del influencer
   */
  public async getBasicPlatformData(params: {
    youtubeId?: string;
    instagramId?: string;
    tiktokId?: string;
  }): Promise<any> {
    const { youtubeId, instagramId, tiktokId } = params;

    if (!youtubeId && !instagramId && !tiktokId) {
      throw new Error("Al menos un ID de plataforma es requerido");
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

    const queryString = query.length > 0 ? `?${query.join("&")}` : "";

    const response = await httpApiClient.get<any>(
      `${this.baseUrl}/platforms/basic-data${queryString}`,
      {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext(
            "InfluencerService",
            `getBasicPlatformData(${query.join(", ")})`
          ).headers,
        }),
      }
    );
    return response.data;
  }

  /**
   * Obtiene la data unificada de un influencer a partir de youtubeId, instagramId o tiktokId.
   * 🔧 NUEVA VERSIÓN: Detecta automáticamente la plataforma y usa el endpoint mejorado.
   */
  public async getFullInfluencerData(params: {
    youtubeId?: string;
    instagramId?: string;
    tiktokId?: string;
  }): Promise<any> {
    const { youtubeId, instagramId, tiktokId } = params;

    if (!youtubeId && !instagramId && !tiktokId) {
      throw new Error("Al menos un ID de plataforma es requerido");
    }

    // 🔧 NUEVA LÓGICA: Usar el primer ID disponible como path param
    const pathParam = youtubeId || instagramId || tiktokId || "null";

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

    // Si tenemos un solo id, enviar a que social platform refiere
    if (youtubeId && !instagramId && !tiktokId) {
      query.push("socialPlatform=youtube");
    } else if (instagramId && !youtubeId && !tiktokId) {
      query.push("socialPlatform=instagram");
    } else if (tiktokId && !youtubeId && !instagramId) {
      query.push("socialPlatform=tiktok");
    }
    console.log("Query", query);

    const queryString = query.length > 0 ? `?${query.join("&")}` : "";

    const response = await httpApiClient.get<any>(
      `${this.baseUrl}/full/${pathParam}${queryString}`,
      {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext(
            "InfluencerService",
            `getFullInfluencerData(${pathParam})`
          ).headers,
        }),
      }
    );
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
    const response = await httpApiClient.get<any>(
      `${this.baseUrl}/search/local`,
      {
        params,
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext(
            "InfluencerService",
            `searchLocal(page: ${params.page || 1})`
          ).headers,
        }),
      }
    );
    return response.data;
  }

  /**
   * Obtiene datos sintéticos de audiencia para un influencer
   * GET /influencers/:id/audience/synthetic?username=X&follower_count=Y&platform=Z&niche=W
   *
   * @param checkOnly - If true, only check cache without generating (fast path)
   */
  public async getSyntheticAudience(
    id: string,
    influencerData?: {
      username?: string;
      follower_count?: number;
      platform?: string;
      niche?: string;
      search_context?: unknown;
    },
    checkOnly?: boolean
  ): Promise<SyntheticAudienceResponse> {
    const params: Record<string, string | number | boolean> = {};
    if (influencerData) {
      console.log("Influencer data for synthetic audience:", influencerData);
      if (influencerData.username) params.username = influencerData.username;
      if (influencerData.follower_count)
        params.follower_count = influencerData.follower_count;
      if (influencerData.platform) params.platform = influencerData.platform;
      if (influencerData.niche) params.niche = influencerData.niche;
      // Pass search context as JSON string
      if (influencerData.search_context) {
        params.search_context = JSON.stringify(influencerData.search_context);
      }
    }

    // Add check_only param for fast cache-only check
    if (checkOnly) {
      params.check_only = "true";
    }

    const response = await httpApiClient.get<SyntheticAudienceResponse>(
      `${this.baseUrl}/${id}/audience/synthetic`,
      {
        params,
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext("InfluencerService", `getSyntheticAudience(${id})`)
            .headers,
        }),
      }
    );
    return response.data;
  }
}

/**
 * Response type for synthetic audience endpoint
 */
export interface SyntheticAudienceResponse {
  success: boolean;
  audience?: {
    age?: Record<string, number>;
    gender?: { male: number; female: number };
    geography?: Array<{
      country: string;
      country_code: string;
      percentage: number;
    }>;
    bio?: string;
    username?: string;
    is_synthetic?: boolean;
  };
  description?: string;
  cached?: boolean;
  generation_required?: boolean;
  cost?: number;
  message?: string;
  platform?: string; // Platform used for this inference
}

/**
 * Normalized audience data for use in components
 * Matches the AudienceDemographics type from @/types/audience
 */
export interface NormalizedAudienceData {
  age: {
    "13-17": number;
    "18-24": number;
    "25-34": number;
    "35-44": number;
    "45-54": number;
    "55+": number;
  };
  gender: { male: number; female: number };
  geography: Array<{
    country: string;
    country_code: string;
    percentage: number;
  }>;
  is_synthetic: boolean;
  bio?: string;
  description?: string;
}

/**
 * Default age distribution when not provided
 */
const DEFAULT_AGE_DISTRIBUTION = {
  "13-17": 5,
  "18-24": 25,
  "25-34": 35,
  "35-44": 20,
  "45-54": 10,
  "55+": 5,
};

/**
 * Normalizes the audience response to ensure required fields are present
 */
export function normalizeAudienceData(
  audience: SyntheticAudienceResponse["audience"],
  description?: string
): NormalizedAudienceData | null {
  if (!audience) return null;

  // Ensure all required age brackets are present
  const normalizedAge = {
    "13-17": audience.age?.["13-17"] ?? DEFAULT_AGE_DISTRIBUTION["13-17"],
    "18-24": audience.age?.["18-24"] ?? DEFAULT_AGE_DISTRIBUTION["18-24"],
    "25-34": audience.age?.["25-34"] ?? DEFAULT_AGE_DISTRIBUTION["25-34"],
    "35-44": audience.age?.["35-44"] ?? DEFAULT_AGE_DISTRIBUTION["35-44"],
    "45-54": audience.age?.["45-54"] ?? DEFAULT_AGE_DISTRIBUTION["45-54"],
    "55+": audience.age?.["55+"] ?? DEFAULT_AGE_DISTRIBUTION["55+"],
  };

  return {
    age: normalizedAge,
    gender: audience.gender || { male: 50, female: 50 },
    geography: audience.geography || [],
    is_synthetic: audience.is_synthetic ?? true,
    bio: audience.bio,
    description,
  };
}

export const influencerService = InfluencerService.getInstance();

// Exportar el servicio extendido
export { InfluencerExtendedService } from "./influencer-extended.service";
export type {
  ExtendedInfluencerData,
  ExtendedDataStatus,
  ExtendedSyncRequest,
  ExtendedSyncResponse,
  ExtendedStatusResponse,
} from "./influencer-extended.service";

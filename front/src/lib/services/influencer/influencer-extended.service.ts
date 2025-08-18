import { httpApiClient } from '@/lib/http';

export interface ExtendedInfluencerData {
  influencer_id: string;
  creator_id: string;
  sync_status: 'pending' | 'syncing' | 'completed' | 'error';
  data_completeness_score: number;
  total_api_calls: number;
  estimated_cost: number;
  youtube_basic?: any;
  youtube_history?: any;
  youtube_detail?: any;
  youtube_email?: any;
  instagram_basic?: any;
  instagram_history?: any;
  tiktok_basic?: any;
  tiktok_history?: any;
  contact_info?: any;
  performance_metrics?: any;
  growth_trends?: any;
  engagement_analytics?: any;
  audience_demographics?: any;
  sync_errors?: any;
  last_sync_youtube?: string;
  last_sync_instagram?: string;
  last_sync_tiktok?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExtendedDataStatus {
  influencer_id: string;
  exists: boolean;
  sync_status: 'not_found' | 'pending' | 'syncing' | 'completed' | 'error';
  last_sync: {
    youtube?: string;
    instagram?: string;
    tiktok?: string;
  };
  data_completeness_score: number;
  total_api_calls: number;
  estimated_cost: number;
  sync_errors: any;
  created_at?: string;
  updated_at?: string;
}

export interface ExtendedSyncRequest {
  platforms?: ('youtube' | 'instagram' | 'tiktok')[];
}

export interface ExtendedSyncResponse {
  success: boolean;
  data: ExtendedInfluencerData;
  message: string;
}

export interface ExtendedStatusResponse {
  success: boolean;
  data: ExtendedDataStatus;
}

export class InfluencerExtendedService {
  /**
   * Lee datos extendidos existentes desde la base de datos sin hacer nuevas peticiones
   */
  static async readExistingExtendedData(youtubeId: string): Promise<ExtendedSyncResponse> {
    const url = `/influencer/extended/read/${youtubeId}`;
    const response = await httpApiClient.get<ExtendedSyncResponse>(url);
    return response.data;
  }

  /**
   * Obtiene datos extendidos de un influencer usando su creator_id (youtubeId)
   * y los IDs de otras plataformas
   * ATENCIÓN: Este método HACE PETICIONES a APIs externas
   */
  static async getExtendedData(params: {
    youtubeId: string;
    instagramId?: string;
    tiktokId?: string;
  }): Promise<ExtendedSyncResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.instagramId) {
      queryParams.append('instagramId', params.instagramId);
    }
    if (params.tiktokId) {
      queryParams.append('tiktokId', params.tiktokId);
    }
    
    const queryString = queryParams.toString();
    const url = `/influencer/full-extend/${params.youtubeId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await httpApiClient.get<ExtendedSyncResponse>(url);
    return response.data;
  }

  /**
   * Obtiene datos extendidos usando directamente el ID del influencer en la base de datos
   * SOLO LEE datos existentes, NO hace peticiones nuevas a APIs externas
   */
  static async getExtendedDataByInfluencerId(influencerId: string): Promise<ExtendedSyncResponse> {
    // Primero obtener los datos del influencer para conseguir el creator_id
    const influencerResponse = await httpApiClient.get<any>(`/influencers/${influencerId}`);
    
   
    // Los datos están directamente en response.data, no en response.data.data
    const influencer = influencerResponse.data;
    
    
    if (!influencer) {
      throw new Error(`Influencer con ID ${influencerId} no encontrado`);
    }
    
     
    if (!influencer.creator_id) {
      throw new Error('El influencer no tiene un creator_id válido');
    }
    
    // SOLO leer datos existentes - NO hacer peticiones nuevas
    return this.readExistingExtendedData(influencer.creator_id);
  }

  /**
   * Sincroniza datos extendidos usando el ID del influencer
   * ESTE MÉTODO SÍ HACE PETICIONES a APIs externas
   */
  static async syncExtendedDataByInfluencerId(influencerId: string): Promise<ExtendedSyncResponse> {
    // Primero obtener los datos del influencer para conseguir el creator_id
    const influencerResponse = await httpApiClient.get<any>(`/influencers/${influencerId}`);
    
    const influencer = influencerResponse.data;
    
    if (!influencer) {
      throw new Error(`Influencer con ID ${influencerId} no encontrado`);
    }
    
    if (!influencer.creator_id) {
      throw new Error('El influencer no tiene un creator_id válido');
    }
    
    // Extraer IDs de otras plataformas desde platform_info
    const platformInfo = influencer.platform_info || {};
    const instagramId = platformInfo.youtube?.instagramId || platformInfo.instagram?.instagramId;
    const tiktokId = platformInfo.youtube?.tiktokId || platformInfo.tiktok?.tiktokId;
    
    // HACER peticiones a APIs externas
    return this.getExtendedData({
      youtubeId: influencer.creator_id,
      instagramId,
      tiktokId
    });
  }

  /**
   * Obtiene el estado de sincronización de datos extendidos
   */
  static async getExtendedDataStatus(influencerId: string): Promise<ExtendedStatusResponse> {
    const response = await httpApiClient.get<ExtendedStatusResponse>(`/influencer/extended/status/${influencerId}`);
    return response.data;
  }

  /**
   * Re-sincroniza datos extendidos para plataformas específicas
   */
  static async resyncExtendedData(
    influencerId: string, 
    request: ExtendedSyncRequest = {}
  ): Promise<ExtendedSyncResponse> {
    const response = await httpApiClient.post<ExtendedSyncResponse>(
      `/influencer/extended/resync/${influencerId}`,
      request
    );
    return response.data;
  }

  /**
   * Verifica si un influencer necesita sincronización
   */
  static async needsSync(influencerId: string): Promise<boolean> {
    try {
      const status = await this.getExtendedDataStatus(influencerId);
      const data = status.data;
      
      // Necesita sync si:
      // 1. No existe registro extendido
      // 2. El estado es error o pending
      // 3. La completitud es muy baja
      // 4. La última sincronización fue hace más de 7 días
      
      if (!data.exists || data.sync_status === 'error' || data.sync_status === 'pending') {
        return true;
      }
      
      if (data.data_completeness_score < 50) {
        return true;
      }
      
      // Verificar si la última sincronización fue hace más de 7 días
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const lastSync = data.updated_at ? new Date(data.updated_at) : null;
      if (!lastSync || lastSync < oneWeekAgo) {
        return true;
      }
      
      return false;
    } catch (error) {
      // Si hay error obteniendo el estado, probablemente necesita sync
      return true;
    }
  }

  /**
   * Obtiene un resumen de los datos extendidos para mostrar en la UI
   */
  static async getExtendedDataSummary(influencerId: string): Promise<{
    hasExtendedData: boolean;
    completenessScore: number;
    lastSync: string | null;
    platformsWithData: string[];
    needsSync: boolean;
    totalApiCalls: number;
    estimatedCost: number;
  }> {
    try {
      const status = await this.getExtendedDataStatus(influencerId);
      const data = status.data;
      
      const platformsWithData = [];
      if (data.last_sync.youtube) platformsWithData.push('YouTube');
      if (data.last_sync.instagram) platformsWithData.push('Instagram');
      if (data.last_sync.tiktok) platformsWithData.push('TikTok');
      
      const needsSync = await this.needsSync(influencerId);
      
      return {
        hasExtendedData: data.exists,
        completenessScore: data.data_completeness_score,
        lastSync: data.updated_at || null,
        platformsWithData,
        needsSync,
        totalApiCalls: data.total_api_calls,
        estimatedCost: data.estimated_cost
      };
    } catch (error) {
      return {
        hasExtendedData: false,
        completenessScore: 0,
        lastSync: null,
        platformsWithData: [],
        needsSync: true,
        totalApiCalls: 0,
        estimatedCost: 0
      };
    }
  }
}

export default InfluencerExtendedService; 
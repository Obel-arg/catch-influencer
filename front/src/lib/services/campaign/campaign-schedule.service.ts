import { httpApiClient } from '@/lib/http';
import { withContext } from '@/lib/http/httpInterceptor';
import { AxiosHeaders } from 'axios';

export interface CampaignSchedule {
  id: string;
  campaign_id: string;
  influencer_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  scheduled_time?: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  content_type: 'post' | 'story' | 'reel' | 'video' | 'carrusel' | 'live' | 'tweet';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  objectives: Objective[];
  metrics: Record<string, any>;
  influencer_name: string;
  influencer_handle?: string;
  influencer_avatar?: string;
  content_requirements?: string;
  hashtags?: string[];
  mentions?: string[];
  location?: {
    name?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  assigned_budget: number;
  actual_cost: number;
  content_url?: string;
  media_urls?: string[];
  thumbnail_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Objective {
  id: string;
  title: string;
  target: string;
  current: string;
  status: 'completed' | 'in-progress' | 'not-started';
  percentComplete: number;
}

export interface CampaignScheduleCreateDTO {
  campaign_id: string;
  influencer_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  scheduled_time?: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  content_type: 'post' | 'story' | 'reel' | 'video' | 'carrusel' | 'live' | 'tweet';
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  objectives?: Objective[];
  influencer_name: string;
  influencer_handle?: string;
  influencer_avatar?: string;
  content_requirements?: string;
  hashtags?: string[];
  mentions?: string[];
  location?: {
    name?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  assigned_budget?: number;
  notes?: string;
}

export interface CampaignScheduleUpdateDTO extends Partial<CampaignScheduleCreateDTO> {
  metrics?: Record<string, any>;
  actual_cost?: number;
  content_url?: string;
  media_urls?: string[];
  thumbnail_url?: string;
}

export interface CampaignScheduleFilters {
  campaign_id?: string;
  influencer_id?: string;
  status?: string;
  platform?: string;
  content_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

class CampaignScheduleService {
  // Crear un nuevo contenido programado
  async createSchedule(data: CampaignScheduleCreateDTO): Promise<CampaignSchedule> {
    const response = await httpApiClient.post<CampaignSchedule>('/campaign-schedules', data, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignScheduleService', 'createSchedule').headers
      })
    });
    return response.data;
  }

  // Obtener un contenido programado por ID
  async getScheduleById(id: string): Promise<CampaignSchedule> {
    const response = await httpApiClient.get<CampaignSchedule>(`/campaign-schedules/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignScheduleService', `getScheduleById(${id})`).headers
      })
    });
    return response.data;
  }

  // Obtener todos los contenidos programados de una campaña
  async getSchedulesByCampaign(campaignId: string, filters?: CampaignScheduleFilters): Promise<CampaignSchedule[]> {
    
    
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const url = `/campaign-schedules/campaign/${campaignId}?${params.toString()}`;
    
    const response = await httpApiClient.get<any>(url, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignScheduleService', `getSchedulesByCampaign(${campaignId})`).headers
      })
    });
    
    
    // Handle the API response format: {success: true, data: Array, count: number}
    if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {

      return response.data.data;
    } else if (Array.isArray(response.data)) {
      
      return response.data;
    } else {
      
      return [];
    }
  }

  // Obtener todos los contenidos programados con filtros
  async getSchedules(filters?: CampaignScheduleFilters): Promise<CampaignSchedule[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await httpApiClient.get<CampaignSchedule[]>(`/campaign-schedules?${params.toString()}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignScheduleService', 'getSchedules').headers
      })
    });
    return response.data;
  }

  // Actualizar un contenido programado
  async updateSchedule(id: string, data: CampaignScheduleUpdateDTO): Promise<CampaignSchedule> {
    
    const response = await httpApiClient.put<CampaignSchedule>(`/campaign-schedules/${id}`, data, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignScheduleService', `updateSchedule(${id})`).headers
      })
    });
    
    
    // Check if response.data has the expected structure
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      
      return response.data.data as CampaignSchedule;
    } else {
      
    }
  }

  // Eliminar un contenido programado
  async deleteSchedule(id: string): Promise<void> {
    await httpApiClient.delete(`/campaign-schedules/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignScheduleService', `deleteSchedule(${id})`).headers
      })
    });
  }

  // Actualizar métricas de un contenido
  async updateMetrics(id: string, metrics: Record<string, any>): Promise<CampaignSchedule> {
    const response = await httpApiClient.put<CampaignSchedule>(`/campaign-schedules/${id}/metrics`, { metrics }, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignScheduleService', `updateMetrics(${id})`).headers
      })
    });
    return response.data;
  }

  // Actualizar objetivos de un contenido
  async updateObjectives(id: string, objectives: Objective[]): Promise<CampaignSchedule> {
    const response = await httpApiClient.put<CampaignSchedule>(`/campaign-schedules/${id}/objectives`, { objectives }, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignScheduleService', `updateObjectives(${id})`).headers
      })
    });
    return response.data;
  }

  // Obtener estadísticas de una campaña
  async getCampaignStats(campaignId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
  }> {
    const response = await httpApiClient.get<{
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      cancelled: number;
      overdue: number;
    }>(`/campaign-schedules/campaign/${campaignId}/stats`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json",
        ...withContext('CampaignScheduleService', `getCampaignStats(${campaignId})`).headers
      })
    });
    return response.data;
  }

  /**
   * Obtiene las métricas de posts relacionados con un contenido programado
   */
  async getPostMetricsForSchedule(scheduleId: string): Promise<any> {
    try {
      const response = await httpApiClient.get(`/campaign-schedules/${scheduleId}/post-metrics`, {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext('CampaignScheduleService', `getPostMetricsForSchedule(${scheduleId})`).headers
        })
      })
      
      return response.data
    } catch (error) {
      console.error('🔍 CampaignScheduleService: Error getting post metrics:', error)
      throw error
    }
  }

  /**
   * Obtiene las métricas de posts para múltiples contenidos programados
   */
  async getPostMetricsForSchedules(scheduleIds: string[]): Promise<any> {
    try {
      const response = await httpApiClient.post('/campaign-schedules/post-metrics/batch', {
        scheduleIds
      }, {
        headers: new AxiosHeaders({
          "Content-Type": "application/json",
          ...withContext('CampaignScheduleService', `getPostMetricsForSchedules(${scheduleIds})`).headers
        })
      })

      return response.data
    } catch (error) {
      console.error('🔍 CampaignScheduleService: Error getting batch post metrics:', error)
      throw error
    }
  }

  /**
   * Upload Excel file for bulk content scheduling
   */
  async bulkUploadSchedules(file: File, campaignId: string): Promise<BulkUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaignId', campaignId);

      const response = await httpApiClient.post<BulkUploadResult>(
        '/campaign-schedules/bulk-upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...withContext('CampaignScheduleService', 'bulkUploadSchedules').headers
          }
        }
      );

      // Handle API response format
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data as BulkUploadResult;
      }

      return response.data;
    } catch (error) {
      console.error('🔍 CampaignScheduleService: Error uploading Excel file:', error);
      throw error;
    }
  }

  /**
   * Confirm and save valid schedules from bulk upload
   */
  async confirmBulkUpload(campaignId: string, schedules: Partial<CampaignScheduleCreateDTO>[]): Promise<BulkConfirmResult> {
    try {
      const response = await httpApiClient.post<BulkConfirmResult>(
        '/campaign-schedules/bulk-upload/confirm',
        { campaignId, schedules },
        {
          headers: new AxiosHeaders({
            "Content-Type": "application/json",
            ...withContext('CampaignScheduleService', 'confirmBulkUpload').headers
          })
        }
      );

      // Handle API response format
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data as BulkConfirmResult;
      }

      return response.data;
    } catch (error) {
      console.error('🔍 CampaignScheduleService: Error confirming bulk upload:', error);
      throw error;
    }
  }
}

// Types for bulk upload
export interface ParsedScheduleItem {
  row: number;
  data: Partial<CampaignSchedule>;
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export interface BulkUploadResult {
  parsed: ParsedScheduleItem[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    validPercentage: number;
  };
}

export interface BulkConfirmResult {
  created: CampaignSchedule[];
  errors: Array<{ schedule: string; error: string }>;
}

export const campaignScheduleService = new CampaignScheduleService(); 
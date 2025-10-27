import { httpApiClient } from '@/lib/http';

export interface HypeAuditorReportRequest {
  username: string;
  features?: string;
}

export interface HypeAuditorReportResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class HypeAuditorService {
  private static instance: HypeAuditorService;

  private constructor() {}

  public static getInstance(): HypeAuditorService {
    if (!HypeAuditorService.instance) {
      HypeAuditorService.instance = new HypeAuditorService();
    }
    return HypeAuditorService.instance;
  }

  async getInstagramReport(
    username: string,
    features?: string
  ): Promise<HypeAuditorReportResponse> {
    try {

      const response = await httpApiClient.get(
        `/hypeauditor/report?username=${encodeURIComponent(username)}${features ? `&features=${encodeURIComponent(features)}` : ''}`
      );

      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ [HYPEAUDITOR FRONTEND] Error obteniendo reporte:', error);
      console.error('❌ [HYPEAUDITOR FRONTEND] Error response:', error.response?.data);
      throw new Error(`Error obteniendo reporte de HypeAuditor: ${error.response?.data?.message || error.message}`);
    }
  }

  async testConnection(): Promise<HypeAuditorReportResponse> {
    try {
      const response = await httpApiClient.get('/hypeauditor/test');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ [HYPEAUDITOR SERVICE] Error en test de conexión:', error);
      throw new Error(`Error en test de conexión: ${error.response?.data?.message || error.message}`);
    }
  }
}

export const hypeAuditorService = HypeAuditorService.getInstance();

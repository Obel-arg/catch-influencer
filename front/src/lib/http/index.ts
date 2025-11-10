import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosHeaders } from 'axios';
import { PaginationParams } from "@/types/common";
import { setupTokenInterceptors } from './tokenInterceptor';
import { setupRequestMonitoring } from './httpInterceptor';
import { getApiBaseUrl } from '../services/apiBase';

// URLs para el backend principal
const API_AUTH_BASE_URL = getApiBaseUrl().replace('/api', '/api/auth');
const API_BASE_URL = getApiBaseUrl();

export class HttpClient {
  private static instance: HttpClient;
  private httpClient: AxiosInstance;

  private constructor(baseURL: string) {
    this.httpClient = axios.create({
      baseURL: baseURL,
      headers: new AxiosHeaders({
        'Content-Type': 'application/json',
      }),
    });

    setupTokenInterceptors(this.httpClient);
    setupRequestMonitoring(this.httpClient);
  }

  public static getInstance(baseURL?: string): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient(baseURL || API_AUTH_BASE_URL);
    }
    return HttpClient.instance;
  }

  public static createInstance(baseURL: string): HttpClient {
    return new HttpClient(baseURL);
  }

  public async get<T>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.httpClient.get<T>(url, config);
  }

  public async post<T>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.httpClient.post<T>(url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.httpClient.put<T>(url, data, config);
  }

  public async patch<T>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.httpClient.patch<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.httpClient.delete<T>(url, config);
  }
}

export const httpAuthClient = HttpClient.getInstance();
export const httpApiClient = HttpClient.createInstance(API_BASE_URL);
// Export httpClient for backward compatibility
export const httpClient = httpApiClient; 
// Sistema de monitoreo de peticiones HTTP para análisis de performance
// No afecta la lógica existente, solo captura métricas

export interface RequestMetrics {
  id: string;
  url: string;
  method: string;
  timestamp: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  requestSize?: number;
  responseSize?: number;
  fromCache?: boolean;
  error?: string;
  component?: string; // Qué componente hizo la petición
  userAction?: string; // Qué acción del usuario la provocó
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  requests: RequestMetrics[];
  totalRequests: number;
  totalDuration: number;
  totalDataTransferred: number;
  cacheHitRate: number;
  avgResponseTime: number;
  errors: number;
}

class RequestMonitor {
  private static instance: RequestMonitor;
  private requests: RequestMetrics[] = [];
  private sessionId: string;
  private startTime: number;
  private listeners: ((metrics: RequestMetrics) => void)[] = [];

  private constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
  }

  public static getInstance(): RequestMonitor {
    if (!RequestMonitor.instance) {
      RequestMonitor.instance = new RequestMonitor();
    }
    return RequestMonitor.instance;
  }

  // Iniciar tracking de una petición
  public startRequest(
    url: string, 
    method: string, 
    component?: string, 
    userAction?: string,
    requestData?: any
  ): string {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const metrics: RequestMetrics = {
      id: requestId,
      url: this.cleanUrl(url),
      method: method.toUpperCase(),
      timestamp: Date.now(),
      startTime: performance.now(),
      component,
      userAction,
      requestSize: this.calculateSize(requestData)
    };

    this.requests.push(metrics);


    return requestId;
  }

  // Finalizar tracking de una petición
  public endRequest(
    requestId: string, 
    status?: number, 
    responseData?: any, 
    fromCache: boolean = false,
    error?: string
  ): void {
    const request = this.requests.find(r => r.id === requestId);
    if (!request) return;

    request.endTime = performance.now();
    request.duration = request.endTime - request.startTime;
    request.status = status;
    request.responseSize = this.calculateSize(responseData);
    request.fromCache = fromCache;
    request.error = error;

    const statusEmoji = this.getStatusEmoji(status, fromCache, error);
    //   duration: `${request.duration?.toFixed(2)}ms`,
    //   status,
    //   fromCache,
    //   size: this.formatSize(request.responseSize || 0),
    //   component: request.component,
    //   error
    // });

    // Notificar a listeners
    this.listeners.forEach(listener => listener(request));
  }

  // Agregar listener para cambios en tiempo real
  public addListener(callback: (metrics: RequestMetrics) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Obtener métricas de la sesión actual
  public getSessionMetrics(): SessionMetrics {
    const completedRequests = this.requests.filter(r => r.duration !== undefined);
    const cacheHits = completedRequests.filter(r => r.fromCache).length;
    const errors = completedRequests.filter(r => r.error || (r.status && r.status >= 400)).length;

    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      requests: [...this.requests],
      totalRequests: this.requests.length,
      totalDuration: completedRequests.reduce((sum, r) => sum + (r.duration || 0), 0),
      totalDataTransferred: completedRequests.reduce((sum, r) => sum + (r.responseSize || 0), 0),
      cacheHitRate: completedRequests.length > 0 ? (cacheHits / completedRequests.length) * 100 : 0,
      avgResponseTime: completedRequests.length > 0 
        ? completedRequests.reduce((sum, r) => sum + (r.duration || 0), 0) / completedRequests.length 
        : 0,
      errors
    };
  }

  // Exportar datos para análisis
  public exportMetrics(): string {
    const metrics = this.getSessionMetrics();
    const exportData = {
      ...metrics,
      exportedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      breakdown: this.getBreakdownAnalysis()
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Limpiar métricas
  public clearMetrics(): void {
    this.requests = [];
  }

  // Análisis detallado por tipo de operación
  private getBreakdownAnalysis() {
    const requests = this.requests.filter(r => r.duration !== undefined);
    
    const breakdown = {
      byComponent: {} as Record<string, { count: number; avgTime: number; totalSize: number }>,
      byUserAction: {} as Record<string, { count: number; avgTime: number; totalSize: number }>,
      byEndpoint: {} as Record<string, { count: number; avgTime: number; totalSize: number }>,
      timeline: requests.map(r => ({
        timestamp: r.timestamp,
        component: r.component,
        userAction: r.userAction,
        duration: r.duration,
        url: r.url
      }))
    };

    requests.forEach(req => {
      // Por componente
      if (req.component) {
        if (!breakdown.byComponent[req.component]) {
          breakdown.byComponent[req.component] = { count: 0, avgTime: 0, totalSize: 0 };
        }
        breakdown.byComponent[req.component].count++;
        breakdown.byComponent[req.component].avgTime = 
          (breakdown.byComponent[req.component].avgTime * (breakdown.byComponent[req.component].count - 1) + (req.duration || 0)) / 
          breakdown.byComponent[req.component].count;
        breakdown.byComponent[req.component].totalSize += req.responseSize || 0;
      }

      // Por acción de usuario
      if (req.userAction) {
        if (!breakdown.byUserAction[req.userAction]) {
          breakdown.byUserAction[req.userAction] = { count: 0, avgTime: 0, totalSize: 0 };
        }
        breakdown.byUserAction[req.userAction].count++;
        breakdown.byUserAction[req.userAction].avgTime = 
          (breakdown.byUserAction[req.userAction].avgTime * (breakdown.byUserAction[req.userAction].count - 1) + (req.duration || 0)) / 
          breakdown.byUserAction[req.userAction].count;
        breakdown.byUserAction[req.userAction].totalSize += req.responseSize || 0;
      }

      // Por endpoint
      const endpoint = this.extractEndpoint(req.url);
      if (!breakdown.byEndpoint[endpoint]) {
        breakdown.byEndpoint[endpoint] = { count: 0, avgTime: 0, totalSize: 0 };
      }
      breakdown.byEndpoint[endpoint].count++;
      breakdown.byEndpoint[endpoint].avgTime = 
        (breakdown.byEndpoint[endpoint].avgTime * (breakdown.byEndpoint[endpoint].count - 1) + (req.duration || 0)) / 
        breakdown.byEndpoint[endpoint].count;
      breakdown.byEndpoint[endpoint].totalSize += req.responseSize || 0;
    });

    return breakdown;
  }

  private cleanUrl(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname + urlObj.search;
    } catch {
      return url;
    }
  }

  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname.replace(/\/[^\/]+$/, '/*'); // Reemplazar IDs con *
    } catch {
      return url;
    }
  }

  private calculateSize(data: any): number {
    if (!data) return 0;
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private getStatusEmoji(status?: number, fromCache?: boolean, error?: string): string {
    if (error) return '❌';
    if (fromCache) return '⚡';
    if (!status) return '⏳';
    if (status >= 200 && status < 300) return '✅';
    if (status >= 300 && status < 400) return '↩️';
    if (status >= 400 && status < 500) return '⚠️';
    return '💥';
  }
}

export const requestMonitor = RequestMonitor.getInstance(); 
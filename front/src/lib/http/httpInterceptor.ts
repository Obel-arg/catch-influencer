// Interceptor HTTP que captura métricas automáticamente
// Se integra con el sistema existente sin modificar lógica

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { requestMonitor } from './requestMonitor';
import { cacheManager } from './cacheManager';

interface RequestWithMetrics extends InternalAxiosRequestConfig {
  _requestId?: string;
  _component?: string;
  _userAction?: string;
  _startTime?: number;
  _requestKey?: string;
  _useCache?: boolean; // Flag para controlar uso de cache
  _cachedResponse?: any; // Datos del cache cuando están disponibles
  _isFromCache?: boolean; // Flag para indicar que la respuesta viene del cache
  _serveFromCache?: boolean; // Flag para servir desde cache sin cancelar
  _abortController?: AbortController; // Para cancelación real
  _reusedPromise?: Promise<any>; // Promesa reutilizada para peticiones duplicadas
  _isReused?: boolean; // Flag para indicar que la petición fue reutilizada
  _skipProcessing?: boolean; // Flag para saltear procesamiento normal en peticiones reutilizadas
}

// Request deduplication REAL para evitar peticiones duplicadas
const activeRequests = new Map<string, {
  promise: Promise<any>;
  abortController: AbortController;
  timestamp: number;
  requestId: string;
  config: any;
}>();

function createRequestKey(url: string, method: string, params?: any): string {
  // Crear key más específica incluyendo parámetros críticos
  const paramString = params ? JSON.stringify(params) : '';
  return `${method}:${url}:${paramString}`;
}

function deduplicateRequest<T>(
  key: string, 
  requestFn: (abortSignal: AbortSignal) => Promise<T>,
  timeoutMs: number = 15000
): Promise<T> {
  // Si ya hay una petición activa, devolver esa promise
  const existing = activeRequests.get(key);
  if (existing) {
    return existing.promise as Promise<T>;
  }
  
  // Crear nuevo AbortController para esta petición
  const abortController = new AbortController();
  
  // Crear nueva petición con timeout y cancelación
  const promise = Promise.race([
    requestFn(abortController.signal),
    new Promise<never>((_, reject) => 
      setTimeout(() => {
        abortController.abort('Request timeout');
        reject(new Error(`Request timeout: ${key}`));
      }, timeoutMs)
    )
  ]);
  
  // Registrar petición activa
  activeRequests.set(key, {
    promise,
    abortController,
    timestamp: Date.now(),
    requestId: '',
    config: null
  });
  
  // Limpiar cuando termine (exitoso o con error)
  promise.finally(() => {
    activeRequests.delete(key);
  });
  
  return promise;
}

// Determinar si un endpoint debe usar cache
function shouldUseCache(url: string, method: string): boolean {
  // Solo GET requests
  if (method.toLowerCase() !== 'get') return false;
  
  // Endpoints que se benefician del cache
  const cacheableEndpoints = [
    '/creator/explorer/search',
    '/influencers/full/',
    '/influencers/search',
    '/campaigns',
    '/creator/instagram/basic',
    '/creator/tiktok/basic',
    '/creator/youtube/basic',
    '/influencer-posts/campaign/',
    '/influencer-posts/influencer/',
    '/campaign-influencers/campaign/'
  ];
  
  return cacheableEndpoints.some(endpoint => url.includes(endpoint));
}

export const setupRequestMonitoring = (axiosInstance: AxiosInstance) => {
  // Request interceptor - capturar inicio de petición con deduplicación REAL y cache
  axiosInstance.interceptors.request.use(
    (config: RequestWithMetrics) => {
      // Obtener contexto desde headers personalizados (si existen)
      const componentHeader = config.headers?.get('X-Component');
      const userActionHeader = config.headers?.get('X-User-Action');
      
      const component = typeof componentHeader === 'string' ? componentHeader : 'Unknown';
      const userAction = typeof userActionHeader === 'string' ? userActionHeader : 'Unknown';
      
      // Determinar si debe usar cache
      const useCache = shouldUseCache(config.url || '', config.method || 'GET');
      config._useCache = useCache;
      
      // Crear key para deduplicación más específica
      const requestKey = createRequestKey(
        config.url || '', 
        config.method || 'GET', 
        config.params
      );
      
      // LOGGING DE PETICIONES DUPLICADAS - Solo informar, no cancelar
      const existingRequest = activeRequests.get(requestKey);
      if (existingRequest) {
        const timeDiff = Date.now() - existingRequest.timestamp;
        
        // Solo hacer logging de peticiones simultáneas, NO cancelar
        const isExplorerSearch = config.url?.includes('/creator/explorer/search');
        const isReallySimultaneous = timeDiff < 100;
        
        if (isReallySimultaneous && !isExplorerSearch) {
        } else {
        }
        
        // Reemplazar la entrada anterior con la nueva petición - NO cancelar
        activeRequests.delete(requestKey);
      }
      
      // Verificar cache PERO NO cancelar - usar un enfoque diferente
      if (useCache && config.method?.toLowerCase() === 'get') {
        const cachedData = cacheManager.get(config.url || '', config.params);
        
        if (cachedData) {
          
          // Marcar que esta petición debe ser servida desde cache
          config._isFromCache = true;
          config._cachedResponse = cachedData;
          
          // Simular tracking para cache hit
          const requestId = requestMonitor.startRequest(
            config.url || '',
            config.method || 'GET',
            component,
            userAction,
            config.data
          );
          
          // Completar tracking inmediatamente para cache hit
          requestMonitor.endRequest(requestId, 200, cachedData, true);
          
          // Configurar adapter personalizado para esta petición
          config.adapter = (config: any) => {
            
            return Promise.resolve({
              data: config._cachedResponse,
              status: 200,
              statusText: 'OK',
              headers: {},
              config: config,
              request: {}
            });
          };
        }
      }
      
      // Limpiar headers personalizados para no enviarlos al servidor
      if (config.headers?.get('X-Component')) {
        config.headers.delete('X-Component');
      }
      if (config.headers?.get('X-User-Action')) {
        config.headers.delete('X-User-Action');
      }

      // Iniciar tracking
      const requestId = requestMonitor.startRequest(
        config.url || '',
        config.method || 'GET',
        component,
        userAction,
        config.data
      );

      // CRÍTICO: AGREGAR la petición al Map de deduplicación
      const abortController = new AbortController();
      activeRequests.set(requestKey, {
        promise: Promise.resolve(), // placeholder
        abortController,
        timestamp: Date.now(),
        requestId: requestId,
        config: config
      });
      

      // Guardar información para el response interceptor
      config._requestId = requestId;
      config._component = component;
      config._userAction = userAction;
      config._startTime = Date.now();
      config._requestKey = requestKey;

      return config;
    },
    (error: AxiosError) => {
      // Solo loggear si no es cancelación
      if (!axios.isCancel(error)) {
        console.error('❌ [HTTP INTERCEPTOR] Request error:', error);
      }
      return Promise.reject(error);
    }
  );

  // Response interceptor - capturar fin de petición, limpiar deduplicación y cache
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Validar que response existe y tiene la estructura esperada
      if (!response || !response.config) {
        console.warn('⚠️ [HTTP INTERCEPTOR] Invalid response object received');
        return response;
      }

      const config = response.config as RequestWithMetrics;
      
      // Si es una petición marcada para saltear procesamiento, no hacer nada
      if (config._skipProcessing) {
        return response;
      }
      
      // Guardar en cache si es apropiado
      if (config._useCache && config.method?.toLowerCase() === 'get' && response.data) {
        cacheManager.set(
          config.url || '',
          response.data,
          config.params
        );
      }
      
      if (config._requestId && response.status) {
        requestMonitor.endRequest(
          config._requestId,
          response.status,
          response.data,
          false // No es del cache (HTTP real)
        );
      }

      // Limpiar petición activa
      if (config._requestKey) {
        activeRequests.delete(config._requestKey);
      }

      return response;
    },
    (error: any) => {
      const config = error.config as RequestWithMetrics;
      
      // Si es una petición marcada para saltear procesamiento, solo rechazar sin procesar
      if (config?._skipProcessing) {
        return Promise.reject(error);
      }
      
      // Solo loggear errores que no sean cancelaciones y que tengan config válido
      if (!axios.isCancel(error) && config?._requestId) {
        requestMonitor.endRequest(
          config._requestId,
          error.response?.status || 0,
          error.response?.data,
          false,
          error.message || 'Unknown error'
        );
      }

      // Limpiar petición activa en caso de error
      if (config?._requestKey) {
        activeRequests.delete(config._requestKey);
      }

      return Promise.reject(error);
    }
  );
};

// Helper para agregar contexto a las peticiones HTTP
export const withContext = (component: string, userAction: string) => {
  return {
    headers: {
      'X-Component': component,
      'X-User-Action': userAction
    }
  };
};

// Wrapper para servicios que permite agregar contexto fácilmente
export const createTrackedService = <T extends object>(
  service: T,
  componentName: string
): T => {
  return new Proxy(service, {
    get(target, prop) {
      const originalMethod = target[prop as keyof T];
      
      if (typeof originalMethod === 'function') {
        return function(this: any, ...args: any[]) {
          // Intercept HTTP client calls if they exist
          const result = originalMethod.apply(this, args);
          
          // Si es una promesa (petición HTTP), podemos rastrearla
          if (result && typeof result.then === 'function') {
            const methodName = String(prop);
            
            // Intentar obtener el primer argumento como URL o contexto
            const firstArg = args[0];
            let userAction = `${componentName}.${methodName}`;
            
            if (typeof firstArg === 'string') {
              userAction = `${componentName}.${methodName}(${firstArg})`;
            } else if (firstArg && typeof firstArg === 'object') {
              userAction = `${componentName}.${methodName}(${Object.keys(firstArg).join(',')})`;
            }

          }
          
          return result;
        };
      }
      
      return originalMethod;
    }
  });
};

// Función para obtener estadísticas de deduplicación en tiempo real
export const getDeduplicationStats = () => {
  return {
    activeRequests: activeRequests.size,
    activeKeys: Array.from(activeRequests.keys()),
    oldestRequest: Math.min(...Array.from(activeRequests.values()).map(r => r.timestamp))
  };
}; 
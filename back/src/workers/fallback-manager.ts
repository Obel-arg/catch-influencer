import { PostgresCacheService } from '../services/cache/postgres-cache.service';

// Configuración de fallback
interface FallbackConfig {
  enableFallbacks: boolean;
  maxFallbackAttempts: number;
  fallbackDelay: number;
  cacheFallbackResults: boolean;
  cacheTTL: number;
}

// Estado de un servicio
interface ServiceState {
  name: string;
  isPrimary: boolean;
  isHealthy: boolean;
  lastCheck: Date;
  failureCount: number;
  successCount: number;
  avgResponseTime: number;
  lastError?: string;
}

// Resultado de un fallback
interface FallbackResult<T> {
  success: boolean;
  data?: T;
  source: string;
  responseTime: number;
  error?: string;
  isFallback: boolean;
}

// Proveedor de servicio
interface ServiceProvider<T> {
  name: string;
  priority: number;
  isAvailable: boolean;
  execute: () => Promise<T>;
  healthCheck: () => Promise<boolean>;
}

export class FallbackManager {
  private static instance: FallbackManager;
  private serviceStates = new Map<string, ServiceState>();
  private config: FallbackConfig;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private cacheService = PostgresCacheService.getInstance();

  private constructor() {
    this.config = {
      enableFallbacks: true,
      maxFallbackAttempts: 3,
      fallbackDelay: 1000,
      cacheFallbackResults: true,
      cacheTTL: 3600 // 1 hora
    };
  }

  static getInstance(): FallbackManager {
    if (!FallbackManager.instance) {
      FallbackManager.instance = new FallbackManager();
    }
    return FallbackManager.instance;
  }

  // Ejecutar con fallbacks
  async executeWithFallbacks<T>(
    serviceName: string,
    providers: ServiceProvider<T>[],
    cacheKey?: string
  ): Promise<FallbackResult<T>> {
    if (!this.config.enableFallbacks || providers.length === 0) {
      throw new Error('Fallbacks disabled or no providers available');
    }

    // Ordenar proveedores por prioridad
    const sortedProviders = providers.sort((a, b) => a.priority - b.priority);
    
    // Verificar cache primero
    if (cacheKey && this.config.cacheFallbackResults) {
      const cached = await this.getCachedResult<T>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          source: 'cache',
          responseTime: 0,
          isFallback: false
        };
      }
    }

    let lastError: Error | null = null;
    let attempts = 0;

    for (const provider of sortedProviders) {
      if (attempts >= this.config.maxFallbackAttempts) break;
      
      try {
        // Verificar salud del proveedor
        const isHealthy = await this.checkProviderHealth(provider);
        if (!isHealthy) {
          console.warn(`⚠️ [FALLBACK] Provider ${provider.name} is unhealthy, skipping`);
          continue;
        }

        const startTime = Date.now();
        const result = await provider.execute();
        const responseTime = Date.now() - startTime;

        // Actualizar estado del proveedor
        this.updateServiceState(provider.name, true, responseTime);

        // Cachear resultado si está habilitado
        if (cacheKey && this.config.cacheFallbackResults) {
          await this.cacheResult(cacheKey, result);
        }

        return {
          success: true,
          data: result,
          source: provider.name,
          responseTime,
          isFallback: attempts > 0
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        this.updateServiceState(provider.name, false, 0, lastError.message);
        
        console.warn(`⚠️ [FALLBACK] Provider ${provider.name} failed: ${lastError.message}`);
        
        attempts++;
        
        // Esperar antes del siguiente intento
        if (attempts < this.config.maxFallbackAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.fallbackDelay * attempts));
        }
      }
    }

    // Todos los proveedores fallaron
    throw new Error(`All providers failed for ${serviceName}: ${lastError?.message || 'Unknown error'}`);
  }

  // Verificar salud de un proveedor
  private async checkProviderHealth<T>(provider: ServiceProvider<T>): Promise<boolean> {
    try {
      const state = this.serviceStates.get(provider.name);
      
      // Si el proveedor ha fallado muchas veces recientemente, considerarlo no saludable
      if (state && state.failureCount > 5 && state.isHealthy === false) {
        const timeSinceLastCheck = Date.now() - state.lastCheck.getTime();
        if (timeSinceLastCheck < 300000) { // 5 minutos
          return false;
        }
      }

      return await provider.healthCheck();
    } catch (error) {
      console.error(`❌ [FALLBACK] Health check failed for ${provider.name}:`, error);
      return false;
    }
  }

  // Actualizar estado de un servicio
  private updateServiceState(serviceName: string, success: boolean, responseTime: number, error?: string): void {
    const state = this.serviceStates.get(serviceName) || {
      name: serviceName,
      isPrimary: false,
      isHealthy: true,
      lastCheck: new Date(),
      failureCount: 0,
      successCount: 0,
      avgResponseTime: 0
    };

    if (success) {
      state.successCount++;
      state.failureCount = 0;
      state.isHealthy = true;
      state.avgResponseTime = (state.avgResponseTime + responseTime) / 2;
      state.lastError = undefined;
    } else {
      state.failureCount++;
      state.successCount = 0;
      state.isHealthy = false;
      state.lastError = error;
    }

    state.lastCheck = new Date();
    this.serviceStates.set(serviceName, state);
  }

  // Obtener resultado cacheado
  private async getCachedResult<T>(cacheKey: string): Promise<T | null> {
    try {
      const cached = await this.cacheService.get<T>(`fallback:${cacheKey}`);
      return cached ? cached : null;
    } catch (error) {
      console.warn(`⚠️ [FALLBACK] Error getting cached result:`, error);
      return null;
    }
  }

  // Cachear resultado
  private async cacheResult<T>(cacheKey: string, data: T): Promise<void> {
    try {
      await this.cacheService.set(`fallback:${cacheKey}`, data, this.config.cacheTTL);
    } catch (error) {
      console.warn(`⚠️ [FALLBACK] Error caching result:`, error);
    }
  }

  // Iniciar monitoreo de salud
  startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      for (const [serviceName, state] of this.serviceStates) {
        // Resetear contadores si han pasado más de 1 hora
        const timeSinceLastCheck = Date.now() - state.lastCheck.getTime();
        if (timeSinceLastCheck > 3600000) { // 1 hora
          state.failureCount = 0;
          state.successCount = 0;
          this.serviceStates.set(serviceName, state);
        }
      }
    }, 300000); // Cada 5 minutos

  }

  // Detener monitoreo
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Obtener estado de todos los servicios
  getAllServiceStates(): Record<string, ServiceState> {
    return Object.fromEntries(this.serviceStates);
  }

  // Obtener estado de un servicio específico
  getServiceState(serviceName: string): ServiceState | undefined {
    return this.serviceStates.get(serviceName);
  }

  // Actualizar configuración
  updateConfig(updates: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Limpiar cache
  async clearCache(): Promise<void> {
    try {
      // No hay implementación para limpiar cache en PostgresCacheService
      // Esto podría necesitar ser manejado por el servicio de caché si implementa métodos de limpieza
      console.warn(`⚠️ [FALLBACK] clearCache is not implemented for PostgresCacheService. No action taken.`);
    } catch (error) {
      console.error(`❌ [FALLBACK] Error clearing cache:`, error);
    }
  }

  // Obtener estadísticas
  getStats(): {
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    totalFailures: number;
    totalSuccesses: number;
    avgResponseTime: number;
  } {
    const services = Array.from(this.serviceStates.values());
    const healthyServices = services.filter(s => s.isHealthy).length;
    const totalFailures = services.reduce((sum, s) => sum + s.failureCount, 0);
    const totalSuccesses = services.reduce((sum, s) => sum + s.successCount, 0);
    const avgResponseTime = services.length > 0 
      ? services.reduce((sum, s) => sum + s.avgResponseTime, 0) / services.length
      : 0;

    return {
      totalServices: services.length,
      healthyServices,
      unhealthyServices: services.length - healthyServices,
      totalFailures,
      totalSuccesses,
      avgResponseTime
    };
  }
} 
import { PostgresCacheService } from '../../services/cache/postgres-cache.service';

// Estado del rate limiter
interface RateLimiterState {
  lastCall: number;
  failureCount: number;
  successCount: number;
  currentInterval: number;
  baseInterval: number;
  maxInterval: number;
  minInterval: number;
  recoveryFactor: number;
  penaltyFactor: number;
}

// Configuración del rate limiter
export interface RateLimiterConfig {
  baseInterval: number; // Intervalo base en ms
  maxInterval: number; // Intervalo máximo en ms
  minInterval: number; // Intervalo mínimo en ms
  recoveryFactor: number; // Factor de recuperación (0-1)
  penaltyFactor: number; // Factor de penalización (>1)
  maxFailures: number; // Máximo de fallos antes de aumentar intervalo
  minSuccesses: number; // Mínimo de éxitos antes de reducir intervalo
  adaptiveMode: boolean; // Si está en modo adaptativo
}

// Configuración por defecto
export const DEFAULT_RATE_LIMITER_CONFIG: RateLimiterConfig = {
  baseInterval: 1000,
  maxInterval: 30000, // 30 segundos máximo
  minInterval: 100, // 100ms mínimo
  recoveryFactor: 0.8, // Reduce 20% en cada éxito
  penaltyFactor: 2.0, // Duplica en cada fallo
  maxFailures: 3, // 3 fallos antes de aumentar intervalo
  minSuccesses: 5, // 5 éxitos antes de reducir intervalo
  adaptiveMode: true
};

// Rate limiter adaptativo
export class AdaptiveRateLimiter {
  private state: RateLimiterState;
  private config: RateLimiterConfig;
  private redisKey: string;
  private cacheService = PostgresCacheService.getInstance();

  constructor(
    private serviceName: string,
    config: Partial<RateLimiterConfig> = {}
  ) {
    this.config = { ...DEFAULT_RATE_LIMITER_CONFIG, ...config };
    this.redisKey = `rate_limiter:${serviceName}`;
    
    this.state = {
      lastCall: 0,
      failureCount: 0,
      successCount: 0,
      currentInterval: this.config.baseInterval,
      baseInterval: this.config.baseInterval,
      maxInterval: this.config.maxInterval,
      minInterval: this.config.minInterval,
      recoveryFactor: this.config.recoveryFactor,
      penaltyFactor: this.config.penaltyFactor
    };
  }

  // Esperar el tiempo necesario antes de la próxima llamada
  async waitForNextCall(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.state.lastCall;
    
    if (timeSinceLastCall < this.state.currentInterval) {
      const waitTime = this.state.currentInterval - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.state.lastCall = Date.now();
  }

  // Registrar un éxito
  recordSuccess(): void {
    this.state.successCount++;
    this.state.failureCount = 0;
    
    if (this.config.adaptiveMode && this.state.successCount >= this.config.minSuccesses) {
      this.reduceInterval();
      this.state.successCount = 0;
    }
  }

  // Registrar un fallo
  recordFailure(): void {
    this.state.failureCount++;
    this.state.successCount = 0;
    
    if (this.config.adaptiveMode && this.state.failureCount >= this.config.maxFailures) {
      this.increaseInterval();
      this.state.failureCount = 0;
    }
  }

  // Aumentar intervalo (penalización)
  private increaseInterval(): void {
    const newInterval = Math.min(
      this.state.currentInterval * this.state.penaltyFactor,
      this.state.maxInterval
    );
    
    this.state.currentInterval = Math.round(newInterval);
    this.persistState();
  }

  // Reducir intervalo (recuperación)
  private reduceInterval(): void {
    const newInterval = Math.max(
      this.state.currentInterval * this.state.recoveryFactor,
      this.state.minInterval
    );
    
    this.state.currentInterval = Math.round(newInterval);
    this.persistState();
  }

  // Resetear a configuración base
  reset(): void {
    this.state.currentInterval = this.state.baseInterval;
    this.state.failureCount = 0;
    this.state.successCount = 0;
    this.persistState();
  }

  // Obtener estado actual
  getState(): RateLimiterState {
    return { ...this.state };
  }

  // Obtener intervalo actual
  getCurrentInterval(): number {
    return this.state.currentInterval;
  }

  // Verificar si está en modo de penalización
  isInPenaltyMode(): boolean {
    return this.state.currentInterval > this.state.baseInterval;
  }

  // Guardar estado en caché
  private async persistState(): Promise<void> {
    try {
      await this.cacheService.set(
        this.redisKey,
        this.state,
        3600 // 1 hora TTL
      );
    } catch (error) {
      console.warn(`⚠️ [RATE_LIMITER] Error saving state for ${this.serviceName}:`, error);
    }
  }

  // Cargar estado desde caché
  async loadState(): Promise<void> {
    try {
      const stored = await this.cacheService.get<any>(this.redisKey);
      if (stored) {
        this.state = { ...this.state, ...stored };
      }
    } catch (error) {
      console.warn(`⚠️ [RATE_LIMITER] Error loading state for ${this.serviceName}:`, error);
    }
  }

  // Actualizar configuración dinámicamente
  updateConfig(updates: Partial<RateLimiterConfig>): void {
    this.config = { ...this.config, ...updates };
    
    // Actualizar estado si es necesario
    if (updates.baseInterval !== undefined) {
      this.state.baseInterval = updates.baseInterval;
    }
    if (updates.maxInterval !== undefined) {
      this.state.maxInterval = updates.maxInterval;
    }
    if (updates.minInterval !== undefined) {
      this.state.minInterval = updates.minInterval;
    }
    if (updates.recoveryFactor !== undefined) {
      this.state.recoveryFactor = updates.recoveryFactor;
    }
    if (updates.penaltyFactor !== undefined) {
      this.state.penaltyFactor = updates.penaltyFactor;
    }
  }
}

// Factory para crear rate limiters específicos por servicio
export class RateLimiterFactory {
  private static limiters = new Map<string, AdaptiveRateLimiter>();

  static getLimiter(serviceName: string, config?: Partial<RateLimiterConfig>): AdaptiveRateLimiter {
    if (!this.limiters.has(serviceName)) {
      this.limiters.set(serviceName, new AdaptiveRateLimiter(serviceName, config));
    }
    return this.limiters.get(serviceName)!;
  }

  // Rate limiters específicos por servicio
  static getCreatorDBLimiter(): AdaptiveRateLimiter {
    return this.getLimiter('creatorDB', {
      baseInterval: 1000,
      maxInterval: 10000,
      penaltyFactor: 1.5,
      recoveryFactor: 0.9
    });
  }

  static getOpenAILimiter(): AdaptiveRateLimiter {
    return this.getLimiter('openAI', {
      baseInterval: 2000,
      maxInterval: 30000,
      penaltyFactor: 2.0,
      recoveryFactor: 0.8
    });
  }

  static getYouTubeLimiter(): AdaptiveRateLimiter {
    return this.getLimiter('youtube', {
      baseInterval: 2000,
      maxInterval: 15000,
      penaltyFactor: 1.8,
      recoveryFactor: 0.85
    });
  }

  static getTikTokLimiter(): AdaptiveRateLimiter {
    return this.getLimiter('tiktok', {
      baseInterval: 3000,
      maxInterval: 20000,
      penaltyFactor: 2.0,
      recoveryFactor: 0.8
    });
  }

  static getTwitterLimiter(): AdaptiveRateLimiter {
    return this.getLimiter('twitter', {
      baseInterval: 2500,
      maxInterval: 18000,
      penaltyFactor: 1.7,
      recoveryFactor: 0.85
    });
  }

  static getInstagramLimiter(): AdaptiveRateLimiter {
    return this.getLimiter('instagram', {
      baseInterval: 2000,
      maxInterval: 15000,
      penaltyFactor: 1.8,
      recoveryFactor: 0.85
    });
  }

  // Resetear todos los limiters
  static resetAll(): void {
    this.limiters.forEach(limiter => limiter.reset());
  }

  // Obtener estadísticas de todos los limiters
  static getAllStats(): Record<string, RateLimiterState> {
    const stats: Record<string, RateLimiterState> = {};
    this.limiters.forEach((limiter, name) => {
      stats[name] = limiter.getState();
    });
    return stats;
  }
} 
// Estado de salud de una dependencia
interface DependencyHealth {
  name: string;
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
  successCount: number;
  lastError?: string;
  uptime: number;
}

// Configuración de health check
interface HealthCheckConfig {
  checkInterval: number; // Intervalo entre checks (ms)
  timeout: number; // Timeout para cada check (ms)
  failureThreshold: number; // Fallos consecutivos antes de marcar como unhealthy
  recoveryThreshold: number; // Éxitos consecutivos antes de marcar como healthy
  criticalDependencies: string[]; // Dependencias críticas
}

// Resultado de un health check
interface HealthCheckResult {
  isHealthy: boolean;
  responseTime: number;
  error?: string;
}

export class DependencyHealthManager {
  private static instance: DependencyHealthManager;
  private healthStatus = new Map<string, DependencyHealth>();
  private config: HealthCheckConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;

  private constructor() {
    this.config = {
      checkInterval: 30000, // 30 segundos
      timeout: 10000, // 10 segundos
      failureThreshold: 3,
      recoveryThreshold: 2,
      criticalDependencies: ['creatorDB', 'openAI'] // Redis removido temporalmente
    };

    // Inicializar dependencias conocidas
    this.initializeDependencies();
  }

  static getInstance(): DependencyHealthManager {
    if (!DependencyHealthManager.instance) {
      DependencyHealthManager.instance = new DependencyHealthManager();
    }
    return DependencyHealthManager.instance;
  }

  // Inicializar dependencias conocidas
  private initializeDependencies(): void {
    const dependencies = [
      'redis',
      'creatorDB', 
      'openAI',
      'youtube',
      'tiktok',
      'twitter',
      'instagram'
    ];

    dependencies.forEach(dep => {
      this.healthStatus.set(dep, {
        name: dep,
        isHealthy: true,
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        successCount: 0,
        uptime: 0
      });
    });
  }

  // Iniciar monitoreo de dependencias
  startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.checkInterval);

  }

  // Detener monitoreo
  stopMonitoring(): void {
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

  }

  // Realizar health checks de todas las dependencias
  private async performHealthChecks(): Promise<void> {
    const checkPromises = Array.from(this.healthStatus.keys()).map(dep => 
      this.checkDependencyHealth(dep)
    );

    await Promise.allSettled(checkPromises);

    // Verificar dependencias críticas
    await this.checkCriticalDependencies();
  }

  // Verificar salud de una dependencia específica
  private async checkDependencyHealth(dependencyName: string): Promise<void> {
    const health = this.healthStatus.get(dependencyName);
    if (!health) return;

    try {
      const result = await this.performHealthCheck(dependencyName);
      
      if (result.isHealthy) {
        health.successCount++;
        health.errorCount = 0;
        
        if (health.successCount >= this.config.recoveryThreshold) {
          health.isHealthy = true;
          health.lastError = undefined;
        }
      } else {
        health.errorCount++;
        health.successCount = 0;
        health.lastError = result.error;
        
        if (health.errorCount >= this.config.failureThreshold) {
          health.isHealthy = false;
        }
      }

      health.responseTime = result.responseTime;
      health.lastCheck = new Date();
      health.uptime = health.isHealthy ? health.uptime + this.config.checkInterval : 0;

      this.healthStatus.set(dependencyName, health);

    } catch (error) {
      console.error(`❌ [HEALTH] Error checking ${dependencyName}:`, error);
      
      health.errorCount++;
      health.successCount = 0;
      health.lastError = error instanceof Error ? error.message : 'Unknown error';
      health.lastCheck = new Date();
      
      if (health.errorCount >= this.config.failureThreshold) {
        health.isHealthy = false;
      }
      
      this.healthStatus.set(dependencyName, health);
    }
  }

  // Realizar health check específico por dependencia
  private async performHealthCheck(dependencyName: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      switch (dependencyName) {
        case 'redis':
          return await this.checkRedisHealth();
        case 'creatorDB':
          return await this.checkCreatorDBHealth();
        case 'openAI':
          return await this.checkOpenAIHealth();
        case 'youtube':
          return await this.checkYouTubeHealth();
        case 'tiktok':
          return await this.checkTikTokHealth();
        case 'twitter':
          return await this.checkTwitterHealth();
        case 'instagram':
          return await this.checkInstagramHealth();
        default:
          return { isHealthy: true, responseTime: Date.now() - startTime };
      }
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Health check para Redis - TEMPORALMENTE DESHABILITADO
  private async checkRedisHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    // TEMPORAL: Redis health check deshabilitado debido a límite de requests
    // TODO: Rehabilitar cuando se complete migración a PostgreSQL
    
    return {
      isHealthy: true, // Asumir saludable para evitar alertas
      responseTime: Date.now() - startTime
    };
  }

  // Health check para CreatorDB (simulado)
  private async checkCreatorDBHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simular health check de CreatorDB
      // En producción, esto sería una llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        isHealthy: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'CreatorDB check failed'
      };
    }
  }

  // Health check para OpenAI (simulado)
  private async checkOpenAIHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simular health check de OpenAI
      // En producción, esto sería una llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        isHealthy: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'OpenAI check failed'
      };
    }
  }

  // Health check para YouTube (simulado)
  private async checkYouTubeHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simular health check de YouTube
      await new Promise(resolve => setTimeout(resolve, 150));
      
      return {
        isHealthy: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'YouTube check failed'
      };
    }
  }

  // Health check para TikTok (simulado)
  private async checkTikTokHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simular health check de TikTok
      await new Promise(resolve => setTimeout(resolve, 180));
      
      return {
        isHealthy: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'TikTok check failed'
      };
    }
  }

  // Health check para Twitter (simulado)
  private async checkTwitterHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simular health check de Twitter
      await new Promise(resolve => setTimeout(resolve, 120));
      
      return {
        isHealthy: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Twitter check failed'
      };
    }
  }

  // Health check para Instagram (simulado)
  private async checkInstagramHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simular health check de Instagram
      await new Promise(resolve => setTimeout(resolve, 160));
      
      return {
        isHealthy: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Instagram check failed'
      };
    }
  }

  // Verificar dependencias críticas
  private async checkCriticalDependencies(): Promise<void> {
    const criticalUnhealthy = this.config.criticalDependencies.filter(dep => {
      const health = this.healthStatus.get(dep);
      return health && !health.isHealthy;
    });

    if (criticalUnhealthy.length > 0) {
      console.error(`🚨 [HEALTH] Critical dependencies unhealthy: ${criticalUnhealthy.join(', ')}`);
      
      // Aquí se podría enviar una alerta real
      await this.sendCriticalDependencyAlert(criticalUnhealthy);
    }
  }

  // Enviar alerta por dependencias críticas (placeholder)
  private async sendCriticalDependencyAlert(unhealthyDeps: string[]): Promise<void> {
    // TODO: Implementar envío real de alertas
    console.warn(`🚨 [HEALTH] CRITICAL ALERT: Dependencies ${unhealthyDeps.join(', ')} are unhealthy`);
  }

  // Obtener salud de una dependencia específica
  getDependencyHealth(dependencyName: string): DependencyHealth | undefined {
    return this.healthStatus.get(dependencyName);
  }

  // Obtener salud de todas las dependencias
  getAllHealth(): Record<string, DependencyHealth> {
    return Object.fromEntries(this.healthStatus);
  }

  // Verificar si las dependencias críticas están saludables
  areCriticalDependenciesHealthy(): boolean {
    return this.config.criticalDependencies.every(dep => {
      const health = this.healthStatus.get(dep);
      return health && health.isHealthy;
    });
  }

  // Obtener dependencias no saludables
  getUnhealthyDependencies(): string[] {
    return Array.from(this.healthStatus.entries())
      .filter(([_, health]) => !health.isHealthy)
      .map(([name, _]) => name);
  }

  // Obtener estadísticas generales
  getHealthStats(): {
    totalDependencies: number;
    healthyCount: number;
    unhealthyCount: number;
    criticalUnhealthyCount: number;
    avgResponseTime: number;
  } {
    const dependencies = Array.from(this.healthStatus.values());
    const healthyCount = dependencies.filter(d => d.isHealthy).length;
    const unhealthyCount = dependencies.length - healthyCount;
    const criticalUnhealthyCount = this.config.criticalDependencies.filter(dep => {
      const health = this.healthStatus.get(dep);
      return health && !health.isHealthy;
    }).length;
    
    const avgResponseTime = dependencies.length > 0 
      ? dependencies.reduce((sum, d) => sum + d.responseTime, 0) / dependencies.length
      : 0;

    return {
      totalDependencies: dependencies.length,
      healthyCount,
      unhealthyCount,
      criticalUnhealthyCount,
      avgResponseTime
    };
  }

  // Actualizar configuración
  updateConfig(updates: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Agregar nueva dependencia para monitoreo
  addDependency(dependencyName: string): void {
    if (!this.healthStatus.has(dependencyName)) {
      this.healthStatus.set(dependencyName, {
        name: dependencyName,
        isHealthy: true,
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        successCount: 0,
        uptime: 0
      });
    }
  }

  // Remover dependencia del monitoreo
  removeDependency(dependencyName: string): void {
    if (this.healthStatus.has(dependencyName)) {
      this.healthStatus.delete(dependencyName);
    }
  }
} 
import { PostgresQueueService } from '../services/queues/postgres-queue.service';
import { createOptimizedWorker } from './base.worker';
import { WorkerConfigManager } from './config/worker-config';
import { RateLimiterFactory } from './rate-limiting/adaptive-rate-limiter';

// Estado de inicialización
interface WorkerState {
  isInitialized: boolean;
  worker: any; // PostgreSQL queue worker
  config: any;
  lastInitAttempt: number;
  initErrors: string[];
}

// Factory para workers con inicialización robusta
export class WorkerFactory {
  private static instance: WorkerFactory;
  private workerStates = new Map<string, WorkerState>();
  private configManager = WorkerConfigManager.getInstance();
  private queueService = PostgresQueueService.getInstance();

  static getInstance(): WorkerFactory {
    if (!WorkerFactory.instance) {
      WorkerFactory.instance = new WorkerFactory();
    }
    return WorkerFactory.instance;
  }

  // Inicializar worker con fallback robusto
  async initializeWorker(
    workerName: string,
    defaultConfig: any,
    processor: (job: any) => Promise<void>
  ): Promise<any> {
    const state = this.workerStates.get(workerName) || {
      isInitialized: false,
      worker: null,
      config: defaultConfig,
      lastInitAttempt: 0,
      initErrors: []
    };

    // Si ya está inicializado y es reciente, retornar el worker existente
    if (state.isInitialized && state.worker && 
        Date.now() - state.lastInitAttempt < 300000) { // 5 minutos
      return state.worker;
    }

    try {
      // Intentar cargar configuración dinámica
      let config;
      try {
        config = await this.configManager.getConfig(workerName, defaultConfig);
      } catch (configError) {
        console.warn(`⚠️ [WORKER_FACTORY] Failed to load config for ${workerName}, using default`, configError);
        config = defaultConfig;
      }

      // Validar configuración
      const validation = this.validateConfig(config);
      if (!validation.isValid) {
        throw new Error(`Invalid config for ${workerName}: ${validation.error}`);
      }

      // Cerrar worker existente si existe
      if (state.worker) {
        try {
          if (state.worker.close) {
            await state.worker.close();
          }
        } catch (closeError) {
          console.warn(`⚠️ [WORKER_FACTORY] Error closing existing worker ${workerName}:`, closeError);
        }
      }

      // Crear nuevo worker usando PostgreSQL queue
      console.log(`🔧 [WORKER_FACTORY] Creating optimized worker for: ${workerName}`);
      const worker = createOptimizedWorker(config, processor);
      console.log(`✅ [WORKER_FACTORY] Worker created for: ${workerName}`, worker ? 'SUCCESS' : 'FAILED');
      
      // Actualizar estado
      state.isInitialized = true;
      state.worker = worker;
      state.config = config;
      state.lastInitAttempt = Date.now();
      state.initErrors = [];

      this.workerStates.set(workerName, state);
      
      console.log(`✅ [WORKER_FACTORY] Worker ${workerName} fully initialized and ready`);

      return worker;

    } catch (error) {
      // Registrar error
      state.initErrors.push(`${new Date().toISOString()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      state.lastInitAttempt = Date.now();
      this.workerStates.set(workerName, state);

      console.error(`❌ [WORKER_FACTORY] Failed to initialize worker ${workerName}:`, error);

      // Si hay un worker existente, retornarlo como fallback
      if (state.worker) {
        console.warn(`⚠️ [WORKER_FACTORY] Using existing worker as fallback for ${workerName}`);
        return state.worker;
      }

      // Crear worker con configuración por defecto como último recurso
      console.warn(`⚠️ [WORKER_FACTORY] Creating worker with default config as last resort for ${workerName}`);
      const fallbackWorker = createOptimizedWorker(defaultConfig, processor);
      
      state.worker = fallbackWorker;
      state.config = defaultConfig;
      this.workerStates.set(workerName, state);
      
      return fallbackWorker;
    }
  }

  // Validar configuración
  private validateConfig(config: any): { isValid: boolean; error?: string } {
    if (!config) {
      return { isValid: false, error: 'Config is null or undefined' };
    }

    if (!config.name || typeof config.name !== 'string') {
      return { isValid: false, error: 'Invalid or missing name' };
    }

    if (!config.concurrency || config.concurrency < 1 || config.concurrency > 50) {
      return { isValid: false, error: 'Invalid concurrency (must be 1-50)' };
    }

    if (!config.timeout || config.timeout < 1000 || config.timeout > 1800000) {
      return { isValid: false, error: 'Invalid timeout (must be 1s-30m)' };
    }

    if (!config.maxRetries || config.maxRetries < 0 || config.maxRetries > 10) {
      return { isValid: false, error: 'Invalid maxRetries (must be 0-10)' };
    }

    return { isValid: true };
  }

  // Obtener estado de un worker
  getWorkerState(workerName: string): WorkerState | undefined {
    return this.workerStates.get(workerName);
  }

  // Obtener todos los estados
  getAllWorkerStates(): Record<string, WorkerState> {
    return Object.fromEntries(this.workerStates);
  }

  // Reinicializar worker específico
  async reinitializeWorker(
    workerName: string,
    defaultConfig: any,
    processor: (job: any) => Promise<void>
  ): Promise<any> {
    const state = this.workerStates.get(workerName);
    if (state) {
      state.isInitialized = false;
      this.workerStates.set(workerName, state);
    }
    
    return this.initializeWorker(workerName, defaultConfig, processor);
  }

  // Cerrar todos los workers
  async closeAllWorkers(): Promise<void> {
    const closePromises = Array.from(this.workerStates.values())
      .filter(state => state.worker)
      .map(async (state) => {
        try {
          if (state.worker.close) {
            await state.worker.close();
          }
        } catch (error) {
          console.error(`❌ [WORKER_FACTORY] Error closing worker:`, error);
        }
      });

    await Promise.allSettled(closePromises);
    this.workerStates.clear();
  }

  // Health check de todos los workers
  getHealthStatus(): Record<string, any> {
    const health: Record<string, any> = {};
    
    for (const [workerName, state] of this.workerStates) {
      health[workerName] = {
        isInitialized: state.isInitialized,
        hasWorker: !!state.worker,
        lastInitAttempt: state.lastInitAttempt,
        initErrorCount: state.initErrors.length,
        recentErrors: state.initErrors.slice(-5), // Últimos 5 errores
        config: state.config
      };
    }
    
    return health;
  }
} 
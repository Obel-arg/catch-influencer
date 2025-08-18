// Configuración base para todos los workers
export interface BaseWorkerConfig {
  name: string;
  concurrency: number;
  maxRetries: number;
  backoffDelay: number;
  timeout: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  rateLimitInterval: number;
  rateLimitMaxCalls: number;
  adaptiveRateLimit: boolean;
  memoryWarningThreshold: number;
  memoryCriticalThreshold: number;
  healthCheckInterval: number;
  metricsRetentionHours: number;
}

// Configuración específica por worker
export interface MetricsWorkerConfig extends BaseWorkerConfig {
  creatorDBTimeout: number;
  creatorDBRetryAttempts: number;
  creatorDBRateLimitInterval: number;
}

export interface SentimentWorkerConfig extends BaseWorkerConfig {
  openAITimeout: number;
  openAIMaxTokensPerMinute: number;
  openAIBatchSize: number;
  openAIRateLimitInterval: number;
}

export interface CommentFetchWorkerConfig extends BaseWorkerConfig {
  platformTimeouts: {
    youtube: number;
    tiktok: number;
    twitter: number;
    instagram: number;
  };
  platformRateLimits: {
    youtube: { interval: number; maxCalls: number };
    tiktok: { interval: number; maxCalls: number };
    twitter: { interval: number; maxCalls: number };
    instagram: { interval: number; maxCalls: number };
  };
  maxCommentsPerJob: number;
  enableSentimentAnalysis: boolean;
  enableTopicsAnalysis: boolean;
}

// Configuraciones por defecto
export const DEFAULT_BASE_CONFIG: BaseWorkerConfig = {
  name: '',
  concurrency: 3,
  maxRetries: 3,
  backoffDelay: 2000,
  timeout: 300000, // 5 minutos
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 60000, // 1 minuto
  rateLimitInterval: 1000, // 1 segundo
  rateLimitMaxCalls: 10,
  adaptiveRateLimit: true,
  memoryWarningThreshold: 1500, // MB - Ajustado para Vercel Pro
  memoryCriticalThreshold: 2500, // MB - Ajustado para Vercel Pro
  healthCheckInterval: 30000, // 30 segundos
  metricsRetentionHours: 24
};

export const DEFAULT_METRICS_CONFIG: MetricsWorkerConfig = {
  ...DEFAULT_BASE_CONFIG,
  name: 'metrics',
  concurrency: 8,
  creatorDBTimeout: 90000, // 90 segundos
  creatorDBRetryAttempts: 2,
  creatorDBRateLimitInterval: 1000 // 1 segundo
};

export const DEFAULT_SENTIMENT_CONFIG: SentimentWorkerConfig = {
  ...DEFAULT_BASE_CONFIG,
  name: 'sentiment',
  concurrency: 2,
  openAITimeout: 300000, // 5 minutos
  openAIMaxTokensPerMinute: 90000,
  openAIBatchSize: 50,
  openAIRateLimitInterval: 2000 // 2 segundos
};

export const DEFAULT_COMMENT_FETCH_CONFIG: CommentFetchWorkerConfig = {
  ...DEFAULT_BASE_CONFIG,
  name: 'comment-fetch',
  concurrency: 4,
  platformTimeouts: {
    youtube: 120000, // 2 minutos
    tiktok: 180000, // 3 minutos
    twitter: 150000, // 2.5 minutos
    instagram: 120000 // 2 minutos
  },
  platformRateLimits: {
    youtube: { interval: 2000, maxCalls: 5 },
    tiktok: { interval: 3000, maxCalls: 3 },
    twitter: { interval: 2500, maxCalls: 4 },
    instagram: { interval: 2000, maxCalls: 5 }
  },
  maxCommentsPerJob: 500,
  enableSentimentAnalysis: true,
  enableTopicsAnalysis: true
};

// Gestor de configuración dinámica
export class WorkerConfigManager {
  private static instance: WorkerConfigManager;
  private configs = new Map<string, BaseWorkerConfig>();

  static getInstance(): WorkerConfigManager {
    if (!WorkerConfigManager.instance) {
      WorkerConfigManager.instance = new WorkerConfigManager();
    }
    return WorkerConfigManager.instance;
  }

  async getConfig<T extends BaseWorkerConfig>(workerName: string, defaultConfig: T): Promise<T> {
    // Usar solo configuración local/por defecto
    if (!this.configs.has(workerName)) {
      this.configs.set(workerName, defaultConfig);
    }
    return this.configs.get(workerName) as T;
  }

  // Actualizar configuración
  async updateConfig<T extends BaseWorkerConfig>(workerName: string, newConfig: Partial<T>): Promise<void> {
    const currentConfig = this.configs.get(workerName);
    if (currentConfig) {
      const updatedConfig = { ...currentConfig, ...newConfig };
      this.configs.set(workerName, updatedConfig);
    }
  }

  // Eliminar configuración
  async deleteConfig(workerName: string): Promise<void> {
    this.configs.delete(workerName);
  }

  getMetricsConfig(): Promise<MetricsWorkerConfig> {
    return this.getConfig('metrics', DEFAULT_METRICS_CONFIG);
  }

  getSentimentConfig(): Promise<SentimentWorkerConfig> {
    return this.getConfig('sentiment', DEFAULT_SENTIMENT_CONFIG);
  }

  getCommentFetchConfig(): Promise<CommentFetchWorkerConfig> {
    return this.getConfig('comment-fetch', DEFAULT_COMMENT_FETCH_CONFIG);
  }
} 
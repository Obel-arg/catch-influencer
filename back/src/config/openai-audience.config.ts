/**
 * OpenAI Audience Inference Configuration
 *
 * Centralized configuration for OpenAI-based audience demographics inference.
 * Loads settings from environment variables with sensible defaults.
 */

import * as path from 'path';

/**
 * OpenAI API configuration
 */
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  responseFormat: { type: string };
}

/**
 * Instagram scraping configuration
 */
export interface ScrapingConfig {
  timeout: number; // Milliseconds
  retries: number;
  userAgent: string;
  headless: boolean;
  delay: number; // Delay between requests in milliseconds
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  file: string; // Path to cache file
  ttlDays: number; // Time to live in days
}

/**
 * Cost control configuration
 */
export interface CostControlConfig {
  maxCostPerDay: number; // USD
  maxCostPerInference: number; // USD
  logFile: string; // Path to cost log file
  enabled: boolean;
}

/**
 * Complete configuration object
 */
export interface OpenAIAudienceConfig {
  enabled: boolean;
  openai: OpenAIConfig;
  scraping: ScrapingConfig;
  cache: CacheConfig;
  costControl: CostControlConfig;
}

/**
 * Load and validate configuration from environment variables
 */
function loadConfig(): OpenAIAudienceConfig {
  // Validate required environment variables
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required for audience inference',
    );
  }

  const backendRoot = path.resolve(__dirname, '../..');

  return {
    enabled: process.env.OPENAI_AUDIENCE_INFERENCE_ENABLED === 'true',

    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_AUDIENCE_MODEL || 'gpt-5.1',
      temperature: parseFloat(process.env.OPENAI_AUDIENCE_TEMPERATURE || '0.3'),
      maxTokens: parseInt(process.env.OPENAI_AUDIENCE_MAX_TOKENS || '1000', 10),
      topP: parseFloat(process.env.OPENAI_AUDIENCE_TOP_P || '0.9'),
      responseFormat: { type: 'json_object' },
    },

    scraping: {
      timeout: parseInt(process.env.IG_SCRAPING_TIMEOUT || '30000', 10),
      retries: parseInt(process.env.IG_SCRAPING_RETRIES || '3', 10),
      userAgent:
        process.env.IG_SCRAPING_USER_AGENT ||
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      headless: process.env.IG_SCRAPING_HEADLESS !== 'false',
      delay: parseInt(process.env.IG_SCRAPING_DELAY || '5000', 10),
    },

    cache: {
      enabled: process.env.OPENAI_AUDIENCE_CACHE_ENABLED !== 'false',
      file:
        process.env.OPENAI_AUDIENCE_CACHE_FILE ||
        path.join(backendRoot, 'src/data/openai-audience-cache.json'),
      ttlDays: parseInt(process.env.OPENAI_AUDIENCE_CACHE_TTL_DAYS || '90', 10),
    },

    costControl: {
      enabled: process.env.OPENAI_AUDIENCE_COST_CONTROL_ENABLED !== 'false',
      maxCostPerDay: parseFloat(
        process.env.OPENAI_AUDIENCE_MAX_COST_PER_DAY || '10.00',
      ),
      maxCostPerInference: parseFloat(
        process.env.OPENAI_AUDIENCE_MAX_COST_PER_INFERENCE || '0.20',
      ),
      logFile:
        process.env.OPENAI_AUDIENCE_COST_LOG ||
        path.join(backendRoot, 'logs/openai-costs.log'),
    },
  };
}

/**
 * Singleton configuration instance
 */
let configInstance: OpenAIAudienceConfig | null = null;

/**
 * Get the configuration instance (singleton)
 */
export function getOpenAIAudienceConfig(): OpenAIAudienceConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Reset configuration (useful for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}

/**
 * Validate configuration
 */
export function validateConfig(config: OpenAIAudienceConfig): void {
  if (!config.openai.apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (config.cache.ttlDays <= 0) {
    throw new Error('Cache TTL must be positive');
  }

  if (config.costControl.maxCostPerDay <= 0) {
    throw new Error('Max cost per day must be positive');
  }

  if (config.openai.temperature < 0 || config.openai.temperature > 2) {
    throw new Error('Temperature must be between 0 and 2');
  }

  if (config.scraping.timeout <= 0) {
    throw new Error('Scraping timeout must be positive');
  }
}

/**
 * Default export
 */
export const openaiAudienceConfig = getOpenAIAudienceConfig();

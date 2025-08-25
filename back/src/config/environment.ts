import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

/**
 * Función helper para detectar automáticamente la URL del frontend
 */
function getFrontendUrl(): string {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://influencerstracker.vercel.app';
  } else {
    return 'http://localhost:3000';
  }
}

/**
 * Función helper para detectar automáticamente la URL del backend
 */
function getBackendUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    // En producción, usar siempre la URL principal
    return 'https://influencerstracker-back.vercel.app';
  } else {
    // Desarrollo local
    return 'http://localhost:5000';
  }
}

/**
 * Configuración global del entorno de la aplicación
 */
export const config = {
  // Servidor
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // URLs y endpoints
  apiPrefix: process.env.API_PREFIX || '/api',
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    dbUrl: process.env.DATABASE_URL || ''
  },
  
  // CORS - Permitir peticiones desde localhost y dominios de producción
  corsOrigins: [
    "https://influencerstracker.vercel.app",
    "https://dubbinghits.app",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [])
  ],
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // CreatorDB
  creatorDB: {
    apiKey: process.env.CREATORDB_API_KEY || '',
    baseUrl: process.env.CREATORDB_BASE_URL || 'https://dev.creatordb.app/v2',
  },
  
  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  
  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${getBackendUrl()}/api/auth/google/callback`,
  },
  
  // Slack Configuration
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    feedbackChannel: process.env.SLACK_FEEDBACK_CHANNEL || '#general',
  },
  
  // URLs automáticas
  urls: {
    frontend: getFrontendUrl(),
    backend: getBackendUrl(),
  },
  
  // Frontend URL para enlaces
  frontendUrl: getFrontendUrl(),
};

export default config; 
import { Request, Response } from 'express';
import supabase, { supabaseAdmin } from '../../config/supabase';
import config from '../../config/environment';
import { createClient } from '@supabase/supabase-js';

interface ConnectionTestResult {
  service: string;
  status: 'ok' | 'error' | 'warning';
  message: string;
  details?: any;
  responseTime?: number;
}

export const testAllConnections = async (req: Request, res: Response) => {
  const results: ConnectionTestResult[] = [];
  const startTime = Date.now();

  // 1. Test Supabase Connection (Anon)
  try {
    const anonStart = Date.now();
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    results.push({
      service: 'Supabase (Anon Client)',
      status: error ? 'error' : 'ok',
      message: error ? `Error: ${error.message}` : 'Conexión exitosa',
      details: { 
        url: config.supabase.url,
        hasAnonKey: !!config.supabase.anonKey,
        recordsFound: data?.length || 0
      },
      responseTime: Date.now() - anonStart
    });
  } catch (error: any) {
    results.push({
      service: 'Supabase (Anon Client)',
      status: 'error',
      message: `Error de conexión: ${error.message}`,
      details: { url: config.supabase.url },
      responseTime: Date.now() - startTime
    });
  }

  // 2. Test Supabase Admin Connection
  if (supabaseAdmin) {
    const adminStart = Date.now();
    try {
      const { data, error } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .limit(1);

      results.push({
        service: 'Supabase (Admin Client)',
        status: error ? 'error' : 'ok',
        message: error ? `Error: ${error.message}` : 'Conexión admin exitosa',
        details: {
          hasServiceKey: !!config.supabase.serviceKey,
          recordsFound: data?.length || 0
        },
        responseTime: Date.now() - adminStart
      });
    } catch (error: any) {
      results.push({
        service: 'Supabase (Admin Client)',
        status: 'error',
        message: `Error de conexión admin: ${error.message}`,
        responseTime: Date.now() - adminStart
      });
    }
  } else {
    results.push({
      service: 'Supabase (Admin Client)',
      status: 'warning',
      message: 'Service key no configurada',
      details: { hasServiceKey: false }
    });
  }

  // 3. Test Database Connection (Raw)
  const dbStart = Date.now();
  try {
    const dbClient = createClient(config.supabase.url || '', config.supabase.anonKey || '');
    const { data, error } = await dbClient.rpc('version');

    results.push({
      service: 'Database (Raw)',
      status: error ? 'error' : 'ok',
      message: error ? `Error: ${error.message}` : 'Base de datos accesible',
      details: {
        dbUrl: 'Configurada',
        version: data || 'Unknown'
      },
      responseTime: Date.now() - dbStart
    });
  } catch (error: any) {
    results.push({
      service: 'Database (Raw)',
      status: 'error',
      message: `Error de base de datos: ${error.message}`,
      responseTime: Date.now() - dbStart
    });
  }

  // 4. Test Redis/KV Connection
  const kvStart = Date.now();
  try {
    // Verificar si las variables de Redis están configuradas
    const hasKvConfig = !!(process.env.KV_URL);

    results.push({
      service: 'Redis/KV Store',
      status: hasKvConfig ? 'ok' : 'warning',
      message: hasKvConfig ? 'Configuración de Redis encontrada' : 'Redis no configurado',
      details: {
        hasKvUrl: !!process.env.KV_URL,
        hasRestApi: !!process.env.KV_REST_API_URL
      },
      responseTime: Date.now() - kvStart
    });
  } catch (error: any) {
    results.push({
      service: 'Redis/KV Store',
      status: 'error',
      message: `Error de Redis: ${error.message}`,
      responseTime: Date.now() - kvStart
    });
  }

  // 5. Test External APIs
  const externalApis = [
    { name: 'YouTube API', key: process.env.YOUTUBE_API_KEY, env: 'YOUTUBE_API_KEY' },
    { name: 'CreatorDB API', key: process.env.CREATORDB_API_KEY, env: 'CREATORDB_API_KEY' },
    { name: 'OpenAI API', key: process.env.OPENAI_API_KEY, env: 'OPENAI_API_KEY' },
    { name: 'Apify API', key: process.env.APIFY_API_TOKEN, env: 'APIFY_API_TOKEN' }
  ];

  externalApis.forEach(api => {
    results.push({
      service: api.name,
      status: api.key ? 'ok' : 'warning',
      message: api.key ? 'API Key configurada' : `${api.env} no configurada`,
      details: { hasKey: !!api.key, keyLength: api.key?.length || 0 }
    });
  });

  // 6. Test Environment Variables
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  results.push({
    service: 'Environment Variables',
    status: missingVars.length === 0 ? 'ok' : 'error',
    message: missingVars.length === 0 
      ? 'Todas las variables requeridas están configuradas' 
      : `Variables faltantes: ${missingVars.join(', ')}`,
    details: { 
      total: requiredEnvVars.length,
      configured: requiredEnvVars.length - missingVars.length,
      missing: missingVars
    }
  });

  // Resumen general
  const totalTime = Date.now() - startTime;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const successCount = results.filter(r => r.status === 'ok').length;

  const overallStatus = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'ok';

  res.status(overallStatus === 'error' ? 500 : 200).json({
    status: overallStatus,
    message: `Test completado: ${successCount} éxitos, ${warningCount} advertencias, ${errorCount} errores`,
    summary: {
      total: results.length,
      success: successCount,
      warnings: warningCount,
      errors: errorCount,
      totalTime: `${totalTime}ms`
    },
    environment: {
      nodeEnv: config.nodeEnv,
      port: config.port,
      apiPrefix: config.apiPrefix,
      timestamp: new Date().toISOString()
    },
    connections: results
  });
};

export const testSpecificConnection = async (req: Request, res: Response) => {
  const { service } = req.params;
  
  switch (service.toLowerCase()) {
    case 'supabase':
      try {
        const { data, error } = await supabase.from('organizations').select('count').limit(1);
        res.json({
          service: 'Supabase',
          status: error ? 'error' : 'ok',
          message: error ? error.message : 'Conexión exitosa',
          data: data
        });
      } catch (error: any) {
        res.status(500).json({
          service: 'Supabase',
          status: 'error',
          message: error.message
        });
      }
      break;
      
    case 'database':
      try {
        const { data, error } = await supabase.rpc('version');
        res.json({
          service: 'Database',
          status: error ? 'error' : 'ok',
          message: error ? error.message : 'Base de datos accesible',
          version: data
        });
      } catch (error: any) {
        res.status(500).json({
          service: 'Database',
          status: 'error',
          message: error.message
        });
      }
      break;
      
    default:
      res.status(400).json({
        error: 'Servicio no reconocido',
        availableServices: ['supabase', 'database']
      });
  }
};

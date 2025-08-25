import { Request, Response } from 'express';
import config from '../../config/environment';

export class ConfigDebugController {
  
  /**
   * Endpoint para diagnosticar configuraciones de APIs
   */
  async checkApiConfigurations(req: Request, res: Response) {
    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        
        // Configuraciones de APIs
        apis: {
          openai: {
            configured: !!process.env.OPENAI_API_KEY,
            keyPresent: process.env.OPENAI_API_KEY ? 'YES' : 'NO',
            keyValue: process.env.OPENAI_API_KEY ? 
              `${process.env.OPENAI_API_KEY.substring(0, 8)}...${process.env.OPENAI_API_KEY.slice(-4)}` : 
              'NOT_SET',
            isPlaceholder: process.env.OPENAI_API_KEY === 'API-KEY-OPENAI'
          },
          
          creatorDB: {
            configured: !!config.creatorDB.apiKey,
            keyPresent: config.creatorDB.apiKey ? 'YES' : 'NO',
            keyValue: config.creatorDB.apiKey ? 
              `${config.creatorDB.apiKey.substring(0, 8)}...${config.creatorDB.apiKey.slice(-4)}` : 
              'NOT_SET',
            baseUrl: config.creatorDB.baseUrl,
            envVariable: process.env.CREATORDB_API_KEY ? 'SET' : 'NOT_SET'
          },
          
          supabase: {
            url: config.supabase.url ? 'SET' : 'NOT_SET',
            anonKey: config.supabase.anonKey ? 'SET' : 'NOT_SET',
            serviceKey: config.supabase.serviceKey ? 'SET' : 'NOT_SET',
            dbUrl: config.supabase.dbUrl ? 'SET' : 'NOT_SET'
          }
        },
        
        // Variables de entorno críticas
        envVariables: {
          NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
          PORT: process.env.PORT || 'NOT_SET',
          OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET',
          CREATORDB_API_KEY: process.env.CREATORDB_API_KEY ? 'SET' : 'NOT_SET',
              SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT_SET',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
          DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET'
        },
        
        // Problemas detectados
        issues: [] as Array<{
          type: string;
          service: string;
          description: string;
          solution: string;
        }>
      };
      
      // Detectar problemas
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'API-KEY-OPENAI') {
        diagnostics.issues.push({
          type: 'API_KEY_MISSING',
          service: 'OpenAI',
          description: 'OpenAI API key no está configurada o usa placeholder',
          solution: 'Configurar OPENAI_API_KEY en archivo .env'
        });
      }
      
      if (!config.creatorDB.apiKey) {
        diagnostics.issues.push({
          type: 'API_KEY_MISSING',
          service: 'CreatorDB',
          description: 'CreatorDB API key no está configurada',
          solution: 'Configurar CREATORDB_API_KEY en archivo .env'
        });
      }
      
      if (!config.supabase.url || !config.supabase.anonKey) {
        diagnostics.issues.push({
          type: 'DATABASE_CONFIG_MISSING',
          service: 'Supabase',
          description: 'Configuración de Supabase incompleta',
          solution: 'Verificar SUPABASE_URL y SUPABASE_ANON_KEY'
        });
      }
      
      res.json({
        success: true,
        diagnostics,
        recommendations: [
          'Crear archivo .env en la raíz del proyecto backend',
          'Configurar todas las API keys necesarias',
          'Reiniciar el servidor después de cambios en .env',
          'Verificar que las API keys sean válidas'
        ]
      });
      
    } catch (error) {
      console.error('Error en diagnóstico de configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error al diagnosticar configuración',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
  
  /**
   * Test de conectividad con CreatorDB
   */
  async testCreatorDBConnection(req: Request, res: Response) {
    try {
      const CreatorDBService = require('../../services/creator/creator.service').CreatorDBService;
      
      // Test básico
      const testResult = await CreatorDBService.get('/health').catch((error: any) => ({
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      }));
      
      res.json({
        success: !testResult.error,
        test: 'CreatorDB Connection',
        result: testResult,
        apiKey: config.creatorDB.apiKey ? 'CONFIGURED' : 'NOT_CONFIGURED',
        baseUrl: config.creatorDB.baseUrl
      });
      
    } catch (error) {
      res.json({
        success: false,
        test: 'CreatorDB Connection',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
  
  /**
   * Test de OpenAI API
   */
  async testOpenAIConnection(req: Request, res: Response) {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey || apiKey === 'API-KEY-OPENAI') {
        return res.json({
          success: false,
          test: 'OpenAI Connection',
          error: 'API key no configurada',
          apiKey: 'NOT_CONFIGURED'
        });
      }
      
      // Test simple con OpenAI
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      const isSuccess = response.ok;
      const data = isSuccess ? await response.json() : await response.text();
      
      res.json({
        success: isSuccess,
        test: 'OpenAI Connection',
        status: response.status,
        statusText: response.statusText,
        apiKey: 'CONFIGURED',
        data: isSuccess ? 'Connection successful' : data
      });
      
    } catch (error) {
      res.json({
        success: false,
        test: 'OpenAI Connection',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
} 
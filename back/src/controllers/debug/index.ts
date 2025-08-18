import { Request, Response } from 'express';
import config from '../../config/environment';

export class DebugController {
  async getConfig(req: Request, res: Response) {
    try {
      // Solo permitir en desarrollo
      if (config.nodeEnv === 'production') {
        return res.status(403).json({ error: 'Debug endpoint solo disponible en desarrollo' });
      }

      res.json({
        environment: config.nodeEnv,
        urls: {
          frontend: config.urls.frontend,
          backend: config.urls.backend,
          inviteCallback: `${config.urls.frontend}/auth/invite-callback`,
          googleCallback: `${config.urls.frontend}/auth/callback`
        },
        supabase: {
          url: config.supabase.url ? 'Configurado' : 'No configurado',
          anonKey: config.supabase.anonKey ? 'Configurado' : 'No configurado',
          serviceKey: config.supabase.serviceKey ? 'Configurado' : 'No configurado'
        }
      });
    } catch (error) {
      console.error('Error en debug config:', error);
      res.status(500).json({ error: 'Error obteniendo configuración' });
    }
  }
} 
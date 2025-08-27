import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth';
import { User } from '../models/user/user.model';
import { config } from '../config/environment';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // 🔐 MEJORA: Validar que el JWT secret esté configurado
    if (!config.jwtSecret || config.jwtSecret === 'your-secret-key') {
      console.error('🚨 JWT SECRET NO CONFIGURADO CORRECTAMENTE');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    const decoded = verifyToken(token);
    
    // 🔐 MEJORA: Rechazar refresh tokens en endpoints normales
    if (decoded.type === 'refresh') {
      return res.status(403).json({ error: 'No se puede usar refresh token para acceso', code: 'REFRESH_TOKEN_NOT_ALLOWED' });
    }
    
    req.user = decoded as User;
    next();
  } catch (error: any) {
    console.error('Auth middleware - token verification failed:', error);
    
    // 🔐 MEJORA: Diferentes tipos de errores JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token inválido', code: 'INVALID_TOKEN' });
    }
    
    return res.status(403).json({ error: 'Token inválido' });
  }
}; 
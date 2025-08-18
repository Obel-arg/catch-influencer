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

    const decoded = verifyToken(token);
    req.user = decoded as User;
    next();
  } catch (error) {
    console.error('Auth middleware - token verification failed:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
}; 
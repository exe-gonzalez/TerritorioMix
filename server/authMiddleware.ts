import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from './config';
import { db } from './db';
import { User } from '../src/types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado. Se requiere token JWT.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, CONFIG.jwtSecret) as { userId: string };
    const userWithPassword = db.getUserById(payload.userId);

    if (!userWithPassword || !userWithPassword.active) {
      res.status(401).json({ error: 'Usuario no encontrado o cuenta inactiva.' });
      return;
    }

    const { passwordHash, resetToken, resetTokenExpiry, ...user } = userWithPassword;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token JWT inválido o expirado.' });
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de Administrador ("admin").',
    });
    return;
  }
  next();
}

import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/JwtUtils';

export interface AuthRequest extends Request {
  usuario?: { id: number; rol: string };
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JwtUtils.verificarToken(token);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Token inválido o expirado.' });
  }
};
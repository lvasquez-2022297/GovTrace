import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/JwtUtils';
import { RolUsuario } from '../models/Usuarios';

export interface AuthRequest extends Request {
  usuario?: { id: number; rol: RolUsuario };
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    req.usuario = JwtUtils.verificarToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

export const requiereRol = (...roles: RolUsuario[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      res.status(403).json({ success: false, message: 'No tienes permisos para esta acción.' });
      return;
    }
    next();
  };

export const propioOAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const esPropio = req.usuario?.id === Number(req.params.id);
  const esAdmin = req.usuario?.rol === 'ADMIN';

  if (!esPropio && !esAdmin) {
    res.status(403).json({ success: false, message: 'No tienes permisos para esta acción.' });
    return;
  }
  next();
};
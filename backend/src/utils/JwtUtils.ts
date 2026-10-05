import jwt, { SignOptions } from 'jsonwebtoken';
import { RolUsuario } from '../models/Usuarios';

export interface TokenPayload {
  id: number;
  rol: RolUsuario;
}

export class JwtUtils {
  private static get secret(): string {
    const s = process.env.JWT_SECRET;
    if (!s) throw new Error('JWT_SECRET no está definido en el .env');
    return s;
  }

  static generarToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as SignOptions['expiresIn'],
    });
  }

  static verificarToken(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as TokenPayload;
  }
}
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'secret_govtrace_key';
const EXPIRES_IN = '8h';

export interface TokenPayload {
  id: number;
  rol: string;
}

export class JwtUtils {
  static generarToken(payload: TokenPayload): string {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
  }

  static verificarToken(token: string): TokenPayload {
    return jwt.verify(token, SECRET_KEY) as TokenPayload;
  }
}
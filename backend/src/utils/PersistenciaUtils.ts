import { pool } from '../db';
import { LoggerUtils } from './LoggerUtils';

export class PersistenciaUtils {
 
  static async ejecutarQuery<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
    try {
      const resultado = await pool.query(queryText, params);
      return resultado.rows;
    } catch (error) {
      LoggerUtils.error(`Error al ejecutar query: ${queryText}`, error);
      throw error;
    }
  }

 
  static async ejecutarQueryUnico<T = any>(queryText: string, params: any[] = []): Promise<T | null> {
    const filas = await this.ejecutarQuery<T>(queryText, params);
    return filas[0] || null;
  }
}
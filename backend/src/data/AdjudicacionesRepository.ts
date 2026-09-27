import { pool } from '../db';
import { Adjudicacion } from '../models/Adjudicaciones';

export class AdjudicacionesRepository {
  async obtenerTodas(): Promise<Adjudicacion[]> {
    const res = await pool.query('SELECT * FROM adjudicaciones ORDER BY id DESC');
    return res.rows;
  }

  async obtenerPorId(id: number): Promise<Adjudicacion | null> {
    const res = await pool.query('SELECT * FROM adjudicaciones WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async crear(adjudicacion: Adjudicacion): Promise<Adjudicacion> {
    const res = await pool.query(
      `INSERT INTO adjudicaciones (licitacion_id, proveedor_id, monto_adjudicado, observaciones)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [adjudicacion.licitacion_id, adjudicacion.proveedor_id, adjudicacion.monto_adjudicado, adjudicacion.observaciones]
    );
    return res.rows[0];
  }

  async actualizar(id: number, adjudicacion: Partial<Adjudicacion>): Promise<Adjudicacion | null> {
    const res = await pool.query(
      `UPDATE adjudicaciones
       SET monto_adjudicado = COALESCE($1, monto_adjudicado),
           observaciones = COALESCE($2, observaciones)
       WHERE id = $3
       RETURNING *`,
      [adjudicacion.monto_adjudicado, adjudicacion.observaciones, id]
    );
    return res.rows[0] || null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM adjudicaciones WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
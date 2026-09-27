import { pool } from '../db';
import { Alerta } from '../models/Alertas';

export class AlertasRepository {
  async obtenerTodas(): Promise<Alerta[]> {
    const res = await pool.query('SELECT * FROM alertas ORDER BY id DESC');
    return res.rows;
  }

  async obtenerPorId(id: number): Promise<Alerta | null> {
    const res = await pool.query('SELECT * FROM alertas WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async crear(alerta: Alerta): Promise<Alerta> {
    const res = await pool.query(
      `INSERT INTO alertas (licitacion_id, tipo_alerta, descripcion, nivel_riesgo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [alerta.licitacion_id, alerta.tipo_alerta, alerta.descripcion, alerta.nivel_riesgo || 'MEDIO']
    );
    return res.rows[0];
  }

  async actualizar(id: number, alerta: Partial<Alerta>): Promise<Alerta | null> {
    const res = await pool.query(
      `UPDATE alertas
       SET tipo_alerta = COALESCE($1, tipo_alerta),
           descripcion = COALESCE($2, descripcion),
           nivel_riesgo = COALESCE($3, nivel_riesgo)
       WHERE id = $4
       RETURNING *`,
      [alerta.tipo_alerta, alerta.descripcion, alerta.nivel_riesgo, id]
    );
    return res.rows[0] || null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM alertas WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
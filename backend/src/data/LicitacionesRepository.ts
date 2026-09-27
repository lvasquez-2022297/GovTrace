import { pool } from '../db';
import { Licitacion } from '../models/Licitaciones';

export class LicitacionesRepository {
  async obtenerTodas(): Promise<Licitacion[]> {
    const res = await pool.query('SELECT * FROM licitaciones ORDER BY id DESC');
    return res.rows;
  }

  async obtenerPorId(id: number): Promise<Licitacion | null> {
    const res = await pool.query('SELECT * FROM licitaciones WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async crear(licitacion: Licitacion): Promise<Licitacion> {
    const res = await pool.query(
      `INSERT INTO licitaciones (codigo_licitacion, titulo, descripcion, presupuesto_asignado, estado, fecha_inicio, fecha_cierre, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        licitacion.codigo_licitacion,
        licitacion.titulo,
        licitacion.descripcion,
        licitacion.presupuesto_asignado,
        licitacion.estado || 'PUBLICADA',
        licitacion.fecha_inicio,
        licitacion.fecha_cierre,
        licitacion.creado_por,
      ]
    );
    return res.rows[0];
  }

  async actualizar(id: number, licitacion: Partial<Licitacion>): Promise<Licitacion | null> {
    const res = await pool.query(
      `UPDATE licitaciones
       SET titulo = COALESCE($1, titulo),
           descripcion = COALESCE($2, descripcion),
           presupuesto_asignado = COALESCE($3, presupuesto_asignado),
           estado = COALESCE($4, estado),
           fecha_inicio = COALESCE($5, fecha_inicio),
           fecha_cierre = COALESCE($6, fecha_cierre)
       WHERE id = $7
       RETURNING *`,
      [
        licitacion.titulo,
        licitacion.descripcion,
        licitacion.presupuesto_asignado,
        licitacion.estado,
        licitacion.fecha_inicio,
        licitacion.fecha_cierre,
        id,
      ]
    );
    return res.rows[0] || null;
  }

  async actualizarEstado(id: number, estado: string): Promise<boolean> {
    const res = await pool.query('UPDATE licitaciones SET estado = $1 WHERE id = $2', [estado, id]);
    return (res.rowCount ?? 0) > 0;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM licitaciones WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
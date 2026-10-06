import { pool } from '../db';

export interface AlertaDatos {
  licitacion_id: number;
  tipo_alerta: string;
  descripcion: string;
  nivel_riesgo: string;
}

const BASE = `
  SELECT al.id, al.licitacion_id, al.tipo_alerta, al.descripcion,
         al.nivel_riesgo, al.creado_en,
         l.codigo_licitacion, l.titulo, l.entidad
  FROM alertas al
  JOIN licitaciones l ON l.id = al.licitacion_id`;

export class AlertasRepository {
  async obtenerTodas() {
    const res = await pool.query(`${BASE} ORDER BY al.id DESC`);
    return res.rows;
  }

  async obtenerPorId(id: number) {
    const res = await pool.query(`${BASE} WHERE al.id = $1`, [id]);
    return res.rows[0] || null;
  }

  async existeLicitacion(id: number): Promise<boolean> {
    const res = await pool.query('SELECT 1 FROM licitaciones WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async crear(d: AlertaDatos) {
    const res = await pool.query(
      `INSERT INTO alertas (licitacion_id, tipo_alerta, descripcion, nivel_riesgo)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [d.licitacion_id, d.tipo_alerta, d.descripcion, d.nivel_riesgo]
    );
    return this.obtenerPorId(res.rows[0].id);
  }

  async actualizar(id: number, d: AlertaDatos) {
    const res = await pool.query(
      `UPDATE alertas SET licitacion_id=$1, tipo_alerta=$2, descripcion=$3, nivel_riesgo=$4
       WHERE id=$5 RETURNING id`,
      [d.licitacion_id, d.tipo_alerta, d.descripcion, d.nivel_riesgo, id]
    );
    return res.rows[0] ? this.obtenerPorId(id) : null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM alertas WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
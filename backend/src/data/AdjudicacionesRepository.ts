import { pool } from '../db';

export interface AdjudicacionDatos {
  licitacion_id: number;
  proveedor_id: number;
  monto_adjudicado: number;
  observaciones: string | null;
}

const BASE = `
  SELECT a.id, a.licitacion_id, a.proveedor_id,
         a.monto_adjudicado::float8 AS monto_adjudicado,
         a.fecha_adjudicacion, a.observaciones,
         l.codigo_licitacion, l.titulo, e.nombre AS entidad,
         l.estado AS estado_licitacion,
         l.presupuesto_asignado::float8 AS presupuesto_asignado,
         p.razon_social, p.nit
  FROM adjudicaciones a
  JOIN licitaciones l ON l.id = a.licitacion_id
  LEFT JOIN entidades e ON e.id = l.entidad_id
  JOIN proveedores p ON p.id = a.proveedor_id`;

export class AdjudicacionesRepository {
  async obtenerTodas() {
    const res = await pool.query(`${BASE} ORDER BY a.id DESC`);
    return res.rows;
  }

  async obtenerPorId(id: number) {
    const res = await pool.query(`${BASE} WHERE a.id = $1`, [id]);
    return res.rows[0] || null;
  }

  async estadoLicitacion(id: number): Promise<string | null> {
    const res = await pool.query('SELECT estado FROM licitaciones WHERE id = $1', [id]);
    return res.rows[0]?.estado ?? null;
  }

  async existeProveedor(id: number): Promise<boolean> {
    const res = await pool.query('SELECT 1 FROM proveedores WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async crear(d: AdjudicacionDatos) {
    const res = await pool.query(
      `INSERT INTO adjudicaciones (licitacion_id, proveedor_id, monto_adjudicado, observaciones)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [d.licitacion_id, d.proveedor_id, d.monto_adjudicado, d.observaciones]
    );
    await pool.query(
      `UPDATE licitaciones SET estado = 'ADJUDICADA' WHERE id = $1 AND estado = 'PUBLICADA'`,
      [d.licitacion_id]
    );
    return this.obtenerPorId(res.rows[0].id);
  }

  async actualizar(id: number, d: Omit<AdjudicacionDatos, 'licitacion_id'>) {
    const res = await pool.query(
      `UPDATE adjudicaciones SET proveedor_id=$1, monto_adjudicado=$2, observaciones=$3
       WHERE id=$4 RETURNING id`,
      [d.proveedor_id, d.monto_adjudicado, d.observaciones, id]
    );
    return res.rows[0] ? this.obtenerPorId(id) : null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM adjudicaciones WHERE id = $1 RETURNING licitacion_id', [id]);
    if (!res.rows[0]) return false;
    await pool.query(
      `UPDATE licitaciones SET estado = 'PUBLICADA' WHERE id = $1 AND estado = 'ADJUDICADA'`,
      [res.rows[0].licitacion_id]
    );
    return true;
  }
}
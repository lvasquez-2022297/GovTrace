import { pool } from '../db';

export interface ProveedorDatos {
  nit: string;
  razon_social: string;
  email: string;
  calificacion: number;
}

const BASE = `
  SELECT p.id, p.nit, p.razon_social, p.email,
         p.calificacion::float8 AS calificacion, p.creado_en,
         COUNT(a.id)::int AS contratos,
         COALESCE(SUM(a.monto_adjudicado), 0)::float8 AS monto_total
  FROM proveedores p
  LEFT JOIN adjudicaciones a ON a.proveedor_id = p.id`;

export class ProveedoresRepository {
  async obtenerTodos() {
    const res = await pool.query(`${BASE} GROUP BY p.id ORDER BY p.id DESC`);
    return res.rows;
  }

  async obtenerPorId(id: number) {
    const res = await pool.query(`${BASE} WHERE p.id = $1 GROUP BY p.id`, [id]);
    return res.rows[0] || null;
  }

  async crear(d: ProveedorDatos) {
    const res = await pool.query(
      `INSERT INTO proveedores (nit, razon_social, email, calificacion)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [d.nit, d.razon_social, d.email, d.calificacion]
    );
    return this.obtenerPorId(res.rows[0].id);
  }

  async actualizar(id: number, d: ProveedorDatos) {
    const res = await pool.query(
      `UPDATE proveedores SET nit=$1, razon_social=$2, email=$3, calificacion=$4
       WHERE id=$5 RETURNING id`,
      [d.nit, d.razon_social, d.email, d.calificacion, id]
    );
    return res.rows[0] ? this.obtenerPorId(id) : null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM proveedores WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
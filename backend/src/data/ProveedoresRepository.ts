import { pool } from '../db';
import { Proveedor } from '../models/Proveedores';

export class ProveedoresRepository {
  async obtenerTodos(): Promise<Proveedor[]> {
    const res = await pool.query('SELECT * FROM proveedores ORDER BY id ASC');
    return res.rows;
  }

  async obtenerPorId(id: number): Promise<Proveedor | null> {
    const res = await pool.query('SELECT * FROM proveedores WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async crear(proveedor: Proveedor): Promise<Proveedor> {
    const res = await pool.query(
      `INSERT INTO proveedores (nit, razon_social, email, calificacion)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [proveedor.nit, proveedor.razon_social, proveedor.email, proveedor.calificacion || 5.0]
    );
    return res.rows[0];
  }

  async actualizar(id: number, proveedor: Partial<Proveedor>): Promise<Proveedor | null> {
    const res = await pool.query(
      `UPDATE proveedores
       SET nit = COALESCE($1, nit),
           razon_social = COALESCE($2, razon_social),
           email = COALESCE($3, email),
           calificacion = COALESCE($4, calificacion)
       WHERE id = $5
       RETURNING *`,
      [proveedor.nit, proveedor.razon_social, proveedor.email, proveedor.calificacion, id]
    );
    return res.rows[0] || null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM proveedores WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
import { pool } from '../db';

export type EstadoLicitacion = 'PUBLICADA' | 'ADJUDICADA' | 'CANCELADA' | 'CON_ALERTA';

export interface LicitacionDatos {
  codigo_licitacion: string;
  titulo: string;
  descripcion: string | null;
  entidad: string | null;
  presupuesto_asignado: number;
  estado: EstadoLicitacion;
  fecha_inicio: string;
  fecha_cierre: string;
  creado_por?: number | null;
}

const COLUMNAS = `
  id, codigo_licitacion, titulo, descripcion, entidad,
  presupuesto_asignado::float8 AS presupuesto_asignado, estado,
  to_char(fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
  to_char(fecha_cierre, 'YYYY-MM-DD') AS fecha_cierre,
  creado_por, creado_en`;

export class LicitacionesRepository {
  async obtenerTodas() {
    const res = await pool.query(`SELECT ${COLUMNAS} FROM licitaciones ORDER BY id DESC`);
    return res.rows;
  }

  async obtenerPorId(id: number) {
    const res = await pool.query(`SELECT ${COLUMNAS} FROM licitaciones WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  async crear(d: LicitacionDatos) {
    const res = await pool.query(
      `INSERT INTO licitaciones
        (codigo_licitacion, titulo, descripcion, entidad, presupuesto_asignado, estado, fecha_inicio, fecha_cierre, creado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING ${COLUMNAS}`,
      [d.codigo_licitacion, d.titulo, d.descripcion, d.entidad, d.presupuesto_asignado,
       d.estado, d.fecha_inicio, d.fecha_cierre, d.creado_por ?? null]
    );
    return res.rows[0];
  }

  async actualizar(id: number, d: LicitacionDatos) {
    const res = await pool.query(
      `UPDATE licitaciones
       SET codigo_licitacion=$1, titulo=$2, descripcion=$3, entidad=$4,
           presupuesto_asignado=$5, estado=$6, fecha_inicio=$7, fecha_cierre=$8
       WHERE id=$9
       RETURNING ${COLUMNAS}`,
      [d.codigo_licitacion, d.titulo, d.descripcion, d.entidad, d.presupuesto_asignado,
       d.estado, d.fecha_inicio, d.fecha_cierre, id]
    );
    return res.rows[0] || null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM licitaciones WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
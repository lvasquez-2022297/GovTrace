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

const SELECT = `
  SELECT l.id, l.codigo_licitacion, l.titulo, l.descripcion,
         e.nombre AS entidad, l.entidad_id,
         l.presupuesto_asignado::float8 AS presupuesto_asignado, l.estado,
         to_char(l.fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio,
         to_char(l.fecha_cierre, 'YYYY-MM-DD') AS fecha_cierre,
         l.creado_por, l.creado_en
  FROM licitaciones l
  LEFT JOIN entidades e ON e.id = l.entidad_id`;

export class LicitacionesRepository {
  private async resolverEntidad(nombre: string | null): Promise<number | null> {
    if (!nombre) return null;
    const res = await pool.query(
      `INSERT INTO entidades (nombre) VALUES ($1)
       ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
       RETURNING id`,
      [nombre]
    );
    return res.rows[0].id;
  }

  async obtenerTodas() {
    const res = await pool.query(`${SELECT} ORDER BY l.id DESC`);
    return res.rows;
  }

  async obtenerPorId(id: number) {
    const res = await pool.query(`${SELECT} WHERE l.id = $1`, [id]);
    return res.rows[0] || null;
  }

  async crear(d: LicitacionDatos) {
    const entidadId = await this.resolverEntidad(d.entidad);
    const res = await pool.query(
      `INSERT INTO licitaciones
        (codigo_licitacion, titulo, descripcion, entidad_id, presupuesto_asignado, estado, fecha_inicio, fecha_cierre, creado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [d.codigo_licitacion, d.titulo, d.descripcion, entidadId, d.presupuesto_asignado,
       d.estado, d.fecha_inicio, d.fecha_cierre, d.creado_por ?? null]
    );
    return this.obtenerPorId(res.rows[0].id);
  }

  async actualizar(id: number, d: LicitacionDatos) {
    const entidadId = await this.resolverEntidad(d.entidad);
    const res = await pool.query(
      `UPDATE licitaciones
       SET codigo_licitacion=$1, titulo=$2, descripcion=$3, entidad_id=$4,
           presupuesto_asignado=$5, estado=$6, fecha_inicio=$7, fecha_cierre=$8
       WHERE id=$9 RETURNING id`,
      [d.codigo_licitacion, d.titulo, d.descripcion, entidadId, d.presupuesto_asignado,
       d.estado, d.fecha_inicio, d.fecha_cierre, id]
    );
    return res.rows[0] ? this.obtenerPorId(id) : null;
  }

  async cambiarEstado(id: number, estado: EstadoLicitacion) {
    const res = await pool.query(
      `UPDATE licitaciones SET estado = $1 WHERE id = $2 RETURNING id`,
      [estado, id]
    );
    return res.rows[0] ? this.obtenerPorId(id) : null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM licitaciones WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
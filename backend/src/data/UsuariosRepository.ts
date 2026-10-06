import { pool } from '../db';
import { Usuario } from '../models/Usuarios';

export type UsuarioSinPassword = Omit<Usuario, 'password'>;

const COLUMNAS = 'id, nombre, email, rol, foto_url, creado_en';

export interface CambiosUsuario {
  nombre?: string;
  email?: string;
  password?: string;
  foto_url?: string | null; 
}

export class UsuariosRepository {
  async obtenerTodos(): Promise<UsuarioSinPassword[]> {
    const res = await pool.query(`SELECT ${COLUMNAS} FROM usuarios ORDER BY id ASC`);
    return res.rows;
  }

  async obtenerPorId(id: number): Promise<UsuarioSinPassword | null> {
    const res = await pool.query(`SELECT ${COLUMNAS} FROM usuarios WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  async obtenerPorEmail(email: string): Promise<Usuario | null> {
    const res = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return res.rows[0] || null;
  }

  async crear(usuario: Omit<Usuario, 'id' | 'creado_en'>): Promise<UsuarioSinPassword> {
    const res = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLUMNAS}`,
      [usuario.nombre, usuario.email, usuario.password, usuario.rol]
    );
    return res.rows[0];
  }

  async actualizar(id: number, cambios: CambiosUsuario): Promise<UsuarioSinPassword | null> {
    const cambiaFoto = cambios.foto_url !== undefined;
    const res = await pool.query(
      `UPDATE usuarios
       SET nombre   = COALESCE($1, nombre),
           email    = COALESCE($2, email),
           password = COALESCE($3, password),
           foto_url = CASE WHEN $4::boolean THEN $5::varchar ELSE foto_url END
       WHERE id = $6
       RETURNING ${COLUMNAS}`,
      [
        cambios.nombre ?? null,
        cambios.email ?? null,
        cambios.password ?? null,
        cambiaFoto,
        cambios.foto_url ?? null,
        id
      ]
    );
    return res.rows[0] || null;
  }

  async actualizarRol(id: number, rol: string): Promise<UsuarioSinPassword | null> {
    const res = await pool.query(
      `UPDATE usuarios SET rol = $1 WHERE id = $2 RETURNING ${COLUMNAS}`,
      [rol, id]
    );
    return res.rows[0] || null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
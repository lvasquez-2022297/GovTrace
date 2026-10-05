import { pool } from '../db';
import { Usuario } from '../models/Usuarios';

export type UsuarioSinPassword = Omit<Usuario, 'password'>;

export class UsuariosRepository {
  async obtenerTodos(): Promise<UsuarioSinPassword[]> {
    const res = await pool.query(
      'SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY id ASC'
    );
    return res.rows;
  }

  async obtenerPorId(id: number): Promise<UsuarioSinPassword | null> {
    const res = await pool.query(
      'SELECT id, nombre, email, rol, creado_en FROM usuarios WHERE id = $1',
      [id]
    );
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
       RETURNING id, nombre, email, rol, creado_en`,
      [usuario.nombre, usuario.email, usuario.password, usuario.rol]
    );
    return res.rows[0];
  }

  async actualizar(
    id: number,
    cambios: Partial<Pick<Usuario, 'nombre' | 'email' | 'password'>>
  ): Promise<UsuarioSinPassword | null> {
    const res = await pool.query(
      `UPDATE usuarios
       SET nombre   = COALESCE($1, nombre),
           email    = COALESCE($2, email),
           password = COALESCE($3, password)
       WHERE id = $4
       RETURNING id, nombre, email, rol, creado_en`,
      [cambios.nombre ?? null, cambios.email ?? null, cambios.password ?? null, id]
    );
    return res.rows[0] || null;
  }

  async eliminar(id: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
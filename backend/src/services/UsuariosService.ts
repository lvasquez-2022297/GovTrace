import { UsuariosRepository } from '../data/UsuariosRepository';
import { Usuario } from '../models/Usuarios';

export class UsuariosService {
  private repo = new UsuariosRepository();

  async listarUsuarios(): Promise<Usuario[]> {
    return await this.repo.obtenerTodos();
  }

  async obtenerUsuarioPorId(id: number): Promise<Usuario> {
    const usuario = await this.repo.obtenerPorId(id);
    if (!usuario) throw new Error(`Usuario con ID ${id} no encontrado.`);
    return usuario;
  }

  async registrarUsuario(usuario: Usuario): Promise<Usuario> {
    const existe = await this.repo.obtenerPorEmail(usuario.email);
    if (existe) throw new Error(`El email ${usuario.email} ya está registrado.`);
    return await this.repo.crear(usuario);
  }

  async actualizarUsuario(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const actualizado = await this.repo.actualizar(id, usuario);
    if (!actualizado) throw new Error(`No se pudo actualizar el usuario con ID ${id}.`);
    return actualizado;
  }

  async eliminarUsuario(id: number): Promise<boolean> {
    const eliminado = await this.repo.eliminar(id);
    if (!eliminado) throw new Error(`No se pudo eliminar el usuario con ID ${id}.`);
    return true;
  }
}
import { UsuariosRepository } from '../data/UsuariosRepository';
import { Usuario } from '../models/Usuarios';
import { CryptoUtils } from '../utils/CryptoUtils';

export type CreacionUsuario = Omit<Usuario, 'id' | 'creado_en'>;

export class UsuariosService {
  private repo = new UsuariosRepository();

  private validarFormatoEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async listarUsuarios(): Promise<Usuario[]> {
    return await this.repo.obtenerTodos();
  }

  async obtenerUsuarioPorId(id: number): Promise<Usuario> {
    const usuario = await this.repo.obtenerPorId(id);
    if (!usuario) throw new Error(`Usuario con ID ${id} no encontrado.`);
    return usuario;
  }

  async registrarUsuario(usuario: CreacionUsuario): Promise<Usuario> {
    if (!this.validarFormatoEmail(usuario.email)) {
      throw new Error(`El formato del correo '${usuario.email}' es inválido. Debe contener '@' y un dominio válido.`);
    }

    if (!usuario.nombre || usuario.nombre.trim().length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres.');
    }

    if (!usuario.password || usuario.password.length < 6) {
      throw new Error('La contraseña debe tener una longitud mínima de 6 caracteres.');
    }

    const existe = await this.repo.obtenerPorEmail(usuario.email);
    if (existe) throw new Error(`El correo ${usuario.email} ya se encuentra registrado.`);

    const passwordHasheada = await CryptoUtils.hashPassword(usuario.password);

    const nuevoUsuario: CreacionUsuario = {
      ...usuario,
      password: passwordHasheada,
    };

    return await this.repo.crear(nuevoUsuario);
  }

  async actualizarUsuario(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    if (usuario.email && !this.validarFormatoEmail(usuario.email)) {
      throw new Error(`El formato del correo '${usuario.email}' es inválido.`);
    }

    if (usuario.password) {
      usuario.password = await CryptoUtils.hashPassword(usuario.password);
    }

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
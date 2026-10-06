import { UsuariosRepository, UsuarioSinPassword, CambiosUsuario } from '../data/UsuariosRepository';
import { Usuario, RolUsuario } from '../models/Usuarios';
import { CryptoUtils } from '../utils/CryptoUtils';
import { JwtUtils } from '../utils/JwtUtils';
import { AppError } from '../utils/AppError';

export type CreacionUsuario = Omit<Usuario, 'id' | 'creado_en'>;
export type UsuarioPublico = UsuarioSinPassword;

const ROLES_VALIDOS: RolUsuario[] = ['ADMIN', 'AUDITOR', 'CIUDADANO'];

export interface RegistroDTO {
  nombre: string;
  email: string;
  password: string;
}

export interface CrearUsuarioAdminDTO extends RegistroDTO {
  rol?: RolUsuario;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResultado {
  token: string;
  usuario: UsuarioPublico;
}

export class UsuariosService {
  private repo = new UsuariosRepository();

  private validarFormatoEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private sanitizar(usuario: Usuario): UsuarioPublico {
    const { password, ...resto } = usuario;
    return resto;
  }

  private validarPassword(password: string): void {
    if (!password || password.length < 6) {
      throw new AppError('La contraseña debe tener una longitud mínima de 6 caracteres.', 400);
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      throw new AppError('La contraseña debe contener al menos una letra y un número.', 400);
    }
  }

  async listarUsuarios(): Promise<UsuarioPublico[]> {
    return await this.repo.obtenerTodos();
  }

  async obtenerUsuarioPorId(id: number): Promise<UsuarioPublico> {
    const usuario = await this.repo.obtenerPorId(id);
    if (!usuario) throw new AppError(`Usuario con ID ${id} no encontrado.`, 404);
    return usuario;
  }

  async registrarUsuario(datos: RegistroDTO): Promise<UsuarioPublico> {
    const nombre = datos.nombre?.trim();
    const email = datos.email?.trim().toLowerCase();

    if (!email || !this.validarFormatoEmail(email)) {
      throw new AppError(`El formato del correo '${datos.email ?? ''}' es inválido.`, 400);
    }
    if (!nombre || nombre.length < 3) {
      throw new AppError('El nombre debe tener al menos 3 caracteres.', 400);
    }
    this.validarPassword(datos.password);

    const existe = await this.repo.obtenerPorEmail(email);
    if (existe) throw new AppError(`El correo ${email} ya se encuentra registrado.`, 409);

    const passwordHasheada = await CryptoUtils.hashPassword(datos.password);

    const nuevoUsuario: CreacionUsuario = {
      nombre,
      email,
      password: passwordHasheada,
      rol: 'CIUDADANO'
    };

    return await this.repo.crear(nuevoUsuario);
  }

  async crearUsuarioAdmin(datos: CrearUsuarioAdminDTO): Promise<UsuarioPublico> {
    const rol: RolUsuario = datos.rol ?? 'CIUDADANO';
    if (!ROLES_VALIDOS.includes(rol)) {
      throw new AppError('Rol inválido. Usa ADMIN, AUDITOR o CIUDADANO.', 400);
    }

    const nombre = datos.nombre?.trim();
    const email = datos.email?.trim().toLowerCase();

    if (!email || !this.validarFormatoEmail(email)) {
      throw new AppError('El formato del correo es inválido.', 400);
    }
    if (!nombre || nombre.length < 3) {
      throw new AppError('El nombre debe tener al menos 3 caracteres.', 400);
    }
    this.validarPassword(datos.password);

    if (await this.repo.obtenerPorEmail(email)) {
      throw new AppError(`El correo ${email} ya se encuentra registrado.`, 409);
    }

    const password = await CryptoUtils.hashPassword(datos.password);
    return await this.repo.crear({ nombre, email, password, rol });
  }

  async login({ email, password }: LoginDTO): Promise<LoginResultado> {
    if (!email || !password) {
      throw new AppError('Correo y contraseña son obligatorios.', 400);
    }

    const emailNormalizado = email.trim().toLowerCase();
    if (!this.validarFormatoEmail(emailNormalizado)) {
      throw new AppError('El formato del correo es inválido.', 400);
    }

    const usuario = await this.repo.obtenerPorEmail(emailNormalizado);

    const credencialesInvalidas = new AppError('Correo o contraseña incorrectos.', 401);
    if (!usuario) throw credencialesInvalidas;

    const coincide = await CryptoUtils.comparePassword(password, usuario.password);
    if (!coincide) throw credencialesInvalidas;

    const token = JwtUtils.generarToken({
      id: usuario.id,
      rol: usuario.rol
    });

    return { token, usuario: this.sanitizar(usuario) };
  }

  async actualizarUsuario(id: number, datos: Partial<Usuario>): Promise<UsuarioPublico> {
  const cambios: CambiosUsuario = {};

  if (datos.nombre !== undefined) {
    const nombre = datos.nombre.trim();
    if (nombre.length < 3) {
      throw new AppError('El nombre debe tener al menos 3 caracteres.', 400);
    }
    cambios.nombre = nombre;
  }

  if (datos.email !== undefined) {
    const email = datos.email.trim().toLowerCase();
    if (!this.validarFormatoEmail(email)) {
      throw new AppError(`El formato del correo '${email}' es inválido.`, 400);
    }
    const existente = await this.repo.obtenerPorEmail(email);
    if (existente && existente.id !== id) {
      throw new AppError(`El correo ${email} ya se encuentra registrado.`, 409);
    }
    cambios.email = email;
  }

  if (datos.password !== undefined) {
    this.validarPassword(datos.password);
    cambios.password = await CryptoUtils.hashPassword(datos.password);
  }

  if (datos.foto_url !== undefined) {
    const url = (datos.foto_url ?? '').trim();
    if (!url) {
      cambios.foto_url = null; 
    } else {
      if (url.length > 500) throw new AppError('La URL de la foto es demasiado larga (máx. 500).', 400);
      let valida = false;
      try {
        const u = new URL(url);
        valida = u.protocol === 'http:' || u.protocol === 'https:';
      } catch { /* queda en false */ }
      if (!valida) throw new AppError('La foto debe ser una URL válida que empiece con http:// o https://.', 400);
      cambios.foto_url = url;
    }
  }

  const actualizado = await this.repo.actualizar(id, cambios);
  if (!actualizado) throw new AppError(`Usuario con ID ${id} no encontrado.`, 404);
  return actualizado;
}

  async cambiarRol(id: number, rol: RolUsuario): Promise<UsuarioPublico> {
    if (!ROLES_VALIDOS.includes(rol)) {
      throw new AppError('Rol inválido. Usa ADMIN, AUDITOR o CIUDADANO.', 400);
    }
    const actualizado = await this.repo.actualizarRol(id, rol);
    if (!actualizado) throw new AppError(`Usuario con ID ${id} no encontrado.`, 404);
    return actualizado;
  }

  async eliminarUsuario(id: number): Promise<boolean> {
    const eliminado = await this.repo.eliminar(id);
    if (!eliminado) throw new AppError(`Usuario con ID ${id} no encontrado.`, 404);
    return true;
  }
}
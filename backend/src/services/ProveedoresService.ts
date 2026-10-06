import { ProveedoresRepository, ProveedorDatos } from '../data/ProveedoresRepository';
import { AppError } from '../utils/AppError';

export class ProveedoresService {
  private repo = new ProveedoresRepository();

  private validar(d: any): ProveedorDatos {
    const nit = String(d?.nit ?? '').trim();
    const razon = String(d?.razon_social ?? '').trim();
    const email = String(d?.email ?? '').trim().toLowerCase();
    const calificacion = d?.calificacion === undefined || d?.calificacion === null || d?.calificacion === ''
      ? 5 : Number(d.calificacion);

    if (!nit || nit.length > 20) throw new AppError('El NIT es obligatorio (máx. 20 caracteres).', 400);
    if (!razon || razon.length > 150) throw new AppError('La razón social es obligatoria (máx. 150 caracteres).', 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('El formato del correo es inválido.', 400);
    if (!Number.isFinite(calificacion) || calificacion < 0 || calificacion > 5) {
      throw new AppError('La calificación debe estar entre 0 y 5.', 400);
    }
    return { nit, razon_social: razon, email, calificacion };
  }

  private traducir(e: any): never {
    if (e?.code === '23505') throw new AppError('Ya existe un proveedor con ese NIT.', 409);
    throw e;
  }

  async listarProveedores() {
    return await this.repo.obtenerTodos();
  }

  async obtenerProveedorPorId(id: number) {
    const p = await this.repo.obtenerPorId(id);
    if (!p) throw new AppError(`Proveedor con ID ${id} no encontrado.`, 404);
    return p;
  }

  async registrarProveedor(datos: any) {
    try { return await this.repo.crear(this.validar(datos)); } catch (e) { return this.traducir(e); }
  }

  async actualizarProveedor(id: number, datos: any) {
    try {
      const p = await this.repo.actualizar(id, this.validar(datos));
      if (!p) throw new AppError(`Proveedor con ID ${id} no encontrado.`, 404);
      return p;
    } catch (e) { return this.traducir(e); }
  }

  async eliminarProveedor(id: number): Promise<boolean> {
    try {
      if (!(await this.repo.eliminar(id))) throw new AppError(`Proveedor con ID ${id} no encontrado.`, 404);
      return true;
    } catch (e: any) {
      if (e?.code === '23503') throw new AppError('No se puede eliminar: el proveedor tiene adjudicaciones.', 409);
      throw e;
    }
  }
}
import { ProveedoresRepository, CreacionProveedor } from '../data/ProveedoresRepository';
import { Proveedor } from '../models/Proveedores';

export class ProveedoresService {
  private repo = new ProveedoresRepository();

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async listarProveedores(): Promise<Proveedor[]> {
    return await this.repo.obtenerTodos();
  }

  async obtenerProveedorPorId(id: number): Promise<Proveedor> {
    const proveedor = await this.repo.obtenerPorId(id);
    if (!proveedor) throw new Error(`Proveedor con ID ${id} no encontrado.`);
    return proveedor;
  }

  async registrarProveedor(proveedor: CreacionProveedor): Promise<Proveedor> {
    if (!this.validarEmail(proveedor.email)) {
      throw new Error(`El correo '${proveedor.email}' no tiene un formato válido (debe incluir '@' y un dominio).`);
    }

    if (!proveedor.nit || proveedor.nit.trim().length < 4) {
      throw new Error('El NIT del proveedor es obligatorio y debe tener un formato válido.');
    }

    if (!proveedor.razon_social || proveedor.razon_social.trim().length < 3) {
      throw new Error('La razón social debe contener al menos 3 caracteres.');
    }

    if (proveedor.calificacion !== undefined && (proveedor.calificacion < 0 || proveedor.calificacion > 5)) {
      throw new Error('La calificación del proveedor debe estar entre 0.0 y 5.0.');
    }

    const existeNit = await this.repo.obtenerPorNit(proveedor.nit);
    if (existeNit) throw new Error(`El NIT ${proveedor.nit} ya pertenece a otro proveedor.`);

    return await this.repo.crear(proveedor);
  }

  async actualizarProveedor(id: number, proveedor: Partial<Proveedor>): Promise<Proveedor> {
    if (proveedor.email && !this.validarEmail(proveedor.email)) {
      throw new Error(`El correo '${proveedor.email}' no es válido.`);
    }

    if (proveedor.calificacion !== undefined && (proveedor.calificacion < 0 || proveedor.calificacion > 5)) {
      throw new Error('La calificación debe estar entre 0.0 y 5.0.');
    }

    const actualizado = await this.repo.actualizar(id, proveedor);
    if (!actualizado) throw new Error(`No se pudo actualizar el proveedor con ID ${id}.`);
    return actualizado;
  }

  async eliminarProveedor(id: number): Promise<boolean> {
    const eliminado = await this.repo.eliminar(id);
    if (!eliminado) throw new Error(`No se pudo eliminar el proveedor con ID ${id}.`);
    return true;
  }
}
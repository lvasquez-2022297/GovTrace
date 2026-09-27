import { ProveedoresRepository } from '../data/ProveedoresRepository';
import { Proveedor } from '../models/Proveedores';

export class ProveedoresService {
  private repo = new ProveedoresRepository();

  async listarProveedores(): Promise<Proveedor[]> {
    return await this.repo.obtenerTodos();
  }

  async obtenerProveedorPorId(id: number): Promise<Proveedor> {
    const proveedor = await this.repo.obtenerPorId(id);
    if (!proveedor) throw new Error(`Proveedor con ID ${id} no encontrado.`);
    return proveedor;
  }

  async registrarProveedor(proveedor: Proveedor): Promise<Proveedor> {
    if (!proveedor.nit || !proveedor.razon_social) {
      throw new Error('El NIT y la Razón Social son campos obligatorios.');
    }
    return await this.repo.crear(proveedor);
  }

  async actualizarProveedor(id: number, proveedor: Partial<Proveedor>): Promise<Proveedor> {
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
import { LicitacionesRepository } from '../data/LicitacionesRepository';
import { Licitacion } from '../models/Licitaciones';

export class LicitacionesService {
  private repo = new LicitacionesRepository();

  async listarLicitaciones(): Promise<Licitacion[]> {
    return await this.repo.obtenerTodas();
  }

  async obtenerLicitacionPorId(id: number): Promise<Licitacion> {
    const licitacion = await this.repo.obtenerPorId(id);
    if (!licitacion) throw new Error(`Licitación con ID ${id} no encontrada.`);
    return licitacion;
  }

  async crearLicitacion(licitacion: Licitacion): Promise<Licitacion> {
    if (licitacion.presupuesto_asignado <= 0) {
      throw new Error('El presupuesto asignado debe ser mayor a 0.');
    }
    return await this.repo.crear(licitacion);
  }

  async actualizarLicitacion(id: number, licitacion: Partial<Licitacion>): Promise<Licitacion> {
    const actualizada = await this.repo.actualizar(id, licitacion);
    if (!actualizada) throw new Error(`No se pudo actualizar la licitación con ID ${id}.`);
    return actualizada;
  }

  async cambiarEstado(id: number, nuevoEstado: string): Promise<boolean> {
    return await this.repo.actualizarEstado(id, nuevoEstado);
  }

  async eliminarLicitacion(id: number): Promise<boolean> {
    const eliminada = await this.repo.eliminar(id);
    if (!eliminada) throw new Error(`No se pudo eliminar la licitación con ID ${id}.`);
    return true;
  }
}
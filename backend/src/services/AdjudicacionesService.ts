import { AdjudicacionesRepository } from '../data/AdjudicacionesRepository';
import { LicitacionesRepository } from '../data/LicitacionesRepository';
import { Adjudicacion } from '../models/Adjudicaciones';

export class AdjudicacionesService {
  private repo = new AdjudicacionesRepository();
  private licitacionRepo = new LicitacionesRepository();

  async listarAdjudicaciones(): Promise<Adjudicacion[]> {
    return await this.repo.obtenerTodas();
  }

  async obtenerAdjudicacionPorId(id: number): Promise<Adjudicacion> {
    const adjudicacion = await this.repo.obtenerPorId(id);
    if (!adjudicacion) throw new Error(`Adjudicación con ID ${id} no encontrada.`);
    return adjudicacion;
  }

  async adjudicarLicitacion(adjudicacion: Adjudicacion): Promise<Adjudicacion> {
    const licitacion = await this.licitacionRepo.obtenerPorId(adjudicacion.licitacion_id);
    if (!licitacion) throw new Error('La licitación especificada no existe.');

    if (adjudicacion.monto_adjudicado > licitacion.presupuesto_asignado) {
      throw new Error('El monto adjudicado no puede superar el presupuesto asignado.');
    }

    const nuevaAdjudicacion = await this.repo.crear(adjudicacion);
    await this.licitacionRepo.actualizarEstado(adjudicacion.licitacion_id, 'ADJUDICADA');
    return nuevaAdjudicacion;
  }

  async actualizarAdjudicacion(id: number, adjudicacion: Partial<Adjudicacion>): Promise<Adjudicacion> {
    const actualizada = await this.repo.actualizar(id, adjudicacion);
    if (!actualizada) throw new Error(`No se pudo actualizar la adjudicación con ID ${id}.`);
    return actualizada;
  }

  async eliminarAdjudicacion(id: number): Promise<boolean> {
    const eliminada = await this.repo.eliminar(id);
    if (!eliminada) throw new Error(`No se pudo eliminar la adjudicación con ID ${id}.`);
    return true;
  }
}
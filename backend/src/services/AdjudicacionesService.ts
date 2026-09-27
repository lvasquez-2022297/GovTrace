import { AdjudicacionesRepository, CreacionAdjudicacion } from '../data/AdjudicacionesRepository';
import { LicitacionesRepository } from '../data/LicitacionesRepository';
import { ProveedoresRepository } from '../data/ProveedoresRepository';
import { Adjudicacion } from '../models/Adjudicaciones';

export class AdjudicacionesService {
  private repo = new AdjudicacionesRepository();
  private licitacionRepo = new LicitacionesRepository();
  private proveedorRepo = new ProveedoresRepository();

  async listarAdjudicaciones(): Promise<Adjudicacion[]> {
    return await this.repo.obtenerTodas();
  }

  async obtenerAdjudicacionPorId(id: number): Promise<Adjudicacion> {
    const adjudicacion = await this.repo.obtenerPorId(id);
    if (!adjudicacion) throw new Error(`Adjudicación con ID ${id} no encontrada.`);
    return adjudicacion;
  }

  async adjudicarLicitacion(adjudicacion: CreacionAdjudicacion): Promise<Adjudicacion> {
    if (!adjudicacion.monto_adjudicado || adjudicacion.monto_adjudicado <= 0) {
      throw new Error('El monto adjudicado debe ser mayor a 0.');
    }

    const licitacion = await this.licitacionRepo.obtenerPorId(adjudicacion.licitacion_id);
    if (!licitacion) throw new Error(`La licitación con ID ${adjudicacion.licitacion_id} no existe.`);

    const adjudicacionExistente = await this.repo.obtenerPorLicitacionId(adjudicacion.licitacion_id);
    if (adjudicacionExistente) {
      throw new Error(`La licitación ID ${adjudicacion.licitacion_id} ya fue adjudicada anteriormente.`);
    }

    const proveedor = await this.proveedorRepo.obtenerPorId(adjudicacion.proveedor_id);
    if (!proveedor) throw new Error(`El proveedor con ID ${adjudicacion.proveedor_id} no existe.`);

    if (adjudicacion.monto_adjudicado > licitacion.presupuesto_asignado) {
      throw new Error(
        `El monto adjudicado (Q${adjudicacion.monto_adjudicado}) no puede superar el presupuesto asignado a la licitación (Q${licitacion.presupuesto_asignado}).`
      );
    }

    const nuevaAdjudicacion = await this.repo.crear(adjudicacion);
    await this.licitacionRepo.actualizarEstado(adjudicacion.licitacion_id, 'ADJUDICADA');

    return nuevaAdjudicacion;
  }

  async actualizarAdjudicacion(id: number, adjudicacion: Partial<Adjudicacion>): Promise<Adjudicacion> {
    if (adjudicacion.monto_adjudicado !== undefined && adjudicacion.monto_adjudicado <= 0) {
      throw new Error('El monto adjudicado debe ser mayor a 0.');
    }

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
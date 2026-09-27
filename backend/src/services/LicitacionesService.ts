import { LicitacionesRepository, CreacionLicitacion } from '../data/LicitacionesRepository';
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

  async crearLicitacion(licitacion: CreacionLicitacion): Promise<Licitacion> {
    if (!licitacion.codigo_licitacion || licitacion.codigo_licitacion.trim() === '') {
      throw new Error('El código de licitación es obligatorio.');
    }

    if (!licitacion.presupuesto_asignado || licitacion.presupuesto_asignado <= 0) {
      throw new Error('El presupuesto asignado debe ser una cantidad numérica mayor a 0.');
    }

    const fInicio = new Date(licitacion.fecha_inicio);
    const fCierre = new Date(licitacion.fecha_cierre);

    if (isNaN(fInicio.getTime()) || isNaN(fCierre.getTime())) {
      throw new Error('Las fechas de inicio y cierre deben tener un formato de fecha válido.');
    }

    if (fCierre <= fInicio) {
      throw new Error('La fecha de cierre de la licitación debe ser posterior a la fecha de inicio.');
    }

    const existe = await this.repo.obtenerPorCodigo(licitacion.codigo_licitacion);
    if (existe) throw new Error(`La licitación con código ${licitacion.codigo_licitacion} ya existe.`);

    return await this.repo.crear(licitacion);
  }

  async actualizarLicitacion(id: number, licitacion: Partial<Licitacion>): Promise<Licitacion> {
    if (licitacion.presupuesto_asignado !== undefined && licitacion.presupuesto_asignado <= 0) {
      throw new Error('El presupuesto asignado debe ser mayor a 0.');
    }

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
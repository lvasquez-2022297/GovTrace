import { AdjudicacionesRepository } from '../data/AdjudicacionesRepository';
import { AppError } from '../utils/AppError';

export class AdjudicacionesService {
  private repo = new AdjudicacionesRepository();

  private validarComun(d: any) {
    const proveedor_id = Number(d?.proveedor_id);
    const monto = Number(d?.monto_adjudicado);
    if (!Number.isInteger(proveedor_id) || proveedor_id <= 0) throw new AppError('Selecciona un proveedor.', 400);
    if (!Number.isFinite(monto) || monto <= 0) throw new AppError('El monto debe ser mayor a 0.', 400);
    return {
      proveedor_id,
      monto_adjudicado: monto,
      observaciones: String(d?.observaciones ?? '').trim() || null
    };
  }

  async listarAdjudicaciones() {
    return await this.repo.obtenerTodas();
  }

  async obtenerAdjudicacionPorId(id: number) {
    const a = await this.repo.obtenerPorId(id);
    if (!a) throw new AppError(`Adjudicación con ID ${id} no encontrada.`, 404);
    return a;
  }

  async adjudicarLicitacion(datos: any) {
    const licitacion_id = Number(datos?.licitacion_id);
    if (!Number.isInteger(licitacion_id) || licitacion_id <= 0) throw new AppError('Selecciona una licitación.', 400);

    const comun = this.validarComun(datos);

    const estado = await this.repo.estadoLicitacion(licitacion_id);
    if (!estado) throw new AppError('La licitación indicada no existe.', 404);
    if (estado === 'CANCELADA') throw new AppError('No se puede adjudicar una licitación cancelada.', 400);
    if (!(await this.repo.existeProveedor(comun.proveedor_id))) throw new AppError('El proveedor indicado no existe.', 404);

    try {
      return await this.repo.crear({ licitacion_id, ...comun });
    } catch (e: any) {
      if (e?.code === '23505') throw new AppError('Esta licitación ya fue adjudicada.', 409);
      throw e;
    }
  }

  async actualizarAdjudicacion(id: number, datos: any) {
    const comun = this.validarComun(datos);
    if (!(await this.repo.existeProveedor(comun.proveedor_id))) throw new AppError('El proveedor indicado no existe.', 404);
    const a = await this.repo.actualizar(id, comun);
    if (!a) throw new AppError(`Adjudicación con ID ${id} no encontrada.`, 404);
    return a;
  }

  async eliminarAdjudicacion(id: number): Promise<boolean> {
    if (!(await this.repo.eliminar(id))) throw new AppError(`Adjudicación con ID ${id} no encontrada.`, 404);
    return true;
  }
}
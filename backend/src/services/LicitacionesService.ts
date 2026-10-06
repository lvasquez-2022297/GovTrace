import { LicitacionesRepository, LicitacionDatos, EstadoLicitacion } from '../data/LicitacionesRepository';
import { AppError } from '../utils/AppError';

const ESTADOS: EstadoLicitacion[] = ['PUBLICADA', 'ADJUDICADA', 'CANCELADA', 'CON_ALERTA'];
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export class LicitacionesService {
  private repo = new LicitacionesRepository();

  private validar(d: any): LicitacionDatos {
    const codigo = String(d?.codigo_licitacion ?? '').trim();
    const titulo = String(d?.titulo ?? '').trim();
    const presupuesto = Number(d?.presupuesto_asignado);
    const estado = d?.estado ?? 'PUBLICADA';

    if (!codigo || codigo.length > 50) throw new AppError('El código es obligatorio (máx. 50 caracteres).', 400);
    if (!titulo || titulo.length > 200) throw new AppError('El título es obligatorio (máx. 200 caracteres).', 400);
    if (!Number.isFinite(presupuesto) || presupuesto <= 0) throw new AppError('El presupuesto debe ser mayor a 0.', 400);
    if (!ESTADOS.includes(estado)) throw new AppError('Estado inválido.', 400);
    if (!FECHA.test(d?.fecha_inicio ?? '') || !FECHA.test(d?.fecha_cierre ?? '')) {
      throw new AppError('Las fechas deben tener formato AAAA-MM-DD.', 400);
    }
    if (d.fecha_cierre < d.fecha_inicio) {
      throw new AppError('La fecha de cierre no puede ser anterior a la de inicio.', 400);
    }

    return {
      codigo_licitacion: codigo,
      titulo,
      descripcion: String(d?.descripcion ?? '').trim() || null,
      entidad: String(d?.entidad ?? '').trim() || null,
      presupuesto_asignado: presupuesto,
      estado,
      fecha_inicio: d.fecha_inicio,
      fecha_cierre: d.fecha_cierre,
      creado_por: d?.creado_por ?? null
    };
  }

  async listarLicitaciones() {
    return await this.repo.obtenerTodas();
  }

  async cambiarEstado(id: number, estado: string) {
  const estadosValidos: EstadoLicitacion[] = ['PUBLICADA', 'ADJUDICADA', 'CANCELADA', 'CON_ALERTA'];
  
  if (!estadosValidos.includes(estado as EstadoLicitacion)) {
    throw new AppError('Estado no válido.', 400);
  }

  const licitacionExistente = await this.obtenerLicitacionPorId(id);

  const datosActualizados = this.validar({
    ...licitacionExistente,
    estado: estado as EstadoLicitacion
  });

  const actualizada = await this.repo.actualizar(id, datosActualizados);
  if (!actualizada) throw new AppError(`Licitación con ID ${id} no encontrada.`, 404);

  return actualizada;
}

  async obtenerLicitacionPorId(id: number) {
    const l = await this.repo.obtenerPorId(id); 
    if (!l) throw new AppError(`Licitación con ID ${id} no encontrada.`, 404);
    return l;
  }

  async crearLicitacion(datos: any) {
    return await this.repo.crear(this.validar(datos));
  }

  async actualizarLicitacion(id: number, datos: any) {
    const l = await this.repo.actualizar(id, this.validar(datos));
    if (!l) throw new AppError(`Licitación con ID ${id} no encontrada.`, 404);
    return l;
  }

  async eliminarLicitacion(id: number): Promise<boolean> {
    if (!(await this.repo.eliminar(id))) throw new AppError(`Licitación con ID ${id} no encontrada.`, 404);
    return true;
  }
}
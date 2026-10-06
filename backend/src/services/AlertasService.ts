import { AlertasRepository, AlertaDatos } from '../data/AlertasRepository';
import { AppError } from '../utils/AppError';

const TIPOS = ['SOBRECOSTO', 'PROVEEDOR_INHABILITADO', 'TIEMPO_IRREGULAR', 'DENUNCIA_CIUDADANA'];
const NIVELES = ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'];

export class AlertasService {
  private repo = new AlertasRepository();

  private async validar(d: any): Promise<AlertaDatos> {
    const licitacion_id = Number(d?.licitacion_id);
    const descripcion = String(d?.descripcion ?? '').trim();
    const tipo_alerta = d?.tipo_alerta;
    const nivel_riesgo = d?.nivel_riesgo ?? 'MEDIO';

    if (!Number.isInteger(licitacion_id) || licitacion_id <= 0) throw new AppError('Selecciona una licitación.', 400);
    if (!TIPOS.includes(tipo_alerta)) throw new AppError('Tipo de alerta inválido.', 400);
    if (!NIVELES.includes(nivel_riesgo)) throw new AppError('Nivel de riesgo inválido.', 400);
    if (!descripcion) throw new AppError('La descripción es obligatoria.', 400);
    if (!(await this.repo.existeLicitacion(licitacion_id))) throw new AppError('La licitación indicada no existe.', 404);

    return { licitacion_id, tipo_alerta, descripcion, nivel_riesgo };
  }

  async listarAlertas() {
    return await this.repo.obtenerTodas();
  }

  async registrarAlerta(datos: any) {
    return await this.repo.crear(await this.validar(datos));
  }

  async actualizarAlerta(id: number, datos: any) {
    const a = await this.repo.actualizar(id, await this.validar(datos));
    if (!a) throw new AppError(`Alerta con ID ${id} no encontrada.`, 404);
    return a;
  }

  async eliminarAlerta(id: number): Promise<boolean> {
    if (!(await this.repo.eliminar(id))) throw new AppError(`Alerta con ID ${id} no encontrada.`, 404);
    return true;
  }
}
import { AlertasRepository, CreacionAlerta } from '../data/AlertasRepository';
import { LicitacionesRepository } from '../data/LicitacionesRepository';
import { Alerta } from '../models/Alertas';

export class AlertasService {
  private repo = new AlertasRepository();
  private licitacionRepo = new LicitacionesRepository();

  async listarAlertas(): Promise<Alerta[]> {
    return await this.repo.obtenerTodas();
  }

  async obtenerAlertaPorId(id: number): Promise<Alerta> {
    const alerta = await this.repo.obtenerPorId(id);
    if (!alerta) throw new Error(`Alerta con ID ${id} no encontrada.`);
    return alerta;
  }

  async registrarAlerta(alerta: CreacionAlerta): Promise<Alerta> {
    if (!alerta.descripcion || alerta.descripcion.trim().length < 5) {
      throw new Error('La descripción de la alerta debe tener al menos 5 caracteres.');
    }

    const licitacion = await this.licitacionRepo.obtenerPorId(alerta.licitacion_id);
    if (!licitacion) throw new Error(`La licitación asociada con ID ${alerta.licitacion_id} no existe.`);

    const nuevaAlerta = await this.repo.crear(alerta);

    if (alerta.nivel_riesgo === 'CRITICO' || alerta.nivel_riesgo === 'ALTO') {
      await this.licitacionRepo.actualizarEstado(alerta.licitacion_id, 'CON_ALERTA');
    }

    return nuevaAlerta;
  }

  async actualizarAlerta(id: number, alerta: Partial<Alerta>): Promise<Alerta> {
    const actualizada = await this.repo.actualizar(id, alerta);
    if (!actualizada) throw new Error(`No se pudo actualizar la alerta con ID ${id}.`);
    return actualizada;
  }

  async eliminarAlerta(id: number): Promise<boolean> {
    const eliminada = await this.repo.eliminar(id);
    if (!eliminada) throw new Error(`No se pudo eliminar la alerta con ID ${id}.`);
    return true;
  }
}
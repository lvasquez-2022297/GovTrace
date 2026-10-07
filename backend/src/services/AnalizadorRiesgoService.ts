import { LicitacionesService } from './LicitacionesService';
import { AlertasService } from './AlertasService';
import { ProveedoresService } from './ProveedoresService';
import { AdjudicacionesService } from './AdjudicacionesService';
import { LoggerUtils } from '../utils/LoggerUtils';

export class AnalizadorRiesgoService {
  private licitaciones = new LicitacionesService();
  private alertas = new AlertasService();
  private proveedores = new ProveedoresService();
  private adjudicaciones = new AdjudicacionesService();
  private intervaloId: NodeJS.Timeout | null = null;
  public lastRun: Date | null = null;
  public isRunning = false;

  /**
   * Ejecuta un análisis simple de riesgo sobre las licitaciones y adjudicaciones.
   * Crea alertas cuando detecta: tiempos irregulares, sobrecostos y proveedores con baja calificación.
   * Se puede llamar al inicio y/o programar su ejecución periódica.
   */
  public async ejecutarAnalisisContinuo(): Promise<void> {
    if (this.isRunning) {
      LoggerUtils.warn('Analizador ya se está ejecutando. Ignorando llamada concurrente.');
      return;
    }
    this.isRunning = true;
    this.lastRun = new Date();
    try {
      LoggerUtils.info('Iniciando análisis de riesgo automático...');

      const licitaciones = await this.licitaciones.listarLicitaciones();
      const adjudicaciones = await this.adjudicaciones.listarAdjudicaciones();
      const existentes = await this.alertas.listarAlertas();

      const presupuestos = licitaciones.map((l: any) => Number(l.presupuesto_asignado) || 0).filter((p: number) => p > 0);
      const avgPresupuesto = presupuestos.length ? presupuestos.reduce((a: number, b: number) => a + b, 0) / presupuestos.length : 0;

      for (const l of licitaciones) {
        try {
          const id = Number(l.id);
          const inicio = new Date(l.fecha_inicio);
          const cierre = new Date(l.fecha_cierre);
          const diffDays = Math.ceil((cierre.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

          // Regla: tiempo irregular si duración < 15 días
          if (diffDays < 15) {
            const ya = existentes.some((a: any) => Number(a.licitacion_id) === id && a.tipo_alerta === 'TIEMPO_IRREGULAR');
            if (!ya) {
              await this.alertas.registrarAlerta({
                licitacion_id: id,
                tipo_alerta: 'TIEMPO_IRREGULAR',
                descripcion: `Duración de ${diffDays} días menor al mínimo esperado (15 días).`,
                nivel_riesgo: 'BAJO'
              }).catch((e: any) => LoggerUtils.warn(`No se pudo crear alerta TIEMPO_IRREGULAR para lic ${id}: ${e?.message || e}`));
            }
          }

          // Regla: sobrecosto si presupuesto > 1.3 * promedio
          const presupuesto = Number(l.presupuesto_asignado) || 0;
          if (avgPresupuesto > 0 && presupuesto > avgPresupuesto * 1.3) {
            const ya = existentes.some((a: any) => Number(a.licitacion_id) === id && a.tipo_alerta === 'SOBRECOSTO');
            if (!ya) {
              await this.alertas.registrarAlerta({
                licitacion_id: id,
                tipo_alerta: 'SOBRECOSTO',
                descripcion: `Presupuesto ${presupuesto.toFixed(2)} significativamente mayor que el promedio (${avgPresupuesto.toFixed(2)}).`,
                nivel_riesgo: 'ALTO'
              }).catch((e: any) => LoggerUtils.warn(`No se pudo crear alerta SOBRECOSTO para lic ${id}: ${e?.message || e}`));
            }
          }
        } catch (e: any) {
          LoggerUtils.error('Error evaluando licitación en analizador de riesgo.', e);
        }
      }

      // Regla en adjudicaciones: proveedor con calificación baja
      for (const a of adjudicaciones) {
        try {
          const licId = Number(a.licitacion_id);
          const proveedorId = Number(a.proveedor_id);
          const p = await this.proveedores.obtenerProveedorPorId(proveedorId).catch(() => null);
          if (p) {
            const cal = Number(p.calificacion ?? 5);
            if (cal < 3.0) {
              const ya = existentes.some((x: any) => Number(x.licitacion_id) === licId && x.tipo_alerta === 'PROVEEDOR_INHABILITADO');
              if (!ya) {
                await this.alertas.registrarAlerta({
                  licitacion_id: licId,
                  tipo_alerta: 'PROVEEDOR_INHABILITADO',
                  descripcion: `Proveedor ID ${proveedorId} con calificación baja (${cal}).`,
                  nivel_riesgo: 'CRITICO'
                }).catch((e: any) => LoggerUtils.warn(`No se pudo crear alerta PROVEEDOR_INHABILITADO para lic ${licId}: ${e?.message || e}`));
              }
            }
          }
        } catch (e: any) {
          LoggerUtils.error('Error evaluando adjudicación en analizador de riesgo.', e);
        }
      }

      LoggerUtils.info('Análisis de riesgo finalizado.');
    } catch (e: any) {
      LoggerUtils.error('Error en ejecutarAnalisisContinuo:', e);
    }
    this.isRunning = false;
  }

  public startScheduler(ms: number = 1000 * 60 * 5): void {
    if (this.intervaloId) return;
    LoggerUtils.info(`Iniciando scheduler de analizador cada ${ms}ms.`);
    this.intervaloId = setInterval(() => { void this.ejecutarAnalisisContinuo(); }, ms);
  }

  public stopScheduler(): void {
    if (!this.intervaloId) return;
    clearInterval(this.intervaloId);
    this.intervaloId = null;
    LoggerUtils.info('Scheduler del analizador detenido.');
  }
}

export const analizadorRiesgo = new AnalizadorRiesgoService();

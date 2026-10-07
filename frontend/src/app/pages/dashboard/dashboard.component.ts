import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardData, DashboardMetrics, IndiceMinisterio } from '../../core/services/dashboard.service';
import { AnalizadorService } from '../../core/services/analizador.service';
import { Auth } from '../../core/services/auth.service';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class Dashboard implements OnInit {
  metrics: DashboardMetrics = {
    totalPresupuesto: 0,
    alertasActivas: 0,
    ministeriosAuditados: 0,
    proveedoresRegistrados: 0
  };
  extra = { adjudicadas: 0, alertasCriticas: 0, licitaciones: 0 };
  ministeriosIndex: IndiceMinisterio[] = [];

  cargando = true;
  errorMensaje = '';

  filtroSeleccionado = 'TODOS';
  instituciones: string[] = [];

  // Analizador
  analizadorCargando = false;
  analizadorStatus: { isRunning: boolean; lastRun: string | null } | null = null;
  ultimasAlertas: any[] = [];
  isAdmin = false;
  btnAnimating = false;

  private datos: DashboardData | null = null;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private analizadorService: AnalizadorService,
    private auth: Auth,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getData().subscribe({
      next: (data) => {
        this.datos = data;
        this.instituciones = [...new Set(
          data.licitaciones.map((l) => l.entidad).filter(Boolean)
        )].sort() as string[];
        this.calcular();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando el dashboard:', err);
        this.errorMensaje = 'No se pudieron cargar las métricas. Intenta de nuevo más tarde.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    // cargar estado y ultimas alertas del analizador
    this.loadAnalizadorStatus();
    this.loadUltimasAlertas(5);

    // determinar si el usuario es ADMIN para mostrar controles
    this.isAdmin = this.auth.esAdmin();
    this.auth.currentUser$.subscribe(() => { this.isAdmin = this.auth.esAdmin(); this.cdr.detectChanges(); });
  }

  private loadAnalizadorStatus(): void {
    this.analizadorService.status().subscribe({
      next: (r) => { this.analizadorStatus = r.data; this.cdr.detectChanges(); },
      error: () => { this.analizadorStatus = null; this.cdr.detectChanges(); }
    });
  }

  private loadUltimasAlertas(limit = 5): void {
    this.analizadorService.ultimas(limit).subscribe({
      next: (r) => { this.ultimasAlertas = r.data || []; this.cdr.detectChanges(); },
      error: () => { this.ultimasAlertas = []; this.cdr.detectChanges(); }
    });
  }

  runAnalizador(): void {
    // Animación de botón
    this.btnAnimating = true;
    setTimeout(() => (this.btnAnimating = false), 600);

    // Feedback inmediato
    console.log('Ejecutando analizador (petición enviada)');
    this.toast.show('Iniciando análisis...', 'info', 2000);

    this.analizadorCargando = true;
    this.analizadorService.run().subscribe({
      next: () => {
        this.analizadorCargando = false;
        this.loadAnalizadorStatus();
        this.loadUltimasAlertas(5);
        this.toast.show('Análisis ejecutado correctamente', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error ejecutando analizador:', err);
        this.analizadorCargando = false;
        const msg = err?.error?.message || err?.statusText || 'Error ejecutando el análisis';
        this.toast.show(`Error: ${msg}`, 'error');
        this.cdr.detectChanges();
      }
    });
  }

  setFiltro(filtro: string): void {
    this.filtroSeleccionado = filtro;
    this.calcular();
    this.cdr.detectChanges();
  }

  private calcular(): void {
    if (!this.datos) return;
    const { licitaciones, alertas, totalProveedores } = this.datos;
    const conAlerta = new Set(alertas.map((a) => a.licitacion_id));

    const porEntidad = new Map<string, { total: number; alertadas: number }>();
    for (const l of licitaciones) {
      if (!l.entidad) continue;
      const e = porEntidad.get(l.entidad) ?? { total: 0, alertadas: 0 };
      e.total++;
      if (conAlerta.has(l.id)) e.alertadas++;
      porEntidad.set(l.entidad, e);
    }
    this.ministeriosIndex = [...porEntidad.entries()]
      .map(([institucion, e]) => {
        const tasa = Math.round((e.alertadas / e.total) * 1000) / 10;
        return { institucion, tasaAlerta: tasa, indiceTransparencia: Math.round((100 - tasa) * 10) / 10 };
      })
      .sort((a, b) => b.indiceTransparencia - a.indiceTransparencia)
      .map((m, i) => ({ ranking: i + 1, ...m }));

    let lics = licitaciones;
    if (this.filtroSeleccionado === 'ALERTA') lics = licitaciones.filter((l) => conAlerta.has(l.id));
    else if (this.filtroSeleccionado !== 'TODOS') lics = licitaciones.filter((l) => l.entidad === this.filtroSeleccionado);

    const ids = new Set(lics.map((l) => l.id));
    this.metrics = {
      totalPresupuesto: lics.reduce((s, l) => s + Number(l.presupuesto_asignado || 0), 0),
      alertasActivas: alertas.filter((a) => ids.has(a.licitacion_id)).length,
      ministeriosAuditados: new Set(lics.map((l) => l.entidad).filter(Boolean)).size,
      proveedoresRegistrados: totalProveedores
    };

    this.extra = {
      adjudicadas: lics.filter((l) => l.estado === 'ADJUDICADA').length,
      alertasCriticas: alertas.filter(
        (a) => ids.has(a.licitacion_id) && (a.nivel_riesgo === 'ALTO' || a.nivel_riesgo === 'CRITICO')
      ).length,
      licitaciones: lics.length
    };
  }
}
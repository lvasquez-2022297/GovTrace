import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardMetrics } from '../../core/services/dashboard.service';

interface IndiceMinisterio {
  ranking: number;
  institucion: string;
  indiceTransparencia: number;
  tasaAlerta: number;
}

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

  cargando = true;
  errorMensaje = '';

  searchQuery = '';
  filtroSeleccionado = 'Todos';

  ministeriosIndex: IndiceMinisterio[] = [
    { ranking: 1, institucion: 'Ministerio de Finanzas', indiceTransparencia: 96.4, tasaAlerta: 1.2 },
    { ranking: 2, institucion: 'Ministerio de Educación', indiceTransparencia: 89.1, tasaAlerta: 3.4 },
    { ranking: 3, institucion: 'Obras Públicas', indiceTransparencia: 78.2, tasaAlerta: 8.5 },
    { ranking: 4, institucion: 'Ministerio de Salud', indiceTransparencia: 54.8, tasaAlerta: 24.1 },
    { ranking: 5, institucion: 'Ministerio de Comunicaciones', indiceTransparencia: 42.0, tasaAlerta: 36.5 }
  ];

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando métricas del dashboard:', err);
        this.errorMensaje = 'No se pudieron cargar las métricas. Intenta de nuevo más tarde.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  setFiltro(categoria: string): void {
    this.filtroSeleccionado = categoria;
    this.cdr.detectChanges();
  }
}
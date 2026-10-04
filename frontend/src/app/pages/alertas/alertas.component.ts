import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertasService, Alerta } from '../../core/services/alertas.service';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css'
})
export class Alertas implements OnInit {
  alertas: Alerta[] = [
    {
      id: 1,
      nog: 'NOG-9981234',
      tituloLicitacion: 'Mantenimiento Red Vial Ruta Interamericana',
      entidad: 'Ministerio de Comunicaciones',
      tipoAlerta: 'SOBREPRECIO',
      nivelRiesgo: 'ALTO',
      desviacionPorcentaje: 45.8,
      fechaDeteccion: '2026-09-18'
    },
    {
      id: 2,
      nog: 'NOG-4410293',
      tituloLicitacion: 'Suministro de Trajes Quirúrgicos',
      entidad: 'Ministerio de Salud Pública',
      tipoAlerta: 'PROVEEDOR_UNICO',
      nivelRiesgo: 'MEDIO',
      desviacionPorcentaje: 18.2,
      fechaDeteccion: '2026-09-20'
    },
    {
      id: 3,
      nog: 'NOG-8812039',
      tituloLicitacion: 'Compra Directa de Papelería Institucional',
      entidad: 'Ministerio de Economía',
      tipoAlerta: 'FRACCIONAMIENTO',
      nivelRiesgo: 'ALTO',
      desviacionPorcentaje: 62.0,
      fechaDeteccion: '2026-09-22'
    }
  ];

  searchTerm: string = '';
  riesgoFiltro: string = 'TODOS';

  constructor(private alertasService: AlertasService) {}

  ngOnInit(): void {
    this.alertasService.getAll().subscribe({
      next: (data: Alerta[]) => {
        if (data && data.length > 0) {
          this.alertas = data;
        }
      },
      error: (err: unknown) => console.warn('Cargando alertas de prueba:', err)
    });
  }

  get alertasFiltradas(): Alerta[] {
    return this.alertas.filter(item => {
      const coincideTexto = (item.tituloLicitacion || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.nog.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.entidad.toLowerCase().includes(this.searchTerm.toLowerCase());

      const coincideRiesgo = this.riesgoFiltro === 'TODOS' || item.nivelRiesgo === this.riesgoFiltro;

      return coincideTexto && coincideRiesgo;
    });
  }
}
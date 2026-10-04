import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdjudicacionesService, Adjudicacion } from '../../core/services/adjudicaciones.service';

@Component({
  selector: 'app-adjudicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adjudicaciones.component.html',
  styleUrl: './adjudicaciones.component.css'
})
export class Adjudicaciones implements OnInit {
  adjudicaciones: Adjudicacion[] = [
    {
      id: 1,
      nog: 'NOG-3341092',
      tituloLicitacion: 'Suministro de Textos Escolares 2027',
      entidad: 'Ministerio de Educación',
      proveedorGanador: 'Editorial Educativa S.A.',
      nitProveedor: '554192-3',
      montoAdjudicado: 3400000,
      fechaAdjudicacion: '2026-08-30',
      estadoContrato: 'EN_EJECUCION'
    },
    {
      id: 2,
      nog: 'NOG-1029384',
      tituloLicitacion: 'Equipamiento Hospitalario Quirúrgico',
      entidad: 'Ministerio de Salud Pública',
      proveedorGanador: 'Farmacéutica Global de Guatemala',
      nitProveedor: '451928-1',
      montoAdjudicado: 5800000,
      fechaAdjudicacion: '2026-07-14',
      estadoContrato: 'EN_EJECUCION'
    },
    {
      id: 3,
      nog: 'NOG-7721049',
      tituloLicitacion: 'Construcción Puente Vehicular Chimaltenango',
      entidad: 'Ministerio de Comunicaciones',
      proveedorGanador: 'Constructora del Sur, S.A.',
      nitProveedor: '984123-0',
      montoAdjudicado: 12100000,
      fechaAdjudicacion: '2026-05-20',
      estadoContrato: 'FINALIZADO'
    }
  ];

  searchTerm: string = '';
  estadoFiltro: string = 'TODOS';

  constructor(private adjudicacionesService: AdjudicacionesService) {}

  ngOnInit(): void {
    this.adjudicacionesService.getAll().subscribe({
      next: (data: Adjudicacion[]) => {
        if (data && data.length > 0) {
          this.adjudicaciones = data;
        }
      },
      error: (err: unknown) => console.warn('Cargando adjudicaciones de prueba:', err)
    });
  }

  get adjudicacionesFiltradas(): Adjudicacion[] {
    return this.adjudicaciones.filter(item => {
      const coincideTexto = item.tituloLicitacion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.nog.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.entidad.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.proveedorGanador.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.nitProveedor.toLowerCase().includes(this.searchTerm.toLowerCase());

      const coincideEstado = this.estadoFiltro === 'TODOS' || item.estadoContrato === this.estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  }
}
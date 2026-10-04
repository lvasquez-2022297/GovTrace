import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LicitacionesService, Licitacion } from '../../core/services/licitaciones.service';

@Component({
  selector: 'app-licitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './licitaciones.component.html',
  styleUrl: './licitaciones.component.css'
})
export class Licitaciones implements OnInit {
  licitaciones: Licitacion[] = [
    {
      id: 1,
      noNog: 'NOG-1829304',
      titulo: 'Adquisición de Insumos Médicos Quirúrgicos',
      entidad: 'Ministerio de Salud Pública',
      montoEstimado: 1250000,
      estado: 'EN_PROCESO',
      fechaPublicacion: '2026-09-15'
    },
    {
      id: 2,
      noNog: 'NOG-9981234',
      titulo: 'Mantenimiento Red Vial Ruta Interamericana',
      entidad: 'Ministerio de Comunicaciones',
      montoEstimado: 8500000,
      estado: 'ALERTA',
      fechaPublicacion: '2026-09-18'
    },
    {
      id: 3,
      noNog: 'NOG-3341092',
      titulo: 'Suministro de Textos Escolares 2027',
      entidad: 'Ministerio de Educación',
      montoEstimado: 3400000,
      estado: 'ADJUDICADA',
      fechaPublicacion: '2026-08-30'
    }
  ];

  searchTerm: string = '';
  estadoFiltro: string = 'TODOS';

  constructor(private licitacionesService: LicitacionesService) {}

  ngOnInit(): void {
    this.licitacionesService.getAll().subscribe({
      next: (data: Licitacion[]) => {
        if (data && data.length > 0) {
          this.licitaciones = data;
        }
      },
      error: (err: unknown) => console.warn('Cargando licitaciones de prueba:', err)
    });
  }

  get licitacionesFiltradas(): Licitacion[] {
    return this.licitaciones.filter(item => {
      const coincideTexto = item.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.noNog.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.entidad.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const coincideEstado = this.estadoFiltro === 'TODOS' || item.estado === this.estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  }
}
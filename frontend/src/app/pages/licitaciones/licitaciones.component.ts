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
  licitaciones: Licitacion[] = [];
  cargando = true;
  errorMensaje = '';

  searchTerm = '';
  estadoFiltro = 'TODOS';

  constructor(private licitacionesService: LicitacionesService) {}

  ngOnInit(): void {
    this.licitacionesService.getAll().subscribe({
      next: (data) => {
        this.licitaciones = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando licitaciones:', err);
        this.errorMensaje = 'No se pudieron cargar las licitaciones. Intenta de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }

  get licitacionesFiltradas(): Licitacion[] {
    const texto = this.searchTerm.trim().toLowerCase();

    return this.licitaciones.filter((item) => {
      const coincideTexto =
        !texto ||
        item.titulo.toLowerCase().includes(texto) ||
        item.codigo_licitacion.toLowerCase().includes(texto) ||
        (item.entidad ?? '').toLowerCase().includes(texto);

      const coincideEstado = this.estadoFiltro === 'TODOS' || item.estado === this.estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  }
}
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
  adjudicaciones: Adjudicacion[] = [];
  cargando = true;
  errorMensaje = '';

  searchTerm = '';
  estadoFiltro = 'TODOS';

  constructor(private adjudicacionesService: AdjudicacionesService) {}

  ngOnInit(): void {
    this.adjudicacionesService.getAll().subscribe({
      next: (data) => {
        this.adjudicaciones = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando adjudicaciones:', err);
        this.errorMensaje = 'No se pudieron cargar las adjudicaciones. Intenta de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }

  get adjudicacionesFiltradas(): Adjudicacion[] {
    const texto = this.searchTerm.trim().toLowerCase();

    return this.adjudicaciones.filter((item) => {
      const coincideTexto =
        !texto ||
        item.tituloLicitacion.toLowerCase().includes(texto) ||
        item.nog.toLowerCase().includes(texto) ||
        item.entidad.toLowerCase().includes(texto) ||
        item.proveedorGanador.toLowerCase().includes(texto) ||
        item.nitProveedor.toLowerCase().includes(texto);

      const coincideEstado =
        this.estadoFiltro === 'TODOS' || item.estadoContrato === this.estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  }
}
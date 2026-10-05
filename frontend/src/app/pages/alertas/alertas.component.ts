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
  alertas: Alerta[] = [];
  cargando = true;
  errorMensaje = '';

  searchTerm = '';
  riesgoFiltro = 'TODOS';

  constructor(private alertasService: AlertasService) {}

  ngOnInit(): void {
    this.alertasService.getAll().subscribe({
      next: (data) => {
        this.alertas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando alertas:', err);
        this.errorMensaje = 'No se pudieron cargar las alertas. Intenta de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }

  get alertasFiltradas(): Alerta[] {
    const texto = this.searchTerm.trim().toLowerCase();

    return this.alertas.filter((item) => {
      const coincideTexto =
        !texto ||
        item.tituloLicitacion.toLowerCase().includes(texto) ||
        item.nog.toLowerCase().includes(texto) ||
        item.entidad.toLowerCase().includes(texto) ||
        item.descripcion.toLowerCase().includes(texto);

      const coincideRiesgo =
        this.riesgoFiltro === 'TODOS' || item.nivelRiesgo === this.riesgoFiltro;

      return coincideTexto && coincideRiesgo;
    });
  }
}
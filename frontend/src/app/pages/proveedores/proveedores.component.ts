import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedoresService, Proveedor } from '../../core/services/proveedores.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css'
})
export class Proveedores implements OnInit {
  proveedores: Proveedor[] = [];
  cargando = true;
  errorMensaje = '';

  searchTerm = '';
  calificacionFiltro = 'TODAS';

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit(): void {
    this.proveedoresService.getAll().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando proveedores:', err);
        this.errorMensaje = 'No se pudieron cargar los proveedores. Intenta de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }

  private nivel(calificacion: number): 'ALTA' | 'MEDIA' | 'BAJA' {
    if (calificacion >= 4) return 'ALTA';
    if (calificacion >= 2.5) return 'MEDIA';
    return 'BAJA';
  }

  get proveedoresFiltrados(): Proveedor[] {
    const texto = this.searchTerm.trim().toLowerCase();

    return this.proveedores.filter((item) => {
      const coincideTexto =
        !texto ||
        item.nombre.toLowerCase().includes(texto) ||
        item.nit.toLowerCase().includes(texto) ||
        item.email.toLowerCase().includes(texto);

      const coincideCalificacion =
        this.calificacionFiltro === 'TODAS' ||
        this.nivel(item.calificacion) === this.calificacionFiltro;

      return coincideTexto && coincideCalificacion;
    });
  }
}
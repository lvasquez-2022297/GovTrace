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
  proveedores: Proveedor[] = [
    {
      id: 1,
      nit: '984123-0',
      nombre: 'Constructora del Sur, S.A.',
      representanteLegal: 'Carlos Alberto Morales',
      estado: 'ACTIVO',
      contratosAdjudicados: 12,
      montoTotalContratado: 14500000
    },
    {
      id: 2,
      nit: '451928-1',
      nombre: 'Farmacéutica Global de Guatemala',
      representanteLegal: 'María Inés Estrada',
      estado: 'BAJO_INVESTIGACION',
      contratosAdjudicados: 5,
      montoTotalContratado: 8900000
    },
    {
      id: 3,
      nit: '331092-K',
      nombre: 'Tecnología Avanzada S.A.',
      representanteLegal: 'Roberto Gómez',
      estado: 'ACTIVO',
      contratosAdjudicados: 8,
      montoTotalContratado: 3200000
    },
    {
      id: 4,
      nit: '110293-8',
      nombre: 'Suministros Médicos S.A.',
      representanteLegal: 'Ana Lucía Méndez',
      estado: 'SUSPENDIDO',
      contratosAdjudicados: 2,
      montoTotalContratado: 750000
    }
  ];

  searchTerm: string = '';
  estadoFiltro: string = 'TODOS';

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit(): void {
    this.proveedoresService.getAll().subscribe({
      next: (data: Proveedor[]) => {
        if (data && data.length > 0) {
          this.proveedores = data;
        }
      },
      error: (err: unknown) => console.warn('Cargando proveedores de prueba:', err)
    });
  }

  get proveedoresFiltrados(): Proveedor[] {
    return this.proveedores.filter(item => {
      const coincideTexto = item.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.nit.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.representanteLegal.toLowerCase().includes(this.searchTerm.toLowerCase());

      const coincideEstado = this.estadoFiltro === 'TODOS' || item.estado === this.estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  }
}
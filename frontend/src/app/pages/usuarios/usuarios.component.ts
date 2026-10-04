import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, Usuario } from '../../core/services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class Usuarios implements OnInit {
  usuarios: Usuario[] = [
    {
      id: 1,
      nombre: 'Luis Vásquez',
      email: 'lvasquez@govtrace.gob.gt',
      rol: 'ADMINISTRADOR',
      departamento: 'Dirección de Tecnología',
      estado: 'ACTIVO',
      ultimoAcceso: '2026-10-03 18:45'
    },
    {
      id: 2,
      nombre: 'Carlos Mendoza',
      email: 'cmendoza@contraloria.gob.gt',
      rol: 'AUDITOR',
      departamento: 'Unidad de Fiscalización',
      estado: 'ACTIVO',
      ultimoAcceso: '2026-10-03 14:12'
    },
    {
      id: 3,
      nombre: 'Sofía Arriola',
      email: 'sarriola@minfin.gob.gt',
      rol: 'ANALISTA',
      departamento: 'Transparencia Fiscal',
      estado: 'ACTIVO',
      ultimoAcceso: '2026-10-02 09:30'
    },
    {
      id: 4,
      nombre: 'Jorge Ramírez',
      email: 'jramirez@gmail.com',
      rol: 'CIUDADANO',
      departamento: 'Monitoreo Ciudadano',
      estado: 'INACTIVO',
      ultimoAcceso: '2026-09-15 11:05'
    }
  ];

  searchTerm: string = '';
  rolFiltro: string = 'TODOS';

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.usuariosService.getAll().subscribe({
      next: (data: Usuario[]) => {
        if (data && data.length > 0) {
          this.usuarios = data;
        }
      },
      error: (err: unknown) => console.warn('Cargando usuarios de prueba:', err)
    });
  }

  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter(item => {
      const coincideTexto = item.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.departamento.toLowerCase().includes(this.searchTerm.toLowerCase());

      const coincideRol = this.rolFiltro === 'TODOS' || item.rol === this.rolFiltro;

      return coincideTexto && coincideRol;
    });
  }
}
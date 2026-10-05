import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../core/services/usuarios.service';
import { Auth } from '../../core/services/auth.service';
import { RolUsuario, Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class Usuarios implements OnInit {
  usuarios: Usuario[] = [];
  cargando = true;
  errorMensaje = '';

  busqueda = '';
  filtroRol: RolUsuario | 'TODOS' = 'TODOS';

  esAdmin = false;
  miId: number | null = null;

  constructor(
    private usuariosService: UsuariosService,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    const actual = this.authService.getUsuarioActual();
    this.esAdmin = actual?.rol === 'ADMIN';
    this.miId = actual?.id ?? null;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.errorMensaje = '';

    this.usuariosService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        this.errorMensaje = err.error?.message || 'No se pudo cargar la lista de usuarios.';
        this.cargando = false;
      }
    });
  }

  get usuariosFiltrados(): Usuario[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.usuarios.filter((u) => {
      const coincideRol = this.filtroRol === 'TODOS' || u.rol === this.filtroRol;
      const coincideTexto =
        !texto ||
        u.nombre.toLowerCase().includes(texto) ||
        u.email.toLowerCase().includes(texto);
      return coincideRol && coincideTexto;
    });
  }

  eliminar(usuario: Usuario): void {
    if (!confirm(`¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`)) return;

    this.usuariosService.eliminar(usuario.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter((u) => u.id !== usuario.id);
      },
      error: (err) => {
        this.errorMensaje = err.error?.message || 'No se pudo eliminar el usuario.';
      }
    });
  }
}
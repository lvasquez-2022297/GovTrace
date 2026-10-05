import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class Header {
  menuAbierto = false;

  constructor(
    public authService: Auth,
    private router: Router
  ) {}

  get usuario(): Usuario | null {
    return this.authService.getUsuarioActual();
  }

  get puedeVerUsuarios(): boolean {
    const rol = this.usuario?.rol;
    return rol === 'ADMIN' || rol === 'AUDITOR';
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  onLogout(): void {
    this.cerrarMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
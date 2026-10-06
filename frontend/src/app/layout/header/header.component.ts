import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class Header implements OnInit, OnDestroy {
  menuAbierto = false;
  usuarioActual: Usuario | null = null;
  private sub?: Subscription;

  constructor(
    public authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe((u) => {
      this.usuarioActual = u;
      this.cdr.detectChanges(); 
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get usuario(): Usuario | null {
    return this.usuarioActual;
  }

  get iniciales(): string {
    const partes = (this.usuarioActual?.nombre ?? '').trim().split(/\s+/).filter(Boolean);
    return partes.slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
  }

  get puedeVerUsuarios(): boolean {
    const rol = this.usuarioActual?.rol;
    return rol === 'ADMIN' ;
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    this.cdr.detectChanges();
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
    this.cdr.detectChanges();
  }

  onLogout(): void {
    this.cerrarMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
    this.cdr.detectChanges();
  }
}
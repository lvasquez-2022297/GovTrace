import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../core/services/auth.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { LicitacionesService } from '../../core/services/licitaciones.service';
import { Usuario } from '../../core/models/usuario.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class Perfil implements OnInit {
  usuario: Usuario | null = null;
  cargando = true;
  errorMensaje = '';
  exito = '';

  editando = false;
  guardando = false;
  errorForm = '';
  fotoRota = false;
  licitacionesCreadas: number | null = null;
  form: FormGroup;

  constructor(
    private authService: Auth,
    private usuariosService: UsuariosService,
    private licitacionesService: LicitacionesService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      foto_url: ['', [Validators.maxLength(500), Validators.pattern(/^(https?:\/\/.+)?$/i)]]
    });
    this.form.get('foto_url')!.valueChanges.subscribe(() => (this.fotoRota = false));
  }

  ngOnInit(): void {
    const actual = this.authService.getUsuarioActual();
    if (!actual) {
      this.errorMensaje = 'No se pudo identificar tu sesión.';
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    this.usuariosService.getPorId(actual.id).subscribe({
      next: (u) => {
    console.log('Perfil recibido:', u);
        this.usuario = u;
        this.cargando = false;
        if (u.rol === 'ADMIN') this.contarLicitaciones(u.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMensaje = err.error?.message || 'No se pudo cargar tu perfil.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private contarLicitaciones(id: number): void {
    this.licitacionesService.getAll().subscribe({
      next: (lista) => (this.licitacionesCreadas = lista.filter((l) => l.creado_por === id).length),
      error: () => (this.licitacionesCreadas = null)
    });
  }

  get iniciales(): string {
    const partes = (this.usuario?.nombre ?? '').trim().split(/\s+/).filter(Boolean);
    return partes.slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
  }

  get fotoMostrada(): string {
    const url = this.editando ? this.form.value.foto_url : this.usuario?.foto_url;
    return (url ?? '').trim();
  }

  get permisos(): string {
    switch (this.usuario?.rol) {
      case 'ADMIN': return 'Puedes crear, editar y eliminar licitaciones, proveedores, adjudicaciones, alertas y usuarios.';
      case 'AUDITOR': return 'Puedes consultar toda la información y la lista de usuarios.';
      default: return 'Puedes consultar licitaciones, adjudicaciones, proveedores y alertas.';
    }
  }

  editar(): void {
    if (!this.usuario) return;
    this.exito = '';
    this.errorForm = '';
    this.form.reset({ nombre: this.usuario.nombre, foto_url: this.usuario.foto_url ?? '' });
    this.editando = true;
    this.cdr.detectChanges();
  }

  cancelar(): void {
    this.editando = false;
    this.fotoRota = false;
    this.cdr.detectChanges();
  }

  guardar(): void {
    if (!this.usuario || this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.guardando = true;
    this.errorForm = '';
    this.cdr.detectChanges();
    const v = this.form.value;

    this.usuariosService.actualizar(this.usuario.id, {
      nombre: v.nombre.trim(),
      email: this.usuario.email,
      foto_url: (v.foto_url ?? '').trim() || null
    }).subscribe({
      next: (actualizado) => {
        this.usuario = actualizado;
        this.authService.guardarUsuarioLocal(actualizado);
        this.guardando = false;
        this.editando = false;
        this.fotoRota = false;
        this.exito = 'Perfil actualizado correctamente.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.errorForm = err.error?.message || 'No se pudo guardar el perfil.';
        this.cdr.detectChanges();
      }
    });
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && c.touched;
  }
}
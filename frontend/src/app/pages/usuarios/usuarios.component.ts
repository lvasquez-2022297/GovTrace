import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { UsuariosService, UsuarioEditarPayload } from '../../core/services/usuarios.service';
import { Auth } from '../../core/services/auth.service';
import { RolUsuario, Usuario } from '../../core/models/usuario.model';

const PATRON_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).+$/;

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

  modalAbierto = false;
  editando: Usuario | null = null;
  guardando = false;
  errorForm = '';
  form: FormGroup;

  constructor(
    private usuariosService: UsuariosService,
    private authService: Auth,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['CIUDADANO' as RolUsuario, [Validators.required]],
      password: ['']
    });
  }

  ngOnInit(): void {
    const actual = this.authService.getUsuarioActual();
    this.esAdmin = actual?.rol === 'ADMIN';
    this.miId = actual?.id ?? null;
    this.cargar();
    this.cdr.detectChanges();
  }

  cargar(): void {
    this.cargando = true;
    this.cdr.detectChanges();
    this.errorMensaje = '';
    this.usuariosService.getAll().subscribe({
      next: (data) => { this.usuarios = data; this.cargando = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.errorMensaje = err.error?.message || 'No se pudo cargar la lista de usuarios.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get usuariosFiltrados(): Usuario[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.usuarios.filter((u) => {
      const coincideRol = this.filtroRol === 'TODOS' || u.rol === this.filtroRol;
      const coincideTexto = !texto ||
        u.nombre.toLowerCase().includes(texto) ||
        u.email.toLowerCase().includes(texto);
      return coincideRol && coincideTexto;
    });
  }

  private configurarPassword(obligatoria: boolean): void {
    const c = this.form.get('password')!;
    c.setValidators(obligatoria
      ? [Validators.required, Validators.minLength(6), Validators.pattern(PATRON_PASSWORD)]
      : [Validators.minLength(6), Validators.pattern(PATRON_PASSWORD)]);
    c.updateValueAndValidity();
  }

  abrirCrear(): void {
    this.editando = null;
    this.errorForm = '';
    this.form.reset({ nombre: '', email: '', rol: 'CIUDADANO', password: '' });
    this.form.get('rol')?.enable();
    this.configurarPassword(true);
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  abrirEditar(u: Usuario): void {
    this.editando = u;
    this.cdr.detectChanges();
    this.errorForm = '';
    this.form.reset({ nombre: u.nombre, email: u.email, rol: u.rol, password: '' });
    if (u.id === this.miId) this.form.get('rol')?.disable(); else this.form.get('rol')?.enable();
    this.configurarPassword(false);
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void { this.modalAbierto = false; }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    this.errorForm = '';
    this.cdr.detectChanges();

    const v = this.form.getRawValue();

    if (!this.editando) {
      this.usuariosService.crear({
        nombre: v.nombre.trim(),
        email: v.email.trim(),
        password: v.password,
        rol: v.rol
      }).subscribe({
        next: () => this.terminarGuardado(),
        error: (err) => this.falloGuardado(err)
      });
      return;
    }

    const usuario = this.editando;
    const datos: UsuarioEditarPayload = { nombre: v.nombre.trim(), email: v.email.trim() };
    if (v.password) datos.password = v.password;
    const cambiaRol = usuario.id !== this.miId && v.rol !== usuario.rol;

    this.usuariosService.actualizar(usuario.id, datos).pipe(
      switchMap(() => cambiaRol ? this.usuariosService.cambiarRol(usuario.id, v.rol) : of(null))
    ).subscribe({
      next: () => this.terminarGuardado(),
      error: (err) => this.falloGuardado(err)
    });
  }

  private terminarGuardado(): void {
    this.guardando = false;
    this.modalAbierto = false;
    this.cargar();
    this.cdr.detectChanges();
  }

  private falloGuardado(err: any): void {
    this.guardando = false;
    this.errorForm = err.error?.message || 'No se pudo guardar el usuario.';
    this.cdr.detectChanges();
  }

  eliminar(usuario: Usuario): void {
    if (!confirm(`¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`)) return;
    this.cdr.detectChanges();
    this.usuariosService.eliminar(usuario.id).subscribe({
      next: () => { this.usuarios = this.usuarios.filter((u) => u.id !== usuario.id); },
      error: (err) => { this.errorMensaje = err.error?.message || 'No se pudo eliminar el usuario.'; }
    });
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && c.touched;
  }
}
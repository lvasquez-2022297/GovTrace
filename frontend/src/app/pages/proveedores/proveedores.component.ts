import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProveedoresService, Proveedor, ProveedorPayload } from '../../core/services/proveedores.service';
import { Auth } from '../../core/services/auth.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css'
})
export class Proveedores implements OnInit {
  proveedores: Proveedor[] = [];
  cargando = true;
  errorMensaje = '';

  searchTerm = '';
  calificacionFiltro = 'TODAS';

  esAdmin = false;
  modalAbierto = false;
  editandoId: number | null = null;
  guardando = false;
  errorForm = '';
  form: FormGroup;

  constructor(
    private proveedoresService: ProveedoresService,
    private authService: Auth,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nit: ['', [Validators.required, Validators.maxLength(20)]],
      razon_social: ['', [Validators.required, Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email]],
      calificacion: [5, [Validators.required, Validators.min(0), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.esAdmin = this.authService.esAdmin();
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.proveedoresService.getAll().subscribe({
      next: (data) => { this.proveedores = data; this.cargando = false; },
      error: (err) => {
        console.error('Error cargando proveedores:', err);
        this.errorMensaje = 'No se pudieron cargar los proveedores. Intenta de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }

  private nivel(c: number): 'ALTA' | 'MEDIA' | 'BAJA' {
    if (c >= 4) return 'ALTA';
    if (c >= 2.5) return 'MEDIA';
    return 'BAJA';
  }

  get proveedoresFiltrados(): Proveedor[] {
    const texto = this.searchTerm.trim().toLowerCase();
    return this.proveedores.filter((p) => {
      const coincideTexto = !texto ||
        p.razon_social.toLowerCase().includes(texto) ||
        p.nit.toLowerCase().includes(texto) ||
        p.email.toLowerCase().includes(texto);
      const coincideCalif = this.calificacionFiltro === 'TODAS' || this.nivel(p.calificacion) === this.calificacionFiltro;
      return coincideTexto && coincideCalif;
    });
  }

  abrirCrear(): void {
    this.editandoId = null;
    this.errorForm = '';
    this.form.reset({ calificacion: 5 });
    this.modalAbierto = true;
  }

  abrirEditar(p: Proveedor): void {
    this.editandoId = p.id;
    this.errorForm = '';
    this.form.reset({ nit: p.nit, razon_social: p.razon_social, email: p.email, calificacion: p.calificacion });
    this.modalAbierto = true;
  }

  cerrarModal(): void { this.modalAbierto = false; }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    this.errorForm = '';

    const v = this.form.value;
    const payload: ProveedorPayload = {
      nit: v.nit.trim(),
      razon_social: v.razon_social.trim(),
      email: v.email.trim(),
      calificacion: Number(v.calificacion)
    };

    const peticion = this.editandoId
      ? this.proveedoresService.actualizar(this.editandoId, payload)
      : this.proveedoresService.crear(payload);

    peticion.subscribe({
      next: () => { this.guardando = false; this.modalAbierto = false; this.cargar(); },
      error: (err) => {
        this.guardando = false;
        this.errorForm = err.error?.message || 'No se pudo guardar el proveedor.';
      }
    });
  }

  eliminar(p: Proveedor): void {
    if (!confirm(`¿Eliminar a ${p.razon_social}? Esta acción no se puede deshacer.`)) return;
    this.proveedoresService.eliminar(p.id).subscribe({
      next: () => { this.proveedores = this.proveedores.filter((x) => x.id !== p.id); },
      error: (err) => { this.errorMensaje = err.error?.message || 'No se pudo eliminar el proveedor.'; }
    });
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && c.touched;
  }
}
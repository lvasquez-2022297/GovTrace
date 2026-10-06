import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdjudicacionesService, Adjudicacion, AdjudicacionPayload } from '../../core/services/adjudicaciones.service';
import { LicitacionesService, Licitacion } from '../../core/services/licitaciones.service';
import { ProveedoresService, Proveedor } from '../../core/services/proveedores.service';
import { Auth } from '../../core/services/auth.service';

@Component({
  selector: 'app-adjudicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './adjudicaciones.component.html',
  styleUrl: './adjudicaciones.component.css'
})
export class Adjudicaciones implements OnInit {
  adjudicaciones: Adjudicacion[] = [];
  cargando = true;
  errorMensaje = '';

  searchTerm = '';
  estadoFiltro = 'TODOS';

  esAdmin = false;
  modalAbierto = false;
  editando: Adjudicacion | null = null;
  guardando = false;
  errorForm = '';
  form: FormGroup;

  licitacionesDisponibles: Licitacion[] = [];
  proveedores: Proveedor[] = [];

  constructor(
    private adjudicacionesService: AdjudicacionesService,
    private licitacionesService: LicitacionesService,
    private proveedoresService: ProveedoresService,
    private authService: Auth,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      licitacion_id: [null as number | null, [Validators.required]],
      proveedor_id: [null as number | null, [Validators.required]],
      monto_adjudicado: [null as number | null, [Validators.required, Validators.min(0.01)]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.esAdmin = this.authService.esAdmin();
    this.cargar();
    this.cdr.detectChanges();
  }

  cargar(): void {
    this.cargando = true;
    this.cdr.detectChanges();
    this.adjudicacionesService.getAll().subscribe({
      next: (data) => { this.adjudicaciones = data; this.cargando = false; this.cdr.detectChanges(); },
      error: (err) => {
        console.error('Error cargando adjudicaciones:', err);
        this.errorMensaje = 'No se pudieron cargar las adjudicaciones. Intenta de nuevo más tarde.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get adjudicacionesFiltradas(): Adjudicacion[] {
    const texto = this.searchTerm.trim().toLowerCase();
    return this.adjudicaciones.filter((a) => {
      const coincideTexto = !texto ||
        a.titulo.toLowerCase().includes(texto) ||
        a.codigo_licitacion.toLowerCase().includes(texto) ||
        (a.entidad ?? '').toLowerCase().includes(texto) ||
        a.razon_social.toLowerCase().includes(texto) ||
        a.nit.toLowerCase().includes(texto);
      const coincideEstado = this.estadoFiltro === 'TODOS' || a.estado_licitacion === this.estadoFiltro;
      return coincideTexto && coincideEstado;
    });
  }

  private cargarOpciones(): void {
    forkJoin({
      licitaciones: this.licitacionesService.getAll(),
      proveedores: this.proveedoresService.getAll()
    }).subscribe({
      next: ({ licitaciones, proveedores }) => {
        const yaAdjudicadas = new Set(this.adjudicaciones.map((a) => a.licitacion_id));
        this.licitacionesDisponibles = licitaciones.filter(
          (l) => !yaAdjudicadas.has(l.id) && l.estado !== 'CANCELADA'
        );
        this.proveedores = proveedores;
        this.cdr.detectChanges();
      },
      error: () => { this.errorForm = 'No se pudieron cargar las licitaciones y proveedores.'; }
    });
  }

  abrirCrear(): void {
    this.editando = null;
    this.errorForm = '';
    this.form.reset();
    this.form.get('licitacion_id')?.enable();
    this.cargarOpciones();
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  abrirEditar(a: Adjudicacion): void {
    this.editando = a;
    this.errorForm = '';
    this.cdr.detectChanges();
    this.form.reset({
      licitacion_id: a.licitacion_id,
      proveedor_id: a.proveedor_id,
      monto_adjudicado: a.monto_adjudicado,
      observaciones: a.observaciones ?? ''
    });
    this.form.get('licitacion_id')?.disable(); 
    this.cargarOpciones();
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void { this.modalAbierto = false; this.cdr.detectChanges(); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    this.errorForm = '';
    this.cdr.detectChanges();

    const v = this.form.getRawValue();
    const payload: AdjudicacionPayload = {
      proveedor_id: Number(v.proveedor_id),
      monto_adjudicado: Number(v.monto_adjudicado),
      observaciones: v.observaciones?.trim() || undefined
    };

    const peticion = this.editando
      ? this.adjudicacionesService.actualizar(this.editando.id, payload)
      : this.adjudicacionesService.crear({ ...payload, licitacion_id: Number(v.licitacion_id) });

    peticion.subscribe({
      next: () => { this.guardando = false; this.modalAbierto = false; this.cargar(); },
      error: (err) => {
        this.guardando = false;
        this.errorForm = err.error?.message || 'No se pudo guardar la adjudicación.';
        this.cdr.detectChanges();
      }
    });
  }

  eliminar(a: Adjudicacion): void {
    if (!confirm(`¿Eliminar la adjudicación de ${a.codigo_licitacion}? La licitación volverá a quedar publicada.`)) return;
    this.adjudicacionesService.eliminar(a.id).subscribe({
      next: () => { this.cargar(); },
      error: (err) => { this.errorMensaje = err.error?.message || 'No se pudo eliminar la adjudicación.'; }
    });
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && c.touched;
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LicitacionesService, Licitacion, LicitacionPayload, EstadoLicitacion } from '../../core/services/licitaciones.service';
import { Auth } from '../../core/services/auth.service';

function fechasValidas(group: AbstractControl): ValidationErrors | null {
  const inicio = group.get('fecha_inicio')?.value;
  const cierre = group.get('fecha_cierre')?.value;
  return inicio && cierre && cierre < inicio ? { fechas: true } : null;
}

@Component({
  selector: 'app-licitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './licitaciones.component.html',
  styleUrl: './licitaciones.component.css'
})
export class Licitaciones implements OnInit {
  licitaciones: Licitacion[] = [];
  cargando = true;
  errorMensaje = '';

  searchTerm = '';
  estadoFiltro = 'TODOS';

  esAdmin = false;
  esAuditor = false;

  modalAbierto = false;
  editandoId: number | null = null;
  guardando = false;
  errorForm = '';
  form: FormGroup;

  constructor(
    private licitacionesService: LicitacionesService,
    private authService: Auth,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group(
      {
        codigo_licitacion: ['', [Validators.required, Validators.maxLength(50)]],
        titulo: ['', [Validators.required, Validators.maxLength(200)]],
        descripcion: [''],
        entidad: ['', [Validators.maxLength(150)]],
        presupuesto_asignado: [null as number | null, [Validators.required, Validators.min(0.01)]],
        estado: ['PUBLICADA', [Validators.required]],
        fecha_inicio: ['', [Validators.required]],
        fecha_cierre: ['', [Validators.required]]
      },
      { validators: fechasValidas }
    );
  }

  ngOnInit(): void {
    const usuario = this.authService.getUsuarioActual();
    this.esAdmin = usuario?.rol === 'ADMIN';
    this.esAuditor = usuario?.rol === 'AUDITOR';
    this.cargar();
  }

  get puedeModificarEstado(): boolean {
    return this.esAdmin || this.esAuditor;
  }

  cargar(): void {
    this.cargando = true;
    this.cdr.detectChanges();
    this.licitacionesService.getAll().subscribe({
      next: (data) => {
        this.licitaciones = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando licitaciones:', err);
        this.errorMensaje = 'No se pudieron cargar las licitaciones. Intenta de nuevo más tarde.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get licitacionesFiltradas(): Licitacion[] {
    const texto = this.searchTerm.trim().toLowerCase();

    return this.licitaciones.filter((item) => {
      const coincideTexto =
        !texto ||
        item.titulo.toLowerCase().includes(texto) ||
        item.codigo_licitacion.toLowerCase().includes(texto) ||
        (item.entidad ?? '').toLowerCase().includes(texto);

      const coincideEstado = this.estadoFiltro === 'TODOS' || item.estado === this.estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  }

  cambiarEstadoDirecto(item: Licitacion, nuevoEstado: string): void {
  if (item.estado === nuevoEstado) return;

  this.licitacionesService.cambiarEstado(item.id, nuevoEstado).subscribe({
    next: (actualizada) => {
      item.estado = actualizada.estado || (nuevoEstado as any);
      this.errorMensaje = '';
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.errorMensaje = err.error?.message || 'No tienes permisos para cambiar el estado.';
      this.cargar(); 
      this.cdr.detectChanges();
    }
  });
}
  abrirCrear(): void {
    this.editandoId = null;
    this.errorForm = '';
    this.form.reset({ estado: 'PUBLICADA', presupuesto_asignado: null });
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  abrirEditar(item: Licitacion): void {
    this.editandoId = item.id;
    this.errorForm = '';
    this.form.reset({
      codigo_licitacion: item.codigo_licitacion,
      titulo: item.titulo,
      descripcion: item.descripcion ?? '',
      entidad: item.entidad ?? '',
      presupuesto_asignado: Number(item.presupuesto_asignado),
      estado: item.estado,
      fecha_inicio: (item.fecha_inicio ?? '').slice(0, 10),
      fecha_cierre: (item.fecha_cierre ?? '').slice(0, 10)
    });
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.cdr.detectChanges();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.errorForm = '';
    this.cdr.detectChanges();
    const v = this.form.value;
    const payload: LicitacionPayload = {
      codigo_licitacion: v.codigo_licitacion.trim(),
      titulo: v.titulo.trim(),
      descripcion: v.descripcion?.trim() || undefined,
      entidad: v.entidad?.trim() || undefined,
      presupuesto_asignado: Number(v.presupuesto_asignado),
      estado: v.estado,
      fecha_inicio: v.fecha_inicio,
      fecha_cierre: v.fecha_cierre
    };

    const peticion = this.editandoId
      ? this.licitacionesService.actualizar(this.editandoId, payload)
      : this.licitacionesService.crear(payload);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.modalAbierto = false;
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        this.errorForm = err.error?.message || 'No se pudo guardar la licitación.';
        this.cdr.detectChanges();
      }
    });
  }

  eliminar(item: Licitacion): void {
    const aviso =
      `¿Eliminar la licitación ${item.codigo_licitacion}?\n\n` +
      'También se borrarán su adjudicación y sus alertas. Esta acción no se puede deshacer.';
    if (!confirm(aviso)) return;

    this.licitacionesService.eliminar(item.id).subscribe({
      next: () => {
        this.licitaciones = this.licitaciones.filter((l) => l.id !== item.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMensaje = err.error?.message || 'No se pudo eliminar la licitación.';
        this.cdr.detectChanges();
      }
    });
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && c.touched;
  }
}
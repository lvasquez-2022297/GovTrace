import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertasService, Alerta, AlertaPayload } from '../../core/services/alertas.service';
import { LicitacionesService, Licitacion } from '../../core/services/licitaciones.service';
import { Auth } from '../../core/services/auth.service';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css'
})
export class Alertas implements OnInit {
  alertas: Alerta[] = [];
  cargando = true;
  errorMensaje = '';

  searchTerm = '';
  riesgoFiltro = 'TODOS';

  esAdmin = false;
  modalAbierto = false;
  editandoId: number | null = null;
  guardando = false;
  errorForm = '';
  form: FormGroup;

  licitaciones: Licitacion[] = [];

  readonly tipos = [
    { valor: 'SOBRECOSTO', texto: 'Sobrecosto' },
    { valor: 'PROVEEDOR_INHABILITADO', texto: 'Proveedor inhabilitado' },
    { valor: 'TIEMPO_IRREGULAR', texto: 'Tiempo irregular' },
    { valor: 'DENUNCIA_CIUDADANA', texto: 'Denuncia ciudadana' }
  ];

  constructor(
    private alertasService: AlertasService,
    private licitacionesService: LicitacionesService,
    private authService: Auth,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      licitacion_id: [null as number | null, [Validators.required]],
      tipo_alerta: ['SOBRECOSTO', [Validators.required]],
      nivel_riesgo: ['MEDIO', [Validators.required]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.esAdmin = this.authService.esAdmin();
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.alertasService.getAll().subscribe({
      next: (data) => { this.alertas = data; this.cargando = false; },
      error: (err) => {
        console.error('Error cargando alertas:', err);
        this.errorMensaje = 'No se pudieron cargar las alertas. Intenta de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }

  get alertasFiltradas(): Alerta[] {
    const texto = this.searchTerm.trim().toLowerCase();
    return this.alertas.filter((a) => {
      const coincideTexto = !texto ||
        a.titulo.toLowerCase().includes(texto) ||
        a.codigo_licitacion.toLowerCase().includes(texto) ||
        (a.entidad ?? '').toLowerCase().includes(texto) ||
        a.descripcion.toLowerCase().includes(texto);
      const coincideRiesgo = this.riesgoFiltro === 'TODOS' || a.nivel_riesgo === this.riesgoFiltro;
      return coincideTexto && coincideRiesgo;
    });
  }

  private cargarLicitaciones(): void {
    this.licitacionesService.getAll().subscribe({
      next: (data) => { this.licitaciones = data; },
      error: () => { this.errorForm = 'No se pudieron cargar las licitaciones.'; }
    });
  }

  abrirCrear(): void {
    this.editandoId = null;
    this.errorForm = '';
    this.form.reset({ tipo_alerta: 'SOBRECOSTO', nivel_riesgo: 'MEDIO' });
    this.cargarLicitaciones();
    this.modalAbierto = true;
  }

  abrirEditar(a: Alerta): void {
    this.editandoId = a.id;
    this.errorForm = '';
    this.form.reset({
      licitacion_id: a.licitacion_id,
      tipo_alerta: a.tipo_alerta,
      nivel_riesgo: a.nivel_riesgo,
      descripcion: a.descripcion
    });
    this.cargarLicitaciones();
    this.modalAbierto = true;
  }

  cerrarModal(): void { this.modalAbierto = false; }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    this.errorForm = '';

    const v = this.form.value;
    const payload: AlertaPayload = {
      licitacion_id: Number(v.licitacion_id),
      tipo_alerta: v.tipo_alerta,
      nivel_riesgo: v.nivel_riesgo,
      descripcion: v.descripcion.trim()
    };

    const peticion = this.editandoId
      ? this.alertasService.actualizar(this.editandoId, payload)
      : this.alertasService.crear(payload);

    peticion.subscribe({
      next: () => { this.guardando = false; this.modalAbierto = false; this.cargar(); },
      error: (err) => {
        this.guardando = false;
        this.errorForm = err.error?.message || 'No se pudo guardar la alerta.';
      }
    });
  }

  eliminar(a: Alerta): void {
    if (!confirm(`¿Eliminar la alerta de ${a.codigo_licitacion}? Esta acción no se puede deshacer.`)) return;
    this.alertasService.eliminar(a.id).subscribe({
      next: () => { this.alertas = this.alertas.filter((x) => x.id !== a.id); },
      error: (err) => { this.errorMensaje = err.error?.message || 'No se pudo eliminar la alerta.'; }
    });
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && c.touched;
  }
}
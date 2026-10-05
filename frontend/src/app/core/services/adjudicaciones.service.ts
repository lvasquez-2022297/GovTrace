import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Adjudicacion {
  id: number;
  licitacion_id: number;
  proveedor_id: number;
  nog: string;
  tituloLicitacion: string;
  entidad: string;
  proveedorGanador: string;
  nitProveedor: string;
  montoAdjudicado: number;
  fechaAdjudicacion: string;
  estadoContrato: string;
  observaciones?: string;
}

interface ApiList<T> {
  success: boolean;
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class AdjudicacionesService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Adjudicacion[]> {
    return forkJoin({
      adjudicaciones: this.http.get<ApiList<any>>(`${this.api}/adjudicaciones`),
      licitaciones: this.http.get<ApiList<any>>(`${this.api}/licitaciones`),
      proveedores: this.http.get<ApiList<any>>(`${this.api}/proveedores`)
    }).pipe(
      map(({ adjudicaciones, licitaciones, proveedores }) =>
        adjudicaciones.data.map((a) => {
          const lic = licitaciones.data.find((l) => l.id === a.licitacion_id);
          const prov = proveedores.data.find((p) => p.id === a.proveedor_id);

          return {
            id: a.id,
            licitacion_id: a.licitacion_id,
            proveedor_id: a.proveedor_id,
            nog: lic?.codigo_licitacion ?? '—',
            tituloLicitacion: lic?.titulo ?? 'Licitación no encontrada',
            entidad: lic?.entidad ?? 'Sin entidad',
            proveedorGanador: prov?.razon_social ?? 'Proveedor no encontrado',
            nitProveedor: prov?.nit ?? '—',
            montoAdjudicado: Number(a.monto_adjudicado),
            fechaAdjudicacion: a.fecha_adjudicacion,
            estadoContrato: lic?.estado ?? 'SIN_ESTADO',
            observaciones: a.observaciones
          } as Adjudicacion;
        })
      )
    );
  }
}
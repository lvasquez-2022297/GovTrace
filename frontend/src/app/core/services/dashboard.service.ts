import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DashboardMetrics {
  totalPresupuesto: number;
  alertasActivas: number;
  ministeriosAuditados: number;
  proveedoresRegistrados: number;
}

interface ApiList<T> {
  success: boolean;
  data: T[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<DashboardMetrics> {
    return forkJoin({
      licitaciones: this.http.get<ApiList<any>>(`${this.api}/licitaciones`),
      alertas: this.http.get<ApiList<any>>(`${this.api}/alertas`),
      proveedores: this.http.get<ApiList<any>>(`${this.api}/proveedores`)
    }).pipe(
      map(({ licitaciones, alertas, proveedores }) => ({
        totalPresupuesto: licitaciones.data.reduce(
          (suma, l) => suma + Number(l.presupuesto_asignado || 0), 0
        ),
        alertasActivas: alertas.data.length,
        ministeriosAuditados: new Set(
          licitaciones.data.map((l) => l.entidad).filter(Boolean)
        ).size,
        proveedoresRegistrados: proveedores.data.length
      }))
    );
  }
}
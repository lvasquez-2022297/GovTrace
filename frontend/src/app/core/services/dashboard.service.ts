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

export interface IndiceMinisterio {
  ranking: number;
  institucion: string;
  indiceTransparencia: number;
  tasaAlerta: number;
}

export interface DashboardData {
  licitaciones: any[];
  alertas: any[];
  totalProveedores: number;
}

interface ApiList<T> { success: boolean; data: T[]; }

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getData(): Observable<DashboardData> {
    return forkJoin({
      licitaciones: this.http.get<ApiList<any>>(`${this.api}/licitaciones`),
      alertas: this.http.get<ApiList<any>>(`${this.api}/alertas`),
      proveedores: this.http.get<ApiList<any>>(`${this.api}/proveedores`)
    }).pipe(
      map(({ licitaciones, alertas, proveedores }) => ({
        licitaciones: licitaciones.data,
        alertas: alertas.data,
        totalProveedores: proveedores.data.length
      }))
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Adjudicacion {
  id: number;
  licitacion_id: number;
  proveedor_id: number;
  monto_adjudicado: number;
  fecha_adjudicacion: string;
  observaciones: string | null;
  codigo_licitacion: string;
  titulo: string;
  entidad: string | null;
  estado_licitacion: string;
  presupuesto_asignado: number;
  razon_social: string;
  nit: string;
}

export interface AdjudicacionPayload {
  licitacion_id?: number;
  proveedor_id: number;
  monto_adjudicado: number;
  observaciones?: string;
}

interface ApiOne<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class AdjudicacionesService {
  private apiUrl = `${environment.apiUrl}/adjudicaciones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Adjudicacion[]> {
    return this.http.get<ApiOne<Adjudicacion[]>>(this.apiUrl).pipe(map((r) => r.data));
  }

  crear(p: AdjudicacionPayload): Observable<Adjudicacion> {
    return this.http.post<ApiOne<Adjudicacion>>(this.apiUrl, p).pipe(map((r) => r.data));
  }

  actualizar(id: number, p: AdjudicacionPayload): Observable<Adjudicacion> {
    return this.http.put<ApiOne<Adjudicacion>>(`${this.apiUrl}/${id}`, p).pipe(map((r) => r.data));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
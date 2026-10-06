import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';


export type EstadoLicitacion = 'PUBLICADA' | 'ADJUDICADA' | 'CANCELADA' | 'CON_ALERTA';

export interface Licitacion {
  id: number;
  codigo_licitacion: string;
  titulo: string;
  descripcion?: string;
  entidad?: string;
  presupuesto_asignado: number | string; 
  estado: EstadoLicitacion;
  fecha_inicio: string;
  fecha_cierre: string;
  creado_por?: number;
  creado_en: string;
}

export interface LicitacionPayload {
  codigo_licitacion: string;
  titulo: string;
  descripcion?: string;
  entidad?: string;
  presupuesto_asignado: number;
  estado: EstadoLicitacion;
  fecha_inicio: string;
  fecha_cierre: string;
}

interface ApiOne<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class LicitacionesService {
  private apiUrl = `${environment.apiUrl}/licitaciones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Licitacion[]> {
    return this.http
      .get<{ success: boolean; data: Licitacion[] }>(this.apiUrl)
      .pipe(map((res) => res.data));
  }

  cambiarEstado(id: number, estado: EstadoLicitacion): Observable<Licitacion> {
    return this.http
      .patch<ApiOne<Licitacion>>(`${this.apiUrl}/${id}/estado`, { estado })
      .pipe(map((r) => r.data));
  }

  crear(payload: LicitacionPayload): Observable<Licitacion> {
    return this.http.post<ApiOne<Licitacion>>(this.apiUrl, payload).pipe(map((r) => r.data));
  }

  actualizar(id: number, payload: LicitacionPayload): Observable<Licitacion> {
    return this.http.put<ApiOne<Licitacion>>(`${this.apiUrl}/${id}`, payload).pipe(map((r) => r.data));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
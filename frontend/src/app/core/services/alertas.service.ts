import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export interface Alerta {
  id: number;
  licitacion_id: number;
  tipo_alerta: string;
  descripcion: string;
  nivel_riesgo: NivelRiesgo;
  creado_en: string;
  codigo_licitacion: string;
  titulo: string;
  entidad: string | null;
}

export interface AlertaPayload {
  licitacion_id: number;
  tipo_alerta: string;
  descripcion: string;
  nivel_riesgo: NivelRiesgo;
}

interface ApiOne<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class AlertasService {
  private apiUrl = `${environment.apiUrl}/alertas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Alerta[]> {
    return this.http.get<ApiOne<Alerta[]>>(this.apiUrl).pipe(map((r) => r.data));
  }

  crear(p: AlertaPayload): Observable<Alerta> {
    return this.http.post<ApiOne<Alerta>>(this.apiUrl, p).pipe(map((r) => r.data));
  }

  actualizar(id: number, p: AlertaPayload): Observable<Alerta> {
    return this.http.put<ApiOne<Alerta>>(`${this.apiUrl}/${id}`, p).pipe(map((r) => r.data));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
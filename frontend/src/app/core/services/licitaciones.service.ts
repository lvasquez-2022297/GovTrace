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
  presupuesto_asignado: number | string; // PostgreSQL devuelve DECIMAL como string
  estado: EstadoLicitacion;
  fecha_inicio: string;
  fecha_cierre: string;
  creado_por?: number;
  creado_en: string;
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
}
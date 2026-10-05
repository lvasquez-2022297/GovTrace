import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

// Modelo de vista: une alertas + licitaciones
export interface Alerta {
  id: number;
  licitacion_id: number;
  nog: string;
  tituloLicitacion: string;
  entidad: string;
  tipoAlerta: string;
  nivelRiesgo: NivelRiesgo;
  descripcion: string;
  fechaDeteccion: string;
}

interface ApiList<T> {
  success: boolean;
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Alerta[]> {
    return forkJoin({
      alertas: this.http.get<ApiList<any>>(`${this.api}/alertas`),
      licitaciones: this.http.get<ApiList<any>>(`${this.api}/licitaciones`)
    }).pipe(
      map(({ alertas, licitaciones }) =>
        alertas.data.map((a) => {
          const lic = licitaciones.data.find((l) => l.id === a.licitacion_id);
          return {
            id: a.id,
            licitacion_id: a.licitacion_id,
            nog: lic?.codigo_licitacion ?? '—',
            tituloLicitacion: lic?.titulo ?? 'Licitación no encontrada',
            entidad: lic?.entidad ?? 'Sin entidad',
            tipoAlerta: a.tipo_alerta,
            nivelRiesgo: a.nivel_riesgo,
            descripcion: a.descripcion,
            fechaDeteccion: a.creado_en
          } as Alerta;
        })
      )
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Proveedor {
  id: number;
  nit: string;
  nombre: string;
  email: string;
  calificacion: number;
  contratosAdjudicados: number;
  montoTotalContratado: number;
}

interface ApiList<T> {
  success: boolean;
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Proveedor[]> {
    return forkJoin({
      proveedores: this.http.get<ApiList<any>>(`${this.api}/proveedores`),
      adjudicaciones: this.http.get<ApiList<any>>(`${this.api}/adjudicaciones`)
    }).pipe(
      map(({ proveedores, adjudicaciones }) =>
        proveedores.data.map((p) => {
          const suyas = adjudicaciones.data.filter((a) => a.proveedor_id === p.id);
          return {
            id: p.id,
            nit: p.nit,
            nombre: p.razon_social,
            email: p.email,
            calificacion: Number(p.calificacion),
            contratosAdjudicados: suyas.length,
            montoTotalContratado: suyas.reduce(
              (suma, a) => suma + Number(a.monto_adjudicado || 0), 0
            )
          } as Proveedor;
        })
      )
    );
  }
}
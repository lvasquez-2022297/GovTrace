import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Adjudicacion {
  id: number;
  nog: string;
  tituloLicitacion: string;
  entidad: string;
  proveedorGanador: string;
  nitProveedor: string;
  montoAdjudicado: number;
  fechaAdjudicacion: string;
  estadoContrato: string; 
}

@Injectable({
  providedIn: 'root'
})
export class AdjudicacionesService {
  private apiUrl = 'http://localhost:8080/api/adjudicaciones';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Adjudicacion[]> {
    return this.http.get<Adjudicacion[]>(this.apiUrl);
  }
}
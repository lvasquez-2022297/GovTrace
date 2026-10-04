import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alerta {
  id: number;
  nog: string;
  tituloLicitacion: string;
  entidad: string;
  tipoAlerta: string; 
  nivelRiesgo: string; 
  desviacionPorcentaje: number;
  fechaDeteccion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  private apiUrl = 'http://localhost:8080/api/alertas';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(this.apiUrl);
  }
}
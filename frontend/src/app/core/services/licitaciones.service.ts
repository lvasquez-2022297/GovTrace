import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Licitacion {
  id: number;
  noNog: string;
  titulo: string;
  entidad: string;
  montoEstimado: number;
  estado: string;
  fechaPublicacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class LicitacionesService {
  private apiUrl = 'http://localhost:8080/api/licitaciones';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Licitacion[]> {
    return this.http.get<Licitacion[]>(this.apiUrl);
  }
}
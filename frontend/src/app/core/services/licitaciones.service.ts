import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Licitacion } from '../models/licitacion.model';

@Injectable({
  providedIn: 'root'
})
export class LicitacionesService {
  private apiUrl = `${environment.apiUrl}/licitaciones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Licitacion[]> {
    return this.http.get<Licitacion[]>(this.apiUrl);
  }

  getById(id: number): Observable<Licitacion> {
    return this.http.get<Licitacion>(`${this.apiUrl}/${id}`);
  }

  create(licitacion: Omit<Licitacion, 'id' | 'fecha_creacion'>): Observable<Licitacion> {
    return this.http.post<Licitacion>(this.apiUrl, licitacion);
  }

  update(id: number, licitacion: Partial<Licitacion>): Observable<Licitacion> {
    return this.http.put<Licitacion>(`${this.apiUrl}/${id}`, licitacion);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
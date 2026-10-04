import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alerta } from '../models/alerta.model';

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  private apiUrl = `${environment.apiUrl}/alertas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(this.apiUrl);
  }

  getById(id: number): Observable<Alerta> {
    return this.http.get<Alerta>(`${this.apiUrl}/${id}`);
  }

  create(alerta: Omit<Alerta, 'id' | 'fecha_deteccion'>): Observable<Alerta> {
    return this.http.post<Alerta>(this.apiUrl, alerta);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
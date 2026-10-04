import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Adjudicacion } from '../models/adjudicacion.model';

@Injectable({
  providedIn: 'root'
})
export class AdjudicacionesService {
  private apiUrl = `${environment.apiUrl}/adjudicaciones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Adjudicacion[]> {
    return this.http.get<Adjudicacion[]>(this.apiUrl);
  }

  getById(id: number): Observable<Adjudicacion> {
    return this.http.get<Adjudicacion>(`${this.apiUrl}/${id}`);
  }

  create(adjudicacion: Omit<Adjudicacion, 'id'>): Observable<Adjudicacion> {
    return this.http.post<Adjudicacion>(this.apiUrl, adjudicacion);
  }

  update(id: number, adjudicacion: Partial<Adjudicacion>): Observable<Adjudicacion> {
    return this.http.put<Adjudicacion>(`${this.apiUrl}/${id}`, adjudicacion);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
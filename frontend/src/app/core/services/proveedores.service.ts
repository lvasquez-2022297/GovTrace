import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Proveedor {
  id: number;
  nit: string;
  razon_social: string;
  email: string;
  calificacion: number;
  creado_en: string;
  contratos: number;
  monto_total: number;
}

export interface ProveedorPayload {
  nit: string;
  razon_social: string;
  email: string;
  calificacion: number;
}

interface ApiOne<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private apiUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Proveedor[]> {
    return this.http.get<ApiOne<Proveedor[]>>(this.apiUrl).pipe(map((r) => r.data));
  }

  crear(p: ProveedorPayload): Observable<Proveedor> {
    return this.http.post<ApiOne<Proveedor>>(this.apiUrl, p).pipe(map((r) => r.data));
  }

  actualizar(id: number, p: ProveedorPayload): Observable<Proveedor> {
    return this.http.put<ApiOne<Proveedor>>(`${this.apiUrl}/${id}`, p).pipe(map((r) => r.data));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
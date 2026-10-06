import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RolUsuario, Usuario } from '../models/usuario.model';

export interface UsuarioCrearPayload {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
}

export interface UsuarioEditarPayload {
  nombre: string;
  email: string;
  password?: string;
  foto_url?: string | null;
}

interface ApiOne<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Usuario[]> {
    return this.http.get<ApiOne<Usuario[]>>(this.apiUrl).pipe(map((r) => r.data));
  }

  getPorId(id: number): Observable<Usuario> {
  return this.http.get<ApiOne<Usuario>>(`${this.apiUrl}/${id}`).pipe(map((r) => r.data));
 }

  crear(p: UsuarioCrearPayload): Observable<Usuario> {
    return this.http.post<ApiOne<Usuario>>(this.apiUrl, p).pipe(map((r) => r.data));
  }

  actualizar(id: number, p: UsuarioEditarPayload): Observable<Usuario> {
    return this.http.put<ApiOne<Usuario>>(`${this.apiUrl}/${id}`, p).pipe(map((r) => r.data));
  }

  cambiarRol(id: number, rol: RolUsuario): Observable<Usuario> {
    return this.http.put<ApiOne<Usuario>>(`${this.apiUrl}/${id}/rol`, { rol }).pipe(map((r) => r.data));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
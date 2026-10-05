import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginDTO, RegistroDTO, Usuario } from '../models/usuario.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private api = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  register(datos: RegistroDTO): Observable<Usuario> {
    return this.http
      .post<ApiResponse<Usuario>>(`${this.api}/register`, datos)
      .pipe(map((res) => res.data));
  }

  login(credenciales: LoginDTO): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.api}/login`, credenciales)
      .pipe(
        map((res) => res.data),
        tap((data) => {
          localStorage.setItem('token', data.token);
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuarioActual(): Usuario | null {
    const raw = localStorage.getItem('usuario');
    if (!raw || raw === 'undefined') return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      localStorage.removeItem('usuario');
      return null;
    }
  }

  esAdmin(): boolean {
    return this.getUsuarioActual()?.rol === 'ADMIN';
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token || token === 'undefined') return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }
}
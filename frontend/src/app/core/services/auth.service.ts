import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginDTO, RegistroDTO, Usuario } from '../models/usuario.model';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private api = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUsuarioActual());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUsuarioActual(): Usuario | null {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as Usuario;
    } catch {
      return null;
    }
  }

  // 3. Método getToken que faltaba
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  login(credenciales: LoginDTO): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.api}/login`, credenciales)
      .pipe(
        map((res) => res.data),
        tap((data) => {
          localStorage.setItem('token', data.token);
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
          this.currentUserSubject.next(data.usuario);
        })
      );
  }

  register(datos: RegistroDTO): Observable<Usuario> {
    return this.http
      .post<ApiResponse<Usuario>>(`${this.api}/register`, datos)
      .pipe(map((res) => res.data));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.currentUserSubject.next(null);
  }

  guardarUsuarioLocal(usuario: Usuario): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.currentUserSubject.next(usuario);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  esAdmin(): boolean {
    const usuario = this.getUsuarioActual();
    return usuario?.rol === 'ADMIN';
  }
}
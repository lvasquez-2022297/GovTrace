import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class AnalizadorService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  run(): Observable<any> {
    return this.http.post(`${this.api}/analizador/run`, {});
  }

  status(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.api}/analizador/status`);
  }

  ultimas(limit = 10): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.api}/analizador/ultimas-alertas?limit=${limit}`);
  }
}

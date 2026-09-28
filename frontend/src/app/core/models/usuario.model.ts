export type RolUsuario = 'ADMIN' | 'AUDITOR' | 'CIUDADANO';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
  fecha_creacion: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}
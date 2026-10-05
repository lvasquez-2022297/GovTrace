export type RolUsuario = 'ADMIN' | 'AUDITOR' | 'CIUDADANO';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  creado_en: string;
}

export interface RegistroDTO {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}
export type RolUsuario = 'ADMIN' | 'AUDITOR' | 'CIUDADANO';

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    password: string;
    rol: RolUsuario;
    foto_url?: string | null;
    creado_en: Date;
}
export type RolUsuario = 'ADMIN' | 'AUDITOR' | 'CIUDADANO' ;

export interface Usuario { 
    id: number;
    nombre: string;
    email: string;
    password: string;
    rol: RolUsuario;
    creado_en: Date;
}
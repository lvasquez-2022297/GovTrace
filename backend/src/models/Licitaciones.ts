export type EstadoLicitacion = 'PUBLICADA' | 'ADJUDICADA' | 'CANCELADA' | 'CON_ALERTA';

export interface Licitacion {
    id: number;
    codigo_licitacion: string;
    titulo: string;
    descripcion: string;
    presupuesto_asignado: number;
    estado: EstadoLicitacion;
    fecha_inicio: string | Date ;
    fecha_cierre: string | Date ;
    creado_por: number;
    creado_en: Date;
}
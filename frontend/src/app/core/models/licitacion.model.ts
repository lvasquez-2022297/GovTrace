export type EstadoLicitacion = 'BORRADOR' | 'PUBLICADA' | 'ADJUDICADA' | 'CANCELADA';

export interface Licitacion {
  id: number;
  codigo_licitacion: string;
  titulo: string;
  descripcion: string;
  presupuesto_asignado: number;
  estado: EstadoLicitacion;
  fecha_inicio: string;
  fecha_cierre: string;
  creado_por: number;
  fecha_creacion: string;
}
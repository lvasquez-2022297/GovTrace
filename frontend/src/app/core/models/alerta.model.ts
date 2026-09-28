export type TipoAlerta = 'SOBRECOSTO' | 'PROVEEDOR_INHABILITADO' | 'TIEMPO_IRREGULAR' | 'DENUNCIA_CIUDADANA';
export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export interface Alerta {
  id: number;
  licitacion_id: number;
  tipo_alerta: TipoAlerta;
  descripcion: string;
  nivel_riesgo: NivelRiesgo;
  fecha_deteccion: string;
}
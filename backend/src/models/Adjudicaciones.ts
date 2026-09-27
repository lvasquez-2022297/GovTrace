export interface Adjudicacion {
    id: number;
    licitacion_id: number;
    proveedor_id: number;
    monto_adjudicado: number;
    fecha_adjudicacion: Date;
    observaciones: string;
}
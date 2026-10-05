import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  let status = 500;
  let message = 'Error interno del servidor';

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
  } else if (err?.code === '23505') {
    status = 409;
    message = 'Ya existe un registro con ese valor único (código, NIT o correo).';
  } else if (err?.code === '23503') {
    status = 409;
    message = 'No se puede completar la acción: hay registros relacionados (o la referencia no existe).';
  } else if (err?.code === '23514' || err?.code === '23502' || err?.code === '22P02') {
    status = 400;
    message = 'Los datos enviados no son válidos.';
  }

  if (status === 500) console.error(err);

  res.status(status).json({ success: false, message });
};
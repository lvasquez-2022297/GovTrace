import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const status = err instanceof AppError ? err.statusCode : 500;

  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status === 500 ? 'Error interno del servidor' : err.message,
  });
};
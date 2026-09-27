import { Request, Response, NextFunction } from 'express';
import { LoggerUtils } from '../utils/LoggerUtils';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  LoggerUtils.error(`[${req.method}] ${req.url} - ${err.message}`, err);

  const statusCode = err.statusCode || 400;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Error interno del servidor',
  });
};
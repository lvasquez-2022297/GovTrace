import { Request, Response, NextFunction } from 'express';

export class ValidacionesMiddleware {
  static camposRequeridos(campos: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const faltantes = campos.filter(
        (campo) =>
          req.body[campo] === undefined ||
          req.body[campo] === null ||
          req.body[campo].toString().trim() === ''
      );

      if (faltantes.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Los siguientes campos son requeridos: ${faltantes.join(', ')}`,
        });
      }
      next();
    };
  }

  static validarEmail(campo: string = 'email') {
    return (req: Request, res: Response, next: NextFunction) => {
      const email = req.body[campo];
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (email && !regexEmail.test(email)) {
        return res.status(400).json({
          success: false,
          error: `El formato del correo electrónico (${email}) no es válido. Debe incluir '@' y un dominio.`,
        });
      }
      next();
    };
  }
}
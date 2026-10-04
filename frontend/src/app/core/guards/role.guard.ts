import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const usuario = authService.getUsuarioActual();
  const rolRequerido = route.data?.['rol'] || 'ADMIN';

  if (usuario && usuario.rol === rolRequerido) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
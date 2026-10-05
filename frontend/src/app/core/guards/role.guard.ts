import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const usuario = authService.getUsuarioActual();
  const roles: string[] = route.data?.['roles'] ?? ['ADMIN'];

  if (usuario && roles.includes(usuario.rol)) return true;

  router.navigate(['/dashboard']);
  return false;
};
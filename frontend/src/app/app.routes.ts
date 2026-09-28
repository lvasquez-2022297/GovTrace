import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login.component';
import { Register } from './pages/auth/register/register.component';
import { Dashboard } from './pages/dashboard/dashboard.component';
import { Usuarios } from './pages/usuarios/usuarios.component';
import { Proveedores } from './pages/proveedores/proveedores.component';
import { Licitaciones } from './pages/licitaciones/licitaciones.component';
import { Adjudicaciones } from './pages/adjudicaciones/adjudicaciones.component';
import { Alertas } from './pages/alertas/alertas.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'usuarios', component: Usuarios, canActivate: [authGuard] },
  { path: 'proveedores', component: Proveedores, canActivate: [authGuard] },
  { path: 'licitaciones', component: Licitaciones, canActivate: [authGuard] },
  { path: 'adjudicaciones', component: Adjudicaciones, canActivate: [authGuard] },
  { path: 'alertas', component: Alertas, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
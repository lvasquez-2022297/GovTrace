import { Router, Request, Response, NextFunction } from 'express';
import { UsuariosService } from '../services/UsuariosService';
import { ProveedoresService } from '../services/ProveedoresService';
import { LicitacionesService } from '../services/LicitacionesService';
import { AdjudicacionesService } from '../services/AdjudicacionesService';
import { AlertasService } from '../services/AlertasService';
import { verificarToken, requiereRol, propioOAdmin, AuthRequest } from '../middlewares/auth';
import { AppError } from '../utils/AppError';

const router = Router();

const usuariosService = new UsuariosService();
const proveedoresService = new ProveedoresService();
const licitacionesService = new LicitacionesService();
const adjudicacionesService = new AdjudicacionesService();
const alertasService = new AlertasService();

const soloAdmin = [verificarToken, requiereRol('ADMIN')];

type Handler = (req: Request, res: Response) => Promise<void>;
const ruta = (fn: Handler) => async (req: Request, res: Response, next: NextFunction) => {
  try { await fn(req, res); } catch (e) { next(e); }
};
const id = (req: Request) => Number(req.params.id);

router.post('/auth/register', ruta(async (req, res) => {
  res.status(201).json({ success: true, data: await usuariosService.registrarUsuario(req.body) });
}));
router.post('/auth/login', ruta(async (req, res) => {
  res.json({ success: true, data: await usuariosService.login(req.body) });
}));

router.get('/usuarios', verificarToken, requiereRol('ADMIN', 'AUDITOR'), ruta(async (req, res) => {
  res.json({ success: true, data: await usuariosService.listarUsuarios() });
}));
router.get('/usuarios/:id', verificarToken, propioOAdmin, ruta(async (req, res) => {
  res.json({ success: true, data: await usuariosService.obtenerUsuarioPorId(id(req)) });
}));
router.post('/usuarios', ...soloAdmin, ruta(async (req, res) => {
  res.status(201).json({ success: true, data: await usuariosService.crearUsuarioAdmin(req.body) });
}));
router.put('/usuarios/:id', verificarToken, propioOAdmin, ruta(async (req, res) => {
  res.json({ success: true, data: await usuariosService.actualizarUsuario(id(req), req.body) });
}));
router.put('/usuarios/:id/rol', ...soloAdmin, ruta(async (req, res) => {
  if ((req as AuthRequest).usuario?.id === id(req)) {
    throw new AppError('No puedes cambiar tu propio rol.', 400);
  }
  res.json({ success: true, data: await usuariosService.cambiarRol(id(req), req.body.rol) });
}));
router.delete('/usuarios/:id', ...soloAdmin, ruta(async (req, res) => {
  if ((req as AuthRequest).usuario?.id === id(req)) {
    throw new AppError('No puedes eliminar tu propia cuenta.', 400);
  }
  await usuariosService.eliminarUsuario(id(req));
  res.json({ success: true, message: 'Usuario eliminado' });
}));

router.get('/proveedores', ruta(async (req, res) => {
  res.json({ success: true, data: await proveedoresService.listarProveedores() });
}));
router.get('/proveedores/:id', ruta(async (req, res) => {
  res.json({ success: true, data: await proveedoresService.obtenerProveedorPorId(id(req)) });
}));
router.post('/proveedores', ...soloAdmin, ruta(async (req, res) => {
  res.status(201).json({ success: true, data: await proveedoresService.registrarProveedor(req.body) });
}));
router.put('/proveedores/:id', ...soloAdmin, ruta(async (req, res) => {
  res.json({ success: true, data: await proveedoresService.actualizarProveedor(id(req), req.body) });
}));
router.delete('/proveedores/:id', ...soloAdmin, ruta(async (req, res) => {
  await proveedoresService.eliminarProveedor(id(req));
  res.json({ success: true, message: 'Proveedor eliminado' });
}));

router.get('/licitaciones', ruta(async (req, res) => {
  res.json({ success: true, data: await licitacionesService.listarLicitaciones() });
}));
router.get('/licitaciones/:id', ruta(async (req, res) => {
  res.json({ success: true, data: await licitacionesService.obtenerLicitacionPorId(id(req)) });
}));
router.post('/licitaciones', ...soloAdmin, ruta(async (req, res) => {
  const datos = { ...req.body, creado_por: (req as AuthRequest).usuario?.id };
  res.status(201).json({ success: true, data: await licitacionesService.crearLicitacion(datos) });
}));

router.put('/licitaciones/:id', ...soloAdmin, ruta(async (req, res) => {
  res.json({ success: true, data: await licitacionesService.actualizarLicitacion(id(req), req.body) });
}));

router.patch('/licitaciones/:id/estado', verificarToken, requiereRol('ADMIN', 'AUDITOR'), ruta(async (req, res) => {
  const nuevoEstado = String(req.body?.estado ?? '').trim();
  res.json({ success: true, data: await licitacionesService.cambiarEstado(id(req), nuevoEstado) });
}));

router.delete('/licitaciones/:id', ...soloAdmin, ruta(async (req, res) => {
  await licitacionesService.eliminarLicitacion(id(req));
  res.json({ success: true, message: 'Licitación eliminada' });
}));

router.get('/adjudicaciones', ruta(async (req, res) => {
  res.json({ success: true, data: await adjudicacionesService.listarAdjudicaciones() });
}));
router.get('/adjudicaciones/:id', ruta(async (req, res) => {
  res.json({ success: true, data: await adjudicacionesService.obtenerAdjudicacionPorId(id(req)) });
}));
router.post('/adjudicaciones', ...soloAdmin, ruta(async (req, res) => {
  res.status(201).json({ success: true, data: await adjudicacionesService.adjudicarLicitacion(req.body) });
}));
router.put('/adjudicaciones/:id', ...soloAdmin, ruta(async (req, res) => {
  res.json({ success: true, data: await adjudicacionesService.actualizarAdjudicacion(id(req), req.body) });
}));
router.delete('/adjudicaciones/:id', ...soloAdmin, ruta(async (req, res) => {
  await adjudicacionesService.eliminarAdjudicacion(id(req));
  res.json({ success: true, message: 'Adjudicación eliminada' });
}));

router.get('/alertas', ruta(async (req, res) => {
  res.json({ success: true, data: await alertasService.listarAlertas() });
}));
router.post('/alertas', ...soloAdmin, ruta(async (req, res) => {
  res.status(201).json({ success: true, data: await alertasService.registrarAlerta(req.body) });
}));
router.put('/alertas/:id', verificarToken, requiereRol('ADMIN', 'AUDITOR'), ruta(async (req, res) => {
  const rol = (req as AuthRequest).usuario!.rol;
  res.json({ success: true, data: await alertasService.actualizarAlerta(id(req), req.body, rol) });
}));
router.delete('/alertas/:id', ...soloAdmin, ruta(async (req, res) => {
  await alertasService.eliminarAlerta(id(req));
  res.json({ success: true, message: 'Alerta eliminada' });
}));

export default router;
import { Router, Request, Response, NextFunction } from 'express';
import { UsuariosService } from '../services/UsuariosService';
import { ProveedoresService } from '../services/ProveedoresService';
import { LicitacionesService } from '../services/LicitacionesService';
import { AdjudicacionesService } from '../services/AdjudicacionesService';
import { AlertasService } from '../services/AlertasService';
import { verificarToken } from '../middlewares/auth';

const router = Router();

const usuariosService = new UsuariosService();
const proveedoresService = new ProveedoresService();
const licitacionesService = new LicitacionesService();
const adjudicacionesService = new AdjudicacionesService();
const alertasService = new AlertasService();

router.get('/usuarios', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await usuariosService.listarUsuarios() }); } catch (e) { next(e); }
});
router.get('/usuarios/:id', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await usuariosService.obtenerUsuarioPorId(Number(req.params.id)) }); } catch (e) { next(e); }
});
router.post('/usuarios', async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json({ success: true, data: await usuariosService.registrarUsuario(req.body) }); } catch (e) { next(e); }
});
router.put('/usuarios/:id', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await usuariosService.actualizarUsuario(Number(req.params.id), req.body) }); } catch (e) { next(e); }
});
router.delete('/usuarios/:id', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { await usuariosService.eliminarUsuario(Number(req.params.id)); res.json({ success: true, message: 'Usuario eliminado' }); } catch (e) { next(e); }
});

router.get('/proveedores', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await proveedoresService.listarProveedores() }); } catch (e) { next(e); }
});
router.get('/proveedores/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await proveedoresService.obtenerProveedorPorId(Number(req.params.id)) }); } catch (e) { next(e); }
});
router.post('/proveedores', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json({ success: true, data: await proveedoresService.registrarProveedor(req.body) }); } catch (e) { next(e); }
});
router.put('/proveedores/:id', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await proveedoresService.actualizarProveedor(Number(req.params.id), req.body) }); } catch (e) { next(e); }
});
router.delete('/proveedores/:id', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { await proveedoresService.eliminarProveedor(Number(req.params.id)); res.json({ success: true, message: 'Proveedor eliminado' }); } catch (e) { next(e); }
});

router.get('/licitaciones', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await licitacionesService.listarLicitaciones() }); } catch (e) { next(e); }
});
router.get('/licitaciones/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await licitacionesService.obtenerLicitacionPorId(Number(req.params.id)) }); } catch (e) { next(e); }
});
router.post('/licitaciones', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json({ success: true, data: await licitacionesService.crearLicitacion(req.body) }); } catch (e) { next(e); }
});
router.put('/licitaciones/:id', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await licitacionesService.actualizarLicitacion(Number(req.params.id), req.body) }); } catch (e) { next(e); }
});
router.delete('/licitaciones/:id', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { await licitacionesService.eliminarLicitacion(Number(req.params.id)); res.json({ success: true, message: 'Licitación eliminada' }); } catch (e) { next(e); }
});

router.get('/adjudicaciones', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await adjudicacionesService.listarAdjudicaciones() }); } catch (e) { next(e); }
});
router.get('/adjudicaciones/:id', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await adjudicacionesService.obtenerAdjudicacionPorId(Number(req.params.id)) }); } catch (e) { next(e); }
});
router.post('/adjudicaciones', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json({ success: true, data: await adjudicacionesService.adjudicarLicitacion(req.body) }); } catch (e) { next(e); }
});

router.get('/alertas', async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ success: true, data: await alertasService.listarAlertas() }); } catch (e) { next(e); }
});
router.post('/alertas', verificarToken, async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json({ success: true, data: await alertasService.registrarAlerta(req.body) }); } catch (e) { next(e); }
});

export default router;